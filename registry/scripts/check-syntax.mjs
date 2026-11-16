#!/usr/bin/env node
// Parses every TypeScript file under registry/vois/ and fails on a syntax error. CI runs it in the registry-build job.
//
// Why: `shadcn build` copies a component into JSON without compiling it, and check-registry.mjs and the vois-tokens
// detectors read the files with regexes. So a missing bracket, left behind by a merge, shipped with every other
// check green. This parses each file with esbuild, which is syntax only. It does not type-check: the components
// import @/lib/utils and @/components/ui/*, which only resolve inside a consumer app.
//
// Bad input fails closed: no file to read is a problem, never a pass.
//
// Usage: node registry/scripts/check-syntax.mjs

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOADERS = { ".tsx": "tsx", ".ts": "ts" };

/** Every .ts and .tsx file under `dir`, as absolute paths, sorted. Symbolic links are not followed. */
export function sourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (entry.isFile() && Object.hasOwn(LOADERS, extname(entry.name))) out.push(path);
  }
  return out.sort();
}

/**
 * Syntax problems in a list of files, as "path:line:col: message" strings. An empty list is itself a problem.
 * esbuild usually stops at the first syntax error of a file, so a bad file usually gives one line; every error it does
 * report is listed. Every bad file is reported, not just the first.
 */
export async function syntaxProblems(files, root = registryDir) {
  if (files.length === 0) return ["no .ts or .tsx file found to parse"];
  const problems = [];
  for (const file of files) {
    const name = relative(root, file).split("\\").join("/");
    const ext = extname(file);
    const loader = Object.hasOwn(LOADERS, ext) ? LOADERS[ext] : null;
    if (!loader) { problems.push(`${name}: not a .ts or .tsx file, so it cannot be parsed`); continue; }
    try {
      await transform(readFileSync(file, "utf8"), { loader, sourcefile: name, logLevel: "silent" });
    } catch (e) {
      const errors = Array.isArray(e?.errors) && e.errors.length ? e.errors : [{ text: String(e?.message ?? e) }];
      for (const err of errors) {
        const at = err.location ? `${err.location.line}:${err.location.column}` : "?";
        problems.push(`${name}:${at}: ${err.text}`);
      }
    }
  }
  return problems;
}

/** Check every .ts and .tsx file under `dir`. A directory that cannot be read is a problem, not a crash. */
export async function checkDirectory(dir, root = registryDir) {
  let files;
  try { files = sourceFiles(dir); }
  catch (e) { return { files: [], problems: [`${relative(root, dir) || dir}: cannot be read (${e.code ?? e.message})`] }; }
  return { files, problems: await syntaxProblems(files, root) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { files, problems } = await checkDirectory(join(registryDir, "vois"));
  if (problems.length) {
    for (const p of problems) console.error(`FAIL ${p}`);
    process.exit(1);
  }
  console.log(`check-syntax: OK (${files.length} files)`);
}
