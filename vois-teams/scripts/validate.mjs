#!/usr/bin/env node
// Usage:
//   node validate.mjs base                  check ranges.json against the base rules
//   node validate.mjs check <path...>       check override files, proposals, or folders of them
//   node validate.mjs all                   base, plus this repo's examples/ and proposals/
// Add --skills-dir <dir> when the vois-* skills are installed somewhere else. Exit code 1 on any error.
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_SKILLS_DIR, RANGES_FILE, loadBase, validateRanges, validatePaths } from "./lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
let skillsDir = DEFAULT_SKILLS_DIR;
const i = args.indexOf("--skills-dir");
if (i !== -1) { skillsDir = args[i + 1]; args.splice(i, 2); }
const [command, ...paths] = args;

const baseRules = loadBase(skillsDir);
const ranges = JSON.parse(readFileSync(RANGES_FILE, "utf8"));
const errors = [];
const warnings = [];
let checked = 0;

const base = () => errors.push(...validateRanges(ranges, baseRules).map((m) => `ranges.json: ${m}`));
const files = (list) => {
  const r = validatePaths(list, { baseRules, ranges });
  errors.push(...r.errors);
  warnings.push(...r.warnings);
  checked += r.checked;
};

if (command === "base") base();
else if (command === "check" && paths.length) files(paths);
else if (command === "all") {
  base();
  const dirs = ["examples", "proposals"].map((d) => join(here, "..", d)).filter(existsSync);
  files(dirs);
} else {
  console.error("usage: node validate.mjs base | check <path...> | all   [--skills-dir <dir>]");
  process.exit(2);
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
if (errors.length) { console.error(`\nvalidate: ${errors.length} error(s)`); process.exit(1); }
console.log(`validate: OK${command === "base" || command === "all" ? `, ${ranges.ranges.length} ranges` : ""}${checked ? `, ${checked} file(s)` : ""}, ${warnings.length} warning(s)`);
