"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, MessageSquareText, Sparkles } from "lucide-react";
import { getDocumentationChecklistSummary } from "@/lib/documentation";
import { messageTypeLabels, messageTypes } from "@/lib/constants";
import { buildWhatsappUrl, getErrorMessage } from "@/lib/utils";
import type { Lead, MessageOption, MessageType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function MessageGenerator({ lead }: { lead: Lead }) {
  const [messageType, setMessageType] = useState<MessageType>("primeiro_contato");
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState<MessageOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [error, setError] = useState("");
  const [helper, setHelper] = useState("");
  const [isPending, startTransition] = useTransition();
  const documentationSummary = getDocumentationChecklistSummary(lead.documentation_checklist);
  const recommendedTypes = getRecommendedMessageTypes(lead, documentationSummary.pending);

  const handleSelectOption = (option: MessageOption) => {
    setSelectedOptionId(option.id);
    setMessage(option.message);
  };

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
          options?: MessageOption[];
          provider?: "openai" | "fallback";
          fallbackReason?: string | null;
        };

        if (!response.ok) {
          throw new Error(data.error || "Falha ao gerar mensagem.");
        }

        const nextOptions = data.options || [];
        setOptions(nextOptions);
        setMessage(data.message || "");

        const selected =
          nextOptions.find((option) => option.message === data.message) || nextOptions[0];
        setSelectedOptionId(selected?.id || "");

        if (data.provider === "fallback") {
          setHelper(
            "Mensagens geradas com biblioteca interna de fallback. A integração com IA pode estar sem saldo ou temporariamente indisponível.",
          );
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            Gerador de mensagem
          </p>
          <p className="mt-1 text-lg font-bold">Sugestões por categoria</p>
          <p className="text-sm text-muted-foreground">
            Gere opções por etapa, escolha a melhor base e adapte antes de enviar.
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>

      <Select
        value={messageType}
        onChange={(event) => setMessageType(event.target.value as MessageType)}
        className="rounded-xl"
      >
        {messageTypes.map((type) => (
          <option key={type} value={type}>
            {messageTypeLabels[type]}
          </option>
        ))}
      </Select>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Sugestões rápidas para este lead
        </p>
        <div className="flex flex-wrap gap-2">
          {recommendedTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMessageType(type)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                messageType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-low text-foreground hover:bg-accent"
              }`}
            >
              {messageTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      <Button type="button" onClick={handleGenerate} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Gerando..." : "Gerar opções"}
      </Button>

      {options.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Opções sugeridas</p>
            <p className="text-xs text-muted-foreground">
              Clique em uma opção para carregar no campo editável.
            </p>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => {
              const isActive = selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full rounded-2xl border p-3 text-left ${
                    isActive
                      ? "border-primary bg-accent/70 shadow-sm"
                      : "border-border bg-surface-low hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={isActive ? "success" : "neutral"}>{`Opção ${index + 1}`}</Badge>
                      <span className="text-sm font-semibold">{option.tone}</span>
                    </div>
                    {isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/90">{option.message}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="A mensagem escolhida aparecerá aqui para você adaptar antes de enviar."
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {helper ? <p className="text-sm text-amber-700">{helper}</p> : null}

      <a
        href={buildWhatsappUrl(lead.phone, message)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground sm:w-auto"
      >
        <MessageSquareText className="h-4 w-4" />
        Abrir WhatsApp
      </a>
    </div>
  );
}

function getRecommendedMessageTypes(lead: Lead, pendingDocuments: number): MessageType[] {
  if (lead.status === "Coletar documentação" && pendingDocuments > 0) {
    return ["cobrar_documentacao", "documentacao_pronta_analise", "simulacao_financiamento"];
  }

  if (lead.status === "Documentação em análise") {
    return ["documentacao_pronta_analise", "analise_aprovada", "analise_condicionada"];
  }

  if (lead.status === "Análise condicionada") {
    return ["analise_condicionada", "cobrar_documentacao", "simulacao_financiamento"];
  }

  if (lead.status === "Análise aprovada") {
    return ["analise_aprovada", "fechamento", "convite_visita"];
  }

  if (lead.status === "Análise reprovada") {
    return ["analise_reprovada", "simulacao_financiamento", "followup_d3"];
  }

  if (lead.status === "Visita agendada") {
    return ["convite_visita", "pos_visita", "simulacao_financiamento"];
  }

  if (lead.status === "Retornar contato") {
    return ["followup_d1", "followup_d3", "primeiro_contato"];
  }

  return ["primeiro_contato", "convite_visita", "simulacao_financiamento"];
}
