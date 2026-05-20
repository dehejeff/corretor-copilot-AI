import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Flame,
  Layers2,
  MessageSquareWarning,
  TimerReset,
  TrendingUp,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
import { ensureProfile, requireUser } from "@/lib/auth";
import { getDashboardStats, getTasksForToday } from "@/lib/leads";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, stats, tasks] = await Promise.all([
    ensureProfile(user),
    getDashboardStats(user.id),
    getTasksForToday(user.id),
  ]);

  const cards = [
    { label: "Total de leads", value: stats.total, icon: Layers2 },
    { label: "Leads novos", value: stats.newLeads, icon: UserRoundPlus },
    { label: "Leads quentes", value: stats.hot, icon: Flame },
    { label: "Leads mornos", value: stats.warm, icon: TrendingUp },
    { label: "Leads frios", value: stats.cold, icon: MessageSquareWarning },
    { label: "Sem contato", value: stats.stale, icon: TimerReset },
    { label: "Visitas agendadas", value: stats.visits, icon: WalletCards },
    { label: "Negociações", value: stats.negotiation, icon: ArrowRight },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
          Painel principal
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[2.35rem]">
          Aqui está seu resumo de hoje.
        </h1>
      </section>

      <Card className="overflow-hidden rounded-[1.75rem] border-primary/20 bg-gradient-to-br from-primary via-[#10685f] to-[#0b4f59] text-white shadow-[var(--shadow)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-sm">
            <CalendarClock className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold tracking-[0.18em] text-emerald-50 uppercase">
            Bom trabalho, {profile.name?.split(" ")[0] || "corretor"}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Priorize o que move venda agora.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/88">
              Priorize os leads mais quentes, mantenha o follow-up vivo e use a IA para responder com mais consistência.
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center justify-center rounded-xl bg-white/18 px-4 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-white/20"
          >
            Ver tarefas do dia
          </Link>
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="min-h-[132px] rounded-[1.35rem] p-4">
            <div className="flex items-center justify-between">
              <p className="max-w-[8rem] text-sm text-muted-foreground">{label}</p>
              <div className="rounded-2xl bg-accent p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-7 text-[2rem] font-bold tracking-tight">{value}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-[1.75rem]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ações urgentes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tarefas abertas geradas manualmente ou pelo motor de automação.
            </p>
          </div>
          <Link href="/tasks" className="text-sm font-semibold text-primary">
            Abrir todas
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border bg-surface-low px-4 py-4"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{task.lead?.name}</p>
              </div>
              <Badge>{task.task_type}</Badge>
            </div>
          ))}

          {tasks.length === 0 ? (
            <p className="rounded-[1.2rem] border border-border bg-surface-low px-4 py-6 text-sm text-muted-foreground">
              Nenhuma tarefa aberta para hoje. Quando o cron rodar, os follow-ups aparecerão aqui.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
