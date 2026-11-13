#!/usr/bin/env node
// Checks the Vois registry without installing anything. CI runs it on every PR.
//
//   1. registry.json: a known item type, a unique kebab-case name per item, and safe file paths that
//      exist under registry/vois/ as regular files, with no symlink anywhere on the way. No two files
//      share a path or an install target (ignoring case), and every registry:file names its target.
//      Every file under registry/vois/ belongs to an item.
//   2. CSS, in any item: only the mapping block, and each line points one shadcn variable at the one
//      Vois token a Vois rule names for it (MAPPINGS). Each mapping's rule must still name that token,
//      MAPPINGS must equal the DS-TOKEN-005 table, and every target must be a generated token.
//      The exceptions are the generated token files (vois-tokens.css, motion-tokens.css), which must equal
//      what build-tokens.mjs writes. The motion values must also equal animation.md's starter block.
//   3. Every registry file is a type the vois-tokens detector reads, and it has no findings.
//   4. package.json's version is the newest version in CHANGELOG.md.
//
// Bad input fails closed: an unknown type, an odd path or an unparseable line is a problem, never a skip.
// The schema check proper is `npm run build` (shadcn build), which needs the CLI installed.
//
// Usage: node registry/scripts/check-registry.mjs

import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { detectFile } from "../../vois-tokens/scripts/detect.mjs";
import { rulesForFile } from "../../vois-tokens/scripts/registry.mjs";
import { applyPending, buildFiles, buildShape, readPending } from "./build-tokens.mjs";

export const REGISTRY_NAME = "vois";
// Item types this registry may use. Others fail until someone adds them here on purpose.
export const ITEM_TYPES = new Set(["registry:theme", "registry:ui", "registry:component", "registry:lib", "registry:hook", "registry:file"]);
// The selector of the mapping block. `.dark.dark` re-points the variables wherever dark mode starts, so a
// dark section inside a light page reads the dark Vois token. Both outrank shadcn's `:root` and `.dark`.
export const MAPPING_SELECTOR = ":root:root, .dark.dark";
// shadcn's theme variables (cssVarsV4 in https://ui.shadcn.com/r/colors/neutral.json, checked with shadcn 4.23.0).
export const SHADCN_VARS = new Set([
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "border", "input", "ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring", "radius",
]);
// The only mappings allowed: each shadcn variable, the one Vois token for it, and the rule that names it.
// DS-TOKEN-005 (vois-tokens/references/figma-variables.md) is the full table; add a line here to map one more.
const T5 = "DS-TOKEN-005";
export const MAPPINGS = {
  background: { token: "--bg-background", rule: T5 },
  foreground: { token: "--text-primary", rule: T5 },
  card: { token: "--bg-card", rule: T5 },
  "card-foreground": { token: "--text-primary", rule: T5 },
  popover: { token: "--bg-card", rule: T5 },
  "popover-foreground": { token: "--text-primary", rule: T5 },
  primary: { token: "--action-primary-resting", rule: T5 },
  "primary-foreground": { token: "--action-primary-text", rule: T5 },
  secondary: { token: "--action-secondary-resting", rule: T5 },
  "secondary-foreground": { token: "--text-primary", rule: T5 },
  muted: { token: "--bg-subtle", rule: T5 },
  "muted-foreground": { token: "--text-secondary", rule: T5 },
  accent: { token: "--bg-hover", rule: T5 },
  "accent-foreground": { token: "--text-primary", rule: T5 },
  destructive: { token: "--base-negative", rule: T5 },
  border: { token: "--border-pretty", rule: T5 },
  input: { token: "--border-default", rule: T5 },
  ring: { token: "--border-state-focus", rule: T5 },
  radius: { token: "--radii-8", rule: T5 },
};
// The generated token files. They hold values on purpose, so the mapping-only CSS rule does not apply.
export const TOKENS_FILE = "vois/tokens/vois-tokens.css";
export const MOTION_FILE = "vois/tokens/motion-tokens.css";
export const SHAPE_FILE = "vois/tokens/shape-tokens.css";

// ---- Paths ---------------------------------------------------------------------------

// A path inside the registry: relative, forward slashes, no `.` or `..` segments, no empty segments.
export function pathProblem(p, { prefix = "" } = {}) {
  if (typeof p !== "string" || p.length === 0) return "is not a non-empty string";
  if (p.includes("\\")) return "uses a backslash; use forward slashes";
  if (p.startsWith("/") || /^[A-Za-z]:/.test(p)) return "is absolute; make it relative";
  const segs = p.split("/");
  if (segs.some((s) => s === "" || s === "." || s === "..")) return "has an empty, `.` or `..` segment";
  if (prefix && !p.startsWith(prefix)) return `is not under ${prefix}`;
  return null;
}

// ---- registry.json ---------------------------------------------------------------------

// `kind(path)` returns "file", "symlink", "other" or null when the path does not exist.
// Returns the problems and the { item, file } pairs whose path is safe, the one list later checks use.
export function checkRegistryJson(reg, { kind }) {
  const problems = [];
  const accepted = [];
  if (!reg || typeof reg !== "object" || Array.isArray(reg)) return { problems: ["registry.json: not an object"], accepted };
  if (reg.name !== REGISTRY_NAME) problems.push(`registry.json: name must be "${REGISTRY_NAME}"`);
  if (!Array.isArray(reg.items) || reg.items.length === 0) return { problems: [...problems, "registry.json: items must be a non-empty list"], accepted };
  const names = new Set();
  // Paths and targets are compared lowercased: on a case-insensitive disk A.css and a.css are one file.
  const paths = new Set();
  const targets = new Set();
  reg.items.forEach((item, i) => {
    const at = `items[${i}]`;
    if (!item || typeof item !== "object") { problems.push(`${at}: not an object`); return; }
    const name = item.name;
    if (typeof name !== "string" || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) problems.push(`${at}: name must be kebab-case`);
    else if (names.has(name)) problems.push(`${at}: duplicate name "${name}"`);
    else names.add(name);
    if (!ITEM_TYPES.has(item.type)) problems.push(`${at} (${name}): type "${item.type}" is not one this registry uses`);
    if (!Array.isArray(item.files) || item.files.length === 0) { problems.push(`${at} (${name}): files must be a non-empty list`); return; }
    item.files.forEach((f, j) => {
      const fat = `${at}.files[${j}]`;
      if (!f || typeof f !== "object") { problems.push(`${fat}: not an object`); return; }
      const pp = pathProblem(f.path, { prefix: "vois/" });
      if (pp) problems.push(`${fat}: path ${pp}`);
      else if (paths.has(f.path.toLowerCase())) problems.push(`${fat}: path ${f.path} is listed twice`);
      else {
        paths.add(f.path.toLowerCase());
        accepted.push({ item, file: f });
        const k = kind(f.path);
        if (k === null) problems.push(`${fat}: ${f.path} does not exist`);
        else if (k !== "file") problems.push(`${fat}: ${f.path} is ${k === "symlink" ? "or goes through a symlink" : "not a regular file"}`);
      }
      if (f.target === undefined) {
        if (f.type === "registry:file") problems.push(`${fat}: a registry:file needs a target`);
      } else {
        const tp = pathProblem(f.target);
        if (tp) problems.push(`${fat}: target ${tp}`);
        else if (targets.has(f.target.toLowerCase())) problems.push(`${fat}: target ${f.target} is used by another file`);
        else targets.add(f.target.toLowerCase());
      }
      if (typeof f.type !== "string" || !f.type.startsWith("registry:")) problems.push(`${fat}: type must be a registry: type`);
    });
  });
  return { problems, accepted };
}

// ---- CSS -------------------------------------------------------------------------------

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// A registry CSS file holds name mappings, never values or rules. `seen` carries mapped names across
// files so one shadcn variable is mapped once in the whole registry.
export function cssProblems(css, { seen = new Set() } = {}) {
  const out = [];
  const src = stripComments(css);
  let i = 0;
  let blocks = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    const rest = src.slice(i, open === -1 ? undefined : open).trim();
    if (open === -1) { if (rest) out.push(`text outside a block: "${rest.slice(0, 40)}"`); break; }
    const close = src.indexOf("}", open);
    if (close === -1) { out.push("a block is not closed"); break; }
    const body = src.slice(open + 1, close);
    if (body.includes("{")) { out.push(`nested block inside "${rest}"`); break; }
    // Whitespace inside the selector is free (a line break after the comma); anything else must match exactly.
    if (rest.replace(/\s+/g, " ") !== MAPPING_SELECTOR) out.push(`only "${MAPPING_SELECTOR} { }" blocks are allowed, found "${rest.slice(0, 40)}"`);
    blocks++;
    for (const raw of body.split(";")) {
      const decl = raw.trim();
      if (!decl) continue;
      const m = /^--([a-z0-9-]+)\s*:\s*(.*)$/s.exec(decl);
      if (!m) { out.push(`not a lowercase custom property: "${decl.slice(0, 60)}"`); continue; }
      const [, name, value] = m;
      if (!SHADCN_VARS.has(name)) { out.push(`--${name}: not one of shadcn's theme variables`); continue; }
      if (seen.has(name)) out.push(`--${name}: mapped more than once`);
      seen.add(name);
      const allowed = Object.hasOwn(MAPPINGS, name) ? MAPPINGS[name] : null;
      if (!allowed) { out.push(`--${name}: not in MAPPINGS yet; add it with the token DS-TOKEN-005 names for it`); continue; }
      if (value.trim() !== `var(${allowed.token})`) out.push(`--${name}: must be exactly var(${allowed.token}) (${allowed.rule}), found "${value.trim().slice(0, 60)}"`);
    }
    i = close + 1;
  }
  if (blocks === 0 && out.length === 0) out.push("no mapping block");
  return out;
}

// Each mapping's rule must exist and still name its token, in the rule text or in the rule's own section
// of its source file: the paragraph that carries its [ID] tag, plus a code block right under it.
// A renamed token or a moved rule fails.
export function mappingProblems(root, mappings = MAPPINGS) {
  const out = [];
  let rules;
  try {
    const data = JSON.parse(readFileSync(join(root, "vois-tokens/data/vois-rules.json"), "utf8"));
    rules = new Map((Array.isArray(data) ? data : data.rules).map((r) => [r.id, r]));
  } catch (e) { return [`vois-rules.json: ${e.message}`]; }
  for (const [name, { token, rule }] of Object.entries(mappings)) {
    const r = rules.get(rule);
    if (!r) { out.push(`MAPPINGS.${name}: rule ${rule} is not in vois-rules.json`); continue; }
    let section = "";
    try {
      const src = readFileSync(join(root, r.source_file), "utf8");
      const at = src.indexOf(`[${rule}]`);
      if (at !== -1) section = ruleSection(src, at);
    } catch { /* a missing source file leaves only the rule text */ }
    const named = new RegExp(`${token.replace(/[-]/g, "\\-")}(?![a-z0-9-])`);
    if (!named.test(r.rule) && !named.test(section)) out.push(`MAPPINGS.${name}: rule ${rule} no longer names ${token}`);
  }
  return out;
}

// The paragraph around a tag (blank line to blank line), plus the fenced code block that follows it, if any.
export function ruleSection(src, at) {
  const start = src.lastIndexOf("\n\n", at) + 1;
  const paraEnd = src.indexOf("\n\n", at);
  if (paraEnd === -1) return src.slice(start);
  let section = src.slice(start, paraEnd);
  const next = src.slice(paraEnd).replace(/^\n+/, "");
  if (next.startsWith("```")) {
    const close = next.indexOf("\n```", 3);
    section += "\n" + (close === -1 ? next : next.slice(0, close + 4));
  }
  return section;
}

// ---- Version -------------------------------------------------------------------------

// package.json's version must be the first `## [x.y.z]` heading in CHANGELOG.md, so a release bumps both.
export function versionProblems(pkgText, changelogText) {
  let version;
  try { version = JSON.parse(pkgText).version; } catch (e) { return [`package.json: ${e.message}`]; }
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) return ["package.json: version must be x.y.z"];
  const head = /^## \[(\d+\.\d+\.\d+)\]/m.exec(changelogText ?? "");
  if (!head) return ["CHANGELOG.md: no `## [x.y.z]` entry"];
  if (head[1] !== version) return [`package.json version ${version} is not the newest CHANGELOG.md entry (${head[1]})`];
  return [];
}

// ---- DS-TOKEN-005 table and generated tokens ------------------------------------------------

// The shadcn table in figma-variables.md, as { shadcnName: token }. Fails closed: no section, no rows,
// or a variable listed twice is a problem, never an empty table.
// CRLF files need no special case: with the m flag, JavaScript's $ also matches before \r (a test checks).
export function token005Table(md) {
  const start = md.indexOf("[DS-TOKEN-005]");
  if (start === -1) return { problems: ["figma-variables.md: no [DS-TOKEN-005] section"], table: {} };
  const rest = md.slice(start);
  const end = rest.search(/\n## /);
  const section = end === -1 ? rest : rest.slice(0, end);
  const table = {};
  const problems = [];
  for (const m of section.matchAll(/^\| `([a-z0-9-]+)` \| `(--[a-z0-9-]+)` \|$/gm)) {
    if (Object.hasOwn(table, m[1])) problems.push(`figma-variables.md: DS-TOKEN-005 lists ${m[1]} twice`);
    table[m[1]] = m[2];
  }
  if (Object.keys(table).length === 0) problems.push("figma-variables.md: the DS-TOKEN-005 table has no rows");
  return { problems, table };
}

// MAPPINGS and the table must say the same thing, both ways.
export function tableProblems(table, mappings = MAPPINGS) {
  const out = [];
  for (const [name, { token }] of Object.entries(mappings)) {
    if (!Object.hasOwn(table, name)) out.push(`MAPPINGS.${name}: not in the DS-TOKEN-005 table`);
    else if (table[name] !== token) out.push(`MAPPINGS.${name}: ${token}, but the DS-TOKEN-005 table says ${table[name]}`);
  }
  for (const name of Object.keys(table)) if (!Object.hasOwn(mappings, name)) out.push(`DS-TOKEN-005 maps ${name}, but MAPPINGS does not`);
  return out;
}

// Token names a generated CSS file defines.
// Name to value for each custom property a CSS file declares (comments stripped, spaces normalized).
const declarations = (css) => new Map([...stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().replace(/\s+/g, " ")]));
export const definedTokens = (css) => new Set(declarations(css).keys());

// The motion tokens must equal the starter block in vois-tokens/references/animation.md, the one place the
// skill states them. Names and values compare exactly (spaces in a value are normalized), and the two
// sets must be the same: a token in one and not the other fails.
export function starterBlock(md) {
  const at = md.indexOf("### Starter token file");
  if (at === -1) return null;
  // Only this section: up to the next heading, so a css block further down never counts.
  const rest = md.slice(at + 1);
  const next = rest.search(/\n#{1,6} /);
  const section = next === -1 ? rest : rest.slice(0, next);
  const m = /```css\n([\s\S]*?)```/.exec(section);
  return m ? m[1] : null;
}
export function motionProblems(motionCss, animationMd) {
  const block = starterBlock(animationMd);
  if (block === null) return ["vois-tokens/references/animation.md: no css block under \"### Starter token file\""];
  const want = declarations(block);
  const got = declarations(motionCss);
  if (want.size === 0) return ["vois-tokens/references/animation.md: the starter block declares no tokens"];
  const out = [];
  for (const [k, v] of want) {
    if (!got.has(k)) out.push(`${MOTION_FILE}: ${k} is in the animation.md starter block but not generated`);
    else if (got.get(k) !== v) out.push(`${MOTION_FILE}: ${k} is ${got.get(k)}, but animation.md says ${v}`);
  }
  for (const k of got.keys()) if (!want.has(k)) out.push(`${MOTION_FILE}: ${k} is not in the animation.md starter block`);
  return out;
}

// Every token in figma-pending.json is listed in FIGMA-TODO.md, as `--name`, so the log of what Figma
// still needs stays complete.
export function pendingLogProblems(pending, todoMd) {
  const names = [...Object.keys(pending?.add ?? {}), ...Object.keys(pending?.change ?? {})];
  return names.filter((n) => !todoMd.includes("`" + n + "`")).map((n) => `FIGMA-TODO.md: does not list ${n}, which is in source/figma-pending.json`);
}

// Every custom property a component file reads must exist: a generated token, or one the file defines
// itself (a Tailwind `[--name:...]` class or a `--name:` style key). A read is `var(--x` or Tailwind's
// `(--x)` shorthand, so `h-(--size-36)` counts too. Comments and strings are not skipped: a name in a
// comment that points at nothing is drift as well. Names are compared exactly, so `--Size-36` fails.
// Custom properties a primitive sets on its own elements at runtime. They are not design tokens, so they
// are allowed by exact name, as Radix documents them, and a misspelled one still fails. Add a primitive's
// names here when a component starts using it.
export const RUNTIME = new Set([
  // Radix Select (Content, popper position)
  "--radix-select-content-transform-origin",
  "--radix-select-content-available-width",
  "--radix-select-content-available-height",
  "--radix-select-trigger-width",
  "--radix-select-trigger-height",
]);

export function tokenRefProblems(text, known) {
  // Definitions count only outside comments, so a comment cannot vouch for a token (reads in comments
  // still count: that keeps the check strict from both sides).
  const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const local = new Set([...code.matchAll(/(?:\[|["'\s{,])(--[A-Za-z0-9_-]+)["']?\s*:/g)].map((m) => m[1]));
  const out = [];
  const seen = new Set();
  for (const m of text.matchAll(/\(\s*(--[A-Za-z0-9_-]+)/g)) {
    const name = m[1];
    if (known.has(name) || local.has(name) || seen.has(name) || RUNTIME.has(name)) continue;
    seen.add(name);
    const line = text.slice(0, m.index).split("\n").length;
    out.push(`${line}: reads ${name}, which is not a generated token and is not defined in this file`);
  }
  return out;
}

// ---- Whole registry ------------------------------------------------------------------

// Lists a folder without following symlinks; a symlink is reported, never entered.
function walk(dir, found = { files: [], links: [] }) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) found.links.push(p);
    else if (st.isDirectory()) walk(p, found);
    else found.files.push(p);
  }
  return found;
}

// What sits at base/rel, checking every segment so a symlinked parent folder is caught too.
export function kindAt(base, rel) {
  let p = base;
  const segs = rel.split("/");
  for (let i = 0; i < segs.length; i++) {
    p = join(p, segs[i]);
    let st;
    try { st = lstatSync(p); } catch { return null; }
    if (st.isSymbolicLink()) return "symlink";
    if (i === segs.length - 1) return st.isFile() ? "file" : "other";
  }
  return null;
}

export function checkRegistry(registryDir) {
  const repo = resolve(registryDir, "..");
  let reg;
  try { reg = JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf8")); }
  catch (e) { return [`registry.json: ${e.message}`]; }
  const { problems, accepted } = checkRegistryJson(reg, { kind: (p) => kindAt(registryDir, p) });

  const listed = new Set(accepted.map(({ file }) => file.path));
  const sourceDir = join(registryDir, "vois");
  const rel = (p) => relative(registryDir, p).split(sep).join("/");
  let sourceIsLink = false;
  try { sourceIsLink = lstatSync(sourceDir).isSymbolicLink(); } catch { /* no vois/ folder: the items report it */ }
  if (sourceIsLink) problems.push("vois: is a symlink; registry files must live in this folder");
  else if (existsSync(sourceDir)) {
    const { files: onDisk, links } = walk(sourceDir);
    for (const p of links) problems.push(`${rel(p)}: is a symlink; registry files must be regular files`);
    for (const p of onDisk.map(rel)) if (!listed.has(p)) problems.push(`${p}: not part of any item in registry.json`);
  }

  problems.push(...mappingProblems(repo));
  let md = "";
  try { md = readFileSync(join(repo, "vois-tokens/references/figma-variables.md"), "utf8"); } catch { problems.push("vois-tokens/references/figma-variables.md: missing"); }
  if (md) { const t = token005Table(md); problems.push(...t.problems, ...tableProblems(t.table)); }
  let generated = null;
  let generatedMotion = null;
  let generatedShape = null;
  let pending = null;
  const src = (f) => JSON.parse(readFileSync(join(registryDir, "source", f), "utf8"));
  try {
    pending = readPending(readFileSync(join(registryDir, "source/figma-pending.json"), "utf8"));
    const exportJson = src("figma-export.json");
    ({ tokens: generated, motion: generatedMotion } = buildFiles(exportJson, src("brand-default.json"), { pending }));
    try { generatedShape = buildShape(src("shape.json"), applyPending(exportJson.tokens, exportJson.brandSlots, pending)); } catch (e) { problems.push(`shape build: ${e.message}`); }
  } catch (e) { problems.push(`token build: ${e.message}`); }
  let names = null;
  if (generated) {
    names = new Set([...definedTokens(generated), ...definedTokens(generatedMotion), ...(generatedShape ? definedTokens(generatedShape) : [])]);
    for (const [name, { token }] of Object.entries(MAPPINGS)) if (!names.has(token)) problems.push(`MAPPINGS.${name}: ${token} is not a generated token`);
  }
  const readOrNull = (f) => { try { return readFileSync(join(registryDir, f), "utf8"); } catch { return null; } };
  if (generatedMotion !== null) {
    let anim = null;
    try { anim = readFileSync(join(repo, "vois-tokens/references/animation.md"), "utf8"); } catch { problems.push("vois-tokens/references/animation.md: missing"); }
    if (anim !== null) problems.push(...motionProblems(generatedMotion, anim));
  }
  if (pending !== null) {
    const todo = readOrNull("FIGMA-TODO.md");
    if (todo === null) problems.push("FIGMA-TODO.md: missing; it lists what source/figma-pending.json still needs in Figma");
    else problems.push(...pendingLogProblems(pending, todo));
  }
  problems.push(...versionProblems(readOrNull("package.json") ?? "", readOrNull("CHANGELOG.md")));
  const seen = new Set();
  for (const { file } of accepted) {
    if (kindAt(registryDir, file.path) !== "file") continue; // checkRegistryJson already reported it
    const full = join(registryDir, file.path);
    if (rulesForFile(full).length === 0) { problems.push(`${file.path}: the vois-tokens detector does not read this file type`); continue; }
    const text = readFileSync(full, "utf8");
    if (file.path === TOKENS_FILE || file.path === MOTION_FILE || file.path === SHAPE_FILE) {
      const want = file.path === TOKENS_FILE ? generated : file.path === MOTION_FILE ? generatedMotion : generatedShape;
      if (want !== null && text !== want) problems.push(`${file.path}: not what build-tokens.mjs writes; run node registry/scripts/build-tokens.mjs`);
    } else if (/\.css$/i.test(file.path)) for (const p of cssProblems(text, { seen })) problems.push(`${file.path}: ${p}`);
    else if (names !== null) for (const p of tokenRefProblems(text, names)) problems.push(`${file.path}:${p}`);
    for (const d of detectFile(full, text)) problems.push(`${file.path}:${d.line} ${d.ruleId} ${d.message}`);
  }
  // Every mapping must actually be in a theme file, so "maps every DS-TOKEN-005 variable" stays true.
  for (const name of Object.keys(MAPPINGS)) if (!seen.has(name)) problems.push(`MAPPINGS.${name}: no theme file maps --${name}`);
  return problems;
}

function main() {
  const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const problems = checkRegistry(registryDir);
  if (problems.length) {
    for (const p of problems) console.error(`FAIL ${p}`);
    process.exit(1);
  }
  console.log("check-registry: OK");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
