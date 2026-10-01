"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import type { ExampleActionState, ExampleField } from "@/lib/example/state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { previewAction } from "@/lib/ui/actions";

const title = z.string().trim().min(1, "Enter a title for this resource.").max(200, "Use 200 characters or fewer.");
const content = z.string().max(20_000, "Use 20,000 characters or fewer.");
const resourceId = z.string().uuid();

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function fields(error: z.ZodError): ExampleActionState {
  const fieldErrors: Partial<Record<ExampleField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && ["title", "content"].includes(key) && !fieldErrors[key as ExampleField]) {
      fieldErrors[key as ExampleField] = issue.message;
    }
  }
  return { status: "error", fieldErrors };
}

async function requirePro() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return { supabase, error: { status: "error", code: "generic", message: "Your session has expired. Sign in again to continue." } satisfies ExampleActionState };
  }

  const { data: hasPro, error } = await supabase.rpc("has_pro");
  if (error) {
    return { supabase, error: { status: "error", code: "generic", message: "We couldn’t verify access. Try again." } satisfies ExampleActionState };
  }
  if (!hasPro) {
    return { supabase, error: { status: "error", code: "plan_required", message: "Pro is required to create or edit Example resources." } satisfies ExampleActionState };
  }

  return { supabase, error: null };
}

function mutationError(code?: string): ExampleActionState {
  if (code === "42501") return { status: "error", code: "plan_required", message: "Pro is required to create or edit Example resources." };
  return { status: "error", code: "generic", message: "We couldn’t save this resource. Try again." };
}

export async function saveExampleAction(_previous: ExampleActionState, formData: FormData): Promise<ExampleActionState> {
  if (isE2EAuthBypassEnabled()) {
    const result = await previewAction("save-example");
    return { status: "preview", message: result.message };
  }

  const parsed = z.object({ id: z.union([z.literal("new"), resourceId]), title, content }).safeParse({
    id: stringValue(formData, "id"),
    title: stringValue(formData, "title"),
    content: stringValue(formData, "content"),
  });
  if (!parsed.success) return fields(parsed.error);

  const { supabase, error: accessError } = await requirePro();
  if (accessError) return accessError;

  if (parsed.data.id === "new") {
    const { data, error } = await supabase
      .from("example_resources")
      .insert({ title: parsed.data.title, content: parsed.data.content })
      .select("id")
      .single();
    if (error) return mutationError(error.code);

    revalidatePath("/app", "layout");
    redirect(`/app/example/${data.id}`);
  }

  const { data, error } = await supabase
    .from("example_resources")
    .update({ title: parsed.data.title, content: parsed.data.content })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();
  if (error) return mutationError(error.code);
  if (!data) return { status: "error", code: "not_found", message: "This resource is no longer available." };

  revalidatePath("/app", "layout");
  return { status: "success", message: "Resource saved." };
}

export async function deleteExampleAction(_previous: ExampleActionState, formData: FormData): Promise<ExampleActionState> {
  if (isE2EAuthBypassEnabled()) {
    const result = await previewAction("delete-example");
    return { status: "preview", message: result.message };
  }

  const parsed = resourceId.safeParse(stringValue(formData, "id"));
  if (!parsed.success) return { status: "error", code: "not_found", message: "This resource is no longer available." };

  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { status: "error", code: "generic", message: "Your session has expired. Sign in again to continue." };

  const { data, error } = await supabase.from("example_resources").delete().eq("id", parsed.data).select("id").maybeSingle();
  if (error) return { status: "error", code: "generic", message: "We couldn’t delete this resource. Try again." };
  if (!data) return { status: "error", code: "not_found", message: "This resource is no longer available." };

  revalidatePath("/app", "layout");
  redirect("/app/example");
}
