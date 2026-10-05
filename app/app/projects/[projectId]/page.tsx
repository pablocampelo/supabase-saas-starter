import { z } from "zod";
import { ProjectDetail } from "@/components/app/projects";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import { toProjectViewModel } from "@/lib/projects/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Project" };

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (projectId === "new" || isE2EAuthBypassEnabled()) return <ProjectDetail key={projectId} id={projectId}/>;

  const parsed = z.string().uuid().safeParse(projectId);
  if (!parsed.success) return <ProjectDetail key={projectId} id={projectId} project={null}/>;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id,title,content,status,created_at,updated_at")
    .eq("id", parsed.data)
    .maybeSingle();
  if (error) throw new Error("PROJECT_LOAD_FAILED");

  return <ProjectDetail key={projectId} id={projectId} project={data ? toProjectViewModel(data) : null}/>;
}
