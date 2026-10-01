import { spawnSync } from "node:child_process";
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const pnpmCli = process.env.npm_execpath;

if (!pnpmCli) {
  throw new Error("Run this generator through pnpm: pnpm supabase:types");
}

const tempDir = mkdtempSync(join(tmpdir(), "daysnotweeks-supabase-types-"));
const tempFile = join(tempDir, "database.types.ts");

try {
  const command = process.platform === "win32"
    ? runOnWindows(tempFile)
    : runOnUnix(tempFile);

  if (command.error) throw command.error;
  if (command.status !== 0) process.exit(command.status ?? 1);

  const raw = readFileSync(tempFile);
  const generated = decodeText(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  writeFileSync(resolve(repoRoot, "lib/supabase/database.types.ts"), generated, "utf8");
  console.log("Generated lib/supabase/database.types.ts as UTF-8 with LF line endings.");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

function runOnWindows(tempFile) {
  return spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "& $env:DNW_NODE $env:DNW_PNPM_CLI dlx supabase@2.118.0 gen types typescript --local > $env:DNW_TYPES_TMP",
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        DNW_NODE: process.execPath,
        DNW_PNPM_CLI: pnpmCli,
        DNW_TYPES_TMP: tempFile,
      },
      stdio: "inherit",
    },
  );
}

function runOnUnix(tempFile) {
  const output = openSync(tempFile, "w");

  try {
    return spawnSync(
      process.execPath,
      [pnpmCli, "dlx", "supabase@2.118.0", "gen", "types", "typescript", "--local"],
      {
        cwd: repoRoot,
        stdio: ["inherit", output, "inherit"],
      },
    );
  } finally {
    closeSync(output);
  }
}

function decodeText(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le");
  }

  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3).toString("utf8");
  }

  return buffer.toString("utf8");
}
