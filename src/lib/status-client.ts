export async function updateLeadStatusApi(leadId: string, status: string) {
  const response = await fetch(`/api/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Não foi possível atualizar o status do lead.");
  }
}
