"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Bot, MessageCircle, Sparkles } from "lucide-react";
import type { Interaction, Lead, Profile } from "@/lib/types";
import {
  buildWhatsappUrl,
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "@/lib/utils";
import { MessageGenerator } from "@/components/message-generator";
import { LeadCallGuide } from "@/components/lead-call-guide";

type TabId = "dados" | "historico" | "ia";

export function LeadDetailExperience({
  lead,
  profile,
  interactions,
  nextAction,
}: {
  lead: Lead;
  profile: Profile;
  interactions: Interaction[];
  nextAction: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("dados");

  const scoreStroke = useMemo(() => {
    const normalized = Math.min(100, Math.max(0, lead.score));
    const circumference = 2 * Math.PI * 28;
    return circumference - (normalized / 100) * circumference;
  }, [lead.score]);

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
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Copilot Insight
          </h3>
        </div>
        <p className="text-sm leading-7 text-foreground">
          {nextAction}
        </p>
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
            <section className="space-y-2">
              <h4 className="px-1 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Perfil de interesse
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <DataBox label="Bairro" value={lead.neighborhood || "Não informado"} />
                <DataBox label="Tipo" value={lead.property_type || "Não informado"} />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-white">
              <div className="p-4">
                <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Detalhes financeiros
                </h4>
                <div className="space-y-3">
                  <Row label="Entrada disponível" value={formatCurrency(lead.down_payment)} />
                  <Row label="Renda mensal" value={lead.income_range || "Não informado"} />
                  <Row
                    label="Prazo previsto"
                    value={formatDate(lead.purchase_timeline)}
                  />
                  <Row label="Origem" value={String(lead.source)} />
                  <Row label="Status atual" value={String(lead.status)} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Observações
              </h4>
              <p className="text-sm leading-7 text-foreground/90">
                {lead.notes || "Nenhuma observação registrada até o momento."}
              </p>
            </section>
          </>
        ) : null}

        {activeTab === "historico" ? (
          <section className="space-y-2">
            <h4 className="px-1 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Histórico recente
            </h4>
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
          </section>
        ) : null}

        {activeTab === "ia" ? (
          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Gerador de mensagem
                </h4>
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <MessageGenerator lead={lead} />
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <div className="mb-4">
                <h4 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Guia de ligação
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Conduza a chamada, registre objeções e defina o próximo passo.
                </p>
              </div>
              <LeadCallGuide lead={lead} profile={profile} />
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
