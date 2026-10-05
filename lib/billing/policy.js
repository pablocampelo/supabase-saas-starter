export function validateStripePriceFacts(
  option,
  fact,
  expectedCurrency,
  { requireActive = true } = {},
) {
  if (fact.id !== option.priceId) throw new Error("Stripe Price ID mismatch");
  if (requireActive && !fact.active) throw new Error("Stripe Price is not active for new purchases");
  if (fact.currency !== expectedCurrency) throw new Error("Stripe Price currency mismatch");
  if (fact.unitAmount === null || !Number.isSafeInteger(fact.unitAmount) || fact.unitAmount <= 0) {
    throw new Error("Stripe Price amount is unsupported");
  }
  if (fact.recurringInterval !== option.interval || fact.recurringIntervalCount !== 1) {
    throw new Error("Stripe Price recurrence mismatch");
  }

  return {
    ...option,
    amount: fact.unitAmount,
    currency: fact.currency,
  };
}

export function assertPositivePaidInvoiceEvidence(status, amountPaid) {
  if (status !== "paid") throw new Error("BILLING_INVOICE_NOT_PAID");
  if (!Number.isSafeInteger(amountPaid) || amountPaid <= 0) {
    throw new Error("BILLING_INVOICE_PAYMENT_NOT_POSITIVE");
  }
}

export function assertPositiveInvoiceLineAmount(amount) {
  if (!Number.isSafeInteger(amount) || (amount ?? 0) <= 0) {
    throw new Error("BILLING_INVOICE_LINE_AMOUNT_NOT_POSITIVE");
  }
}

const paidSubscriptionStates = new Set(["active", "past_due", "unpaid", "canceled"]);

export function assertSupportedPaidSubscriptionState(status) {
  if (!paidSubscriptionStates.has(status)) {
    throw new Error("BILLING_SUBSCRIPTION_STATE_UNSUPPORTED_FOR_PAID_ACCESS");
  }
}

export function selectSupportedPaidPeriod(lines, expectedPriceId, expectedSubscriptionId) {
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

export function hasScheduledCancellation(cancelAtPeriodEnd, cancelAt) {
  return cancelAtPeriodEnd || (typeof cancelAt === "number" && cancelAt > 0);
}

export function assertStripeEventMode(livemode, secretKey) {
  const expectedLiveMode = secretKey.startsWith("sk_live_");
  const expectedTestMode = secretKey.startsWith("sk_test_");
  if ((!expectedLiveMode && !expectedTestMode) || livemode !== expectedLiveMode) {
    throw new Error("BILLING_STRIPE_MODE_MISMATCH");
  }
}
