import { spawnSync } from "node:child_process";
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const targetFile = resolve(repoRoot, "lib/supabase/database.types.ts");
const tempDir = mkdtempSync(join(tmpdir(), "daysnotweeks-supabase-types-"));
const tempFile = join(tempDir, "database.types.ts");
const pnpm = "pnpm";

try {
  const generation = process.platform === "win32"
    ? runGenerationOnWindows(tempFile)
    : runGenerationOnUnix(tempFile);

  assertSuccess(generation);

  const generated = decodeText(readFileSync(tempFile))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  writeFileSync(tempFile, generated, "utf8");

  const formatting = process.platform === "win32"
    ? runFormattingOnWindows(tempFile)
    : runFormattingOnUnix(tempFile);
  assertSuccess(formatting);

  const formatted = readFileSync(tempFile, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  writeFileSync(targetFile, formatted, "utf8");
  console.log("Generated and formatted lib/supabase/database.types.ts as UTF-8 with LF line endings.");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

function runGenerationOnWindows(tempFile) {
  return spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "pnpm dlx supabase@2.118.0 gen types typescript --local > $env:DNW_TYPES_TMP",
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        DNW_TYPES_TMP: tempFile,
      },
      stdio: "inherit",
    },
  );
}

function runGenerationOnUnix(tempFile) {
  const output = openSync(tempFile, "w");

  try {
    return spawnSync(
      pnpm,
      ["dlx", "supabase@2.118.0", "gen", "types", "typescript", "--local"],
      {
        cwd: repoRoot,
        stdio: ["inherit", output, "inherit"],
      },
    );
  } finally {
    closeSync(output);
  }
}

function runFormattingOnWindows(tempFile) {
  return spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "pnpm dlx oxfmt@0.71.0 --write $env:DNW_TYPES_TMP",
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        DNW_TYPES_TMP: tempFile,
      },
      stdio: "inherit",
    },
  );
}

function runFormattingOnUnix(tempFile) {
  return spawnSync(
    pnpm,
    ["dlx", "oxfmt@0.71.0", "--write", tempFile],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );
}

function assertSuccess(result) {
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
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
