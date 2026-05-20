export async function updateLeadStatusApi(leadId: string, status: string) {
  await fetch(`/api/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}
