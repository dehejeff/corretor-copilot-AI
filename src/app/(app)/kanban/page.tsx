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
        <h1 className="text-3xl font-semibold">Kanban comercial</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Arraste os cards entre os status principais do pipeline ou atualize direto nos detalhes do lead.
        </p>
      </div>

      <Card>
        <KanbanBoard leads={leads} />
      </Card>
    </div>
  );
}
