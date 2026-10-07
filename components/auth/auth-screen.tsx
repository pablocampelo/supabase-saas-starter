"use client";

import { useRef, useState, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleAlert, CircleCheck, KeyRound, Mail } from "lucide-react";
import { productConfig } from "@/config/product";
import { AuthVisual } from "@/components/auth/auth-visual";
import { Brand } from "@/components/shared/brand";
import { Notice } from "@/components/shared/patterns";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { Button } from "@/components/ui/button";
import { previewAction } from "@/lib/ui/actions";
import { resolveAuthState, safeReturnPath } from "@/lib/ui/auth";

type Mode = "login" | "signup" | "verify-email" | "forgot-password" | "reset-password" | "error";

const headings: Record<Mode, string> = {
  login: "Welcome back",
  signup: "Create your account",
  "verify-email": "Verify your email",
  "forgot-password": "Reset your password",
  "reset-password": "Set a new password",
  error: "Something went wrong",
};

const descriptions: Record<Mode, string> = {
  login: "Sign in with Google or your email and password.",
  signup: "Create your account with Google or email and password.",
  "verify-email": "Click the link in your email to activate your account.",
  "forgot-password": "Enter your email and we'll send you a reset link.",
  "reset-password": "Choose a new password for your account.",
  error: "We couldn’t complete that request. Try again or contact support for help.",
};

export function AuthScreen({ mode, supportEmail }: { mode: Mode; supportEmail: string }) {
  const search = useSearchParams();
  const state = resolveAuthState(search.get("state"), process.env.NODE_ENV === "development");
  const destination = safeReturnPath(search.get("next"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const centered = mode === "login" || mode === "forgot-password" || mode === "reset-password";
  const [recoveryEmail, setRecoveryEmail] = useState(state === "sent" ? "demo@example.com" : "");
  const [recoverySent, setRecoverySent] = useState(false);
  const [editingRecovery, setEditingRecovery] = useState(false);
  const [sending, setSending] = useState(false);
  const submitting = useRef(false);

  const sent = mode === "forgot-password" && (recoverySent || (state === "sent" && !editingRecovery));
  const success = state === "success" && mode === "reset-password";
  const verified = state === "verified" && mode === "verify-email";
  const invalidLink = ["expired", "reused"].includes(state) && ["reset-password", "verify-email"].includes(mode);
  const pending = state === "submitting" || sending;
  const fields = mode === "signup" ? ["name", "email", "password"] : mode === "login" ? ["email", "password"] : mode === "forgot-password" ? ["email"] : mode === "reset-password" ? ["password", "confirm"] : [];
  const showGoogle = mode === "login" || mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitting.current) return;
    setMessage("");
    const data = new FormData(event.currentTarget);
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      const value = String(data.get(field) ?? "");
      if (!value.trim()) nextErrors[field] = field === "confirm" ? "Confirm your new password." : `Enter your ${field}.`;
      else if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) nextErrors[field] = "Enter a valid email address.";
      else if (field === "password" && mode !== "login" && value.length < 8) nextErrors[field] = "Use at least 8 characters.";
      else if (field === "confirm" && value !== data.get("password")) nextErrors[field] = "Passwords must match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    if (mode === "forgot-password") {
      submitting.current = true;
      setSending(true);
      try {
        await previewAction("reset");
        setRecoveryEmail(String(data.get("email")).trim());
        setRecoverySent(true);
      } catch {
        setMessage("We couldn’t complete the request. Please try again.");
      } finally {
        submitting.current = false;
        setSending(false);
      }
      return;
    }
    setMessage((await previewAction(mode === "login" ? "sign-in" : mode === "signup" ? "sign-up" : "reset")).message);
  }

  const heading = success ? "Password updated" : sent ? "Check your email" : verified ? "Email verified" : invalidLink ? "This link is no longer valid" : headings[mode];
  const showForm = fields.length > 0 && !sent && !success && !invalidLink;
  const previewCopy = state === "default" ? "No account, provider flow, email delivery, or password mutation is connected yet." : `“${state}” is a deterministic sample state. No account or password has changed and no provider request or email was sent.`;
  const previewNotice = <PreviewNotice className="my-6 text-left">{previewCopy}</PreviewNotice>;

  return <AuthFrame signup={mode === "signup"} centered={centered} backHref={mode === "login" ? "/" : "/login"}>
    {mode !== "signup" && !centered && <><Link href="/login" className="nav-link mb-9 inline-flex items-center gap-2"><ArrowLeft className="size-4" aria-hidden="true"/>Back</Link><div className="mb-7">{success || verified ? <CircleCheck className="size-8 text-success" aria-hidden="true"/> : mode === "error" || invalidLink ? <CircleAlert className="size-8 text-warning" aria-hidden="true"/> : mode === "verify-email" || sent ? <Mail className="size-7" aria-hidden="true"/> : <KeyRound className="size-7" aria-hidden="true"/>}</div></>}
    {(centered || mode === "signup") && <div className="mb-7 flex justify-center"><Image src="/icon.svg" width={40} height={40} alt={productConfig.shortName} className="size-10" unoptimized/></div>}
    <h1 tabIndex={sent ? -1 : undefined} ref={element => { if (element && recoverySent) element.focus(); }} className={`text-3xl leading-tight sm:text-4xl ${centered || mode === "signup" ? "text-center" : ""}`}>{heading}</h1>
    <p className={`mt-3 text-sm leading-7 text-muted-foreground ${centered ? "mb-6 text-center break-words" : mode === "signup" ? "text-center break-words" : ""}`}>{success ? "You can now sign in with your new password." : verified ? "Your account is ready to sign in." : sent ? `We sent a password reset link to ${recoveryEmail}.` : invalidLink ? "Request a fresh link to continue. Verification and recovery links can expire or be used only once." : descriptions[mode]}</p>

    {showGoogle && !sent && !success && !invalidLink && <div className="mt-8 space-y-5"><Button type="button" variant="outline" className="w-full" disabled={pending} onClick={async () => setMessage((await previewAction("google")).message)}>Continue with Google</Button><div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t"/></div><div className="relative flex justify-center text-[11px] uppercase tracking-[.12em]"><span className="bg-background px-3 text-muted-foreground">or continue with email</span></div></div></div>}

    {mode !== "signup" && !centered && previewNotice}
    {state === "invalid" && <div className="mb-5"><Notice tone="danger">Email or password is incorrect. Check your details and try again.</Notice></div>}
    {state === "unverified" && <div className="mb-5"><Notice tone="warning">Verify your email before signing in. <Link className="text-link" href="/verify-email">View verification instructions</Link></Notice></div>}
    {state === "expired-session" && <div className="mb-5"><Notice tone="warning">Your session has expired. Sign in again to continue.</Notice></div>}
    {state === "rate-limited" && !sent && <div className="mb-5"><Notice tone="warning">Please wait before requesting another email. If this continues, contact support.</Notice></div>}
    {state === "error" && !sent && <div className="mb-5"><Notice tone="danger">We couldn’t complete the request. Try again. Reference: UI-PREVIEW.</Notice></div>}
    {state === "sent" && mode === "verify-email" && <div className="mb-5"><Notice tone="success">Sample result: a new verification email was sent. No email is actually delivered in this integration preview.</Notice></div>}
    {mode === "verify-email" && !invalidLink && !verified && <p className="mb-5 break-words text-sm leading-7">Verification instructions for <strong>demo@example.com</strong>. Check your inbox and spam folder.</p>}

    {showForm && <form noValidate onSubmit={submit} aria-busy={pending} className={mode === "signup" || centered ? "mt-8 space-y-5" : "space-y-5"}>{fields.map(field => { const label = field === "confirm" ? "Confirm password" : field === "password" && mode === "reset-password" ? "New password" : field[0]!.toUpperCase() + field.slice(1); return <label className="field" htmlFor={`auth-${field}`} key={field}><span id={`${field}-label`}>{label}</span><input defaultValue={mode === "forgot-password" ? recoveryEmail : undefined} ref={element => { if (element && mode === "forgot-password" && editingRecovery) element.focus(); }} aria-labelledby={`${field}-label`} id={`auth-${field}`} name={field} type={field === "password" || field === "confirm" ? "password" : field === "email" ? "email" : "text"} autoComplete={field === "password" ? mode === "login" ? "current-password" : "new-password" : field === "confirm" ? "new-password" : field} disabled={pending} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : field === "password" && mode !== "login" ? "password-hint" : undefined}/>{field === "password" && mode !== "login" && <span id="password-hint" className="text-xs font-normal text-muted-foreground">Use at least 8 characters.</span>}{errors[field] && <span role="alert" className="field-error" id={`${field}-error`}>{errors[field]}</span>}</label>; })}{mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-link">Forgot password?</Link></div>}<Button className="w-full" type="submit" disabled={pending || (mode === "forgot-password" && state === "rate-limited")}>{pending ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot-password" ? "Send reset link" : "Update password"}</Button>{pending && <p role="status" className={mode === "forgot-password" ? "sr-only" : "text-sm text-muted-foreground"}>Submitting sample — no request is being sent.</p>}</form>}

    {(mode === "verify-email" && !verified || invalidLink) && <div className="space-y-4">{invalidLink && mode === "reset-password" ? <Button asChild className="w-full"><Link href="/forgot-password">Request a new reset link</Link></Button> : <Button className="w-full" disabled={pending || state === "rate-limited"} onClick={async () => setMessage((await previewAction(mode === "verify-email" ? "resend" : "reset")).message)}>{pending ? "Sending…" : mode === "verify-email" ? "Resend verification email" : "Resend reset link"}</Button>}{pending && <p role="status" className="text-sm text-muted-foreground">Sending sample — no email is being sent.</p>}</div>}
    {sent && <div className="mt-8 text-center"><Button variant="ghost" onClick={() => { setRecoverySent(false); setEditingRecovery(true); setErrors({}); setMessage(""); }}>Use a different email</Button></div>}
    {message && <div className="mt-5"><Notice>{message}</Notice>{mode === "signup" && <Link className="text-link mt-4 inline-block" href="/verify-email">View verification instructions</Link>}</div>}
    {(success || verified) && <Button asChild className="mt-2 w-full"><Link href="/login">Continue to sign in</Link></Button>}
    {mode === "error" && <div className="space-y-5"><p className="text-xs text-muted-foreground">Support reference: UI-PREVIEW</p><Button asChild className="w-full"><Link href="/login">Try again</Link></Button><a className="text-link block text-center" href={`mailto:${supportEmail}`}>Contact support</a></div>}
    {mode === "signup" && <p className="mt-7 text-xs leading-6 text-muted-foreground">By creating an account, you agree to our <Link className="underline underline-offset-4" href="/terms">Terms of Service</Link> and <Link className="underline underline-offset-4" href="/privacy">Privacy Policy</Link>.</p>}
    {mode === "signup" && previewNotice}
    {mode !== "signup" && mode !== "forgot-password" && <div className="mt-7 space-y-4 text-center text-sm text-muted-foreground">{mode === "login" ? <p>Don&apos;t have an account? <Link className="text-link text-foreground" href="/signup">Sign up</Link></p> : !success && !verified && <Link className="text-link" href="/login">Back to sign in</Link>}{mode === "login" && message && <Link className="text-link inline-block" href={destination}>Open the app</Link>}</div>}
    {centered && <div className="text-center">{previewNotice}</div>}
  </AuthFrame>;
}

function AuthBackLink({ href }: { href: string }) {
  return <nav aria-label="Back navigation" className="absolute left-6 top-7 z-10 sm:left-8 sm:top-8"><Link href={href} className="nav-link -ml-2 -mt-2 inline-flex min-h-10 items-center gap-2 rounded-md px-2"><ArrowLeft className="size-4" aria-hidden="true"/>Back</Link></nav>;
}

function AuthFrame({ signup, centered, backHref, children }: { signup: boolean; centered: boolean; backHref: string; children: ReactNode }) {
  if (centered) return <div className="relative flex min-h-svh items-center justify-center px-6 py-24"><a className="skip-link" href="#main">Skip to content</a><AuthBackLink href={backHref}/><main id="main" className="w-full max-w-[400px]">{children}</main></div>;
  if (signup) return <><a className="skip-link" href="#main">Skip to content</a><div className="relative grid min-h-svh md:grid-cols-2"><AuthBackLink href="/"/><AuthVisual/><div className="flex min-w-0 flex-col"><header className="flex min-h-20 flex-wrap items-center justify-end gap-x-2 gap-y-1 py-6 pl-28 pr-6 text-sm sm:pl-32 sm:pr-8 md:pl-6 lg:px-12"><span className="text-muted-foreground">Already have an account?</span><Link href="/login" className="text-link text-foreground">Sign in</Link></header><main id="main" className="flex flex-1 items-center px-6 pb-12 pt-8 sm:px-8 lg:px-12"><div className="mx-auto w-full max-w-[400px]">{children}</div></main></div></div></>;
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-container flex h-20 items-center justify-between"><Brand/><Link className="nav-link" href="/">Back to home</Link></header><main id="main" className="mx-auto w-full max-w-[440px] px-6 pb-20 pt-10 sm:pt-16">{children}</main></>;
}
