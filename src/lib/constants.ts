export const APP_NAME = "Corretor Copilot AI";

export const leadSources = [
  "Excel",
  "Instagram",
  "Facebook",
  "OLX",
  "Zap Imóveis",
  "Viva Real",
  "Indicação",
  "Landing Page",
  "Manual",
  "Outro",
] as const;

export const leadStatuses = [
  "Novo lead",
  "Primeiro contato enviado",
  "Respondeu",
  "Qualificado",
  "Visita agendada",
  "Em negociação",
  "Proposta enviada",
  "Fechado",
  "Perdido",
  "Nutrição",
] as const;

export const kanbanStatuses = [
  "Novo lead",
  "Primeiro contato enviado",
  "Qualificado",
  "Visita agendada",
  "Em negociação",
  "Fechado",
  "Perdido",
] as const;

export const leadTemperatures = ["Quente", "Morno", "Frio"] as const;

export const messageTypes = [
  "primeiro_contato",
  "followup_d1",
  "followup_d3",
  "followup_d7",
  "recuperacao_lead_frio",
  "convite_visita",
  "objecao_preco",
  "vou_pensar",
  "simulacao_financiamento",
  "pos_visita",
  "fechamento",
] as const;

export const messageTypeLabels = {
  primeiro_contato: "Primeiro contato",
  followup_d1: "Follow-up D+1",
  followup_d3: "Follow-up D+3",
  followup_d7: "Follow-up D+7",
  recuperacao_lead_frio: "Recuperação de lead frio",
  convite_visita: "Convite para visita",
  objecao_preco: "Objeção de preço",
  vou_pensar: "Resposta para 'vou pensar'",
  simulacao_financiamento: "Simulação de financiamento",
  pos_visita: "Pós-visita",
  fechamento: "Fechamento",
} as const;
