import "server-only";
import { productConfig } from "./product";
import { parsePurchasableCatalog } from "./catalog-schema";
import { getServerEnv } from "@/lib/env/server";

// Server-owned purchasable options. Price IDs identify the two supported offers;
// Stripe Price is authoritative for amount, currency, active state and recurrence.
export function getPurchasableCatalog() {
  const env = getServerEnv();
  return parsePurchasableCatalog({
    currency: productConfig.billing.currency,
    monthly: { priceId: env.STRIPE_PRO_MONTHLY_PRICE_ID, interval: "month" },
    annual: { priceId: env.STRIPE_PRO_ANNUAL_PRICE_ID, interval: "year" },
  });
}
