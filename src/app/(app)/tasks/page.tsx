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
        <h1 className="text-3xl font-semibold">Tarefas do dia</h1>
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
        <Card>
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa aberta para hoje. Rode o cron ou cadastre leads para gerar novas automacoes.
          </p>
        </Card>
      )}
    </div>
  );
}
