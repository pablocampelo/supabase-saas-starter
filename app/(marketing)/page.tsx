import { publicMetadata } from "@/config/metadata";
import { Landing } from "@/components/marketing/landing";
import { getPricingView } from "@/config/pricing";

export const metadata = publicMetadata(
  "Production-ready SaaS starter",
  "Build on Next.js, Supabase, Stripe and Vercel with connected Auth, private data, subscriptions and billing recovery.",
  "/",
);

export default async function Home() {
  return <Landing pricing={await getPricingView()}/>;
}
