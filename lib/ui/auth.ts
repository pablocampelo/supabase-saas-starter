import { safeReturnPath } from "@/lib/auth/redirects";

export const authStates = ["default", "submitting", "invalid", "unverified", "expired-session", "sent", "rate-limited", "expired", "reused", "verified", "success", "error"] as const;
export type AuthState = typeof authStates[number];

export function resolveAuthState(value: string | null, development: boolean): AuthState {
  return development && authStates.includes(value as AuthState) ? value as AuthState : "default";
}

export { safeReturnPath };
