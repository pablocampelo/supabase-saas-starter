"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleAlert, CircleCheck, KeyRound, Mail } from "lucide-react";
import { AuthVisual } from "@/components/auth/auth-visual";
import { Brand } from "@/components/shared/brand";
import { Notice } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";
import {
  forgotPasswordAction,
  initialAuthFormState,
  resendVerificationAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
  type AuthField,
  type AuthFormState,
} from "@/lib/auth/actions";
import { safeReturnPath } from "@/lib/auth/redirects";

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

function Field({ name, mode, error, defaultValue, disabled }: { name: AuthField; mode: Mode; error?: string; defaultValue?: string; disabled: boolean }) {
  const label = name === "confirm" ? "Confirm password" : name === "password" && mode === "reset-password" ? "New password" : name[0]!.toUpperCase() + name.slice(1);
  const type = name === "password" || name === "confirm" ? "password" : name === "email" ? "email" : "text";
  const autoComplete = name === "password" ? mode === "login" ? "current-password" : "new-password" : name === "confirm" ? "new-password" : name;
  const hint = name === "password" && mode !== "login" ? "password-hint" : undefined;

  return <label className="field" htmlFor={`auth-${name}`}><span id={`${name}-label`}>{label}</span><input aria-labelledby={`${name}-label`} id={`auth-${name}`} name={name} type={type} autoComplete={autoComplete} defaultValue={defaultValue} disabled={disabled} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : hint}/>{hint && <span id={hint} className="text-xs font-normal text-muted-foreground">Use at least 8 characters.</span>}{error && <span role="alert" className="field-error" id={`${name}-error`}>{error}</span>}</label>;
}

function StateNotice({ state }: { state: AuthFormState }) {
  if (!state.message) return null;
  const tone = state.status === "success" || state.status === "sent" ? "success" : state.code === "rate_limited" || state.code === "email_not_confirmed" || state.code === "invalid_link" ? "warning" : state.status === "error" ? "danger" : "neutral";
  return <div className="mt-5"><Notice tone={tone}>{state.message}</Notice></div>;
}

export function RealAuthScreen({ mode, supportEmail }: { mode: Mode; supportEmail: string }) {
  const search = useSearchParams();
  const destination = safeReturnPath(search.get("next"));
  const verificationEmail = search.get("email")?.trim() ?? "";
  const formRef = useRef<HTMLFormElement>(null);
  const [editingRecovery, setEditingRecovery] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState(signInAction, initialAuthFormState);
  const [signupState, signupAction, signupPending] = useActionState(signUpAction, initialAuthFormState);
  const [forgotState, forgotAction, forgotPending] = useActionState(forgotPasswordAction, initialAuthFormState);
  const [resendState, resendAction, resendPending] = useActionState(resendVerificationAction, initialAuthFormState);
  const [resetState, resetAction, resetPending] = useActionState(resetPasswordAction, initialAuthFormState);

  const state = mode === "login" ? loginState : mode === "signup" ? signupState : mode === "forgot-password" ? forgotState : mode === "verify-email" ? resendState : mode === "reset-password" ? resetState : initialAuthFormState;
  const pending = mode === "login" ? loginPending : mode === "signup" ? signupPending : mode === "forgot-password" ? forgotPending : mode === "verify-email" ? resendPending : mode === "reset-password" ? resetPending : false;

  useEffect(() => {
    if (forgotState.status === "sent") setEditingRecovery(false);
  }, [forgotState]);

  useEffect(() => {
    const first = Object.keys(state.fieldErrors ?? {})[0];
    if (first) formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
  }, [state]);

  const sent = mode === "forgot-password" && forgotState.status === "sent" && !editingRecovery;
  const success = mode === "reset-password" && resetState.status === "success";
  const invalidLink = mode === "reset-password" && resetState.code === "invalid_link";
  const centered = mode === "login" || mode === "forgot-password" || mode === "reset-password";
  const showGoogle = mode === "login" || mode === "signup";
  const fields: AuthField[] = mode === "signup" ? ["name", "email", "password"] : mode === "login" ? ["email", "password"] : mode === "forgot-password" ? ["email"] : mode === "reset-password" ? ["password", "confirm"] : [];
  const showForm = fields.length > 0 && !sent && !success && !invalidLink;
  const heading = success ? "Password updated" : sent ? "Check your email" : headings[mode];
  const description = success ? "You can now sign in with your new password." : sent ? `We sent password reset instructions to ${forgotState.email}.` : invalidLink ? "Request a fresh link to continue. Recovery links can expire or be used only once." : descriptions[mode];
  const action = mode === "login" ? loginAction : mode === "signup" ? signupAction : mode === "forgot-password" ? forgotAction : resetAction;
  const submitLabel = pending ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot-password" ? "Send reset link" : "Update password";

  return <AuthFrame signup={mode === "signup"} centered={centered} backHref={mode === "login" ? "/" : "/login"}>
    {mode !== "signup" && !centered && <><Link href="/login" className="nav-link mb-9 inline-flex items-center gap-2"><ArrowLeft className="size-4" aria-hidden="true"/>Back</Link><div className="mb-7">{mode === "error" || invalidLink ? <CircleAlert className="size-8 text-warning" aria-hidden="true"/> : mode === "verify-email" || sent ? <Mail className="size-7" aria-hidden="true"/> : success ? <CircleCheck className="size-8 text-success" aria-hidden="true"/> : <KeyRound className="size-7" aria-hidden="true"/>}</div></>}
    {(centered || mode === "signup") && <div className="mb-7 flex justify-center"><Image src="/icon.svg" width={32} height={32} alt={productConfig.name} unoptimized/></div>}
    <h1 className={`text-3xl leading-tight sm:text-4xl ${centered ? "text-center" : ""}`}>{heading}</h1>
    <p className={`mt-3 text-sm leading-7 text-muted-foreground ${centered ? "mb-6 text-center break-words" : ""}`}>{description}</p>

    {showGoogle && <div className="mt-8 space-y-5"><Button asChild variant="outline" className="w-full"><a href={`/auth/google?next=${encodeURIComponent(destination)}`}>Continue with Google</a></Button><div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t"/></div><div className="relative flex justify-center text-[11px] uppercase tracking-[.12em]"><span className="bg-background px-3 text-muted-foreground">or continue with email</span></div></div></div>}

    {mode === "verify-email" && <div className="mt-7 space-y-5"><p className="break-words text-sm leading-7">{verificationEmail ? <>Verification instructions were sent to <strong>{verificationEmail}</strong>. Check your inbox and spam folder.</> : <>Open the verification email sent when you created your account.</>}</p>{verificationEmail && <form action={resendAction} className="space-y-4"><input type="hidden" name="email" value={verificationEmail}/><input type="hidden" name="next" value={destination}/><Button className="w-full" type="submit" disabled={resendPending}>{resendPending ? "Sending…" : "Resend verification email"}</Button></form>}<StateNotice state={resendState}/><Link className="text-link inline-block" href="/login">Back to sign in</Link></div>}

    {showForm && <form ref={formRef} action={action} aria-busy={pending} className={mode === "signup" || centered ? "mt-8 space-y-5" : "space-y-5"}><input type="hidden" name="next" value={destination}/>{fields.map(field => <Field key={field} name={field} mode={mode} error={state.fieldErrors?.[field]} defaultValue={mode === "forgot-password" ? forgotState.email : undefined} disabled={pending}/>)}{mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-link">Forgot password?</Link></div>}<Button className="w-full" type="submit" disabled={pending}>{submitLabel}</Button>{pending && <p role="status" className="text-sm text-muted-foreground">Please wait…</p>}</form>}

    {mode !== "verify-email" && mode !== "error" && <StateNotice state={state}/>} 
    {sent && <div className="mt-8 text-center"><Button variant="ghost" onClick={() => setEditingRecovery(true)}>Use a different email</Button></div>}
    {invalidLink && <Button asChild className="mt-6 w-full"><Link href="/forgot-password">Request a new reset link</Link></Button>}
    {success && <Button asChild className="mt-6 w-full"><Link href="/login">Continue to sign in</Link></Button>}

    {mode === "error" && <div className="mt-7 space-y-5"><p className="text-xs text-muted-foreground">Support reference: AUTH-{search.get("code") ?? "ERROR"}</p><Button asChild className="w-full"><Link href="/login">Try again</Link></Button><a className="text-link block text-center" href={`mailto:${supportEmail}`}>Contact support</a></div>}
    {mode === "signup" && <p className="mt-7 text-xs leading-6 text-muted-foreground">By creating an account, you agree to our <Link className="underline underline-offset-4" href="/terms">Terms of Service</Link> and <Link className="underline underline-offset-4" href="/privacy">Privacy Policy</Link>.</p>}
    {mode !== "signup" && mode !== "forgot-password" && mode !== "verify-email" && mode !== "error" && <div className="mt-7 space-y-4 text-center text-sm text-muted-foreground">{mode === "login" ? <p>Don&apos;t have an account? <Link className="text-link text-foreground" href="/signup">Sign up</Link></p> : !success && <Link className="text-link" href="/login">Back to sign in</Link>}</div>}
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
