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
    primeiro_contato: `Oi, ${firstName}! Vi seu interesse em imovel${lead.neighborhood ? ` no ${lead.neighborhood}` : ""} e posso te ajudar a encontrar opcoes alinhadas ao seu momento. Quer que eu te mande uma selecao objetiva?`,
    followup_d1: `Oi, ${firstName}! Passando para retomar nosso contato e entender se ainda faz sentido avancarmos nas opcoes do seu perfil.`,
    followup_d3: `Oi, ${firstName}! Separei algumas possibilidades que podem encaixar no que voce procura. Se quiser, te mando um resumo rapido aqui.`,
    followup_d7: `Oi, ${firstName}! Retomando nossa conversa porque surgiram alternativas interessantes e posso te atualizar em poucos minutos.`,
    recuperacao_lead_frio: `Oi, ${firstName}! Sei que o timing pode mudar. Se ainda fizer sentido, posso te mostrar caminhos mais seguros para comprar bem.`,
    convite_visita: `Oi, ${firstName}! Tenho uma opcao que vale visita. Se fizer sentido para voce, alinhamos um horario e eu te explico os detalhes.`,
    objecao_preco: `Entendo seu ponto, ${firstName}. Posso te mostrar opcoes de negociacao e condicoes que deixem a compra mais confortavel.`,
    vou_pensar: `Perfeito, ${firstName}. Enquanto voce avalia, posso te deixar um comparativo simples para facilitar sua decisao sem pressao.`,
    simulacao_financiamento: `Oi, ${firstName}! Posso te ajudar com uma simulacao inicial de financiamento e te orientar sobre entrada, renda e FGTS.`,
    pos_visita: `Oi, ${firstName}! Gostei da nossa visita e queria ouvir sua percepcao. Posso te ajudar a comparar essa opcao com outras possibilidades.`,
    fechamento: `Oi, ${firstName}! Estamos perto de concluir com seguranca. Se quiser, organizo os proximos passos para deixar tudo mais simples.`,
  };

  return templates[type];
}

export async function generateLeadMessage(lead: Lead, messageType: MessageType) {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackMessage(lead, messageType);
  }

  const prompt = `
Voce e um corretor imobiliario consultivo no Brasil.
Gere uma mensagem curta de WhatsApp, em portugues do Brasil, com tom profissional, proximo, humanizado e vendedor.
Nao use cara de robo, nao use markdown, nao use listas.

Tipo da mensagem: ${messageType}
Nome do lead: ${lead.name}
Bairro: ${lead.neighborhood ?? "nao informado"}
Tipo de imovel: ${lead.property_type ?? "nao informado"}
Faixa de preco: ${lead.price_range ?? "nao informado"}
Entrada: ${lead.down_payment ?? "nao informada"}
Renda: ${lead.income_range ?? "nao informada"}
Financiamento: ${lead.financing_interest ? "sim" : "nao"}
FGTS: ${lead.fgts ? "sim" : "nao"}
Prazo de compra: ${lead.purchase_timeline ?? "nao informado"}
Status atual: ${lead.status}
Temperatura: ${lead.temperature}
Observacoes: ${lead.notes ?? "sem observacoes"}
`.trim();

  const response = await getOpenAIClient().responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const message = response.output_text.trim();
  return message || buildFallbackMessage(lead, messageType);
}
