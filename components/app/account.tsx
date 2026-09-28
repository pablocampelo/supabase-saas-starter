"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAppUi } from "./app-shell";
import { Badge, PageHeader, Panel, Notice } from "@/components/shared/patterns";
import { PreviewButton } from "@/components/shared/preview-button";
import { Button } from "@/components/ui/button";
import { previewAction } from "@/lib/ui/actions";

export function Account() {
  const { app, supportEmail } = useAppUi();
  const [name, setName] = useState(app.user.name);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!name.trim()) { setError("Enter your name."); return; }
    setError("");
    setMessage((await previewAction("save-profile")).message);
  }

  return <><PageHeader title="Account" description="Manage your identity, profile, and account access."/><div className="max-w-3xl space-y-6"><Panel title="Profile"><form noValidate onSubmit={save} className="space-y-5"><label htmlFor="profile-name" className="field"><span id="profile-name-label">Name</span><input aria-labelledby="profile-name-label" id="profile-name" autoComplete="name" maxLength={100} value={name} onChange={event => setName(event.target.value)} aria-invalid={!!error} aria-describedby={error ? "name-error" : undefined}/>{error && <span id="name-error" className="field-error" role="alert">{error}</span>}</label><Button type="submit">Save changes</Button>{message && <Notice>{message}</Notice>}</form></Panel><Panel title="Email"><label className="field" htmlFor="account-email">Email address<input id="account-email" type="email" value={app.user.email} readOnly/></label><div className="my-4"><Badge tone={app.user.emailVerified ? "success" : "warning"}>{app.user.emailVerified ? "Verified" : "Unverified"}</Badge></div>{!app.user.emailVerified && <Link className="text-link" href="/verify-email">Verify your email</Link>}<p className="mt-3 text-sm leading-7 text-muted-foreground">Email changes affect account access. Contact support to request a sensitive change.</p></Panel><Panel title="Security"><p className="mb-5 text-sm leading-7 text-muted-foreground">Request a recovery link to choose a new password.</p><PreviewButton action="reset">Send password reset link</PreviewButton><Link className="text-link mt-4 inline-block" href="/forgot-password">Password recovery</Link></Panel><Panel title="Sensitive changes"><p className="mb-5 text-sm leading-7 text-muted-foreground">Advanced email changes and automated account deletion are outside the supported self-service surface. Contact support for sensitive account questions. Never share your password, card details, or secret keys.</p><Button asChild variant="outline"><a href={`mailto:${supportEmail}`}>Contact support</a></Button></Panel></div></>;
}
