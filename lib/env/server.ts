import "server-only";
import { parseServerEnv } from "./server-schema";

export function getServerEnv() {
  return parseServerEnv(process.env);
}
