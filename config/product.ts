export const productConfig = {
  name: "Supabase SaaS Starter",
  shortName: "SupaSaaS",
  seo: {
    title: "Supabase SaaS Starter",
    description: "Production-ready SaaS starter built with Next.js, Supabase, Stripe and Vercel.",
  },
  legal: {
    terms: "/terms",
    privacy: "/privacy",
  },
  navigation: {
    public: [
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
    app: [
      { label: "Dashboard", href: "/app" },
      { label: "Example", href: "/app/example" },
      { label: "Billing", href: "/app/billing" },
      { label: "Account", href: "/app/account" },
      { label: "Help", href: "/app/help" },
    ],
  },
  billing: {
    currency: "usd",
    free: {
      id: "free",
      name: "Free",
      amount: 0,
    },
    pro: {
      id: "pro",
      name: "Pro",
    },
    features: {
      create: "Create Example resources",
      edit: "Edit Example resources",
      retain: "Read and delete retained own Example resources",
    },
  },
} as const;
