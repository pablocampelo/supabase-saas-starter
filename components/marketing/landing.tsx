import Link from "next/link";
import { Pricing } from "@/components/marketing/pricing";
import { productConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import type { PricingViewModel } from "@/lib/ui/models";

const faqs = [
  ["What is Xerv?", "Xerv is a free, MIT-licensed Next.js foundation for individual-account subscription products. The Example Resource is deliberately small and replaceable."],
  ["Is Xerv free and open source?", "Yes. Clone, fork and adapt it under the MIT license. Configure your own Supabase, Stripe, Resend SMTP and Vercel resources."],
  ["What does the starter cover?", "The supported product surface is intentionally closed: public marketing, Google and email/password Auth, private user-owned data, one Free plan, one Pro entitlement, Billing, Account, Help, and the replaceable Example Resource."],
  ["Which authentication methods are supported?", "Google OAuth and email/password with verification, resend, and recovery. Magic-link authentication is intentionally not part of the product."],
  ["Why Supabase?", "Supabase is the supported identity and Postgres platform. The private-data contract uses user ownership and Postgres row-level security rather than client-side entitlement checks."],
  ["How is Stripe handled?", "The commercial model is Free plus one Pro plan, billed monthly or annually, using Checkout and Customer Portal. The billing contract derives Pro access from trusted financial facts and confirmed paid-through semantics."],
  ["Does access depend on the Checkout success page?", "No. The supported billing contract never treats a browser return as authority for Pro access."],
  ["Can I replace the Example Resource with my product?", "Yes. It is the replaceable boundary for exercising Auth, ownership, RLS, Pro gating, and CRUD together. Replacing it must not require rebuilding Auth, Billing, Account, configuration, or the app shell."],
  ["Does it support teams or organizations?", "No. Xerv deliberately supports individual customer accounts only."],
  ["Is it friendly to coding agents?", "Yes. The structure favors few canonical documents, explicit boundaries, generated types, executable tests, and centralized configuration rather than agent-specific frameworks."],
  ["Where does it deploy?", "Vercel is the only supported deployment target, with Supabase and Stripe isolated across local, staging, and production environments."],
] as const;

export function Landing({ pricing }: { pricing: PricingViewModel }) {
  return (
    <>
      <section className="site-container flex min-h-[72svh] flex-col justify-center py-24 sm:min-h-[76svh] sm:py-32 lg:py-40">
        <div className="w-full max-w-[1000px]">
          <h1 className="font-heading text-[clamp(42px,8.2vw,96px)] font-medium leading-[1.015] tracking-[-.045em]">
            <span className="block text-foreground">Build the product.</span>
            <span className="mt-2 block text-muted-foreground sm:mt-3">Not the infrastructure.</span>
          </h1>
          <div className="mt-9 flex max-w-[680px] flex-col items-start gap-8 sm:mt-12 sm:gap-10">
            <p className="max-w-[600px] text-base leading-8 text-secondary-foreground sm:text-lg sm:leading-8">
              The open-source Next.js foundation for authentication, private data, subscriptions, email and deployment.
              Clone Xerv, add your brand and build what makes your product different.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-w-40">
                <Link href={productConfig.repositoryUrl}>View on GitHub</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">Explore the app</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Pricing pricing={pricing} />

      <section id="faq" className="section-space border-t border-white/10">
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
          <div className="space-y-1">
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
