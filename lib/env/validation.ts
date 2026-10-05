import { z } from "zod";

export function parseConfig<T>(schema: z.ZodType<T>, input: unknown, label: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join(".") || "configuration"))];
    throw new Error(`Invalid ${label}: ${fields.join(", ")}. Check .env.example and docs/SETUP.md; values are omitted.`);
  }
  return result.data;
}

export const httpUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  return (url.protocol === "https:" || (url.protocol === "http:" && local)) &&
    !url.username && !url.password && !url.search && !url.hash && url.pathname === "/";
});

export const optionalValue = <T>(schema: z.ZodType<T>) =>
  z.preprocess((value) => value === "" ? undefined : value, schema.optional());
