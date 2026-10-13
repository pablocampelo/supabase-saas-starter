export const productConfig = {
  name: "Xerv",
  shortName: "Xerv",
  seo: {
    title: "Xerv — Open-source SaaS foundation",
    description: "Build the product, not the infrastructure. Open-source Next.js SaaS foundation with Supabase, Stripe, Resend SMTP and Vercel.",
  },
  legal: {
    terms: "/terms",
    privacy: "/privacy",
  },
  navigation: {
    public: [
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "GitHub", href: "https://github.com/pablocampelo/xerv" },
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
