import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateLeadStatus } from "@/lib/leads";
import { getErrorMessage } from "@/lib/utils";
import { updateLeadStatusSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = updateLeadStatusSchema.parse({
      leadId: id,
      status: body.status,
      visit_type: body.visit_type,
    });

    await updateLeadStatus(user.id, values.leadId, values.status, values.visit_type);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
