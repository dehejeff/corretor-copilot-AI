"use client";

import { useState } from "react";
import {
  getDocumentationChecklistSummary,
  isDocumentationReadyForAnalysis,
  normalizeDocumentationChecklist,
} from "@/lib/documentation";
import type { DocumentationChecklistItem, Lead } from "@/lib/types";
import { CollapsibleSection } from "@/components/collapsible-section";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function DocumentationChecklistCard({
  lead,
  action,
}: {
  lead: Lead;
  action: (formData: FormData) => Promise<void>;
}) {
  const [items, setItems] = useState<DocumentationChecklistItem[]>(
    normalizeDocumentationChecklist(lead.documentation_checklist),
  );

  const summary = getDocumentationChecklistSummary(items);
  const readyForAnalysis = isDocumentationReadyForAnalysis(items);

  const updateItem = (key: string, patch: Partial<DocumentationChecklistItem>) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
      <CollapsibleSection
        title="Checklist de Documentacao"
        description="Controle o que ja foi recebido, o que falta e o que nao se aplica antes de subir a pasta na imobiliaria."
        defaultOpen={false}
        summary={
          <div className="grid min-w-[220px] gap-2 sm:grid-cols-3">
            <SummaryPill label="Recebidos" value={summary.received} tone="emerald" />
            <SummaryPill label="Pendentes" value={summary.pending} tone="amber" />
            <SummaryPill label="Ignorados" value={summary.ignored} tone="slate" />
          </div>
        }
        contentClassName="mt-4"
      >
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
            readyForAnalysis
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {readyForAnalysis
            ? "Pasta pronta para subir na imobiliária. Agora faz sentido avançar para a etapa de análise."
            : `Ainda existem ${summary.pending} documento(s) pendente(s). Complete a pasta antes de enviar para análise.`}
        </div>

        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="documentation_checklist" value={JSON.stringify(items)} readOnly />

          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.key} className="rounded-[1.25rem] border border-border bg-surface-low p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Registre aqui qualquer detalhe útil para não precisar procurar essa informação depois.
                    </p>
                    <Textarea
                      className="mt-3"
                      value={item.notes}
                      onChange={(event) => updateItem(item.key, { notes: event.target.value })}
                      placeholder="Observacoes, pendencias ou detalhes deste documento."
                    />
                  </div>
                  <div>
                    <label className="space-y-2 text-sm font-medium">
                      <span>Status</span>
                      <Select
                        value={item.status}
                        onChange={(event) =>
                          updateItem(item.key, {
                            status: event.target.value as DocumentationChecklistItem["status"],
                          })
                        }
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Recebido">Recebido</option>
                        <option value="Nao se aplica">Nao se aplica</option>
                      </Select>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SubmitButton pendingText="Salvando checklist...">Salvar checklist</SubmitButton>
        </form>
      </CollapsibleSection>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "slate";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <div className={`rounded-xl px-3 py-2 text-center ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
