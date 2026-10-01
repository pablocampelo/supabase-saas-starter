import "server-only";
import { productConfig } from "./product";
import { getValidatedBillingCatalog } from "@/lib/billing/stripe-catalog";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import type { PricingViewModel } from "@/lib/ui/models";

const previewPricing = { monthly: 1200, annual: 12000 } as const;

// A safe display projection, never a checkout authority or client price-ID map.
// Outside the isolated E2E bypass, paid amounts come only from validated Stripe Prices.
export async function getPricingView(): Promise<PricingViewModel> {
  const base = { currency: productConfig.billing.currency, freeAmount: productConfig.billing.free.amount };

  if (isE2EAuthBypassEnabled()) {
    return { ...base, ...previewPricing };
  }

  try {
    const catalog = await getValidatedBillingCatalog();
    return { ...base, currency: catalog.currency, monthly: catalog.monthly.amount, annual: catalog.annual.amount };
  } catch {
    return { ...base, monthly: null, annual: null };
  }
}
