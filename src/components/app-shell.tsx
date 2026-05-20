"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChartColumnBig,
  ClipboardList,
  LogOut,
  Plus,
  Upload,
  Workflow,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Início", icon: ChartColumnBig },
  { href: "/leads", label: "Leads", mobileLabel: "Leads", icon: Building2 },
  { href: "/import", label: "Importar", mobileLabel: "Importar", icon: Upload },
  { href: "/tasks", label: "Tarefas do dia", mobileLabel: "Tarefas", icon: ClipboardList },
  { href: "/kanban", label: "Kanban", mobileLabel: "Pipeline", icon: Workflow },
];

export function AppShell({
  children,
  profileName,
}: {
  children: React.ReactNode;
  profileName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ChartColumnBig className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
                {APP_NAME}
              </p>
              <p className="text-sm font-semibold text-foreground">CRM do corretor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground sm:block">
              {profileName}
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 px-4 pb-24 pt-5 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:px-8 lg:pb-8">
        <aside className="hidden lg:block">
          <div className="sticky top-21 space-y-4">
            <div className="rounded-[1.75rem] bg-slate-950 p-6 text-slate-50 shadow-[var(--shadow)]">
              <p className="text-[11px] tracking-[0.28em] text-teal-200 uppercase">{APP_NAME}</p>
              <p className="mt-3 text-[2rem] font-bold leading-9">CRM do corretor</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Leads, automações, IA e WhatsApp no mesmo fluxo.
              </p>
            </div>

            <div className="surface-card rounded-[1.5rem] border border-border/90 p-3 shadow-[var(--shadow-soft)]">
              <Link
                href="/leads/new"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Novo lead
              </Link>

              <nav className="mt-3 space-y-1.5">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="surface-card rounded-[1.5rem] border border-border/90 p-4 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold">{profileName}</p>
              <p className="mt-1 text-xs text-muted-foreground">Conta autenticada via Supabase</p>
              <form action={logoutAction} className="mt-4">
                <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map(({ href, mobileLabel, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
