import { describe, expect, it } from "vitest";
import {
  assertPositiveInvoiceLineAmount,
  assertPositivePaidInvoiceEvidence,
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
