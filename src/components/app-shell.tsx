import Link from "next/link";
import { Building2, ChartColumnBig, ClipboardList, LogOut, Plus, Upload, Workflow } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { logoutAction } from "@/app/(auth)/actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: ChartColumnBig },
  { href: "/leads", label: "Leads", icon: Building2 },
  { href: "/import", label: "Importar", icon: Upload },
  { href: "/tasks", label: "Tarefas do dia", icon: ClipboardList },
  { href: "/kanban", label: "Kanban", icon: Workflow },
];

export function AppShell({
  children,
  profileName,
}: {
  children: React.ReactNode;
  profileName: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[240px_1fr] lg:px-6">
        <aside className="glass rounded-[2rem] border border-white/80 p-4 shadow-[var(--shadow)]">
          <div className="rounded-[1.6rem] bg-slate-950 p-5 text-slate-50">
            <p className="text-xs tracking-[0.24em] text-teal-200 uppercase">{APP_NAME}</p>
            <p className="mt-3 text-2xl font-semibold">CRM do corretor</p>
            <p className="mt-2 text-sm text-slate-300">
              Leads, automações e WhatsApp no mesmo fluxo.
            </p>
          </div>

          <Link
            href="/leads/new"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Novo lead
          </Link>

          <nav className="mt-6 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-white hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.6rem] border border-border bg-white p-4">
            <p className="text-sm font-semibold">{profileName}</p>
            <p className="mt-1 text-xs text-muted-foreground">Conta autenticada via Supabase</p>
            <form action={logoutAction} className="mt-4">
              <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
