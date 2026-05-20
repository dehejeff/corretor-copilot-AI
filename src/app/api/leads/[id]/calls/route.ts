import { NextResponse } from "next/server";
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
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
