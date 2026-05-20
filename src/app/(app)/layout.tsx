import { ensureProfile, requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  return <AppShell profileName={profile.name || profile.email}>{children}</AppShell>;
}
