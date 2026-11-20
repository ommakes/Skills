#!/usr/bin/env node
// Type-checks every registry component the way a consumer app compiles it. CI runs it in the registry-build job.
//
// Why: check-syntax.mjs only parses, so a wrong prop, a missing export or a broken import between two items shipped
// with every check green. The components import `@/components/ui/<name>` and `@/lib/<name>`, which only resolve inside
// an app. This writes a throwaway tsconfig whose `paths` send each of those to the registry file that installs there
// (the harness's aliasMap, so the harness and this check agree), plus shadcn's `cn` from harness/src/lib/utils.ts, and
// runs `tsc --noEmit` in strict mode with React 19 types.
//
// Bad input fails closed: no file to check, or tsc missing, is a failure, never a pass.
//
// Usage: node registry/scripts/typecheck.mjs

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { aliasMap } from "../harness/build.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

/** Every .ts and .tsx file under registry/vois, as absolute paths. Symbolic links are not followed. */
export function sourceFiles(dir = join(registryDir, "vois")) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(p));
    else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) out.push(p);
  }
  return out.sort();
}

/** The tsconfig a consumer app would have, with `@/` imports pointed at the registry files. */
export function tsconfigFor(aliases, files) {
  const paths = {};
  for (const [alias, file] of aliases) paths[alias] = [file];
  return {
    compilerOptions: {
      target: "ES2022",
      lib: ["DOM", "DOM.Iterable", "ES2022"],
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      isolatedModules: true,
      esModuleInterop: true,
      allowJs: false,
      types: [],
      typeRoots: [join(registryDir, "node_modules", "@types")],
      baseUrl: registryDir,
      paths,
    },
    files: [...files, aliases.get("@/lib/utils")],
  };
}

/**
 * Runs tsc over every registry file, plus `extraFiles` (for tests). Returns { ok, out, files }.
 * Throws when typescript is missing or there is nothing to check, so a broken setup never reads as a pass.
 */
export function typecheck(extraFiles = []) {
  const tsc = join(registryDir, "node_modules", "typescript", "bin", "tsc");
  if (!existsSync(tsc)) throw new Error("typescript is not installed. Run npm ci in registry/ first.");
  const files = sourceFiles();
  if (files.length === 0) throw new Error("no component files under registry/vois.");
  const registry = JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf8"));
  const dir = mkdtempSync(join(tmpdir(), "vois-typecheck-"));
  try {
    const config = join(dir, "tsconfig.json");
    writeFileSync(config, JSON.stringify(tsconfigFor(aliasMap(registry), [...files, ...extraFiles]), null, 2));
    const run = spawnSync(process.execPath, [tsc, "-p", config, "--pretty", "false"], { cwd: registryDir, encoding: "utf8" });
    const out = `${run.stdout ?? ""}${run.stderr ?? ""}`.trim();
    return { ok: run.status === 0, out: out || (run.status === 0 ? "" : `tsc exited ${run.status}`), files: files.length };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function main() {
  let result;
  try {
    result = typecheck();
  } catch (e) {
    console.error(`typecheck: ${e.message}`);
    process.exit(1);
  }
  if (!result.ok) {
    console.error(result.out);
    process.exit(1);
  }
  console.log(`typecheck: OK (${result.files} files)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
