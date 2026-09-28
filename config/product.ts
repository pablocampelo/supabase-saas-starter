export const productConfig = {
  name: "DaysNotWeeks",
  seo: { title: "DaysNotWeeks", description: "A focused SaaS foundation for individual-account subscription products." },
  legal: { terms: "/terms", privacy: "/privacy" },
  navigation: {
    public: [{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "FAQ", href: "/#faq" }],
    app: [{ label: "Dashboard", href: "/app" }, { label: "Notes", href: "/app/notes" }, { label: "Billing", href: "/app/billing" }, { label: "Account", href: "/app/account" }, { label: "Help", href: "/app/help" }],
  },
  billing: {
    currency: "usd",
    free: { id: "free", name: "Free", amount: 0 },
    pro: { id: "pro", name: "Pro" },
    features: { create: "Create notes", edit: "Edit notes", retain: "Read and delete retained own notes" },
  },
} as const;
