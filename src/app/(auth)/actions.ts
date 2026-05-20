"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/validations";

export async function loginAction(formData: FormData) {
  const values = authSchema.pick({ email: true, password: true }).parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(values);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const values = authSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    companyName: formData.get("companyName"),
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
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
    throw new Error(error.message);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
