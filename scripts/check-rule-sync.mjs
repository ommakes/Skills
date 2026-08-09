#!/usr/bin/env node
// Cross-reference consistency checker for the vois-* rule corpora.
//
// What this catches: a rule ID cited anywhere in vois-tokens/references/*.md
// or vois-patterns/references/*.md (as its own definition, or as an inline
// cross-reference like "same rule as spacing (`[DS-CSS-008]`)") that has no
// matching entry in the corpus's data/*.json — or the reverse, a JSON entry
// with no tag anywhere in its declared source_file. This is exactly the
// failure mode that shipped once in this repo: references/iconography.md
// cited `[DS-CSS-008]`, which never existed in vois-rules.json or as any
// other file's own tag (fixed in commit e543ccc).
//
// What this does NOT do: diff rule *text* between Markdown and JSON, or
// validate anything beyond ID existence. A rule can be reworded in one place
// and not the other without tripping this script — that's a narrower,
// deliberate scope (see vois-tokens/SKILL.md's source-of-truth note).
//
// Exit code is 0 (clean) or 1 (findings) — this is meant to run in CI.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/** Bracketed tags with a numeric suffix, e.g. [DS-A11Y-001] or [DS-LAYOUT-COMP-001]. */
const NUMBERED_TAG = /\[((?:DS|PATH)-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3})\]/g;
/** PATH tags with no numeric suffix, e.g. [PATH-A] or [PATH-C-SIMPLE]. */
const BARE_PATH_TAG = /\[(PATH-[A-Z0-9]+(?:-[A-Z0-9-]+)*)\]/g;

function readMarkdownDir(dir) {
  if (!existsDir(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ file: join(dir, f), text: readFileSync(join(dir, f), "utf8") }));
}

function existsDir(dir) {
  try {
    return readdirSync(dir).length >= 0;
  } catch {
    return false;
  }
}

function collectTags(files, pattern) {
  // Map of tag -> Set of files it appears in (as a defining or referencing mention).
  const tags = new Map();
  for (const { file, text } of files) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = re.exec(text)) !== null) {
      const id = match[1];
      if (!tags.has(id)) tags.set(id, new Set());
      tags.get(id).add(file);
    }
  }
  return tags;
}

function categoryOf(id) {
  // DS-LAYOUT-COMP-001 -> DS-LAYOUT-COMP ; DS-A11Y-001 -> DS-A11Y
  return id.replace(/-\d{3}$/, "");
}

function checkTokens() {
  const findings = [];
  const refDir = join(ROOT, "vois-tokens", "references");
  const mdFiles = readMarkdownDir(refDir);
  const mdTags = collectTags(mdFiles, NUMBERED_TAG);

  const rulesPath = join(ROOT, "vois-tokens", "data", "vois-rules.json");
  const rulesData = JSON.parse(readFileSync(rulesPath, "utf8"));
  const knownCategories = new Set(Object.keys(rulesData.categories || {}));
  const jsonById = new Map(rulesData.rules.map((r) => [r.id, r]));

  // 1. Every numbered tag in the Markdown must have a JSON entry, UNLESS its
  //    category isn't in vois-rules.json's own `categories` map — that's the
  //    data-driven signal for "intentionally excluded" (e.g. DS-SLOP-*, per
  //    the JSON's own `note` field), not a hardcoded exception list here.
  for (const [id, files] of mdTags) {
    if (jsonById.has(id)) continue;
    if (!knownCategories.has(categoryOf(id))) continue; // intentionally excluded family
    findings.push(
      `[vois-tokens] "${id}" is cited in ${[...files].join(", ")} but has no entry in vois-rules.json (dangling reference or missing extraction).`
    );
  }

  // 2. Every JSON entry's id should appear as a tag somewhere in its own
  //    declared source_file.
  for (const rule of rulesData.rules) {
    const sourceFile = join(ROOT, rule.source_file);
    const hit = mdFiles.find((f) => f.file === sourceFile);
    if (!hit) {
      findings.push(`[vois-tokens] ${rule.id}: declared source_file "${rule.source_file}" does not exist.`);
      continue;
    }
    if (!(mdTags.get(rule.id) || new Set()).has(sourceFile)) {
      findings.push(`[vois-tokens] ${rule.id}: no [${rule.id}] tag found in its declared source_file (${rule.source_file}).`);
    }
  }

  return findings;
}

function checkPatterns() {
  const findings = [];
  const refDir = join(ROOT, "vois-patterns", "references");
  const mdFiles = readMarkdownDir(refDir);
  const numbered = collectTags(mdFiles, NUMBERED_TAG);
  const bare = collectTags(mdFiles, BARE_PATH_TAG);
  const mdTags = new Map([...numbered, ...bare]);

  const rulesPath = join(ROOT, "vois-patterns", "data", "patterns-rules.json");
  const rulesData = JSON.parse(readFileSync(rulesPath, "utf8"));
  const jsonById = new Map(rulesData.nodes.map((n) => [n.id, n]));

  for (const [id, files] of mdTags) {
    if (jsonById.has(id)) continue;
    findings.push(
      `[vois-patterns] "${id}" is cited in ${[...files].join(", ")} but has no entry in patterns-rules.json.`
    );
  }

  for (const node of rulesData.nodes) {
    const sourceFile = join(ROOT, node.source_file);
    const hit = mdFiles.find((f) => f.file === sourceFile);
    if (!hit) {
      findings.push(`[vois-patterns] ${node.id}: declared source_file "${node.source_file}" does not exist.`);
      continue;
    }
    if (!(mdTags.get(node.id) || new Set()).has(sourceFile)) {
      findings.push(`[vois-patterns] ${node.id}: no [${node.id}] tag found in its declared source_file (${node.source_file}).`);
    }
  }

  return findings;
}

function main() {
  const findings = [...checkTokens(), ...checkPatterns()];
  if (findings.length === 0) {
    console.log("check-rule-sync: OK — every cited rule ID resolves, every JSON entry has a matching tag.");
    process.exit(0);
  }
  console.error(`check-rule-sync: ${findings.length} finding(s)\n`);
  for (const f of findings) console.error(`  - ${f}`);
  process.exit(1);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main();
