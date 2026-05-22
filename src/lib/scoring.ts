import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { getDocumentationChecklistSummary } from "@/lib/documentation";
import type { Lead, LeadTemperature } from "@/lib/types";

export function calculateLeadScore(input: Partial<Lead>) {
  let score = 0;

  if (input.down_payment && input.down_payment > 0) score += 20;

  if (input.purchase_timeline) {
    const parsedDate = parseISO(input.purchase_timeline);

    if (isValid(parsedDate)) {
      const daysUntilPurchase = differenceInCalendarDays(parsedDate, new Date());
      if (daysUntilPurchase >= 0 && daysUntilPurchase <= 30) {
        score += 30;
      }
    } else {
      const timeline = input.purchase_timeline.toLowerCase();
      if (timeline.includes("30") || timeline.includes("1 mês") || timeline.includes("imediat")) {
        score += 30;
      }
    }
  }

  if (input.financing_interest) score += 15;
  if (input.credit_approved) score += 40;
  if (input.requested_visit) score += 35;
  if (input.neighborhood) score += 10;
  if (input.price_range) score += 10;
  if (input.researching_only) score -= 20;
  if ((input.contact_attempts ?? 0) >= 3 && !input.last_inbound_at) score -= 30;

  const normalized = Math.max(0, Math.min(100, score));

  return {
    score: normalized,
    temperature: getLeadTemperature(normalized),
  };
}

export function getLeadTemperature(score: number): LeadTemperature {
  if (score >= 80) return "Quente";
  if (score >= 50) return "Morno";
  return "Frio";
}

export function getRecommendedNextAction(lead: Partial<Lead>) {
  const documentationSummary = getDocumentationChecklistSummary(lead.documentation_checklist);

  if (lead.status === "Visita agendada") {
    return "Confirme os detalhes da visita e envie um lembrete no WhatsApp.";
  }

  if (lead.status === "Coletar documentação") {
    if (documentationSummary.pending > 0) {
      return `Solicite os ${documentationSummary.pending} documento(s) pendente(s) e deixe a pasta pronta para subir na imobiliária.`;
    }

    return "Solicite os documentos pendentes e organize a pasta do cliente para subir na imobiliária.";
  }

  if (lead.status === "Documentação em análise") {
    return "Acompanhe o retorno da imobiliária para entender se o cliente está apto e qual faixa de financiamento foi liberada.";
  }

  if (lead.status === "Análise condicionada") {
    if (documentationSummary.pending > 0) {
      return `A imobiliária voltou com condicionantes. Reforce com o cliente as ${documentationSummary.pending} pendência(s) e complemente a pasta para nova validação.`;
    }

    return "Explique as condicionantes, colete os complementos e reenvie a pasta para nova validação.";
  }

  if (lead.status === "Análise aprovada") {
    return "Comunique que o cliente está apto, explique a faixa de financiamento aprovada e avance com os próximos passos.";
  }

  if (lead.status === "Análise reprovada") {
    return "Explique com cuidado que o cliente não foi considerado apto neste momento, registre o motivo e avalie alternativas.";
  }

  if (lead.temperature === "Quente") {
    return "Priorize um contato consultivo agora e conduza para visita ou proposta.";
  }

  if (lead.temperature === "Morno") {
    return "Trabalhe objeções, envie prova social e avance para qualificação.";
  }

  return "Nutra com contexto do bairro, financiamento e oportunidades aderentes.";
}
