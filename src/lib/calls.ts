import { createClient } from "@/lib/supabase/server";
import { getCallStatusFromResult, getCallSuggestionFallback, type CallStepId } from "@/lib/call-guide-content";
import { parseCurrencyInput } from "@/lib/utils";
import { calculateLeadScore } from "@/lib/scoring";
import type { Lead, Profile } from "@/lib/types";

export async function saveLeadCall(params: {
  userId: string;
  lead: Lead;
  payload: {
    callStartedAt: string;
    callNotes: string;
    selectedScripts: Record<string, string>;
    answeredQuestions: string[];
    selectedObjections: string[];
    nextAction: string;
    nextFollowupAt: string;
    callResult: string;
    summary: string;
    internalNotes: string;
    suggestedPhrase: string;
    updatedLeadFields: {
      property_type: string;
      neighborhood: string;
      bedrooms: string;
      price_range: string;
      down_payment: string;
      income_range: string;
      financing_interest: boolean;
      fgts: boolean;
      purchase_timeline: string;
      use_case: string;
      simulation_done: boolean;
      credit_approved: boolean;
      can_visit: boolean;
      visit_date: string;
      visit_type?: string;
      visit_best_slot: string;
      motivation: string;
      temperature?: string;
      status?: string;
    };
  };
}) {
  const supabase = await createClient();
  const { lead, payload, userId } = params;

  const mergedLead = {
    ...lead,
    property_type: payload.updatedLeadFields.property_type || lead.property_type,
    neighborhood: payload.updatedLeadFields.neighborhood || lead.neighborhood,
    price_range: payload.updatedLeadFields.price_range || lead.price_range,
    down_payment:
      parseCurrencyInput(payload.updatedLeadFields.down_payment) ?? lead.down_payment,
    income_range: payload.updatedLeadFields.income_range || lead.income_range,
    financing_interest: payload.updatedLeadFields.financing_interest,
    fgts: payload.updatedLeadFields.fgts,
    purchase_timeline: payload.updatedLeadFields.purchase_timeline || lead.purchase_timeline,
    credit_approved: payload.updatedLeadFields.credit_approved,
    requested_visit:
      payload.updatedLeadFields.can_visit || Boolean(payload.updatedLeadFields.visit_date),
    visit_date: payload.updatedLeadFields.visit_date || lead.visit_date,
    visit_type: payload.updatedLeadFields.visit_type || lead.visit_type,
    notes: [lead.notes, payload.callNotes, payload.internalNotes].filter(Boolean).join("\n\n"),
  };

  const scoring = calculateLeadScore(mergedLead);
  const nextStatus =
    (payload.updatedLeadFields.status as Lead["status"]) ||
    (getCallStatusFromResult(payload.callResult) as Lead["status"]);
  const nextTemperature =
    (payload.updatedLeadFields.temperature as Lead["temperature"]) || scoring.temperature;

  const { error: leadUpdateError } = await supabase
    .from("leads")
    .update({
      property_type: mergedLead.property_type,
      neighborhood: mergedLead.neighborhood,
      price_range: mergedLead.price_range,
      down_payment: mergedLead.down_payment,
      income_range: mergedLead.income_range,
      financing_interest: mergedLead.financing_interest,
      fgts: mergedLead.fgts,
      purchase_timeline: mergedLead.purchase_timeline,
      credit_approved: mergedLead.credit_approved,
      requested_visit: mergedLead.requested_visit,
      visit_date: mergedLead.visit_date ? new Date(mergedLead.visit_date).toISOString() : null,
      visit_type: mergedLead.visit_type,
      notes: mergedLead.notes,
      status: nextStatus,
      score: scoring.score,
      temperature: nextTemperature,
      last_contact_at: new Date().toISOString(),
      next_followup_at: payload.nextFollowupAt ? new Date(payload.nextFollowupAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id)
    .eq("user_id", userId);

  if (leadUpdateError) {
    throw new Error(`Não foi possível atualizar o lead após a ligação: ${leadUpdateError.message}`);
  }

  const metadata = {
    selectedScripts: payload.selectedScripts,
    answeredQuestions: payload.answeredQuestions,
    selectedObjections: payload.selectedObjections,
    callNotes: payload.callNotes,
    internalNotes: payload.internalNotes,
    suggestedPhrase: payload.suggestedPhrase,
    updatedLeadFields: payload.updatedLeadFields,
  };

  const { error: callNoteError } = await supabase.from("call_notes").insert({
    user_id: userId,
    lead_id: lead.id,
    call_started_at: payload.callStartedAt ? new Date(payload.callStartedAt).toISOString() : null,
    call_ended_at: new Date().toISOString(),
    call_result: payload.callResult,
    summary: payload.summary,
    objections: payload.selectedObjections,
    next_action: payload.nextAction || null,
    next_followup_at: payload.nextFollowupAt ? new Date(payload.nextFollowupAt).toISOString() : null,
    lead_temperature_after_call: String(nextTemperature),
    metadata,
  });

  if (callNoteError) {
    throw new Error(`Não foi possível salvar a nota da ligação: ${callNoteError.message}`);
  }

  const interactionMessage = [
    `Resultado da ligação: ${payload.callResult}`,
    payload.summary ? `Resumo: ${payload.summary}` : "",
    payload.nextAction ? `Próximo passo: ${payload.nextAction}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { error: interactionError } = await supabase.from("interactions").insert({
    lead_id: lead.id,
    user_id: userId,
    type: "call",
    channel: "phone",
    message: interactionMessage,
    status: "concluída",
  });

  if (interactionError) {
    throw new Error(`Não foi possível registrar a interação da ligação: ${interactionError.message}`);
  }

  if (payload.nextAction && payload.nextFollowupAt) {
    const { error: taskError } = await supabase.from("tasks").insert({
      lead_id: lead.id,
      user_id: userId,
      title: payload.nextAction,
      description: payload.summary || payload.callNotes || "Tarefa criada a partir do guia de ligação.",
      task_type: "call_followup",
      due_date: new Date(payload.nextFollowupAt).toISOString(),
      status: "open",
      suggested_message: payload.suggestedPhrase || null,
    });

    if (taskError) {
      throw new Error(`Não foi possível criar a tarefa futura: ${taskError.message}`);
    }
  }
}

export async function generateCallSuggestion(input: {
  lead: Lead;
  profile: Profile;
  currentStep: string;
  callNotes: string;
  objectionSelected: string;
  goal: string;
}) {
  return getCallSuggestionFallback(
    input.currentStep as CallStepId,
    input.goal,
    input.objectionSelected,
  );
}
