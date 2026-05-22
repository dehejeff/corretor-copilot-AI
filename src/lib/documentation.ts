import type { DocumentationChecklistItem } from "@/lib/types";

export const documentationChecklistTemplate: DocumentationChecklistItem[] = [
  {
    key: "rg_cpf",
    label: "RG e CPF",
    status: "Pendente",
    notes: "",
  },
  {
    key: "estado_civil",
    label: "Comprovante de estado civil",
    status: "Pendente",
    notes: "",
  },
  {
    key: "comprovante_renda",
    label: "Comprovante de renda",
    status: "Pendente",
    notes: "",
  },
  {
    key: "comprovante_residencia",
    label: "Comprovante de residencia",
    status: "Pendente",
    notes: "",
  },
  {
    key: "fgts",
    label: "Extrato ou documento de FGTS",
    status: "Pendente",
    notes: "",
  },
  {
    key: "entrada",
    label: "Comprovacao da entrada ou reserva",
    status: "Pendente",
    notes: "",
  },
  {
    key: "analise_complementar",
    label: "Documentos complementares para analise",
    status: "Pendente",
    notes: "",
  },
] as const;

export function normalizeDocumentationChecklist(
  value: DocumentationChecklistItem[] | null | undefined,
) {
  const existing = new Map((value ?? []).map((item) => [item.key, item]));

  return documentationChecklistTemplate.map((item) => {
    const saved = existing.get(item.key);

    return {
      ...item,
      status: saved?.status ?? item.status,
      notes: saved?.notes ?? item.notes,
    };
  });
}

export function getDocumentationChecklistSummary(
  checklist: DocumentationChecklistItem[] | null | undefined,
) {
  const normalized = normalizeDocumentationChecklist(checklist);

  const received = normalized.filter((item) => item.status === "Recebido").length;
  const pending = normalized.filter((item) => item.status === "Pendente").length;
  const ignored = normalized.filter((item) => item.status === "Nao se aplica").length;

  return {
    total: normalized.length,
    received,
    pending,
    ignored,
  };
}

export function getPendingDocumentationItems(
  checklist: DocumentationChecklistItem[] | null | undefined,
) {
  return normalizeDocumentationChecklist(checklist).filter((item) => item.status === "Pendente");
}

export function isDocumentationReadyForAnalysis(
  checklist: DocumentationChecklistItem[] | null | undefined,
) {
  return getPendingDocumentationItems(checklist).length === 0;
}
