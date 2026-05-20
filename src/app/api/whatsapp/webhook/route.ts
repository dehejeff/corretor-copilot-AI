import { NextResponse } from "next/server";
import {
  processWhatsAppWebhook,
  verifyWhatsAppWebhookSignature,
} from "@/lib/conversations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(challenge || "ok", { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const isValid = await verifyWhatsAppWebhookSignature(rawBody, signature);

    if (process.env.WHATSAPP_APP_SECRET && !isValid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    await processWhatsAppWebhook(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook processing failed.", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 400 });
  }
}
