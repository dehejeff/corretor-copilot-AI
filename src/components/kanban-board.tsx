"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { GripVertical } from "lucide-react";
import { visitTypeLabels } from "@/lib/constants";
import type { Lead, VisitType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPhone } from "@/lib/utils";
import { updateLeadStatusApi } from "@/lib/status-client";

type KanbanColumn = {
  key: string;
  title: string;
  status: string;
  visitType?: VisitType;
};

const kanbanColumns: KanbanColumn[] = [
  { key: "Novo lead", title: "Novo lead", status: "Novo lead" },
  { key: "Primeiro contato enviado", title: "Primeiro contato enviado", status: "Primeiro contato enviado" },
  { key: "Retornar contato", title: "Retornar contato", status: "Retornar contato" },
  { key: "Qualificado", title: "Qualificado", status: "Qualificado" },
  { key: "Visita escritório", title: "Visita ao escritório", status: "Visita agendada", visitType: "Escritório" },
  { key: "Visita empreendimento", title: "Visita ao empreendimento", status: "Visita agendada", visitType: "Empreendimento" },
  { key: "Coletar documentação", title: "Coletar documentação", status: "Coletar documentação" },
  { key: "Documentação em análise", title: "Documentação em análise", status: "Documentação em análise" },
  { key: "Análise aprovada", title: "Análise aprovada", status: "Análise aprovada" },
  { key: "Análise condicionada", title: "Análise condicionada", status: "Análise condicionada" },
  { key: "Análise reprovada", title: "Análise reprovada", status: "Análise reprovada" },
  { key: "Fechado", title: "Fechado", status: "Fechado" },
  { key: "Perdido", title: "Perdido", status: "Perdido" },
];

function matchesColumn(lead: Lead, column: KanbanColumn) {
  if (column.status !== "Visita agendada") {
    return lead.status === column.status;
  }

  return lead.status === column.status && lead.visit_type === column.visitType;
}

function getStatusMeta(status: string) {
  if (status === "Novo lead" || status === "Primeiro contato enviado") {
    return {
      accent: "border-sky-200 bg-sky-50/80",
      pill: "bg-sky-100 text-sky-700",
      label: "Entrada",
    };
  }

  if (status === "Retornar contato" || status === "Qualificado") {
    return {
      accent: "border-amber-200 bg-amber-50/80",
      pill: "bg-amber-100 text-amber-700",
      label: "Qualificação",
    };
  }

  if (status === "Visita agendada") {
    return {
      accent: "border-violet-200 bg-violet-50/80",
      pill: "bg-violet-100 text-violet-700",
      label: "Visita",
    };
  }

  if (status === "Coletar documentação" || status === "Documentação em análise") {
    return {
      accent: "border-orange-200 bg-orange-50/80",
      pill: "bg-orange-100 text-orange-700",
      label: "Documentação",
    };
  }

  if (status === "Análise aprovada") {
    return {
      accent: "border-emerald-200 bg-emerald-50/80",
      pill: "bg-emerald-100 text-emerald-700",
      label: "Aprovado",
    };
  }

  if (status === "Análise condicionada") {
    return {
      accent: "border-yellow-200 bg-yellow-50/80",
      pill: "bg-yellow-100 text-yellow-800",
      label: "Condicionado",
    };
  }

  if (status === "Análise reprovada" || status === "Perdido") {
    return {
      accent: "border-rose-200 bg-rose-50/80",
      pill: "bg-rose-100 text-rose-700",
      label: "Atenção",
    };
  }

  if (status === "Fechado") {
    return {
      accent: "border-emerald-200 bg-emerald-50/80",
      pill: "bg-emerald-100 text-emerald-700",
      label: "Fechamento",
    };
  }

  return {
    accent: "border-border bg-white",
    pill: "bg-muted text-muted-foreground",
    label: "Pipeline",
  };
}

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  const [boardLeads, setBoardLeads] = useState(leads);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBoardLeads(leads);
  }, [leads]);

  const onDropCard = (event: DragEvent<HTMLElement>, column: KanbanColumn) => {
    event.preventDefault();

    const leadId = event.dataTransfer.getData("leadId");
    if (!leadId) return;

    const previousLeads = boardLeads;
    setHoveredStatus(null);
    setDraggedLeadId(null);

    setBoardLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: column.status,
              visit_type: column.status === "Visita agendada" ? column.visitType ?? lead.visit_type : null,
            }
          : lead,
      ),
    );

    startTransition(async () => {
      try {
        await updateLeadStatusApi(leadId, column.status, column.visitType);
      } catch {
        setBoardLeads(previousLeads);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          No celular, acompanhe as etapas em blocos verticais. Em telas maiores, arraste os cards entre as colunas.
        </p>
        {isPending ? <p className="text-sm text-primary">Atualizando pipeline...</p> : null}
      </div>

      <div className="space-y-4 md:hidden">
        {kanbanColumns.map((column) => {
          const items = boardLeads.filter((lead) => matchesColumn(lead, column));
          const isHovered = hoveredStatus === column.key;
          const meta = getStatusMeta(column.status);

          return (
            <section
              key={column.key}
              className={`rounded-[1.6rem] border p-4 ${
                isHovered ? "border-primary bg-accent/20" : meta.accent
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setHoveredStatus(column.key);
              }}
              onDragLeave={() => setHoveredStatus((current) => (current === column.key ? null : current))}
              onDrop={(event) => onDropCard(event, column)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${meta.pill}`}>
                    {meta.label}
                  </span>
                  <p className="text-base font-semibold">{column.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {items.length === 1 ? "1 lead nesta etapa" : `${items.length} leads nesta etapa`}
                  </p>
                </div>
                <Badge>{items.length}</Badge>
              </div>

              <div className="mt-4 space-y-3">
                {items.length ? (
                  items.map((lead) => (
                    <KanbanLeadCard
                      key={lead.id}
                      lead={lead}
                      compact
                      isDragging={draggedLeadId === lead.id}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("leadId", lead.id);
                        event.dataTransfer.effectAllowed = "move";
                        setDraggedLeadId(lead.id);
                      }}
                      onDragEnd={() => {
                        setDraggedLeadId(null);
                        setHoveredStatus(null);
                      }}
                    />
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-border bg-muted/25 px-4 py-6 text-center text-sm text-muted-foreground">
                    Solte um lead aqui para mover de etapa.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto pb-2 md:block">
        <div className="flex min-w-max gap-4">
          {kanbanColumns.map((column) => {
            const items = boardLeads.filter((lead) => matchesColumn(lead, column));
            const isHovered = hoveredStatus === column.key;
            const meta = getStatusMeta(column.status);

            return (
              <div
                key={column.key}
                className={`flex min-h-[560px] w-[280px] shrink-0 flex-col rounded-[1.8rem] border p-4 xl:w-[290px] 2xl:w-[300px] ${
                  isHovered ? "border-primary bg-accent/30" : meta.accent
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setHoveredStatus(column.key);
                }}
                onDragLeave={() => setHoveredStatus((current) => (current === column.key ? null : current))}
                onDrop={(event) => onDropCard(event, column)}
              >
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${meta.pill}`}>
                      {meta.label}
                    </span>
                    <p className="text-base font-semibold">{column.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {items.length === 1 ? "1 lead nesta etapa" : `${items.length} leads nesta etapa`}
                    </p>
                  </div>
                  <Badge>{items.length}</Badge>
                </div>

                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  {items.length ? (
                    items.map((lead) => (
                      <KanbanLeadCard
                        key={lead.id}
                        lead={lead}
                        isDragging={draggedLeadId === lead.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("leadId", lead.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggedLeadId(lead.id);
                        }}
                        onDragEnd={() => {
                          setDraggedLeadId(null);
                          setHoveredStatus(null);
                        }}
                      />
                    ))
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-[1.4rem] border border-dashed border-border bg-muted/25 p-4 text-center text-sm text-muted-foreground">
                      Solte um card aqui ou continue movendo oportunidades pelo pipeline.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KanbanLeadCard({
  lead,
  compact = false,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  compact?: boolean;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLAnchorElement>) => void;
  onDragEnd: () => void;
}) {
  const statusMeta = getStatusMeta(lead.status);

  return (
    <Link
      href={`/leads/${lead.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`block rounded-[1.4rem] border border-border bg-white p-4 shadow-sm ${
        isDragging ? "scale-[0.98] opacity-60" : "hover:bg-accent/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusMeta.pill}`}>
            {statusMeta.label}
          </span>
          <p className={`${compact ? "text-base" : "text-lg"} font-semibold leading-6`}>{lead.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.neighborhood || "Bairro não informado"}
          </p>
        </div>
        <div className="rounded-full bg-white/90 p-2 text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        <p>{formatPhone(lead.phone) || "Telefone não informado"}</p>
        <p>{lead.property_type || "Tipo não informado"}</p>
        {lead.visit_type ? <p>{visitTypeLabels[lead.visit_type as keyof typeof visitTypeLabels]}</p> : null}
        {lead.visit_date ? <p>Visita: {formatDateTime(lead.visit_date)}</p> : null}
        {lead.next_followup_at ? <p>Retorno: {formatDateTime(lead.next_followup_at)}</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <Badge
          tone={
            lead.temperature === "Quente"
              ? "hot"
              : lead.temperature === "Morno"
                ? "warm"
                : "cold"
          }
        >
          {lead.temperature}
        </Badge>
        <span className="font-mono text-sm font-semibold text-foreground">{lead.score} pts</span>
      </div>
    </Link>
  );
}
