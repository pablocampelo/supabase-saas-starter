import { notFound } from "next/navigation";
import { ExampleDetail } from "@/components/app/example";
import { fixtureExampleIds } from "@/lib/ui/fixtures";

export const metadata = { title: "Example Resource" };

export default async function Page({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  if (resourceId !== "new" && !fixtureExampleIds.includes(resourceId)) notFound();
  return <ExampleDetail key={resourceId} id={resourceId}/>;
}
