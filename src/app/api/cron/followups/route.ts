import { NextResponse } from "next/server";
import { runFollowupCron } from "@/lib/automation";
import { env } from "@/lib/env";
import { getErrorMessage } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = authHeader?.replace("Bearer ", "") || new URL(request.url).searchParams.get("secret");

    if (secret !== env.cronSecret()) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
    }

    const result = await runFollowupCron();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
