#!/usr/bin/env node
// Checks this public repo against the private Vois repo, which is canonical for the
// Vois design system skills. Two checks:
//
//   1. Mirror: the shared detector code matches byte for byte, and every rule ID in the
//      shared rule files matches, with the same content. Named exceptions (the premium
//      wording and the vois-loop checklist) are listed in ALLOWED below and nowhere else.
//   2. Standalone: no MCP call in a public skill is worded as required. Public skills
//      must keep working without the MCP.
//
// Usage: node scripts/check-mirror.mjs --private <path-to-private-checkout>

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const here = resolve(new URL(".", import.meta.url).pathname, "..");

const argIdx = process.argv.indexOf("--private");
const privateRoot = argIdx > -1 ? resolve(process.argv[argIdx + 1] ?? "") : "";
if (!privateRoot || !existsSync(join(privateRoot, "vois-tokens"))) {
  console.error("check-mirror: pass --private <path to the private vois-skills checkout>");
  process.exit(2);
}

const problems = [];

// ---- 1a. Shared code, byte for byte --------------------------------------------------

const SHARED_CODE = [
  "vois-tokens/scripts/detect.mjs",
  "vois-tokens/scripts/registry.mjs",
  "vois-tokens/scripts/team-overrides.mjs",
  "vois-tokens/scripts/jsx-tags.mjs",
];

for (const f of SHARED_CODE) {
  const pub = join(here, f);
  const priv = join(privateRoot, f);
  if (!existsSync(pub) || !existsSync(priv)) {
    problems.push(`${f}: missing in ${existsSync(pub) ? "private" : "public"}`);
    continue;
  }
  if (!readFileSync(pub).equals(readFileSync(priv))) {
    problems.push(`${f}: differs from the private copy`);
  }
}

// ---- 1b. Rule data, by ID and content ------------------------------------------------

// Premium wording that is allowed to differ. Keep this list short. Each entry names the
// file, the rule ID (or the top-level key) and the fields that may differ.
const ALLOWED = {
  "vois-dataviz/data/dataviz-rules.json": {
    "DV-IMPL-004": ["do", "rule"], // private: "Call vois_get_tokens"; public: standalone wording
  },
  "vois-dataviz/data/review-checklist.json": {
    "$top": ["loop_checklist", "description"], // vois-loop wiring exists only in private
  },
};

// Collect every object that carries a string "id", keyed by that id. A duplicate ID is an
// error: identity has to be unique inside a file.
function collectById(node, out, file, dupes) {
  if (Array.isArray(node)) {
    for (const v of node) collectById(v, out, file, dupes);
  } else if (node && typeof node === "object") {
    if (typeof node.id === "string") {
      if (out.has(node.id)) dupes.push(node.id);
      out.set(node.id, node);
    }
    for (const v of Object.values(node)) collectById(v, out, file, dupes);
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, canonical(value[k])]),
    );
  }
  return value;
}

function withoutFields(obj, fields) {
  const copy = { ...obj };
  for (const f of fields) delete copy[f];
  return copy;
}

const RULE_FILES = [
  "vois-tokens/data/vois-rules.json",
  "vois-patterns/data/patterns-rules.json",
  "vois-components/data/components-rules.json",
  "vois-dataviz/data/dataviz-rules.json",
];

for (const f of RULE_FILES) {
  const pubPath = join(here, f);
  const privPath = join(privateRoot, f);
  if (!existsSync(pubPath) || !existsSync(privPath)) {
    problems.push(`${f}: missing in ${existsSync(pubPath) ? "private" : "public"}`);
    continue;
  }
  const pubMap = new Map();
  const privMap = new Map();
  const dupes = [];
  collectById(JSON.parse(readFileSync(pubPath, "utf8")), pubMap, f, dupes);
  collectById(JSON.parse(readFileSync(privPath, "utf8")), privMap, f, dupes);
  for (const d of dupes) problems.push(`${f}: duplicate rule id ${d}`);

  for (const id of privMap.keys()) if (!pubMap.has(id)) problems.push(`${f}: ${id} is in private only`);
  for (const id of pubMap.keys()) if (!privMap.has(id)) problems.push(`${f}: ${id} is in public only`);

  const allow = (ALLOWED[f] ?? {});
  for (const [id, pubObj] of pubMap) {
    const privObj = privMap.get(id);
    if (!privObj) continue;
    const fields = allow[id] ?? [];
    const a = JSON.stringify(canonical(withoutFields(pubObj, fields)));
    const b = JSON.stringify(canonical(withoutFields(privObj, fields)));
    if (a !== b) problems.push(`${f}: ${id} differs outside the allowed fields`);
  }
}

// Review checklist: compare the top level, minus the allowed keys.
{
  const f = "vois-dataviz/data/review-checklist.json";
  const pubPath = join(here, f);
  const privPath = join(privateRoot, f);
  if (!existsSync(pubPath) || !existsSync(privPath)) {
    problems.push(`${f}: missing in ${existsSync(pubPath) ? "private" : "public"}`);
  } else {
    const allowKeys = ALLOWED[f]["$top"];
    const pub = withoutFields(JSON.parse(readFileSync(pubPath, "utf8")), allowKeys);
    const priv = withoutFields(JSON.parse(readFileSync(privPath, "utf8")), allowKeys);
    if (JSON.stringify(canonical(pub)) !== JSON.stringify(canonical(priv))) {
      problems.push(`${f}: differs outside the allowed keys`);
    }
  }
}

// ---- 2. Standalone: no required MCP calls in public skills ---------------------------

const STANDALONE_SKILLS = ["righter", "vois-components", "vois-dataviz", "vois-patterns", "vois-tokens"];
const CALL = /\b(call|calls|always call|must call)\b[^.\n]*\b`?vois_[a-z_]+`?/i;
const CONDITIONAL = /\b(if|when|unless|optional|available|only)\b/i;

// Markdown and JSON: the JSON data files carry instructions to the agent too.
function textFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...textFiles(p));
    else if (name.endsWith(".md") || name.endsWith(".json")) out.push(p);
  }
  return out;
}

for (const skill of STANDALONE_SKILLS) {
  const dir = join(here, skill);
  if (!existsSync(dir)) continue;
  for (const file of textFiles(dir)) {
    if (file.endsWith("CHANGELOG.md")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (!CALL.test(line)) return;
      // A call counts as conditional if its line or the three lines before it say so.
      const window = lines.slice(Math.max(0, i - 3), i + 1).join(" ");
      if (!CONDITIONAL.test(window)) {
        problems.push(`${relative(here, file)}:${i + 1}: MCP call worded as required: ${line.trim().slice(0, 120)}`);
      }
    });
  }
}

// ---- report ---------------------------------------------------------------------------

if (problems.length) {
  console.error(`check-mirror: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("check-mirror: mirror and standalone checks pass");
