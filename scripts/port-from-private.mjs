#!/usr/bin/env node
// Ports the mechanical part of a private change into this public repo, and reports drift.
//
// What it does (the lists come from scripts/mirror-config.mjs, the same ones check-mirror.mjs uses):
//   - Copies every shared file that differs: the shared code, the rule files, the mirrored folders.
//   - Leaves files that carry allowed wording differences (ALLOWED) alone and says to merge them by hand.
//   - For each skill whose private version is newer: sets the version in SKILL.md, README.md (the `**vX.Y.Z**`
//     line) and skills.json, copies the CHANGELOG entries the public file does not have, and updates the
//     "behind: source is X" note in figma-editions/README.md.
//   - Then runs check-mirror.mjs, unless --dry-run.
// It does not touch git and it does not port SKILL.md or README prose. Read the drift report for that.
//
// Usage:
//   node scripts/port-from-private.mjs --private <checkout> [--dry-run]
//   node scripts/port-from-private.mjs --private <checkout> --report

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SHARED_CODE, RULE_FILES, ALLOWED, MIRRORED_TREES, STANDALONE_SKILLS, trackedFiles, ruleFileEquivalent,
} from "./mirror-config.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEMVER = /^\d+\.\d+\.\d+$/;

/** -1, 0 or 1. A version that is not x.y.z compares as null, so the caller can stop. */
export function compareVersions(a, b) {
  if (!SEMVER.test(a ?? "") || !SEMVER.test(b ?? "")) return null;
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}

const read = (p) => readFileSync(p, "utf8");
const same = (a, b) => readFileSync(a).equals(readFileSync(b));

/** The `version:` of a SKILL.md frontmatter, or null. Only the first block between --- lines counts. */
export function skillVersion(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const v = m && /^version:[ \t]*(\S+)[ \t]*$/m.exec(m[1]);
  return v ? v[1] : null;
}

/** The changelog entries, newest first as written: [{ version, text }]. An entry runs from its `## [x.y.z]` line to the next one. */
export function changelogEntries(text) {
  const heads = [...text.matchAll(/^## \[(\d+\.\d+\.\d+)\][^\n]*$/gm)];
  return heads.map((h, i) => ({ version: h[1], text: text.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : text.length) }));
}

/**
 * The public changelog with every private entry newer than `publicVersion` put in above the newest public
 * entry. Returns { text, added: [versions] }, or null when the public file has no entry to insert above.
 */
export function mergeChangelog(publicText, privateText, publicVersion) {
  const first = /^## \[\d+\.\d+\.\d+\]/m.exec(publicText);
  if (!first) return null;
  const have = new Set(changelogEntries(publicText).map((e) => e.version));
  const fresh = changelogEntries(privateText).filter((e) => !have.has(e.version) && compareVersions(e.version, publicVersion) === 1);
  if (!fresh.length) return { text: publicText, added: [] };
  const block = fresh.map((e) => e.text.replace(/\s*$/, "\n\n")).join("");
  return { text: publicText.slice(0, first.index) + block + publicText.slice(first.index), added: fresh.map((e) => e.version) };
}

/** Sets `version:` in the SKILL.md frontmatter. Null when there is no version line to set. */
export function setSkillVersion(text, version) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m || !/^version:[ \t]*\S+[ \t]*$/m.test(m[1])) return null;
  const front = m[0].replace(/^version:[ \t]*\S+[ \t]*$/m, `version: ${version}`);
  return front + text.slice(m[0].length);
}

/** Sets the first `**vX.Y.Z**` in a README. Null when there is none. */
export function setReadmeVersion(text, version) {
  const re = /\*\*v\d+\.\d+\.\d+\*\*/;
  return re.test(text) ? text.replace(re, `**v${version}**`) : null;
}

/** Sets the `version` of the named skill in skills.json text, keeping the file's layout. Null when it cannot find exactly one. */
export function setSkillsJsonVersion(text, name, version) {
  const re = new RegExp(`("name":\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^}]*?"version":\\s*")\\d+\\.\\d+\\.\\d+(")`, "g");
  if ((text.match(re) || []).length !== 1) return null;
  return text.replace(re, `$1${version}$2`);
}

/** Sets "(behind: source is X)" in the row of the figma-editions README for `skill`. Returns { text } or { warn }. */
export function setEditionNote(text, skill, version) {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.startsWith(`| \`${skill}.md\``));
  if (at < 0) return { warn: `figma-editions/README.md has no row for ${skill}.md` };
  const row = lines[at];
  const m = /\(behind: source is (\d+\.\d+\.\d+)\)/.exec(row);
  if (!m) return { warn: `figma-editions/README.md row for ${skill}.md is not marked behind (it says what the edition misses); mark it by hand` };
  lines[at] = row.replace(m[0], `(behind: source is ${version})`);
  return { text: lines.join("\n") };
}

function ensureDir(file) { mkdirSync(dirname(file), { recursive: true }); }

/**
 * Plans and applies a port. Returns { actions: [string], warnings: [string], errors: [string] }.
 * `config` can replace the lists (the tests use small ones).
 */
export function port({ publicRoot, privateRoot, dryRun = false, config = {} }) {
  const cfg = { SHARED_CODE, RULE_FILES, ALLOWED, MIRRORED_TREES, STANDALONE_SKILLS, trackedFiles, ...config };
  const out = { actions: [], warnings: [], errors: [] };
  const write = (rel, text) => { if (!dryRun) { ensureDir(join(publicRoot, rel)); writeFileSync(join(publicRoot, rel), text); } };

  // 1. Shared files.
  const copy = (rel) => {
    const pub = join(publicRoot, rel), priv = join(privateRoot, rel);
    if (!existsSync(priv)) { out.errors.push(`${rel}: missing in private`); return; }
    if (existsSync(pub) && same(pub, priv)) return;
    if (!dryRun) { ensureDir(pub); writeFileSync(pub, readFileSync(priv)); }
    out.actions.push(`copy ${rel}`);
  };
  const equivalent = (rel) => {
    const pub = join(publicRoot, rel), priv = join(privateRoot, rel);
    return existsSync(pub) && existsSync(priv) && ruleFileEquivalent(rel, read(pub), read(priv));
  };
  for (const rel of cfg.SHARED_CODE) {
    if (Object.hasOwn(cfg.ALLOWED, rel)) { if (!equivalent(rel)) handMerge(rel); continue; }
    copy(rel);
  }
  for (const rel of cfg.RULE_FILES) {
    if (equivalent(rel)) continue;
    if (Object.hasOwn(cfg.ALLOWED, rel)) { handMerge(rel); continue; }
    copy(rel);
  }
  for (const rel of Object.keys(cfg.ALLOWED)) if (!cfg.RULE_FILES.includes(rel) && !cfg.SHARED_CODE.includes(rel) && !equivalent(rel)) handMerge(rel);
  function handMerge(rel) {
    out.warnings.push(`${rel}: carries allowed wording differences, so it is not copied. Merge it by hand, then run check-mirror.`);
  }

  // 2. Mirrored folders: tracked files in private. Public-only files are reported, never deleted.
  for (const tree of cfg.MIRRORED_TREES) {
    const priv = cfg.trackedFiles(privateRoot, tree), pub = cfg.trackedFiles(publicRoot, tree);
    if (!priv) { out.errors.push(`${tree}/: cannot list tracked files in private (is it a git checkout?)`); continue; }
    for (const rel of priv.keys()) copy(rel);
    if (pub) for (const rel of pub.keys()) if (!priv.has(rel)) out.warnings.push(`${rel}: is in public only. Delete it by hand if private removed it.`);
  }

  // 3. Versions, changelogs and notes, per skill.
  let pubJson = existsSync(join(publicRoot, "skills.json")) ? read(join(publicRoot, "skills.json")) : null;
  let editions = existsSync(join(publicRoot, "figma-editions/README.md")) ? read(join(publicRoot, "figma-editions/README.md")) : null;
  for (const skill of cfg.STANDALONE_SKILLS) {
    const privSkill = join(privateRoot, skill, "SKILL.md"), pubSkill = join(publicRoot, skill, "SKILL.md");
    if (!existsSync(privSkill) || !existsSync(pubSkill)) { out.warnings.push(`${skill}: SKILL.md missing on one side, version not ported`); continue; }
    const pv = skillVersion(read(privSkill)), bv = skillVersion(read(pubSkill));
    const cmp = compareVersions(bv, pv);
    if (cmp === null) { out.errors.push(`${skill}: version is not x.y.z (private ${pv}, public ${bv})`); continue; }
    if (cmp === 1) { out.errors.push(`${skill}: public version ${bv} is newer than private ${pv}. Port the other way first.`); continue; }
    if (cmp === 0) continue;

    const skillText = setSkillVersion(read(pubSkill), pv);
    if (skillText === null) out.errors.push(`${skill}/SKILL.md: no version line to set`);
    else { write(`${skill}/SKILL.md`, skillText); out.actions.push(`${skill}/SKILL.md: version ${bv} -> ${pv}`); }

    const readme = join(publicRoot, skill, "README.md");
    if (!existsSync(readme)) out.warnings.push(`${skill}/README.md: not found, version line not set`);
    else {
      const t = setReadmeVersion(read(readme), pv);
      if (t === null) out.warnings.push(`${skill}/README.md: has no **vX.Y.Z** line, set it by hand`);
      else { write(`${skill}/README.md`, t); out.actions.push(`${skill}/README.md: version line -> ${pv}`); }
    }

    if (pubJson !== null) {
      const t = setSkillsJsonVersion(pubJson, skill, pv);
      if (t === null) out.warnings.push(`skills.json: could not find exactly one entry for ${skill}, set it by hand`);
      else { pubJson = t; out.actions.push(`skills.json: ${skill} -> ${pv}`); }
    }

    const pubLog = join(publicRoot, skill, "CHANGELOG.md"), privLog = join(privateRoot, skill, "CHANGELOG.md");
    if (!existsSync(pubLog) || !existsSync(privLog)) out.warnings.push(`${skill}/CHANGELOG.md: missing on one side, no entries ported`);
    else {
      const merged = mergeChangelog(read(pubLog), read(privLog), bv);
      if (!merged) out.warnings.push(`${skill}/CHANGELOG.md: public file has no entry to insert above`);
      else if (!merged.added.length) out.warnings.push(`${skill}/CHANGELOG.md: private has no entry newer than ${bv}. Write one.`);
      else {
        write(`${skill}/CHANGELOG.md`, merged.text);
        out.actions.push(`${skill}/CHANGELOG.md: added ${merged.added.join(", ")}`);
        if (!merged.added.includes(pv)) out.warnings.push(`${skill}/CHANGELOG.md: no entry for ${pv} itself in private`);
      }
    }

    if (editions !== null) {
      const r = setEditionNote(editions, skill, pv);
      if (r.warn) out.warnings.push(r.warn);
      else { editions = r.text; out.actions.push(`figma-editions/README.md: ${skill} source is ${pv}`); }
    }
  }
  if (pubJson !== null) write("skills.json", pubJson);
  if (editions !== null) write("figma-editions/README.md", editions);
  return out;
}

// ---- drift report -------------------------------------------------------------------------------

function listFiles(root, skill) {
  let out;
  try { out = execFileSync("git", ["-C", root, "ls-files", "-z", "--", skill], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); }
  catch { return null; }
  return new Set(out.split("\0").filter(Boolean));
}

/** Changed lines between two files: { added, removed }, or null when it cannot tell (binary). */
function lineChanges(a, b) {
  const r = spawnSync("git", ["diff", "--no-index", "--numstat", "--", a, b], { encoding: "utf8" });
  const m = /^(\d+|-)\t(\d+|-)\t/.exec(r.stdout || "");
  if (!m || m[1] === "-") return null;
  return { added: Number(m[1]), removed: Number(m[2]) };
}

/**
 * Per skill, the tracked files that differ between the repos outside the mirror-compared files and the
 * changelogs. Differences in the mirror-compared files are errors, since check-mirror would fail on them.
 * Returns { skills: [{ skill, differ: [{ file, added, removed }], privateOnly, publicOnly }], shared: [file] }.
 */
export function drift({ publicRoot, privateRoot, config = {}, skills }) {
  const cfg = { SHARED_CODE, RULE_FILES, ALLOWED, MIRRORED_TREES, STANDALONE_SKILLS, ...config };
  const compared = new Set([...cfg.SHARED_CODE, ...cfg.RULE_FILES, ...Object.keys(cfg.ALLOWED)]);
  const inTree = (f) => cfg.MIRRORED_TREES.some((t) => f === t || f.startsWith(t + "/"));
  const result = { skills: [], shared: [], errors: [] };
  const names = skills ?? cfg.STANDALONE_SKILLS;
  for (const skill of names) {
    const pub = listFiles(publicRoot, skill), priv = listFiles(privateRoot, skill);
    if (!pub || !priv) { result.errors.push(`${skill}: cannot list tracked files (is each side a git checkout?)`); continue; }
    const row = { skill, differ: [], privateOnly: [], publicOnly: [] };
    for (const f of [...new Set([...pub, ...priv])].sort()) {
      if (inTree(f)) continue;
      if (f.endsWith("/CHANGELOG.md")) continue;
      if (pub.has(f) && !priv.has(f)) { row.publicOnly.push(f); continue; }
      if (!pub.has(f) && priv.has(f)) { row.privateOnly.push(f); continue; }
      const a = join(publicRoot, f), b = join(privateRoot, f);
      if (!existsSync(a) || !existsSync(b) || same(a, b)) continue;
      if (compared.has(f)) {
        const isRule = cfg.RULE_FILES.includes(f) || Object.hasOwn(cfg.ALLOWED, f);
        if (!(isRule && ruleFileEquivalent(f, read(a), read(b)))) result.shared.push(f);
        continue;
      }
      row.differ.push({ file: f, ...(lineChanges(a, b) ?? { added: null, removed: null }) });
    }
    result.skills.push(row);
  }
  return result;
}

export function formatDrift(d) {
  const lines = [];
  for (const row of d.skills) {
    const n = row.differ.length + row.privateOnly.length + row.publicOnly.length;
    lines.push(`${row.skill}: ${n ? n + " file(s) drift" : "no drift"}`);
    for (const f of row.differ) lines.push(`  differs     ${f.file}${f.added === null ? " (binary)" : `  (+${f.added} -${f.removed}, private to public)`}`);
    for (const f of row.privateOnly) lines.push(`  private only ${f}`);
    for (const f of row.publicOnly) lines.push(`  public only  ${f}`);
  }
  if (d.shared.length) {
    lines.push("", "Shared files that differ (check-mirror fails on these; run the port):");
    for (const f of d.shared) lines.push(`  ${f}`);
  }
  for (const e of d.errors) lines.push(`error: ${e}`);
  return lines.join("\n");
}

// ---- command line -------------------------------------------------------------------------------

function main(argv) {
  const i = argv.indexOf("--private");
  const privateRoot = i > -1 && argv[i + 1] ? resolve(argv[i + 1]) : "";
  if (!privateRoot || !existsSync(join(privateRoot, "vois-tokens"))) {
    console.error("port-from-private: pass --private <path to the private vois-skills checkout>");
    return 2;
  }
  if (argv.includes("--report")) {
    const d = drift({ publicRoot: HERE, privateRoot });
    console.log(formatDrift(d));
    return d.shared.length || d.errors.length ? 1 : 0;
  }
  const dryRun = argv.includes("--dry-run");
  const r = port({ publicRoot: HERE, privateRoot, dryRun });
  for (const a of r.actions) console.log(`${dryRun ? "would " : ""}${a}`);
  for (const w of r.warnings) console.warn(`warning: ${w}`);
  for (const e of r.errors) console.error(`error: ${e}`);
  if (!r.actions.length && !r.warnings.length && !r.errors.length) console.log("port-from-private: nothing to port");
  if (r.errors.length) return 1;
  if (dryRun) return 0;
  const c = spawnSync("node", [join(HERE, "scripts", "check-mirror.mjs"), "--private", privateRoot], { stdio: "inherit" });
  return c.status ?? 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
