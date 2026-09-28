import "server-only";
import { getPurchasableCatalog } from "./catalog";
import { productConfig } from "./product";
import type { PricingViewModel } from "@/lib/ui/models";

// A safe display projection, never a checkout authority or client price-ID map.
export function getPricingView(): PricingViewModel {
  const base = { currency: productConfig.billing.currency, freeAmount: productConfig.billing.free.amount };
  try {
    const catalog = getPurchasableCatalog();
    return { ...base, monthly: catalog.monthly.amount, annual: catalog.annual.amount };
  } catch {
    return { ...base, monthly: null, annual: null };
  }
}
