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
  "Retornar contato",
  "Respondeu",
  "Qualificado",
  "Visita agendada",
  "Coletar documentação",
  "Documentação em análise",
  "Análise aprovada",
  "Análise condicionada",
  "Análise reprovada",
  "Fechado",
  "Perdido",
  "Nutrição",
] as const;

export const kanbanStatuses = [
  "Novo lead",
  "Primeiro contato enviado",
  "Retornar contato",
  "Qualificado",
  "Visita agendada",
  "Coletar documentação",
  "Documentação em análise",
  "Análise aprovada",
  "Análise condicionada",
  "Análise reprovada",
  "Fechado",
  "Perdido",
] as const;

export const leadTemperatures = ["Quente", "Morno", "Frio"] as const;

export const visitTypes = ["Escritório", "Empreendimento"] as const;

export const visitTypeLabels = {
  Escritório: "Visita ao escritório",
  Empreendimento: "Visita ao empreendimento",
} as const;

export const analysisEligibilityOptions = ["Apto", "Nao apto", "Condicionado"] as const;

export const analysisEligibilityLabels = {
  Apto: "Apto",
  "Nao apto": "Não apto",
  Condicionado: "Condicionado",
} as const;

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
  "cobrar_documentacao",
  "documentacao_pronta_analise",
  "analise_condicionada",
  "analise_aprovada",
  "analise_reprovada",
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
  cobrar_documentacao: "Cobrança de documentação",
  documentacao_pronta_analise: "Pasta pronta para análise",
  analise_condicionada: "Análise condicionada",
  analise_aprovada: "Análise aprovada",
  analise_reprovada: "Análise reprovada",
  fechamento: "Fechamento",
} as const;
