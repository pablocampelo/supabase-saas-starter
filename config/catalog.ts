import "server-only";
import { productConfig } from "./product";
import { parsePurchasableCatalog } from "./catalog-schema";
import { getServerEnv } from "@/lib/env/server";

// Future pricing and Checkout must share this server-owned catalog. Missing
// placeholders fail closed; Phase 2 must also verify actual Stripe price facts.
export function getPurchasableCatalog() {
  const env = getServerEnv();
  return parsePurchasableCatalog({
    currency: productConfig.billing.currency,
    monthly: { priceId: env.STRIPE_PRO_MONTHLY_PRICE_ID, amount: env.PRO_MONTHLY_AMOUNT, interval: "month", active: true },
    annual: { priceId: env.STRIPE_PRO_ANNUAL_PRICE_ID, amount: env.PRO_ANNUAL_AMOUNT, interval: "year", active: true },
  });
}
