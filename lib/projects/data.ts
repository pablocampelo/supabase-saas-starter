import type { Tables } from "@/lib/supabase/database.types";
import type { ProjectViewModel } from "@/lib/ui/models";

export type ProjectRow = Pick<
  Tables<"projects">,
  "id" | "title" | "content" | "status" | "created_at" | "updated_at"
>;

export function toProjectViewModel(row: ProjectRow): ProjectViewModel {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    status: row.status === "active" ? "active" : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
