import Link from "next/link";
import { Notice } from "@/components/shared/patterns";

export function Legal({ kind, supportEmail }: { kind: "terms" | "privacy"; supportEmail: string }) {
  const terms = kind === "terms";
  const sections = terms ? [
    ["About this service", "[Product name] is provided by [legal entity and contact address]. Describe the product, eligibility, and the agreement that applies before publication."],
    ["Your account", "Describe account responsibilities, acceptable use, and how access issues are handled. Explain the individual-account model and the support process for sensitive changes."],
    ["Plans and billing", "Set out the configured Free and Pro plans, currency, recurring billing terms, cancellation timing, and applicable refund policy."],
    ["Your content", "Explain ownership of submitted content, permitted processing, retention after downgrade, and deletion procedures for the product data you actually store."],
    ["Availability and changes", "Adapt service availability, suspension, termination, liability, dispute resolution, and change-notice terms to the actual product and applicable requirements."],
  ] : [
    ["Who is responsible", "[Legal entity] is responsible for [product name]. Add the appropriate privacy contact and business address before publication."],
    ["Information processed", "Document the account, profile, product content, billing identifiers, and operational information your product actually processes."],
    ["How information is used", "Describe each purpose and applicable legal basis, including account access, service delivery, payment handling, support, and security. Do not list processing that the product does not perform."],
    ["Providers and transfers", "Document the actual roles of hosting, identity, database, email, and payment providers, processing locations, safeguards, and contractual arrangements."],
    ["Retention and your choices", "Define retention periods, deletion handling, access and correction procedures, applicable privacy rights, and how people can contact you. Advanced email changes and automated account deletion are not provided by the starter."],
    ["Cookies and updates", "Document actual cookies and similar technologies. Explain how material changes are communicated. Do not imply consent or tracking features that are absent."],
  ];

  return <article className="site-container max-w-3xl py-16"><p className="eyebrow">Legal template</p><h1 className="mt-4 text-4xl sm:text-5xl">{terms ? "Terms of service" : "Privacy notice"}</h1><p className="mt-4 text-sm text-muted-foreground">Draft for adaptation · Effective date: [to be completed]</p><div className="my-8"><Notice tone="warning">This is an editable template, not legal advice or a completed policy. Replace placeholders and obtain appropriate review for your product and jurisdiction before publication.</Notice></div><div className="space-y-9">{sections.map(([title, copy], i) => <section key={title}><h2 className="text-xl">{i + 1}. {title}</h2><p className="mt-3 text-sm leading-8 text-muted-foreground">{copy}</p></section>)}<section><h2 className="text-xl">Contact</h2><p className="mt-3 break-words text-sm leading-8 text-muted-foreground">For questions, contact <a href={`mailto:${supportEmail}`} className="text-link">{supportEmail}</a>. The configured address must be adapted before publication.</p></section></div><Link className="text-link mt-10 inline-block" href={terms ? "/privacy" : "/terms"}>{terms ? "Read the privacy template" : "Read the terms template"}</Link></article>;
}
