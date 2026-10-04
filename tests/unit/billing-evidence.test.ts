import { describe, expect, it } from "vitest";
import {
  assertPositiveInvoiceLineAmount,
  assertPositivePaidInvoiceEvidence,
  assertSupportedPaidSubscriptionState,
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
