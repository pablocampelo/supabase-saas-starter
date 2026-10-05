export type ExampleField = "title" | "content";

export type ExampleActionState = {
  status: "idle" | "error" | "success" | "preview";
  message?: string;
  fieldErrors?: Partial<Record<ExampleField, string>>;
  code?: "plan_required" | "not_found" | "generic";
};

export const initialExampleActionState: ExampleActionState = { status: "idle" };
