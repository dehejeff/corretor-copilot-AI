import { addDays, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { calculateLeadScore, getRecommendedNextAction } from "@/lib/scoring";
import type { Interaction, Lead, LeadStatus, Task } from "@/lib/types";
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

function buildLeadPayload(userId: string, values: Partial<Lead>) {
  const scoring = calculateLeadScore(values);

  return {
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
    researching_only: values.researching_only ?? false,
    contact_attempts: values.contact_attempts ?? 0,
    notes: values.notes || null,
    status: values.status || "Novo lead",
    incomplete_data: values.incomplete_data ?? false,
    last_contact_at: values.last_contact_at || null,
    last_inbound_at: values.last_inbound_at || null,
    next_followup_at:
      values.next_followup_at || addDays(new Date(), 1).toISOString(),
    score: scoring.score,
    temperature: scoring.temperature,
  };
}

export async function createLead(userId: string, values: Partial<Lead>) {
  const supabase = await createClient();
  const payload = buildLeadPayload(userId, values);

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

export async function updateLead(userId: string, leadId: string, values: Partial<Lead>) {
  const supabase = await createClient();
  const payload = buildLeadPayload(userId, values);

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

  return data as Lead;
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
    negotiation: leads.filter((lead) => lead.status === "Em negociação").length,
    closed: leads.filter((lead) => lead.status === "Fechado").length,
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

export async function updateLeadStatus(userId: string, leadId: string, status: LeadStatus) {
  if (!leadStatuses.includes(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Não foi possível atualizar o status: ${error.message}`);
  }
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
