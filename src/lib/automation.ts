import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getRecommendedNextAction } from "@/lib/scoring";
import type { Lead } from "@/lib/types";

type AutomationDefinition = {
  type: string;
  title: string;
  description: (lead: Lead) => string;
  suggestedMessage: (lead: Lead) => string;
};

const definitions: Record<string, AutomationDefinition> = {
  followup_d1: {
    type: "followup_d1",
    title: "Follow-up D+1",
    description: (lead) => `Retomar contato com ${lead.name} apos 1 dia sem resposta.`,
    suggestedMessage: (lead) =>
      `Oi, ${lead.name.split(" ")[0]}! Passando para saber se faz sentido te mostrar algumas opcoes no bairro ${lead.neighborhood || "que voce busca"}.`,
  },
  followup_d3: {
    type: "followup_d3",
    title: "Follow-up D+3",
    description: (lead) => `Lead ${lead.temperature.toLowerCase()} sem resposta ha 3 dias.`,
    suggestedMessage: (lead) =>
      `Oi, ${lead.name.split(" ")[0]}! Separei alternativas alinhadas ao seu perfil e posso te mandar um resumo rapido por aqui.`,
  },
  followup_d7: {
    type: "followup_d7",
    title: "Follow-up D+7",
    description: (lead) => `Reativar lead ${lead.name} apos 7 dias.`,
    suggestedMessage: (lead) =>
      `Oi, ${lead.name.split(" ")[0]}! Algumas condicoes mudaram nos ultimos dias e talvez valha uma nova conversa para ver oportunidade.`,
  },
  hot_no_action: {
    type: "hot_no_action",
    title: "Lead quente sem ação",
    description: (lead) => `${lead.name} está quente e sem tratativa recente.`,
    suggestedMessage: (lead) =>
      `Oi, ${lead.name.split(" ")[0]}! Tenho uma sugestao bem aderente ao que voce procura e acho que vale te apresentar hoje.`,
  },
  warm_forgotten: {
    type: "warm_forgotten",
    title: "Lead morno esquecido",
    description: (lead) => `Reaquecer ${lead.name} com próximo passo consultivo.`,
    suggestedMessage: (lead) => getRecommendedNextAction(lead),
  },
  cold_nurture: {
    type: "cold_nurture",
    title: "Nutrição de lead frio",
    description: (lead) => `Nutrir ${lead.name} com conteudo e oportunidade.`,
    suggestedMessage: (lead) =>
      `Oi, ${lead.name.split(" ")[0]}! Posso te mandar uma leitura simples sobre financiamento, entrada e oportunidades no seu perfil.`,
  },
  visit_reminder: {
    type: "visit_reminder",
    title: "Lembrete de visita",
    description: (lead) => `Confirmar visita agendada com ${lead.name}.`,
    suggestedMessage: (lead) =>
      `Oi, ${lead.name.split(" ")[0]}! Confirmando nossa visita e me colocando à disposição para qualquer ajuste antes do horário combinado.`,
  },
};

function selectAutomationType(lead: Lead) {
  const referenceDate = lead.last_inbound_at || lead.last_contact_at || lead.created_at;
  const days = differenceInCalendarDays(startOfDay(new Date()), startOfDay(new Date(referenceDate)));

  if (lead.status === "Visita agendada") return "visit_reminder";
  if (lead.temperature === "Quente" && days >= 1) return "hot_no_action";
  if (days >= 7) return "followup_d7";
  if (days >= 3) return "followup_d3";
  if (days >= 1) return "followup_d1";
  if (lead.temperature === "Morno") return "warm_forgotten";
  return "cold_nurture";
}

export async function runFollowupCron() {
  const admin = getSupabaseAdmin();
  const now = new Date();

  const { data: leads, error } = await admin
    .from("leads")
    .select("*")
    .in("status", [
      "Novo lead",
      "Primeiro contato enviado",
      "Respondeu",
      "Qualificado",
      "Visita agendada",
      "Em negociação",
      "Nutrição",
    ]);

  if (error) {
    throw new Error(`Falha ao buscar leads elegiveis: ${error.message}`);
  }

  const createdTasks: string[] = [];

  for (const lead of (leads ?? []) as Lead[]) {
    const automationType = selectAutomationType(lead);
    const definition = definitions[automationType];

    const { data: existingTask } = await admin
      .from("tasks")
      .select("id")
      .eq("lead_id", lead.id)
      .eq("user_id", lead.user_id)
      .eq("task_type", automationType)
      .eq("status", "open")
      .gte("due_date", startOfDay(now).toISOString())
      .maybeSingle();

    if (existingTask) {
      await admin.from("automation_logs").insert({
        user_id: lead.user_id,
        lead_id: lead.id,
        automation_type: automationType,
        result: "duplicidade evitada",
      } as never);
      continue;
    }

    const { error: taskError } = await admin.from("tasks").insert({
      lead_id: lead.id,
      user_id: lead.user_id,
      title: definition.title,
      description: definition.description(lead),
      task_type: automationType,
      due_date: addDays(now, 0).toISOString(),
      status: "open",
      suggested_message: definition.suggestedMessage(lead),
    } as never);

    if (taskError) {
      await admin.from("automation_logs").insert({
        user_id: lead.user_id,
        lead_id: lead.id,
        automation_type: automationType,
        result: `erro ao criar tarefa: ${taskError.message}`,
      } as never);
      continue;
    }

    createdTasks.push(lead.id);

    await admin.from("automation_logs").insert({
      user_id: lead.user_id,
      lead_id: lead.id,
      automation_type: automationType,
      result: "tarefa criada",
    } as never);
  }

  return {
    processed: leads?.length ?? 0,
    created: createdTasks.length,
  };
}
