import { z } from "zod";
import { parseConfig } from "@/lib/env/validation";

const price = z.object({
  priceId: z.string().regex(/^price_[A-Za-z0-9]+$/),
  amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  active: z.literal(true),
});
const catalogSchema = z.object({
  currency: z.string().regex(/^[a-z]{3}$/),
  monthly: price.extend({ interval: z.literal("month") }),
  annual: price.extend({ interval: z.literal("year") }),
}).refine((catalog) => catalog.monthly.priceId !== catalog.annual.priceId, { path: ["annual", "priceId"] });

export function parsePurchasableCatalog(input: unknown) {
  return parseConfig(catalogSchema, input, "billing catalog");
}
