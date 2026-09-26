#!/usr/bin/env node
// Checks that every rule id tagged in the .md files (`id: XXX-000`) resolves to a real
// entry in data/onboarding-rules.json, that every id in the JSON is cited somewhere in the
// .md files, and that every JSON rule has a valid strength. Same convention as
// vois-patterns/scripts/check-rule-sync.mjs.
//
// Usage: node scripts/check-rule-sync.mjs
// Exit code 0 = in sync, 1 = drift found (prints what's missing on which side).

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const rulesPath = join(skillRoot, "data", "onboarding-rules.json");

const ID_TAG = /`id:\s*([A-Z]+-\d+)`/g;
const VALID_STRENGTHS = new Set(["MUST", "SHOULD"]);

function findMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findMarkdownFiles(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function idsTaggedInMarkdown() {
  const found = new Map(); // id -> [files it appears in]
  for (const file of findMarkdownFiles(skillRoot)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(ID_TAG)) {
      const id = match[1];
      // Normalize to forward slashes so this matches data/onboarding-rules.json's
      // source_file values ("references/foo.md") even when path.relative emits
      // backslashes, as it does on Windows.
      const rel = relative(skillRoot, file).split(sep).join("/");
      if (!found.has(id)) found.set(id, []);
      found.get(id).push(rel);
    }
  }
  return found;
}

function main() {
  const { rules } = JSON.parse(readFileSync(rulesPath, "utf8"));
  const jsonIds = new Set(rules.map((r) => r.id));
  const mdIds = idsTaggedInMarkdown();

  const missingFromJson = [...mdIds.keys()].filter((id) => !jsonIds.has(id));
  const missingFromMd = [...jsonIds].filter((id) => !mdIds.has(id));

  // A rule's source_file should be among the files where its id is actually tagged.
  const wrongSourceFile = rules
    .filter((r) => mdIds.has(r.id) && !mdIds.get(r.id).includes(r.source_file))
    .map((r) => ({ id: r.id, declared: r.source_file, foundIn: mdIds.get(r.id) }));

  const invalidStrength = rules.filter((r) => !VALID_STRENGTHS.has(r.strength));

  let ok = true;

  if (missingFromJson.length) {
    ok = false;
    console.error("Tagged in .md but missing from data/onboarding-rules.json:");
    for (const id of missingFromJson) console.error(`  - ${id} (in ${mdIds.get(id).join(", ")})`);
  }

  if (missingFromMd.length) {
    ok = false;
    console.error("In data/onboarding-rules.json but not cited anywhere in .md:");
    for (const id of missingFromMd) console.error(`  - ${id}`);
  }

  if (wrongSourceFile.length) {
    ok = false;
    console.error("source_file mismatch (JSON says one file, id is tagged in another):");
    for (const r of wrongSourceFile) {
      console.error(`  - ${r.id}: declared "${r.declared}", found in [${r.foundIn.join(", ")}]`);
    }
  }

  if (invalidStrength.length) {
    ok = false;
    console.error("Missing or invalid strength (must be MUST or SHOULD):");
    for (const r of invalidStrength) console.error(`  - ${r.id}: strength is "${r.strength}"`);
  }

  if (ok) {
    console.log(`In sync — ${jsonIds.size} rules, all tagged, cross-referenced, and strength-tagged correctly.`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
