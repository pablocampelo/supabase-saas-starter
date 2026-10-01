import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env/public-schema";
import { parseServerEnv } from "@/lib/env/server-schema";
import { foundationEnv } from "../fixtures/env";

describe("environment boundaries", () => {
  it("returns only browser-safe fields from mixed input", () => {
    const result = parsePublicEnv({ ...foundationEnv, STRIPE_SECRET_KEY: "secret-canary" });
    expect(Object.keys(result)).toEqual(["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]);
    expect(JSON.stringify(result)).not.toContain("secret-canary");
  });
  it.each(Object.keys(foundationEnv).filter((key) => key.startsWith("NEXT_PUBLIC_")))("rejects missing %s", (key) => {
    expect(() => parsePublicEnv({ ...foundationEnv, [key]: undefined })).toThrow(key);
  });
  it.each(["sb_secret_do_not_expose", "eyJserviceRole", ""])("rejects unsafe public keys", (key) => {
    expect(() => parsePublicEnv({ ...foundationEnv, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key })).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });
  it.each(["", "private-invalid-url-canary", "javascript:alert(1)", "http://example.com", "https://user:password@example.com", "https://example.com/?token=secret", "https://example.com/subpath"])("rejects unsafe or ambiguous base URLs", (url) => {
    expect(() => parsePublicEnv({ ...foundationEnv, NEXT_PUBLIC_SITE_URL: url })).toThrow("NEXT_PUBLIC_SITE_URL");
  });
  it("redacts malformed URLs rather than throwing the URL parser's input", () => {
    const canary = "private-invalid-url-canary";
    expect(() => parsePublicEnv({ ...foundationEnv, NEXT_PUBLIC_SITE_URL: canary })).toThrow("Invalid public environment");
    try { parsePublicEnv({ ...foundationEnv, NEXT_PUBLIC_SITE_URL: canary }); } catch (error) {
      expect(String(error)).not.toContain(canary);
      expect(error).not.toHaveProperty("input");
    }
  });
  it("requires the support inbox but allows absent provider credentials for isolated checks", () => {
    expect(parseServerEnv({ ...foundationEnv, STRIPE_SECRET_KEY: "" })).toEqual({ SUPPORT_EMAIL: foundationEnv.SUPPORT_EMAIL, STRIPE_SECRET_KEY: undefined });
    expect(() => parseServerEnv({})).toThrow("SUPPORT_EMAIL");
  });
  it("reports field names without leaking invalid input or Zod details", () => {
    const canary = "private-secret-canary";
    try {
      parseServerEnv({ SUPPORT_EMAIL: canary, STRIPE_SECRET_KEY: canary });
      expect.fail("must reject invalid configuration");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(String(error)).toContain("SUPPORT_EMAIL");
      expect(String(error)).toContain("STRIPE_SECRET_KEY");
      expect(String(error)).not.toContain(canary);
    }
  });
  it.each(["price bad", "prod_123", "", "price_"])("rejects invalid Stripe Price ID %s", (priceId) => {
    const value = priceId === "" ? undefined : priceId;
    if (value === undefined) {
      expect(parseServerEnv({ ...foundationEnv, STRIPE_PRO_MONTHLY_PRICE_ID: "" }).STRIPE_PRO_MONTHLY_PRICE_ID).toBeUndefined();
      return;
    }
    expect(() => parseServerEnv({ ...foundationEnv, STRIPE_PRO_MONTHLY_PRICE_ID: value })).toThrow("STRIPE_PRO_MONTHLY_PRICE_ID");
  });
});
