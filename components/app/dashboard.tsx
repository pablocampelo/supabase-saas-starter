"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAppUi } from "./app-shell";
import { AccountSummary, PlanSummary, ProjectRows } from "./summary";
import { Panel, PageHeader, EmptyState } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { app, href } = useAppUi();
  const canCreateProject = app.entitlements.canCreateProject;
  return <><PageHeader title="Dashboard" description={`Welcome back, ${app.user.firstName}. Your account, plan, and product starting point are here.`}/><div className="grid items-start gap-6 xl:grid-cols-[1.35fr_1fr]"><div className="space-y-6"><Panel title="Current plan"><PlanSummary plan={app.plan}/><Button asChild variant="outline" className="mt-5"><Link href={href("/app/billing")}>{app.plan.hasCurrentSubscription ? "Manage subscription" : "View Pro"}<ArrowUpRight aria-hidden="true"/></Link></Button></Panel><Panel title="Projects" action={<Link className="text-link" href={href("/app/projects")}>View all</Link>}>{app.projects.length ? <ProjectRows projects={app.projects.slice(0, 3)} href={href}/> : <EmptyState title="No projects yet" action={<Button asChild variant="outline"><Link href={href(canCreateProject ? "/app/projects/new" : "/app/billing")}>{canCreateProject ? "New project" : "View Pro"}</Link></Button>}>{canCreateProject ? "Create a project to exercise the adapted product boundary." : "Creating and editing projects requires Pro."}</EmptyState>}</Panel></div><div className="space-y-6"><Panel title="Account" action={<Link href={href("/app/account")} className="text-link">Manage</Link>}><AccountSummary user={app.user}/></Panel><section className="rounded-lg border bg-muted/50 p-6"><p className="eyebrow">Adaptability proven</p><h2 className="mt-3 text-2xl">Projects replaced the Example domain.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Auth, ownership, Billing, Account, and the app shell remain stable while the product domain changes.</p>{!canCreateProject && <Button asChild className="mt-5"><Link href={href("/app/billing")}>View Pro</Link></Button>}</section></div></div></>;
}
