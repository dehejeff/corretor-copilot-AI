import OpenAI from "openai";
import type { Lead, MessageOption, MessageType, Profile } from "@/lib/types";
import { env } from "@/lib/env";
import { buildMessageOptions } from "@/lib/message-templates";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.openAIApiKey(),
    });
  }

  return openaiClient;
}

function buildFallbackPayload(options: MessageOption[], reason: string) {
  return {
    message: options[0]?.message || "",
    options,
    provider: "fallback" as const,
    fallbackReason: reason,
  };
}

export async function generateLeadMessage(
  lead: Lead,
  profile: Profile,
  messageType: MessageType,
) {
  const fallbackOptions = buildMessageOptions(lead, profile, messageType);

  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackPayload(fallbackOptions, "missing_api_key");
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
      message: message || fallbackOptions[0]?.message || "",
      options: fallbackOptions,
      provider: message ? ("openai" as const) : ("fallback" as const),
      fallbackReason: message ? null : "empty_response",
    };
  } catch (error) {
    console.error("OpenAI generation failed, using fallback message.", error);

    return buildFallbackPayload(fallbackOptions, "provider_error");
  }
}
