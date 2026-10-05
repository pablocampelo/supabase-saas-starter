"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import type { ProjectActionState, ProjectField } from "@/lib/projects/state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { previewAction } from "@/lib/ui/actions";

const title = z.string().trim().min(1, "Enter a project title.").max(200, "Use 200 characters or fewer.");
const content = z.string().max(20_000, "Use 20,000 characters or fewer.");
const status = z.enum(["draft", "active"]);
const projectId = z.string().uuid();

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function fields(error: z.ZodError): ProjectActionState {
  const fieldErrors: Partial<Record<ProjectField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && ["title", "content", "status"].includes(key) && !fieldErrors[key as ProjectField]) {
      fieldErrors[key as ProjectField] = issue.message;
    }
  }
  return { status: "error", fieldErrors };
}

async function requirePro() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return { supabase, error: { status: "error", code: "generic", message: "Your session has expired. Sign in again to continue." } satisfies ProjectActionState };
  }
  const { data: hasPro, error } = await supabase.rpc("has_pro");
  if (error) return { supabase, error: { status: "error", code: "generic", message: "We couldn’t verify access. Try again." } satisfies ProjectActionState };
  if (!hasPro) return { supabase, error: { status: "error", code: "plan_required", message: "Pro is required to create or edit projects." } satisfies ProjectActionState };
  return { supabase, error: null };
}

function mutationError(code?: string): ProjectActionState {
  if (code === "42501") return { status: "error", code: "plan_required", message: "Pro is required to create or edit projects." };
  return { status: "error", code: "generic", message: "We couldn’t save this project. Try again." };
}

export async function saveProjectAction(_previous: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  if (isE2EAuthBypassEnabled()) {
    const result = await previewAction("save-project");
    return { status: "preview", message: result.message };
  }

  const parsed = z.object({ id: z.union([z.literal("new"), projectId]), title, content, status }).safeParse({
    id: stringValue(formData, "id"),
    title: stringValue(formData, "title"),
    content: stringValue(formData, "content"),
    status: stringValue(formData, "status"),
  });
  if (!parsed.success) return fields(parsed.error);

  const { supabase, error: accessError } = await requirePro();
  if (accessError) return accessError;

  if (parsed.data.id === "new") {
    const { data, error } = await supabase.from("projects").insert({
      title: parsed.data.title,
      content: parsed.data.content,
      status: parsed.data.status,
    }).select("id").single();
    if (error) return mutationError(error.code);

    revalidatePath("/app", "layout");
    redirect(`/app/projects/${data.id}`);
  }

  const { data, error } = await supabase.from("projects").update({
    title: parsed.data.title,
    content: parsed.data.content,
    status: parsed.data.status,
  }).eq("id", parsed.data.id).select("id").maybeSingle();
  if (error) return mutationError(error.code);
  if (!data) return { status: "error", code: "not_found", message: "This project is no longer available." };

  revalidatePath("/app", "layout");
  return { status: "success", message: "Project saved." };
}

export async function deleteProjectAction(_previous: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  if (isE2EAuthBypassEnabled()) {
    const result = await previewAction("delete-project");
    return { status: "preview", message: result.message };
  }

  const parsed = projectId.safeParse(stringValue(formData, "id"));
  if (!parsed.success) return { status: "error", code: "not_found", message: "This project is no longer available." };

  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { status: "error", code: "generic", message: "Your session has expired. Sign in again to continue." };

  const { data, error } = await supabase.from("projects").delete().eq("id", parsed.data).select("id").maybeSingle();
  if (error) return { status: "error", code: "generic", message: "We couldn’t delete this project. Try again." };
  if (!data) return { status: "error", code: "not_found", message: "This project is no longer available." };

  revalidatePath("/app", "layout");
  redirect("/app/projects");
}
