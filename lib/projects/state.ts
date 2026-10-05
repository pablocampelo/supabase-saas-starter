export type ProjectField = "title" | "content" | "status";

export type ProjectActionState = {
  status: "idle" | "error" | "success" | "preview";
  message?: string;
  fieldErrors?: Partial<Record<ProjectField, string>>;
  code?: "plan_required" | "not_found" | "generic";
};

export const initialProjectActionState: ProjectActionState = { status: "idle" };
