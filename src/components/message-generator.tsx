"use client";

import { useState, useTransition } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { buildWhatsappUrl, getErrorMessage } from "@/lib/utils";
import type { Lead, MessageType } from "@/lib/types";
import { messageTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function MessageGenerator({ lead }: { lead: Lead }) {
  const [messageType, setMessageType] = useState<MessageType>("primeiro_contato");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [helper, setHelper] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        setError("");
        setHelper("");
        const response = await fetch("/api/ai/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
            messageType,
          }),
        });

        const data = (await response.json()) as {
          message?: string;
          error?: string;
          provider?: "openai" | "fallback";
          fallbackReason?: string | null;
        };

        if (!response.ok) {
          throw new Error(data.error || "Falha ao gerar mensagem.");
        }

        setMessage(data.message || "");

        if (data.provider === "fallback") {
          setHelper("Mensagem gerada com modelo interno de fallback. A integração com IA pode estar sem saldo ou temporariamente indisponível.");
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="space-y-4 rounded-[1.6rem] border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Gerador de mensagem com IA</p>
          <p className="text-sm text-muted-foreground">
            Cria textos curtos, consultivos e prontos para WhatsApp.
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>

      <Select value={messageType} onChange={(event) => setMessageType(event.target.value as MessageType)}>
        {messageTypes.map((type) => (
          <option key={type} value={type}>
            {type.replaceAll("_", " ")}
          </option>
        ))}
      </Select>

      <Button type="button" onClick={handleGenerate} disabled={isPending}>
        {isPending ? "Gerando..." : "Gerar mensagem"}
      </Button>

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="A mensagem gerada aparecerá aqui."
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {helper ? <p className="text-sm text-amber-700">{helper}</p> : null}

      <a
        href={buildWhatsappUrl(lead.phone, message)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-2xl border border-border bg-accent px-4 py-3 text-sm font-semibold text-foreground"
      >
        <MessageSquareText className="h-4 w-4" />
        Abrir WhatsApp
      </a>
    </div>
  );
}
