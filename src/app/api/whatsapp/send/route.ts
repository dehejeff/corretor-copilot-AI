import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLeadById } from "@/lib/leads";
import { sendWhatsAppMessage } from "@/lib/conversations";
import { getErrorMessage } from "@/lib/utils";
import { sendConversationMessageSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const values = sendConversationMessageSchema.parse(await request.json());
    const { lead } = await getLeadById(user.id, values.leadId);
    const message = await sendWhatsAppMessage({
      userId: user.id,
      lead,
      message: values.message,
    });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
