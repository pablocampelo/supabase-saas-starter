import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

const webhookSecret = "whsec_test_fixture_abcdefghijklmnopqrstuvwxyz";
const processStripeEvent = vi.fn(async () => "ignored" as const);

vi.mock("@/lib/env/server", () => ({
  getServerEnv: () => ({ STRIPE_WEBHOOK_SECRET: webhookSecret }),
}));

vi.mock("@/lib/billing/stripe", async () => {
  const { default: StripeClient } = await import("stripe");
  const stripe = new StripeClient("sk_test_fixture_abcdefghijklmnopqrstuvwxyz");
  return { getStripe: () => stripe };
});

vi.mock("@/lib/billing/webhook", () => ({
  processStripeEvent,
}));

const now = Math.floor(Date.now() / 1000);

const payload = JSON.stringify({
  id: "evt_signature_test",
  object: "event",
  api_version: "2026-09-30.clover",
  created: now,
  data: { object: {} },
  livemode: false,
  pending_webhooks: 1,
  request: { id: null, idempotency_key: null },
  type: "charge.refunded",
});

describe("Stripe webhook HTTP boundary", () => {
  it("accepts a valid Stripe signature before dispatching the event", async () => {
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
      timestamp: now,
    });
    const { POST } = await import("@/app/api/stripe/webhook/route");

    const response = await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: payload,
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, result: "ignored" });
    expect(processStripeEvent).toHaveBeenCalledOnce();
  });

  it("rejects an invalid Stripe signature without dispatching", async () => {
    processStripeEvent.mockClear();
    const { POST } = await import("@/app/api/stripe/webhook/route");

    const response = await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": `t=${now},v1=invalid` },
      body: payload,
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_signature" });
    expect(processStripeEvent).not.toHaveBeenCalled();
  });
});
