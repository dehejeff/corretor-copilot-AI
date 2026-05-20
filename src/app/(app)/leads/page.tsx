import Link from "next/link";
import { MessageCircle, PhoneCall } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getLeads } from "@/lib/leads";
import { buildWhatsappUrl, formatPhone, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function LeadsPage() {
  const user = await requireUser();
  const leads = await getLeads(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">Leads</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Base comercial</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua base completa com score, classificação e próximo passo.
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          Cadastrar lead
        </Link>
      </div>

      <div className="grid gap-3">
        {leads.map((lead) => (
          <Card key={lead.id} className="rounded-[1.4rem] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold">{lead.name}</h2>
                  <Badge
                    tone={
                      lead.temperature === "Quente"
                        ? "hot"
                        : lead.temperature === "Morno"
                          ? "warm"
                          : "cold"
                    }
                  >
                    {lead.temperature}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lead.neighborhood || "Bairro não informado"} · {lead.source}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPhone(lead.phone) || "Telefone não informado"}
                </p>
              </div>
              <div className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                {lead.score} pts
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-[1rem] bg-surface-low p-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Status</p>
                <p className="mt-1 font-medium">{lead.status}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Último contato
                </p>
                <p className="mt-1 font-medium">{formatRelativeDate(lead.last_contact_at)}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Pipeline</p>
                <p className="mt-1 font-medium">{lead.property_type || "Não informado"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={lead.phone ? `tel:${lead.phone}` : undefined}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                <PhoneCall className="h-4 w-4" />
                Ligar
              </a>
              <a
                href={buildWhatsappUrl(lead.phone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Link
                href={`/leads/${lead.id}`}
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Ver detalhes
              </Link>
            </div>
          </Card>
        ))}

        {leads.length === 0 ? (
          <Card className="rounded-[1.4rem] border-dashed text-sm text-muted-foreground">
            Nenhum lead cadastrado ainda. Cadastre manualmente ou importe uma base para começar.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
