import { addDays, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  getDocumentationChecklistSummary,
  isDocumentationReadyForAnalysis,
  normalizeDocumentationChecklist,
} from "@/lib/documentation";
import { calculateLeadScore, getRecommendedNextAction } from "@/lib/scoring";
import type { Interaction, Lead, LeadStatus, Task, VisitType } from "@/lib/types";
import { leadStatuses } from "@/lib/constants";

type DashboardStats = {
  total: number;
  newLeads: number;
  hot: number;
  warm: number;
  cold: number;
  stale: number;
  visits: number;
  negotiation: number;
  closed: number;
};

type DashboardPriorityLead = {
  lead: Lead;
  helper: string;
};

export type DashboardPriorities = {
  returnToday: DashboardPriorityLead[];
  readyForAnalysis: DashboardPriorityLead[];
  conditionedAnalysis: DashboardPriorityLead[];
  visitsToday: DashboardPriorityLead[];
};

export type LeadWorkflowUpdateResult = {
  lead: Lead;
  workflowNotice: string | null;
};

const documentationPipelineStatuses = new Set<LeadStatus>([
  "Coletar documentação",
  "Documentação em análise",
]);

const analysisStatusMap: Record<string, LeadStatus> = {
  Apto: "Análise aprovada",
  Condicionado: "Análise condicionada",
  "Nao apto": "Análise reprovada",
};

function buildWorkflowNotice(
  status: LeadStatus,
  reason: "visit" | "documentation_ready" | "documentation_pending" | "analysis",
) {
  if (reason === "visit") {
    return `O sistema moveu o lead automaticamente para "${status}" porque a visita já foi registrada.`;
  }

  if (reason === "documentation_ready") {
    return `O sistema moveu o lead automaticamente para "${status}" porque a pasta ficou pronta para subir na imobiliária.`;
  }

  if (reason === "documentation_pending") {
    return `O sistema moveu o lead automaticamente para "${status}" porque ainda existem documentos pendentes no checklist.`;
  }

  return `O sistema moveu o lead automaticamente para "${status}" com base no retorno da análise da imobiliária.`;
}

function toNullableIsoString(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function synchronizeLeadWorkflow(values: Partial<Lead>, currentLead?: Partial<Lead>) {
  const merged = {
    ...currentLead,
    ...values,
  };

  let nextStatus = (merged.status as LeadStatus | undefined) ?? "Novo lead";
  const updates: Partial<Lead> = {};
  let workflowReason: "visit" | "documentation_ready" | "documentation_pending" | "analysis" | null = null;

  const analysisStatus =
    merged.analysis_eligibility && analysisStatusMap[String(merged.analysis_eligibility)];

  if (analysisStatus) {
    nextStatus = analysisStatus;
    workflowReason = "analysis";

    if (!merged.analysis_returned_at) {
      updates.analysis_returned_at = new Date().toISOString();
    }
  } else {
    const touchedVisitFields =
      values.visit_date !== undefined || values.visit_type !== undefined;
    const hasVisitInfo = Boolean(merged.visit_date || merged.visit_type);

    if (
      hasVisitInfo &&
      touchedVisitFields &&
      (values.status === undefined || values.status === "Visita agendada")
    ) {
      nextStatus = "Visita agendada";
      workflowReason = "visit";
    }

    if (documentationPipelineStatuses.has(nextStatus)) {
      const readyForAnalysis = isDocumentationReadyForAnalysis(merged.documentation_checklist);
      nextStatus = readyForAnalysis ? "Documentação em análise" : "Coletar documentação";
      workflowReason = readyForAnalysis ? "documentation_ready" : "documentation_pending";
    }
  }

  if (nextStatus === "Visita agendada" && !merged.requested_visit) {
    updates.requested_visit = true;
  }

  updates.status = nextStatus;
  const previousStatus = currentLead?.status as LeadStatus | undefined;
  const requestedStatus = values.status as LeadStatus | undefined;
  const movedAutomatically =
    requestedStatus !== undefined
      ? requestedStatus !== nextStatus
      : previousStatus !== undefined && previousStatus !== nextStatus;

  return {
    values: {
      ...values,
      ...updates,
    },
    workflowNotice:
      movedAutomatically && workflowReason ? buildWorkflowNotice(nextStatus, workflowReason) : null,
  };
}

function buildLeadPayload(userId: string, values: Partial<Lead>, mode: "create" | "update") {
  const scoring = calculateLeadScore(values);
  const payload = {
    user_id: userId,
    name: values.name,
    phone: values.phone || null,
    email: values.email || null,
    source: values.source || "Manual",
    neighborhood: values.neighborhood || null,
    property_type: values.property_type || null,
    price_range: values.price_range || null,
    down_payment: values.down_payment || null,
    income_range: values.income_range || null,
    financing_interest: values.financing_interest ?? false,
    credit_approved: values.credit_approved ?? false,
    fgts: values.fgts ?? false,
    purchase_timeline: values.purchase_timeline || null,
    requested_visit: values.requested_visit ?? false,
    visit_date: toNullableIsoString(values.visit_date),
    visit_type: values.visit_type || null,
    analysis_returned_at: toNullableIsoString(values.analysis_returned_at),
    analysis_eligibility: values.analysis_eligibility || null,
    approved_financing_amount: values.approved_financing_amount ?? null,
    analysis_notes: values.analysis_notes || null,
    researching_only: values.researching_only ?? false,
    contact_attempts: values.contact_attempts ?? 0,
    notes: values.notes || null,
    status: values.status || "Novo lead",
    incomplete_data: values.incomplete_data ?? false,
    last_contact_at: values.last_contact_at || null,
    last_inbound_at: values.last_inbound_at || null,
    next_followup_at:
      mode === "create"
        ? toNullableIsoString(values.next_followup_at) || addDays(new Date(), 1).toISOString()
        : toNullableIsoString(values.next_followup_at),
    score: scoring.score,
    temperature: scoring.temperature,
  };

  if (mode === "create") {
    return {
      ...payload,
      documentation_checklist: normalizeDocumentationChecklist(values.documentation_checklist),
    };
  }

  if (values.documentation_checklist !== undefined) {
    return {
      ...payload,
      documentation_checklist: normalizeDocumentationChecklist(values.documentation_checklist),
    };
  }

  return payload;
}

export async function createLead(userId: string, values: Partial<Lead>) {
  const supabase = await createClient();
  const synchronizedValues = synchronizeLeadWorkflow(values);
  const payload = buildLeadPayload(userId, synchronizedValues.values, "create");

  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível criar o lead: ${error.message}`);
  }

  return data as Lead;
}

export async function updateLead(
  userId: string,
  leadId: string,
  values: Partial<Lead>,
): Promise<LeadWorkflowUpdateResult> {
  const supabase = await createClient();
  const { data: currentLead, error: currentLeadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", userId)
    .single();

  if (currentLeadError) {
    throw new Error(`Não foi possível carregar o lead para atualização: ${currentLeadError.message}`);
  }

  const synchronizedValues = synchronizeLeadWorkflow(values, currentLead as Lead);
  const payload = buildLeadPayload(userId, synchronizedValues.values, "update");

  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível atualizar o lead: ${error.message}`);
  }

  return {
    lead: data as Lead,
    workflowNotice: synchronizedValues.workflowNotice,
  };
}

export async function getLeads(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível listar leads: ${error.message}`);
  }

  return (data ?? []) as Lead[];
}

export async function getLeadById(userId: string, leadId: string) {
  const supabase = await createClient();

  const [{ data: lead, error: leadError }, { data: interactions, error: interactionsError }] =
    await Promise.all([
      supabase.from("leads").select("*").eq("id", leadId).eq("user_id", userId).single(),
      supabase
        .from("interactions")
        .select("*")
        .eq("lead_id", leadId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  if (leadError) {
    throw new Error(`Não foi possível carregar o lead: ${leadError.message}`);
  }

  if (interactionsError) {
    throw new Error(`Não foi possível carregar interações: ${interactionsError.message}`);
  }

  return {
    lead: lead as Lead,
    interactions: (interactions ?? []) as Interaction[],
    nextAction: getRecommendedNextAction(lead as Lead),
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const leads = await getLeads(userId);

  return {
    total: leads.length,
    newLeads: leads.filter((lead) => lead.status === "Novo lead").length,
    hot: leads.filter((lead) => lead.temperature === "Quente").length,
    warm: leads.filter((lead) => lead.temperature === "Morno").length,
    cold: leads.filter((lead) => lead.temperature === "Frio").length,
    stale: leads.filter((lead) => {
      if (!lead.last_contact_at) return true;
      return new Date(lead.last_contact_at) < addDays(new Date(), -3);
    }).length,
    visits: leads.filter((lead) => lead.status === "Visita agendada").length,
    negotiation: leads.filter((lead) =>
      ["Coletar documentação", "Documentação em análise", "Análise condicionada"].includes(lead.status),
    ).length,
    closed: leads.filter((lead) => lead.status === "Fechado").length,
  };
}

export async function getDashboardPriorities(userId: string): Promise<DashboardPriorities> {
  const leads = await getLeads(userId);
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);

  return {
    returnToday: leads
      .filter((lead) => {
        if (!lead.next_followup_at) return false;
        const followup = new Date(lead.next_followup_at);
        return followup >= todayStart && followup < tomorrowStart;
      })
      .sort((a, b) => new Date(a.next_followup_at!).getTime() - new Date(b.next_followup_at!).getTime())
      .slice(0, 5)
      .map((lead) => ({
        lead,
        helper: lead.next_followup_at || "",
      })),
    readyForAnalysis: leads
      .filter(
        (lead) =>
          lead.status === "Coletar documentação" &&
          isDocumentationReadyForAnalysis(lead.documentation_checklist),
      )
      .slice(0, 5)
      .map((lead) => ({
        lead,
        helper: "Pasta pronta para subir na imobiliária",
      })),
    conditionedAnalysis: leads
      .filter((lead) => lead.status === "Análise condicionada")
      .slice(0, 5)
      .map((lead) => {
        const summary = getDocumentationChecklistSummary(lead.documentation_checklist);
        return {
          lead,
          helper:
            summary.pending > 0
              ? `${summary.pending} pendência(s) para complementar`
              : "Análise condicionada aguardando tratativa",
        };
      }),
    visitsToday: leads
      .filter((lead) => {
        if (lead.status !== "Visita agendada" || !lead.visit_date) return false;
        const visit = new Date(lead.visit_date);
        return visit >= todayStart && visit < tomorrowStart;
      })
      .sort((a, b) => new Date(a.visit_date!).getTime() - new Date(b.visit_date!).getTime())
      .slice(0, 5)
      .map((lead) => ({
        lead,
        helper: lead.visit_date || "",
      })),
  };
}

export async function getTasksForToday(userId: string) {
  const supabase = await createClient();
  const endOfDay = addDays(startOfDay(new Date()), 1).toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .select("*, lead:leads(*)")
    .eq("user_id", userId)
    .eq("status", "open")
    .lt("due_date", endOfDay)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Não foi possível carregar tarefas: ${error.message}`);
  }

  return (data ?? []) as Task[];
}

export async function markTaskAsDone(userId: string, taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Não foi possível concluir a tarefa: ${error.message}`);
  }
}

export async function updateLeadStatus(
  userId: string,
  leadId: string,
  status: LeadStatus,
  visitType?: VisitType | "",
): Promise<LeadWorkflowUpdateResult> {
  if (!leadStatuses.includes(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();
  const { data: currentLead, error: currentLeadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", userId)
    .single();

  if (currentLeadError) {
    throw new Error(`Não foi possível carregar o lead para atualizar o status: ${currentLeadError.message}`);
  }

  const synchronizedValues = synchronizeLeadWorkflow(
    {
      status,
      visit_type: status === "Visita agendada" ? visitType || null : null,
    },
    currentLead as Lead,
  );

  const payload: {
    status: LeadStatus;
    updated_at: string;
    visit_type?: VisitType | null;
    requested_visit?: boolean;
  } = {
    status: synchronizedValues.values.status as LeadStatus,
    updated_at: new Date().toISOString(),
  };

  if (status === "Visita agendada") {
    payload.visit_type = synchronizedValues.values.visit_type as VisitType | null;
  } else if (visitType !== undefined) {
    payload.visit_type = null;
  }

  if (synchronizedValues.values.requested_visit !== undefined) {
    payload.requested_visit = synchronizedValues.values.requested_visit;
  }

  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível atualizar o status: ${error.message}`);
  }

  return {
    lead: data as Lead,
    workflowNotice: synchronizedValues.workflowNotice,
  };
}

export async function updateDocumentationChecklist(
  userId: string,
  leadId: string,
  documentationChecklist: Lead["documentation_checklist"],
): Promise<LeadWorkflowUpdateResult> {
  const supabase = await createClient();
  const { data: currentLead, error: currentLeadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", userId)
    .single();

  if (currentLeadError) {
    throw new Error(`Não foi possível carregar o lead para atualizar o checklist: ${currentLeadError.message}`);
  }

  const normalizedChecklist = normalizeDocumentationChecklist(documentationChecklist);
  const synchronizedValues = synchronizeLeadWorkflow(
    {
      documentation_checklist: normalizedChecklist,
    },
    currentLead as Lead,
  );

  const { data, error } = await supabase
    .from("leads")
    .update({
      documentation_checklist: normalizedChecklist,
      status: synchronizedValues.values.status as LeadStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível atualizar o checklist de documentação: ${error.message}`);
  }

  return {
    lead: data as Lead,
    workflowNotice: synchronizedValues.workflowNotice,
  };
}

export async function recordInteraction(input: {
  userId: string;
  leadId: string;
  type: string;
  channel?: string;
  message: string;
  status: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("interactions").insert({
    lead_id: input.leadId,
    user_id: input.userId,
    type: input.type,
    channel: input.channel ?? "whatsapp",
    message: input.message,
    status: input.status,
  });

  if (error) {
    throw new Error(`Não foi possível registrar a interação: ${error.message}`);
  }
}

export function buildImportLead(row: Record<string, unknown>) {
  const normalize = (key: string) => {
    const value = row[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const hasMissingExpectedFields =
    !normalize("nome") ||
    !normalize("telefone") ||
    !normalize("email") ||
    !normalize("origem") ||
    !normalize("bairro") ||
    !normalize("tipo_imovel") ||
    !normalize("faixa_preco");

  return {
    name: normalize("nome") || "Lead sem nome",
    phone: normalize("telefone"),
    email: normalize("email"),
    source: normalize("origem") || "Excel",
    neighborhood: normalize("bairro"),
    property_type: normalize("tipo_imovel"),
    price_range: normalize("faixa_preco"),
    notes: normalize("observacoes"),
    incomplete_data: hasMissingExpectedFields,
  };
}
