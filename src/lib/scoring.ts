import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
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
  if (lead.status === "Visita agendada") {
    return "Confirme os detalhes da visita e envie um lembrete no WhatsApp.";
  }

  if (lead.status === "Coletar documentação") {
    return "Solicite os documentos pendentes e organize a pasta para envio à análise.";
  }

  if (lead.status === "Documentação em análise") {
    return "Acompanhe a análise de crédito e prepare o cliente para aprovado, condicionado ou reprovado.";
  }

  if (lead.status === "Análise condicionada") {
    return "Explique as pendências, colete os complementos e retorne a documentação para nova validação.";
  }

  if (lead.status === "Análise aprovada") {
    return "Comunique a aprovação e avance com os próximos passos comerciais e contratuais.";
  }

  if (lead.status === "Análise reprovada") {
    return "Reposicione o lead com cuidado, entenda alternativas e registre o motivo da reprovação.";
  }

  if (lead.temperature === "Quente") {
    return "Priorize um contato consultivo agora e conduza para visita ou proposta.";
  }

  if (lead.temperature === "Morno") {
    return "Trabalhe objeções, envie prova social e avance para qualificação.";
  }

  return "Nutra com contexto do bairro, financiamento e oportunidades aderentes.";
}
