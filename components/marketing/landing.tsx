import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccountSummary, ExampleRows, PlanSummary } from "@/components/app/summary";
import { Pricing } from "@/components/marketing/pricing";
import { Badge, Panel } from "@/components/shared/patterns";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { Button } from "@/components/ui/button";
import { getPreview } from "@/lib/ui/fixtures";
import type { PricingViewModel } from "@/lib/ui/models";

const faqs = [
  ["What is Supabase SaaS Starter?", "A focused Next.js foundation for individual-account subscription products. The Example Resource is deliberately small and replaceable."],
  ["What does the starter cover?", "The supported product surface is intentionally closed: public marketing, Google and email/password Auth, private user-owned data, one Free plan, one Pro entitlement, Billing, Account, Help, and the replaceable Example Resource."],
  ["Which authentication methods are supported?", "Google OAuth and email/password with verification, resend, and recovery. Magic-link authentication is intentionally not part of the product."],
  ["Why Supabase?", "Supabase is the supported identity and Postgres platform. The private-data contract uses user ownership and Postgres row-level security rather than client-side entitlement checks."],
  ["How is Stripe handled?", "The commercial model is Free plus one Pro plan, billed monthly or annually, using Checkout and Customer Portal. The billing contract derives Pro access from trusted financial facts and confirmed paid-through semantics."],
  ["Does access depend on the Checkout success page?", "No. The supported billing contract never treats a browser return as authority for Pro access."],
  ["Can I replace the Example Resource with my product?", "Yes. It is the replaceable boundary for exercising Auth, ownership, RLS, Pro gating, and CRUD together. Replacing it must not require rebuilding Auth, Billing, Account, configuration, or the app shell."],
  ["Does it support teams or organizations?", "No. Supabase SaaS Starter deliberately supports individual customer accounts only."],
  ["Is it friendly to coding agents?", "Yes. The structure favors few canonical documents, explicit boundaries, generated types, executable tests, and centralized configuration rather than agent-specific frameworks."],
  ["Where does it deploy?", "Vercel is the only supported deployment target, with Supabase and Stripe isolated across local, staging, and production environments."],
] as const;

function previewExampleHref(path: string) {
  return process.env.NODE_ENV === "development"
    ? `${path}?scenario=pro-monthly`
    : "/app/example";
}

export function Landing({ pricing }: { pricing: PricingViewModel }) {
  const demo = getPreview("pro-monthly");

  return (
    <>
      <section className="site-container grid items-start gap-12 py-12 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:py-16 xl:gap-20">
        <div className="min-w-0">
          <h1 className="font-heading text-[40px] font-semibold leading-[1.03] tracking-[-.035em] sm:text-[56px] lg:text-[clamp(48px,5vw,64px)]">
            <span className="block">Build your SaaS.</span>
            <span className="block">Start from the foundation.</span>
          </h1>
          <p className="section-copy mt-6">
            A focused Next.js foundation designed around account recovery, private data, recurring subscriptions,
            and the billing edge cases that are expensive to get wrong.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="mt-8 text-xs leading-6 text-muted-foreground">
            Next.js · TypeScript · Supabase · Stripe · Vercel
          </p>
          <PreviewNotice className="mt-4 max-w-xl">
            The visual foundation is connected to deterministic sample state while Auth, RLS persistence, and Stripe
            are implemented.
          </PreviewNotice>
        </div>

        <div className="hero-preview w-full min-w-0 max-w-xl justify-self-center rounded-lg border bg-muted/50 p-4 sm:p-6 lg:justify-self-end">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">YOUR FOUNDATION, IN PRACTICE</span>
            <Badge>Sample</Badge>
          </div>
          <div className="space-y-4">
            <Panel title="Example resources">
              <ExampleRows examples={demo.examples.slice(0, 2)} href={previewExampleHref} />
            </Panel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Panel title="Current plan">
                <PlanSummary plan={demo.plan} />
              </Panel>
              <Panel title="Account">
                <AccountSummary user={demo.user} />
                <Link href="/login" className="text-link mt-4 inline-block">
                  Sign in
                </Link>
              </Panel>
            </div>
          </div>
        </div>
      </section>

      <Pricing pricing={pricing} />

      <section id="faq" className="section-space">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="section-heading mt-4">
              Know what you’re
              <br />
              starting from.
            </h2>
            <p className="section-copy mt-5">
              A focused foundation is easier to understand, adapt, and trust.
            </p>
          </div>
          <div className="">
            {faqs.map(([question, answer], index) => (
              <details className="faq-item py-5" key={question}>
                <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium">
                  <span className="mr-1 text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{question}</span>
                  <span
                    aria-hidden="true"
                    className="faq-plus flex size-7 shrink-0 items-center justify-center rounded-full border text-lg font-normal"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 pl-9 text-sm leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
