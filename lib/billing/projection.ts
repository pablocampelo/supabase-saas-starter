export type PaidInvoiceFact = {
  invoiceId: string;
  periodStart: Date;
  periodEnd: Date;
  stripeEventId: string;
  stripeEventCreatedAt: Date;
};

export type ProjectionState = {
  paidThrough: Date | null;
  lastPaidInvoiceId: string | null;
  lastPaidPeriodStart: Date | null;
  lastPaidPeriodEnd: Date | null;
  lastStripeEventId: string | null;
  lastStripeEventCreatedAt: Date | null;
};

export type ProjectionDecision =
  | { kind: "ignore_non_advancing_invoice" }
  | {
      kind: "advance_paid_through";
      next: ProjectionState;
    };

export function applyPaidInvoiceFact(current: ProjectionState, fact: PaidInvoiceFact): ProjectionDecision {
  if (fact.periodEnd <= fact.periodStart) {
    throw new Error("Invalid paid invoice period");
  }

  if (current.paidThrough && fact.periodEnd <= current.paidThrough) {
    return { kind: "ignore_non_advancing_invoice" };
  }

  const eventAdvancesMarker =
    !current.lastStripeEventCreatedAt || fact.stripeEventCreatedAt >= current.lastStripeEventCreatedAt;

  return {
    kind: "advance_paid_through",
    next: {
      paidThrough: fact.periodEnd,
      lastPaidInvoiceId: fact.invoiceId,
      lastPaidPeriodStart: fact.periodStart,
      lastPaidPeriodEnd: fact.periodEnd,
      lastStripeEventId: eventAdvancesMarker ? fact.stripeEventId : current.lastStripeEventId,
      lastStripeEventCreatedAt: eventAdvancesMarker
        ? fact.stripeEventCreatedAt
        : current.lastStripeEventCreatedAt,
    },
  };
}
