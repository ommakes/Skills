#!/usr/bin/env node
// Verifies that every rule ID referenced in SKILL.md exists in data/conversion-rules.json,
// that every rule ID in the JSON is at least mentioned somewhere in SKILL.md or its own
// `contradicts` list, and that every ID inside `contradicts` arrays resolves to a real rule
// (or an explicit cross-skill tag containing a colon, which is exempt).
//
// Usage: node scripts/check-rule-sync.mjs
// Exit code 0 = clean, 1 = mismatch found.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const skillPath = path.join(root, "SKILL.md");
const dataPath = path.join(root, "data", "conversion-rules.json");

const skillText = readFileSync(skillPath, "utf8");
const ruleData = JSON.parse(readFileSync(dataPath, "utf8"));
const ruleIds = Object.keys(ruleData.rules);

const RULE_ID_PATTERN = /\b([A-Z][A-Z-]*-\d{2})\b/g;

function idsMentionedIn(text) {
  const found = new Set();
  let m;
  while ((m = RULE_ID_PATTERN.exec(text)) !== null) {
    found.add(m[1]);
  }
  return found;
}

const mentionedInSkillMd = idsMentionedIn(skillText);

let errors = [];

// 1. Every ID in SKILL.md must exist in the JSON.
for (const id of mentionedInSkillMd) {
  if (!ruleIds.includes(id)) {
    errors.push(`SKILL.md references "${id}" but it is not defined in data/conversion-rules.json`);
  }
}

// 2. Every ID in the JSON should be reachable — either literally named in SKILL.md,
//    or (at minimum) present in some other rule's `contradicts` list, so it isn't orphaned.
const mentionedViaContradicts = new Set();
for (const [id, rule] of Object.entries(ruleData.rules)) {
  for (const c of rule.contradicts || []) {
    mentionedViaContradicts.add(c);
  }
}

for (const id of ruleIds) {
  if (!mentionedInSkillMd.has(id) && !mentionedViaContradicts.has(id)) {
    // Category-only reference in SKILL.md (e.g. "PAYWALL" without a number) doesn't count —
    // this is intentionally strict so new rules don't silently go unreferenced anywhere.
    errors.push(`"${id}" is defined in data/conversion-rules.json but never referenced in SKILL.md or in another rule's contradicts list`);
  }
}

// 3. Every ID inside a contradicts[] array must resolve to a real rule, unless it's an
//    explicit cross-skill tag (contains a colon).
for (const [id, rule] of Object.entries(ruleData.rules)) {
  for (const c of rule.contradicts || []) {
    if (c.includes(":")) continue; // cross-skill tag, exempt
    if (!ruleIds.includes(c)) {
      errors.push(`Rule "${id}" lists "${c}" in contradicts, but "${c}" does not exist`);
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ conversion-patterns rule sync check failed (${errors.length} issue(s)):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`✓ conversion-patterns rule sync check passed — ${ruleIds.length} rules, all referenced and consistent.`);
  process.exit(0);
}
