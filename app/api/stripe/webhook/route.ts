import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env/server";
import { getStripe } from "@/lib/billing/stripe";
import { processStripeEvent } from "@/lib/billing/webhook";

export const runtime = "nodejs";

const MAX_WEBHOOK_BYTES = 64 * 1024;

async function readRawBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > MAX_WEBHOOK_BYTES) {
      await reader.cancel();
      throw new Error("WEBHOOK_PAYLOAD_TOO_LARGE");
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getServerEnv().STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 400 });
  }

  let payload: Buffer;
  try {
    payload = await readRawBody(request);
  } catch {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    const result = await processStripeEvent(event);
    return NextResponse.json({ received: true, result });
  } catch {
    return NextResponse.json(
      { error: "processing_failed", reference: event.id },
      { status: 500 },
    );
  }
}
