import "server-only";
import type Stripe from "stripe";
import { getPurchasableCatalog } from "@/config/catalog";
import { validateStripePrice, type BillingInterval, type StripePriceFact } from "@/lib/billing/catalog";
import { getStripe } from "@/lib/billing/stripe";

function toFact(price: Stripe.Price): StripePriceFact {
  const interval = price.recurring?.interval;
  const recurringInterval: BillingInterval | null = interval === "month" || interval === "year" ? interval : null;

  return {
    id: price.id,
    active: price.active,
    currency: price.currency,
    unitAmount: price.unit_amount,
    recurringInterval,
    recurringIntervalCount: price.recurring?.interval_count ?? null,
  };
}

export async function getValidatedBillingCatalog() {
  const configured = getPurchasableCatalog();
  const stripe = getStripe();
  const [monthlyPrice, annualPrice] = await Promise.all([
    stripe.prices.retrieve(configured.monthly.priceId),
    stripe.prices.retrieve(configured.annual.priceId),
  ]);

  return {
    currency: configured.currency,
    monthly: validateStripePrice(configured.monthly, toFact(monthlyPrice), configured.currency),
    annual: validateStripePrice(configured.annual, toFact(annualPrice), configured.currency),
  };
}
