"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useAppUi } from "./app-shell";
import { Badge, PageHeader, Panel, Notice } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";
import { initialAuthFormState, updateDisplayNameAction } from "@/lib/auth/actions";

export function Account() {
  const { app, supportEmail } = useAppUi();
  const [state, action, pending] = useActionState(updateDisplayNameAction, initialAuthFormState);
  const nameError = state.fieldErrors?.name;

  return <><PageHeader title="Account" description="Manage your identity, profile, and account access."/><div className="max-w-3xl space-y-6"><Panel title="Profile"><form action={action} className="space-y-5"><label htmlFor="profile-name" className="field"><span id="profile-name-label">Name</span><input aria-labelledby="profile-name-label" id="profile-name" name="name" autoComplete="name" maxLength={100} defaultValue={app.user.name} disabled={pending} aria-invalid={!!nameError} aria-describedby={nameError ? "name-error" : undefined}/>{nameError && <span id="name-error" className="field-error" role="alert">{nameError}</span>}</label><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>{state.message && <Notice tone={state.status === "success" ? "success" : "danger"}>{state.message}</Notice>}</form></Panel><Panel title="Email"><label className="field" htmlFor="account-email">Email address<input id="account-email" type="email" value={app.user.email} readOnly/></label><div className="my-4"><Badge tone={app.user.emailVerified ? "success" : "warning"}>{app.user.emailVerified ? "Verified" : "Unverified"}</Badge></div>{!app.user.emailVerified && <Link className="text-link" href={`/verify-email?email=${encodeURIComponent(app.user.email)}`}>Verify your email</Link>}<p className="mt-3 text-sm leading-7 text-muted-foreground">Email changes affect account access. Contact support to request a sensitive change.</p></Panel><Panel title="Security"><p className="mb-5 text-sm leading-7 text-muted-foreground">Use password recovery to choose a new password through a verified email link.</p><Button asChild variant="outline"><Link href="/forgot-password">Password recovery</Link></Button></Panel><Panel title="Sensitive changes"><p className="mb-5 text-sm leading-7 text-muted-foreground">Advanced email changes and automated account deletion are outside the supported self-service surface. Contact support for sensitive account questions. Never share your password, card details, or secret keys.</p><Button asChild variant="outline"><a href={`mailto:${supportEmail}`}>Contact support</a></Button></Panel></div></>;
}
