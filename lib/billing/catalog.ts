import { validateStripePriceFacts } from "./policy.js";

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
  return validateStripePriceFacts(option, fact, expectedCurrency, { requireActive: true });
}

export function validateHistoricalStripePrice(
  option: SupportedBillingOption,
  fact: StripePriceFact,
  expectedCurrency: string,
): ValidatedPrice {
  return validateStripePriceFacts(option, fact, expectedCurrency, { requireActive: false });
}
