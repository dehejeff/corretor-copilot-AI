import Link from "next/link";
import { signupAction } from "@/app/(auth)/actions";
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
    <main className="bg-grid flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg p-8">
        <h1 className="text-3xl font-semibold">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure sua base e comece a operar seus leads com IA.
        </p>
        {params.error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}
        <form action={signupAction} className="mt-8 grid gap-4 md:grid-cols-2">
          <Input name="name" placeholder="Seu nome" required />
          <Input name="companyName" placeholder="Imobiliaria ou equipe" />
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
          Ja possui acesso?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </Card>
    </main>
  );
}
