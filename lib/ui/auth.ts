export const authStates = ["default","submitting","invalid","unverified","expired-session","sent","rate-limited","expired","reused","verified","success","error"] as const;
export type AuthState = typeof authStates[number];
export function resolveAuthState(value:string|null, development:boolean):AuthState { return development && authStates.includes(value as AuthState) ? value as AuthState : "default"; }
// UI destination presentation only. Future server auth must independently validate.
export function safeReturnPath(value:string|null):string {
  if (!value || !/^\/app(?:\/(?:notes(?:\/[a-zA-Z0-9-]+)?|billing|account|help))?$/.test(value)) return "/app";
  return value;
}
