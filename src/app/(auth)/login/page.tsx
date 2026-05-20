import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import { APP_NAME } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[var(--shadow)]">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-teal-200 uppercase">
            {APP_NAME}
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight">Entre e retome seus leads com contexto.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Um CRM pensado para corretor: pipeline, mensagens, tarefas, ligação guiada e acompanhamento pelo WhatsApp.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Score e temperatura automáticos",
              "Sugestões de mensagens por categoria",
              "Guia de ligação para qualificação",
            ].map((item) => (
              <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <Card className="w-full rounded-[1.75rem] p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">Entrar</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Acesse sua operação</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse seus leads, tarefas e pipeline comercial.
            </p>
            {params.error ? (
              <div className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {params.error}
              </div>
            ) : null}
            {params.message ? (
              <div className="mt-5 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {params.message}
              </div>
            ) : null}
            <form action={loginAction} className="mt-8 space-y-4">
              <Input name="email" type="email" placeholder="seu@email.com" required />
              <Input name="password" type="password" placeholder="Sua senha" required />
              <SubmitButton className="w-full" pendingText="Entrando...">
                Entrar na plataforma
              </SubmitButton>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link href="/signup" className="font-semibold text-primary">
                Criar agora
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
