import { createLeadAction } from "@/app/(app)/actions";
import { LeadForm } from "@/components/lead-form";
import { Card } from "@/components/ui/card";

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Novo lead</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre um lead manualmente e deixe o score ser calculado no backend.
        </p>
      </div>

      <Card>
        <LeadForm action={createLeadAction} submitLabel="Salvar lead" />
      </Card>
    </div>
  );
}
