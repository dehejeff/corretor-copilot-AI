"use client";

import { useTransition } from "react";
import type { DragEvent } from "react";
import { kanbanStatuses } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { updateLeadStatusApi } from "@/lib/status-client";

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  const [isPending, startTransition] = useTransition();

  const onDropCard = (event: DragEvent<HTMLDivElement>, status: string) => {
    const leadId = event.dataTransfer.getData("leadId");
    if (!leadId) return;

    startTransition(async () => {
      await updateLeadStatusApi(leadId, status);
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4 xl:grid-cols-7">
      {kanbanStatuses.map((status) => {
        const items = leads.filter((lead) => lead.status === status);

        return (
          <div
            key={status}
            className="rounded-[1.6rem] border border-border bg-white p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDropCard(event, status)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{status}</p>
              <Badge>{items.length}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("leadId", lead.id)}
                  className="cursor-grab rounded-2xl border border-border bg-muted/40 p-3 active:cursor-grabbing"
                >
                  <p className="font-medium">{lead.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lead.neighborhood || "Bairro não informado"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
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
                    <span className="font-mono text-xs text-muted-foreground">{lead.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {isPending ? <p className="text-sm text-muted-foreground">Atualizando pipeline...</p> : null}
    </div>
  );
}
