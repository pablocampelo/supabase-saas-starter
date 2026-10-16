import { ExampleList } from "@/components/app/example";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import { getExampleSummaries } from "@/lib/example/queries";

export const metadata = { title: "Example" };

export default async function Page() {
  if (isE2EAuthBypassEnabled()) return <ExampleList/>;
  return <ExampleList examples={await getExampleSummaries(50)}/>;
}
