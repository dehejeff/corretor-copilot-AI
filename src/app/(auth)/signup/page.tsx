import Link from "next/link";
import { signupAction } from "@/app/(auth)/actions";
import { APP_NAME } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[var(--shadow)]">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-teal-200 uppercase">
            {APP_NAME}
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight">Crie sua operação comercial.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Configure sua conta, centralize leads e comece a responder com mais velocidade e consistência.
          </p>
        </div>

        <div className="flex items-center">
          <Card className="w-full rounded-[1.75rem] p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
              Criar conta
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Comece seu CRM com IA</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure sua base e comece a operar seus leads com IA.
            </p>
            {params.error ? (
              <div className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {params.error}
              </div>
            ) : null}
            <form action={signupAction} className="mt-8 grid gap-4 md:grid-cols-2">
              <Input name="name" placeholder="Seu nome" required />
              <Input name="companyName" placeholder="Imobiliária ou equipe" />
              <Input name="phone" placeholder="WhatsApp" />
              <Input name="email" type="email" placeholder="seu@email.com" required />
              <div className="md:col-span-2">
                <Input name="password" type="password" placeholder="Crie uma senha" required />
              </div>
              <div className="md:col-span-2">
                <SubmitButton className="w-full" pendingText="Criando conta...">
                  Criar conta
                </SubmitButton>
              </div>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
              Já possui acesso?{" "}
              <Link href="/login" className="font-semibold text-primary">
                Entrar
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
