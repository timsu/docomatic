import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRef = process.env.DOCOMATIC_HARNESS_REF;

function refExists(ref) {
  const result = spawnSync("git", ["cat-file", "-e", `${ref}:harness/index.ts`], {
    cwd: root,
    stdio: "ignore",
  });
  return result.status === 0;
}

if (!runtimeRef || !refExists(runtimeRef)) {
  console.error("Harness runtime is unavailable. Ask the interviewer to check the environment setup.");
  process.exit(1);
}

const runtimeRoot = mkdtempSync(join(tmpdir(), "docomatic-"));

try {
  const archive = execFileSync("git", ["archive", "--format=tar", runtimeRef, "harness"], {
    cwd: root,
    maxBuffer: 16 * 1024 * 1024,
  });
  const archivePath = join(runtimeRoot, "harness.tar");
  writeFileSync(archivePath, archive);
  execFileSync("tar", ["-xf", archivePath, "-C", runtimeRoot], {
    env: { ...process.env, LANG: "C", LC_ALL: "C" },
  });
  rmSync(archivePath);

  cpSync(join(root, "src"), join(runtimeRoot, "src"), { recursive: true });

  const result = spawnSync(
    process.execPath,
    [join(root, "node_modules", "tsx", "dist", "cli.mjs"), join(runtimeRoot, "src", "pipeline.ts")],
    {
      cwd: root,
      env: {
        ...process.env,
        DOCOMATIC_HARNESS_STATE_PATH: join(runtimeRoot, ".harness-state.json"),
      },
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(runtimeRoot, { recursive: true, force: true });
}
