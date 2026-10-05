export type BillingInterval = "month" | "year";

export type SupportedBillingOption = {
  interval: BillingInterval;
  priceId: string;
};

export type StripePriceFact = {
  id: string;
  active: boolean;
  currency: string;
  unitAmount: number | null;
  recurringInterval: BillingInterval | null;
  recurringIntervalCount: number | null;
};

export type ValidatedPrice = SupportedBillingOption & {
  amount: number;
  currency: string;
};

export type InvoiceLineEvidence = {
  priceId: string | null;
  subscriptionId: string | null;
  amount: number | null | undefined;
  periodStart: number | null | undefined;
  periodEnd: number | null | undefined;
  proration: boolean;
};

export function validateStripePriceFacts(
  option: SupportedBillingOption,
  fact: StripePriceFact,
  expectedCurrency: string,
  options?: { requireActive?: boolean },
): ValidatedPrice;

export function assertPositivePaidInvoiceEvidence(
  status: string | null,
  amountPaid: number,
): void;

export function assertPositiveInvoiceLineAmount(
  amount: number | null | undefined,
): void;

export function assertSupportedPaidSubscriptionState(status: string): void;

export function selectSupportedPaidPeriod(
  lines: InvoiceLineEvidence[],
  expectedPriceId: string,
  expectedSubscriptionId: string,
): { start: number; end: number };

export function hasScheduledCancellation(
  cancelAtPeriodEnd: boolean,
  cancelAt: number | null | undefined,
): boolean;

export function assertStripeEventMode(
  livemode: boolean,
  secretKey: string,
): void;
