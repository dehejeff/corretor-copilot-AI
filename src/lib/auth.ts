import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function ensureProfile(user: User): Promise<Profile> {
  const supabase = await createClient();

  const payload = {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name ?? null,
    phone: user.user_metadata?.phone ?? null,
    company_name: user.user_metadata?.company_name ?? null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Nao foi possivel sincronizar o perfil: ${error.message}`);
  }

  return data as Profile;
}
