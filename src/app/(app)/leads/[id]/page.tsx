import { deleteLeadAction, updateDocumentationChecklistAction, updateLeadAction } from "@/app/(app)/actions";
import { CollapsibleSection } from "@/components/collapsible-section";
import { DocumentationChecklistCard } from "@/components/documentation-checklist-card";
import { LeadDetailExperience } from "@/components/lead-detail-experience";
import { LeadForm } from "@/components/lead-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ensureProfile, requireUser } from "@/lib/auth";
import { getConversationThread, getWhatsAppConfigStatus } from "@/lib/conversations";
import { getLeadById } from "@/lib/leads";

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { notice } = await searchParams;
  const [{ lead, interactions, nextAction }, profile, thread] = await Promise.all([
    getLeadById(user.id, id),
    ensureProfile(user),
    getConversationThread(user.id, id),
  ]);

  return (
    <div className="space-y-6">
      {notice ? (
        <Card className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          {notice}
        </Card>
      ) : null}

      <LeadDetailExperience
        lead={lead}
        profile={profile}
        interactions={interactions}
        nextAction={nextAction}
        conversation={thread.conversation}
        conversationMessages={thread.messages}
        conversationSuggestions={thread.suggestions}
        whatsappConfigured={getWhatsAppConfigStatus().ok}
        dataTabSections={
          <>
            <Card className="rounded-[1.75rem]">
              <CollapsibleSection
                title="Editar lead"
                description="Atualize dados, score e situação comercial sem sair da página."
                defaultOpen={false}
                contentClassName="mt-6"
              >
                <LeadForm
                  action={updateLeadAction.bind(null, lead.id)}
                  submitLabel="Atualizar lead"
                  initialLead={lead}
                />
              </CollapsibleSection>
            </Card>

            <DocumentationChecklistCard
              lead={lead}
              action={updateDocumentationChecklistAction.bind(null, lead.id)}
            />

            <Card className="rounded-[1.75rem]">
              <CollapsibleSection
                title="Ações rápidas"
                description="Exclua o lead somente quando tiver certeza de que ele não deve mais permanecer na sua base."
                defaultOpen={false}
                contentClassName="mt-6"
              >
                <form action={deleteLeadAction}>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <Button type="submit" variant="danger">
                    Excluir lead
                  </Button>
                </form>
              </CollapsibleSection>
            </Card>
          </>
        }
      />
    </div>
  );
}
