import { createHmac, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  Conversation,
  ConversationMessage,
  ConversationSuggestion,
  Lead,
  Profile,
} from "@/lib/types";
import { generateLeadMessage } from "@/lib/ai";
import { getRecommendedNextAction } from "@/lib/scoring";
import { normalizePhone } from "@/lib/utils";

type MaybeConfiguredResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: string };

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          audio?: { id?: string; mime_type?: string; sha256?: string; voice?: boolean };
          image?: { id?: string; caption?: string; mime_type?: string; sha256?: string };
          document?: { id?: string; filename?: string; mime_type?: string; sha256?: string };
          video?: { id?: string; caption?: string; mime_type?: string; sha256?: string };
          button?: { text?: string; payload?: string };
          interactive?: Record<string, unknown>;
        }>;
        statuses?: Array<{
          id?: string;
          status?: string;
          timestamp?: string;
          recipient_id?: string;
          conversation?: { id?: string };
        }>;
        metadata?: {
          phone_number_id?: string;
          display_phone_number?: string;
        };
      };
    }>;
  }>;
};

type WhatsAppIncomingMessage = {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  audio?: { id?: string; mime_type?: string; sha256?: string; voice?: boolean };
  image?: { id?: string; caption?: string; mime_type?: string; sha256?: string };
  document?: { id?: string; filename?: string; mime_type?: string; sha256?: string };
  video?: { id?: string; caption?: string; mime_type?: string; sha256?: string };
  button?: { text?: string; payload?: string };
  interactive?: Record<string, unknown>;
};

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.openAIApiKey(),
    });
  }

  return openaiClient;
}

function hasWhatsAppConfig() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  );
}

async function getMediaUrl(mediaId: string) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.whatsappApiVersion()}/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${env.whatsappAccessToken()}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}

function getMessageContent(message: WhatsAppIncomingMessage) {
  const type = message.type || "text";

  if (type === "text") {
    return {
      messageType: "text",
      textContent: message.text?.body || "",
      mediaId: null as string | null,
      metadata: {},
    };
  }

  if (type === "audio") {
    return {
      messageType: "audio",
      textContent: "[Áudio recebido]",
      mediaId: message.audio?.id || null,
      metadata: {
        mime_type: message.audio?.mime_type || null,
        sha256: message.audio?.sha256 || null,
        voice: message.audio?.voice || false,
      },
    };
  }

  if (type === "image") {
    return {
      messageType: "image",
      textContent: message.image?.caption || "[Imagem recebida]",
      mediaId: message.image?.id || null,
      metadata: {
        mime_type: message.image?.mime_type || null,
        sha256: message.image?.sha256 || null,
      },
    };
  }

  if (type === "video") {
    return {
      messageType: "video",
      textContent: message.video?.caption || "[Vídeo recebido]",
      mediaId: message.video?.id || null,
      metadata: {
        mime_type: message.video?.mime_type || null,
        sha256: message.video?.sha256 || null,
      },
    };
  }

  if (type === "document") {
    return {
      messageType: "document",
      textContent: message.document?.filename || "[Documento recebido]",
      mediaId: message.document?.id || null,
      metadata: {
        mime_type: message.document?.mime_type || null,
        filename: message.document?.filename || null,
        sha256: message.document?.sha256 || null,
      },
    };
  }

  if (type === "button") {
    return {
      messageType: "button",
      textContent: message.button?.text || "[Resposta de botão]",
      mediaId: null,
      metadata: {
        payload: message.button?.payload || null,
      },
    };
  }

  return {
    messageType: type,
    textContent: `[Mensagem ${type} recebida]`,
    mediaId: null,
    metadata: {},
  };
}

async function getProfiles(admin: SupabaseClient) {
  const { data, error } = await admin.from("profiles").select("*");

  if (error) {
    throw new Error(`Não foi possível carregar perfis: ${error.message}`);
  }

  return (data ?? []) as Profile[];
}

async function getLeadByPhone(admin: SupabaseClient, phone: string) {
  const normalized = normalizePhone(phone);
  const { data, error } = await admin.from("leads").select("*").not("phone", "is", null);

  if (error) {
    throw new Error(`Não foi possível localizar lead por telefone: ${error.message}`);
  }

  return ((data ?? []) as Lead[]).find((lead) => normalizePhone(lead.phone) === normalized) || null;
}

async function resolveOwnerAndLead(admin: SupabaseClient, phone: string, contactName?: string) {
  const existingLead = await getLeadByPhone(admin, phone);

  if (existingLead) {
    return { ownerUserId: existingLead.user_id, lead: existingLead };
  }

  const profiles = await getProfiles(admin);
  if (profiles.length !== 1) {
    return { ownerUserId: null, lead: null };
  }

  const ownerUserId = profiles[0].id;
  const { data, error } = await admin
    .from("leads")
    .insert({
      user_id: ownerUserId,
      name: contactName || `Lead ${phone}`,
      phone,
      source: "Outro",
      status: "Novo lead",
      score: 10,
      temperature: "Frio",
      incomplete_data: true,
      next_followup_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível criar lead do WhatsApp: ${error.message}`);
  }

  return { ownerUserId, lead: data as Lead };
}

async function ensureConversation(admin: SupabaseClient, userId: string, leadId: string, providerChatId?: string | null) {
  const { data, error } = await admin
    .from("conversations")
    .upsert(
      {
        user_id: userId,
        lead_id: leadId,
        channel: "whatsapp",
        provider: "whatsapp_cloud_api",
        provider_chat_id: providerChatId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "lead_id,channel" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível garantir a conversa: ${error.message}`);
  }

  return data as Conversation;
}

async function insertConversationMessage(
  admin: SupabaseClient,
  payload: Partial<ConversationMessage> & {
    conversation_id: string;
    lead_id: string;
    user_id: string;
    direction: "inbound" | "outbound";
    provider_status: string;
    message_type: string;
  },
) {
  const { data, error } = await admin
    .from("conversation_messages")
    .upsert(payload, { onConflict: "provider_message_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível registrar mensagem da conversa: ${error.message}`);
  }

  return data as ConversationMessage;
}

async function touchConversation(
  admin: SupabaseClient,
  conversationId: string,
  values: Partial<Conversation>,
) {
  const { error } = await admin
    .from("conversations")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Não foi possível atualizar a conversa: ${error.message}`);
  }
}

export async function getConversationThread(userId: string, leadId: string) {
  const supabase = await createClient();

  const [{ data: conversation }, { data: messages }, { data: suggestions }] = await Promise.all([
    supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("lead_id", leadId)
      .eq("channel", "whatsapp")
      .maybeSingle(),
    supabase
      .from("conversation_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("lead_id", leadId)
      .eq("channel", "whatsapp")
      .order("created_at", { ascending: true }),
    supabase
      .from("conversation_ai_suggestions")
      .select("*")
      .eq("user_id", userId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    conversation: (conversation as Conversation | null) ?? null,
    messages: (messages ?? []) as ConversationMessage[],
    suggestions: (suggestions ?? []) as ConversationSuggestion[],
  };
}

function buildConversationWindow(messages: ConversationMessage[]) {
  return messages
    .slice(-12)
    .map((message) => {
      const actor = message.direction === "inbound" ? "Lead" : "Corretor";
      return `${actor}: ${message.text_content || `[${message.message_type}]`}`;
    })
    .join("\n");
}

export async function generateConversationSuggestion(input: {
  userId: string;
  lead: Lead;
  profile: Profile;
  conversation: Conversation | null;
  messages: ConversationMessage[];
  goal?: string;
  draftInstruction?: string;
}) {
  const window = buildConversationWindow(input.messages);
  const fallback = await generateLeadMessage(input.lead, input.profile, "primeiro_contato");
  const fallbackMessage =
    input.messages.length > 0
      ? `Oi, ${input.lead.name}. Vi sua mensagem e estou te acompanhando por aqui. ${input.goal || "Posso te ajudar a avançar no próximo passo?"}`
      : fallback.message;

  if (!process.env.OPENAI_API_KEY) {
    return {
      suggestedReply: fallbackMessage,
      reasoningSummary: "Sugestão gerada com fallback interno por ausência de chave de IA.",
      detectedSignals: [],
      provider: "fallback" as const,
    };
  }

  const prompt = `
Você é um consultor imobiliário no Brasil ajudando um corretor a responder um lead no WhatsApp.
Responda em português do Brasil, de forma curta, humana, consultiva e natural.
Nao use markdown.

Nome do corretor: ${input.profile.name ?? "Corretor"}
Nome do lead: ${input.lead.name}
Status do lead: ${input.lead.status}
Temperatura do lead: ${input.lead.temperature}
Bairro: ${input.lead.neighborhood ?? "não informado"}
Tipo de imóvel: ${input.lead.property_type ?? "não informado"}
Faixa de preço: ${input.lead.price_range ?? "não informada"}
Objetivo desta resposta: ${input.goal || "avançar a conversa"}
Instrução adicional: ${input.draftInstruction || "nenhuma"}

Histórico recente:
${window || "Sem histórico anterior."}

Retorne JSON no formato:
{"suggestedReply":"...","reasoningSummary":"...","detectedSignals":["..."]}
`.trim();

  try {
    const response = await getOpenAIClient().responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = response.output_text.trim();
    const parsed = JSON.parse(raw) as {
      suggestedReply?: string;
      reasoningSummary?: string;
      detectedSignals?: string[];
    };

    return {
      suggestedReply: parsed.suggestedReply || fallbackMessage,
      reasoningSummary: parsed.reasoningSummary || "Sugestão gerada a partir do histórico recente.",
      detectedSignals: parsed.detectedSignals || [],
      provider: "openai" as const,
    };
  } catch {
    return {
      suggestedReply: fallbackMessage,
      reasoningSummary: "Sugestão gerada com fallback por indisponibilidade do provider.",
      detectedSignals: [],
      provider: "fallback" as const,
    };
  }
}

export async function saveConversationSuggestion(input: {
  userId: string;
  leadId: string;
  conversationId: string;
  goal?: string;
  inputContext?: string;
  suggestedMessage: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversation_ai_suggestions")
    .insert({
      user_id: input.userId,
      lead_id: input.leadId,
      conversation_id: input.conversationId,
      goal: input.goal || null,
      input_context: input.inputContext || null,
      suggested_message: input.suggestedMessage,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar a sugestão da conversa: ${error.message}`);
  }

  return data as ConversationSuggestion;
}

export async function sendWhatsAppMessage(input: {
  userId: string;
  lead: Lead;
  message: string;
}) {
  const admin = getSupabaseAdmin();
  const conversation = await ensureConversation(admin, input.userId, input.lead.id, normalizePhone(input.lead.phone));

  if (!hasWhatsAppConfig()) {
    throw new Error("Integração com WhatsApp Cloud API ainda não configurada neste ambiente.");
  }

  const phone = normalizePhone(input.lead.phone);
  if (!phone) {
    throw new Error("O lead não possui telefone válido para WhatsApp.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.whatsappApiVersion()}/${env.whatsappPhoneNumberId()}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken()}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone.startsWith("55") ? phone : `55${phone}`,
        type: "text",
        text: {
          body: input.message,
        },
      }),
    },
  );

  const payload = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Não foi possível enviar a mensagem pelo WhatsApp.");
  }

  const providerMessageId = payload.messages?.[0]?.id || null;

  const saved = await insertConversationMessage(admin, {
    conversation_id: conversation.id,
    lead_id: input.lead.id,
    user_id: input.userId,
    direction: "outbound",
    channel: "whatsapp",
    provider_message_id: providerMessageId,
    provider_status: "sent",
    message_type: "text",
    text_content: input.message,
    metadata_json: {},
    sent_at: new Date().toISOString(),
  });

  await touchConversation(admin, conversation.id, {
    last_message_at: saved.created_at,
    last_outbound_at: saved.created_at,
    provider_chat_id: conversation.provider_chat_id || phone,
  });

  return saved;
}

export async function verifyWhatsAppWebhookSignature(rawBody: string, signatureHeader: string | null) {
  if (!process.env.WHATSAPP_APP_SECRET || !signatureHeader) {
    return false;
  }

  const expected = `sha256=${createHmac("sha256", env.whatsappAppSecret()).update(rawBody).digest("hex")}`;

  const left = Buffer.from(signatureHeader);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export async function processWhatsAppWebhook(rawPayload: WhatsAppWebhookPayload) {
  const admin = getSupabaseAdmin();

  for (const entry of rawPayload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const messages = value?.messages ?? [];
      const statuses = value?.statuses ?? [];

      for (const message of messages) {
        const from = message.from;
        if (!from) continue;

        const contactName = value?.contacts?.[0]?.profile?.name;
        const { ownerUserId, lead } = await resolveOwnerAndLead(admin, from, contactName);
        if (!ownerUserId || !lead) {
          continue;
        }

        const conversation = await ensureConversation(
          admin,
          ownerUserId,
          lead.id,
          value?.metadata?.phone_number_id || from,
        );

        const content = getMessageContent(message as WhatsAppIncomingMessage);
        const mediaUrl = content.mediaId ? await getMediaUrl(content.mediaId) : null;
        const timestamp = message.timestamp
          ? new Date(Number(message.timestamp) * 1000).toISOString()
          : new Date().toISOString();

        const savedMessage = await insertConversationMessage(admin, {
          conversation_id: conversation.id,
          lead_id: lead.id,
          user_id: ownerUserId,
          direction: "inbound",
          channel: "whatsapp",
          provider_message_id: message.id || null,
          provider_status: "received",
          message_type: content.messageType,
          text_content: content.textContent,
          media_url: mediaUrl,
          metadata_json: {
            ...content.metadata,
            from,
            phone_number_id: value?.metadata?.phone_number_id || null,
            display_phone_number: value?.metadata?.display_phone_number || null,
            media_id: content.mediaId,
          },
          created_at: timestamp,
        });

        const unreadCount = (conversation.unread_count || 0) + 1;
        await touchConversation(admin, conversation.id, {
          last_message_at: savedMessage.created_at,
          last_inbound_at: savedMessage.created_at,
          unread_count: unreadCount,
        });

        const leadsTable = admin.from("leads") as never as {
          update: (payload: Record<string, unknown>) => {
            eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
          };
        };

        const { error: leadError } = await leadsTable
          .update({
            last_contact_at: savedMessage.created_at,
            last_inbound_at: savedMessage.created_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", lead.id);

        if (leadError) {
          throw new Error(`Não foi possível atualizar o lead a partir do webhook: ${leadError.message}`);
        }
      }

      for (const status of statuses) {
        if (!status.id) continue;

        const timestamp = status.timestamp
          ? new Date(Number(status.timestamp) * 1000).toISOString()
          : new Date().toISOString();

        const updates: Record<string, unknown> = {
          provider_status: status.status || "updated",
        };

        if (status.status === "sent") {
          updates.sent_at = timestamp;
        }

        if (status.status === "delivered") {
          updates.delivered_at = timestamp;
        }

        if (status.status === "read") {
          updates.read_at = timestamp;
        }

        const conversationMessagesTable = admin.from("conversation_messages") as never as {
          update: (payload: Record<string, unknown>) => {
            eq: (column: string, value: string) => {
              select: (query: string) => {
                maybeSingle: () => Promise<{
                  data: Record<string, unknown> | null;
                  error: { message: string } | null;
                }>;
              };
            };
          };
        };

        const { data: updated, error } = await conversationMessagesTable
          .update(updates)
          .eq("provider_message_id", status.id)
          .select("*")
          .maybeSingle();

        if (error) {
          throw new Error(`Não foi possível atualizar status da mensagem: ${error.message}`);
        }

        const message = updated as ConversationMessage | null;
        if (message) {
          await touchConversation(admin, message.conversation_id, {
            last_message_at: message.created_at,
          });
        }
      }
    }
  }
}

export async function getLeadConversationContext(userId: string, leadId: string) {
  const supabase = await createClient();
  const [{ data: lead }, { data: profile }, thread] = await Promise.all([
    supabase.from("leads").select("*").eq("id", leadId).eq("user_id", userId).single(),
    supabase.from("profiles").select("*").eq("id", userId).single(),
    getConversationThread(userId, leadId),
  ]);

  return {
    lead: lead as Lead,
    profile: profile as Profile,
    ...thread,
  };
}

export function buildConversationInsight(lead: Lead, messages: ConversationMessage[]) {
  if (!messages.length) {
    return getRecommendedNextAction(lead);
  }

  const lastInbound = [...messages].reverse().find((message) => message.direction === "inbound");
  if (!lastInbound) {
    return getRecommendedNextAction(lead);
  }

  if (lastInbound.message_type === "audio") {
    return "O lead enviou um áudio. Ouça o contexto antes de responder e confirme o próximo passo por texto.";
  }

  return `Última mensagem do lead: "${lastInbound.text_content || `[${lastInbound.message_type}]`}". Responda mantendo o contexto e avance para uma ação concreta.`;
}

export async function ensureConversationForLead(userId: string, leadId: string) {
  const admin = getSupabaseAdmin();
  return ensureConversation(admin, userId, leadId, null);
}

export function getWhatsAppConfigStatus(): MaybeConfiguredResult<true> {
  if (!hasWhatsAppConfig()) {
    return { ok: false, reason: "missing_config" };
  }

  return { ok: true, data: true };
}
