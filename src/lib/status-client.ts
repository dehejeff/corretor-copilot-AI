export async function updateLeadStatusApi(
  leadId: string,
  status: string,
  visitType?: "Escritório" | "Empreendimento" | "",
) {
  const response = await fetch(`/api/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, visit_type: visitType }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Não foi possível atualizar o status do lead.");
  }

  return (await response.json()) as {
    ok: boolean;
    status: string;
    visit_type?: "Escritório" | "Empreendimento" | null;
    notice?: string | null;
  };
}
