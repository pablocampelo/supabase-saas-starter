import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExampleSummaryViewModel } from "@/lib/ui/models";

// Keep the existing Dashboard/list limits and owner-scoped RLS reads.
// Full content belongs to the detail route, never to the shared app shell.
export async function getExampleSummaries(limit: 3 | 50): Promise<ExampleSummaryViewModel[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("example_resources")
    .select("id,title,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error("APP_DATA_LOAD_FAILED");

  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
  }));
}
