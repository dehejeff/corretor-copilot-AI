import { markTaskAsDoneAction } from "@/app/(app)/actions";
import { TaskCard } from "@/components/task-card";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getTasksForToday } from "@/lib/leads";

export default async function TasksPage() {
  const user = await requireUser();
  const tasks = await getTasksForToday(user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">Agenda</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Tarefas do dia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Follow-ups sugeridos pelo backend, prontos para gerar mensagem e abrir o WhatsApp.
        </p>
      </div>

      {tasks.length ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} action={markTaskAsDoneAction} />
          ))}
        </div>
      ) : (
        <Card className="rounded-[1.5rem]">
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa aberta para hoje. Rode o cron ou cadastre leads para gerar novas automações.
          </p>
        </Card>
      )}
    </div>
  );
}
