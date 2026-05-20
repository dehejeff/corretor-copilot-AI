"use client";

import { useMemo, useState, useTransition } from "react";
import { Bot, Headphones, Mic, Send, Sparkles } from "lucide-react";
import type {
  Conversation,
  ConversationMessage,
  ConversationSuggestion,
  Lead,
} from "@/lib/types";
import { formatRelativeDate, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ConversationPanel({
  lead,
  initialConversation,
  initialMessages,
  initialSuggestions,
  whatsappConfigured,
}: {
  lead: Lead;
  initialConversation: Conversation | null;
  initialMessages: ConversationMessage[];
  initialSuggestions: ConversationSuggestion[];
  whatsappConfigured: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [goal, setGoal] = useState("Avançar a conversa");
  const [suggestedReply, setSuggestedReply] = useState(initialSuggestions[0]?.suggested_message || "");
  const [helper, setHelper] = useState("");
  const [error, setError] = useState("");
  const [isSending, startSending] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  const lastMessage = useMemo(() => messages[messages.length - 1] || null, [messages]);

  const handleGenerate = () => {
    startGenerating(async () => {
      try {
        setError("");
        setHelper("");

        const response = await fetch("/api/ai/conversation-suggestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
            goal,
            draftInstruction: draft,
          }),
        });

        const data = (await response.json()) as {
          suggestedReply?: string;
          reasoningSummary?: string;
          provider?: "openai" | "fallback";
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível gerar a sugestão.");
        }

        setSuggestedReply(data.suggestedReply || "");
        setHelper(data.reasoningSummary || "");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  const handleSend = () => {
    startSending(async () => {
      try {
        setError("");
        setHelper("");

        const content = draft.trim() || suggestedReply.trim();
        if (!content) {
          throw new Error("Digite ou gere uma mensagem antes de enviar.");
        }

        const response = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
            message: content,
          }),
        });

        const data = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: ConversationMessage;
        };

        if (!response.ok || !data.message) {
          throw new Error(data.error || "Não foi possível enviar a mensagem.");
        }

        setMessages((current) => [...current, data.message!]);
        setDraft("");
        setSuggestedReply("");
        setHelper("Mensagem enviada pelo WhatsApp Cloud API.");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Conversa
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Acompanhe as mensagens do lead, inclusive áudio, e responda com apoio da IA.
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {initialConversation ? "Conectada" : "Nova"}
          </span>
        </div>

        {!whatsappConfigured ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Configure as variáveis do WhatsApp Cloud API para receber e enviar mensagens reais.
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {messages.length ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-surface-low px-4 py-6 text-sm text-muted-foreground">
              Ainda não há mensagens nessa conversa. Assim que o lead responder no WhatsApp oficial, o histórico aparecerá aqui.
            </div>
          )}
        </div>

        {lastMessage ? (
          <div className="mt-4 rounded-xl border border-border bg-surface-low px-4 py-3 text-sm text-muted-foreground">
            Última atividade {formatRelativeDate(lastMessage.created_at)}.
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Copilot de resposta
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Gere uma sugestão com base no histórico e adapte antes de enviar.
            </p>
          </div>
          <Bot className="h-4 w-4 text-primary" />
        </div>

        <label className="block text-sm font-medium text-foreground">
          Objetivo da resposta
          <input
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none"
            placeholder="Ex.: avançar para visita, responder objeção, confirmar interesse"
          />
        </label>

        <div className="mt-4">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Digite sua mensagem manualmente ou gere uma sugestão com IA."
          />
        </div>

        {suggestedReply ? (
          <div className="mt-4 rounded-xl border border-primary/15 bg-accent/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-primary">Sugestão da IA</p>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-sm leading-7 text-foreground/90">{suggestedReply}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setDraft(suggestedReply)}>
                Usar sugestão
              </Button>
            </div>
          </div>
        ) : null}

        {helper ? <p className="mt-4 text-sm text-emerald-700">{helper}</p> : null}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={handleGenerate} disabled={isGenerating}>
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Gerando..." : "Sugerir resposta com IA"}
          </Button>
          <Button type="button" onClick={handleSend} disabled={isSending || !whatsappConfigured}>
            <Send className="h-4 w-4" />
            {isSending ? "Enviando..." : "Enviar pelo WhatsApp"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const inbound = message.direction === "inbound";
  const hasAudio = message.message_type === "audio";
  const tone = inbound
    ? "border-border bg-white text-foreground"
    : "border-primary/15 bg-accent/35 text-foreground";

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasAudio ? <Headphones className="h-4 w-4 text-primary" /> : null}
          <span className="text-sm font-semibold">
            {inbound ? "Lead" : "Corretor"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatRelativeDate(message.created_at)}</span>
      </div>

      <div className="mt-2 space-y-2">
        <p className="text-sm leading-7 text-foreground/90">
          {message.text_content || `[${message.message_type}]`}
        </p>

        {hasAudio ? (
          <div className="rounded-xl border border-border bg-surface-low p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mic className="h-4 w-4" />
              Áudio recebido do lead
            </div>
            {message.media_url ? (
              <audio className="mt-3 w-full" controls src={message.media_url}>
                Seu navegador não suporta reprodução de áudio.
              </audio>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                O áudio foi registrado. O arquivo pode exigir download autenticado no provider.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
