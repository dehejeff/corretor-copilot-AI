import type { Lead, Profile } from "@/lib/types";

function firstName(value?: string | null) {
  return value?.trim().split(" ")[0] || "";
}

export function buildCallContext(lead: Lead, profile: Profile) {
  return {
    "[Nome do lead]": firstName(lead.name) || lead.name,
    "[Nome do corretor]": firstName(profile.name || profile.email) || "consultor",
    "[Região]": lead.neighborhood || profile.company_name || "sua região",
    "[Bairro]": lead.neighborhood || "sua região",
    "[Tipo de imóvel]": lead.property_type || "imóvel",
  };
}

export function replaceCallPlaceholders(text: string, lead: Lead, profile: Profile) {
  const context = buildCallContext(lead, profile);

  return Object.entries(context).reduce(
    (result, [key, value]) => result.replaceAll(key, value),
    text,
  );
}
