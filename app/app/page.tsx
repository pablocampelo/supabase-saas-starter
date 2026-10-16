import { Dashboard } from "@/components/app/dashboard";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import { getExampleSummaries } from "@/lib/example/queries";

export const metadata = { title:"Dashboard" };

export default async function Page() {
  if (isE2EAuthBypassEnabled()) return <Dashboard/>;
  return <Dashboard examples={await getExampleSummaries(3)}/>;
}
