import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCheck,
  Flame,
  Layers2,
  MessageSquareWarning,
  TimerReset,
  TrendingUp,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
import { ensureProfile, requireUser } from "@/lib/auth";
import { getDashboardPriorities, getDashboardStats, getTasksForToday } from "@/lib/leads";
import { CollapsibleSection } from "@/components/collapsible-section";
import { visitTypeLabels } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, stats, tasks, priorities] = await Promise.all([
    ensureProfile(user),
    getDashboardStats(user.id),
    getTasksForToday(user.id),
    getDashboardPriorities(user.id),
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
    { label: "Fechados", value: stats.closed, icon: CheckCheck },
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

      <section className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary via-[#10685f] to-[#0b4f59] p-5 text-white shadow-[var(--shadow)] sm:p-6">
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
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
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

      <section className="grid gap-4 xl:grid-cols-2">
        <PriorityPanel
          title="Precisa retornar hoje"
          description="Leads com horário de retomada marcado para hoje."
          emptyMessage="Nenhum retorno combinado para hoje."
          items={priorities.returnToday.map(({ lead, helper }) => ({
            leadId: lead.id,
            name: lead.name,
            badge: lead.status,
            helper: formatDateTime(helper),
          }))}
        />
        <PriorityPanel
          title="Pasta pronta para subir"
          description="Leads que já podem ter os documentos enviados para a imobiliária."
          emptyMessage="Nenhuma pasta pronta para análise neste momento."
          items={priorities.readyForAnalysis.map(({ lead, helper }) => ({
            leadId: lead.id,
            name: lead.name,
            badge: lead.status,
            helper,
          }))}
        />
        <PriorityPanel
          title="Análise condicionada"
          description="Casos que precisam de complemento ou retorno rápido ao cliente."
          emptyMessage="Nenhuma análise condicionada aguardando ação."
          items={priorities.conditionedAnalysis.map(({ lead, helper }) => ({
            leadId: lead.id,
            name: lead.name,
            badge: lead.analysis_eligibility || lead.status,
            helper,
          }))}
        />
        <PriorityPanel
          title="Visitas de hoje"
          description="Visitas já marcadas para acompanhar e confirmar no momento certo."
          emptyMessage="Nenhuma visita agendada para hoje."
          items={priorities.visitsToday.map(({ lead, helper }) => ({
            leadId: lead.id,
            name: lead.name,
            badge: lead.visit_type
              ? visitTypeLabels[lead.visit_type as keyof typeof visitTypeLabels]
              : lead.status,
            helper: `${formatDateTime(helper)}${
              lead.approved_financing_amount
                ? ` · ${formatCurrency(lead.approved_financing_amount)}`
                : ""
            }`,
          }))}
        />
      </section>

      <Card className="rounded-[1.75rem]">
        <CollapsibleSection
          title="Ações urgentes"
          description="Tarefas abertas geradas manualmente ou pelo motor de automação."
          defaultOpen={false}
          contentClassName="mt-5"
        >
          <div className="mb-4 flex items-center justify-end">
            <Link href="/tasks" className="text-sm font-semibold text-primary">
              Abrir todas
            </Link>
          </div>

          <div className="space-y-3">
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
        </CollapsibleSection>
      </Card>
    </div>
  );
}

function PriorityPanel({
  title,
  description,
  emptyMessage,
  items,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  items: Array<{
    leadId: string;
    name: string;
    badge: string;
    helper: string;
  }>;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CollapsibleSection
        title={title}
        description={description}
        defaultOpen={false}
        contentClassName="mt-5"
      >
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={`${item.leadId}-${item.badge}`}
              href={`/leads/${item.leadId}`}
              className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border bg-surface-low px-4 py-4 transition-colors hover:bg-accent/30"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.helper}</p>
              </div>
              <Badge>{item.badge}</Badge>
            </Link>
          ))}

          {items.length === 0 ? (
            <p className="rounded-[1.2rem] border border-border bg-surface-low px-4 py-6 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : null}
        </div>
      </CollapsibleSection>
    </Card>
  );
}
