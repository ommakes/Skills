#!/usr/bin/env node
// Checks that a Figma edition names every rule id of the source it says it was built from.
//
// An edition's frontmatter `version` is the source version it was built from (figma-editions/README.md).
// So an edition at the same version as its source must not leave out a source id. An edition that is behind
// its source is marked behind in the README and is not checked, so a port stays cheap. An edition that is
// AHEAD of its source fails: it claims a build from a version that does not exist.
//
// An id counts as named when it appears as a whole token: `PATH-PRICE-U1` is not named by `PATH-PRICE-U10`,
// and a range such as "U1 to U14" names only its two ends. An id that an edition leaves out on purpose goes in
// figma-editions/omit.json with a reason. An entry for an id the source does not have, one with an empty
// reason, and one for an id the edition does name are all errors.
//
// Run: node scripts/check-editions.mjs

import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Every id in `list` that is not named in `text`. A name is a whole token: no id character on either side. */
export function unnamedIds(text, list) {
  const missing = [];
  for (const id of list) {
    const re = new RegExp(`(?<![A-Za-z0-9_-])${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_-])`);
    if (!re.test(text)) missing.push(id);
  }
  return missing;
}

/** The `version:` in the frontmatter of an edition, or null. Only the first --- block counts. */
export function editionVersion(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const v = m && /^version:\s*(\S+)\s*$/m.exec(m[1]);
  return v ? v[1] : null;
}

const SEMVER = /^\d+\.\d+\.\d+$/;
const cmp = (a, b) => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
};

/**
 * One edition against its source. Returns { problems, skipped }. `skipped` is a sentence when the edition is
 * behind its source and so is not checked. Anything that cannot be read is a problem, never a pass.
 */
export function checkEdition({ name, text, sourceIds, sourceVersion, omit = {} }) {
  const problems = [];
  if (typeof text !== "string" || text.length === 0) return { problems: [`${name}: the edition is empty or unreadable`] };
  if (!Array.isArray(sourceIds) || sourceIds.length === 0 || sourceIds.some((i) => typeof i !== "string" || i === "")) {
    return { problems: [`${name}: the source gave no usable list of ids`] };
  }
  const dupes = sourceIds.filter((id, i) => sourceIds.indexOf(id) !== i);
  if (dupes.length) problems.push(`${name}: the source lists ${[...new Set(dupes)].join(", ")} more than once`);
  if (typeof omit !== "object" || omit === null || Array.isArray(omit)) return { problems: [`${name}: its omit list is not an object`] };

  const version = editionVersion(text);
  if (!version || !SEMVER.test(version)) return { problems: [`${name}: the edition has no frontmatter version like 1.2.3`] };
  if (typeof sourceVersion !== "string" || !SEMVER.test(sourceVersion)) return { problems: [`${name}: the source version is missing or not like 1.2.3`] };
  const order = cmp(version, sourceVersion);
  if (order > 0) return { problems: [`${name}: the edition says ${version}, which is newer than its source (${sourceVersion})`] };
  if (order < 0) return { problems: [], skipped: `${name}: built from ${version}, the source is ${sourceVersion}, so it is marked behind and not checked` };

  for (const [id, reason] of Object.entries(omit)) {
    if (typeof reason !== "string" || reason.trim() === "") problems.push(`${name}: omit ${id} has no reason`);
    if (!sourceIds.includes(id)) problems.push(`${name}: omit ${id} is not an id in the source, so the entry is stale`);
  }
  const omitted = new Set(Object.keys(omit));
  const namedButOmitted = [...omitted].filter((id) => !unnamedIds(text, [id]).length);
  for (const id of namedButOmitted) problems.push(`${name}: omit ${id} is named in the edition, so drop it from the omit list`);
  const missing = unnamedIds(text, sourceIds.filter((id) => !omitted.has(id)));
  if (missing.length) problems.push(`${name}: ${missing.length} source id(s) not named in the edition: ${missing.join(", ")}`);
  return { problems };
}

// Where each edition's ids come from. A shape that is not what is written here is an error, not an empty list.
const asList = (v, what) => { if (!Array.isArray(v)) throw new Error(`${what} is not a list`); return v; };
const sources = (readText, readJson) => ({
  "vois-tokens": {
    edition: "figma-editions/vois-tokens.md",
    ids: () => asList(readJson("vois-tokens/data/vois-rules.json").rules, "vois-rules.json rules").map((r) => r.id),
  },
  "vois-patterns": {
    edition: "figma-editions/vois-patterns.md",
    ids: () => asList(readJson("vois-patterns/data/patterns-rules.json").nodes, "patterns-rules.json nodes").map((n) => n.id),
  },
  "vois-components": {
    edition: "figma-editions/vois-components.md",
    ids: () => {
      const d = readJson("vois-components/data/components-rules.json");
      return [...asList(d.jobs, "components-rules.json jobs"), ...asList(d.lookalikes?.rows, "components-rules.json lookalikes rows")].map((r) => r.id);
    },
  },
  // Righter's ids are plain words (toast, tooltip), which occur in any prose, so they are matched in the form the
  // edition writes them: `id: toast`. An omit entry for Righter is written the same way.
  righter: {
    edition: "figma-editions/righter.md",
    ids: () => {
      const comps = asList(readJson("righter/data/components.json").components, "righter components.json components").map((c) => `id: ${c.id}`);
      // The principles are written in SKILL.md as a heading with `id: name`, and the edition keeps that form.
      const principles = [...new Set([...readText("righter/SKILL.md").matchAll(/`id:\s*([a-z0-9-]+)`/g)].map((m) => `id: ${m[1]}`))];
      if (principles.length === 0) throw new Error("found no `id: name` principle headings in righter/SKILL.md, so the principles cannot be checked");
      return [...comps, ...principles];
    },
  },
});

/** Run every edition check against the tree at `root`. Returns { lines, problems }. Anything unreadable is a problem. */
export function runChecks(root = repoRoot) {
  const readText = (rel) => readFileSync(join(root, rel), "utf8");
  const readJson = (rel) => JSON.parse(readText(rel));
  const SOURCES = sources(readText, readJson);
  const lines = [];
  let problems = [];
  let skills, omitAll;
  try {
    skills = readJson("skills.json").skills;
    if (!Array.isArray(skills)) throw new Error("skills.json has no skills list");
    omitAll = readJson("figma-editions/omit.json");
    if (typeof omitAll !== "object" || omitAll === null || Array.isArray(omitAll)) throw new Error("figma-editions/omit.json is not an object");
  } catch (e) {
    return { lines, problems: [e.message] };
  }
  problems = Object.keys(omitAll).filter((k) => !Object.hasOwn(SOURCES, k)).map((k) => `omit.json names ${k}, which is not an edition this check knows`);
  for (const [name, src] of Object.entries(SOURCES)) {
    let result;
    try {
      const entry = skills.find((s) => s.name === name);
      result = checkEdition({ name, text: readText(src.edition), sourceIds: src.ids(), sourceVersion: entry?.version, omit: omitAll[name] ?? {} });
    } catch (e) {
      result = { problems: [`${name}: ${e.message}`] };
    }
    if (result.skipped) lines.push(`skip  ${result.skipped}`);
    else if (result.problems.length === 0) lines.push(`ok    ${name}: every source id is named`);
    problems = problems.concat(result.problems);
  }
  return { lines, problems };
}

function main() {
  const { lines, problems } = runChecks();
  for (const l of lines) console.log(l);
  if (problems.length) {
    console.error(`\nFAIL ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
}

// Run only as a script. Both sides are real paths, so a symlinked path still runs it instead of exiting 0 silently.
const isScript = (() => {
  try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();
if (isScript) main();
