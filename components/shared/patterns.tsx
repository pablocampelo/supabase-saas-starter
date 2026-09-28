import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NoticeTone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium", { "border-border bg-muted text-muted-foreground": tone === "neutral", "border-success/20 bg-success/5 text-success": tone === "success", "border-warning/20 bg-warning/5 text-warning": tone === "warning", "border-destructive/20 bg-destructive/5 text-destructive": tone === "danger" })}>{children}</span>;
}

export function Notice({ children, tone = "neutral", className }: { children: ReactNode; tone?: NoticeTone; className?: string }) {
  return <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-md border p-4 text-sm leading-6", { "border-border bg-muted text-muted-foreground": tone === "neutral", "border-info/20 bg-info/5 text-info": tone === "info", "border-success/20 bg-success/5 text-success": tone === "success", "border-warning/20 bg-warning/5 text-warning": tone === "warning", "border-destructive/25 bg-destructive/5 text-destructive": tone === "danger" }, className)}>{children}</div>;
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h1 className="text-[30px] leading-[1.05] tracking-[-.02em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</div>;
}

export function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn("overflow-hidden rounded-lg border bg-card", className)}><div className="flex items-center justify-between gap-4 border-b px-5 py-4"><h2 className="font-sans text-sm font-semibold">{title}</h2>{action}</div><div className="p-5">{children}</div></section>;
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="rounded-lg border border-dashed px-5 py-12 text-center"><h2 className="text-xl">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{children}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}

export function PageSkeleton() {
  return <div role="status" aria-label="Loading page" className="space-y-6"><span className="sr-only">Loading page…</span><div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse"><div className="h-9 w-48 rounded-md bg-muted"/><div className="h-4 w-3/4 rounded-sm bg-muted"/><div className="h-44 rounded-lg border bg-muted/50"/><div className="h-64 rounded-lg border bg-muted/50"/></div></div>;
}
