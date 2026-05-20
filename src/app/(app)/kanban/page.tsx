import { KanbanBoard } from "@/components/kanban-board";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getLeads } from "@/lib/leads";

export default async function KanbanPage() {
  const user = await requireUser();
  const leads = await getLeads(user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">Pipeline</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Kanban comercial</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Arraste os cards entre os status principais do pipeline ou atualize direto nos detalhes do lead.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[1.75rem] p-4 xl:p-5">
        <KanbanBoard leads={leads} />
      </Card>
    </div>
  );
}
