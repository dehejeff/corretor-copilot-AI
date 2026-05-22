import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { saveLeadCall } from "@/lib/calls";
import { getLeadById } from "@/lib/leads";
import { getErrorMessage } from "@/lib/utils";
import { saveCallSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const values = saveCallSchema.parse(await request.json());
    const { lead } = await getLeadById(user.id, id);

    await saveLeadCall({
      userId: user.id,
      lead,
      payload: values,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      const callResultIssue = error.issues.find((issue) => issue.path.join(".") === "callResult");

      if (callResultIssue) {
        return NextResponse.json(
          { error: "Selecione um resultado válido da ligação antes de salvar." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
