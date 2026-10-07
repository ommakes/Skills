// Run with: node detect.test.mjs
// No new dependency — uses Node's built-in test runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { detectFile } from "./detect.mjs";
import { RULES } from "./registry.mjs";
import { TUNABLES, loadTeams, paramsFor, matchesScope, summarizeTeams } from "./team-overrides.mjs";

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
  // A path relative to the project root has no separator in front of components/.
  for (const p of ["components/ui/thing.tsx", "components\\ui\\thing.tsx"]) {
    assert.equal(detectFile(p, src).filter((f) => f.ruleId.startsWith("LOOKALIKE-")).length, 0, p);
  }
  assert.ok(detectFile("mycomponents/ui/thing.tsx", src).filter((f) => f.ruleId.startsWith("LOOKALIKE-")).length >= 3);
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

// ---------------------------------------------------------------------------
// Team overrides: the hook reads <root>/.vois/teams/*.json and tightens limits.
// ---------------------------------------------------------------------------

function projectWith(teamFiles) {
  const root = mkdtempSync(join(tmpdir(), "vois-teams-"));
  mkdirSync(join(root, ".vois", "teams"), { recursive: true });
  for (const [name, body] of Object.entries(teamFiles)) {
    writeFileSync(join(root, ".vois", "teams", `${name}.json`), typeof body === "string" ? body : JSON.stringify(body));
  }
  return root;
}

const team = (name, overrides, scope) => ({ schema: "vois-team-override/1", team: name, ...(scope ? { scope: { paths: scope } } : {}), overrides });
const restrictOverride = (n, rule, param, value) => ({ id: `x-00${n}`, op: "restrict", rule, param, value, reason: "Because this team needs it." });

/** Findings for `source` written at `rel` inside `root`, with the team files in that project applied. */
function findingsIn(root, rel, source) {
  const filePath = join(root, rel);
  return detectFile(filePath, source, { params: paramsFor(loadTeams(root), root, filePath) });
}
const has = (found, ruleId) => found.filter((f) => f.ruleId === ruleId);

test("without team files the base limits apply", () => {
  const root = projectWith({});
  assert.deepEqual(has(findingsIn(root, "src/a.tsx", '<div className="duration-250" />'), "DS-ANIMATION-001"), []);
  assert.equal(has(findingsIn(root, "src/a.tsx", '<div className="duration-350" />'), "DS-ANIMATION-001").length, 1);
});

test("a team limit tightens the animation check, only for files in its scope", () => {
  const root = projectWith({ payments: team("payments", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)], ["apps/payments/**"]) });
  const inScope = has(findingsIn(root, "apps/payments/Checkout.tsx", '<div className="duration-250" />'), "DS-ANIMATION-001");
  assert.equal(inScope.length, 1);
  assert.match(inScope[0].message, /exceeds 200ms/);
  assert.match(inScope[0].message, /limit set by the payments team/);
  assert.deepEqual(has(findingsIn(root, "apps/growth/Hero.tsx", '<div className="duration-250" />'), "DS-ANIMATION-001"), []);
});

test("a team with no scope covers every file in the project", () => {
  const root = projectWith({ solo: team("solo", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)]) });
  assert.equal(has(findingsIn(root, "anywhere/deep/File.tsx", '<div className="duration-250" />'), "DS-ANIMATION-001").length, 1);
});

test("the large-element ceiling follows its own limit and never drops below the standard one", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-002", "max_duration_ms", 400)]) });
  const over = has(findingsIn(root, "a.tsx", '<div className="duration-450" />'), "DS-ANIMATION-001");
  assert.match(over[0].message, /exceeds the 400ms ceiling/);
  const low = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-002", "max_duration_ms", 200)]) });
  assert.match(has(findingsIn(low, "a.tsx", '<div className="duration-350" />'), "DS-ANIMATION-001")[0].message, /exceeds the 300ms ceiling/);
});

test("a team press-scale floor and spacing divisor are applied", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-008", "min_press_scale", 0.97), restrictOverride(2, "DS-SPACING-001", "spacing_divisors", [8])]) });
  assert.match(has(findingsIn(root, "a.tsx", '<button className="active:scale-96" />'), "DS-ANIMATION-008")[0].message, /below the 0.97 floor/);
  assert.deepEqual(has(findingsIn(projectWith({}), "a.tsx", '<button className="active:scale-96" />'), "DS-ANIMATION-008"), []);
  assert.match(has(findingsIn(root, "a.tsx", '<div className="p-[12px]" />'), "DS-SPACING-001")[0].message, /not divisible by 8/);
  assert.deepEqual(has(findingsIn(root, "a.tsx", '<div className="p-[16px]" />'), "DS-SPACING-001"), []);
  assert.deepEqual(has(findingsIn(projectWith({}), "a.tsx", '<div className="p-[12px]" />'), "DS-SPACING-001"), []);
});

test("an override that loosens the base, leaves its range, or is malformed is ignored", () => {
  const root = projectWith({
    loose: team("loose", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 400)]),
    tiny: team("tiny", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 50)]),
    relax: team("relax", [{ id: "relax-001", op: "relax", rule: "DS-ANIMATION-001", param: "max_duration_ms", value: 900, reason: "Because." }]),
    wrongSchema: { ...team("wrongSchema", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 100)]), schema: "something-else" },
    broken: "{ not json",
  });
  const params = paramsFor(loadTeams(root), root, join(root, "a.tsx"));
  assert.equal(params.get("DS-ANIMATION-001", "max_duration_ms"), 300);
  assert.equal(params.source("DS-ANIMATION-001", "max_duration_ms"), null);
});

test("a bad team file does not stop a good one from applying", () => {
  const root = projectWith({ broken: "{ nope", good: team("good", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)]) });
  assert.equal(paramsFor(loadTeams(root), root, join(root, "a.tsx")).get("DS-ANIMATION-001", "max_duration_ms"), 200);
});

test("where teams overlap the strictest value wins, and separate scopes keep their own", () => {
  const root = projectWith({
    a: team("a", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 250)], ["apps/**"]),
    b: team("b", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 150)], ["apps/payments/**"]),
  });
  const get = (rel) => paramsFor(loadTeams(root), root, join(root, rel)).get("DS-ANIMATION-001", "max_duration_ms");
  assert.equal(get("apps/payments/x.tsx"), 150);
  assert.equal(get("apps/growth/x.tsx"), 250);
  assert.equal(get("lib/x.tsx"), 300);
});

test("a file outside the project root, or with no path, gets the base limits", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)]) });
  assert.equal(paramsFor(loadTeams(root), root, "/somewhere/else/a.tsx").get("DS-ANIMATION-001", "max_duration_ms"), 300);
  assert.equal(paramsFor(loadTeams(root), root, undefined).get("DS-ANIMATION-001", "max_duration_ms"), 300);
});

test("path globs: ** crosses folders, * and ? do not, and a leading ./ is ignored", () => {
  assert.ok(matchesScope(["apps/payments/**"], "apps/payments/a/b.tsx"));
  assert.ok(!matchesScope(["apps/payments/**"], "apps/paymentsx/a.tsx"));
  assert.ok(matchesScope(["**/*.tsx"], "a/b/c.tsx"));
  assert.ok(matchesScope(["**/*.tsx"], "c.tsx"));
  assert.ok(!matchesScope(["*.tsx"], "a/c.tsx"));
  assert.ok(matchesScope(["src/?.tsx"], "src/a.tsx"));
  assert.ok(!matchesScope(["src/?.tsx"], "src/ab.tsx"));
  assert.ok(matchesScope(["./apps/**"], "apps/x.tsx"));
  assert.ok(matchesScope([], "anything.tsx"));
  assert.ok(!matchesScope(["a.b"], "aXb"));
});

test("the hook's limits match the entries in vois-teams/data/ranges.json", { skip: !existsSync(join(HERE, "..", "..", "vois-teams", "data", "ranges.json")) }, () => {
  const ranges = JSON.parse(readFileSync(join(HERE, "..", "..", "vois-teams", "data", "ranges.json"), "utf8")).ranges;
  for (const [rule, params] of Object.entries(TUNABLES)) {
    for (const [param, spec] of Object.entries(params)) {
      const entry = ranges.find((r) => r.rule === rule && r.param === param);
      assert.ok(entry, `${rule} ${param} is not in ranges.json`);
      for (const key of Object.keys(spec)) assert.deepEqual(entry[key], spec[key], `${rule} ${param} ${key}`);
    }
  }
});

test("the payments example from vois-teams drives the hook end to end", { skip: !existsSync(join(HERE, "..", "..", "vois-teams", "examples", "payments.json")) }, () => {
  const root = projectWith({});
  copyFileSync(join(HERE, "..", "..", "vois-teams", "examples", "payments.json"), join(root, ".vois", "teams", "payments.json"));
  mkdirSync(join(root, "apps", "payments"), { recursive: true });
  const file = join(root, "apps", "payments", "Pay.tsx");
  writeFileSync(file, '<div className="duration-250 p-[12px]" />\n');
  const payload = JSON.stringify({ tool_name: "Write", cwd: root, tool_input: { file_path: file } });
  const run = spawnSync(process.execPath, [join(HERE, "hook.mjs")], { input: payload, encoding: "utf8" });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /DS-ANIMATION-001/);
  assert.match(run.stdout, /limit set by the payments team/);
  assert.match(run.stdout, /DS-SPACING-001/);
  const cli = spawnSync(process.execPath, [join(HERE, "detect.mjs"), "--root", root, file], { encoding: "utf8" });
  assert.ok(JSON.parse(cli.stdout).some((f) => f.ruleId === "DS-ANIMATION-001"));
  const base = spawnSync(process.execPath, [join(HERE, "detect.mjs"), file], { encoding: "utf8" });
  assert.equal(JSON.parse(base.stdout).some((f) => f.ruleId === "DS-ANIMATION-001"), false);
});

test("status lines say what is applied, ignored, or not checked", () => {
  const lines = summarizeTeams([team("t", [
    restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200),
    restrictOverride(2, "DS-ANIMATION-001", "max_duration_ms", 400),
    restrictOverride(3, "DS-TYPOGRAPHY-001", "max_text_styles", 2),
  ], ["apps/**"])]).join("\n");
  assert.match(lines, /t \(apps\/\*\*\)/);
  assert.match(lines, /applied: DS-ANIMATION-001 max_duration_ms = 200/);
  assert.match(lines, /ignored.*DS-ANIMATION-001 max_duration_ms = 400/);
  assert.match(lines, /not checked by the hook: DS-TYPOGRAPHY-001 max_text_styles = 2/);
});
