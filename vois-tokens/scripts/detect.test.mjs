// Run with: node detect.test.mjs
// No new dependency — uses Node's built-in test runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
const CODE_EXT_ONLY_RULE_IDS = new Set(["DS-A11Y-010", "DS-A11Y-012", "DS-SPACING-001", "DS-ANIMATION-008", "DS-TYPOGRAPHY-009", "DS-MODAL", "DS-COLOR-002", ...RULES.filter((r) => r.id.startsWith("LOOKALIKE-")).map((r) => r.id)]);

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

// StyleX object-literal syntax for rules whose Tailwind/CSS-string detection
// is covered above by bad.tsx/bad.css — see bad-stylex.tsx for why each one
// fires under StyleX's camelCase, quoted-string property syntax.
const badStylexFindings = findingsFor("bad-stylex.tsx");
const STYLEX_RULE_IDS = ["DS-SPACING-001", "DS-TAILWIND-005", "DS-ANIMATION-001", "DS-ANIMATION-008", "DS-ANIMATION-009"];

for (const ruleId of STYLEX_RULE_IDS) {
  test(`${ruleId} fires on bad-stylex.tsx (StyleX syntax)`, () => {
    assert.ok(badStylexFindings.some((f) => f.ruleId === ruleId), `expected ${ruleId} to fire on bad-stylex.tsx`);
  });
}

// Adversarial: known bypasses of the DS-SLOP-002 (AI-gradient) regex.
// These assert *current* (non-)behavior to document a real gap, not a
// requirement — see adversarial.tsx/.css for why each one bypasses the
// detector. If registry.mjs's DS-SLOP-002 pattern is ever taught to
// recognize arbitrary hex values, these assertions should flip to expect a
// finding, not be deleted.
const adversarialTsxFindings = findingsFor("adversarial.tsx");
const adversarialCssFindings = findingsFor("adversarial.css");

test("KNOWN GAP: DS-SLOP-002 does not catch arbitrary-hex Tailwind gradients", () => {
  const hit = adversarialTsxFindings.some((f) => f.ruleId === "DS-SLOP-002");
  assert.equal(hit, false, "if this now fires, registry.mjs's regex was extended to hex values — update this test to assert a finding instead");
});

test("KNOWN GAP: DS-SLOP-002 does not catch arbitrary-hex CSS linear-gradient()", () => {
  const hit = adversarialCssFindings.some((f) => f.ruleId === "DS-SLOP-002");
  assert.equal(hit, false, "if this now fires, registry.mjs's regex was extended to hex values — update this test to assert a finding instead");
});

test("KNOWN GAP: DS-TABLE-001 does not catch a wrapper and a sticky header split across files", () => {
  const hit = adversarialTsxFindings.some((f) => f.ruleId === "DS-TABLE-001");
  assert.equal(hit, false, "if this now fires, the detector learned to see across files (or flagged the wrapper alone, which would be noisy) - update this test");
});

test("DS-TABLE-001 flags overflow-x auto with overflow-y clip in one CSS block", () => {
  const css = ".w { overflow-x: auto; overflow-y: clip; }\n.w thead th { position: sticky; top: 0; }\n";
  const found = detectFile("x.css", css);
  assert.ok(found.some((f) => f.ruleId === "DS-TABLE-001"));
});

test("DS-TABLE-001 does not flag a wrapper with a bounded block size", () => {
  const css = ".w { overflow: auto; max-block-size: 70dvh; }\n.w thead th { position: sticky; top: 0; }\n";
  assert.equal(detectFile("x.css", css).some((f) => f.ruleId === "DS-TABLE-001"), false);
});

test("DS-TABLE-001 does not flag a simple table with no overflow on the wrapper", () => {
  const css = ".w { }\n.w thead th { position: sticky; top: var(--app-header-h); }\n";
  assert.equal(detectFile("x.css", css).some((f) => f.ruleId === "DS-TABLE-001"), false);
});

// Lookalike rules. Ids must match the rows in vois-components, and the primitives folder is exempt.
const COMPONENTS_RULES = join(HERE, "..", "..", "vois-components", "data", "components-rules.json");

test("every LOOKALIKE-* rule id is a row in vois-components lookalikes", { skip: !existsSync(COMPONENTS_RULES) }, () => {
  const rows = JSON.parse(readFileSync(COMPONENTS_RULES, "utf8")).lookalikes.rows.map((r) => r.id);
  for (const rule of RULES.filter((r) => r.id.startsWith("LOOKALIKE-"))) {
    assert.ok(rows.includes(rule.id), `${rule.id} is not a lookalikes row`);
  }
});

test("LOOKALIKE-* rules skip files under components/ui", () => {
  const src = '<button className="focus-visible:ring-2">x</button><div onClick={go}>y</div><Loader2 className="animate-spin" />';
  assert.equal(detectFile("src/components/ui/thing.tsx", src).filter((f) => f.ruleId.startsWith("LOOKALIKE-")).length, 0);
  assert.ok(detectFile("src/screens/thing.tsx", src).filter((f) => f.ruleId.startsWith("LOOKALIKE-")).length >= 3);
});

test("LOOKALIKE-005 handles arrow functions inside attributes and skips role= and stopPropagation", () => {
  const hit = detectFile("a.tsx", "<div onClick={() => go(1)} className=\"x\">row</div>");
  assert.ok(hit.some((f) => f.ruleId === "LOOKALIKE-005"));
  assert.equal(detectFile("a.tsx", '<div role="button" tabIndex={0} onClick={go}>row</div>').some((f) => f.ruleId === "LOOKALIKE-005"), false);
  assert.equal(detectFile("a.tsx", "<div onClick={(e) => e.stopPropagation()}>row</div>").some((f) => f.ruleId === "LOOKALIKE-005"), false);
});

test("LOOKALIKE-007 ignores a loading flag and short delays", () => {
  assert.equal(detectFile("a.tsx", "setTimeout(() => setLoading(false), 3000)").some((f) => f.ruleId === "LOOKALIKE-007"), false);
  assert.equal(detectFile("a.tsx", "setTimeout(() => setOpen(false), 300)").some((f) => f.ruleId === "LOOKALIKE-007"), false);
  assert.ok(detectFile("a.tsx", "setTimeout(() => setShown(false), 3000)").some((f) => f.ruleId === "LOOKALIKE-007"));
});

test("LOOKALIKE-009 matches the native call but not a method or a longer name", () => {
  assert.ok(detectFile("a.tsx", "if (confirm('x')) go()").some((f) => f.ruleId === "LOOKALIKE-009"));
  assert.ok(detectFile("a.tsx", "const n = window.prompt('x')").some((f) => f.ruleId === "LOOKALIKE-009"));
  for (const src of ["toast.alert('x')", "onConfirm()", "confirmAction()", "const prompted = 1"]) {
    assert.equal(detectFile("a.tsx", src).some((f) => f.ruleId === "LOOKALIKE-009"), false, src);
  }
});
