import { deleteLeadAction, updateLeadAction } from "@/app/(app)/actions";
import { LeadForm } from "@/components/lead-form";
import { MessageGenerator } from "@/components/message-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getLeadById } from "@/lib/leads";
import { buildWhatsappUrl, formatCurrency, formatRelativeDate } from "@/lib/utils";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { lead, interactions, nextAction } = await getLeadById(user.id, id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">{lead.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {lead.phone || "Telefone nao informado"} · {lead.email || "E-mail nao informado"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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
              <Badge>{lead.status}</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Origem" value={lead.source} />
            <Info label="Bairro" value={lead.neighborhood} />
            <Info label="Tipo de imovel" value={lead.property_type} />
            <Info label="Faixa de preco" value={lead.price_range} />
            <Info label="Entrada" value={formatCurrency(lead.down_payment)} />
            <Info label="Renda" value={lead.income_range} />
            <Info label="Prazo" value={lead.purchase_timeline} />
            <Info label="Ultimo contato" value={formatRelativeDate(lead.last_contact_at)} />
          </div>

          <div className="rounded-[1.6rem] border border-border bg-muted/50 p-4">
            <p className="text-sm font-semibold">Proxima acao recomendada</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextAction}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsappUrl(lead.phone)}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold"
            >
              Abrir conversa no WhatsApp
            </a>
            <form action={deleteLeadAction}>
              <input type="hidden" name="leadId" value={lead.id} />
              <Button type="submit" variant="danger">
                Excluir lead
              </Button>
            </form>
          </div>
        </Card>

        <MessageGenerator lead={lead} />
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Editar lead</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize dados, score e situacao comercial sem sair da pagina.
        </p>
        <div className="mt-6">
          <LeadForm
            action={updateLeadAction.bind(null, lead.id)}
            submitLabel="Atualizar lead"
            initialLead={lead}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Historico de interacoes</h2>
        <div className="mt-5 space-y-3">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{interaction.type}</p>
                <Badge>{interaction.status}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{interaction.message}</p>
              <p className="mt-3 text-xs text-muted-foreground">{formatRelativeDate(interaction.created_at)}</p>
            </div>
          ))}
          {interactions.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
              Ainda nao ha interacoes registradas para este lead.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-sm font-medium">{value || "Nao informado"}</p>
    </div>
  );
}
