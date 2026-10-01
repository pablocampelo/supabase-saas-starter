import { describe, expect, it } from "vitest";
import { applyPaidInvoiceFact, type ProjectionState } from "@/lib/billing/projection";

const empty: ProjectionState = {
  paidThrough: null,
  lastPaidInvoiceId: null,
  lastPaidPeriodStart: null,
  lastPaidPeriodEnd: null,
  lastStripeEventId: null,
  lastStripeEventCreatedAt: null,
};

describe("paid-through projection policy", () => {
  it("advances access only to the confirmed invoice period end", () => {
    const result = applyPaidInvoiceFact(empty, {
      invoiceId: "in_paid",
      periodStart: new Date("2026-10-01T00:00:00Z"),
      periodEnd: new Date("2026-11-01T00:00:00Z"),
      stripeEventId: "evt_paid",
      stripeEventCreatedAt: new Date("2026-10-01T00:00:05Z"),
    });

    expect(result.kind).toBe("advance_paid_through");
    if (result.kind === "advance_paid_through") {
      expect(result.next.paidThrough?.toISOString()).toBe("2026-11-01T00:00:00.000Z");
      expect(result.next.lastPaidInvoiceId).toBe("in_paid");
    }
  });

  it("never shortens previously confirmed paid access", () => {
    const current: ProjectionState = {
      ...empty,
      paidThrough: new Date("2026-12-01T00:00:00Z"),
      lastStripeEventCreatedAt: new Date("2026-11-01T00:00:00Z"),
    };

    expect(applyPaidInvoiceFact(current, {
      invoiceId: "in_old",
      periodStart: new Date("2026-10-01T00:00:00Z"),
      periodEnd: new Date("2026-11-01T00:00:00Z"),
      stripeEventId: "evt_old_invoice",
      stripeEventCreatedAt: new Date("2026-11-02T00:00:00Z"),
    })).toEqual({ kind: "ignore_non_advancing_invoice" });
  });

  it("accepts a later paid period even when its Stripe event arrives out of order", () => {
    const current: ProjectionState = {
      ...empty,
      paidThrough: new Date("2026-11-01T00:00:00Z"),
      lastStripeEventId: "evt_newer_marker",
      lastStripeEventCreatedAt: new Date("2026-10-10T00:00:00Z"),
    };

    const result = applyPaidInvoiceFact(current, {
      invoiceId: "in_late_delivery",
      periodStart: new Date("2026-11-01T00:00:00Z"),
      periodEnd: new Date("2026-12-01T00:00:00Z"),
      stripeEventId: "evt_older_but_paid",
      stripeEventCreatedAt: new Date("2026-10-09T23:59:59Z"),
    });

    expect(result.kind).toBe("advance_paid_through");
    if (result.kind === "advance_paid_through") {
      expect(result.next.paidThrough?.toISOString()).toBe("2026-12-01T00:00:00.000Z");
      expect(result.next.lastStripeEventId).toBe("evt_newer_marker");
      expect(result.next.lastStripeEventCreatedAt?.toISOString()).toBe("2026-10-10T00:00:00.000Z");
    }
  });

  it("fails closed for an invalid invoice period", () => {
    expect(() => applyPaidInvoiceFact(empty, {
      invoiceId: "in_invalid",
      periodStart: new Date("2026-11-01T00:00:00Z"),
      periodEnd: new Date("2026-11-01T00:00:00Z"),
      stripeEventId: "evt_invalid",
      stripeEventCreatedAt: new Date("2026-11-01T00:00:00Z"),
    })).toThrow("Invalid paid invoice period");
  });
});
