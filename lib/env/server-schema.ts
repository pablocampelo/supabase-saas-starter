import { z } from "zod";
import { optionalValue, parseConfig } from "./validation";

const priceId = z.string().regex(/^price_[A-Za-z0-9]+$/);
const serverSchema = z.object({
  SUPPORT_EMAIL: z.email(),
  SUPABASE_SECRET_KEY: optionalValue(z.string().regex(/^sb_secret_[A-Za-z0-9_-]+$/)),
  STRIPE_SECRET_KEY: optionalValue(z.string().regex(/^sk_(test|live)_[A-Za-z0-9]+$/)),
  STRIPE_WEBHOOK_SECRET: optionalValue(z.string().regex(/^whsec_[A-Za-z0-9]+$/)),
  STRIPE_PRO_MONTHLY_PRICE_ID: optionalValue(priceId),
  STRIPE_PRO_ANNUAL_PRICE_ID: optionalValue(priceId),
});

export function parseServerEnv(input: unknown) {
  return parseConfig(serverSchema, input, "server environment");
}
