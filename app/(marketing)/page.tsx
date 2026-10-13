import { publicMetadata } from "@/config/metadata";
import { Landing } from "@/components/marketing/landing";
import { getPricingView } from "@/config/pricing";

export const metadata = publicMetadata(
  "Xerv — Build the product, not the infrastructure",
  "Open-source Next.js SaaS foundation with Supabase Auth and RLS, Stripe subscriptions, Resend SMTP and Vercel.",
  "/",
);

export default async function Home() {
  return <Landing pricing={await getPricingView()}/>;
}
