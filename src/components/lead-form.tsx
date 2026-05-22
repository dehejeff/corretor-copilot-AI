import {
  analysisEligibilityLabels,
  analysisEligibilityOptions,
  leadSources,
  leadStatuses,
  visitTypeLabels,
  visitTypes,
} from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { formatDateTimeLocalInput } from "@/lib/utils";
import { CollapsibleSection } from "@/components/collapsible-section";
import { CurrencyInput, PhoneInput } from "@/components/formatted-fields";
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
      <FormSection
        title="Contato e origem"
        description="Comece com os dados essenciais para localizar e abordar o lead com rapidez."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome">
            <Input name="name" defaultValue={initialLead?.name ?? ""} required />
          </Field>
          <Field label="Telefone / WhatsApp">
            <PhoneInput name="phone" defaultValue={initialLead?.phone} />
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
      </FormSection>

      <FormSection
        title="Busca e orçamento"
        description="Esses campos ajudam a qualificar o perfil e orientar visita, documentação e proposta."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Bairro de interesse">
            <Input name="neighborhood" defaultValue={initialLead?.neighborhood ?? ""} />
          </Field>
          <Field label="Tipo de imóvel">
            <Input name="property_type" defaultValue={initialLead?.property_type ?? ""} />
          </Field>
          <Field label="Faixa de preço">
            <Input
              name="price_range"
              defaultValue={initialLead?.price_range ?? ""}
              placeholder="Ex.: R$ 250.000 a R$ 350.000"
            />
          </Field>
          <Field label="Valor de entrada">
            <CurrencyInput
              name="down_payment"
              defaultValue={initialLead?.down_payment ?? ""}
              placeholder="R$ 20.000,00"
            />
          </Field>
          <Field label="Renda aproximada">
            <CurrencyInput
              name="income_range"
              defaultValue={initialLead?.income_range ?? ""}
              placeholder="R$ 4.500,00"
              mode="text"
            />
          </Field>
          <Field label="Data prevista para compra">
            <Input
              name="purchase_timeline"
              type="date"
              defaultValue={initialLead?.purchase_timeline ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Visitas e retorno"
        description="Preencha apenas se já existir visita marcada ou um horário combinado para retomar o contato."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Data da visita">
            <Input
              name="visit_date"
              type="datetime-local"
              defaultValue={formatDateTimeLocalInput(initialLead?.visit_date)}
            />
          </Field>
          <Field label="Tipo de visita">
            <Select name="visit_type" defaultValue={initialLead?.visit_type ?? ""}>
              <option value="">Selecione</option>
              {visitTypes.map((type) => (
                <option key={type} value={type}>
                  {visitTypeLabels[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lembrete de retorno">
            <Input
              name="next_followup_at"
              type="datetime-local"
              defaultValue={formatDateTimeLocalInput(initialLead?.next_followup_at)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Retorno da imobiliária"
        description="Use esta área quando a pasta já tiver sido analisada e você precisar registrar o retorno."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Data do retorno da análise">
            <Input
              name="analysis_returned_at"
              type="datetime-local"
              defaultValue={formatDateTimeLocalInput(initialLead?.analysis_returned_at)}
            />
          </Field>
          <Field label="Resultado da análise">
            <Select name="analysis_eligibility" defaultValue={initialLead?.analysis_eligibility ?? ""}>
              <option value="">Selecione</option>
              {analysisEligibilityOptions.map((option) => (
                <option key={option} value={option}>
                  {analysisEligibilityLabels[option]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Valor aprovado para financiamento">
            <CurrencyInput
              name="approved_financing_amount"
              defaultValue={initialLead?.approved_financing_amount ?? ""}
              placeholder="R$ 180.000,00"
            />
          </Field>
        </div>

        <Field className="mt-4" label="Observações da imobiliária">
          <Textarea
            name="analysis_notes"
            defaultValue={initialLead?.analysis_notes ?? ""}
            placeholder="Registre o retorno da imobiliária, condições, restrições ou observações sobre a análise."
          />
        </Field>
      </FormSection>

      <FormSection
        title="Observações e sinais do lead"
        description="Marque rapidamente o que já foi confirmado e registre informações úteis para a próxima abordagem."
      >
        <Field label="Observações">
          <Textarea name="notes" defaultValue={initialLead?.notes ?? ""} />
        </Field>

        <div className="mt-4 grid gap-3 rounded-[1.6rem] border border-border bg-muted/50 p-4 md:grid-cols-2">
          <CheckLine name="financing_interest" defaultChecked={initialLead?.financing_interest}>
            Tem interesse em financiamento
          </CheckLine>
          <CheckLine name="credit_approved" defaultChecked={initialLead?.credit_approved}>
            Já tem crédito aprovado
          </CheckLine>
          <CheckLine name="fgts" defaultChecked={initialLead?.fgts}>
            Pretende usar FGTS
          </CheckLine>
          <CheckLine name="requested_visit" defaultChecked={initialLead?.requested_visit}>
            Já pediu visita
          </CheckLine>
          <CheckLine name="researching_only" defaultChecked={initialLead?.researching_only}>
            Está apenas pesquisando
          </CheckLine>
        </div>
      </FormSection>

      <div className="sticky bottom-3 z-10 rounded-[1.25rem] border border-primary/15 bg-white/95 p-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Revise os campos principais e salve para atualizar o lead sem perder o contexto.
          </p>
          <SubmitButton pendingText="Salvando lead...">{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <CollapsibleSection
      title={title}
      description={description}
      defaultOpen={false}
      className="rounded-[1.6rem] border border-border bg-white p-5 shadow-[var(--shadow-soft)]"
      contentClassName="mt-4"
    >
      {children}
    </CollapsibleSection>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2 text-sm font-medium text-foreground ${className ?? ""}`}>
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
