#!/usr/bin/env node
// Checks that every references/*.md file in a skill is named in that skill's SKILL.md.
//
// A reference file that SKILL.md never names is invisible to an agent that reads SKILL.md first. It can only
// be found by chance. Name the file in the reference list or in the text that tells the reader when to open it.
//
// "Named" means the path under references/ (`references/color.md`), the path with the skill name in front
// (`vois-tokens/references/color.md`), or the bare path (`color.md`), written as a whole name, with the same case
// (two files that differ only by case are two files on Linux). `x-color.md` does not
// name `color.md`. Another skill's `other/references/color.md` does not name this skill's `color.md`.
//
// Only .md files count. Templates and other files in references/ are not checked.
// A file that is meant to stay unnamed goes in scripts/reference-files-allow.json with a reason. An entry that is
// no longer needed (the file is named now, or gone) is also a problem, so the list cannot grow stale.
//
// Usage: node scripts/check-reference-files.mjs [--root <repo>]

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { skillDirs } from "./check-skill-paths.mjs";

/** Every .md file under <skill>/references/, as a path relative to references/, with forward slashes. */
export function referenceFiles(root, skill) {
  const base = join(root, skill, "references");
  if (!existsSync(base) || !statSync(base).isDirectory()) return [];
  const out = [];
  const walk = (dir, rel) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      if (e.isDirectory()) walk(join(dir, e.name), rel + e.name + "/");
      else if (e.isFile() && /\.md$/i.test(e.name)) out.push(rel + e.name);
    }
  };
  walk(base, "");
  return out.sort();
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True when the text names the reference file `rel` (a path under references/) of `skill`. */
export function isNamed(text, skill, rel) {
  // The name must not start inside a longer path or word, and must not run on into a longer name.
  const re = new RegExp(`(?<![A-Za-z0-9_./\\\\-])(?:\\.\\/)?(?:(?:${escape(skill)}/)?references/)?${escape(rel)}(?![A-Za-z0-9_-])(?!\\.[A-Za-z0-9])`);
  return re.test(text);
}

export function check(root, allow = {}) {
  const problems = [];
  const used = new Set();
  for (const skill of skillDirs(root)) {
    const files = referenceFiles(root, skill);
    if (!files.length) continue;
    const text = readFileSync(join(root, skill, "SKILL.md"), "utf8");
    for (const rel of files) {
      if (isNamed(text, skill, rel)) continue;
      const key = `${skill}:${rel}`;
      if (Object.hasOwn(allow, key)) { used.add(key); continue; }
      problems.push(`${skill}/references/${rel} is not named in ${skill}/SKILL.md. Name it where the reader is told when to open it.`);
    }
  }
  for (const [key, why] of Object.entries(allow)) if (typeof why !== "string" || !why.trim()) problems.push(`reference-files-allow.json: "${key}" needs a reason (a non-empty string).`);
  for (const key of Object.keys(allow)) if (!used.has(key)) problems.push(`reference-files-allow.json: "${key}" is listed but the file is named in SKILL.md now, or does not exist. Remove it.`);
  return problems;
}

function main(argv) {
  const i = argv.indexOf("--root");
  const root = resolve(i > -1 ? argv[i + 1] : join(dirname(fileURLToPath(import.meta.url)), ".."));
  const allowFile = join(root, "scripts", "reference-files-allow.json");
  let allow = {};
  if (existsSync(allowFile)) {
    const parsed = JSON.parse(readFileSync(allowFile, "utf8")).allow;
    // A wrong type must not turn into "allow everything": anything but a plain object is a problem.
    if (parsed !== undefined && (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))) {
      console.error("❌ reference-files-allow.json: \"allow\" must be an object of <skill>:<file> keys to reasons.");
      process.exit(1);
    }
    allow = parsed || {};
  }
  const problems = check(root, allow);
  if (problems.length) {
    for (const p of problems) console.error(`❌ ${p}`);
    console.error(`check-reference-files: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log("check-reference-files: OK");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
