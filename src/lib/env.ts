function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${name}`);
  }

  return value;
}

export const env = {
  supabaseUrl: () => getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  openAIApiKey: () => getRequiredEnv("OPENAI_API_KEY"),
  cronSecret: () => getRequiredEnv("CRON_SECRET"),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
