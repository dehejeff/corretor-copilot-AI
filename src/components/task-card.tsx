import Link from "next/link";
import { CheckCircle2, MessageCircle, MessageSquareText } from "lucide-react";
import type { Task } from "@/lib/types";
import { buildWhatsappUrl, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";

export function TaskCard({
  task,
  action,
}: {
  task: Task;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="rounded-[1.6rem] border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{task.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
        </div>
        <Badge>{task.task_type}</Badge>
      </div>

      <div className="mt-4 rounded-2xl bg-muted/50 p-4">
        <p className="font-medium">{task.lead?.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vence {formatRelativeDate(task.due_date)}
        </p>
        <p className="mt-3 text-sm leading-6">{task.suggested_message}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/leads/${task.lead_id}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold"
        >
          <MessageSquareText className="h-4 w-4 shrink-0" />
          Gerar mensagem
        </Link>
        <a
          href={buildWhatsappUrl(task.lead?.phone, task.suggested_message)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Abrir WhatsApp
        </a>
        <form action={action}>
          <input type="hidden" name="taskId" value={task.id} />
          <SubmitButton pendingText="Concluindo..." variant="secondary">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Marcar como feito
            </span>
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
