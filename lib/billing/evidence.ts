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

const paidSubscriptionStates = new Set(["active", "past_due", "unpaid", "canceled"]);

export function assertSupportedPaidSubscriptionState(status: string) {
  if (!paidSubscriptionStates.has(status)) {
    throw new Error("BILLING_SUBSCRIPTION_STATE_UNSUPPORTED_FOR_PAID_ACCESS");
  }
}

export type InvoiceLineEvidence = {
  priceId: string | null;
  subscriptionId: string | null;
  amount: number | null | undefined;
  periodStart: number | null | undefined;
  periodEnd: number | null | undefined;
  proration: boolean;
};

export function selectSupportedPaidPeriod(
  lines: InvoiceLineEvidence[],
  expectedPriceId: string,
  expectedSubscriptionId: string,
) {
  const matching = lines.filter(
    (line) =>
      line.priceId === expectedPriceId
      && (!line.subscriptionId || line.subscriptionId === expectedSubscriptionId),
  );
  if (matching.length === 0) throw new Error("BILLING_SUPPORTED_INVOICE_LINE_MISSING");

  const positive = matching.filter(
    (line) => Number.isSafeInteger(line.amount) && (line.amount ?? 0) > 0,
  );
  if (positive.length === 0) throw new Error("BILLING_INVOICE_LINE_AMOUNT_NOT_POSITIVE");

  const candidates = positive.map((line) => {
    const start = line.periodStart;
    const end = line.periodEnd;
    if (
      !Number.isSafeInteger(start)
      || !Number.isSafeInteger(end)
      || !start
      || !end
      || end <= start
    ) {
      throw new Error("BILLING_INVALID_INVOICE_PERIOD");
    }
    return { start, end, proration: line.proration };
  });

  candidates.sort((a, b) => {
    const prorationOrder = Number(a.proration) - Number(b.proration);
    if (prorationOrder !== 0) return prorationOrder;
    return b.end - a.end;
  });

  const selected = candidates[0];
  if (!selected) throw new Error("BILLING_SUPPORTED_INVOICE_LINE_MISSING");
  return { start: selected.start, end: selected.end };
}
