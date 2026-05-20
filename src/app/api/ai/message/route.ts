import { NextResponse } from "next/server";
import { generateLeadMessage } from "@/lib/ai";
import { ensureProfile, getCurrentUser } from "@/lib/auth";
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
    const profile = await ensureProfile(user);
    const result = await generateLeadMessage(lead, profile, values.messageType);

    await recordInteraction({
      userId: user.id,
      leadId: lead.id,
      type: values.messageType,
      message: result.message,
      status: result.provider === "openai" ? "gerada" : "gerada via fallback",
    });

    return NextResponse.json({
      message: result.message,
      options: result.options,
      provider: result.provider,
      fallbackReason: result.fallbackReason,
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
