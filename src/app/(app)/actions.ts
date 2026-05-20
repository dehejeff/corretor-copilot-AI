"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { requireUser } from "@/lib/auth";
import { buildImportLead, createLead, markTaskAsDone, recordInteraction, updateLead, updateLeadStatus } from "@/lib/leads";
import { leadSchema, completeTaskSchema, updateLeadStatusSchema } from "@/lib/validations";
import type { LeadStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function createLeadAction(formData: FormData) {
  const user = await requireUser();
  const values = leadSchema.parse(Object.fromEntries(formData.entries()));
  await createLead(user.id, values);
  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath("/kanban");
  redirect("/leads");
}

export async function updateLeadAction(leadId: string, formData: FormData) {
  const user = await requireUser();
  const values = leadSchema.parse(Object.fromEntries(formData.entries()));
  await updateLead(user.id, leadId, values);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath("/kanban");
}

export async function deleteLeadAction(formData: FormData) {
  const user = await requireUser();
  const leadId = String(formData.get("leadId"));
  const supabase = await createClient();

  const { error } = await supabase.from("leads").delete().eq("id", leadId).eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath("/kanban");
  redirect("/leads");
}

export async function importLeadsAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Selecione um arquivo CSV ou Excel.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  for (const row of rows) {
    const lead = buildImportLead(row);
    await createLead(user.id, lead);
  }

  revalidatePath("/dashboard");
  revalidatePath("/leads");
  redirect("/leads");
}

export async function markTaskAsDoneAction(formData: FormData) {
  const user = await requireUser();
  const values = completeTaskSchema.parse({
    taskId: formData.get("taskId"),
  });

  await markTaskAsDone(user.id, values.taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function recordManualSentAction(formData: FormData) {
  const user = await requireUser();
  await recordInteraction({
    userId: user.id,
    leadId: String(formData.get("leadId")),
    type: String(formData.get("type")),
    message: String(formData.get("message")),
    status: "enviada manualmente",
  });
  revalidatePath(`/leads/${String(formData.get("leadId"))}`);
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  const user = await requireUser();
  const values = updateLeadStatusSchema.parse({
    leadId,
    status,
  });

  await updateLeadStatus(user.id, values.leadId, values.status);
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath(`/leads/${leadId}`);
}
