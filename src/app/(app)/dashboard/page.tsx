import Link from "next/link";
import { ArrowRight, Flame, Layers2, MessageSquareWarning, TimerReset, TrendingUp, UserRoundPlus, WalletCards } from "lucide-react";
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
      <Card className="overflow-hidden bg-[linear-gradient(135deg,#0f172a,#164e63)] text-white">
        <p className="text-sm tracking-[0.24em] text-teal-200 uppercase">Painel principal</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Bom trabalho, {profile.name?.split(" ")[0] || "corretor"}.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Priorize os leads mais quentes, mantenha o follow-up vivo e use a IA para responder com mais consistência.
            </p>
          </div>
          <Link href="/tasks" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            Ver tarefas do dia
          </Link>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="rounded-2xl bg-accent p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-6 text-4xl font-semibold">{value}</p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Foco de hoje</h2>
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
            <div key={task.id} className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-4">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{task.lead?.name}</p>
              </div>
              <Badge>{task.task_type}</Badge>
            </div>
          ))}
          {tasks.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
              Nenhuma tarefa aberta para hoje. Quando o cron rodar, os follow-ups aparecerão aqui.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
