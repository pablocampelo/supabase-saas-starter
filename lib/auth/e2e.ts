export type AuthBypassEnv = {
  NODE_ENV?: string;
  E2E_AUTH_BYPASS?: string;
};

export function isE2EAuthBypassEnabled(env: AuthBypassEnv = process.env): boolean {
  return env.NODE_ENV !== "production" && env.E2E_AUTH_BYPASS === "1";
}
