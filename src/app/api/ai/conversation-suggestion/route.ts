import { NextResponse } from "next/server";
import { ensureProfile, getCurrentUser } from "@/lib/auth";
import {
  ensureConversationForLead,
  generateConversationSuggestion,
  getConversationThread,
  saveConversationSuggestion,
} from "@/lib/conversations";
import { getLeadById } from "@/lib/leads";
import { getErrorMessage } from "@/lib/utils";
import { conversationSuggestionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const values = conversationSuggestionSchema.parse(await request.json());
    const [{ lead }, profile, thread] = await Promise.all([
      getLeadById(user.id, values.leadId),
      ensureProfile(user),
      getConversationThread(user.id, values.leadId),
    ]);

    const conversation =
      thread.conversation ?? (await ensureConversationForLead(user.id, values.leadId));

    const result = await generateConversationSuggestion({
      userId: user.id,
      lead,
      profile,
      conversation,
      messages: thread.messages,
      goal: values.goal,
      draftInstruction: values.draftInstruction,
    });

    await saveConversationSuggestion({
      userId: user.id,
      leadId: lead.id,
      conversationId: conversation.id,
      goal: values.goal,
      inputContext: values.draftInstruction,
      suggestedMessage: result.suggestedReply,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
