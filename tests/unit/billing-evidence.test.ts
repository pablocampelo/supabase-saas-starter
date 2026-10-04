import { describe, expect, it } from "vitest";
import {
  assertPositiveInvoiceLineAmount,
  assertPositivePaidInvoiceEvidence,
  assertSupportedPaidSubscriptionState,
  selectSupportedPaidPeriod,
} from "@/lib/billing/evidence";

describe("paid invoice evidence", () => {
  it("accepts a paid invoice with positive money received", () => {
    expect(() => assertPositivePaidInvoiceEvidence("paid", 1200)).not.toThrow();
  });

  it.each([
    ["open", 1200, "BILLING_INVOICE_NOT_PAID"],
    ["paid", 0, "BILLING_INVOICE_PAYMENT_NOT_POSITIVE"],
    ["paid", -1, "BILLING_INVOICE_PAYMENT_NOT_POSITIVE"],
  ] as const)("fails closed for unsupported invoice evidence", (status, amountPaid, message) => {
    expect(() => assertPositivePaidInvoiceEvidence(status, amountPaid)).toThrow(message);
  });

  it("requires a positive supported subscription line", () => {
    expect(() => assertPositiveInvoiceLineAmount(1200)).not.toThrow();
    expect(() => assertPositiveInvoiceLineAmount(0)).toThrow("BILLING_INVOICE_LINE_AMOUNT_NOT_POSITIVE");
    expect(() => assertPositiveInvoiceLineAmount(undefined)).toThrow("BILLING_INVOICE_LINE_AMOUNT_NOT_POSITIVE");
  });
});

describe("paid subscription state evidence", () => {
  it.each(["active", "past_due", "unpaid", "canceled"] as const)(
    "accepts a state that can retain confirmed paid access: %s",
    (status) => {
      expect(() => assertSupportedPaidSubscriptionState(status)).not.toThrow();
    },
  );

  it.each(["trialing", "paused", "incomplete", "incomplete_expired"] as const)(
    "rejects a state that cannot establish paid access: %s",
    (status) => {
      expect(() => assertSupportedPaidSubscriptionState(status)).toThrow(
        "BILLING_SUBSCRIPTION_STATE_UNSUPPORTED_FOR_PAID_ACCESS",
      );
    },
  );
});

describe("supported paid-period selection", () => {
  const baseLine = {
    priceId: "price_month",
    subscriptionId: "sub_123",
    amount: 1200,
    periodStart: 1_780_000_000,
    periodEnd: 1_782_592_000,
    proration: false,
  };

  it("selects the latest non-proration period for the mapped subscription Price", () => {
    expect(selectSupportedPaidPeriod([
      { ...baseLine, periodEnd: 1_782_000_000, proration: true },
      { ...baseLine, periodEnd: 1_783_000_000 },
      { ...baseLine, priceId: "price_other", periodEnd: 1_790_000_000 },
    ], "price_month", "sub_123")).toEqual({
      start: baseLine.periodStart,
      end: 1_783_000_000,
    });
  });

  it("rejects a matching line when no positive subscription amount exists", () => {
    expect(() => selectSupportedPaidPeriod([
      { ...baseLine, amount: 0 },
    ], "price_month", "sub_123")).toThrow("BILLING_INVOICE_LINE_AMOUNT_NOT_POSITIVE");
  });

  it("rejects invalid financial periods", () => {
    expect(() => selectSupportedPaidPeriod([
      { ...baseLine, periodEnd: baseLine.periodStart },
    ], "price_month", "sub_123")).toThrow("BILLING_INVALID_INVOICE_PERIOD");
  });
});
