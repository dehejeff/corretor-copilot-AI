import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
