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

export function validateStripePrice(
  option: SupportedBillingOption,
  fact: StripePriceFact,
  expectedCurrency: string,
): ValidatedPrice {
  if (fact.id !== option.priceId) throw new Error("Stripe Price ID mismatch");
  if (!fact.active) throw new Error("Stripe Price is not active for new purchases");
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
