"use client";
import { useState } from "react";
import Link from "next/link";
import { usePreview } from "./app-shell";
import { PlanSummary } from "./summary";
import { PageHeader, Panel, Notice } from "@/components/shared/patterns";
import { PreviewButton } from "@/components/shared/preview-button";
import { IntervalChoice } from "@/components/marketing/pricing";
import { billingPresentation, canChooseInterval, displayPrice } from "@/lib/ui/presentation";

export function Billing() {
  const { preview, pricing, href } = usePreview();
  const [interval, setInterval] = useState<"month"|"year">("month");
  const state = billingPresentation[preview.plan.status];
  return <><PageHeader title="Billing" description="Manage your plan and subscription."/><div className="max-w-3xl space-y-6"><Panel title="Current plan"><PlanSummary plan={preview.plan}/>{preview.plan.status !== "free" && <h2 className="mt-6 text-xl">{state.title}</h2>}{preview.plan.hasCurrentSubscription && <div className="mt-6"><PreviewButton action="portal">Manage subscription</PreviewButton></div>}</Panel>{preview.plan.status === "confirming" && <Notice>Confirming your subscription. No Pro access has been granted. A browser return is not payment evidence. In a connected account, recheck Billing and <Link className="text-link" href={href("/app/help")}>contact support</Link> if the state remains unresolved.</Notice>}{canChooseInterval(preview.plan) && <Panel title={preview.plan.status === "expired" ? "Subscribe again" : "Choose Pro"}><p className="mb-5 text-sm leading-7 text-muted-foreground">Create and edit the Example Resource. Retained own resources remain readable and deletable when paid access ends.</p><IntervalChoice value={interval} onChange={setInterval}/><p className="my-6 text-2xl font-semibold tracking-tight">{displayPrice(pricing,interval)}<span className="mt-2 block text-sm font-normal text-muted-foreground">{interval === "month" ? "Billed monthly" : "Billed annually"} · no trial</span></p><PreviewButton action="checkout" variant="default">Continue to Checkout</PreviewButton></Panel>}<p className="text-xs leading-6 text-muted-foreground">Checkout and Customer Portal are not connected. Sample state is not proof of payment. Pro must derive from trusted financial facts and confirmed paid-through semantics.</p><Link className="text-link inline-block" href={href("/app/help")}>Need help with billing?</Link></div></>;
}
