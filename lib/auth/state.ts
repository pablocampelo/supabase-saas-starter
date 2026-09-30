export type AuthField = "name" | "email" | "password" | "confirm";

export type AuthFormState = {
  status: "idle" | "error" | "sent" | "success";
  message?: string;
  email?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
  code?: "invalid_credentials" | "email_not_confirmed" | "rate_limited" | "invalid_link" | "generic";
};

export const initialAuthFormState: AuthFormState = { status: "idle" };
