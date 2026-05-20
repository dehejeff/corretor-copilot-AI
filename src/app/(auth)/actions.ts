"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/validations";

function buildAuthRedirect(path: "/login" | "/signup", key: "error" | "message", value: string) {
  const params = new URLSearchParams({
    [key]: value,
  });

  return `${path}?${params.toString()}`;
}

function getFriendlyAuthMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "Seu e-mail ainda nao foi confirmado. Verifique sua caixa de entrada antes de entrar.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha invalidos.";
  }

  if (normalized.includes("user already registered")) {
    return "Este e-mail ja esta cadastrado. Tente entrar na plataforma.";
  }

  return "Nao foi possivel concluir a autenticacao agora. Tente novamente.";
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.pick({ email: true, password: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(buildAuthRedirect("/login", "error", "Preencha e-mail e senha corretamente."));
  }

  const values = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(values);

  if (error) {
    redirect(buildAuthRedirect("/login", "error", getFriendlyAuthMessage(error.message)));
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    companyName: formData.get("companyName"),
  });

  if (!parsed.success) {
    redirect(buildAuthRedirect("/signup", "error", "Confira os dados do cadastro e tente novamente."));
  }

  const values = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        name: values.name,
        phone: values.phone,
        company_name: values.companyName,
      },
    },
  });

  if (error) {
    redirect(buildAuthRedirect("/signup", "error", getFriendlyAuthMessage(error.message)));
  }

  if (!data.session) {
    redirect(
      buildAuthRedirect(
        "/login",
        "message",
        "Cadastro realizado. Agora confirme seu e-mail no link enviado pelo Supabase antes de entrar.",
      ),
    );
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
