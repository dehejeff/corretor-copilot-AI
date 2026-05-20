import { NextResponse } from "next/server";
import { generateLeadMessage } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { getLeadById, recordInteraction } from "@/lib/leads";
import { getErrorMessage } from "@/lib/utils";
import { generateMessageSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const values = generateMessageSchema.parse(await request.json());
    const { lead } = await getLeadById(user.id, values.leadId);
    const message = await generateLeadMessage(lead, values.messageType);

    await recordInteraction({
      userId: user.id,
      leadId: lead.id,
      type: values.messageType,
      message,
      status: "gerada",
    });

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
