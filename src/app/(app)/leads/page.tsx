import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getLeads } from "@/lib/leads";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function LeadsPage() {
  const user = await requireUser();
  const leads = await getLeads(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Leads</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua base completa com score, classificacao e proximo passo.
          </p>
        </div>
        <Link href="/leads/new" className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          Cadastrar lead
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Lead</th>
                <th className="px-5 py-4">Origem</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Temperatura</th>
                <th className="px-5 py-4">Ultimo contato</th>
                <th className="px-5 py-4">Acao</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{lead.name}</p>
                    <p className="mt-1 text-muted-foreground">{lead.neighborhood || "Bairro nao informado"}</p>
                  </td>
                  <td className="px-5 py-4">{lead.source}</td>
                  <td className="px-5 py-4">{lead.status}</td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={
                        lead.temperature === "Quente"
                          ? "hot"
                          : lead.temperature === "Morno"
                            ? "warm"
                            : "cold"
                      }
                    >
                      {lead.temperature} · {lead.score}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">{formatRelativeDate(lead.last_contact_at)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/leads/${lead.id}`} className="font-semibold text-primary">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
