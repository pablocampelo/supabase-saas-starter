import { describe, expect, it } from "vitest";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import { safeReturnPath } from "@/lib/auth/redirects";

describe("safeReturnPath", () => {
  it("allows only supported private app destinations", () => {
    for (const path of ["/app", "/app/example", "/app/example/first-example", "/app/billing", "/app/account", "/app/help"]) {
      expect(safeReturnPath(path)).toBe(path);
    }
  });

  it("rejects external, protocol-relative, query-bearing, and unsupported paths", () => {
    for (const path of ["https://example.com/app", "//example.com/app", "/app?admin=1", "/admin", "/app/teams", "/reset-password"]) {
      expect(safeReturnPath(path)).toBe("/app");
    }
  });

  it("accepts a same-origin absolute app URL only when the expected origin is supplied", () => {
    expect(safeReturnPath("https://app.example.com/app/billing", "https://app.example.com")).toBe("/app/billing");
    expect(safeReturnPath("https://evil.example/app/billing", "https://app.example.com")).toBe("/app");
  });
});

describe("E2E auth bypass", () => {
  it("is disabled by default and always disabled in production", () => {
    expect(isE2EAuthBypassEnabled({ NODE_ENV: "test" })).toBe(false);
    expect(isE2EAuthBypassEnabled({ NODE_ENV: "production", E2E_AUTH_BYPASS: "1" })).toBe(false);
  });

  it("can be enabled explicitly outside production", () => {
    expect(isE2EAuthBypassEnabled({ NODE_ENV: "test", E2E_AUTH_BYPASS: "1" })).toBe(true);
    expect(isE2EAuthBypassEnabled({ NODE_ENV: "development", E2E_AUTH_BYPASS: "1" })).toBe(true);
  });
});
