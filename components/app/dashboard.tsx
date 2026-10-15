"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAppUi } from "./app-shell";
import { AccountSummary, ExampleRows, PlanSummary } from "./summary";
import { Panel, PageHeader, EmptyState } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";
import type { ExampleSummaryViewModel } from "@/lib/ui/models";

export function Dashboard({ examples: suppliedExamples }: { examples?: ExampleSummaryViewModel[] }) {
  const { app, href, previewExamples } = useAppUi();
  const examples = suppliedExamples ?? previewExamples ?? [];
  const canCreateExample = app.entitlements.canCreateExample;
  return <><PageHeader title="Dashboard" description={`Welcome back, ${app.user.firstName}. Your account, plan, and product starting point are here.`}/><div className="grid items-start gap-6 xl:grid-cols-[1.35fr_1fr]"><div className="space-y-6"><Panel title="Current plan"><PlanSummary plan={app.plan}/><Button asChild variant="outline" className="mt-5"><Link href={href("/app/billing")}>{app.plan.hasCurrentSubscription ? "Manage subscription" : "View Pro"}<ArrowUpRight aria-hidden="true"/></Link></Button></Panel><Panel title="Example" action={<Link className="text-link" href={href("/app/example")}>View all</Link>}>{examples.length ? <ExampleRows examples={examples.slice(0, 3)} href={href}/> : <EmptyState title="No Example resources yet" action={<Button asChild variant="outline"><Link href={href(canCreateExample ? "/app/example/new" : "/app/billing")}>{canCreateExample ? "New resource" : "View Pro"}</Link></Button>}>{canCreateExample ? "Create a resource to exercise the product boundary end to end." : "Creating and editing the Example Resource requires Pro."}</EmptyState>}</Panel></div><div className="space-y-6"><Panel title="Account" action={<Link href={href("/app/account")} className="text-link">Manage</Link>}><AccountSummary user={app.user}/></Panel><section className="rounded-xl border bg-card p-6"><p className="eyebrow">Your product starts here</p><h2 className="mt-3 text-2xl">Replace the Example, not the foundation.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Keep Auth, ownership, Billing, Account, and the app shell stable while your real domain replaces this resource.</p>{!canCreateExample && <Button asChild className="mt-5"><Link href={href("/app/billing")}>View Pro</Link></Button>}</section></div></div></>;
}
