#!/usr/bin/env node
// Checks that every file path a SKILL.md names can be found.
//
// A path is found when it resolves from the skill's own folder, or from the repo root when it starts with a skill
// folder name (`vois-tokens/data/tokens.json`). A bare path that only exists in another skill is a problem: a reader
// who is in one skill folder would look for it in the wrong place. Write it with the skill name in front.
//
// Paths that are not meant to exist are listed in scripts/skill-paths-allow.json, each with a reason. A path that
// is listed there but no longer appears in its SKILL.md is also a problem, so the list cannot grow stale.
//
// Usage: node scripts/check-skill-paths.mjs [--root <repo>]

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, normalize, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const EXT = "md|json|mjs|cjs|js|ts|tsx|jsx|py|sh|css|yml|yaml|html|txt|template|svg|png|csv|sql|toml|jsonl|mdx|mts|cts";
// A file path: optional ./ or ../, then segments, then a known extension. Placeholders and globs are skipped below.
const FILE = new RegExp(`(?<![A-Za-z0-9_@./~$-])((?:\\.{1,2}/)?[A-Za-z0-9_@.-]+(?:/[A-Za-z0-9_@.-]+)*\\.(?:${EXT}))(?![A-Za-z0-9_@-])(?!\\.[A-Za-z0-9])`, "gi");

/** The skill folders of a checkout: top-level folders that hold a SKILL.md. */
export function skillDirs(root) {
  return readdirSync(root).filter((d) => !d.startsWith(".") && d !== "node_modules" && statSync(join(root, d)).isDirectory() && existsSync(join(root, d, "SKILL.md"))).sort();
}

/** The text of a SKILL.md without its frontmatter, with the line number of each line kept. */
function body(text) {
  const lines = text.split("\n");
  let start = 0;
  if (lines[0].trim() === "---") {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
    if (end > 0) start = end + 1;
  }
  return lines.map((text, i) => ({ text, n: i + 1 })).slice(start);
}

/** Every file path the text names, with its line. A URL, a placeholder, a glob and a home or absolute path are not paths. */
export function pathsIn(text) {
  const found = [];
  for (const { text: line, n } of body(text)) {
    // A Windows path (`a\\b.md`) is read as the same path with slashes.
    const clean = line.replace(/https?:\/\/\S+/g, " ").replace(/([A-Za-z0-9_.-])\\(?=[A-Za-z0-9_.-])/g, "$1/");
    for (const m of clean.matchAll(FILE)) {
      const p = m[1];
      const at = m.index + m[0].length;
      const next = clean[at] || "";
      // A "*" right after the name is a glob, unless the name is wrapped in **bold** or *italic*.
      const wrapped = clean[m.index - 1] === "*";
      if (/[<>{}*$]/.test(p) || (next === "*" && !wrapped) || next === "<" || next === "{") continue;
      // A bare file name is a mention, not a path. Only a path with a folder part is checked.
      if (!p.includes("/")) continue;
      // `PRODUCT.md/VOIS.md` is two names with a slash between them, not a folder.
      if (p.split("/").slice(0, -1).some((seg) => new RegExp(`\\.(?:${EXT})$`, "i").test(seg))) continue;
      // A "." before the path means the match began inside something longer, such as `.foo/bar.json`.
      found.push({ path: p, line: n });
    }
  }
  return found;
}

const statSyncSafe = (p) => { try { return statSync(p); } catch { return null; } };

/** Where a path is found, or null. Returns the repo-relative path that exists. */
export function resolvePath(root, skill, p) {
  const clean = p.replace(/^\.\//, "");
  const own = normalize(join(skill, clean));
  // A path that climbs out of the repo is never found, whatever is on disk there.
  if (own === ".." || own.startsWith(".." + sep)) return null;
  if (!own.startsWith(skill + sep) && own !== skill) {
    // ../other-skill/x climbs out of the skill folder but stays in the repo: it must name an existing file.
    return existsSync(join(root, own)) ? own : null;
  }
  if (existsSync(join(root, own))) return own;
  // From the repo root, when the path starts with a top-level folder: another skill, `registry/`, `scripts/`.
  const head = clean.split("/")[0];
  if (statSyncSafe(join(root, head))?.isDirectory() && existsSync(join(root, clean))) return clean;
  return null;
}

/** Another skill's file written without the skill name in front, if the path exists there. */
export function foundElsewhere(root, skill, p) {
  const clean = p.replace(/^\.\//, "");
  return skillDirs(root).filter((d) => d !== skill && existsSync(join(root, d, clean)));
}

export function check(root, allow = {}) {
  const problems = [];
  const used = new Set();
  for (const skill of skillDirs(root)) {
    const text = readFileSync(join(root, skill, "SKILL.md"), "utf8");
    for (const { path, line } of pathsIn(text)) {
      if (resolvePath(root, skill, path)) continue;
      const key = `${skill}:${path}`;
      if (Object.prototype.hasOwnProperty.call(allow, key)) { used.add(key); continue; }
      const els = foundElsewhere(root, skill, path);
      problems.push(els.length
        ? `${skill}/SKILL.md:${line}: \`${path}\` is not in ${skill}; it is in ${els.join(", ")}. Write it as \`${els[0]}/${path.replace(/^\.\//, "")}\`.`
        : `${skill}/SKILL.md:${line}: \`${path}\` does not exist.`);
    }
  }
  for (const [key, why] of Object.entries(allow)) if (typeof why !== "string" || !why.trim()) problems.push(`skill-paths-allow.json: "${key}" needs a reason (a non-empty string).`);
  for (const key of Object.keys(allow)) if (!used.has(key)) problems.push(`skill-paths-allow.json: "${key}" is listed but no SKILL.md names it any more. Remove it.`);
  return problems;
}

function main(argv) {
  const i = argv.indexOf("--root");
  const root = resolve(i > -1 ? argv[i + 1] : join(dirname(fileURLToPath(import.meta.url)), ".."));
  const allowFile = join(root, "scripts", "skill-paths-allow.json");
  const allow = existsSync(allowFile) ? JSON.parse(readFileSync(allowFile, "utf8")).allow || {} : {};
  const problems = check(root, allow);
  if (problems.length) {
    for (const p of problems) console.error(`❌ ${p}`);
    console.error(`check-skill-paths: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log("check-skill-paths: OK");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
