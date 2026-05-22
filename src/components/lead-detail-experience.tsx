"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Bot, MessageCircle, Sparkles } from "lucide-react";
import type {
  Conversation,
  ConversationMessage,
  ConversationSuggestion,
  Interaction,
  Lead,
  Profile,
} from "@/lib/types";
import {
  analysisEligibilityLabels,
  visitTypeLabels,
} from "@/lib/constants";
import { getDocumentationChecklistSummary } from "@/lib/documentation";
import {
  buildWhatsappUrl,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeDate,
} from "@/lib/utils";
import { ConversationPanel } from "@/components/conversation-panel";
import { CollapsibleSection } from "@/components/collapsible-section";
import { MessageGenerator } from "@/components/message-generator";
import { LeadCallGuide } from "@/components/lead-call-guide";

type TabId = "dados" | "historico" | "conversa" | "ia";

function getLeadStageMeta(status: string) {
  if (status === "Novo lead" || status === "Primeiro contato enviado") {
    return {
      label: "Entrada do lead",
      tone: "text-sky-700 bg-sky-100",
      description: "Lead recém-chegado ou em primeiro toque comercial.",
    };
  }

  if (status === "Retornar contato" || status === "Respondeu" || status === "Qualificado") {
    return {
      label: "Qualificação",
      tone: "text-amber-700 bg-amber-100",
      description: "Momento de retomar a conversa, entender contexto e avançar a intenção.",
    };
  }

  if (status === "Visita agendada") {
    return {
      label: "Visita",
      tone: "text-violet-700 bg-violet-100",
      description: "O lead já entrou na etapa presencial e precisa de alinhamento fino.",
    };
  }

  if (status === "Coletar documentação") {
    return {
      label: "Documentação",
      tone: "text-orange-700 bg-orange-100",
      description: "Fase de reunir os documentos e preparar a pasta do cliente para subir na imobiliária.",
    };
  }

  if (status === "Documentação em análise") {
    return {
      label: "Análise",
      tone: "text-orange-700 bg-orange-100",
      description: "Pasta subida na imobiliária. Agora o foco é aguardar e acompanhar o retorno sobre aptidão e faixa de financiamento.",
    };
  }

  if (status === "Análise aprovada") {
    return {
      label: "Resultado aprovado",
      tone: "text-emerald-700 bg-emerald-100",
      description: "A imobiliária confirmou que o cliente está apto. Agora é hora de conduzir os próximos passos com base no retorno do financiamento.",
    };
  }

  if (status === "Análise condicionada") {
    return {
      label: "Resultado condicionado",
      tone: "text-yellow-800 bg-yellow-100",
      description: "A imobiliária retornou com condicionantes. Vale orientar o cliente, complementar a pasta e reenviar para análise.",
    };
  }

  if (status === "Análise reprovada") {
    return {
      label: "Resultado reprovado",
      tone: "text-rose-700 bg-rose-100",
      description: "A imobiliária entendeu que o cliente não está apto neste cenário atual. É importante registrar o motivo e avaliar alternativas.",
    };
  }

  if (status === "Fechado") {
    return {
      label: "Fechamento",
      tone: "text-emerald-700 bg-emerald-100",
      description: "Negócio concluído.",
    };
  }

  return {
    label: "Pipeline",
    tone: "text-muted-foreground bg-muted",
    description: "Acompanhe a próxima ação recomendada para seguir com este lead.",
  };
}

export function LeadDetailExperience({
  lead,
  profile,
  interactions,
  nextAction,
  conversation,
  conversationMessages,
  conversationSuggestions,
  whatsappConfigured,
  dataTabSections,
}: {
  lead: Lead;
  profile: Profile;
  interactions: Interaction[];
  nextAction: string;
  conversation: Conversation | null;
  conversationMessages: ConversationMessage[];
  conversationSuggestions: ConversationSuggestion[];
  whatsappConfigured: boolean;
  dataTabSections?: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("dados");

  const scoreStroke = useMemo(() => {
    const normalized = Math.min(100, Math.max(0, lead.score));
    const circumference = 2 * Math.PI * 28;
    return circumference - (normalized / 100) * circumference;
  }, [lead.score]);
  const stageMeta = getLeadStageMeta(lead.status);
  const documentationSummary = getDocumentationChecklistSummary(lead.documentation_checklist);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-high transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-primary">{lead.name}</h1>
        </div>

        <a
          href={buildWhatsappUrl(lead.phone)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#075E54] transition-colors hover:bg-[#25D366]/20"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>

      <section className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                lead.temperature === "Quente"
                  ? "bg-red-100 text-red-700"
                  : lead.temperature === "Morno"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-sky-700"
              }`}
            >
              {lead.temperature}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Score: {lead.score}/100
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {lead.property_type || "Imóvel em análise"}
          </h2>
          <p className="text-base font-bold text-primary">
            {lead.price_range || formatCurrency(lead.down_payment)}
          </p>
        </div>

        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle
              className="text-surface-high"
              cx="32"
              cy="32"
              fill="transparent"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              className="text-primary"
              cx="32"
              cy="32"
              fill="transparent"
              r="28"
              stroke="currentColor"
              strokeDasharray="175.9"
              strokeDashoffset={scoreStroke}
              strokeWidth="4"
            />
          </svg>
          <span className="absolute text-xs font-bold text-foreground">{lead.score}%</span>
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-white p-4 shadow-[var(--shadow-soft)]">
        <CollapsibleSection
          title="Copilot Insight"
          description="Resumo rápido do que mais faz sentido fazer agora."
          defaultOpen={false}
          contentClassName="mt-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Ação sugerida
            </span>
          </div>
          <p className="text-sm leading-7 text-foreground">{nextAction}</p>
        </CollapsibleSection>
      </section>

      <section className="rounded-xl border border-border bg-white p-4">
        <CollapsibleSection
          title="Etapa Atual"
          description={stageMeta.description}
          defaultOpen={false}
          summary={
            <div className="grid gap-2 sm:min-w-[240px] sm:grid-cols-2">
              <MiniInfo label="Etapa" value={lead.status} />
              <MiniInfo label="Docs pendentes" value={`${documentationSummary.pending}`} />
              <MiniInfo
                label="Resultado da análise"
                value={
                  lead.analysis_eligibility
                    ? analysisEligibilityLabels[
                        lead.analysis_eligibility as keyof typeof analysisEligibilityLabels
                      ]
                    : "Não informado"
                }
              />
              <MiniInfo label="Retorno" value={formatDateTime(lead.next_followup_at)} />
            </div>
          }
          contentClassName="mt-4"
        >
          <div className="flex flex-wrap items-start gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageMeta.tone}`}>
              {stageMeta.label}
            </span>
            <span className="text-sm font-semibold text-foreground">{lead.status}</span>
          </div>

          <div className="mt-4 grid gap-2 sm:min-w-[240px] sm:grid-cols-2 lg:grid-cols-3">
            <MiniInfo label="Docs pendentes" value={`${documentationSummary.pending}`} />
            <MiniInfo
              label="Resultado da análise"
              value={
                lead.analysis_eligibility
                  ? analysisEligibilityLabels[
                      lead.analysis_eligibility as keyof typeof analysisEligibilityLabels
                    ]
                  : "Não informado"
              }
            />
            <MiniInfo
              label="Tipo de visita"
              value={lead.visit_type ? visitTypeLabels[lead.visit_type as keyof typeof visitTypeLabels] : "Não informado"}
            />
            <MiniInfo label="Visita" value={formatDateTime(lead.visit_date)} />
            <MiniInfo label="Retorno" value={formatDateTime(lead.next_followup_at)} />
          </div>
        </CollapsibleSection>
      </section>

      <div className="scrollbar-hide flex overflow-x-auto border-b border-border">
        <TabButton
          active={activeTab === "dados"}
          onClick={() => setActiveTab("dados")}
        >
          Dados
        </TabButton>
        <TabButton
          active={activeTab === "historico"}
          onClick={() => setActiveTab("historico")}
        >
          Histórico
        </TabButton>
        <TabButton
          active={activeTab === "conversa"}
          onClick={() => setActiveTab("conversa")}
        >
          Conversa
        </TabButton>
        <TabButton
          active={activeTab === "ia"}
          onClick={() => setActiveTab("ia")}
        >
          <span className="flex items-center gap-2">
            IA Insights
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </span>
        </TabButton>
      </div>

      <div className="space-y-4">
        {activeTab === "dados" ? (
          <>
            <section className="rounded-xl border border-border bg-white p-4">
              <CollapsibleSection
                title="Perfil de interesse"
                description="Informações principais do imóvel e da região buscada."
                defaultOpen={false}
                summary={
                  <div className="grid grid-cols-2 gap-3">
                    <DataBox label="Bairro" value={lead.neighborhood || "Não informado"} />
                    <DataBox label="Tipo" value={lead.property_type || "Não informado"} />
                  </div>
                }
                contentClassName="mt-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <DataBox label="Bairro" value={lead.neighborhood || "Não informado"} />
                  <DataBox label="Tipo" value={lead.property_type || "Não informado"} />
                </div>
              </CollapsibleSection>
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <CollapsibleSection
                title="Detalhes financeiros"
                description="Resumo completo do perfil financeiro e comercial do lead."
                defaultOpen={false}
                contentClassName="mt-4"
              >
                <div className="space-y-3">
                  <Row label="Entrada disponível" value={formatCurrency(lead.down_payment)} />
                  <Row label="Renda mensal" value={lead.income_range || "Não informado"} />
                  <Row
                    label="Prazo previsto"
                    value={formatDate(lead.purchase_timeline)}
                  />
                  <Row
                    label="Tipo de visita"
                    value={lead.visit_type ? visitTypeLabels[lead.visit_type as keyof typeof visitTypeLabels] : "Não informado"}
                  />
                  <Row
                    label="Retorno da análise"
                    value={formatDateTime(lead.analysis_returned_at)}
                  />
                  <Row
                    label="Resultado da análise"
                    value={
                      lead.analysis_eligibility
                        ? analysisEligibilityLabels[
                            lead.analysis_eligibility as keyof typeof analysisEligibilityLabels
                          ]
                        : "Não informado"
                    }
                  />
                  <Row
                    label="Valor aprovado"
                    value={formatCurrency(lead.approved_financing_amount)}
                  />
                  <Row label="Data da visita" value={formatDateTime(lead.visit_date)} />
                  <Row label="Lembrete de retorno" value={formatDateTime(lead.next_followup_at)} />
                  <Row label="Origem" value={String(lead.source)} />
                  <Row label="Status atual" value={String(lead.status)} />
                </div>
              </CollapsibleSection>
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <CollapsibleSection
                title="Retorno da Imobiliária"
                description="Observações e condições que vieram da análise."
                defaultOpen={false}
                contentClassName="mt-4"
              >
                <p className="text-sm leading-7 text-foreground/90">
                  {lead.analysis_notes || "Nenhuma observação da imobiliária registrada até o momento."}
                </p>
              </CollapsibleSection>
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <CollapsibleSection
                title="Observações"
                description="Anotações livres do corretor sobre este lead."
                defaultOpen={false}
                contentClassName="mt-4"
              >
                <p className="text-sm leading-7 text-foreground/90">
                  {lead.notes || "Nenhuma observação registrada até o momento."}
                </p>
              </CollapsibleSection>
            </section>

            {dataTabSections}
          </>
        ) : null}

        {activeTab === "historico" ? (
          <section className="rounded-xl border border-border bg-white p-4">
            <CollapsibleSection
              title="Histórico recente"
              description="Últimas interações e movimentações deste lead."
              defaultOpen={false}
              contentClassName="mt-4"
            >
              <div className="space-y-3">
                {interactions.length ? (
                  interactions.map((interaction, index) => (
                    <div
                      key={interaction.id}
                      className="relative flex gap-3 before:absolute before:bottom-[-12px] before:left-2 before:top-6 before:w-[2px] before:bg-border last:before:hidden"
                    >
                      <div
                        className={`relative z-10 mt-1 h-4 w-4 rounded-full ${
                          index === 0 ? "bg-primary" : "bg-surface-high"
                        }`}
                      />
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-semibold text-foreground">{interaction.type}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {interaction.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(interaction.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted-foreground">
                    Ainda não há interações registradas para este lead.
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </section>
        ) : null}

        {activeTab === "conversa" ? (
          <ConversationPanel
            lead={lead}
            initialConversation={conversation}
            initialMessages={conversationMessages}
            initialSuggestions={conversationSuggestions}
            whatsappConfigured={whatsappConfigured}
          />
        ) : null}

        {activeTab === "ia" ? (
          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-white p-4">
              <CollapsibleSection
                title="Gerador de mensagem"
                description="Sugestões rápidas para responder sem precisar pensar em tudo do zero."
                defaultOpen={false}
                contentClassName="mt-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Sugestões rápidas
                  </span>
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <MessageGenerator lead={lead} />
              </CollapsibleSection>
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <CollapsibleSection
                title="Guia de ligação"
                description="Conduza a chamada, registre objeções e defina o próximo passo."
                defaultOpen={false}
                contentClassName="mt-4"
              >
                <LeadCallGuide lead={lead} profile={profile} />
              </CollapsibleSection>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-all ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function DataBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-low px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
