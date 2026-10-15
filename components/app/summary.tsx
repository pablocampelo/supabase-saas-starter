import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { Badge } from "@/components/shared/patterns";
import { billingPresentation, displayDate } from "@/lib/ui/presentation";
import type { AccountPlanViewModel, ExampleSummaryViewModel, UserViewModel } from "@/lib/ui/models";

export function PlanSummary({ plan }: { plan: AccountPlanViewModel }) {
  const state = billingPresentation[plan.status];
  return <div><div className="flex items-center gap-3"><h3 className="text-2xl">{plan.tier === "pro" ? "Pro" : "Free"}</h3><Badge tone={state.tone}>{state.label}</Badge></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{state.description}</p>{plan.interval && <p className="mt-4 text-sm">{plan.interval === "month" ? "Monthly" : "Annual"} subscription</p>}{plan.currentPeriodEnd && <p className="mt-2 text-sm text-muted-foreground">{plan.status === "past_due" ? "Previously paid through" : "Paid through"} {displayDate(plan.currentPeriodEnd)}</p>}</div>;
}

export function AccountSummary({ user }: { user: UserViewModel }) {
  return <div><p className="font-medium">{user.name}</p><p className="mt-2 break-all text-sm text-muted-foreground">{user.email}</p><div className="mt-4"><Badge tone={user.emailVerified ? "success" : "warning"}>{user.emailVerified ? "Email verified" : "Email unverified"}</Badge></div></div>;
}

export function ExampleRows({ examples, href = (path: string) => path }: { examples: ExampleSummaryViewModel[]; href?: (path:string)=>string }) {
  return <ul className="divide-y">{examples.map(example => <li key={example.id}><Link href={href(`/app/example/${example.id}`)} className="group flex items-center gap-3 rounded-md py-4 hover:bg-muted"><FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{example.title}</p><p className="mt-1 text-xs text-muted-foreground">Updated {displayDate(example.updatedAt)}</p></div><ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground"/></Link></li>)}</ul>;
}
