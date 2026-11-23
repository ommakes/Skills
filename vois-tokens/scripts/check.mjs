#!/usr/bin/env node
// The CI gate for the vois-tokens detectors. detect.mjs reports and always exits 0, because the editor hooks must
// never fail on their own; this script runs the same detectors over a project and fails the build on findings.
//
//   node check.mjs [--root DIR] [--fail-on required|recommended|preferred] [--baseline FILE [--update]]
//                  [--format text|github|json] [--summary FILE] [--] <file or folder>...
//
// Severity is the rule's own `severity` in data/vois-rules.json. --fail-on required (the default) fails on findings
// from required rules; recommended adds recommended rules; preferred fails on every finding. The lookalike checks and
// DS-SLOP-002 are heuristics with no JSON rule, so they count as recommended. Any other finding whose rule has no
// severity counts as required: a missing entry makes the gate stricter, never quieter.
//
// A baseline lists findings that already exist, so a project can adopt the gate without fixing everything first.
// Only findings the baseline does not list fail. --update writes the baseline from the current findings.
// A finding is identified by its rule, its file (relative to --root) and the full trimmed text of its line, so moving code
// up or down does not make an old finding new; editing the line does.
//
// Waivers: the shared hook config (.vois/config.json: ignoredRules, ignoredFiles, ignoredValues) applies here too,
// so a waiver agreed for the hook does not fail CI. config.local.json is personal and is not read, and `enabled`
// (the hook's on/off switch) does not turn the gate off. Team overrides (.vois/teams) tighten limits as they do in
// the hook; a malformed team file is bad input here, because skipping it would drop the team's limits.
//
// Exit codes: 0 nothing fails, 1 findings fail, 2 bad input (a missing path, nothing to check, a malformed baseline
// or config, an unknown option, a file that cannot be read). Bad input never means pass.
// Paths are relative to the working directory and must be inside --root (default: the working directory).

import { appendFileSync, existsSync, lstatSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { detectFile } from "./detect.mjs";
import { RULES, rulesForFile } from "./registry.mjs";
import { loadTeams, paramsFor } from "./team-overrides.mjs";
import { isFileIgnored } from "./hook-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_SCHEMA = "vois-design-baseline/1";
export const LEVELS = ["required", "recommended", "preferred"]; // strictest first
const FORMATS = new Set(["text", "github", "json"]);

// Folders that hold generated, vendored or tool files, never the project's own source.
export const SKIP_DIRS = new Set([
  "node_modules", ".git", ".hg", ".svn", ".vois", ".vois-tools", "dist", "build", "out", "coverage",
  ".next", ".nuxt", ".svelte-kit", ".turbo", ".cache", ".vercel", ".netlify", "vendor", "storybook-static",
]);

export class InputError extends Error {}

// ---- Severity ----

let severityById = null;
function corpusSeverity() {
  if (severityById) return severityById;
  const raw = JSON.parse(readFileSync(join(HERE, "../data/vois-rules.json"), "utf8"));
  const rules = Array.isArray(raw) ? raw : raw.rules;
  severityById = new Map(rules.map((r) => [r.id, r.severity]));
  return severityById;
}

/** The severity a finding's rule carries: its JSON severity, the strictest of the rules it covers, or a fallback. */
export function severityOf(ruleId) {
  const known = corpusSeverity();
  if (LEVELS.includes(known.get(ruleId))) return known.get(ruleId);
  const covers = RULES.find((r) => r.id === ruleId)?.covers ?? [];
  const covered = covers.map((id) => known.get(id)).filter((s) => LEVELS.includes(s));
  if (covered.length) return LEVELS.find((l) => covered.includes(l));
  if (/^LOOKALIKE-\d+$/.test(ruleId) || /^DS-SLOP-\d+$/.test(ruleId)) return "recommended";
  return "required";
}

/** True when a finding of `severity` fails the gate at `failOn`. */
export const fails = (severity, failOn) => LEVELS.indexOf(severity) <= LEVELS.indexOf(failOn);

// ---- Files ----

/** Root-relative path with forward slashes, the form baselines and ignore globs use. */
export const relPath = (root, file) => relative(root, file).split(sep).join("/");

/** Every file under the given paths (relative to the working directory, inside `root`) that a detector reads. Symbolic links are not followed. */
export function collectFiles(paths, root) {
  const out = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, entry.name);
      // Dirent types come from lstat: a symbolic link is neither a directory nor a file here, so it is never followed.
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(p);
      } else if (entry.isFile() && rulesForFile(p).length) out.add(p);
    }
  };
  for (const given of paths) {
    const p = resolve(given);
    if (!existsSync(p)) throw new InputError(`${given} does not exist`);
    const rel = relative(root, p);
    // The same test as paramsFor: ".." itself, a "../" prefix, or another drive on Windows (relative() is then absolute).
    if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new InputError(`${given} is outside --root ${root}`);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) throw new InputError(`${given} is a symbolic link; pass the real path`);
    if (st.isDirectory()) walk(p);
    else if (st.isFile()) {
      if (!rulesForFile(p).length) throw new InputError(`${given} is not a file type the detectors read (.css, .scss, .tsx, .jsx, .ts, .js)`);
      out.add(p);
    }
  }
  if (out.size === 0) throw new InputError("no files to check under the given paths");
  return [...out].sort();
}

// ---- Waivers ----

const isStrings = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");

/** The shared hook config's waivers, validated. A wrong type is an error, never "waive everything". */
export function loadWaivers(root) {
  const path = join(root, ".vois", "config.json");
  if (!existsSync(path)) return { ignoredRules: [], ignoredFiles: [], ignoredValues: {} };
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new InputError(`.vois/config.json is not valid JSON: ${e.message}`);
  }
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new InputError(".vois/config.json must be an object");
  const { ignoredRules = [], ignoredFiles = [], ignoredValues = {} } = raw;
  if (!isStrings(ignoredRules)) throw new InputError(".vois/config.json ignoredRules must be a list of rule ids");
  if (!isStrings(ignoredFiles)) throw new InputError(".vois/config.json ignoredFiles must be a list of globs");
  if (ignoredValues === null || typeof ignoredValues !== "object" || Array.isArray(ignoredValues) || !Object.values(ignoredValues).every(isStrings)) {
    throw new InputError(".vois/config.json ignoredValues must map rule ids to lists of values");
  }
  if (ignoredFiles.includes("") || Object.values(ignoredValues).some((vs) => vs.includes(""))) {
    throw new InputError(".vois/config.json has an empty glob or value, which would waive everything");
  }
  return { ignoredRules, ignoredFiles, ignoredValues };
}

// File globs go through the hook's own matcher (hook-lib.mjs isFileIgnored), so the hook and the gate read the same
// setting the same way: relative to the root, ** crosses folders, * stays inside one, a leading ./ is dropped, \
// counts as /, and a file outside the root never matches a relative glob.
// A value waives the rule's findings on any line whose text contains it. It is not matched against the message, so a
// word such as "Use" cannot waive a whole rule.
export function waived(w, f, root) {
  if (w.ignoredRules.includes(f.ruleId)) return true;
  if (isFileIgnored({ ignoredFiles: w.ignoredFiles }, f.file, root)) return true;
  return (w.ignoredValues[f.ruleId] ?? []).some((v) => f.text.includes(v));
}

// ---- Baseline ----

export const keyOf = (f) => JSON.stringify([f.ruleId, f.file, f.text]);

export function readBaseline(raw) {
  if (raw === null || typeof raw !== "object" || raw.schema !== BASELINE_SCHEMA) throw new InputError(`the baseline must have schema "${BASELINE_SCHEMA}"`);
  if (!Array.isArray(raw.findings)) throw new InputError("baseline.findings must be a list");
  const counts = new Map();
  for (const f of raw.findings) {
    if (f === null || typeof f !== "object" || typeof f.rule !== "string" || typeof f.file !== "string" || typeof f.text !== "string") {
      throw new InputError("each baseline finding needs a rule, a file and the text of its line, all strings");
    }
    const k = keyOf({ ruleId: f.rule, file: f.file, text: f.text });
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export function baselineOf(findings) {
  const list = findings.map((f) => ({ rule: f.ruleId, file: f.file, text: f.text }));
  list.sort((a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule) || a.text.localeCompare(b.text));
  return { schema: BASELINE_SCHEMA, findings: list };
}

/** Splits findings into new and known, counting duplicates: two identical lines need two baseline entries. */
export function compare(findings, known) {
  const left = new Map(known);
  const added = [];
  for (const f of findings) {
    const k = keyOf(f);
    const n = left.get(k) ?? 0;
    if (n > 0) left.set(k, n - 1);
    else added.push(f);
  }
  const fixed = [...left.values()].reduce((s, n) => s + n, 0);
  return { added, fixed };
}

// ---- Run ----

export function run({ root, paths, failOn = "required", baseline = null }) {
  if (!LEVELS.includes(failOn)) throw new InputError(`--fail-on must be one of ${LEVELS.join(", ")}`);
  const files = collectFiles(paths, root);
  const waivers = loadWaivers(root);
  const teams = loadTeams(root, (name, why) => {
    throw new InputError(`${name ? `.vois/teams/${name}` : ".vois/teams"}: ${why}. A broken team setup would drop the team's tighter limits, so it fails the gate.`);
  });
  const all = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    for (const f of detectFile(file, content, { params: paramsFor(teams, root, file) })) {
      // The full trimmed line, not the 160-character display snippet, so two long lines never share an identity.
      const text = (lines[f.line - 1] ?? "").trim();
      const finding = { ...f, file: relPath(root, file), text, level: severityOf(f.ruleId) };
      if (!waived(waivers, finding, root)) all.push(finding);
    }
  }
  const gating = all.filter((f) => fails(f.level, failOn));
  const known = baseline === null ? new Map() : readBaseline(baseline);
  // Compare every finding, not only the failing ones: the baseline lists all of them (so --fail-on can be tightened
  // later), and a baselined note that is still there is not "fixed".
  const { added: addedAll, fixed } = compare(all, known);
  const added = addedAll.filter((f) => fails(f.level, failOn));
  const addedSet = new Set(added);
  return { files: files.length, all, gating, added, fixed, failOn, fresh: (f) => addedSet.has(f) };
}

// ---- Output ----

// Text from a scanned file goes into the log and the step summary: no newlines, so it cannot start a workflow command.
export const clean = (v) => String(v ?? "").replace(/[\r\n]+/g, " ");
// GitHub workflow command escaping: data escapes % \r \n, properties also escape : and ,.
const escData = (v) => String(v).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escProp = (v) => escData(v).replace(/:/g, "%3A").replace(/,/g, "%2C");

export function formatGithub(result) {
  const out = [];
  for (const f of result.all) {
    const kind = result.fresh(f) ? "error" : "warning";
    out.push(`::${kind} file=${escProp(f.file)},line=${f.line},title=${escProp(`${f.ruleId} (${f.level})`)}::${escData(f.fixHint && !f.message.includes(f.fixHint) ? `${f.message} ${f.fixHint}` : f.message)}`);
  }
  return out.join("\n");
}

export function formatText(result) {
  const out = [];
  for (const f of result.all) {
    const tag = result.fresh(f) ? "FAIL" : fails(f.level, result.failOn) ? "known" : "note";
    out.push(`${tag}  ${f.file}:${f.line}  [${f.ruleId}, ${f.level}]  ${clean(f.message)}`);
  }
  out.push(verdictLine(result));
  return out.join("\n");
}

export function verdictLine(r) {
  const known = r.gating.length - r.added.length;
  const parts = [`${r.files} files checked`, `${r.added.length} new failing`, `${known} known`, `${r.all.length - r.gating.length} below --fail-on ${r.failOn}`];
  if (r.fixed) parts.push(`${r.fixed} fixed since the baseline (run with --update to shrink it)`);
  return `vois-tokens check: ${r.added.length ? "FAIL" : "PASS"} (${parts.join(", ")})`;
}

export function summaryMarkdown(r) {
  const lines = ["### Design system check", "", verdictLine(r), ""];
  if (r.added.length) {
    lines.push("| File | Line | Rule | Finding |", "|---|---|---|---|");
    for (const f of r.added.slice(0, 50)) lines.push(`| \`${clean(f.file).replace(/[`|]/g, "'")}\` | ${f.line} | ${f.ruleId} | ${clean(f.message).replace(/[`|<>]/g, "'")} |`);
    if (r.added.length > 50) lines.push("", `And ${r.added.length - 50} more.`);
  }
  return lines.join("\n") + "\n";
}

// ---- CLI ----

export function parseArgs(argv) {
  const opts = { root: process.cwd(), failOn: "required", baseline: null, update: false, format: "text", summary: null, paths: [] };
  const value = (i, name) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) throw new InputError(`${name} needs a value`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") {
      opts.paths.push(...argv.slice(i + 1)); // everything after -- is a path, even one that starts with --
      break;
    }
    if (a === "--root") opts.root = value(i++, a);
    else if (a === "--fail-on") opts.failOn = value(i++, a);
    else if (a === "--baseline") opts.baseline = value(i++, a);
    else if (a === "--format") opts.format = value(i++, a);
    else if (a === "--summary") opts.summary = value(i++, a);
    else if (a === "--update") opts.update = true;
    else if (a.startsWith("--")) throw new InputError(`unknown option ${a}`);
    else opts.paths.push(a);
  }
  if (!opts.paths.length) throw new InputError("give at least one file or folder to check");
  if (!LEVELS.includes(opts.failOn)) throw new InputError(`--fail-on must be one of ${LEVELS.join(", ")}`);
  if (!FORMATS.has(opts.format)) throw new InputError(`--format must be one of ${[...FORMATS].join(", ")}`);
  if (opts.update && !opts.baseline) throw new InputError("--update needs --baseline FILE");
  opts.root = resolve(opts.root);
  return opts;
}

export function main(argv, { stdout = (s) => console.log(s), stderr = (s) => console.error(s) } = {}) {
  try {
    const opts = parseArgs(argv);
    const baselinePath = opts.baseline && resolve(opts.root, opts.baseline);
    let baseline = null;
    if (baselinePath && !opts.update) {
      if (!existsSync(baselinePath)) throw new InputError(`${opts.baseline} does not exist. Create it once with --update.`);
      try {
        baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
      } catch (e) {
        throw new InputError(`${opts.baseline} is not valid JSON: ${e.message}`);
      }
    }
    const result = run({ root: opts.root, paths: opts.paths, failOn: opts.failOn, baseline });
    if (opts.update) {
      writeFileSync(baselinePath, JSON.stringify(baselineOf(result.all), null, 2) + "\n");
      stdout(`Wrote ${result.all.length} findings to ${opts.baseline}.`);
      return 0;
    }
    if (opts.format === "json") stdout(JSON.stringify({ verdict: result.added.length ? "FAIL" : "PASS", failOn: result.failOn, files: result.files, fixed: result.fixed, findings: result.all.map((f) => ({ ...f, new: result.fresh(f) })) }, null, 2));
    else if (opts.format === "github") {
      const ann = formatGithub(result);
      if (ann) stdout(ann);
      stdout(verdictLine(result));
    } else stdout(formatText(result));
    if (opts.summary) appendFileSync(opts.summary, summaryMarkdown(result));
    return result.added.length ? 1 : 0;
  } catch (e) {
    // Bad input, or anything unexpected (an unreadable file): exit 2, so a crash is never read as "findings fail" or a pass.
    stderr(`vois-tokens check: ${e instanceof InputError ? e.message : e?.stack ?? e}`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
