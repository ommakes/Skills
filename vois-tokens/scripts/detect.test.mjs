// Run with: node detect.test.mjs
// No new dependency — uses Node's built-in test runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { detectFile } from "./detect.mjs";
import { RULES } from "./registry.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "__fixtures__");

function findingsFor(file) {
  const path = join(FIXTURES, file);
  return detectFile(path, readFileSync(path, "utf8"));
}

const badTsxFindings = findingsFor("bad.tsx");
const badCssFindings = findingsFor("bad.css");
const goodTsxFindings = findingsFor("good.tsx");

const CSS_EXT_ONLY_RULE_IDS = new Set(["DS-CSS-002", "DS-CSS-007"]);
const CODE_EXT_ONLY_RULE_IDS = new Set(["DS-A11Y-010", "DS-A11Y-012", "DS-SPACING-001", "DS-ANIMATION-008", "DS-TYPOGRAPHY-009", "DS-MODAL", "DS-COLOR-002"]);

for (const rule of RULES) {
  if (CSS_EXT_ONLY_RULE_IDS.has(rule.id)) {
    test(`${rule.id} fires on bad.css`, () => {
      assert.ok(badCssFindings.some((f) => f.ruleId === rule.id), `expected ${rule.id} to fire on bad.css`);
    });
  } else if (CODE_EXT_ONLY_RULE_IDS.has(rule.id)) {
    test(`${rule.id} fires on bad.tsx`, () => {
      assert.ok(badTsxFindings.some((f) => f.ruleId === rule.id), `expected ${rule.id} to fire on bad.tsx`);
    });
  } else {
    test(`${rule.id} fires on bad.tsx`, () => {
      assert.ok(badTsxFindings.some((f) => f.ruleId === rule.id), `expected ${rule.id} to fire on bad.tsx`);
    });
    test(`${rule.id} fires on bad.css`, () => {
      assert.ok(badCssFindings.some((f) => f.ruleId === rule.id), `expected ${rule.id} to fire on bad.css`);
    });
  }
}

test("good.tsx triggers no findings", () => {
  assert.deepEqual(goodTsxFindings, [], `expected no findings, got: ${JSON.stringify(goodTsxFindings, null, 2)}`);
});
