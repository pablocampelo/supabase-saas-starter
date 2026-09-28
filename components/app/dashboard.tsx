"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePreview } from "./app-shell";
import { AccountSummary, ExampleRows, PlanSummary } from "./summary";
import { Panel, PageHeader, EmptyState } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { preview, href } = usePreview();
  const pro = preview.plan.tier === "pro";
  return <><PageHeader title="Dashboard" description={`Welcome back, ${preview.user.firstName}. Here's an overview of your account.`}/><div className="grid items-start gap-6 xl:grid-cols-[1.35fr_1fr]"><div className="space-y-6"><Panel title="Current plan"><PlanSummary plan={preview.plan}/><Button asChild variant="outline" className="mt-5"><Link href={href("/app/billing")}>{preview.plan.hasCurrentSubscription ? "Manage subscription" : "Upgrade to Pro"}<ArrowUpRight aria-hidden="true"/></Link></Button></Panel><Panel title="Example" action={<Link className="text-link" href={href("/app/example")}>View all</Link>}>{preview.examples.length ? <ExampleRows examples={preview.examples.slice(0,3)} href={href}/> : <EmptyState title="No Example resources yet" action={<Button asChild variant="outline"><Link href={href(pro ? "/app/example/new" : "/app/billing")}>{pro ? "New resource" : "Upgrade to Pro"}</Link></Button>}>{pro ? "Use this small resource to verify the foundation end to end." : "Creating and editing the Example Resource requires Pro."}</EmptyState>}</Panel></div><div className="space-y-6"><Panel title="Account" action={<Link href={href("/app/account")} className="text-link">Manage</Link>}><AccountSummary user={preview.user}/></Panel>{!pro && <section className="rounded-lg border bg-muted/50 p-6"><h2 className="text-2xl">Unlock Pro</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Create and edit the replaceable Example Resource with a Pro subscription.</p><Button asChild className="mt-5"><Link href={href("/app/billing")}>View plans</Link></Button></section>}</div></div></>;
}
