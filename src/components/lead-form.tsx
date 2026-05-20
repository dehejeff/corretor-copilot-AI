import { leadSources, leadStatuses } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function LeadForm({
  action,
  submitLabel,
  initialLead,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  initialLead?: Partial<Lead>;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome">
          <Input name="name" defaultValue={initialLead?.name ?? ""} required />
        </Field>
        <Field label="Telefone / WhatsApp">
          <Input name="phone" defaultValue={initialLead?.phone ?? ""} />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" defaultValue={initialLead?.email ?? ""} />
        </Field>
        <Field label="Origem">
          <Select name="source" defaultValue={initialLead?.source ?? "Manual"}>
            {leadSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Bairro de interesse">
          <Input name="neighborhood" defaultValue={initialLead?.neighborhood ?? ""} />
        </Field>
        <Field label="Tipo de imovel">
          <Input name="property_type" defaultValue={initialLead?.property_type ?? ""} />
        </Field>
        <Field label="Faixa de preco">
          <Input name="price_range" defaultValue={initialLead?.price_range ?? ""} />
        </Field>
        <Field label="Valor de entrada">
          <Input
            name="down_payment"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialLead?.down_payment ?? ""}
          />
        </Field>
        <Field label="Renda aproximada">
          <Input name="income_range" defaultValue={initialLead?.income_range ?? ""} />
        </Field>
        <Field label="Prazo para compra">
          <Input name="purchase_timeline" defaultValue={initialLead?.purchase_timeline ?? ""} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={initialLead?.status ?? "Novo lead"}>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Observacoes">
        <Textarea name="notes" defaultValue={initialLead?.notes ?? ""} />
      </Field>

      <div className="grid gap-3 rounded-[1.6rem] border border-border bg-muted/50 p-4 md:grid-cols-2">
        <CheckLine name="financing_interest" defaultChecked={initialLead?.financing_interest}>
          Tem interesse em financiamento
        </CheckLine>
        <CheckLine name="credit_approved" defaultChecked={initialLead?.credit_approved}>
          Ja tem credito aprovado
        </CheckLine>
        <CheckLine name="fgts" defaultChecked={initialLead?.fgts}>
          Pretende usar FGTS
        </CheckLine>
        <CheckLine name="requested_visit" defaultChecked={initialLead?.requested_visit}>
          Ja pediu visita
        </CheckLine>
        <CheckLine name="researching_only" defaultChecked={initialLead?.researching_only}>
          Esta apenas pesquisando
        </CheckLine>
      </div>

      <SubmitButton pendingText="Salvando lead...">{submitLabel}</SubmitButton>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function CheckLine({
  children,
  name,
  defaultChecked,
}: {
  children: React.ReactNode;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
      <Checkbox name={name} defaultChecked={defaultChecked} />
      <span>{children}</span>
    </label>
  );
}
