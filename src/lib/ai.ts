import OpenAI from "openai";
import type { Lead, MessageType } from "@/lib/types";
import { env } from "@/lib/env";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.openAIApiKey(),
    });
  }

  return openaiClient;
}

function buildFallbackMessage(lead: Lead, type: MessageType) {
  const firstName = lead.name.split(" ")[0];

  const templates: Record<MessageType, string> = {
    primeiro_contato: `Oi, ${firstName}! Vi seu interesse em imóvel${lead.neighborhood ? ` no ${lead.neighborhood}` : ""} e posso te ajudar a encontrar opções alinhadas ao seu momento. Quer que eu te mande uma seleção objetiva?`,
    followup_d1: `Oi, ${firstName}! Passando para retomar nosso contato e entender se ainda faz sentido avancarmos nas opcoes do seu perfil.`,
    followup_d3: `Oi, ${firstName}! Separei algumas possibilidades que podem encaixar no que você procura. Se quiser, te mando um resumo rápido aqui.`,
    followup_d7: `Oi, ${firstName}! Retomando nossa conversa porque surgiram alternativas interessantes e posso te atualizar em poucos minutos.`,
    recuperacao_lead_frio: `Oi, ${firstName}! Sei que o timing pode mudar. Se ainda fizer sentido, posso te mostrar caminhos mais seguros para comprar bem.`,
    convite_visita: `Oi, ${firstName}! Tenho uma opção que vale visita. Se fizer sentido para você, alinhamos um horário e eu te explico os detalhes.`,
    objecao_preco: `Entendo seu ponto, ${firstName}. Posso te mostrar opções de negociação e condições que deixem a compra mais confortável.`,
    vou_pensar: `Perfeito, ${firstName}. Enquanto você avalia, posso te deixar um comparativo simples para facilitar sua decisão sem pressão.`,
    simulacao_financiamento: `Oi, ${firstName}! Posso te ajudar com uma simulação inicial de financiamento e te orientar sobre entrada, renda e FGTS.`,
    pos_visita: `Oi, ${firstName}! Gostei da nossa visita e queria ouvir sua percepção. Posso te ajudar a comparar essa opção com outras possibilidades.`,
    fechamento: `Oi, ${firstName}! Estamos perto de concluir com segurança. Se quiser, organizo os próximos passos para deixar tudo mais simples.`,
  };

  return templates[type];
}

export async function generateLeadMessage(lead: Lead, messageType: MessageType) {
  const fallbackMessage = buildFallbackMessage(lead, messageType);

  if (!process.env.OPENAI_API_KEY) {
    return {
      message: fallbackMessage,
      provider: "fallback" as const,
      fallbackReason: "missing_api_key",
    };
  }

  const prompt = `
Você é um corretor imobiliário consultivo no Brasil.
Gere uma mensagem curta de WhatsApp, em português do Brasil, com tom profissional, próximo, humanizado e vendedor.
Não use cara de robô, não use markdown, não use listas.

Tipo da mensagem: ${messageType}
Nome do lead: ${lead.name}
Bairro: ${lead.neighborhood ?? "não informado"}
Tipo de imóvel: ${lead.property_type ?? "não informado"}
Faixa de preço: ${lead.price_range ?? "não informado"}
Entrada: ${lead.down_payment ?? "não informada"}
Renda: ${lead.income_range ?? "não informada"}
Financiamento: ${lead.financing_interest ? "sim" : "não"}
FGTS: ${lead.fgts ? "sim" : "não"}
Prazo de compra: ${lead.purchase_timeline ?? "não informado"}
Status atual: ${lead.status}
Temperatura: ${lead.temperature}
Observações: ${lead.notes ?? "sem observações"}
`.trim();

  try {
    const response = await getOpenAIClient().responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const message = response.output_text.trim();

    return {
      message: message || fallbackMessage,
      provider: message ? ("openai" as const) : ("fallback" as const),
      fallbackReason: message ? null : "empty_response",
    };
  } catch (error) {
    console.error("OpenAI generation failed, using fallback message.", error);

    return {
      message: fallbackMessage,
      provider: "fallback" as const,
      fallbackReason: "provider_error",
    };
  }
}
