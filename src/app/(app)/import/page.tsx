import { importLeadsAction } from "@/app/(app)/actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">Importação</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Importar leads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Envie um arquivo Excel ou CSV com colunas como nome, telefone, email, origem, bairro, tipo_imovel, faixa_preco e observacoes.
        </p>
      </div>

      <Card className="rounded-[1.5rem]">
        <form action={importLeadsAction} className="space-y-5">
          <div className="rounded-[1.25rem] border border-border bg-surface-low p-4 text-sm text-muted-foreground">
            Campos esperados: <strong>nome</strong>, <strong>telefone</strong>, <strong>email</strong>, <strong>origem</strong>, <strong>bairro</strong>, <strong>tipo_imovel</strong>, <strong>faixa_preco</strong> e <strong>observacoes</strong>.
          </div>
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            className="w-full rounded-[1.25rem] border border-dashed border-border bg-surface-low px-4 py-8 text-sm"
            required
          />
          <SubmitButton pendingText="Importando...">Importar arquivo</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
