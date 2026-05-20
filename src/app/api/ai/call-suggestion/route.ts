import { NextResponse } from "next/server";
import { ensureProfile, getCurrentUser } from "@/lib/auth";
import { generateCallSuggestion } from "@/lib/calls";
import { getLeadById } from "@/lib/leads";
import { getErrorMessage } from "@/lib/utils";
import { callSuggestionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const values = callSuggestionSchema.parse(await request.json());
    const [{ lead }, profile] = await Promise.all([
      getLeadById(user.id, values.leadId),
      ensureProfile(user),
    ]);

    const suggestedPhrase = await generateCallSuggestion({
      lead,
      profile,
      currentStep: values.currentStep,
      callNotes: values.callNotes,
      objectionSelected: values.objectionSelected,
      goal: values.goal,
    });

    return NextResponse.json({ suggestedPhrase });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
