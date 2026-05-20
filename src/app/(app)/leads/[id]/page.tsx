import { deleteLeadAction, updateLeadAction } from "@/app/(app)/actions";
import { LeadDetailExperience } from "@/components/lead-detail-experience";
import { LeadForm } from "@/components/lead-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ensureProfile, requireUser } from "@/lib/auth";
import { getConversationThread, getWhatsAppConfigStatus } from "@/lib/conversations";
import { getLeadById } from "@/lib/leads";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [{ lead, interactions, nextAction }, profile, thread] = await Promise.all([
    getLeadById(user.id, id),
    ensureProfile(user),
    getConversationThread(user.id, id),
  ]);

  return (
    <div className="space-y-6">
      <LeadDetailExperience
        lead={lead}
        profile={profile}
        interactions={interactions}
        nextAction={nextAction}
        conversation={thread.conversation}
        conversationMessages={thread.messages}
        conversationSuggestions={thread.suggestions}
        whatsappConfigured={getWhatsAppConfigStatus().ok}
      />

      <Card className="rounded-[1.75rem]">
        <h2 className="text-2xl font-bold tracking-tight">Editar lead</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize dados, score e situação comercial sem sair da página.
        </p>
        <div className="mt-6">
          <LeadForm
            action={updateLeadAction.bind(null, lead.id)}
            submitLabel="Atualizar lead"
            initialLead={lead}
          />
        </div>
      </Card>

      <Card className="rounded-[1.75rem]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ações rápidas</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Exclua o lead somente quando tiver certeza de que ele não deve mais permanecer na sua base.
            </p>
          </div>
          <form action={deleteLeadAction}>
            <input type="hidden" name="leadId" value={lead.id} />
            <Button type="submit" variant="danger">
              Excluir lead
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
