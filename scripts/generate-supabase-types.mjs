import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const pnpmCli = process.env.npm_execpath;

if (!pnpmCli) {
  throw new Error("Run this generator through pnpm: pnpm supabase:types");
}

const result = spawnSync(
  process.execPath,
  [pnpmCli, "dlx", "supabase@2.118.0", "gen", "types", "typescript", "--local"],
  {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "inherit"],
  },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

writeFileSync(
  resolve(repoRoot, "lib/supabase/database.types.ts"),
  result.stdout ?? "",
  "utf8",
);

console.log("Generated lib/supabase/database.types.ts as UTF-8.");
