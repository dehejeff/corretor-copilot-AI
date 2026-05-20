"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { GripVertical } from "lucide-react";
import { kanbanStatuses } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatPhone } from "@/lib/utils";
import { updateLeadStatusApi } from "@/lib/status-client";

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  const [boardLeads, setBoardLeads] = useState(leads);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBoardLeads(leads);
  }, [leads]);

  const onDropCard = (event: DragEvent<HTMLElement>, status: string) => {
    event.preventDefault();

    const leadId = event.dataTransfer.getData("leadId");
    if (!leadId) return;

    const previousLeads = boardLeads;
    setHoveredStatus(null);
    setDraggedLeadId(null);

    setBoardLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    );

    startTransition(async () => {
      try {
        await updateLeadStatusApi(leadId, status);
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
        {kanbanStatuses.map((status) => {
          const items = boardLeads.filter((lead) => lead.status === status);
          const isHovered = hoveredStatus === status;

          return (
            <section
              key={status}
              className={`rounded-[1.6rem] border bg-white p-4 ${
                isHovered ? "border-primary bg-accent/20" : "border-border"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setHoveredStatus(status);
              }}
              onDragLeave={() => setHoveredStatus((current) => (current === status ? null : current))}
              onDrop={(event) => onDropCard(event, status)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{status}</p>
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
          {kanbanStatuses.map((status) => {
            const items = boardLeads.filter((lead) => lead.status === status);
            const isHovered = hoveredStatus === status;

            return (
              <div
                key={status}
                className={`flex min-h-[560px] w-[220px] shrink-0 flex-col rounded-[1.8rem] border bg-white p-4 xl:w-[228px] 2xl:w-[236px] ${
                  isHovered ? "border-primary bg-accent/30" : "border-border"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setHoveredStatus(status);
                }}
                onDragLeave={() => setHoveredStatus((current) => (current === status ? null : current))}
                onDrop={(event) => onDropCard(event, status)}
              >
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-base font-semibold">{status}</p>
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
  return (
    <Link
      href={`/leads/${lead.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`block rounded-[1.4rem] border border-border bg-muted/35 p-4 shadow-sm ${
        isDragging ? "scale-[0.98] opacity-60" : "hover:bg-accent/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
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
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
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
