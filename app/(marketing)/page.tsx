import { publicMetadata } from "@/config/metadata";
import { Landing } from "@/components/marketing/landing";
import { getPricingView } from "@/config/pricing";

export const metadata = publicMetadata(
  "The SaaS foundation",
  "Explore the DaysNotWeeks UI: account flows, the replaceable Example Resource, and subscription states.",
  "/",
);

export default async function Home() {
  return <Landing pricing={await getPricingView()}/>;
}
