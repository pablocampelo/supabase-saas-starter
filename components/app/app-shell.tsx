"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, LayoutDashboard, FileText, CreditCard, UserRound, CircleHelp, ChevronDown } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice, PageSkeleton } from "@/components/shared/patterns";
import { PreviewButton } from "@/components/shared/preview-button";
import { productConfig } from "@/config/product";
import { getPreview, resolveScenario } from "@/lib/ui/fixtures";
import type { PreviewViewModel, PricingViewModel } from "@/lib/ui/models";

type Context = { preview: PreviewViewModel; href: (path:string)=>string; pricing:PricingViewModel; supportEmail:string };
const PreviewContext = createContext<Context | null>(null);
export function usePreview() { const context = useContext(PreviewContext); if (!context) throw new Error("Preview provider missing"); return context; }
const icons = [LayoutDashboard,FileText,CreditCard,UserRound,CircleHelp];
export function AppShell({ children, pricing, supportEmail }: { children:ReactNode; pricing:PricingViewModel; supportEmail:string }) {
  const search = useSearchParams(); const pathname = usePathname();
  const scenario = resolveScenario(search.get("scenario"), process.env.NODE_ENV === "development");
  const preview = getPreview(scenario);
  const href = (path:string) => process.env.NODE_ENV === "development" && scenario !== "free" ? `${path}?scenario=${scenario}` : path;
  const [drawer, setDrawer] = useState(false); const [userMenu,setUserMenu] = useState(false);
  const navigation = <nav aria-label="App navigation" className="space-y-1">{productConfig.navigation.app.map((item,i) => { const Icon = icons[i]!; const active = item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href); return <div key={item.href} className={i === 2 ? "mt-5 border-t pt-5" : ""}><Link href={href(item.href)} aria-current={active ? "page" : undefined} onClick={() => setDrawer(false)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${active ? "bg-accent font-medium" : "text-muted-foreground hover:bg-muted"}`}><Icon className="size-4" aria-hidden="true"/>{item.label}</Link></div>; })}</nav>;
  return <PreviewContext value={{preview,href,pricing,supportEmail}}><a className="skip-link" href="#main">Skip to content</a><header className="sticky top-0 z-20 border-b bg-background"><div className="site-container flex h-16 items-center justify-between gap-3"><div className="flex items-center gap-3"><Button className="md:hidden" size="sm" variant="ghost" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu aria-hidden="true"/></Button><Brand href={href("/app")}/></div><div className="relative"><Button variant="ghost" size="sm" aria-expanded={userMenu} aria-controls="account-menu" onClick={() => setUserMenu(!userMenu)}><span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs">DA</span><span className="hidden sm:inline">Demo account</span><ChevronDown aria-hidden="true"/></Button>{userMenu && <div id="account-menu" className="absolute right-0 top-12 w-60 rounded-lg border bg-background p-4 shadow-sm" onKeyDown={event => {if(event.key === "Escape") {setUserMenu(false); (event.currentTarget.previousElementSibling as HTMLElement)?.focus();}}}><p className="mb-3 text-xs text-muted-foreground">Demo account · UI preview</p><Link className="text-link mb-4 block" href={href("/app/account")} onClick={() => setUserMenu(false)}>Manage account</Link><PreviewButton action="logout">Sign out</PreviewButton></div>}</div></div></header><Dialog drawer open={drawer} onClose={() => setDrawer(false)} title="Your account">{navigation}</Dialog><div className="site-container flex gap-12 py-8 md:py-10"><aside className="hidden w-[200px] shrink-0 md:block">{navigation}<p className="mt-10 px-3 text-xs leading-6 text-muted-foreground">The starter, in practice.<br/>A sample individual account.</p></aside><main id="main" className="min-w-0 flex-1"><div className="mb-7 rounded-md border bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground"><strong className="font-medium text-foreground">UI preview</strong> · Sample data. No account, saved changes, or payments.{scenario !== "free" && <span className="ml-1">Scenario: {scenario}.</span>}</div>{preview.display === "loading" ? <PageSkeleton/> : preview.display === "error" ? <div className="space-y-5"><h1 className="text-3xl">Unable to load this page</h1><Notice danger>This is a safe error preview. Your data has not changed. Reference: UI-PREVIEW.</Notice><Button asChild><Link href={pathname}>Try again</Link></Button><p><Link href={href("/app/help")} className="text-link">Contact support</Link></p></div> : children}</main></div></PreviewContext>;
}
