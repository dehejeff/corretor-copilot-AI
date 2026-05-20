import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
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
    <main className="bg-grid flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse seus leads, tarefas e pipeline comercial.
        </p>
        {params.error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}
        {params.message ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
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
    </main>
  );
}
