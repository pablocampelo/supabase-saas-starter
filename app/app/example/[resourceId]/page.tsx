import { z } from "zod";
import { ExampleDetail } from "@/components/app/example";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import { toExampleResourceViewModel } from "@/lib/example/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Example Resource" };

export default async function Page({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  if (resourceId === "new" || isE2EAuthBypassEnabled()) return <ExampleDetail key={resourceId} id={resourceId}/>;

  const parsed = z.string().uuid().safeParse(resourceId);
  if (!parsed.success) return <ExampleDetail key={resourceId} id={resourceId} resource={null}/>;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("example_resources")
    .select("id,title,content,created_at,updated_at")
    .eq("id", parsed.data)
    .maybeSingle();
  if (error) throw new Error("EXAMPLE_RESOURCE_LOAD_FAILED");

  return <ExampleDetail key={resourceId} id={resourceId} resource={data ? toExampleResourceViewModel(data) : null}/>;
}
