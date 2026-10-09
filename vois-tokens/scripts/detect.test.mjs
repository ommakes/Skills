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
  assert.ok(matchesScope(undefined, "anything.tsx"));
  assert.ok(!matchesScope([], "anything.tsx"));
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

const dur = (src, root, rel = "a.tsx") => has(findingsIn(root, rel, src), "DS-ANIMATION-001");

test("a malformed scope never widens a team to the whole repo", () => {
  for (const scope of ["apps/payments/**", [], {}, null, ["apps/**", 5], { paths: "apps/**" }, { paths: [] }]) {
    const root = projectWith({ t: { ...team("t", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)]), scope } });
    assert.deepEqual(loadTeams(root), [], JSON.stringify(scope));
    assert.equal(dur('<div className="duration-250" />', root, "apps/web/Home.tsx").length, 0, JSON.stringify(scope));
  }
  const root = projectWith({ t: { ...team("t", []), scope: "x" } });
  assert.doesNotThrow(() => summarizeTeams(loadTeams(root)));
  const skipped = [];
  loadTeams(root, (f, why) => skipped.push([f, why]));
  assert.equal(skipped.length, 1);
});

test("the hook reads scope globs the way the validator does", () => {
  const ok = (glob, rel) => matchesScope([glob], rel);
  assert.ok(ok("apps/{payments,billing}/**", "apps/billing/a.tsx"));
  assert.ok(!ok("apps/{payments,billing}/**", "apps/growth/a.tsx"));
  assert.ok(ok("apps/[pb]ayments/**", "apps/payments/a.tsx"));
  assert.ok(ok("apps/payments", "apps/payments/a/b.tsx"), "a folder covers its contents");
  assert.ok(ok("apps/payments/", "apps/payments/a.tsx"));
  assert.ok(ok("/apps/payments/**", "apps/payments/a.tsx"));
  assert.ok(ok("apps\\payments\\**", "apps/payments/a.tsx"));
  assert.ok(!ok("apps/payments", "apps/paymentsx/a.tsx"));
  assert.ok(!ok("apps/@(payments|growth)/**", "apps/payments/a.tsx"), "extglob matches nothing");
});

test("a folder that starts with two dots is inside the project", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)], ["**"]) });
  assert.equal(paramsFor(loadTeams(root), root, join(root, "..cache", "a.tsx")).get("DS-ANIMATION-001", "max_duration_ms"), 200);
  assert.equal(paramsFor(loadTeams(root), root, join(root, "..", "a.tsx")).get("DS-ANIMATION-001", "max_duration_ms"), 300);
});

test("detect.mjs --root resolves a relative file path from the current folder", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)], ["apps/payments/**"]) });
  mkdirSync(join(root, "apps", "payments"), { recursive: true });
  writeFileSync(join(root, "apps", "payments", "Pay.tsx"), '<div className="duration-250" />\n');
  // Only the team-tunable rule: DS-MOTION-001 also flags duration-250 and is not what this test checks.
  const run = (cwd, rootArg, file) => JSON.parse(spawnSync(process.execPath, [join(HERE, "detect.mjs"), "--root", rootArg, file], { cwd, encoding: "utf8" }).stdout).filter((f) => f.ruleId === "DS-ANIMATION-001");
  const parent = join(root, "..");
  const name = root.slice(parent.length + 1);
  assert.equal(run(parent, name, `${name}/apps/payments/Pay.tsx`).length, 1);
  assert.equal(run(root, ".", "apps/payments/Pay.tsx").length, 1);
});

test("a > inside an attribute does not hide a raw button or clickable div", () => {
  const f = (src) => detectFile("a.tsx", src).map((x) => x.ruleId);
  assert.ok(f('<button disabled={count >= 3} className="focus-visible:ring-2">x</button>').includes("LOOKALIKE-001"));
  assert.ok(f('<div className={a > b ? "x" : "y"} onClick={go}>x</div>').includes("LOOKALIKE-005"));
  assert.ok(f('<div onClick={() => go()} className="a">x</div>').includes("LOOKALIKE-005"));
  assert.ok(!f('<div role="button" onClick={go}>x</div>').includes("LOOKALIKE-005"));
  const start = Date.now();
  f("<div ".repeat(4000) + "onClick={x}");
  assert.ok(Date.now() - start < 2000, "an unterminated tag flood stays fast");
});

test("LOOKALIKE-011 ignores hyphenated attributes that end in title", () => {
  const f = (src) => detectFile("a.tsx", src).map((x) => x.ruleId);
  assert.ok(!f('<div data-title="Revenue">x</div>').includes("LOOKALIKE-011"));
  assert.ok(!f('<span sub-title="x">x</span>').includes("LOOKALIKE-011"));
  assert.ok(f('<span title="Revenue">x</span>').includes("LOOKALIKE-011"));
});

test("LOOKALIKE-009 flags the browser dialogs, not functions the file declares or comments", () => {
  const f = (src) => detectFile("a.tsx", src).some((x) => x.ruleId === "LOOKALIKE-009");
  assert.equal(f("const confirm = useConfirm(); await confirm({ title: 'Delete?' })"), false);
  assert.equal(f("function alert(msg) { show(msg) }\nalert('x')"), false);
  assert.equal(f("const api = {\n  confirm(id) { return id }\n}"), false);
  assert.equal(f("// never call alert() here"), false);
  assert.equal(f("const { confirm } = useDialogs()\nconfirm('x')"), false);
  assert.equal(f("if (!confirm('Delete?')) return"), true);
  assert.equal(f("const confirm = useConfirm()\nwindow.confirm('x')"), true);
  assert.equal(f("alert('Saved')"), true);
  assert.equal(f("<p>Please confirm (this cannot be undone)</p>"), false);
  assert.equal(f("const ok = confirm('x')"), true);
  assert.equal(f("if (ready) return confirm('x')"), true);
  assert.equal(f("else window.confirm('x')"), true);
});

test("LOOKALIKE-007 skips exact busy flags only, and reads 3_000 and 3 * 1000", () => {
  const f = (src) => detectFile("a.tsx", src).some((x) => x.ruleId === "LOOKALIKE-007");
  assert.equal(f("setTimeout(() => setUploadSuccess(false), 3000)"), true);
  assert.equal(f("setTimeout(() => setSubmitSuccess(false), 3000)"), true);
  assert.equal(f("setTimeout(() => setShown(false), 3_000)"), true);
  assert.equal(f("setTimeout(() => setShown(false), 3 * 1000)"), true);
  assert.equal(f("setTimeout(() => setShown(false), 1 * 500)"), false);
  assert.equal(f("setTimeout(() => setIsLoading(false), 3000)"), false);
  assert.equal(f("setTimeout(() => setSubmitting(false), 3000)"), false);
});

test("component imports from any path count, so Spinner and Tooltip are not flagged", () => {
  const ids = (src) => detectFile("a.tsx", src).map((x) => x.ruleId);
  assert.ok(!ids('import { Spinner } from "./ui/spinner"\n<Loader className="animate-spin" />').includes("LOOKALIKE-002"));
  assert.ok(!ids('import { Spinner } from "@workspace/ui/components/spinner"\n<i className="animate-spin" />').includes("LOOKALIKE-002"));
  assert.ok(ids('<i className="animate-spin" />').includes("LOOKALIKE-002"));
  assert.ok(!ids('import { Tooltip } from "../../ui/tooltip"\n<span title="x">a</span>').includes("LOOKALIKE-011"));
});

test("duration messages credit the right limit, and seconds are checked against the ceiling", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)]) });
  const msgs = (src) => dur(src, root).map((x) => x.message);
  assert.doesNotMatch(msgs('<div className="duration-600" />')[0], /set by the t team/);
  assert.match(msgs('<div className="duration-250" />')[0], /set by the t team/);
  assert.match(msgs(".a { transition-duration: 0.6s }")[0], /exceeds the 500ms ceiling/);
  assert.match(msgs('<div className="duration-[0.6s]" />')[0], /exceeds the 500ms ceiling/);
  assert.equal(msgs('<div className="duration-[0.1s]" />').length, 0);
});

test("DS-ANIMATION-008 catches an arbitrary active scale", () => {
  const f = (src) => detectFile("a.tsx", src).filter((x) => x.ruleId === "DS-ANIMATION-008");
  assert.equal(f('<div className="active:scale-[0.9]" />').length, 1);
  assert.equal(f('<div className="active:scale-[0.97]" />').length, 0);
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-008", "min_press_scale", 0.97)]) });
  assert.equal(has(findingsIn(root, "a.tsx", '<div className="active:scale-[0.96]" />'), "DS-ANIMATION-008").length, 1);
});

test("status lists added rules and skipped files", () => {
  const lines = summarizeTeams([team("t", [{ id: "t-001", op: "add", reason: "x", text: "y" }])]).join("\n");
  assert.match(lines, /added rule, not checked by the hook: t-001/);
});

test("LOOKALIKE-010 flags a role=alert box in any status palette color", () => {
  const f = (src) => detectFile("a.tsx", src).some((x) => x.ruleId === "LOOKALIKE-010");
  assert.equal(f('<div role="alert" className="border border-amber-300 bg-amber-50">x</div>'), true);
  assert.equal(f('<div role="alert" className="p-4">x</div>'), false);
});

test("LOOKALIKE-009 in a file with no semicolons, with props, keys and URLs", () => {
  const f = (src) => detectFile("a.tsx", src).some((x) => x.ruleId === "LOOKALIKE-009");
  assert.equal(f('import React from "react"\nimport { Foo } from "./foo"\nif (confirm("Delete?")) del()'), true);
  assert.equal(f('import { confirm } from "./dialogs"\nif (confirm("Delete?")) del()'), false);
  assert.equal(f('import confirm from "./confirm"\nconfirm("x")'), false);
  assert.equal(f('const opts = { confirm: "Yes" }; if (confirm("Delete?")) del();'), true);
  assert.equal(f('<Dialog alert="x" />; function f(){ alert("boom") }'), true);
  assert.equal(f('interface P {\n confirm: boolean;\n}\nconfirm("x")'), true);
  assert.equal(f('<a href="https://x.com" onClick={() => alert("hi")}>x</a>'), true);
});

test("tags with an apostrophe in a comment or regex, or an escaped backslash, still close", () => {
  const f = (src) => detectFile("a.tsx", src).map((x) => x.ruleId);
  assert.ok(f("<div onClick={() => { /* don't */ go() }}>x</div>").includes("LOOKALIKE-005"));
  assert.ok(f('<div onClick={() => s.replace(/\'/g, "")} title="x">a</div>').includes("LOOKALIKE-011"));
  assert.ok(f('<div onClick={() => f("\\\\")} >a</div>').includes("LOOKALIKE-005"));
  assert.ok(f('<div title="C:\\" onClick={go}>a</div>').includes("LOOKALIKE-005"));
  assert.ok(f("<div onClick={() => { // it's here\n go() }}>x</div>").includes("LOOKALIKE-005"));
});

test("a team value equal to the base credits no team, and a team ceiling below the standard is credited", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-SPACING-001", "spacing_divisors", [4])]) });
  const msgs = findingsIn(root, "a.tsx", '<div className="p-[6px]" />').map((x) => x.message).join(" ");
  assert.doesNotMatch(msgs, /set by the t team/);
  assert.match(summarizeTeams(loadTeams(root)).join("\n"), /no change from the base/);
  const root2 = projectWith({ t: team("t", [restrictOverride(1, "DS-ANIMATION-002", "max_duration_ms", 250)]) });
  assert.match(has(findingsIn(root2, "a.tsx", '<div className="duration-[400ms]" />'), "DS-ANIMATION-001")[0].message, /set by the t team/);
  assert.equal(matchesScope([" "], "a.tsx"), false);
});

test("cssBlocks finds the same blocks as the regex it replaced", async () => {
  const { cssBlocks } = await import("./registry.mjs");
  const old = (content) => {
    const re = /([^{}]*)\{([^{}]*)\}/g;
    const out = [];
    let m;
    while ((m = re.exec(content)) !== null) out.push({ selector: m[1], body: m[2], index: m.index + m[1].length });
    return out;
  };
  const alphabet = ["a", " ", "\n", "{", "}", "{", "}", "x:1;"];
  let seed = 12345;
  const rand = (n) => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;
  for (let k = 0; k < 3000; k++) {
    let s = "";
    for (let n = rand(14); n > 0; n--) s += alphabet[rand(alphabet.length)];
    assert.deepEqual(cssBlocks(s), old(s), JSON.stringify(s));
  }
});

test("DS-TABLE-001 stays fast on a large file with no braces", () => {
  const text = "plain text with no braces at all ".repeat(5000);
  const start = Date.now();
  detectFile("a.tsx", text);
  detectFile("a.css", text);
  assert.ok(Date.now() - start < 2000, `took ${Date.now() - start}ms`);
});

// DS-MOTION-001: literal timing and curves belong in motion tokens.
const motionHits = (src, file = "src/components/Card.tsx") => detectFile(file, src).filter((f) => f.ruleId === "DS-MOTION-001");

test("DS-MOTION-001 flags literal timing and curves in each spelling", () => {
  assert.equal(motionHits('<div className="duration-[150ms]" />').length, 1);
  assert.equal(motionHits('<div className="duration-200" />').length, 1);
  assert.equal(motionHits('<div className="motion-reduce:duration-300" />').length, 1);
  assert.equal(motionHits('<div className="animate-[spin_1s_linear_infinite]" />').length, 1);
  assert.equal(motionHits('<div className="delay-200" />').length, 1);
  assert.equal(motionHits('<div className="ease-[cubic-bezier(0.2,0,0,1)]" />').length, 1);
  assert.equal(motionHits(".a { transition-duration: 150ms; }", "a.css").length, 1);
  assert.equal(motionHits(".a { transition: opacity 150ms ease; }", "a.css").length, 1);
  assert.equal(motionHits(".a { animation: spin 1s linear infinite; }", "a.css").length, 1);
  assert.equal(motionHits('const s = stylex.create({ a: { transitionDuration: "150ms" } });').length, 1);
  assert.equal(motionHits("<motion.div transition={{ duration: 0.2 }} />").length, 1);
  assert.equal(motionHits("<motion.div transition={{ duration: 1e-1 }} />").length, 1);
  assert.equal(motionHits("<motion.div transition={{ delay: 0.3 }} />").length, 1);
  assert.equal(motionHits("<motion.div transition={{ ease: [0.2, 0, 0, 1] }} />").length, 1);
  assert.equal(motionHits(".a { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }", "a.css").length, 1);
});

test("DS-MOTION-001 checks every time value in a declaration, including multi-line ones", () => {
  // Second and later values, and values on continuation lines, must be reported.
  assert.equal(motionHits(".a { transition: opacity 0s, transform 200ms; }", "a.css").length, 1);
  assert.equal(motionHits(".a {\n  transition:\n    opacity 150ms,\n    transform 200ms;\n}", "a.css").length, 2);
  assert.equal(motionHits(".a { transition: opacity var(--motion-duration-fast), transform 200ms; }", "a.css").length, 1);
  assert.equal(motionHits(".a { animation: spin 0s linear, fade 300ms; }", "a.css").length, 1);
});

test("DS-MOTION-001 passes token references, zero, and the reduced-motion 0.01ms value", () => {
  assert.equal(motionHits('<div className="duration-[var(--motion-duration-fast)]" />').length, 0);
  assert.equal(motionHits('<div className="ease-[var(--motion-ease-standard)]" />').length, 0);
  assert.equal(motionHits('<div className="duration-0" />').length, 0);
  assert.equal(motionHits(".a { transition-duration: 0.01ms !important; }", "a.css").length, 0);
  assert.equal(motionHits('<div className="duration-[0.01ms]" />').length, 0);
  assert.equal(motionHits('const s = stylex.create({ a: { transitionDuration: "0.01ms" } });').length, 0);
  assert.equal(motionHits("<motion.div transition={{ duration: 0 }} />").length, 0);
  assert.equal(motionHits("<motion.div transition={{ duration: 0.00001 }} />").length, 0, "0.00001s is 0.01ms");
  assert.equal(motionHits("<motion.div transition={{ duration: motionDuration.fast }} />").length, 0);
  assert.equal(motionHits(".a { transition: none; }", "a.css").length, 0);
  assert.equal(motionHits(".a { transition: opacity var(--motion-duration-fast) ease; }", "a.css").length, 0);
  // Guard from the other side: a sub-millisecond literal near the sentinel is still a literal.
  assert.equal(motionHits(".a { transition-duration: 0.5ms; }", "a.css").length, 1);
});

test("DS-MOTION-001 only reads motion keys in a motion context", () => {
  // Non-motion objects with a duration key are not motion literals.
  assert.equal(motionHits("toast({ title: 'Saved', duration: 3000 });").length, 0);
  assert.equal(motionHits("const meta = { duration: 212 };").length, 0);
  assert.equal(motionHits("const x = { totalduration: 5 };").length, 0);
  assert.equal(motionHits("<motion.div transition={{ totalduration: 5 }} />").length, 0);
});

test("DS-MOTION-001 lookbehinds keep token references and longer names from matching", () => {
  // 300ms inside a token name and a hyphenated property name are not time values.
  assert.equal(motionHits(".a { transition: opacity var(--motion-ease-300ms) ease; }", "a.css").length, 0);
  assert.equal(motionHits(".a { custom-transition: 300ms; }", "a.css").length, 0);
  assert.equal(motionHits(".a { animation-name: fade-150ms; }", "a.css").length, 0);
  // 1500ms is one number, reported once with its full value.
  const hits = motionHits(".a { transition-duration: 1500ms; }", "a.css");
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /1500ms/);
});

test("DS-MOTION-001 defines literal motion tokens only in the token file", () => {
  assert.equal(motionHits(":root { --motion-duration-fast: 150ms; }", "src/theme.css").length, 1);
  assert.equal(motionHits("$motion-transition: 150ms;", "src/_vars.scss").length, 1);
  assert.equal(motionHits(":root { --motion-duration-fast: var(--base-fast); }", "src/theme.css").length, 0);
  // The token file may define values.
  assert.equal(motionHits(":root { --motion-duration-fast: 150ms; --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1); }", "src/motion-tokens.css").length, 0);
  assert.equal(motionHits("export const motionDuration = { fast: 0.15 };\nexport const motionEase = { standard: [0.2, 0, 0, 1] };", "src/motion-tokens.ts").length, 0);
});

test("DS-MOTION-001 exempts only the token file's definitions, by exact basename", () => {
  // Usage in the token file is still checked.
  assert.equal(motionHits(".btn { transition: color 150ms; }", "src/styles/motion-tokens.css").length, 1);
  // A component with a transition prop is not a token file, even under the token basename.
  assert.equal(motionHits('<motion.div transition={{ duration: 0.2 }} />', "src/components/motion-tokens.ts").length, 1);
  assert.equal(motionHits('<motion.div transition={{ duration: 0.2 }} />', "src/components/motion-tokens.tsx").length, 1);
  // Look-alike names are checked like any other file.
  assert.equal(motionHits(":root { --motion-duration-fast: 150ms; }", "src/tokens.css").length, 1);
  assert.equal(motionHits(":root { --motion-duration-fast: 150ms; }", "src/my-motion-tokens.css").length, 1);
  assert.equal(motionHits('<motion.div transition={{ duration: 0.2 }} />', "src/my-motion-tokens.ts").length, 1);
  // Windows and root-relative paths resolve to the same basename.
  assert.equal(motionHits(":root { --motion-duration-fast: 150ms; }", "C:\\proj\\styles\\motion-tokens.css").length, 0);
  assert.equal(motionHits(":root { --motion-duration-fast: 150ms; }", "./motion-tokens.scss").length, 0);
});

test("DS-MOTION-001 stays fast on large and adversarial input", () => {
  const digits = "<motion.div transition={{ duration: " + "1".repeat(40000);
  const start = Date.now();
  motionHits(digits, "big.tsx");
  assert.ok(Date.now() - start < 2000, "a long digit run stays fast");
  const declarations = "transition: opacity ".repeat(20000);
  const start2 = Date.now();
  motionHits(declarations, "big.css");
  assert.ok(Date.now() - start2 < 2000, "a long brace-free declaration flood stays fast");
});

test("DS-MOTION-001 does not read cubic-bezier code generation as a literal curve", () => {
  // The mapper builds a curve from a value at runtime. No numbers are written in the source.
  assert.equal(motionHits("const css = `cubic-bezier(${rawValue})`;", "src/mapper.ts").length, 0);
  assert.equal(motionHits('const css = "cubic-bezier(" + rawValue + ")";', "src/mapper.ts").length, 0);
  assert.equal(motionHits("const css = 'cubic-bezier(0.2, 0, 0, 1)';", "src/mapper.ts").length, 1);
});

test("DS-MOTION-001 checks long multi-line declarations and every curve on a line", () => {
  // Eight properties, each with a time and a curve, well past 240 characters.
  const long = ".btn {\n  transition:\n" + Array.from({ length: 8 }, (_, i) => `    prop${i} 150ms cubic-bezier(0.2, 0, 0, 1)`).join(",\n") + ";\n}";
  assert.equal(motionHits(long, "a.css").length, 16);
  // Two literal curves on one line are two findings.
  assert.equal(motionHits(".a{transition:opacity .2s cubic-bezier(0.2,0,0,1)} .b{transition:transform .2s cubic-bezier(0.3,0,0,1)}", "a.css").length, 4);
});

test("DS-MOTION-001 reads the spellings that slipped past the first version", () => {
  assert.equal(motionHits(".a { transition : opacity 150ms; }", "a.css").length, 1, "space before the colon");
  assert.equal(motionHits(".a { transition-duration: 1e3ms; }", "a.css").length, 1, "exponent");
  assert.equal(motionHits(".a { transition-duration: 150MS; }", "a.css").length, 1, "uppercase unit");
  assert.equal(motionHits('<div className="[transition:opacity_150ms]" />').length, 1, "underscores in an arbitrary property");
  assert.equal(motionHits('<div className="animate-[fade_1s_var(--ease-standard)]" />').length, 1, "var() beside a literal");
  assert.equal(motionHits('<div className="animate-[var(--motion-animate-fade)]" />').length, 0, "a whole-token reference");
  assert.equal(motionHits('const s = { animationDuration: "1s" };').length, 1, "animationDuration string");
  assert.equal(motionHits('const s = { animationDelay: "200ms" };').length, 1, "animationDelay string");
});

test("DS-MOTION-001 flags time and curve definitions outside the token file under any name", () => {
  assert.equal(motionHits(":root { --dur-fast: 150ms; }", "src/theme.css").length, 1, "a custom property with any name");
  assert.equal(motionHits(":root { --motion-duration-fast: calc(150ms * 2); }", "src/theme.css").length, 1, "a calc() literal");
  assert.equal(motionHits("$fast: 150ms;", "src/_vars.scss").length, 1, "a SCSS variable with any name");
  assert.equal(motionHits('<div style={{ "--motion-duration-fast": "150ms" }} />').length, 1, "an inline style definition");
  assert.equal(motionHits('el.style.setProperty("--motion-duration-fast", "150ms");').length, 1, "a runtime definition");
  // A custom property that is not a time or curve is not a motion definition.
  assert.equal(motionHits(":root { --gap-4: 16px; }", "src/theme.css").length, 0);
});

test("DS-MOTION-001 exempts a leading-underscore SCSS partial, and nothing else", () => {
  assert.equal(motionHits("$motion-fast: 150ms;", "src/styles/_motion-tokens.scss").length, 0);
  assert.equal(motionHits("$motion-fast: 150ms;", "src/styles/my_motion-tokens.scss").length, 1);
});

test("DS-MOTION-001 reads a Motion duration only inside a transition", () => {
  assert.equal(motionHits('toast.success("Saved", { className: "transition-colors", duration: 3000 });').length, 0);
  assert.equal(motionHits("const cfg = { exitOnClick: false, duration: 3000 };").length, 0);
  assert.equal(motionHits("<motion.div transition={{ duration: 0.2 }} />").length, 1);
  assert.equal(motionHits("const v = { transition: { duration: 0.2 } };").length, 1);
});

test("DS-MOTION-001 stays fast when every line has a finding", () => {
  const lines = Array.from({ length: 5000 }, () => ".a{\ntransition:opacity 1ms}").join("\n");
  const start = Date.now();
  const hits = motionHits(lines, "big.css");
  assert.equal(hits.length, 5000);
  assert.ok(Date.now() - start < 2000, "a file with thousands of findings stays fast");
});

test("DS-MOTION-001 flags a time in a shorthand custom property or SCSS map outside the token file", () => {
  assert.equal(motionHits(":root { --card-transition: transform 200ms ease; }", "src/theme.css").length, 1);
  assert.equal(motionHits("$motion: (fast: 150ms, base: 200ms);", "src/_vars.scss").length, 1);
  // A curve definition is reported once, by the curve scan.
  assert.equal(motionHits(":root { --ease-standard: cubic-bezier(0.2, 0, 0, 1); }", "src/theme.css").length, 1);
  assert.equal(motionHits("$ease: cubic-bezier(0.2, 0, 0, 1);", "src/_vars.scss").length, 1);
  assert.equal(motionHits('const s = { "--ease": "cubic-bezier(0.2, 0, 0, 1)" };').length, 1);
});

test("DS-MOTION-001 reads a Motion duration in any transition shape", () => {
  assert.equal(motionHits("const transition = { duration: 0.2 };").length, 1, "a variable named transition");
  assert.equal(motionHits("<motion.div transition={{ x: { type: 'spring' }, opacity: { duration: 0.2 } }} />").length, 1, "nested per-key duration");
  assert.equal(motionHits('toast.success("Saved", { className: "transition-colors", duration: 3000 });').length, 0, "a class name is not a context");
});

test("DS-MOTION-001 reads negative times", () => {
  assert.equal(motionHits(".a { animation-delay: -0.5s; }", "a.css").length, 1);
  assert.equal(motionHits('<div className="delay-[-200ms]" />').length, 1);
  assert.equal(motionHits(".a { animation: spin 1s linear -0.5s infinite; }", "a.css").length, 2);
  // Guard from the other side: a minus inside a name is not a sign.
  assert.equal(motionHits(".a { animation-name: fade-150ms; }", "a.css").length, 0);
});

test("DS-MOTION-001 does not read prose after a comma in a code object as a time", () => {
  assert.equal(motionHits('toast({ animation: "fade", description: "Saved 2s ago" });').length, 0);
  // A code-file CSS list still reads each segment.
  assert.equal(motionHits("const css = `.a { transition: opacity 0s, transform 200ms; }`;").length, 1);
});

test("DS-MOTION-001 reads exponent notation with a sign and reports the full value", () => {
  const hits = motionHits(".a { transition-duration: 1e+3ms; }", "a.css");
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /1e\+3ms/);
});
