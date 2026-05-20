"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Copy, PhoneCall, PhoneForwarded, Sparkles } from "lucide-react";
import {
  callGuideSteps,
  callObjectionCards,
  callStepOrder,
  getCallStatusFromResult,
  getCallSuggestionFallback,
  leadMotivationOptions,
  nextActionOptions,
  type CallStepId,
} from "@/lib/call-guide-content";
import { replaceCallPlaceholders } from "@/lib/call-guide-utils";
import type { Lead, LeadStatus, LeadTemperature, Profile } from "@/lib/types";
import { normalizePhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CallScriptCard } from "@/components/call-script-card";
import { CallStepCard } from "@/components/call-step-card";
import { CallSummaryForm } from "@/components/call-summary-form";
import { NextActionSelector } from "@/components/next-action-selector";
import { ObjectionResponseCard } from "@/components/objection-response-card";

type CallGuideState = {
  currentStep: CallStepId;
  callStartedAt: string;
  callNotes: string;
  selectedScripts: Record<string, string>;
  answeredQuestions: string[];
  selectedObjections: string[];
  nextAction: string;
  nextFollowupAt: string;
  callResult: string;
  summary: string;
  internalNotes: string;
  suggestedPhrase: string;
  updatedLeadFields: {
    property_type: string;
    neighborhood: string;
    bedrooms: string;
    price_range: string;
    down_payment: string;
    income_range: string;
    financing_interest: boolean;
    fgts: boolean;
    purchase_timeline: string;
    use_case: string;
    simulation_done: boolean;
    credit_approved: boolean;
    can_visit: boolean;
    visit_best_slot: string;
    motivation: string;
    temperature: LeadTemperature | "";
    status: LeadStatus | "";
  };
};

const initialState: CallGuideState = {
  currentStep: "abertura",
  callStartedAt: "",
  callNotes: "",
  selectedScripts: {},
  answeredQuestions: [],
  selectedObjections: [],
  nextAction: "",
  nextFollowupAt: "",
  callResult: "",
  summary: "",
  internalNotes: "",
  suggestedPhrase: "",
  updatedLeadFields: {
    property_type: "",
    neighborhood: "",
    bedrooms: "",
    price_range: "",
    down_payment: "",
    income_range: "",
    financing_interest: false,
    fgts: false,
    purchase_timeline: "",
    use_case: "",
    simulation_done: false,
    credit_approved: false,
    can_visit: false,
    visit_best_slot: "",
    motivation: "",
    temperature: "",
    status: "",
  },
};

export function LeadCallGuide({ lead, profile }: { lead: Lead; profile: Profile }) {
  const storageKey = `call-guide:${lead.id}`;
  const [state, setState] = useState<CallGuideState>(initialState);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isGeneratingSuggestion, startGeneratingSuggestion] = useTransition();

  useEffect(() => {
    const rawDraft = localStorage.getItem(storageKey);

    if (rawDraft) {
      try {
        setState(JSON.parse(rawDraft) as CallGuideState);
        return;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    setState((current) => ({
      ...current,
      updatedLeadFields: {
        ...current.updatedLeadFields,
        property_type: lead.property_type || "",
        neighborhood: lead.neighborhood || "",
        price_range: lead.price_range || "",
        down_payment: lead.down_payment ? String(lead.down_payment) : "",
        income_range: lead.income_range || "",
        financing_interest: lead.financing_interest,
        fgts: lead.fgts,
        purchase_timeline: lead.purchase_timeline || "",
        credit_approved: lead.credit_approved,
        can_visit: lead.requested_visit,
        temperature: lead.temperature as LeadTemperature,
        status: lead.status as LeadStatus,
      },
    }));
  }, [lead, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const currentStepContent = callGuideSteps[state.currentStep];
  const currentStepIndex = callStepOrder.indexOf(state.currentStep);
  const selectedObjectionTitles = useMemo(
    () =>
      callObjectionCards
        .filter((card) => state.selectedObjections.includes(card.key))
        .map((card) => card.title),
    [state.selectedObjections],
  );

  const handleQuestionToggle = (question: string) => {
    setState((current) => ({
      ...current,
      answeredQuestions: current.answeredQuestions.includes(question)
        ? current.answeredQuestions.filter((item) => item !== question)
        : [...current.answeredQuestions, question],
    }));
  };

  const updateLeadField = (key: keyof CallGuideState["updatedLeadFields"], value: string | boolean) => {
    setState((current) => ({
      ...current,
      updatedLeadFields: {
        ...current.updatedLeadFields,
        [key]: value,
      },
    }));
  };

  const nextRecommendedStep = state.callResult
    ? getCallStatusFromResult(state.callResult)
    : state.nextAction || "Definir próximo passo";

  const copyPhone = async () => {
    if (!lead.phone) return;
    await navigator.clipboard.writeText(lead.phone);
    setSaveMessage("Telefone copiado.");
  };

  const handleGenerateSuggestion = () => {
    startGeneratingSuggestion(async () => {
      try {
        setError("");
        const response = await fetch("/api/ai/call-suggestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
            currentStep: state.currentStep,
            callNotes: state.callNotes,
            objectionSelected: selectedObjectionTitles[0] || "",
            goal: state.nextAction,
          }),
        });

        const data = (await response.json()) as { suggestedPhrase?: string; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível gerar uma sugestão agora.");
        }

        setState((current) => ({
          ...current,
          suggestedPhrase: data.suggestedPhrase || "",
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível gerar a sugestão.");
        setState((current) => ({
          ...current,
          suggestedPhrase: getCallSuggestionFallback(
            current.currentStep,
            current.nextAction,
            selectedObjectionTitles[0],
          ),
        }));
      }
    });
  };

  const handleSaveCall = () => {
    startSaving(async () => {
      try {
        setError("");
        setSaveMessage("");

        const response = await fetch(`/api/leads/${lead.id}/calls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(state),
        });

        const data = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível salvar a ligação.");
        }

        localStorage.removeItem(storageKey);
        setSaveMessage("Ligação salva com sucesso. Atualize a página para ver o histórico e o status atualizados.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar a ligação.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-3">
          {callStepOrder.map((stepId, index) => (
            <CallStepCard
              key={stepId}
              index={index + 1}
              title={callGuideSteps[stepId].title.replace(/^Step \d+:\s/, "")}
              objective={callGuideSteps[stepId].objective}
              active={state.currentStep === stepId}
              completed={callStepOrder.indexOf(stepId) < currentStepIndex}
              onClick={() => setState((current) => ({ ...current, currentStep: stepId }))}
            />
          ))}
        </div>

        <div className="rounded-[1.8rem] border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
                Ligação
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{currentStepContent.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {currentStepContent.objective}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    callStartedAt: current.callStartedAt || new Date().toISOString(),
                  }))
                }
              >
                Iniciar ligação
              </Button>
              <a
                href={`tel:${normalizePhone(lead.phone)}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <PhoneCall className="h-4 w-4" />
                Ligar para o lead
              </a>
              <Button type="button" variant="ghost" onClick={copyPhone}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {currentStepContent.scripts.length ? (
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Scripts sugeridos</p>
                    <Button type="button" variant="ghost" onClick={handleGenerateSuggestion}>
                      <Sparkles className="h-4 w-4" />
                      {isGeneratingSuggestion ? "Gerando..." : "Gerar sugestão de fala"}
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {currentStepContent.scripts.map((script, index) => {
                      const hydrated = replaceCallPlaceholders(script, lead, profile);

                      return (
                        <CallScriptCard
                          key={script}
                          title={`Script ${index + 1}`}
                          text={hydrated}
                          onUse={() =>
                            setState((current) => ({
                              ...current,
                              selectedScripts: {
                                ...current.selectedScripts,
                                [current.currentStep]: hydrated,
                              },
                              suggestedPhrase: hydrated,
                            }))
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {state.suggestedPhrase ? (
                <section className="rounded-[1.4rem] border border-primary/20 bg-accent/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Próxima melhor fala</p>
                    <PhoneForwarded className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/90">{state.suggestedPhrase}</p>
                </section>
              ) : null}

              {currentStepContent.questions.length ? (
                <section className="space-y-3">
                  <p className="text-sm font-semibold">Perguntas sugeridas</p>
                  <div className="space-y-2">
                    {currentStepContent.questions.map((question) => {
                      const checked = state.answeredQuestions.includes(question);

                      return (
                        <label
                          key={question}
                          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                            checked ? "border-primary bg-accent/40" : "border-border bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleQuestionToggle(question)}
                            className="mt-1 h-4 w-4"
                          />
                          <span>{replaceCallPlaceholders(question, lead, profile)}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {state.currentStep === "objecoes" ? (
                <section className="space-y-3">
                  <p className="text-sm font-semibold">Objeções comuns</p>
                  <div className="grid gap-3">
                    {callObjectionCards.map((card) => {
                      const selected = state.selectedObjections.includes(card.key);

                      return (
                        <ObjectionResponseCard
                          key={card.key}
                          title={card.title}
                          response={card.response}
                          selected={selected}
                          onSelect={() =>
                            setState((current) => ({
                              ...current,
                              selectedObjections: selected
                                ? current.selectedObjections.filter((item) => item !== card.key)
                                : [...current.selectedObjections, card.key],
                              suggestedPhrase: card.response,
                            }))
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {state.currentStep === "proximo_passo" ? (
                <section className="space-y-4">
                  <p className="text-sm font-semibold">Próximo passo recomendado</p>
                  <NextActionSelector
                    options={nextActionOptions}
                    value={state.nextAction}
                    onChange={(value) => setState((current) => ({ ...current, nextAction: value }))}
                  />
                </section>
              ) : null}

              {state.currentStep === "resumo" ? (
                <CallSummaryForm
                  callResult={state.callResult}
                  onCallResultChange={(value) =>
                    setState((current) => ({
                      ...current,
                      callResult: value,
                      updatedLeadFields: {
                        ...current.updatedLeadFields,
                        status: getCallStatusFromResult(value) as LeadStatus,
                      },
                    }))
                  }
                  summary={state.summary}
                  onSummaryChange={(value) => setState((current) => ({ ...current, summary: value }))}
                  nextFollowupAt={state.nextFollowupAt}
                  onNextFollowupAtChange={(value) =>
                    setState((current) => ({ ...current, nextFollowupAt: value }))
                  }
                  temperature={state.updatedLeadFields.temperature}
                  onTemperatureChange={(value) =>
                    updateLeadField("temperature", value)
                  }
                  status={state.updatedLeadFields.status}
                  onStatusChange={(value) => updateLeadField("status", value)}
                  notes={state.internalNotes}
                  onNotesChange={(value) =>
                    setState((current) => ({ ...current, internalNotes: value }))
                  }
                />
              ) : null}
            </div>

            <div className="space-y-4">
              <section className="rounded-[1.4rem] border border-border bg-surface-low p-4">
                <p className="text-sm font-semibold">Notas rápidas da ligação</p>
                <Textarea
                  className="mt-3"
                  value={state.callNotes}
                  onChange={(event) =>
                    setState((current) => ({ ...current, callNotes: event.target.value }))
                  }
                  placeholder="Registre respostas, sinais de compra, objeções e próximos combinados."
                />
              </section>

              <section className="rounded-[1.4rem] border border-border bg-surface-low p-4">
                <p className="text-sm font-semibold">Qualificação do lead</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Field label="Tipo de imóvel">
                    <Input
                      value={state.updatedLeadFields.property_type}
                      onChange={(event) => updateLeadField("property_type", event.target.value)}
                    />
                  </Field>
                  <Field label="Bairro / região">
                    <Input
                      value={state.updatedLeadFields.neighborhood}
                      onChange={(event) => updateLeadField("neighborhood", event.target.value)}
                    />
                  </Field>
                  <Field label="Quantidade de quartos">
                    <Input
                      value={state.updatedLeadFields.bedrooms}
                      onChange={(event) => updateLeadField("bedrooms", event.target.value)}
                    />
                  </Field>
                  <Field label="Faixa de preço">
                    <Input
                      value={state.updatedLeadFields.price_range}
                      onChange={(event) => updateLeadField("price_range", event.target.value)}
                    />
                  </Field>
                  <Field label="Valor de entrada">
                    <Input
                      value={state.updatedLeadFields.down_payment}
                      onChange={(event) => updateLeadField("down_payment", event.target.value)}
                    />
                  </Field>
                  <Field label="Renda aproximada">
                    <Input
                      value={state.updatedLeadFields.income_range}
                      onChange={(event) => updateLeadField("income_range", event.target.value)}
                    />
                  </Field>
                  <Field label="Prazo de compra">
                    <Input
                      type="date"
                      value={state.updatedLeadFields.purchase_timeline}
                      onChange={(event) => updateLeadField("purchase_timeline", event.target.value)}
                    />
                  </Field>
                  <Field label="Melhor dia/horário para visita">
                    <Input
                      value={state.updatedLeadFields.visit_best_slot}
                      onChange={(event) => updateLeadField("visit_best_slot", event.target.value)}
                    />
                  </Field>
                  <Field label="Compra para">
                    <Select
                      value={state.updatedLeadFields.use_case}
                      onChange={(event) => updateLeadField("use_case", event.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="Morar">Morar</option>
                      <option value="Investir">Investir</option>
                    </Select>
                  </Field>
                  <Field label="Principal motivação">
                    <Select
                      value={state.updatedLeadFields.motivation}
                      onChange={(event) => updateLeadField("motivation", event.target.value)}
                    >
                      <option value="">Selecione</option>
                      {leadMotivationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <ToggleLine
                    label="Interesse em financiamento"
                    checked={state.updatedLeadFields.financing_interest}
                    onChange={(checked) => updateLeadField("financing_interest", checked)}
                  />
                  <ToggleLine
                    label="Uso de FGTS"
                    checked={state.updatedLeadFields.fgts}
                    onChange={(checked) => updateLeadField("fgts", checked)}
                  />
                  <ToggleLine
                    label="Já fez simulação"
                    checked={state.updatedLeadFields.simulation_done}
                    onChange={(checked) => updateLeadField("simulation_done", checked)}
                  />
                  <ToggleLine
                    label="Já tem crédito aprovado"
                    checked={state.updatedLeadFields.credit_approved}
                    onChange={(checked) => updateLeadField("credit_approved", checked)}
                  />
                  <ToggleLine
                    label="Pode visitar imóvel"
                    checked={state.updatedLeadFields.can_visit}
                    onChange={(checked) => updateLeadField("can_visit", checked)}
                  />
                </div>
              </section>

              <div className="rounded-[1.4rem] border border-border bg-white p-4">
                <p className="text-sm font-semibold">Próximo passo recomendado</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextRecommendedStep}</p>
              </div>
            </div>
          </div>

          {error ? <p className="mt-5 text-sm text-danger">{error}</p> : null}
          {saveMessage ? <p className="mt-5 text-sm text-emerald-700">{saveMessage}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={handleGenerateSuggestion}>
              <Sparkles className="h-4 w-4" />
              {isGeneratingSuggestion ? "Gerando fala..." : "Gerar sugestão de fala"}
            </Button>
            <Button type="button" onClick={handleSaveCall} disabled={isSaving}>
              {isSaving ? "Salvando ligação..." : "Salvar ligação"}
            </Button>
          </div>
        </div>
      </div>
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

function ToggleLine({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
