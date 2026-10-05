"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppUi } from "./app-shell";
import { PlanSummary } from "./summary";
import { PageHeader, Panel, Notice } from "@/components/shared/patterns";
import { PreviewButton } from "@/components/shared/preview-button";
import { Button } from "@/components/ui/button";
import { IntervalChoice } from "@/components/marketing/pricing";
import { createCheckoutAction, createPortalAction } from "@/lib/billing/actions";
import { billingPresentation, canChooseInterval, displayPrice } from "@/lib/ui/presentation";

export function Billing() {
  const { app, pricing, href, billingLive } = useAppUi();
  const search = useSearchParams();
  const [interval, setInterval] = useState<"month" | "year">("month");
  const state = billingPresentation[app.plan.status];
  const selectedPrice = interval === "month" ? pricing.monthly : pricing.annual;
  const checkoutReturn = search.get("checkout");
  const billingMessage = search.get("billing");
  const portalMessage = search.get("portal");

  return <><PageHeader title="Billing" description="Manage your plan, paid access, and subscription."/><div className="max-w-3xl space-y-6">
    {checkoutReturn === "returned" && <Notice tone="info">Checkout returned to the app. Pro is granted only after Stripe confirms the paid invoice through the signed webhook.</Notice>}
    {checkoutReturn === "cancelled" && <Notice>Checkout was canceled. No paid access was granted.</Notice>}
    {billingMessage === "already-subscribed" && <Notice tone="info">An existing subscription is already associated with this account. Manage it through the Customer Portal.</Notice>}
    {billingMessage === "checkout-preparing" && <Notice tone="info">A Checkout session is already being prepared for this account. Try again shortly.</Notice>}
    {portalMessage === "unavailable" && <Notice tone="warning">Customer Portal is not available until a Stripe customer has been associated with this account.</Notice>}
    <Panel title="Current plan"><PlanSummary plan={app.plan}/>{app.plan.status !== "free" && <h2 className="mt-6 text-xl">{state.title}</h2>}{app.plan.hasCurrentSubscription && <div className="mt-6">{billingLive ? <form action={createPortalAction}><Button type="submit" variant="outline">Manage subscription</Button></form> : <PreviewButton action="portal">Manage subscription</PreviewButton>}</div>}</Panel>
    {app.plan.status === "confirming" && <Notice tone="info">Confirming your subscription. No Pro access has been granted. A browser return is not payment evidence. Recheck Billing and <Link className="text-link" href={href("/app/help")}>contact support</Link> if the state remains unresolved.</Notice>}
    {app.plan.status === "past_due" && <Notice tone="warning">The latest payment did not extend paid access. Previously confirmed access remains only through its paid-through date.</Notice>}
    {app.plan.status === "failed" && <Notice tone="danger">Payment was not confirmed and no Pro access was granted. Try Checkout again or contact support.</Notice>}
    {canChooseInterval(app.plan) && <Panel title={app.plan.status === "expired" ? "Subscribe again" : "Choose Pro"}><p className="mb-5 text-sm leading-7 text-muted-foreground">Create and edit the Example Resource. Retained own resources remain readable and deletable when paid access ends.</p><IntervalChoice value={interval} onChange={setInterval}/><p className="my-6 text-2xl font-semibold tracking-tight">{displayPrice(pricing, interval)}<span className="mt-2 block text-sm font-normal text-muted-foreground">{interval === "month" ? "Billed monthly" : "Billed annually"} · no trial</span></p>{billingLive ? <form action={createCheckoutAction}><input type="hidden" name="interval" value={interval}/><Button type="submit" disabled={selectedPrice === null}>Continue to Checkout</Button></form> : <PreviewButton action="checkout" variant="default">Continue to Checkout</PreviewButton>}</Panel>}
    <p className="text-xs leading-6 text-muted-foreground">A browser return never grants Pro. Access is derived from trusted server-side billing facts and the confirmed paid-through period.</p><Link className="text-link inline-block" href={href("/app/help")}>Need help with billing?</Link>
  </div></>;
}
