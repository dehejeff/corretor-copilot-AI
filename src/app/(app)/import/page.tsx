import { importLeadsAction } from "@/app/(app)/actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Importar leads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Envie um arquivo Excel ou CSV com colunas como nome, telefone, email, origem, bairro, tipo_imovel, faixa_preco e observacoes.
        </p>
      </div>

      <Card>
        <form action={importLeadsAction} className="space-y-5">
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            className="w-full rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-sm"
            required
          />
          <SubmitButton pendingText="Importando...">Importar arquivo</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
