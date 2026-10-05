import { z } from "zod";
import { httpUrl, parseConfig } from "./validation";

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: httpUrl,
  NEXT_PUBLIC_SUPABASE_URL: httpUrl,
  // Only the new browser-safe key format; never accept a service-role JWT here.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().regex(/^sb_publishable_[A-Za-z0-9_-]+$/),
});

export function parsePublicEnv(input: unknown) {
  return parseConfig(publicSchema, input, "public environment");
}
