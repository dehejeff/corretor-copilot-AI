"use client";

import type { LeadStatus, LeadTemperature } from "@/lib/types";
import { callResultOptions } from "@/lib/call-guide-content";
import { leadStatuses } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CallSummaryForm({
  callResult,
  onCallResultChange,
  summary,
  onSummaryChange,
  nextFollowupAt,
  onNextFollowupAtChange,
  temperature,
  onTemperatureChange,
  status,
  onStatusChange,
  notes,
  onNotesChange,
}: {
  callResult: string;
  onCallResultChange: (value: string) => void;
  summary: string;
  onSummaryChange: (value: string) => void;
  nextFollowupAt: string;
  onNextFollowupAtChange: (value: string) => void;
  temperature: LeadTemperature | "";
  onTemperatureChange: (value: LeadTemperature | "") => void;
  status: LeadStatus | "";
  onStatusChange: (value: LeadStatus | "") => void;
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Resultado da ligação">
          <Select value={callResult} onChange={(event) => onCallResultChange(event.target.value)}>
            <option value="">Selecione um resultado</option>
            {callResultOptions.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Próximo contato">
          <Input
            type="datetime-local"
            value={nextFollowupAt}
            onChange={(event) => onNextFollowupAtChange(event.target.value)}
          />
        </Field>

        <Field label="Temperatura do lead">
          <Select
            value={temperature}
            onChange={(event) => onTemperatureChange(event.target.value as LeadTemperature | "")}
          >
            <option value="">Manter atual</option>
            <option value="Quente">Quente</option>
            <option value="Morno">Morno</option>
            <option value="Frio">Frio</option>
          </Select>
        </Field>

        <Field label="Status atualizado">
          <Select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as LeadStatus | "")}
          >
            <option value="">Manter atual</option>
            {leadStatuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Resumo da conversa">
        <Textarea
          value={summary}
          onChange={(event) => onSummaryChange(event.target.value)}
          placeholder="Registre o que o lead busca, o momento da compra e o que ficou combinado."
        />
      </Field>

      <Field label="Observações internas">
        <Textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Anote detalhes relevantes para a próxima abordagem."
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
