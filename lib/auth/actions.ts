"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeReturnPath } from "@/lib/auth/redirects";
import type { AuthField, AuthFormState } from "@/lib/auth/state";
import { getSiteConfig } from "@/config/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const email = z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.");
const password = z.string().min(8, "Use at least 8 characters.").max(128, "Use 128 characters or fewer.");
const loginPassword = z.string().min(1, "Enter your password.").max(128, "Use 128 characters or fewer.");
const name = z.string().trim().min(1, "Enter your name.").max(100, "Use 100 characters or fewer.");

function fields(error: z.ZodError): AuthFormState {
  const fieldErrors: Partial<Record<AuthField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && ["name", "email", "password", "confirm"].includes(key) && !fieldErrors[key as AuthField]) {
      fieldErrors[key as AuthField] = issue.message;
    }
  }
  return { status: "error", fieldErrors };
}

function providerError(error: { code?: string; message?: string }): AuthFormState {
  const code = error.code ?? "";
  if (code === "invalid_credentials") return { status: "error", code: "invalid_credentials", message: "Email or password is incorrect. Check your details and try again." };
  if (code === "email_not_confirmed") return { status: "error", code: "email_not_confirmed", message: "Verify your email before signing in." };
  if (code.includes("rate_limit") || code.includes("over_email_send_rate_limit")) return { status: "error", code: "rate_limited", message: "Please wait before trying again." };
  return { status: "error", code: "generic", message: "We couldn’t complete the request. Try again, then contact support if the problem continues." };
}

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function signInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email, password: loginPassword, next: z.string().optional() }).safeParse({
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    next: stringValue(formData, "next"),
  });
  if (!parsed.success) return fields(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { ...providerError(error), email: parsed.data.email };

  revalidatePath("/", "layout");
  redirect(safeReturnPath(parsed.data.next));
}

export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ name, email, password, next: z.string().optional() }).safeParse({
    name: stringValue(formData, "name"),
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    next: stringValue(formData, "next"),
  });
  if (!parsed.success) return fields(parsed.error);

  const next = safeReturnPath(parsed.data.next);
  const site = getSiteConfig();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: new URL(next, site.url).toString(),
    },
  });
  if (error) return providerError(error);

  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}`);
}

export async function forgotPasswordAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email }).safeParse({ email: stringValue(formData, "email") });
  if (!parsed.success) return fields(parsed.error);

  const site = getSiteConfig();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: new URL("/reset-password", site.url).toString(),
  });
  if (error) return providerError(error);

  return { status: "sent", email: parsed.data.email, message: `We sent password reset instructions to ${parsed.data.email}.` };
}

export async function resendVerificationAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email, next: z.string().optional() }).safeParse({
    email: stringValue(formData, "email"),
    next: stringValue(formData, "next"),
  });
  if (!parsed.success) return fields(parsed.error);

  const next = safeReturnPath(parsed.data.next);
  const site = getSiteConfig();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: new URL(next, site.url).toString() },
  });
  if (error) return providerError(error);

  return { status: "sent", email: parsed.data.email, message: "A new verification email has been requested. Check your inbox and spam folder." };
}

export async function resetPasswordAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const schema = z.object({ password, confirm: z.string() }).refine(value => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords must match.",
  });
  const parsed = schema.safeParse({ password: stringValue(formData, "password"), confirm: stringValue(formData, "confirm") });
  if (!parsed.success) return fields(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", code: "invalid_link", message: "This recovery session is no longer valid. Request a fresh reset link." };

  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  return { status: "success", message: "Password updated. Sign in with your new password." };
}

export async function updateDisplayNameAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ name }).safeParse({ name: stringValue(formData, "name") });
  if (!parsed.success) return fields(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { status: "error", code: "generic", message: "Your session has expired. Sign in again to continue." };

  const { error } = await supabase.auth.updateUser({ data: { display_name: parsed.data.name } });
  if (error) return providerError(error);

  revalidatePath("/app", "layout");
  return { status: "success", message: "Profile updated." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
