import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
  return (
    <main className="bg-grid flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse seus leads, tarefas e pipeline comercial.
        </p>
        <form action={loginAction} className="mt-8 space-y-4">
          <Input name="email" type="email" placeholder="seu@email.com" required />
          <Input name="password" type="password" placeholder="Sua senha" required />
          <SubmitButton className="w-full" pendingText="Entrando...">
            Entrar na plataforma
          </SubmitButton>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Ainda nao tem conta?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Criar agora
          </Link>
        </p>
      </Card>
    </main>
  );
}
