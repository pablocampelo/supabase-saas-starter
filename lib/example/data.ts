import type { Tables } from "@/lib/supabase/database.types";
import type { ExampleResourceViewModel } from "@/lib/ui/models";

export type ExampleResourceRow = Pick<
  Tables<"example_resources">,
  "id" | "title" | "content" | "created_at" | "updated_at"
>;

export function toExampleResourceViewModel(row: ExampleResourceRow): ExampleResourceViewModel {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
