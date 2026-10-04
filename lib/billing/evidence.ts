export function assertPositivePaidInvoiceEvidence(status: string | null, amountPaid: number) {
  if (status !== "paid") throw new Error("BILLING_INVOICE_NOT_PAID");
  if (!Number.isSafeInteger(amountPaid) || amountPaid <= 0) {
    throw new Error("BILLING_INVOICE_PAYMENT_NOT_POSITIVE");
  }
}

export function assertPositiveInvoiceLineAmount(amount: number | null | undefined) {
  if (!Number.isSafeInteger(amount) || (amount ?? 0) <= 0) {
    throw new Error("BILLING_INVOICE_LINE_AMOUNT_NOT_POSITIVE");
  }
}
