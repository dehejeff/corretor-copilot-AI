import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BrainCircuit, KanbanSquare, MessageCircleMore, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-grid min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="glass flex items-center justify-between rounded-full border border-white/60 px-5 py-3 shadow-[var(--shadow)]">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
              {APP_NAME}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:-translate-y-0.5"
            >
              Criar conta
            </Link>
          </div>
        </header>

        <div className="relative flex flex-1 flex-col justify-center py-16 lg:py-24">
          <div className="absolute inset-x-0 top-16 -z-10 h-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,118,110,0.20),_transparent_65%)] blur-3xl" />
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-sm text-primary shadow-sm">
                CRM com IA, scoring e follow-up por codigo
              </span>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Transforme leads imobiliarios em compradores reais pelo WhatsApp.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Uma plataforma mobile-first para corretores organizarem leads, priorizarem oportunidades e agir com contexto, rapidez e consistencia.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[var(--shadow)] hover:-translate-y-0.5"
                >
                  Comecar o MVP
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 font-semibold text-foreground hover:bg-accent"
                >
                  Acessar plataforma
                </Link>
              </div>
            </div>

            <div className="glass rounded-[2rem] border border-white/70 p-5 shadow-[var(--shadow)]">
              <div className="rounded-[1.6rem] bg-slate-950 p-5 text-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs tracking-[0.28em] text-teal-200 uppercase">Hoje</p>
                    <h2 className="mt-2 text-2xl font-semibold">Tarefas do corretor</h2>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-teal-100">
                    4 automações
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    "Lead quente sem retorno desde ontem",
                    "Follow-up D+3 pronto para envio",
                    "Visita agendada precisa de lembrete",
                    "IA sugeriu resposta para objeção de preço",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: BrainCircuit,
                title: "Scoring inteligente",
                text: "Classificação automática com foco em velocidade de compra e intenção real.",
              },
              {
                icon: MessageCircleMore,
                title: "WhatsApp pronto",
                text: "Gere mensagens consultivas com IA e abra o wa.me com o texto completo.",
              },
              {
                icon: KanbanSquare,
                title: "Pipeline visual",
                text: "Kanban simples para mover oportunidades do primeiro contato ao fechamento.",
              },
              {
                icon: ShieldCheck,
                title: "Seguro por usuario",
                text: "Cada corretor enxerga apenas os proprios leads com base em RLS no Supabase.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[var(--shadow)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
