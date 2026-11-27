// Run with: node detect.test.mjs
// No new dependency — uses Node's built-in test runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { detectFile } from "./detect.mjs";
import { RULES } from "./registry.mjs";
import { TUNABLES, UNCHECKED_TUNABLES, loadTeams, paramsFor, matchesScope, summarizeTeams } from "./team-overrides.mjs";
import { isFileIgnored } from "./hook-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "__fixtures__");

function findingsFor(file) {
  const path = join(FIXTURES, file);
  return detectFile(path, readFileSync(path, "utf8"));
}

const badTsxFindings = findingsFor("bad.tsx");
const badCssFindings = findingsFor("bad.css");
const goodTsxFindings = findingsFor("good.tsx");

const CSS_EXT_ONLY_RULE_IDS = new Set(["DS-CSS-002", "DS-CSS-003", "DS-CSS-007"]);
const CODE_EXT_ONLY_RULE_IDS = new Set(["DS-ELEVATION-006", "DS-MODAL-005", "DS-MODAL-006", "DS-A11Y-010", "DS-A11Y-012", "DS-SPACING-001", "DS-ANIMATION-008", "DS-ICON-001", "DS-ICON-002", "DS-ICON-005", "DS-TYPOGRAPHY-009", "DS-MODAL", "DS-COLOR-002", ...RULES.filter((r) => r.id.startsWith("LOOKALIKE-")).map((r) => r.id)]);

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

test("LOOKALIKE-* rules skip registry/vois sources, which install as components/ui", () => {
  const src = '<button className="focus-visible:ring-2">x</button><div onClick={go}>y</div><Loader2 className="animate-spin" />';
  const n = (p) => detectFile(p, src).filter((f) => f.ruleId.startsWith("LOOKALIKE-")).length;
  for (const p of ["registry/vois/stepper/stepper.tsx", "./registry/vois/stepper/stepper.tsx", "/repo/registry/vois/stepper/stepper.tsx", "apps/web/src/registry/vois/stepper.tsx", "registry\\vois\\stepper\\stepper.tsx"]) {
    assert.equal(n(p), 0, p);
  }
  // Near misses still count: a different folder name, or vois without registry in front.
  for (const p of ["myregistry/vois/x.tsx", "registry/voisx/x.tsx", "vois/stepper/x.tsx", "src/registry/other/x.tsx"]) {
    assert.ok(n(p) >= 3, p);
  }
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

test("LOOKALIKE-012 flags a hand-built avatar and leaves dots, icons and Avatar users alone", () => {
  const f = (src, path = "a.tsx") => detectFile(path, src).map((x) => x.ruleId);
  // Flagged: a round box of avatar size, then an image or one or two capitals.
  assert.ok(f('<div className="size-10 rounded-full"><img src={u} alt="" /></div>').includes("LOOKALIKE-012"));
  assert.ok(f('<span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">AB</span>').includes("LOOKALIKE-012"));
  assert.ok(f('<div className="rounded-full size-12">J<b /></div>').includes("LOOKALIKE-012"), "attribute order does not matter");
  assert.ok(f('<div className={cn("size-10 rounded-full", c)}><img src={u} /></div>').includes("LOOKALIKE-012"));
  // Not flagged: the guards from the other side.
  assert.ok(!f('<span className="size-2 rounded-full bg-green-500"><img src={u} /></span>').includes("LOOKALIKE-012"), "a dot is size-2");
  assert.ok(!f('<div className="size-10 rounded-lg"><img src={u} /></div>').includes("LOOKALIKE-012"), "not round");
  assert.ok(!f('<div className="size-40 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "size-40 is a hero image");
  assert.ok(!f('<div className="size-100 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "size-100 is not size-10");
  assert.ok(!f('<div className="size-10 rounded-full"><Icon /></div>').includes("LOOKALIKE-012"), "an icon");
  assert.ok(!f('<div className="size-10 rounded-full">Alice</div>').includes("LOOKALIKE-012"), "a word");
  assert.ok(!f('<div className="rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "no size");
  assert.ok(!f('<div className="size-10 rounded-full-x"><img src={u} /></div>').includes("LOOKALIKE-012"), "rounded-full-x is another class");
  assert.ok(!f('<div className="md:size-10 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "a responsive size is read as no size");
  assert.ok(!f('import { Avatar } from "@/components/ui/avatar"\n<div className="size-10 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "Avatar imported");
  assert.ok(!f('<div className="size-10 rounded-full"><img src={u} /></div>', "src/components/ui/avatar.tsx").includes("LOOKALIKE-012"), "a ui primitive");
  assert.ok(f('<div className="size-10 rounded-full"><img src={u} /></div>', "src/screens/team.tsx").includes("LOOKALIKE-012"));
  // Review findings: a self-closing box has no children, so the next sibling is not its content.
  assert.ok(!f('<div className="size-10 rounded-full bg-muted" /><img src={u} alt="" />').includes("LOOKALIKE-012"), "self-closing");
  assert.ok(!f('<span className="size-6 rounded-full" />AB<b/>').includes("LOOKALIKE-012"), "self-closing span");
  // A variant prefix on rounded-full does not make the box round at rest.
  assert.ok(!f('<div className="size-10 hover:rounded-full"><img src={u}/></div>').includes("LOOKALIKE-012"), "hover:rounded-full");
  assert.ok(!f('<div className="size-10 md:rounded-full"><img src={u}/></div>').includes("LOOKALIKE-012"), "md:rounded-full");
  // Vois-native spellings and a Next Image are read too.
  assert.ok(f('<div className="size-[var(--size-avatar-medium)] rounded-[var(--shape-circle)]"><img src={u} /></div>').includes("LOOKALIKE-012"), "tokens");
  assert.ok(f('<div className="size-10 rounded-full"><Image src={u} alt="" /></div>').includes("LOOKALIKE-012"), "Next Image");
  // The file that defines an avatar, and other ways of importing one, are left alone.
  assert.ok(!f('<div className="size-10 rounded-full"><img src={u} /></div>', "src/components/avatar.tsx").includes("LOOKALIKE-012"), "avatar.tsx");
  assert.ok(!f('<div className="size-10 rounded-full"><img src={u} /></div>', "src/components/user-avatar.tsx").includes("LOOKALIKE-012"), "user-avatar.tsx");
  assert.ok(!f('import Avatar from "@mui/material/Avatar"\n<div className="size-10 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "MUI Avatar");
  assert.ok(!f('import { Avatar } from "radix-ui"\n<div className="size-10 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "radix-ui Avatar");
  assert.ok(!f('import { UserAvatar } from "@/components/people"\n<div className="size-10 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "UserAvatar name");
  assert.ok(f('import { Badge } from "@/components/ui/badge"\n<div className="size-10 rounded-full"><img src={u} /></div>').includes("LOOKALIKE-012"), "an unrelated import");
  // Length: a tag over 3000 characters is skipped by openingTags (a documented limit), and a long one under it is read.
  assert.ok(!f(`<div className="${"x ".repeat(5000)}size-10 rounded-full"><img src={u} /></div>`).includes("LOOKALIKE-012"), "tag over 3000 characters is not read");
  assert.ok(f(`<div className="${"x ".repeat(1000)}size-10 rounded-full"><img src={u} /></div>`).includes("LOOKALIKE-012"), "a long tag under the cap is read");
});

test("DS-MODAL skips a file that imports the project's Dialog, and still flags a hand-built modal", () => {
  const ids = (src, path = "src/screens/x.tsx") => detectFile(path, src).map((f) => f.ruleId);
  const custom = "function MyDialog() { return <Dialog open>hi</Dialog> }";
  assert.ok(ids(custom).includes("DS-MODAL"), "a hand-built modal is flagged");
  assert.ok(!ids('import { Dialog } from "@/components/ui/dialog"\n' + custom).includes("DS-MODAL"), "alias import");
  assert.ok(!ids('import { Dialog } from "./dialog"\n' + custom).includes("DS-MODAL"), "relative import");
  assert.ok(!ids('import { Dialog } from "radix-ui"\n' + custom).includes("DS-MODAL"), "radix-ui import (unchanged)");
  // The review found these: capital letters, extensions and index files count.
  assert.ok(!ids('import { Dialog } from "@/components/Dialog"\n' + custom).includes("DS-MODAL"), "capital D path");
  assert.ok(!ids('import { Dialog } from "./dialog.tsx"\n' + custom).includes("DS-MODAL"), "extension");
  assert.ok(!ids('import { DialogContent } from "./dialog/index"\n' + custom).includes("DS-MODAL"), "index file");
  assert.ok(!ids('import Dialog from "./dialog"\n' + custom).includes("DS-MODAL"), "default import");
  assert.ok(!ids('import {\n  Dialog,\n  DialogContent,\n} from "@/components/ui/dialog"\n' + custom).includes("DS-MODAL"), "multi-line import");
  // Other imports and look-alike paths do not count.
  assert.ok(ids('import { Dialog } from "@/components/ui/dialogs-old"\n' + custom).includes("DS-MODAL"), "dialogs-old is not dialog");
  assert.ok(ids('import { Button } from "@/components/ui/button"\n' + custom).includes("DS-MODAL"), "an unrelated import");
  assert.ok(ids('import { openDialog } from "@/lib/dialog"\n' + custom).includes("DS-MODAL"), "a dialog helper is not the Dialog component");
  assert.ok(ids('import { show } from "../utils/dialog"\n' + custom).includes("DS-MODAL"), "a utility in a dialog module");
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

// --- DS-ANIMATION-005: the start floor ---

const startHits = (src, file = "src/Card.tsx", params) => detectFile(file, src, params ? { params } : {}).filter((f) => f.ruleId === "DS-ANIMATION-005");
const teamParams = (overrides, rel = "a.tsx") => { const root = projectWith({ t: team("t", overrides) }); return paramsFor(loadTeams(root), root, join(root, rel)); };

test("DS-ANIMATION-005 still blocks scale(0) and only scale(0)", () => {
  const zero = startHits('<motion.div initial={{ scale: 0 }} />');
  assert.equal(zero.length, 1, "scale: 0 is one finding, not two");
  assert.equal(zero[0].severity, "slop");
  const low = startHits('<motion.div initial={{ scale: 0.5 }} />');
  assert.equal(low.length, 1);
  assert.equal(low[0].severity, "quality", "a start below the floor is never blocked");
  assert.match(low[0].message, /0\.5, below the 0\.9 floor/);
});

test("DS-ANIMATION-005 does not block a name that ends in scale", () => {
  for (const src of ["const o = { xscale: 0 };", "rescale(0);", "d3.scale(0);", "const s = $scale(0);", ".a { --icon-scale: 0; }", "const a = { y_scale: 0 };"]) {
    assert.deepEqual(startHits(src).filter((f) => f.severity === "slop"), [], src);
  }
  // From the other side: scale itself still blocks, wherever it starts.
  for (const src of ["<motion.div initial={{scale:0}} />", ".a { transform: scale(0); }", ".a { transform:scale(0) }", ".a { scale: 0; }", "animate({ scale: 0 })", "const k = 'scale(0)';"]) {
    assert.equal(startHits(src, src.startsWith(".") ? "a.css" : "src/Card.tsx").filter((f) => f.severity === "slop").length, 1, src);
  }
});

test("DS-ANIMATION-005 reads the start of an enter animation in each spelling", () => {
  assert.equal(startHits('<div className="starting:scale-50" />').length, 1);
  assert.equal(startHits('<div className="data-[open]:starting:scale-[0.5]" />').length, 1);
  assert.equal(startHits('<div className="animate-in zoom-in-50" />').length, 1);
  assert.equal(startHits('<div className="md:zoom-in-75" />').length, 1);
  assert.equal(startHits("@keyframes pop { from { transform: scale(0.5); } to { transform: scale(1); } }", "a.css").length, 1);
  assert.equal(startHits("@keyframes pop { 0% { scale: 0.5; } 100% { scale: 1; } }", "a.css").length, 1);
  assert.equal(startHits("const v = { hidden: { scale: 0.5 }, visible: { scale: 1 } };", "a.ts").length, 1);
});

test("DS-ANIMATION-005 leaves alone what is at or above the floor, or is not a start", () => {
  assert.equal(startHits('<motion.div initial={{ scale: 0.9 }} />').length, 0, "the floor itself is fine");
  assert.equal(startHits('<div className="animate-in zoom-in-95 starting:scale-95" />').length, 0);
  assert.equal(startHits('<motion.div initial={{ opacity: 0 }} animate={{ scale: 0.5 }} exit={{ scale: 0.5 }} />').length, 0, "animate and exit are not the start");
  assert.equal(startHits('<motion.div initial={{ y: 8 }} animate={{ scale: 0.5 }} />').length, 0, "a scale in a later prop is not the start");
  assert.equal(startHits("@keyframes pop { from { opacity: 0; } to { transform: scale(0.5); } }", "a.css").length, 0);
  assert.equal(startHits("const v = { hidden: { opacity: 0 }, visible: { scale: 0.5 } };", "a.ts").length, 0);
  assert.equal(startHits('<div className="zoom-in-950 myzoom-in-50" />').length, 0, "no match inside a longer name");
});

test("DS-ANIMATION-005 uses a team's higher floor and names the team", () => {
  const params = teamParams([restrictOverride(1, "DS-ANIMATION-005", "min_start_scale", 0.95)]);
  const hits = startHits('<motion.div initial={{ scale: 0.92 }} />', "a.tsx", params);
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /below the 0\.95 floor/);
  assert.match(hits[0].message, /limit set by the t team/);
  assert.equal(startHits('<motion.div initial={{ scale: 0.95 }} />', "a.tsx", params).length, 0);
  const lower = teamParams([restrictOverride(1, "DS-ANIMATION-005", "min_start_scale", 0.8)]);
  assert.equal(startHits('<motion.div initial={{ scale: 0.85 }} />', "a.tsx", lower).length, 1, "a looser floor is ignored");
});

test("a quality finding on DS-ANIMATION-005 never makes the before-edit hook deny", () => {
  const root = projectWith({});
  const run = (content) => spawnSync(process.execPath, [join(HERE, "hook-before-edit.mjs")], { input: JSON.stringify({ tool_name: "Write", cwd: root, tool_input: { file_path: join(root, "Card.tsx"), content } }), encoding: "utf8" });
  assert.equal(run('<motion.div initial={{ scale: 0 }} />').status, 2, "scale(0) is denied");
  assert.equal(run('<motion.div initial={{ scale: 0.5 }} />').status, 0, "a low start is only a nudge");
});

// --- DS-CSS-003: selector nesting ---

const nestHits = (src, file = "a.scss", params) => detectFile(file, src, params ? { params } : {}).filter((f) => f.ruleId === "DS-CSS-003");

test("DS-CSS-003 flags the third level of nesting, not the second", () => {
  assert.equal(nestHits(".a { .b { color: red; } }").length, 0);
  const deep = nestHits(".a {\n  .b {\n    .c { color: red; }\n  }\n}\n");
  assert.equal(deep.length, 1);
  assert.equal(deep[0].line, 3);
  assert.match(deep[0].message, /nested 3 levels deep, past the 2 allowed/);
  assert.equal(nestHits(".a { .b { .c { .d { x: y; } } } }").length, 2, "each level past the limit is reported");
  assert.equal(nestHits(".a, .b { &:hover { .c { x: y; } } }").length, 1);
});

test("DS-CSS-003 does not count wrappers, keyframes or property blocks", () => {
  assert.equal(nestHits("@media (min-width: 40em) { .a { .b { x: y; } } }").length, 0, "@media adds no level");
  assert.equal(nestHits("@media (min-width: 40em) { .a { .b { .c { x: y; } } } }").length, 1);
  assert.equal(nestHits("@supports (display: grid) { @layer base { .a { .b { x: y; } } } }").length, 0);
  assert.equal(nestHits("@keyframes k { from { x: y; } 50% { x: y; } to { x: y; } }").length, 0);
  assert.equal(nestHits(".a { .b { font: { family: x; size: 1em; } } }").length, 0, "SCSS property nesting is not a selector");
  assert.equal(nestHits(".a { @media (min-width: 40em) { .b { x: y; } } }").length, 0);
});

test("DS-CSS-003 is not fooled by braces in comments, strings or interpolation", () => {
  assert.equal(nestHits('.a { content: "{ { {"; .b { x: y; } }').length, 0);
  assert.equal(nestHits("/* .x { .y { .z { */ .a { .b { x: y; } }").length, 0);
  assert.equal(nestHits(".a { // .x { .y {\n .b { x: y; } }").length, 0);
  assert.equal(nestHits(".a-#{$i} { .b-#{$j} { x: y; } }").length, 0);
  assert.equal(nestHits(".a { background: url(http://x.test/a.png); .b { x: y; } }").length, 0, "// inside a URL is not a comment");
  assert.doesNotThrow(() => nestHits(".a { .b { "), "an unclosed block does not throw");
  assert.doesNotThrow(() => nestHits("}}}} .a { x: y; }"));
  assert.equal(nestHits(".a { .b { .c { x: y; } } }", "a.css").length, 1, "plain CSS nesting counts too");
});

test("DS-CSS-003 uses a team's lower limit and names the team", () => {
  const params = teamParams([restrictOverride(1, "DS-CSS-003", "max_selector_nesting", 1)], "a.scss");
  const hits = nestHits(".a { .b { x: y; } }", "a.scss", params);
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /past the 1 allowed/);
  assert.match(hits[0].message, /limit set by the t team/);
  const looser = teamParams([restrictOverride(1, "DS-CSS-003", "max_selector_nesting", 5)], "a.scss");
  assert.equal(nestHits(".a { .b { .c { x: y; } } }", "a.scss", looser).length, 1, "a higher limit is ignored");
});

test("DS-CSS-003 stays quick on a very long file", () => {
  const src = Array.from({ length: 20000 }, (_, i) => `.r${i} { .c { x: y; } }`).join("\n");
  const t = Date.now();
  assert.equal(nestHits(src).length, 0);
  assert.ok(Date.now() - t < 2000, "a long file is read in linear time");
});

// --- DS-ICON-001 and DS-ICON-002: icons ---

const iconHits = (id, src, params) => detectFile("src/Icons.tsx", src, params ? { params } : {}).filter((f) => f.ruleId === id);
const LUCIDE = 'import { Check, X as CloseIcon } from "lucide-react";\n';

test("DS-ICON-001 flags a stroke width that is not the set's, in each spelling", () => {
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={3} />").length, 1);
  assert.equal(iconHits("DS-ICON-001", LUCIDE + '<Check strokeWidth="2" />').length, 1);
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<CloseIcon className='x' strokeWidth={ 1 } />").length, 1, "an alias is found by its local name");
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={3} />")[0].line, 2);
  assert.match(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={3} />")[0].message, /strokeWidth 3, not the set's 1\.5/);
});

test("DS-ICON-001 leaves alone the set's width, icons without the prop, and things that are not lucide icons", () => {
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={1.5} /><Check strokeWidth=\"1.50\" /><Check />").length, 0);
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<svg strokeWidth={3} /><Chart strokeWidth={3} />").length, 0, "only lucide icons are read");
  assert.equal(iconHits("DS-ICON-001", "<Check strokeWidth={3} />").length, 0, "no lucide import, no finding");
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check data-strokeWidth={3} />").length, 0);
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={compact ? 1 : 2} />").length, 0, "a computed width is not read");
  assert.equal(iconHits("DS-ICON-001", 'import { Check } from "other-icons";\n<Check strokeWidth={3} />').length, 0);
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={count > 2 ? 1.5 : 1.5} />").length, 0, "a > inside the tag does not end it early");
});

test("DS-ICON-001 uses the width a team chose, and ignores one outside the range", () => {
  const params = teamParams([{ id: "x-001", op: "refine", rule: "DS-ICON-001", param: "stroke_width_px", value: 2, reason: "Heavier icons suit this product." }]);
  const hits = iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={1.5} /><Check strokeWidth={2} />", params);
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /strokeWidth 1\.5, not the set's 2/);
  assert.match(hits[0].message, /limit set by the t team/);
  const outside = teamParams([{ id: "x-001", op: "refine", rule: "DS-ICON-001", param: "stroke_width_px", value: 3, reason: "Too heavy for the range." }]);
  assert.equal(iconHits("DS-ICON-001", LUCIDE + "<Check strokeWidth={1.5} />", outside).length, 0, "a value outside 1 to 2 is ignored");
});

test("DS-ICON-001: two teams that choose different widths do not flip with the order they are read", () => {
  const refine = (v) => ({ id: "x-001", op: "refine", rule: "DS-ICON-001", param: "stroke_width_px", value: v, reason: "Our choice." });
  const root = projectWith({ a: team("a", [refine(1)]), b: team("b", [refine(2)]) });
  const p = paramsFor(loadTeams(root), root, join(root, "a.tsx"));
  assert.equal(p.get("DS-ICON-001", "stroke_width_px"), 1);
  assert.equal(p.source("DS-ICON-001", "stroke_width_px"), "a", "the first team file keeps it");
});

test("DS-ICON-002 flags a size that is not 16, 20, 24 or 32, in each spelling", () => {
  assert.equal(iconHits("DS-ICON-002", LUCIDE + "<Check size={18} />").length, 1);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check size="18" />').length, 1);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + "<Check width={14} height={14} />").length, 1, "width and height on one icon are one finding");
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="size-3" />').length, 1);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="h-3.5 w-3.5" />').length, 1);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="size-[18px]" />').length, 1);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="size-5 md:size-7" />').length, 1, "a variant is read like the plain class");
  assert.match(iconHits("DS-ICON-002", LUCIDE + "<Check size={18} />")[0].message, /18px, not one of 16\/20\/24\/32px/);
});

test("DS-ICON-002 leaves alone the defined sizes and anything that is not a sized lucide icon", () => {
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check size={16} /><Check size={20} /><Check size={24} /><Check size={32} />').length, 0);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="size-4 size-5 size-6 size-8" /><Check className="h-5 w-5" /><Check className="size-[20px]" />').length, 0);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="w-full h-auto size-full h-px min-w-3 max-h-3" />').length, 0, "non-numeric and min/max classes are not sizes");
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<div className="size-3" /><Avatar size={18} />').length, 0, "only lucide icons are read");
  assert.equal(iconHits("DS-ICON-002", "<Check size={18} />").length, 0, "no lucide import, no finding");
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="size-3" />\n<Check size={20} />').length, 1, "one bad icon among good ones");
});

test("DS-ICON-002 uses a team's smaller set and ignores one with a size outside the four", () => {
  const params = teamParams([{ id: "x-001", op: "restrict", rule: "DS-ICON-002", param: "icon_sizes_px", value: [16, 24], reason: "We use two sizes." }]);
  const hits = iconHits("DS-ICON-002", LUCIDE + "<Check size={20} /><Check size={24} />", params);
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /20px, not one of 16\/24px/);
  assert.match(hits[0].message, /limit set by the t team/);
  const bad = teamParams([{ id: "x-001", op: "restrict", rule: "DS-ICON-002", param: "icon_sizes_px", value: [16, 18], reason: "18 is not a defined size." }]);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + "<Check size={20} />", bad).length, 0, "a set with a size outside the four is ignored");
});

test("the status lines now say the new limits are applied", () => {
  const lines = summarizeTeams([team("t", [
    restrictOverride(1, "DS-CSS-003", "max_selector_nesting", 1),
    restrictOverride(2, "DS-ANIMATION-005", "min_start_scale", 0.95),
    restrictOverride(3, "DS-TYPOGRAPHY-001", "max_text_styles", 2),
  ])]);
  assert.ok(lines.some((l) => /applied: DS-CSS-003 max_selector_nesting = 1/.test(l)));
  assert.ok(lines.some((l) => /applied: DS-ANIMATION-005 min_start_scale = 0\.95/.test(l)));
  assert.ok(lines.some((l) => /not checked by the hook: DS-TYPOGRAPHY-001/.test(l)));
});

test("a set is compared whole, except spacing divisors, which are read by their smallest", () => {
  const sizes = (value) => summarizeTeams([team("t", [{ id: "x-001", op: "restrict", rule: "DS-ICON-002", param: "icon_sizes_px", value, reason: "Fewer sizes." }])]);
  assert.ok(sizes([16, 24]).some((l) => /applied: DS-ICON-002/.test(l)), "[16,24] shares its smallest size with the base but is still a change");
  assert.ok(sizes([16, 20, 24, 32]).some((l) => /no change from the base/.test(l)));
  assert.ok(sizes([32, 16, 24, 20]).some((l) => /no change from the base/.test(l)), "order does not matter");
  const divisors = (value) => summarizeTeams([team("t", [{ id: "x-001", op: "restrict", rule: "DS-SPACING-001", param: "spacing_divisors", value, reason: "One grid." }])]);
  assert.ok(divisors([4]).some((l) => /no change from the base/.test(l)), "[4] and [4,8] check the same thing");
  assert.ok(divisors([8]).some((l) => /applied: DS-SPACING-001/.test(l)));
});

test("DS-CSS-003 skips keyframe stops even when the keyframes sit inside a nested rule", () => {
  assert.equal(nestHits(".a { .b { @keyframes k { from { x: y; } to { x: y; } } } }").length, 0);
});

test("DS-CSS-003 keeps its place after SCSS interpolation in a selector", () => {
  const hits = nestHits(".a { .b-#{$x} { .c { y: z; } } }\n.d { e: f; }");
  assert.equal(hits.length, 1, "the third level is still found, and the next rule starts again at one");
  assert.match(hits[0].message, /nested 3 levels deep/);
});

test("DS-CSS-003 counts the same levels with a lone brace inside a string", () => {
  assert.equal(nestHits('.a { content: "{"; .b { .c { x: y; } } }').length, 1, "one finding, for .c; the string adds no level");
  assert.equal(nestHits(".a { content: '{'; .b { x: y; } }").length, 0);
});

// --- fixes from review ---

test("DS-CSS-003 reads an at-rule that follows a comment as an at-rule", () => {
  assert.equal(nestHits("/* Mobile */\n@media (max-width: 40em) {\n  .a { .b { x: y; } }\n}").length, 0);
  assert.equal(nestHits("// mobile\n@media (max-width: 40em) { .a { .b { x: y; } } }").length, 0);
  assert.equal(nestHits("/* c */ @layer base { .a { .b { x: y; } } }", "a.css").length, 0);
  assert.equal(nestHits("/* c */ @keyframes k { from { x: y; } to { x: y; } }").length, 0);
  assert.equal(nestHits("/* c */ .a { /* d */ .b { /* e */ .c { x: y; } } }").length, 1, "comments between levels do not change the count");
});

test("DS-CSS-003 does not read // as a comment in .css, or inside a URL", () => {
  assert.equal(nestHits(".d { background: url(//cdn.test/a.png); }\n.e { .f { x: y; } }", "a.css").length, 0);
  assert.equal(nestHits("@import url(//fonts.test/x.css); .e { .f { x: y; } }", "a.css").length, 0);
  assert.equal(nestHits(".d { background: url(//cdn.test/a.png); }\n.e { .f { x: y; } }", "a.scss").length, 0);
  assert.equal(nestHits(".d { background: url(https://cdn.test/a.png); }\n.e { .f { x: y; } }").length, 0);
});

test("DS-ANIMATION-005 reports a start of zero written as a Tailwind class", () => {
  const a = startHits('<div className="starting:scale-0" />');
  assert.equal(a.length, 1);
  assert.equal(a[0].severity, "quality");
  assert.equal(startHits('<div className="animate-in zoom-in-0" />').length, 1);
  assert.equal(startHits('<motion.div initial={{ scale: 0 }} />').length, 1, "scale: 0 is still one finding, from the blocking check");
});

test("DS-ANIMATION-005 sees a scale that follows a nested object, and reads only the start's own scale", () => {
  assert.equal(startHits('<motion.div initial={{ transition: { duration: 1 }, scale: 0.5 }} />').length, 1);
  assert.equal(startHits('<motion.div initial={{ opacity: 0, filter: "blur(0px)", scale: 0.5 }} />').length, 0, "the icon-swap recipe is exempt");
  assert.equal(startHits('<motion.div initial={{ x: 1, nested: { scale: 0.5 } }} />').length, 0, "a scale inside a nested object is not the start's");
  assert.equal(startHits('<motion.div initial={{ scale: 0.5 ').length, 0, "an unclosed object does not throw or match");
  assert.equal(startHits("@keyframes k { from { filter: blur(4px); scale: 0.25; } to { scale: 1; } }", "a.css").length, 0);
});

test("the skill's own icon-swap example (DS-SURFACE-014) is not flagged by DS-ANIMATION-005", () => {
  const md = readFileSync(join(HERE, "..", "references", "surfaces.md"), "utf8");
  assert.match(md, /scale: 0\.25/, "the example this test guards is still there");
  assert.equal(startHits(md, "surfaces.tsx").length, 0);
});

test("DS-ICON-002 does not read a fraction width as a size", () => {
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="w-1/2 h-3/4 size-1/3" />').length, 0);
  assert.equal(iconHits("DS-ICON-002", LUCIDE + '<Check className="size-3" />').length, 1);
});

test("DS-ICON-001 and DS-ICON-002 read icons imported by namespace or beside a default import", () => {
  const ns = 'import * as L from "lucide-react";\n';
  assert.equal(iconHits("DS-ICON-001", ns + "<L.Check strokeWidth={3} />").length, 1);
  assert.equal(iconHits("DS-ICON-002", ns + "<L.Check size={18} />").length, 1);
  assert.equal(iconHits("DS-ICON-001", ns + "<L.Check strokeWidth={1.5} /><Other.Check strokeWidth={3} />").length, 0);
  const mixed = 'import React, { Check } from "lucide-react";\n';
  assert.equal(iconHits("DS-ICON-001", mixed + "<Check strokeWidth={3} />").length, 1);
  assert.equal(iconHits("DS-ICON-001", 'import Check from "lucide-react/dist/esm/icons/check";\n<Check strokeWidth={3} />').length, 0, "deep imports are not read");
});

test("two teams with different icon sizes keep only the sizes both allow", () => {
  const sizes = (value) => ({ id: "x-001", op: "restrict", rule: "DS-ICON-002", param: "icon_sizes_px", value, reason: "Fewer sizes." });
  const get = (files) => { const root = projectWith(files); return paramsFor(loadTeams(root), root, join(root, "a.tsx")); };
  const both = get({ a: team("a", [sizes([16, 20])]), b: team("b", [sizes([16, 24])]) });
  assert.deepEqual(both.get("DS-ICON-002", "icon_sizes_px"), [16]);
  assert.equal(both.source("DS-ICON-002", "icon_sizes_px"), "a and b");
  const reverse = get({ a: team("a", [sizes([16, 24])]), b: team("b", [sizes([16, 20])]) });
  assert.deepEqual(reverse.get("DS-ICON-002", "icon_sizes_px"), [16], "the order of the files does not matter");
  const none = get({ a: team("a", [sizes([16, 20])]), b: team("b", [sizes([24, 32])]) });
  assert.deepEqual(none.get("DS-ICON-002", "icon_sizes_px"), [16, 20], "teams that share no size leave the first team's set, never an empty one");
  const same = get({ a: team("a", [sizes([16, 20]), { ...sizes([16, 20]), id: "x-002" }]) });
  assert.equal(same.source("DS-ICON-002", "icon_sizes_px"), "a");
  const wide = get({ a: team("a", [sizes([16, 20])]), b: team("b", [sizes([16, 20, 24])]) });
  assert.deepEqual(wide.get("DS-ICON-002", "icon_sizes_px"), [16, 20], "a wider set from a second team does not loosen the first");
});

test("DS-CSS-003 treats // as ordinary text in .css, even after a space", () => {
  assert.equal(nestHits(".d { background: url( //cdn.test/a.png ); }\n.e { .f { x: y; } }", "a.css").length, 0);
  assert.equal(nestHits(".d { grid-area: a //b; }\n.e { .f { x: y; } }", "a.css").length, 0);
});

// ---- DS-GRID-007, DS-GRID-004, DS-PANEL-008 ----------------------------------------------------------------

const gridHits = (rule, code, file = "a.tsx") => detectFile(file, code).filter((f) => f.ruleId === rule);

test("DS-GRID-007 flags a hard-coded count in every syntax it reads", () => {
  for (const code of [
    '<div className="grid grid-cols-3" />',
    '<div className="md:grid-cols-5" />',
    '<div className="grid-cols-[repeat(3,1fr)]" />',
    '<div style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }} />',
    "const s = stylex.create({ a: { gridTemplateColumns: 'repeat(2, 1fr)' } });",
  ]) assert.equal(gridHits("DS-GRID-007", code).length, 1, code);
  assert.equal(gridHits("DS-GRID-007", ".a { display: grid; grid-template-columns: repeat(2, 1fr); }", "a.css").length, 1);
  assert.equal(gridHits("DS-GRID-007", ".a { grid-template-columns: repeat(2, 1fr); }", "a.scss").length, 1);
  assert.equal(gridHits("DS-GRID-007", ".a { grid-template-columns: repeat(2, 1fr); }", "C:\\x\\A.CSS").length, 1, "Windows path and upper-case extension");
  assert.equal(gridHits("DS-GRID-007", '<div className="grid-cols-3 md:grid-cols-5" />').length, 2, "one finding per count");
});

test("DS-GRID-007 stays quiet on counts it cannot call hard-coded", () => {
  for (const code of [
    '<div className="grid grid-cols-1" />',
    '<div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12" />', // the page grid
    '<div className="grid-cols-subgrid" />',
    '<div className="data-grid-cols-3" />',
    '<div className="my-grid-cols-3" />',
    '<div style={{ gridTemplateColumns: "repeat(auto-fill, minmax(var(--item-min-card), 1fr))" }} />',
    '<div style={{ gridTemplateColumns: "repeat(1, 1fr)" }} />',
    '<div style={{ gridTemplateColumns: "1fr 2fr" }} />',
    "const repeat = (n, v) => v; repeat(3, 1);",
  ]) assert.equal(gridHits("DS-GRID-007", code).length, 0, code);
  assert.equal(gridHits("DS-GRID-007", ".a { grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); }", "a.css").length, 0);
  assert.equal(gridHits("DS-GRID-007", ".a { margin: 0 repeat(3, 1fr); }", "a.css").length, 0, "only grid-template-columns");
});

test("DS-GRID-004 flags a raw gutter on a grid and nothing else", () => {
  for (const code of [
    '<div className="grid gap-[24px]" />',
    '<div className="md:grid gap-x-[1.5rem]" />',
    '<div className="grid-cols-1 gap-[16px]" />',
    '<div style={{ display: "grid", gap: 24 }} />',
    "const s = stylex.create({ a: { display: 'grid', columnGap: '16px' } });",
  ]) assert.equal(gridHits("DS-GRID-004", code).length, 1, code);
  assert.equal(gridHits("DS-GRID-004", ".a { display: grid; gap: 16px 24px; }", "a.css").length, 1);
  assert.equal(gridHits("DS-GRID-004", ".a { grid-template-columns: 1fr; column-gap: 1rem; }", "a.scss").length, 1);
  assert.equal(gridHits("DS-GRID-004", ".a { display: inline-grid; grid-gap: 8px; }", "a.css").length, 1);
});

test("DS-GRID-004 reads the gap from the grid it belongs to, and only plain lengths", () => {
  for (const code of [
    '<div className="grid gap-[var(--grid-gutter)]" />',
    '<div className="grid gap-[calc(var(--grid-gutter)*2)]" />',
    '<div className="grid gap-[0px]" />',
    '<div className="flex gap-[24px]" />',
    '<div className="grid gap-y-[24px]" />',
    '<div className="grid"><div className="flex gap-[24px]" /></div>', // the gap is on a different tag
    '<div className="data-grid gap-[24px]" />',
    '<div style={{ display: "grid", gap: "var(--grid-gutter)" }} />',
    '<div style={{ display: "grid", gap: 0 }} />',
    '<div style={{ display: "flex", gap: 24 }} />',
    '<div style={{ display: "grid" }}><b style={{ gap: 24 }} /></div>',
  ]) assert.equal(gridHits("DS-GRID-004", code).length, 0, code);
  for (const css of [
    ".a { display: grid; gap: var(--grid-gutter); }",
    ".a { display: grid; gap: calc(var(--grid-gutter) * 2); }",
    ".a { display: grid; gap: min(24px, 2vw); }",
    ".a { display: grid; gap: 0; }",
    ".a { display: flex; gap: 24px; }",
    ".a { display: grid; row-gap: 24px; }",
    "/* display: grid */ .a { gap: 24px; }",
  ]) assert.equal(gridHits("DS-GRID-004", css, "a.css").length, 0, css);
});

test("DS-PANEL-008 flags a raw width on a panel in every syntax it reads", () => {
  for (const code of [
    '<SheetContent className="w-[420px]" />',
    '<Drawer className="min-w-96" />',
    '<Dialog.Panel className="max-w-[480px]" />',
    '<div className="side-panel w-[320px]" />',
    '<div className={`detail-pane w-80`} />',
    '<Panel style={{ width: 320 }} />',
    '<Panel style={{ minWidth: "24rem" }} />',
    '<Panel width="320" />',
    "<Sheet width={360} />",
    "const [panelWidth, setPanelWidth] = useState(320);",
    "const [panelWidth, setPanelWidth] = useState<number>(320);",
    "const PANE_WIDTH = 360;",
    "const s = { drawerWidth: 400 };",
    "<Layout panelWidth={320} />",
    "const s = stylex.create({ panel: { width: 320 } });",
  ]) assert.equal(gridHits("DS-PANEL-008", code).length, 1, code);
  for (const css of [
    ".drawer-content { max-width: 480px; }",
    "#detail-pane { width: 24rem; }",
    ".panel { flex-basis: 20em; }",
    ".side-panel, .card { width: 320px !important; }",
    "@media (min-width: 48em) { .panel { width: 320px; } }",
  ]) assert.equal(gridHits("DS-PANEL-008", css, "a.scss").length, 1, css);
});

test("DS-PANEL-008 stays quiet on tokens, fractions and things that only look like a panel", () => {
  for (const code of [
    '<Sheet className="w-(--panel-push-default) max-w-full" />',
    '<Drawer className="w-[var(--panel-overlay-md)]" />',
    '<Sheet className="w-[calc(100%-var(--grid-margin))]" />',
    '<Panel className="w-full w-1/2 w-[50%] w-screen w-auto w-0 w-px" />',
    '<Panel style={{ width: "var(--panel-push-default)" }} />',
    '<Panel style={{ width: "100%", maxWidth: "100vw", width2: 0 }} />',
    '<Panel width={0} />',
    '<Spreadsheet className="w-80" />',
    '<Stylesheet width={320} />',
    '<div className="w-[320px]">panel</div>',
    '<Chart width={320} />',
    '<div className="card w-[320px]" data-panel="x" />',
    "const [tableWidth, setTableWidth] = useState(320);",
    "const [panelWidth, setPanelWidth] = useState(0);",
    "const panelWidth = tokens.panelPushDefault;",
    "const PANEL_COUNT = 3;",
    "const s = { panel: { color: 'red' }, card: { width: 320 } };",
    "const s = stylex.create({ panel: { width: 'var(--panel-push-default)' } });",
  ]) assert.equal(gridHits("DS-PANEL-008", code).length, 0, code);
  for (const css of [
    ".panel { width: var(--panel-push-default); }",
    ".panel { width: 100%; max-width: 100vw; }",
    ".panel { width: min(320px, 100vw); }",
    ".panel { width: calc(100% - 32px); }",
    ".panel { width: 0; }",
    ".spreadsheet { width: 320px; }",
    "/* panel notes */ .card { width: 320px; }",
    "// panel\n.card { width: 320px; }",
    ".card { width: 320px; }",
  ]) assert.equal(gridHits("DS-PANEL-008", css, "a.scss").length, 0, css);
});

test("the grid detectors stay fast on large and hostile input", () => {
  const big = [
    "grid-cols-".repeat(20000),
    "grid-template-columns:".repeat(40000), // one line; an unbounded scan to the end of the line took 13s
    "[a,".repeat(120000), // an unbounded `[^\]]*` after the name took 16s
    "gap-[".repeat(30000),
    "w-[".repeat(30000),
    "<a ".repeat(30000),
    "{".repeat(100000),
    '<Panel className="grid ' + "a:".repeat(1000) + '" />'.repeat(50),
    "x".repeat(300000),
  ];
  // Only the three grid checks are timed. Other detectors have their own limits.
  for (const text of big) {
    for (const file of ["a.tsx", "a.css"]) {
      for (const id of ["DS-GRID-007", "DS-GRID-004", "DS-PANEL-008"]) {
        const t = Date.now();
        RULES.find((r) => r.id === id).check({ content: text, lines: text.split("\n"), filePath: file, params: undefined });
        assert.ok(Date.now() - t < 3000, `${id} on ${text.slice(0, 12)}… took ${Date.now() - t}ms on ${file}`);
      }
    }
  }
});

const animHits = (code, file = "a.tsx") => RULES.find((r) => r.id === "DS-ANIMATION-005").check({ content: code, lines: code.split("\n"), filePath: file, params: undefined });

test("DS-ANIMATION-005 stays fast on hostile input (it was quadratic)", () => {
  const big = [
    "from{".repeat(40000), // an unbounded [^}]* rescanned to the end from every start: 3s
    "0%{".repeat(40000),
    "a:".repeat(40000) + "zoom-in-", // the variant chain: 3s
    "starting:".repeat(40000), // 36s
    "scale:".repeat(40000), // 12s
    "initial={{ a:{".repeat(40000),
    "x".repeat(300000),
  ];
  for (const text of big) {
    const t = Date.now();
    animHits(text);
    assert.ok(Date.now() - t < 2000, `DS-ANIMATION-005 on ${text.slice(0, 12)}… took ${Date.now() - t}ms`);
  }
});

test("DS-ANIMATION-005 still reads Tailwind variants, in any order and with any prefix", () => {
  for (const code of [
    '<div className="starting:scale-50" />',
    '<div className="md:starting:scale-50" />',
    '<div className="starting:md:scale-[0.5]" />',
    '<div className="dark:starting:hover:scale-0" />',
    '<div className="zoom-in-50" />',
    '<div className="md:zoom-in-0" />',
  ]) assert.equal(animHits(code).length, 1, code);
  for (const code of [
    '<div className="md:scale-50" />',
    '<div className="starting:scale-95" />',
    '<div className="starting:opacity-0 scale-50" />',
    '<div className="startingx:scale-50" />',
    '<div className="x-starting:scale-50" />',
    '<div className="::scale-50" />',
    '<div className="foo-zoom-in-50" />',
  ]) assert.equal(animHits(code).length, 0, code);
  assert.equal(animHits('<div className="starting:scale-50" />')[0].line, 1);
  assert.equal(animHits('a\n<div className="b\n starting:scale-50" />')[0].line, 3);
});

test("KNOWN GAPS: DS-ANIMATION-005 does not read a keyframe block over 1000 characters or more than 31 variants between starting: and scale", () => {
  assert.equal(animHits("@keyframes a { from { " + "x:1;".repeat(300) + " transform: scale(0.5); } }", "a.css").length, 0);
  assert.equal(animHits('<div className="starting:' + "a:".repeat(40) + 'scale-50" />').length, 0);
  assert.equal(animHits('<div className="starting:' + "a:".repeat(5) + 'scale-50" />').length, 1);
  // the cap is 31 variants between starting: and scale
  assert.equal(animHits('<div className="starting:' + "a:".repeat(31) + 'scale-50" />').length, 1);
  assert.equal(animHits('<div className="starting:' + "a:".repeat(32) + 'scale-50" />').length, 0);
  assert.equal(animHits("@keyframes a { from { " + "x".repeat(960) + " transform: scale(0.5); } }", "a.css").length, 1);
});

test("KNOWN GAPS: the grid detectors do not read a page-grid count, a theme gap step or CSS in a template string", () => {
  const found = adversarialTsxFindings.filter((f) => ["DS-GRID-007", "DS-GRID-004"].includes(f.ruleId));
  assert.deepEqual(found, [], "if this now fires, a gap in hooks.md was closed: update the test to assert a finding");
});

// Review round: each of these failed before the fix.
const lineOf = (rule, code, file) => gridHits(rule, code, file).map((f) => f.line);

test("DS-PANEL-008 reads the panel itself, not the parts inside it", () => {
  for (const code of [
    '<PanelLeft className="w-4 h-4" />',
    '<SheetClose className="w-8" />',
    '<SheetTitle className="w-[200px]" />',
    '<div className="panel-title w-[200px]" />',
    '<div className="panel-icon w-6" />',
  ]) assert.equal(gridHits("DS-PANEL-008", code).length, 0, code);
  for (const code of ['<SheetContent className="w-[420px]" />', '<DrawerContent className="w-80" />', '<div className="detail-pane w-80" />'])
    assert.equal(gridHits("DS-PANEL-008", code).length, 1, code);
  for (const css of [".panel-title { max-width: 600px; }", ".panel .icon { width: 16px; }", ".panel > .row, .card { width: 320px; }", ".panel:hover .x { width: 8px; }"])
    assert.equal(gridHits("DS-PANEL-008", css, "a.css").length, 0, css);
  for (const css of [".panel { width: 320px; }", ".card .side-panel { width: 320px; }", ".x, .drawer-content { max-width: 480px; }", ".panel:hover { width: 321px; }"])
    assert.equal(gridHits("DS-PANEL-008", css, "a.css").length, 1, css);
});

test("DS-PANEL-008 and DS-GRID-004 report the line of the declaration", () => {
  assert.deepEqual(lineOf("DS-PANEL-008", ".side-panel {\n color: red;\n background: blue;\n width: 320px;\n}", "a.css"), [4]);
  assert.deepEqual(lineOf("DS-PANEL-008", ".panel { width: 320px; }", "a.css"), [1]);
  assert.deepEqual(lineOf("DS-PANEL-008", ".panel {\n  width: 320px;\n}", "a.css"), [2]);
  assert.deepEqual(lineOf("DS-GRID-004", ".a { display:grid;\n row-gap: 4px;\n gap: 24px; }", "a.css"), [3], "not the row-gap line");
  assert.deepEqual(lineOf("DS-GRID-004", ".a {\n  display: grid;\n  /* gap note */\n  gap: 24px;\n}", "a.css"), [4], "not the comment line");
  assert.deepEqual(lineOf("DS-GRID-007", "/* one\ntwo\nthree */\n.a { grid-template-columns: repeat(3, 1fr); }", "a.css"), [4], "a multi-line comment keeps the line count");
  assert.deepEqual(lineOf("DS-GRID-007", "<div>\n{/* a\nb */}\n<i className=\"grid-cols-3\" />\n</div>", "a.tsx"), [4]);
});

test("the grid detectors skip commented-out code, and a glob in a string does not hide code", () => {
  assert.equal(gridHits("DS-GRID-007", "/* grid-template-columns: repeat(3, 1fr); */", "a.css").length, 0);
  assert.equal(gridHits("DS-GRID-007", '<div>{/* grid-cols-3 */}</div>').length, 0);
  assert.equal(gridHits("DS-GRID-007", '/* grid-cols-3 */\n<i className="grid-cols-3" />').length, 1, "only the live one");
  assert.equal(gridHits("DS-GRID-004", '{/* <i className="grid gap-[24px]" /> */}').length, 0);
  assert.equal(gridHits("DS-PANEL-008", '/* <Sheet className="w-[420px]" /> */').length, 0);
  // "src/*.ts" opens no comment, so the "*/" far below does not swallow the line in between.
  assert.equal(gridHits("DS-GRID-007", 'const a = "src/*.ts";\n<i className="grid-cols-3" />\nconst b = "**/*.css"; // x */ y').length, 1);
});

test("DS-GRID-004 reads the class, not another attribute that says grid", () => {
  assert.equal(gridHits("DS-GRID-004", '<div className="flex gap-[24px]" aria-label="Photo grid" />').length, 0);
  assert.equal(gridHits("DS-GRID-004", '<div className="flex gap-[24px]" data-kind=\'grid\' />').length, 0);
  assert.equal(gridHits("DS-GRID-004", '<div aria-label="Photo grid" className="grid gap-[24px]" />').length, 1);
  assert.equal(gridHits("DS-GRID-004", '<div className={cn("grid", "gap-[24px]")} />').length, 1, "a class built with cn() is still a class");
});

test("DS-GRID-004 does not read a spaced function, and reads upper-case units", () => {
  for (const css of [".a { display: grid; gap: clamp( 16px, 2vw, 24px ); }", ".a { display: grid; gap: calc( 1rem + 8px ); }", ".a { display: grid; gap: min( 24px , 2vw ); }"])
    assert.equal(gridHits("DS-GRID-004", css, "a.css").length, 0, css);
  assert.equal(gridHits("DS-GRID-004", ".a { display: grid; gap: 24PX; }", "a.css").length, 1);
  assert.equal(gridHits("DS-GRID-004", '<div className="grid gap-[24PX]" />').length, 1);
});

test("DS-PANEL-008 reads a typed constant", () => {
  for (const code of ["const PANEL_WIDTH: number = 320;", "const drawerWidth:number=400;", "let panelWidth: number | undefined = 320;"])
    assert.equal(gridHits("DS-PANEL-008", code).length, 1, code);
  for (const code of ["const PANEL_WIDTH: number = tokens.panel;", "const tableWidth: number = 320;", "const PANEL_COUNT: number = 3;", "type P = { panelWidth: number };"])
    assert.equal(gridHits("DS-PANEL-008", code).length, 0, code);
});

test("DS-ANIMATION-004: an arbitrary Tailwind animation counts as animation, animate-none does not", () => {
  const has = (src) => detectFile("a.tsx", src).some((x) => x.ruleId === "DS-ANIMATION-004");
  assert.equal(has('<svg className="animate-[spin_var(--motion-duration-spin)_linear_infinite]" />'), true, "arbitrary animation, no handling");
  assert.equal(has('<div className="animate-spin" />'), true, "named animation, no handling");
  assert.equal(has('<div className="animate-none" />'), false, "animate-none alone is not animation");
  assert.equal(has('<div className="animate-nonexistent" />'), true, "a name that starts with none is still an animation");
});

test("DS-ANIMATION-004: Tailwind motion-reduce: and motion-safe: count as reduced-motion handling", () => {
  const has = (src) => detectFile("a.tsx", src).some((x) => x.ruleId === "DS-ANIMATION-004");
  assert.equal(has('<svg className="animate-[spin_1s_linear_infinite] motion-reduce:animate-none" />'), false);
  assert.equal(has('<svg className="motion-safe:animate-spin" />'), false);
  assert.equal(has('<svg className="animate-spin" data-x="motion-reducer" />'), true, "motion-reducer is not the variant");
  assert.equal(has('<svg className="animate-spin" />\nconst q = "(prefers-reduced-motion: reduce)";'), false, "the literal query in code still counts");
  assert.equal(has('<svg className="animate-spin" />\n/* prefers-reduced-motion */'), true, "a comment that names the query is not handling");
  assert.equal(has('<svg className="animate-spin" />\n// motion-reduce: later'), true, "nor is one that names the variant");
});

// ---- DS-ELEVATION-007 (raw shadow with blur) and DS-ELEVATION-006 (docked shadow) -----------------------------

const elevHits = (rule, code, file = "a.tsx") => detectFile(file, code).filter((f) => f.ruleId === rule);

test("DS-ELEVATION-007 flags a blurred shadow in every syntax it reads", () => {
  for (const code of [
    '<div className="shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />',
    '<div className="hover:shadow-[0_1px_2px_#0003]" />',
    '<div className="dark:md:inset-shadow-[0_2px_4px_black]" />',
    '<div style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />',
    '<div style={{ boxShadow: "0 0 1e1px red" }} />', // an exponent length
    'const g = "src/*.ts"; const s = { boxShadow: "0 4px 12px red" }; /* end */', // "/*" inside a string is not a comment
    '<div style={{ "boxShadow": "0 4px 12px red" }} />',
    "<div style={{ 'box-shadow': '0 4px 12px red' }} />",
    '<div style={{ boxShadow: open ? "0 4px 12px red" : "none" }} />', // a ternary
    '<div style={{ boxShadow: open ? "none" : "0 4px 12px red" }} />',
    'el.style.boxShadow = "0 4px 12px red";',
    'el.style["boxShadow"] = "0 4px 12px red";',
    'const s = stylex.create({ a: { boxShadow: { default: "0 4px 12px red", ":hover": "var(--shadow-medium)" } } });', // StyleX conditional values
    'const s = stylex.create({ a: { boxShadow: { default: "var(--shadow-small)", ":hover": "0 8px 16px red" } } });', // one raw value
    '<div style={{ boxShadow: "0 0 var(--b) 2px red, 0 4px 12px red" }} />', // the second layer is raw
    "<div style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} />",
    "const s = { boxShadow: `0px 2px 8px oklch(0 0 0 / .1)` };",
    '<div className="shadow-md" />',
    '<div className="lg:shadow-2xl" />',
    '<div className="shadow-[0_0_0_1px_red,0_4px_8px_red]" />', // the second layer is raw
    '<div className="shadow-[red_0_4px_8px]" />', // a color may come first
  ]) assert.equal(elevHits("DS-ELEVATION-007", code).length, 1, code);
  for (const [css, file] of [
    [".a { box-shadow: 0 4px 12px rgba(0,0,0,.2); }", "a.css"],
    [".a { box-shadow: 0 4px 12px rgba(0,0,0,.2); }", "a.scss"],
    [".a { -webkit-box-shadow: 0 4px 12px red; }", "a.css"],
    [".a { -moz-box-shadow: 0 4px 12px red; }", "a.css"],
    [".a {\n  box-shadow:\n    0 0 0 1px red,\n    0 2px 6px red;\n}", "a.css"], // a multi-line value
    [".a { BOX-SHADOW: 0 4px 12px red }", "a.css"],
    [".a { box-shadow: inset 0 1px 3px red; }", "a.css"],
    [".a { box-shadow: 0 .5rem 1rem red; }", "C:\\x\\A.CSS"],
    ["const css = `a { box-shadow: 0 4px 12px red; }`;", "a.tsx"],
  ]) assert.equal(elevHits("DS-ELEVATION-007", css, file).length, 1, css);
  assert.equal(elevHits("DS-ELEVATION-007", '<div className="shadow-sm shadow-lg" />').length, 2, "one finding per class");
  assert.equal(elevHits("DS-ELEVATION-007", '<div style={{ boxShadow: { default: "0 4px 12px red", ":hover": "0 8px 16px red" } }} />').length, 2, "one finding per conditional value");
  assert.equal(elevHits("DS-ELEVATION-007", ".a { @apply shadow-md hover:shadow-lg; }", "a.css").length, 2, "@apply in CSS");
  assert.equal(elevHits("DS-ELEVATION-007", ".a { @apply shadow-md; }", "a.scss").length, 1);
  assert.equal(elevHits("DS-ELEVATION-007", ".a { box-shadow: 0 2px 4px red, 0 8px 16px red; }", "a.css").length, 2, "one finding per raw layer");
});

test("DS-ELEVATION-007 stays quiet on tokens, rings, keywords and things it cannot read", () => {
  for (const code of [
    '<div className="shadow-[var(--shadow-medium)]" />',
    '<div className="shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-base)]" />',
    '<div className="shadow-[0_0_0_2px_var(--border-state-focus)]" />', // zero blur is a ring
    '<div className="shadow-[0_0_0_0_transparent]" />',
    '<div className="shadow-[0_1px_0_0_red]" />', // a hard edge: blur 0, spread 0
    '<div className="shadow-none shadow-xs-not-a-class" />',
    '<div className="shadow-[color:var(--x)]" />', // a shadow color, no lengths
    '<div className="shadow-red-500 text-shadow-md" />', // a color, and a different property
    '<div className="text-shadow-[0_2px_4px_red] drop-shadow-[0_4px_8px_red]" />', // other properties
    '<div className="data-shadow-md" />',
    '<div style={{ boxShadow: "var(--shadow-large)" }} />',
    '<div style={{ boxShadow: "none" }} />',
    '<div style={{ boxShadow: shadow }} />', // not a string
    'if (el.style.boxShadow === "0 4px 12px red") {}', // a comparison, not an assignment
    'const f = boxShadow => "0 4px 12px red";', // an arrow function
    '<div style={{ boxShadow: shadow }} title="0 4px 12px red" />', // the next string is not the value
    '<div style={{ boxShadow: "0 4px 12px red\n}} />', // a string that never closes
    '<div className="shadow-[0_4px_12px_red\n]" />', // a class does not span lines
    '<div style={{ boxShadow: open ? shadow : "none" }} />',
    '<div style={{ boxShadow: "0 0 var(--b) 2px red" }} />', // the 2px is the spread: the blur is a var()
    '<div style={{ boxShadow: "0 0 calc(var(--b) * 2) 2px red" }} />',
    '<div style={{ boxShadow: "0 4px 0 1E2px red" }} />', // an exponent length is read: the blur is 0
    '<div style={{ boxShadow: "var(--shadow-small)", color: "0 4px 12px red" }} />', // the second value belongs to color
    'const a = x === "boxShadow" ? "0 4px 12px red" : "";', // a comparison, not a key
    'const f = (boxShadow) => boxShadow ?? "0 4px 12px red";', // an arrow function body, not an assignment
    '<p>Use shadow-md for cards</p>', // JSX text is not a class
    'const note = 1; // shadow-lg and shadow-md',
    '<div className="shadow-[0_1px_2px_red" data-x="a]b" />',
    '<div style={{ boxShadow: "0 0 var(--blur) red" }} />', // a var among too few lengths is not read
    '<div style={{ myboxShadow: "0 4px 12px red" }} />',
    '<div className="shadow-[0_4px_12px_red" />', // never closes
    "// box-shadow: 0 4px 12px red\nconst a = 1;",
    "/* box-shadow: 0 4px 12px red */\nconst a = 1;",
    'const url = "https://x.test/box-shadow: 0 4px 12px red";'.replace("box-shadow", "x"), // not a declaration
  ]) assert.equal(elevHits("DS-ELEVATION-007", code).length, 0, code);
  for (const css of [
    ".a { box-shadow: none; }",
    ".a { box-shadow: 0 0 0 1px var(--border-default); }",
    ".a { box-shadow: inset 0 0 0 2px red, var(--shadow-small); }",
    ".a { --shadow-custom: 0 4px 12px red; }", // a custom property definition is not a use
    ".a { --box-shadow: 0 4px 12px red; }", // a custom property definition
    ".a { x-box-shadow: 0 4px 12px red; }",
    "/* .a { box-shadow: 0 4px 12px red; } */",
    ".a { box-shadow: var(--shadow-xlarge); }",
    ".shadow-md { color: red; }", // a selector, not a use
    ".a .shadow-lg { color: red; }",
    ".a { content: 'shadow-md'; }",
  ]) assert.equal(elevHits("DS-ELEVATION-007", css, "a.css").length, 0, css);
});

test("DS-ELEVATION-007 known gap: any string that names a Tailwind shadow size counts, wherever it sits", () => {
  // The check cannot tell a class from an id, a label or a sentence. Documented in references/hooks.md.
  assert.equal(elevHits("DS-ELEVATION-007", '<div id="shadow-md" />').length, 1);
  assert.equal(elevHits("DS-ELEVATION-007", 'const tip = "Use shadow-md for cards";').length, 1);
  assert.equal(elevHits("DS-ELEVATION-007", '<div className={cn("p-2", open && "shadow-lg")} />').length, 1, "a class in a cn() call is read");
});

test("DS-ELEVATION-007 reads a shadow-[...] value only up to 600 characters", () => {
  const long = `<div className="shadow-[0_${"0".repeat(700)}_12px_red]" />`;
  assert.equal(elevHits("DS-ELEVATION-007", long).length, 0, "a value longer than the bound is skipped, not crashed on");
  assert.equal(elevHits("DS-ELEVATION-007", `<div className="shadow-[0_4px_12px_red]" /><p>${"x".repeat(900)}</p>`).length, 1);
});

test("DS-ELEVATION-007 reports the line of the shadow, and is quick on a long file", () => {
  const f = elevHits("DS-ELEVATION-007", 'const a = 1;\n\n<div className="shadow-[0_4px_12px_red]" />');
  assert.equal(f[0].line, 3);
  const long = '<div className="' + "shadow-[var(--shadow-small)] ".repeat(20000) + '" />\n' + ".a { box-shadow: 0 1px ".repeat(5000);
  const t = Date.now();
  elevHits("DS-ELEVATION-007", long);
  assert.ok(Date.now() - t < 1500, "a very long input stays fast");
});

test("DS-ELEVATION-006 flags a docked panel whose shadow is not for its edge", () => {
  const cls = (c) => `<aside className="${c}" />`;
  for (const [code, re] of [
    [cls("fixed inset-y-0 right-0 shadow-[var(--shadow-large-left)]"), /right-docked.*shadow for a panel docked left.*Use --shadow-large-right/],
    [cls("fixed inset-y-0 right-0 shadow-[var(--shadow-large)]"), /right-docked.*every side/],
    [cls("fixed inset-y-0 left-0 shadow-[var(--shadow-large-right)]"), /left-docked.*docked right/],
    [cls("fixed inset-x-0 bottom-0 shadow-[var(--shadow-large-top)]"), /bottom-docked.*docked top/],
    [cls("absolute inset-x-0 top-0 shadow-[var(--shadow-large-bottom)]"), /top-docked.*docked bottom/],
    [cls("fixed top-0 bottom-0 right-0 shadow-[var(--shadow-large-bottom)]"), /right-docked/], // top-0 and bottom-0 together span the height
    [cls("fixed left-0 right-0 bottom-0 shadow-[var(--shadow-large)]"), /bottom-docked/],
    [cls("fixed inset-y-0 right-0 shadow-[var(--shadow-xlarge)]"), /every side/],
    [cls("!fixed inset-y-0 !right-0 shadow-[var(--shadow-large)]"), /right-docked/], // the important marker is ignored
    [cls("fixed inset-y-0 right-0! shadow-[var(--shadow-large-left)]"), /right-docked/],
    ["const c = cva('fixed inset-y-0 right-0 shadow-[0_0_0_1px_red,var(--shadow-large-left)]');", /right-docked/],
    ['<aside className={`fixed inset-y-0 right-0 shadow-[var(--shadow-large-left)]`} />', /right-docked/],
  ]) {
    const f = elevHits("DS-ELEVATION-006", code);
    assert.equal(f.length, 1, code);
    assert.match(f[0].message, re, code);
  }
});

test("DS-ELEVATION-006 stays quiet when the dock is right, or not a dock", () => {
  for (const code of [
    '<aside className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-right)]" />',
    '<aside className="fixed inset-y-0 left-0 shadow-[var(--shadow-large-left)]" />',
    '<div className="fixed inset-x-0 bottom-0 shadow-[var(--shadow-large-bottom)]" />',
    '<div className="fixed inset-x-0 top-0 shadow-[var(--shadow-large-top)]" />',
    '<div className="fixed inset-y-0 right-0 shadow-none" />',
    '<div className="fixed top-4 right-0 shadow-[var(--shadow-large)]" />', // one edge but no span: a corner toast, not a dock
    '<div className="fixed right-0 shadow-[var(--shadow-large)]" />',
    '<div className="fixed top-0 right-0 shadow-[var(--shadow-large)]" />', // a corner: two edges, no span
    '<div className="fixed bottom-0 left-0 shadow-[var(--shadow-large)]" />',
    '<div className="fixed inset-0 shadow-[var(--shadow-large)]" />', // full screen
    '<div className="fixed inset-y-0 inset-x-0 right-0 shadow-[var(--shadow-large)]" />', // spans both ways
    '<div className="fixed inset-0 right-0 shadow-[var(--shadow-large)]" />',
    '<div className="fixed inset-x-0 inset-y-0 bottom-0 shadow-[var(--shadow-large)]" />',
    '<div className="fixed inset-y-0 left-0 right-0 shadow-[var(--shadow-large)]" />', // spans the width and the height
    '<div className="inset-y-0 right-0 shadow-[var(--shadow-large)]" />', // not positioned
    '<div className="relative inset-y-0 right-0 shadow-[var(--shadow-large)]" />',
    '<div className="fixed inset-y-0 md:right-0 shadow-[var(--shadow-large)]" />', // conditional dock, not read
    '<div className="fixed inset-y-0 right-0" /><p className="shadow-[var(--shadow-large)]" />', // two strings
    '<div className="fixed inset-y-0 right-0 data-shadow-large-left" />',
    '<div className="fixed inset-y-0 right-0 shadow-[var(--shadow-largest-left)]" />',
    '<div className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-rightish)]" />',
    '<div className="fixed inset-y-0 right-0 border-r" />',
    '<header className="fixed inset-x-0 top-0 shadow-[var(--shadow-small)]" />', // an app bar is static: Large would break DS-ELEVATION-009
    '<header className="fixed inset-x-0 top-0 shadow-[var(--shadow-base)]" />',
    '<div className="fixed inset-y-0 right-0 shadow-[var(--shadow-medium)]" />',
    '<aside className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-right)] hover:shadow-[var(--shadow-xlarge)]" />', // a conditional shadow
    '<aside className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-right)] dark:shadow-[var(--shadow-large)] md:shadow-[var(--shadow-large-left)]" />',
    '<aside className="fixed inset-y-0 end-0 shadow-[var(--shadow-large)]" />', // logical edges are not read (known gap)
    '// <div className="fixed inset-y-0 right-0 shadow-[var(--shadow-large-left)]" />',
  ]) assert.equal(elevHits("DS-ELEVATION-006", code).length, 0, code);
  assert.equal(elevHits("DS-ELEVATION-006", '.a { position: fixed; right: 0; box-shadow: var(--shadow-large-left); }', "a.css").length, 0, "CSS is out of reach of this check");
});

test("the built registry components raise neither elevation finding", () => {
  const root = join(HERE, "..", "..", "registry", "vois");
  if (!existsSync(root)) return;
  for (const dir of ["card", "choice-card", "dialog", "dropdown-menu", "hover-card", "select", "switch", "tooltip", "command", "panel", "segmented-control", "checkbox", "radio-group", "input"]) {
    const file = join(root, dir, `${dir}.tsx`);
    if (!existsSync(file)) continue;
    const f = detectFile(file, readFileSync(file, "utf8")).filter((x) => x.ruleId.startsWith("DS-ELEVATION"));
    assert.deepEqual(f, [], `${dir}: ${JSON.stringify(f)}`);
  }
  const css = join(root, "tokens", "vois-tokens.css");
  if (existsSync(css)) assert.deepEqual(detectFile(css, readFileSync(css, "utf8")).filter((x) => x.ruleId.startsWith("DS-ELEVATION")), [], "the generated token file defines shadows, it does not use raw ones");
});

// --- DS-GLASS-003, -004, -005: frosted glass ---

const glassHits = (id, src, file = "src/Nav.tsx") => detectFile(file, src).filter((f) => f.ruleId === id);

test("DS-GLASS-003 flags a backdrop-filter with no -webkit- twin, in CSS and in a style object", () => {
  for (const [file, code] of [
    ["a.css", ".a { backdrop-filter: blur(var(--glass-blur-standard)); }"],
    ["a.css", ".a { backdrop-filter: none; }"],
    ["a.scss", ".a { backdrop-filter: blur(var(--glass-blur-standard)); .b { -webkit-backdrop-filter: blur(var(--glass-blur-standard)); } }"], // a twin in a nested rule
    ["a.css", ".a { -webkit-backdrop-filter: none; } .b { backdrop-filter: none; }"], // a twin in another rule
    ["a.tsx", '<div style={{ backdropFilter: "blur(var(--glass-blur-standard))" }} />'],
    ["a.tsx", 'const s = { "backdropFilter": "none" };'],
    ["a.tsx", "const css = `.a { backdrop-filter: none; }`;"],
    ["a.css", ".a { backdrop-filter: none; --x-webkit-backdrop-filter: none; }"], // a custom property is not the twin
    ["a.css", ".a { -webkit-backdrop-filter: none; backdrop-filter: blur(var(--glass-blur-standard)); }"], // the twin's value differs
    ["a.tsx", 'const s = { "backdrop-filter": "none" };'], // a quoted kebab key
    ["a.tsx", 'el.style.backdropFilter = "none";'], // a DOM assignment
    ["a.tsx", '<div style={{ backdropFilter: "none", WebkitBackdropFilter: "blur(var(--glass-blur-subtle))" }} />'],
  ]) assert.equal(glassHits("DS-GLASS-003", code, file).length, 1, code);
});

test("DS-GLASS-003 leaves alone a pair, a condition, Tailwind and comments", () => {
  for (const [file, code] of [
    ["a.css", ".a { -webkit-backdrop-filter: blur(var(--glass-blur-standard)); backdrop-filter: blur(var(--glass-blur-standard)); }"],
    ["a.css", ".a { backdrop-filter: none; -webkit-backdrop-filter: none; }"], // order does not matter
    ["a.css", "@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .a { color: red; } }"],
    ["a.css", "@supports not (backdrop-filter: blur(1px)) { .a { color: red; } }"],
    ["a.tsx", '<div style={{ backdropFilter: "none", WebkitBackdropFilter: "none" }} />'],
    ["a.tsx", '<div style={{ "-webkit-backdrop-filter": "none", backdropFilter: "none" }} />'],
    ["a.tsx", '<div className="backdrop-blur-[var(--glass-blur-standard)] [@media(prefers-reduced-transparency:reduce)]:backdrop-filter-none" />'],
    ["a.css", "/* .a { backdrop-filter: none; } */"],
    ["a.tsx", "// backdrop-filter: none;"],
    ["a.tsx", '<div style={{ myBackdropFilter: "none" }} />'],
    ["a.css", ".a { --my-backdrop-filter: none; }"],
    ["a.tsx", 'const s = { my_backdropFilter: "none" };'],
    ["a.tsx", "const x = cond ? backdropFilter : other;"], // an expression, not a key
    ["a.tsx", 'el.style.backdropFilter = "none"; el.style.webkitBackdropFilter = "none";'],
    ["a.css", ".a {\n  backdrop-filter:\n    blur(var(--glass-blur-standard));\n  -webkit-backdrop-filter:  blur(var(--glass-blur-standard));\n}"], // whitespace does not count as a difference
    ["a.css", ".a { backdrop-filter: blur(var(--glass-blur-standard))  saturate(1.6); -webkit-backdrop-filter: blur(var(--glass-blur-standard)) saturate(1.6); }"],
    ["a.css", ".backdropFilter:hover { color: red; }"], // style object keys are not read in CSS
  ]) assert.equal(glassHits("DS-GLASS-003", code, file).length, 0, code);
});

test("DS-GLASS-004 flags a literal backdrop blur in each spelling", () => {
  for (const [file, code] of [
    ["a.css", ".a { -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }"],
    ["a.css", ".a { -webkit-backdrop-filter: saturate(1.6) blur(1rem); backdrop-filter: none; }"],
    ["a.css", ".a { @apply backdrop-blur-md; }"],
    ["a.tsx", '<div className="backdrop-blur" />'],
    ["a.tsx", '<div className="md:backdrop-blur-xl" />'],
    ["a.tsx", '<div className="backdrop-blur-[20px]" />'],
    ["a.tsx", '<div className="supports-[(backdrop-filter:blur(1px))]:backdrop-blur-sm" />'],
    ["a.tsx", '<div style={{ WebkitBackdropFilter: "blur(8px)" }} />'],
    ["a.css", ".a {\n  -webkit-backdrop-filter:\n    blur(12px);\n}"], // a value on the next line
    ["a.tsx", 'const s = { "backdrop-filter": "blur(12px)" };'],
    ["a.tsx", 'el.style.backdropFilter = "blur(8px)";'],
    ["a.tsx", '<div style={{ backdropFilter: dark ? "blur(4px)" : "none" }} />'], // a string in a ternary
  ]) assert.ok(glassHits("DS-GLASS-004", code, file).length >= 1, code);
  assert.equal(glassHits("DS-GLASS-004", ".a { -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }", "a.css").length, 2, "each declaration is reported");
});

test("DS-GLASS-004 leaves alone the tokens, a reset, a condition and other filters", () => {
  for (const [file, code] of [
    ["a.css", ".a { -webkit-backdrop-filter: blur(var(--glass-blur-subtle)); backdrop-filter: blur(var(--glass-blur-subtle)) saturate(1.5); }"],
    ["a.css", ".a { backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0px); }"],
    ["a.css", "@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .a { color: red; } }"],
    ["a.css", ".a { filter: blur(4px); }"], // DS-SURFACE-014's icon swap uses filter, not backdrop-filter
    ["a.tsx", '<motion.span initial={{ filter: "blur(4px)" }} />'],
    ["a.tsx", '<div className="backdrop-blur-none blur-sm backdrop-blur-[var(--glass-blur-strong)] backdrop-blur-(--glass-blur-standard)" />'],
    ["a.tsx", '<div className="my-backdrop-blur-md" />'],
    ["a.css", ".backdrop-blur-md { color: red; }"], // CSS is read only inside @apply
    ["a.tsx", "<p>Use backdrop-blur for glass</p>"], // JSX text, not a class string
    ["a.tsx", "const backdropBlur = 1; // backdrop-blur-md"],
    ["a.tsx", "const s = { backdropFilter: `blur(${r}px)`, WebkitBackdropFilter: `blur(${r}px)` };"], // an interpolation is not read
  ]) assert.equal(glassHits("DS-GLASS-004", code, file).length, 0, code);
});

test("DS-GLASS-005 flags an animated backdrop-filter", () => {
  for (const [file, code] of [
    ["a.css", ".a { transition: opacity 150ms, backdrop-filter 150ms; }"],
    ["a.css", ".a { transition-property: -webkit-backdrop-filter; }"],
    ["a.css", ".a { -webkit-transition: -webkit-backdrop-filter 200ms; }"], // the prefixed transition
    ["a.tsx", '<div style={{ WebkitTransition: "-webkit-backdrop-filter 200ms" }} />'],
    ["a.tsx", '<motion.div animate={{ "backdrop-filter": "none" }} />'],
    ["a.tsx", '<motion.div exit={{ WebkitBackdropFilter: "none" }} />'],
    ["a.css", "@keyframes in { from { -webkit-backdrop-filter: blur(0); backdrop-filter: blur(0); } }"],
    ["a.tsx", '<div className="transition-[opacity,backdrop-filter]" />'],
    ["a.tsx", '<div style={{ transition: "backdrop-filter 200ms" }} />'],
    ["a.tsx", '<motion.div animate={{ backdropFilter: "blur(0)", WebkitBackdropFilter: "blur(0)" }} />'],
    ["a.tsx", '<motion.div whileHover={{ opacity: 1, backdropFilter: "none" }} />'],
    ["a.tsx", 'const v = { initial: { backdropFilter: "none" } };'],
  ]) assert.equal(glassHits("DS-GLASS-005", code, file).length, 1, code);
});

test("DS-GLASS-005 leaves alone other transitions, a static style and other keyframes", () => {
  for (const [file, code] of [
    ["a.css", ".a { transition: opacity 150ms; -webkit-backdrop-filter: none; backdrop-filter: none; }"],
    ["a.css", ".a { transition: filter 150ms; }"],
    ["a.css", ".a { transition: my-backdrop-filter-ish 1s; }"],
    ["a.css", "@keyframes in { from { opacity: 0; } } .a { -webkit-backdrop-filter: none; backdrop-filter: none; }"],
    ["a.css", "@keyframes in { from { opacity: 0; } }\n@supports (backdrop-filter: blur(1px)) { .a { color: red; } }"],
    ["a.css", "@keyframes in { from { --my-backdrop-filter: 0; } }"],
    ["a.tsx", '<div className="transition-[opacity] supports-[(backdrop-filter:blur(1px))]:backdrop-blur-[var(--glass-blur-standard)]" />'],
    ["a.tsx", '<div className="transition-[backdrop-filter-ish]" />'],
    ["a.tsx", '<div style={{ backdropFilter: "none", WebkitBackdropFilter: "none" }} />'],
    ["a.tsx", '<motion.div animate={{ opacity: 1 }} style={{ backdropFilter: "none", WebkitBackdropFilter: "none" }} />'],
  ]) assert.equal(glassHits("DS-GLASS-005", code, file).length, 0, code);
});

test("the edge fade CSS in glass.md raises no glass finding, and a generator's literal blur still does", () => {
  const md = readFileSync(join(HERE, "..", "references", "glass.md"), "utf8");
  const section = md.slice(md.indexOf("## Edge fade"));
  const blocks = [...section.matchAll(/```css\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.ok(blocks.length >= 2, "the section holds the single and the layered example");
  for (const css of blocks) for (const id of ["DS-GLASS-003", "DS-GLASS-004", "DS-GLASS-005"]) assert.equal(glassHits(id, css, "a.css").length, 0, `${id}: ${css.slice(0, 40)}`);
  // From the other side: the smooth-blur generator writes a literal radius, and a calc() on the token is read as a literal.
  const generated = ".smooth-blur { backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); mask-image: linear-gradient(to top, #000, transparent); }";
  assert.equal(glassHits("DS-GLASS-004", generated, "a.css").length, 2);
  assert.equal(glassHits("DS-GLASS-004", ".a { backdrop-filter: blur(calc(var(--glass-blur-strong) * 0.75)); -webkit-backdrop-filter: blur(calc(var(--glass-blur-strong) * 0.75)); }", "a.css").length, 2, "a calc must go through a custom property");
});

test("DS-GLASS checks stay quick on a very long file", () => {
  const css = Array.from({ length: 5000 }, (_, i) => `.g${i} { -webkit-backdrop-filter: blur(var(--glass-blur-standard)); backdrop-filter: blur(var(--glass-blur-standard)); }`).join("\n");
  const t = Date.now();
  for (const id of ["DS-GLASS-003", "DS-GLASS-004", "DS-GLASS-005"]) assert.equal(glassHits(id, css, "a.css").length, 0);
  assert.ok(Date.now() - t < 3000);
});

test("the registry's glass classes and the components that use them raise no glass finding", () => {
  const root = join(HERE, "..", "..", "registry", "vois");
  for (const rel of ["glass/glass.ts", "dropdown-menu/dropdown-menu.tsx", "dialog/dialog.tsx", "command/command.tsx", "tokens/vois-tokens.css"]) {
    const file = join(root, rel);
    if (!existsSync(file)) continue;
    assert.deepEqual(detectFile(file, readFileSync(file, "utf8")).filter((x) => x.ruleId.startsWith("DS-GLASS")), [], rel);
  }
});

// --- DS-ICON-005: an icon-only Button names its action ---

const nameHits = (src) => detectFile("src/Toolbar.tsx", src).filter((f) => f.ruleId === "DS-ICON-005");

test("DS-ICON-005 flags an icon-size Button with no accessible name, in each spelling", () => {
  for (const code of [
    '<Button size="icon"><Heart /></Button>',
    "<Button size='icon-sm'><Heart /></Button>",
    '<Button size={"icon-lg"}><Heart /></Button>',
    "<Button size={`icon`}><Heart /></Button>",
    '<Button variant="ghost" size="circular" />',
    '<Button\n  size="icon"\n  onClick={() => setOpen(count > 2)}\n>\n  <Heart />\n</Button>',
    '<Button size="icon" aria-label=""><Heart /></Button>', // an empty name is no name
    '<Button size="icon" aria-label="   "><Heart /></Button>',
    '<Button size="icon" data-aria-label="Like"><Heart /></Button>', // not the attribute
    '<Button size="icon" title="Like"><Heart /></Button>', // title is not counted
    '<Button size="icon"><Heart className="sr-only-ish" /></Button>',
    '<Button size="icon"><Trash onClick={() => go()} /></Button>', // a > inside a child's attribute is not text
    '<Button size="icon"><Trash data-x={n > 0} /></Button>',
    '<Button size="icon"><Trash title="a > b" /></Button>',
    '<Button size="icon" style={{...base}}><Trash /></Button>', // an object spread in a value is not a prop spread
    '<Button size="icon" className={cn({...x})}><Trash /></Button>',
    '<Button size="icon" style={ {...base} }><Trash /></Button>', // with spaces
    '<Button size="icon">{/* delete */}<Trash /></Button>', // a comment is not a name
    '<Button size="icon" aria-label={undefined}><Trash /></Button>',
    '<Button size="icon" aria-label={null}><Trash /></Button>',
    '<Button size="icon" aria-label={""}><Trash /></Button>',
    "<Button size=\"icon\" aria-label={''}><Trash /></Button>",
    '<Button size="icon"><Trash onClick={() => f("}")} /></Button>\n<p>Delete</p>', // a brace in a string does not end the child early
  ]) assert.equal(nameHits(code).length, 1, code);
  assert.equal(nameHits('<p>x</p>\n<Button size="icon"><Heart /></Button>')[0].line, 2);
  assert.match(nameHits('<Button size="icon"><Heart /></Button>')[0].message, /no accessible name/);
});

test("DS-ICON-005 leaves alone a named button, a text button and what it cannot read", () => {
  for (const code of [
    '<Button size="icon" aria-label="Add to favorites"><Heart /></Button>',
    '<Button size="icon" aria-label={t("favorite")}><Heart /></Button>',
    '<Button size="icon" aria-labelledby="fav-label"><Heart /></Button>',
    '<Button size="icon"><Heart /><span className="sr-only">Add to favorites</span></Button>',
    '<Button size="icon" asChild><a href="/" aria-label="Home"><House /></a></Button>',
    '<Button size="icon">Go</Button>', // visible text
    '<Button size="icon" {...props}><Heart /></Button>', // the spread may carry the name
    '<Button size="icon">{icon}</Button>', // an expression child may be text
    '<Button size={compact ? "icon-sm" : "icon"}><Heart /></Button>', // a computed size is not read
    '<Button data-size="icon"><Heart /></Button>',
    '<Button size="sm"><Heart /></Button>',
    '<Button><Heart /></Button>',
    '<InputGroupButton size="icon-xs"><Eye /></InputGroupButton>', // another component
    '<ButtonGroup size="icon"><Heart /></ButtonGroup>',
    '<Button size="icon-xs"><Heart /></Button>', // not a Button size
    '<Button size="icon"> ', // never closes: not read
    '<Button size="icon"><Trash title="</Button>" /></Button>', // a child cut off by "</Button>" in a string: not read
    '<Button size="icon" className="x" {...rest}><Heart /></Button>', // a prop spread after other props
    '<Button {...props} size="icon"><Heart /></Button>', // a prop spread first
    '<Button\n  size="icon"\n  {...props}\n><Heart /></Button>', // on its own line
    '<Button size="icon">{" "}{label}</Button>',
    '<Button size="icon"><Trash />{count > 0 ? "Delete" : null}</Button>', // an expression child is not read
    '<Button size="icon"><Trash onClick={() => {}} /> Delete</Button>', // text after a child with braces
    '<Button size="icon"><Trash data-s="}" />Delete</Button>', // a brace inside a quoted value

  ]) assert.equal(nameHits(code).length, 0, code);
});

test("DS-ICON-005 reads one Button at a time", () => {
  const two = '<Button size="icon" aria-label="Like"><Heart /></Button>\n<Button size="icon"><Trash /></Button>';
  assert.deepEqual(nameHits(two).map((f) => f.line), [2], "the second, unnamed button is found, the first is not");
});

test("DS-ICON-005 stays quick on a very long file", () => {
  const src = Array.from({ length: 5000 }, () => '<Button size="icon" aria-label="Like"><Heart /></Button>').join("\n");
  const t = Date.now();
  assert.equal(nameHits(src).length, 0);
  assert.ok(Date.now() - t < 2000);
});

test("the built registry components raise no DS-ICON-005 finding", () => {
  const root = join(HERE, "..", "..", "registry", "vois");
  for (const dir of ["dialog", "input-group", "button", "icon-button", "command", "panel"]) {
    const file = join(root, dir, `${dir}.tsx`);
    if (!existsSync(file)) continue;
    assert.deepEqual(detectFile(file, readFileSync(file, "utf8")).filter((x) => x.ruleId === "DS-ICON-005"), [], dir);
  }
});

const modalHits = (rule, code, file = "a.tsx") => detectFile(file, code).filter((f) => f.ruleId === rule);
const footer = (inner, tag = "DialogFooter") => `<${tag}>${inner}</${tag}>`;

test("DS-MODAL-005 flags a dialog footer with more than two buttons", () => {
  for (const code of [
    footer("<Button>A</Button><Button>B</Button><Button>C</Button>"),
    footer("<DialogClose><Button>Cancel</Button></DialogClose><Button>Save</Button><Button>Delete</Button>"), // a DialogClose without asChild is a button too
    footer("<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete</AlertDialogAction><Button>Learn more</Button>", "AlertDialogFooter"),
    footer("<Button onClick={() => a > b}>A</Button><Button variant=\"outline\">B</Button><Button>C</Button>"), // a ">" inside an attribute is not a tag end
    footer("<Button>A</Button>{ok ? <Button>B</Button> : <Button>C</Button>}"), // advisory: a conditional counts as two
    footer("<Button variant=\"link\">Help</Button><Button>A</Button><Button>B</Button><Button>C</Button>"), // a link does not hide a third real button
    footer("<Button variant=\"ghost\">Back</Button><Button variant=\"link\">Help</Button><Button variant=\"outline\">Cancel</Button><Button>Save</Button>"), // four buttons is too many, even with ghost and link
    footer("<Button variant=\"ghost\">Back</Button><Button variant=\"ghost\">Skip</Button><Button variant=\"ghost\">Help</Button><Button variant=\"link\">More</Button>"), // all left-side variants, but four
  ]) assert.equal(modalHits("DS-MODAL-005", code).length, 1, code);
  assert.match(modalHits("DS-MODAL-005", footer("<Button>A</Button><Button>B</Button><Button>C</Button>"))[0].message, /3 buttons, 3 of them not ghost or link/);
  assert.equal(modalHits("DS-MODAL-005", footer("<Button>A</Button><Button>B</Button><Button>C</Button>") + footer("<Button>X</Button><Button>Y</Button><Button>Z</Button>")).length, 2, "one finding per footer");
});

test("DS-MODAL-005 stays quiet when a footer has two buttons, or the rest are links", () => {
  for (const code of [
    footer("<Button variant=\"outline\">Cancel</Button><Button>Save</Button>"),
    footer("<Button variant=\"link\">Help</Button><Button variant=\"outline\">Cancel</Button><Button>Save</Button>"), // the third action is a link
    footer("<Button variant=\"ghost\">Back</Button><Button variant=\"outline\">Cancel</Button><Button>Save</Button>"), // or a ghost button
    footer("<Button variant='ghost'>Back</Button><Button variant={\"ghost\"}>Skip</Button><Button>Save</Button>"), // two ghost and one primary: not more than 3, and one non-ghost
    footer("<Button variant={\"link\"}>Help</Button><Button>Cancel</Button><Button>Save</Button>"),
    footer("<DialogClose asChild><Button>Cancel</Button></DialogClose><Button>Save</Button>"), // the wrapper is not a second button
    footer("<DialogClose asChild><Button>Cancel</Button></DialogClose><DialogClose asChild><Button>Close</Button></DialogClose>"),
    footer("<ButtonGroup>x</ButtonGroup><Button>B</Button><Button>C</Button>"), // two Buttons; ButtonGroup is not one
    "<DialogFooter />",
    "<DialogFooter /><Button>A</Button><Button>B</Button><Button>C</Button></DialogFooter>", // an empty footer must not claim a later close tag
    "<DialogFooter",
    "<DialogFooter><Button>A</Button><Button>B</Button><Button>C</Button>", // never closes: not read
    footer("<Button>A</Button><Button>B</Button><Button>C</Button>", "SheetFooter"), // Sheet and Drawer footers are not read: an action sheet has three or more choices
    "<div><Button>A</Button><Button>B</Button><Button>C</Button></div>", // not in a footer
    "// " + footer("<Button>A</Button><Button>B</Button><Button>C</Button>"),
    "/* " + footer("<Button>A</Button><Button>B</Button><Button>C</Button>") + " */",
  ]) assert.equal(modalHits("DS-MODAL-005", code).length, 0, code);
  assert.equal(modalHits("DS-MODAL-005", footer("<Button>A</Button><Button>B</Button><Button>C</Button>"), "a.css").length, 0, "CSS is not read");
  assert.equal(modalHits("DS-MODAL-005", footer("<Button>A</Button><Button>B</Button><Button>C</Button>")).length, 1, "same code in .tsx is read");
});

test("DS-MODAL checks stay fast on a large file, and pin two edge cases", () => {
  const t0 = Date.now();
  assert.equal(modalHits("DS-MODAL-006", "<Dialog>".repeat(20000) + "</Sheet>".repeat(20000)).length, 0, "closes that match nothing");
  assert.equal(modalHits("DS-MODAL-005", "<DialogFooter><Button/>".repeat(16000)).length, 0, "footers that never close");
  assert.ok(Date.now() - t0 < 1500, `took ${Date.now() - t0}ms`);
  // Pinned, and listed as a known gap in hooks.md: the outer footer ends at the first close tag, so the trailing button is not counted.
  assert.equal(modalHits("DS-MODAL-005", "<DialogFooter><Button/><DialogFooter><Button/><Button/></DialogFooter><Button/></DialogFooter>").length, 1);
  // A string that holds JSX is read like code (known gap).
  assert.equal(modalHits("DS-MODAL-006", "const s = `<Dialog><Dialog></Dialog></Dialog>`;").length, 1);
});

test("DS-MODAL-006 flags a dialog, sheet or drawer opened inside another", () => {
  const nest = (outer, inner) => `<${outer}><${outer}Content><${inner}><${inner}Content>x</${inner}Content></${inner}></${outer}Content></${outer}>`;
  for (const [outer, inner] of [["Dialog", "Dialog"], ["Dialog", "AlertDialog"], ["Sheet", "Dialog"], ["Drawer", "AlertDialog"], ["AlertDialog", "Sheet"]]) {
    const hits = modalHits("DS-MODAL-006", nest(outer, inner));
    assert.equal(hits.length, 1, `${inner} in ${outer}`);
    assert.match(hits[0].message, new RegExp(`${inner} is opened inside a ${outer}`));
  }
  assert.equal(modalHits("DS-MODAL-006", "<Dialog><Dialog><Sheet>x</Sheet></Dialog></Dialog>").length, 2, "three deep: two nested");
  assert.equal(modalHits("DS-MODAL-006", '<Dialog open={a}>\n<DialogContent>\n<AlertDialog open={b}>x</AlertDialog>\n</DialogContent>\n</Dialog>').length, 1, "props and lines");
  assert.equal(modalHits("DS-MODAL-006", "<Dialog>{open && <AlertDialog>x</AlertDialog>}</Dialog>")[0]?.line, 1);
});

test("DS-MODAL-006 stays quiet on siblings, other overlays and anything it cannot match", () => {
  for (const code of [
    "<Dialog>x</Dialog><Dialog>y</Dialog>", // siblings
    "<Dialog><DialogTrigger>x</DialogTrigger><DialogContent><DialogHeader /></DialogContent></Dialog>", // parts are not roots
    "<Dialog><Popover>x</Popover><Tooltip>y</Tooltip><DropdownMenu>z</DropdownMenu></Dialog>", // a menu or popover in a dialog is allowed
    "<Dialog><Dialog open /></Dialog>", // a self-closing tag opens nothing
    "<Dialog open /><Sheet></Sheet></Dialog>", // it must not take a later close tag for its own
    "<Dialog><Dialog>x</Dialog>", // the outer never closes: not read
    "<Dialog><AlertDialog>x</Dialog>", // mismatched: not read
    "</Dialog><Dialog>x</Dialog>", // a stray close tag
    "// <Dialog><Dialog>x</Dialog></Dialog>",
    "/* <Dialog><Dialog>x</Dialog></Dialog> */",
    "<DialogDemo><Dialog>x</Dialog></DialogDemo>", // a name that only starts with Dialog
    "<Sheets><Sheet>x</Sheet></Sheets>",
  ]) assert.equal(modalHits("DS-MODAL-006", code).length, 0, code);
  assert.equal(modalHits("DS-MODAL-006", "<Dialog><Dialog>x</Dialog></Dialog>", "a.css").length, 0, "CSS is not read");
  assert.equal(modalHits("DS-MODAL-006", "<Dialog><Dialog>x</Dialog></Dialog>").length, 1, "same code in .tsx is read");
});

// DS-TOKEN-001: a Global palette step used as a value, not aliased.
const tokenHits = (code, file = "a.tsx") => detectFile(file, code).filter((f) => f.ruleId === "DS-TOKEN-001");

test("DS-TOKEN-001 flags a palette step used as a value, in every form a component reads it", () => {
  for (const [code, file, n] of [
    ['<div className="bg-(--blue-9)" />', "a.tsx", 1], // Tailwind v4 shorthand
    ['<Chip token={dark ? "--blue-9" : "--gray-9"} />', "a.tsx", 2], // a colon after the first branch is not a definition
    ['<div className="bg-[color:var(--gray-a4)]" />', "a.tsx", 1],
    ['style={{ color: "var(--white)" }}', "a.tsx", 1],
    ['style={{ "--x": "var(--blue-9)", color: "var(--blue-9)" }}', "a.tsx", 1], // the alias passes, the value on the same line does not
    [".a { color: var(--blue-9); }", "a.css", 1],
    [".a { color: var(--a, var(--blue-9)); }", "a.css", 1], // a fallback is still a use
    [".a { box-shadow: 0 0 0 1px var(--blue-a5), 0 1px var(--gray-a3); }", "a.css", 2],
    [".a { color: var(--cool-gray-12); }", "a.scss", 1],
    [".a { color: var(--black-a0); }", "a.css", 1],
  ]) assert.equal(tokenHits(code, file).length, n, code);
  assert.match(tokenHits('<i className="bg-(--blue-9)" />')[0].message, /--blue-9 used directly/);
});

test("DS-TOKEN-001 leaves aliases, definitions, comments and longer names alone", () => {
  for (const [code, file] of [
    [":root { --bg-card: var(--white); }", "a.css"], // a token aliasing the palette
    [":root { --blue-9: oklch(0.6 0.2 250); }", "a.css"], // the palette defining itself
    [".a { --x: var(--a, var(--blue-9)); }", "a.css"], // a fallback inside an alias
    ['className="[--accent:var(--blue-9)] bg-(--accent)"', "a.tsx"], // Tailwind arbitrary property
    ["const t = { '--blue-9': '#3b82f6' };", "a.ts"],
    ["// uses --blue-9 here", "a.tsx"],
    ["/* --blue-9 */ .a {}", "a.css"],
    [".card--blue-3 {}", "a.css"], // BEM modifier, not a token
    ["var(--blue-9-text)", "a.tsx"], // a longer name
    ["var(--gray-10x)", "a.tsx"],
    ["var(--bg-blue-9)", "a.tsx"],
    ["var(--white-text)", "a.tsx"],
    ["var(--blue-13)", "a.tsx"], // no step 13
    ["var(--brand-9)", "a.tsx"], // not a Vois hue
  ]) assert.equal(tokenHits(code, file).length, 0, code);
});

// --- ignoredFiles: globs are matched against the path relative to the project root ---

/** A project with `.vois/config.json` ignoring `globs`, and a file at `rel` that trips DS-COLOR-001 and DS-TAILWIND-004. */
function ignoringProject(globs, rel = "src/legacy/a.tsx") {
  const root = mkdtempSync(join(tmpdir(), "vois-ignore-"));
  mkdirSync(join(root, ".vois"), { recursive: true });
  writeFileSync(join(root, ".vois", "config.json"), JSON.stringify({ ignoredFiles: globs }));
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), 'export const A = () => <div className="text-[#ff0000]" />;\n');
  return root;
}
const afterEdit = (cwd, filePath) => spawnSync(process.execPath, [join(HERE, "hook.mjs")], { cwd, input: JSON.stringify({ tool_name: "Write", cwd, tool_input: { file_path: filePath } }), encoding: "utf8" });
const beforeEdit = (cwd, filePath) => spawnSync(process.execPath, [join(HERE, "hook-before-edit.mjs")], { cwd, input: JSON.stringify({ tool_name: "Write", cwd, tool_input: { file_path: filePath, content: ".a { color: red !important; }" } }), encoding: "utf8" });

test("ignoredFiles applies to the absolute path Claude Code, Cursor and Codex send", () => {
  const root = ignoringProject(["src/legacy/**"]);
  const run = afterEdit(root, join(root, "src", "legacy", "a.tsx"));
  assert.equal(run.status, 0);
  assert.doesNotMatch(run.stdout, /DS-COLOR-001/, "an absolute path inside the root is ignored");
  assert.equal(beforeEdit(root, join(root, "src", "legacy", "a.tsx")).status, 0, "the Cursor hook does not deny an ignored file");
});

test("ignoredFiles still applies to a relative or ./ path, and not to a file outside the glob", () => {
  const root = ignoringProject(["src/legacy/**"]);
  assert.doesNotMatch(afterEdit(root, "src/legacy/a.tsx").stdout, /DS-COLOR-001/, "relative path");
  assert.doesNotMatch(afterEdit(root, "./src/legacy/a.tsx").stdout, /DS-COLOR-001/, "./ path");
  writeFileSync(join(root, "src", "b.tsx"), 'export const B = () => <div className="text-[#ff0000]" />;\n');
  assert.match(afterEdit(root, join(root, "src", "b.tsx")).stdout, /DS-COLOR-001/, "a file the glob does not cover is still checked");
  assert.equal(beforeEdit(root, join(root, "src", "b.tsx")).status, 2, "the Cursor hook still denies outside the glob");
});

test("a relative ignoredFiles glob never matches a file outside the project root", () => {
  const root = ignoringProject(["src/legacy/**", "**/a.tsx"]);
  const other = ignoringProject([]); // same layout, different folder, no ignores of its own
  const outside = join(other, "src", "legacy", "a.tsx");
  const run = afterEdit(root, outside);
  assert.equal(run.status, 0);
  assert.match(run.stdout, /DS-COLOR-001/, "outside the root: not ignored, and no throw");
  assert.equal(beforeEdit(root, outside).status, 2);
  assert.equal(isFileIgnored({ ignoredFiles: ["**"] }, outside, root), false, "not even by **");
  assert.equal(isFileIgnored({ ignoredFiles: ["src/legacy/**"] }, join(root, "..", "x", "src", "legacy", "a.tsx"), root), false);
  assert.equal(isFileIgnored({ ignoredFiles: ["src/**"] }, root, root), false, "the root itself is not a file under it");
});

test("ignoredFiles: an absolute glob keeps matching the absolute path", () => {
  const root = ignoringProject([]);
  const file = join(root, "src", "legacy", "a.tsx");
  writeFileSync(join(root, ".vois", "config.json"), JSON.stringify({ ignoredFiles: [`${root.split("\\").join("/")}/src/legacy/**`] }));
  assert.doesNotMatch(afterEdit(root, file).stdout, /DS-COLOR-001/);
  assert.equal(isFileIgnored({ ignoredFiles: ["/elsewhere/src/legacy/**"] }, file, root), false, "a different absolute glob does not match");
});

test("ignoredFiles: Windows backslash paths and globs", () => {
  const cfg = (g) => ({ ignoredFiles: [g] });
  const root = "C:\\work\\proj";
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "C:\\work\\proj\\src\\legacy\\a.tsx", root), true, "absolute backslash path");
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "c:\\Work\\Proj\\src\\legacy\\a.tsx", root), true, "drive and folder case differ, as Windows allows");
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "C:/work/proj/src/legacy/a.tsx", root), true, "forward slashes on Windows");
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "src\\legacy\\a.tsx", root), true, "relative backslash path");
  assert.equal(isFileIgnored(cfg("src\\legacy\\**"), "C:\\work\\proj\\src\\legacy\\a.tsx", root), true, "backslash glob");
  assert.equal(isFileIgnored(cfg(".\\src\\legacy\\**"), "C:\\work\\proj\\src\\legacy\\a.tsx", root), true, ".\\ glob");
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "D:\\work\\proj\\src\\legacy\\a.tsx", root), false, "another drive is outside the root");
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "C:\\work\\proj2\\src\\legacy\\a.tsx", root), false, "a sibling folder whose name starts the same");
  assert.equal(isFileIgnored(cfg("src/legacy/**"), "C:\\work\\proj\\src\\legacyx\\a.tsx", root), false);
});

test("ignoredFiles: the glob is anchored to the root-relative path", () => {
  const root = "/p";
  const ig = (g, f) => isFileIgnored({ ignoredFiles: [g] }, f, root);
  assert.equal(ig("./src/legacy/**", "/p/src/legacy/a.tsx"), true, "./ glob");
  assert.equal(ig("legacy/**", "/p/src/legacy/a.tsx"), false, "a glob is not matched at any depth");
  assert.equal(ig("src/*.tsx", "/p/src/legacy/a.tsx"), false, "* stays inside one folder");
  assert.equal(ig("src/*.tsx", "/p/src/a.tsx"), true);
  assert.equal(ig("**/a.tsx", "/p/src/legacy/a.tsx"), true);
  assert.equal(ig("src/legacy/**", "/p/src/legacy2/a.tsx"), false);
  for (const bad of [undefined, null, "", 5]) assert.equal(ig("src/**", bad), false, `file path ${JSON.stringify(bad)}`);
  assert.equal(isFileIgnored({ ignoredFiles: [5, null, "", "src/**"] }, "/p/x.tsx", root), false, "non-string or empty globs match nothing");
  assert.equal(isFileIgnored({ ignoredFiles: [""] }, "/p/x.tsx", root), false);
});

test("ignoredFiles: a leading / glob is read from the root as well as as an absolute path; C:/ and // only as absolute", () => {
  const ig = (g, f, root = "/p") => isFileIgnored({ ignoredFiles: [g] }, f, root);
  assert.equal(ig("/src/legacy/**", "/p/src/legacy/a.tsx"), true, "root-relative, as team scopes read it");
  assert.equal(ig("/p/src/legacy/**", "/p/src/legacy/a.tsx"), true, "absolute");
  assert.equal(ig("//src/legacy/**", "/p/src/legacy/a.tsx"), false, "// is a UNC prefix, never root-relative");
  assert.equal(ig("C:/src/legacy/**", "C:\\w\\src\\legacy\\a.tsx", "C:\\w"), false, "a drive glob is never root-relative");
  assert.equal(ig("C:/w/src/legacy/**", "C:\\w\\src\\legacy\\a.tsx", "C:\\w"), true);
  assert.equal(ig("C:/w/src/legacy/**", "c:\\w\\src\\legacy\\a.tsx", "C:\\w"), true, "an absolute Windows glob compares without case, as Windows does");
  assert.equal(ig("c:/W/Src/legacy/**", "C:\\w\\src\\legacy\\a.tsx", "C:\\w"), true);
  assert.equal(ig("/P/src/legacy/**", "/p/src/legacy/a.tsx"), false, "a POSIX absolute glob still compares with case");
});

test("team scopes match Windows backslash paths from the same root-relative helper", () => {
  const t = [team("t", [restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200)], ["apps/payments/**"])];
  const src = (p) => paramsFor(t, "C:\\w\\proj", p).source("DS-ANIMATION-001", "max_duration_ms");
  assert.equal(src("C:\\w\\proj\\apps\\payments\\Pay.tsx"), "t");
  assert.equal(src("apps\\payments\\Pay.tsx"), "t");
  assert.equal(src("C:\\w\\proj2\\apps\\payments\\Pay.tsx"), null, "a sibling folder is outside the root");
  assert.equal(src("D:\\w\\proj\\apps\\payments\\Pay.tsx"), null, "another drive is outside the root");
});

// ---- Portfolio-Site false positives: DS-A11Y-010, DS-ANIMATION-004, DS-SPACING-001, DS-A11Y-003 -----------

const imgHits = (code) => detectFile("a.tsx", code).filter((f) => f.ruleId === "DS-A11Y-010");

test("DS-A11Y-010 reads the whole <img> tag, so alt on another line counts", () => {
  for (const code of [
    "<img\n  src={cardLogo}\n  alt={`${entry.org} logo`}\n  className=\"timeline-card-logo\"\n  loading=\"lazy\"\n/>",
    '<img src={u} alt="" />',
    "<img\n  src={a}\n  alt=''\n/>",
    "<img src={a > b ? x : y}\n alt=\"logo\" />", // a ">" inside braces does not end the tag
    "<img src={u} alt={name} >", // not self-closing
  ]) assert.equal(imgHits(code).length, 0, code);
});

test("DS-A11Y-010 still flags an <img> with no alt, on one line or many", () => {
  assert.deepEqual(imgHits('<img src={u} />').map((f) => f.line), [1]);
  assert.deepEqual(imgHits("const a = 1;\n<img\n  src={u}\n  className=\"x\"\n/>").map((f) => f.line), [2], "reported at the tag's first line");
  assert.equal(imgHits("<img src={a > b ? x : y}\n className=\"x\" />").length, 1, "a > in braces does not hide the missing alt");
});

test("DS-A11Y-010 reads one <img> at a time", () => {
  // The old line check let the second tag's alt excuse the first.
  assert.equal(imgHits('<img src={a} /><img src={b} alt="" />').length, 1);
  assert.equal(imgHits('<img src={a} alt="" /><img src={b} />').length, 1);
  assert.equal(imgHits('<img src={a}\n/>\n<img src={b}\n alt="x" />').length, 1, "an alt on a later tag is not this tag's alt");
});

test("DS-A11Y-010 counts an attribute named alt, nothing that only contains it", () => {
  for (const code of [
    '<img src={u} data-alt="x" />',
    '<img src={u} className="alt=big" />',
    "<img src={u} title={`alt=${x}`} />",
    '<img src={u} aria-alt="x" />',
    "<img src={u} alt={undefined} />", // no value: alt is missing
    "<img src={u} alt={null} />",
    "<img src={u} alt />", // a bare attribute is alt={true}, not text
  ]) assert.equal(imgHits(code).length, 1, code);
});

test("DS-A11Y-010 does not read inside a prop spread, but an object spread in a value is not a prop spread", () => {
  for (const code of ["<img {...props} />", "<img src={u} {...rest} />", "<img\n  src={u}\n  {...imgProps}\n/>", "<img {...props} src={u} />"])
    assert.equal(imgHits(code).length, 0, code);
  for (const code of ["<img src={u} style={{ ...base }} />", "<img src={u} className={cn({ ...x })} />"])
    assert.equal(imgHits(code).length, 1, code);
});

const reducedMotionHits = (code, file = "a.tsx") => detectFile(file, code).filter((f) => f.ruleId === "DS-ANIMATION-004");

test("DS-ANIMATION-004: a useReducedMotion() call counts as reduced-motion handling", () => {
  for (const code of [
    "import { motion, useReducedMotion } from 'framer-motion';\nfunction A() { const r = useReducedMotion(); return <motion.div animate={{ x: r ? 0 : 10 }} />; }",
    'import { motion, useReducedMotion } from "motion/react";\nconst r = !!useReducedMotion();\n<motion.div />',
    "import * as m from 'motion/react';\nconst r = m.useReducedMotion ();\n<div style={{ transition: 'opacity 1s' }} />",
  ]) assert.equal(reducedMotionHits(code).length, 0, code);
});

test("DS-ANIMATION-004: importing useReducedMotion, or a lookalike name, is not handling", () => {
  const motion = "import { motion } from 'framer-motion';\n<motion.div />\n";
  for (const extra of [
    "import { useReducedMotion } from 'framer-motion';", // imported, never called
    "const r = useReducedMotionX();",
    "const r = myuseReducedMotion();",
    "const r = use_reduced_motion();",
    "const r = obj.useReducedMotionFlag;",
  ]) assert.equal(reducedMotionHits(motion + extra).length, 1, extra);
});

test("DS-ANIMATION-004: MotionConfig reducedMotion user or always counts, never does not", () => {
  const body = "<motion.div animate={{ x: 1 }} />";
  const cfg = (attr) => `import { motion, MotionConfig } from 'framer-motion';\nconst A = () => <MotionConfig ${attr}>${body}</MotionConfig>;`;
  for (const attr of ['reducedMotion="user"', "reducedMotion='always'", 'reducedMotion={"user"}', 'transition={t} reducedMotion="user"', "reducedMotion={mode}"])
    assert.equal(reducedMotionHits(cfg(attr)).length, 0, attr);
  for (const attr of ['reducedMotion="never"', "reducedMotion={'never'}", "transition={t}", 'data-reducedMotion="user"'])
    assert.equal(reducedMotionHits(cfg(attr)).length, 1, attr);
  // The prop only counts on MotionConfig.
  assert.equal(reducedMotionHits(`import { motion } from 'framer-motion';\n<div reducedMotion="user"><motion.div /></div>`).length, 1);
  assert.equal(reducedMotionHits(`import { motion } from 'framer-motion';\n<MotionConfigX reducedMotion="user"><motion.div /></MotionConfigX>`).length, 1);
});

test("DS-ANIMATION-004: a file with animation and nothing else is still flagged", () => {
  assert.equal(reducedMotionHits("import { motion } from 'framer-motion';\n<motion.div animate={{ x: 1 }} />").length, 1);
  assert.equal(reducedMotionHits(".a { transition: opacity 1s; }", "a.css").length, 1);
});

const spacingHits = (code, file = "a.tsx") => detectFile(file, code).filter((f) => f.ruleId === "DS-SPACING-001");

test("DS-SPACING-001 does not read a fraction under 1 as a length (React Flow fitView padding)", () => {
  for (const code of [
    "<ReactFlow fitView fitViewOptions={{ padding: 0.2 }} />",
    "if (rf) rf.fitView({ padding: 0.2, duration: readMotionMs('base') });",
    "const o = { padding: 0.5 };",
    "const o = { margin: 0.25, gap: 0.1 };",
    "const o = { padding: 0 };",
  ]) assert.equal(spacingHits(code).length, 0, code);
});

test("DS-SPACING-001 still flags a StyleX number that is a length off the scale", () => {
  for (const code of [
    "const s = stylex.create({ a: { padding: 11 } });",
    "const s = stylex.create({ a: { padding: 1.5 } });", // 1 and above is read as pixels
    "const s = stylex.create({ a: { padding: 1 } });",
    "const s = stylex.create({ a: { paddingTop: 2, margin: 12.5 } });",
    'const s = stylex.create({ a: { gap: "6px" } });',
  ]) assert.ok(spacingHits(code).length >= 1, code);
  assert.equal(spacingHits("const s = stylex.create({ a: { padding: 16, gap: 8 } });").length, 0);
});

const focusHits = (code, file = "a.css") => detectFile(file, code).filter((f) => f.ruleId === "DS-A11Y-003");
const gap6 = ["  a: 1;", "  b: 2;", "  c: 3;", "  d: 4;", "  e: 5;", "  f: 6;"].join("\n");

test("DS-A11Y-003 accepts a :focus-visible rule for the same selector, however far below", () => {
  for (const css of [
    `.stage {\n  outline: none;\n${gap6}\n}\n\n.stage:focus-visible {\n  box-shadow: inset 0 0 0 2px red;\n}`,
    `.stage:focus-visible { box-shadow: 0 0 0 2px red; }\n.x { y: 1; }\n.z { y: 1; }\n.stage {\n  outline: none;\n${gap6}\n}`, // above it
    `.btn:focus {\n  outline: none;\n${gap6}\n}\n.btn:focus-visible { outline: 2px solid red; }`, // :focus is the removed one
    `.stage {\n  outline: none;\n${gap6}\n}\n.other { a: 1; }\n.stage:focus-visible > span, .q { a: 1; }`, // a longer selector that starts with it
    `@media (min-width: 1px) {\n  .stage {\n    outline: none;\n${gap6}\n  }\n}\n.stage:focus-visible { a: 1; }`,
    `.a, .b {\n  outline: none;\n${gap6}\n}\n.a:focus-visible, .b:focus-visible { a: 1; }`,
    `.a, .b {\n  outline: none;\n${gap6}\n}\n.a:focus-visible { a: 1; }\n.b:focus-visible { a: 1; }`,
  ]) assert.equal(focusHits(css).length, 0, css);
});

test("DS-A11Y-003 accepts a nested :focus-visible in the same SCSS block, however far below", () => {
  const scss = `.stage {\n  outline: none;\n${gap6}\n  &:focus-visible {\n    box-shadow: 0 0 0 2px red;\n  }\n}`;
  assert.equal(focusHits(scss, "a.scss").length, 0);
});

test("DS-A11Y-003 reads braces past a comment when it finds the end of the rule", () => {
  const scss = `.stage {\n  outline: none;\n  /* } */\n${gap6}\n  &:focus-visible { a: 1; }\n}`;
  assert.equal(focusHits(scss, "a.scss").length, 0);
});

test("DS-A11Y-003 still flags an outline removed with no replacement for that selector", () => {
  for (const css of [
    `.stage {\n  outline: none;\n${gap6}\n}`,
    `.stage {\n  outline: none;\n${gap6}\n}\n.other:focus-visible { a: 1; }`, // another element's ring
    `.a {\n  outline: none;\n${gap6}\n}\n.ab:focus-visible { a: 1; }`, // the name only starts the same
    `.a {\n  outline: none;\n${gap6}\n}\n.a:focus-visible-ish { a: 1; }`,
    `.a:hover {\n  outline: none;\n${gap6}\n}\n.a:focus-visible { a: 1; }`, // a different state of it
    `.a, .b {\n  outline: none;\n${gap6}\n}\n.a:focus-visible { a: 1; }`, // one of the two has none
    `.a {\n  outline: none;\n${gap6}\n}\n/* .a:focus-visible { a: 1; } */`, // in a comment
    `.a {\n  outline: none;\n${gap6}\n}\n.a { content: ".a:focus-visible"; }`,
    `.a {\n  outline: none;\n${gap6}\n}\n.b .a:focus-visible { a: 1; }`, // a descendant selector is not the same element
  ]) assert.equal(focusHits(css).length, 1, css);
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n.a:focus-visible {}`.replace(".a:focus-visible {}", "")).length, 1);
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n.aaaaaaaaaaaaaaa .a:focus-visible { a: 1; }`).length, 1, "a descendant whose own selector is long enough to put a space where the boundary check looks");
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n/* old rule; .a:focus-visible { a: 1; } */`).length, 1, "a comment with a semicolon before the selector");
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n// old rule; .a:focus-visible { a: 1; }`, "a.scss").length, 1, "an SCSS line comment");
  assert.equal(focusHits(`@media print {\n  outline: none;\n${gap6}\n}\n.a:focus-visible { a: 1; }`).length, 1, "a declaration in an at-rule has no selector to pair");
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n  .child:focus-visible { a: 1; }\n}`, "a.scss").length, 1, "a nested rule for a child is not this element's ring");
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n.a:focus-visible { a: 1; }`, "a.tsx").length, 1, "CSS inside a .tsx file only gets the three-line check");
  // SCSS: a nested :focus-visible in another rule is not this rule's.
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n.b {\n  &:focus-visible { a: 1; }\n}`, "a.scss").length, 1);
});

test("DS-A11Y-003 keeps the three-line window for Tailwind and for a replacement next to the declaration", () => {
  assert.equal(focusHits('<button className="outline-none focus-visible:ring-2" />', "a.tsx").length, 0);
  assert.equal(focusHits(".a {\n  outline: none;\n}\n.a:focus-visible { x: 1; }").length, 0);
  assert.equal(focusHits(".a:focus-visible {\n  outline: none;\n  box-shadow: 0 0 0 2px red;\n}").length, 0, "the selector itself is :focus-visible");
  assert.equal(focusHits('<button className="outline-none" />', "a.tsx").length, 1);
});

// ---- Review findings on the 1.48.1 detectors ---------------------------------------------------------------

test("DS-A11Y-010 falls back to the line check for a tag it cannot read (over 3000 characters, or never closed)", () => {
  const big = "x".repeat(3500);
  assert.equal(imgHits(`<img src="data:${big}" />`).length, 1, "a long tag with no alt on its line is still flagged");
  assert.equal(imgHits(`<img src="data:${big}" alt="" />`).length, 0, "and alt on the same line still passes");
  assert.equal(imgHits("<img src={a\n").length, 1, "a tag that never closes");
  assert.equal(imgHits("<img src={a} alt=\"\"\n").length, 0);
});

test("DS-A11Y-010 reads past a // comment that holds an apostrophe or a brace", () => {
  assert.equal(imgHits("<img\n src={x // it's\n}\n alt=\"\" />").length, 0);
  assert.equal(imgHits("<img\n src={x // }\n}\n alt=\"\" />").length, 0);
  assert.equal(imgHits("<img\n src={x // it's\n}\n className=\"a\" />").length, 1, "still flagged when there is no alt");
  assert.equal(imgHits("<img src={`http://x.com/a.png`} />").length, 1, "// inside a string is not a comment");
  assert.equal(imgHits("<img src={a} alt={`http://x.com`} />").length, 0);
});

test("DS-ANIMATION-004: defining a function named useReducedMotion is not handling", () => {
  const motion = "import { motion } from 'framer-motion';\n<motion.div />\n";
  assert.equal(reducedMotionHits(motion + "export function useReducedMotion() { return false; }").length, 1);
  assert.equal(reducedMotionHits(motion + "export default function  useReducedMotion(){ return false; }").length, 1);
  assert.equal(reducedMotionHits(motion + "const r = useReducedMotion();").length, 0);
});

test("DS-A11Y-003 pairs a nested SCSS rule only with its own parent's rules", () => {
  const nested = (outlineRule, other) => `.a {\n  ${outlineRule} {\n    outline: none;\n${gap6}\n  }\n${other}\n}`;
  // Same parent: counts.
  assert.equal(focusHits(nested("&:focus", "  &:focus-visible { a: 1; }"), "a.scss").length, 0);
  assert.equal(focusHits(nested(".b", "  .b:focus-visible { a: 1; }"), "a.scss").length, 0);
  // Another parent's &:focus-visible, or a rule for a nested child, is not this rule's.
  assert.equal(focusHits(`.a {\n  &:focus {\n    outline: none;\n${gap6}\n  }\n}\n.b {\n  &:focus-visible { a: 1; }\n}`, "a.scss").length, 1);
  assert.equal(focusHits(`.card {\n  .x {\n    outline: none;\n${gap6}\n  }\n}\n.other {\n  .x:focus-visible { a: 1; }\n}`, "a.scss").length, 1);
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n  .b { &:focus-visible { a: 1; } }\n}`, "a.scss").length, 1, "a grandchild's &:focus-visible");
  // A top-level rule is not paired with a nested one of the same text.
  assert.equal(focusHits(`.x {\n  outline: none;\n${gap6}\n}\n.p {\n  .x:focus-visible { a: 1; }\n}`, "a.scss").length, 1);
  // At-rules are transparent.
  assert.equal(focusHits(`@media (min-width: 1px) {\n  .a {\n    outline: none;\n${gap6}\n  }\n}\n@media print {\n  .a:focus-visible { a: 1; }\n}`).length, 0);
});

test("DS-A11Y-003 does not read url(//host) in SCSS as a line comment", () => {
  const scss = `.a { background: url(//cdn.example.com/x.png); }\n.a {\n  outline: none;\n${gap6}\n}\n.a:focus-visible { a: 1; }`;
  assert.equal(focusHits(scss, "a.scss").length, 0, "the brace after the url stays");
  assert.equal(focusHits(`.a {\n  outline: none;\n${gap6}\n}\n// note; .a:focus-visible { a: 1; }`, "a.scss").length, 1, "a real line comment is still blanked");
});

// ---------------------------------------------------------------------------
// A broken team setup is reported with its real reason and never loosens a limit. The hook passes no onSkip
// and keeps going; the gate and the ESLint plugin pass one that throws.
// ---------------------------------------------------------------------------

const skips = (root) => {
  const out = [];
  loadTeams(root, (name, why) => out.push([name, why]));
  return out;
};
const sameLimit = restrictOverride(1, "DS-ANIMATION-001", "max_duration_ms", 200);

test("a team file with a wrong schema is reported once, with its own reason", () => {
  const cases = [
    [{ ...team("t", [sameLimit]), schema: "something-else" }, /not a vois-team-override\/1 file/],
    [{ ...team("t", [sameLimit]), team: 5 }, /not a vois-team-override\/1 file/],
    [{ schema: "vois-team-override/1", team: "t", overrides: "x" }, /not a vois-team-override\/1 file/],
    [{ ...team("t", [sameLimit]), scope: { paths: [] } }, /scope must be/],
    ["{ nope", /unreadable or invalid JSON/],
  ];
  for (const [body, want] of cases) {
    const got = skips(projectWith({ t: body }));
    assert.equal(got.length, 1, `${JSON.stringify(body)} is reported once, not twice`);
    assert.equal(got[0][0], "t.json");
    assert.match(got[0][1], want);
  }
});

test("an onSkip that throws keeps its own error: the JSON catch does not swallow it or call it again", () => {
  const root = projectWith({ t: { ...team("t", [sameLimit]), schema: "something-else" } });
  let calls = 0;
  assert.throws(() => loadTeams(root, (name, why) => { calls++; throw new Error(`stop: ${why}`); }), /stop: not a vois-team-override\/1 file/);
  assert.equal(calls, 1);
});

test("a team folder that cannot be read is reported, never read as 'no teams'", () => {
  const noTeams = mkdtempSync(join(tmpdir(), "vois-teams-"));
  assert.deepEqual(skips(noTeams), [], "no .vois folder at all is fine");
  mkdirSync(join(noTeams, ".vois"));
  assert.deepEqual(skips(noTeams), [], "no teams folder is fine");
  const asFile = mkdtempSync(join(tmpdir(), "vois-teams-"));
  mkdirSync(join(asFile, ".vois"));
  writeFileSync(join(asFile, ".vois", "teams"), "not a folder"); // readdir fails with ENOTDIR
  const got = skips(asFile);
  assert.equal(got.length, 1);
  assert.match(got[0][1], /cannot be read/);
  const dotFile = mkdtempSync(join(tmpdir(), "vois-teams-"));
  writeFileSync(join(dotFile, ".vois"), "not a folder"); // existsSync says no here, so a guard on it alone lets this through
  assert.equal(skips(dotFile).length, 1);
  const loop = mkdtempSync(join(tmpdir(), "vois-teams-"));
  mkdirSync(join(loop, ".vois"));
  symlinkSync("teams", join(loop, ".vois", "teams")); // a link that points at itself: ELOOP
  assert.equal(skips(loop).length, 1);
  assert.deepEqual(loadTeams(asFile), [], "with no onSkip it still returns [] and never throws");
});

test("an override with a mistyped op, rule or limit is reported; the team's other overrides still apply", () => {
  const good = restrictOverride(9, "DS-ANIMATION-001", "max_duration_ms", 200);
  const bad = [
    [{ ...good, op: "restrct" }, /override x-009.*op/],
    [{ ...good, op: "Restrict" }, /op/],
    [{ ...good, op: undefined }, /op/],
    [{ ...good, rule: "DS-ANIMATON-001" }, /override x-009.*DS-ANIMATON-001/],
    [{ ...good, rule: "ds-animation-001" }, /ds-animation-001/],
    [{ ...good, param: "max_duration" }, /override x-009.*max_duration/],
    [{ ...good, param: "min_start_scale" }, /min_start_scale/], // a real limit, but of another rule
    [{ ...good, rule: "constructor", param: "name" }, /constructor/], // inherited names are not limits
    [{ ...good, rule: "__proto__", param: "x" }, /__proto__/],
    [{ ...good, rule: undefined }, /rule/],
    [null, /override/],
    ["restrict", /override/],
    [[], /override/],
  ];
  for (const [override, want] of bad) {
    const root = projectWith({ t: team("t", [override, restrictOverride(2, "DS-ANIMATION-002", "max_duration_ms", 400)]) });
    const got = skips(root);
    assert.equal(got.length, 1, JSON.stringify(override));
    assert.match(got[0][1], want, JSON.stringify(override));
    const params = paramsFor(loadTeams(root), root, join(root, "a.tsx"));
    assert.equal(params.get("DS-ANIMATION-002", "max_duration_ms"), 400, "the good override on the same team still applies (the hook's behavior)");
    assert.doesNotThrow(() => params.get("DS-ANIMATION-001", "max_duration_ms"));
  }
});

test("an override that names a real limit the hook cannot check, an add rule, or a loosening value is not a typo", () => {
  const root = projectWith({
    t: team("t", [
      restrictOverride(1, "DS-TYPOGRAPHY-001", "max_text_styles", 2),
      restrictOverride(2, "JOB-DISPLAY-DATA", "table_max_rows", 10),
      { id: "t-003", op: "add", text: "No gradients.", reason: "Because." },
      { id: "t-004", op: "refine", rule: "DS-ICON-001", param: "stroke_width_px", value: 2, reason: "Because." },
    ]),
  });
  assert.deepEqual(skips(root), []);
});

test("every limit in vois-teams/data/ranges.json is either checked by the hook or known as unchecked", { skip: !existsSync(join(HERE, "..", "..", "vois-teams", "data", "ranges.json")) }, () => {
  const ranges = JSON.parse(readFileSync(join(HERE, "..", "..", "vois-teams", "data", "ranges.json"), "utf8")).ranges;
  const known = new Set([...Object.entries(TUNABLES).flatMap(([r, ps]) => Object.keys(ps).map((p) => `${r} ${p}`)), ...UNCHECKED_TUNABLES.map(([r, p]) => `${r} ${p}`)]);
  assert.deepEqual([...known].sort(), ranges.map((r) => `${r.rule} ${r.param}`).sort());
  for (const [r, p] of UNCHECKED_TUNABLES) assert.ok(!TUNABLES[r]?.[p], `${r} ${p} is checked, so it does not belong in UNCHECKED_TUNABLES`);
});

test("status lists a problem in an override next to the file's other lines", () => {
  const root = projectWith({ t: team("t", [{ ...sameLimit, op: "restrct" }]) });
  const cli = spawnSync(process.execPath, [join(HERE, "hook-admin.mjs"), "status"], { cwd: root, encoding: "utf8" });
  assert.match(cli.stdout, /t\.json: override x-001 ignored: op "restrct"/);
  const folder = mkdtempSync(join(tmpdir(), "vois-teams-"));
  mkdirSync(join(folder, ".vois"));
  writeFileSync(join(folder, ".vois", "teams"), "x");
  const cli2 = spawnSync(process.execPath, [join(HERE, "hook-admin.mjs"), "status"], { cwd: folder, encoding: "utf8" });
  assert.match(cli2.stdout, /\.vois\/teams.*cannot be read/);
});

// ---------------------------------------------------------------------------
// DS-TAILWIND-004 and comments
// ---------------------------------------------------------------------------

test("DS-TAILWIND-004 reads code, not comments", () => {
  const important = (src, file) => has(detectFile(file, src), "DS-TAILWIND-004");
  assert.equal(important("/* removed !important here */\n.a { color: red; }", "a.css").length, 0, "CSS block comment");
  assert.equal(important(".a { color: red; /* was !important */ }", "a.css").length, 0, "trailing CSS comment");
  assert.equal(important("/*\n * Why !important\n * was removed\n */\n.a { color: red; }", "a.css").length, 0, "multi-line comment");
  assert.equal(important("// no !important\n.a { color: red; }", "a.scss").length, 0, "SCSS line comment");
  assert.equal(important("// no !important\nconst a = 1;", "a.ts").length, 0, "code line comment");
  assert.equal(important("/* no !important */\nconst a = 1;", "a.ts").length, 0, "code block comment");
  assert.equal(important("export const A = () => <div>{/* !important */}</div>;", "a.tsx").length, 0, "JSX comment");
  // From the other side: real uses still count, on the right line, even next to a comment.
  assert.equal(important(".a { color: red !important; }", "a.css").length, 1);
  assert.equal(important("/* note */ .a { color: red !important; }", "a.css")[0].line, 1);
  assert.equal(important("/* why\nnot */\n.a { color: red !important; }", "a.css")[0].line, 3, "line numbers stay put");
  assert.equal(important('const a = "https://x.test"; const b = "!important";', "a.ts").length, 1, "a string is not a comment, and a // in a URL starts none");
  assert.equal(important('<div className="!p-4 text-sm" />', "a.tsx").length, 0, "Tailwind's important prefix is another syntax");
  assert.equal(important(".a { color: red !important; } /* ok */ .b { color: blue !important; }", "a.css").length, 2);
  assert.equal(important("/* unterminated !important\n.a { color: red; }", "a.css").length, 1, "an unterminated comment hides nothing it cannot prove is a comment");
});

test("no rule reads a comment: every fixture, wrapped whole in comments, gives no finding", () => {
  for (const f of ["bad.tsx", "bad.css", "bad-stylex.tsx", "adversarial.tsx", "adversarial.css"]) {
    const path = join(FIXTURES, f);
    const body = readFileSync(path, "utf8").replace(/\*\//g, "* /");
    assert.ok(detectFile(path, body).length > 0, `${f} has findings to hide`);
    const wrapped = [`/*\n${body}\n*/\n`];
    if (!f.endsWith(".css")) wrapped.push(body.split("\n").map((l) => `// ${l}`).join("\n"));
    for (const text of wrapped) assert.deepEqual(detectFile(path, text).map((x) => x.ruleId), [], `${f}: ${text.slice(0, 12).trim()}`);
  }
});

test("blanking comments keeps line numbers and snippets, and does not hide code next to a comment or a URL", () => {
  const css = "/* a\n b */\n.a { color: red !important; } /* c */\n.b { background: url(//cdn.test/x.png); color: blue !important; }";
  const hits = detectFile("a.scss", css).filter((x) => x.ruleId === "DS-TAILWIND-004");
  assert.deepEqual(hits.map((h) => h.line), [3, 4], "// inside url() is not a comment");
  assert.equal(hits[0].snippet, ".a { color: red !important; } /* c */", "the snippet is the line as written, comment included");
  const ts = 'const u = "https://x.test/a"; const c = "text-[#ff0000]"; // trailing note\n/* block */ const d = "bg-[#00ff00]";';
  assert.deepEqual(detectFile("a.tsx", ts).filter((x) => x.ruleId === "DS-COLOR-001").map((h) => h.line), [1, 2]);
});

test("the Cursor hook does not deny on !important in a comment, and still denies on the real thing", () => {
  const root = ignoringProject([]);
  const send = (content) => spawnSync(process.execPath, [join(HERE, "hook-before-edit.mjs")], { cwd: root, input: JSON.stringify({ tool_name: "Write", cwd: root, tool_input: { file_path: join(root, "src", "a.css"), content } }), encoding: "utf8" });
  assert.equal(send("/* why !important was removed */\n.a { color: red; }").status, 0);
  assert.equal(send("/* why */\n.a { color: red !important; }").status, 2);
});

test("blanking comments is linear, and a // or /* inside a string is not a comment", () => {
  const slow = (file, text) => { const t = Date.now(); detectFile(file, text); return Date.now() - t; };
  for (const file of ["a.css", "a.scss", "a.tsx"]) assert.ok(slow(file, " /*".repeat(40000)) < 1500, `${file}: many unterminated /* stay fast`);
  assert.ok(slow("a.tsx", "// x\n".repeat(300)) < 1500);
  assert.ok(slow("a.tsx", "'".repeat(40000)) < 1500);
  const hex = (src, file = "a.tsx") => has(detectFile(file, src), "DS-COLOR-001").length;
  assert.equal(hex('const a = "see // docs"; const b = <i className="text-[#ff0000]" />;'), 1, "// in a double-quoted string");
  assert.equal(hex("const a = 'a /* b'; const b = <i className=\"text-[#ff0000]\" />; /* c */"), 1, "/* in a string");
  assert.equal(hex("const a = `x // y`; const b = <i className=\"text-[#ff0000]\" />;"), 1, "// in a template literal");
  assert.equal(hex('const a = "say \\" // hi"; const b = <i className="text-[#ff0000]" />;'), 1, "an escaped quote does not end the string");
  assert.equal(hex('// it\'s a note\nconst b = <i className="text-[#ff0000]" />;'), 1, "an apostrophe in a comment starts no string");
  assert.equal(hex("/* don't */ const b = <i className=\"text-[#ff0000]\" />;"), 1);
  assert.equal(hex("const b = <i className=\"text-[#ff0000]\" />; // text-[#00ff00]"), 1, "the comment half of a line is still blanked");
  assert.equal(hex("// note /* not a block\nconst b = <i className=\"text-[#ff0000]\" />;\n/* real */"), 1, "a // comment that holds /* does not start a block");
  assert.equal(has(detectFile("a.css", '.a::after { content: "/* x */"; color: red !important; }'), "DS-TAILWIND-004").length, 1, "a CSS string is not a comment");
});

test("a quote inside a regex literal opens no string, so the comment after it is still a comment", () => {
  const important = (src, file = "a.ts") => has(detectFile(file, src), "DS-TAILWIND-004").length;
  assert.equal(important('s.replace(/["\']/g, ""); // removed !important'), 0, "the public review's input");
  assert.equal(important("const r = /'/; // was !important"), 0, "after =");
  assert.equal(important('if (/"/.test(s)) x(); // !important'), 0, "after (");
  assert.equal(important("const f = (s) => /[\"/]/.test(s); // !important"), 0, "after =>, with / inside a class");
  assert.equal(important("function f() { return /'/g; } // !important"), 0, "after return");
  assert.equal(important("const r = /\\/'/; // !important"), 0, "an escaped / does not end the literal");
  // From the other side: a / that divides starts no regex, and real code after a regex still counts.
  assert.equal(important('const a = b / c; const d = "x"; const e = "!important";'), 1, "division");
  assert.equal(important("const a = (b) / 2; // it's /fine/ !important"), 0, "a // after a division is still a comment");
  assert.equal(important('const r = /a/; const s = "!important";'), 1, "a string after a regex");
  assert.equal(important('const r = /\'/; const s = "!important";'), 1, "a quote in a regex does not swallow the next string's start");
  assert.equal(important('<a>y</a>; const s = "/"; // !important', "a.tsx"), 0, "a JSX closing tag is not a regex");
  assert.equal(important('<p>{a}/{b}</p>; const s = "/"; // !important', "a.tsx"), 0, "{a}/{b} in JSX text is not a regex");
  assert.equal(important(".a { content: '/'; color: red !important; }", "a.css"), 1, "CSS has no regex literals");
  // An operand that ends in a postfix operator, a self-closing JSX tag, or a property named like a keyword.
  assert.equal(important("const r = total! / count; // !important"), 0, "non-null ! then a division");
  assert.equal(important("const r = f()! / count; // !important"), 0, "non-null ! after a call");
  assert.equal(important("const r = i++ / count; // !important"), 0, "postfix ++ then a division");
  assert.equal(important("const r = i-- / 2; // !important"), 0, "postfix -- then a division");
  assert.equal(important("const w = <Fade in />; // !important", "a.tsx"), 0, "a self-closing tag after an attribute named like a keyword");
  assert.equal(important("const r = x.of / 2; // it's !important"), 0, "a property named like a keyword");
  assert.equal(has(detectFile("a.ts", "const a = x.y!/2; // transform: scale(0)"), "DS-ANIMATION-005").length, 0, "a comment the hook would block on");
  assert.equal(important("if (!/'/.test(s)) x(); // !important"), 0, "a prefix ! still starts a regex");
  assert.equal(important("const t = !!/'/.test(s); // !important"), 0, "!! still starts a regex");
  assert.equal(important("const r = a + /'/.source; // !important"), 0, "a binary + still starts a regex");
  const slow = (text) => { const t = Date.now(); detectFile("a.tsx", text); return Date.now() - t; };
  assert.ok(slow("(/[".repeat(40000)) < 1500, "many unclosed regex starts on one line stay fast");
  assert.ok(slow("x = /a/; ".repeat(20000)) < 1500);
});

test("a team folder that is a dangling link is reported, as a missing folder is not", () => {
  const root = mkdtempSync(join(tmpdir(), "vois-teams-"));
  mkdirSync(join(root, ".vois"));
  symlinkSync(join(root, "gone"), join(root, ".vois", "teams"));
  const got = skips(root);
  assert.equal(got.length, 1);
  assert.match(got[0][1], /cannot be read/);
});

test("the glass checks stay fast on a long run of whitespace, and read the same code as before", () => {
  const slow = (file, text) => { const t = Date.now(); detectFile(file, text); return Date.now() - t; };
  for (const file of ["a.css", "a.tsx"]) {
    assert.ok(slow(file, "     \n".repeat(12000)) < 1500, `${file}: blank lines`);
    assert.ok(slow(file, "     \n".repeat(30000)) < 1500, `${file}: 30,000 blank lines`);
    assert.ok(slow(file, " ".repeat(200000)) < 1500, `${file}: one long run of spaces`);
    assert.ok(slow(file, `{${" ".repeat(100000)}`) < 1500, `${file}: a brace and then spaces`);
    assert.ok(slow(file, `(${" ".repeat(100000)}`) < 1500, `${file}: a paren and then spaces`);
  }
  // The lookbehinds still decide what counts, with whitespace between the opener and the key.
  const g3 = (file, src) => has(detectFile(file, src), "DS-GLASS-003").length;
  assert.equal(g3("a.css", ".a {\n   \n   backdrop-filter: blur(var(--glass-blur-standard));\n}"), 1, "declaration after blank lines");
  assert.equal(g3("a.css", "@supports ( \n backdrop-filter: blur(1px)) { .a { x: y; } }"), 0, "a test inside parentheses is not a declaration");
  assert.equal(g3("a.tsx", "const s = {\n   \n   backdropFilter: 'blur(var(--glass-blur-standard))' };"), 1, "key after blank lines");
  assert.equal(g3("a.tsx", "const s = { backdropFilter: 'blur(var(--glass-blur-standard))', WebkitBackdropFilter: 'blur(var(--glass-blur-standard))' };"), 0, "a twin in the same object");
  assert.equal(g3("a.tsx", "const x = cond ? backdropFilter : y;"), 0, "a ternary is not a key");
  assert.equal(has(detectFile("a.tsx", "const s = {\n  \n transition: 'backdrop-filter 200ms' };"), "DS-GLASS-005").length, 1, "a transition key after blank lines");
});

test("a value a team may not set is reported on every limit the hook checks; a value it may set is not", () => {
  const bad = {
    "DS-ANIMATION-001 max_duration_ms": [400, 301, 99, 50, 0, -1, "200", null, true, [200], {}],
    "DS-ANIMATION-002 max_duration_ms": [600, 501, 199, "400", null],
    "DS-ANIMATION-005 min_start_scale": [0.89, 0.5, 0, 1.01, 2, "0.95", null],
    "DS-ANIMATION-008 min_press_scale": [0.94, 0.5, 1.01, "0.97", null],
    "DS-CSS-003 max_selector_nesting": [3, 5, 0, 0.5, "1", null],
    "DS-ICON-001 stroke_width_px": [0.5, 2.5, 0, "1.5", null],
    "DS-ICON-002 icon_sizes_px": [[12, 16], [16, 20, 24, 32, 48], [], [16, 16], [16, "20"], "16", 16, null, [64], [16, null]],
    "DS-SPACING-001 spacing_divisors": [[4, 8, 16], [3], [], [4, 4], [2, 4], "8", 8, null],
  };
  const good = {
    "DS-ANIMATION-001 max_duration_ms": [100, 200, 300],
    "DS-ANIMATION-002 max_duration_ms": [200, 400, 500],
    "DS-ANIMATION-005 min_start_scale": [0.9, 0.95, 1],
    "DS-ANIMATION-008 min_press_scale": [0.95, 0.97, 1],
    "DS-CSS-003 max_selector_nesting": [1, 2],
    "DS-ICON-001 stroke_width_px": [1, 1.5, 2],
    "DS-ICON-002 icon_sizes_px": [[16], [24, 16], [16, 20, 24, 32]],
    "DS-SPACING-001 spacing_divisors": [[4], [8], [8, 4], [4, 8]],
  };
  assert.deepEqual(Object.keys(bad).sort(), Object.entries(TUNABLES).flatMap(([r, ps]) => Object.keys(ps).map((p) => `${r} ${p}`)).sort(), "every checked limit has a case");
  for (const [key, values] of Object.entries(bad)) {
    const [rule, param] = key.split(" ");
    for (const value of values) {
      const root = projectWith({ t: team("t", [restrictOverride(1, rule, param, value), restrictOverride(2, "DS-ANIMATION-001", "max_duration_ms", 250)]) });
      const got = skips(root).filter(([, why]) => /override x-001/.test(why));
      assert.equal(got.length, 1, `${key} = ${JSON.stringify(value)} is reported`);
      assert.match(got[0][1], new RegExp(`${rule} ${param}`));
      assert.match(got[0][1], /is not a value a team may set/);
      // The hook (no onSkip) still ignores the value and keeps the team's other limits.
      const params = paramsFor(loadTeams(root), root, join(root, "a.tsx"));
      assert.equal(params.get("DS-ANIMATION-001", "max_duration_ms"), 250, "the good override on the same team still applies");
      assert.equal(params.source(rule, param), rule === "DS-ANIMATION-001" ? "t" : null, key);
    }
  }
  for (const [key, values] of Object.entries(good)) {
    const [rule, param] = key.split(" ");
    for (const value of values) {
      const root = projectWith({ t: team("t", [restrictOverride(1, rule, param, value)]) });
      assert.deepEqual(skips(root), [], `${key} = ${JSON.stringify(value)} is allowed`);
    }
  }
});

test("the avatar-import exemption still reads a BOM and any indentation, and does not scan blank lines", () => {
  const box = 'export const A = () => <div className="size-8 rounded-full"><img src={u} /></div>;';
  const hits = (src) => has(detectFile("a.tsx", src), "LOOKALIKE-012").length;
  assert.equal(hits(`﻿import { Avatar } from "x";\n${box}`), 0, "a BOM before the import");
  assert.equal(hits(`\n\f  import { Avatar } from "x";\n${box}`), 0, "a form feed and spaces before the import");
  assert.equal(hits(`\timport { Avatar } from "x";\n${box}`), 0);
  assert.equal(hits(`// import { Avatar }\n${box}`), 1, "a commented import does not count");
  assert.equal(hits(box), 1);
});

test("a long chain of variant prefixes is read in linear time, and a variant still counts", () => {
  const t = (id, src) => { const rule = RULES.find((r) => r.id === id); const a = Date.now(); rule.check({ content: src, lines: src.split("\n"), filePath: "a.tsx" }); return Date.now() - a; };
  for (const id of ["DS-GLASS-003", "DS-GLASS-004", "DS-GLASS-005"]) {
    assert.ok(t(id, "a:".repeat(50000)) < 1500, `${id}: a chain in code`);
    assert.ok(t(id, `"${"a:".repeat(50000)}"`) < 1500, `${id}: a chain in a string`);
  }
  const g5 = (src) => has(detectFile("a.tsx", src), "DS-GLASS-005").length;
  assert.equal(g5('<div className="transition-[backdrop-filter]" />'), 1);
  assert.equal(g5('<div className="md:hover:transition-[opacity,backdrop-filter]" />'), 1, "with variants");
  assert.equal(g5('<div className="my-transition-[backdrop-filter]" />'), 0, "not inside a longer word");
  assert.equal(g5('<div className="transition-[opacity]" />'), 0);
  const g4 = (src) => has(detectFile("a.tsx", src), "DS-GLASS-004").length;
  assert.equal(g4('<div className="md:[&>*]:backdrop-blur-md" />'), 1, "a variant chain in front of a literal blur");
  assert.equal(g4('<div className="supports-[backdrop-filter]:md:backdrop-blur-[12px]" />'), 1);
  assert.equal(g4('<div className="my-backdrop-blur-md" />'), 0, "not inside a longer word");
  assert.equal(g4('<div className="md:backdrop-blur-(--glass-blur-standard)" />'), 0, "a token passes");
});

test("an out-of-range value is cut short in the message", () => {
  const root = projectWith({ t: team("t", [restrictOverride(1, "DS-ICON-002", "icon_sizes_px", "x".repeat(5000))]) });
  const got = skips(root);
  assert.equal(got.length, 1);
  assert.ok(got[0][1].length < 400, `${got[0][1].length} characters`);
  assert.match(got[0][1], /xxx…/);
});

// ---------------------------------------------------------------------------
// DS-GLASS-003 and DS-ELEVATION-007 in linear time
// ---------------------------------------------------------------------------

const ruleTime = (id, file, src) => {
  const rule = RULES.find((r) => r.id === id);
  const a = Date.now();
  rule.check({ content: src, lines: src.split("\n"), filePath: file });
  return Date.now() - a;
};

test("DS-GLASS-003 is linear in the number of declarations in one block, and in nesting depth", () => {
  const decl = "backdrop-filter: blur(var(--glass-blur-standard));\n";
  const twin = "-webkit-backdrop-filter: blur(var(--glass-blur-standard));\n";
  const fast = (what, file, src) => assert.ok(ruleTime("DS-GLASS-003", file, src) < 1500, what);
  fast("3,000 declarations with no twin, one CSS rule", "a.css", `.a{${decl.repeat(3000)}}`);
  fast("3,000 declarations, each with a twin", "a.css", `.a{${(decl + twin).repeat(3000)}}`);
  fast("3,000 keys in one object", "a.tsx", `const s={${"backdropFilter: 'blur(var(--glass-blur-standard))',\n".repeat(3000)}}`);
  fast("3,000 separate rules", "a.css", `${`.a{${decl}}\n`.repeat(3000)}`);
  fast("20,000 nested blocks and one declaration", "a.css", `${".a{".repeat(20000)}${decl}${"}".repeat(20000)}`);
  fast("20,000 unclosed blocks", "a.css", `${".a{".repeat(20000)}${decl}`);
  fast("20,000 stray closers", "a.css", `${"}".repeat(20000)}.a{${decl}}`);
  // The number of findings is right too.
  assert.equal(has(detectFile("a.css", `.a{${decl.repeat(3000)}}`), "DS-GLASS-003").length, 3000);
  assert.equal(has(detectFile("a.css", `.a{${(decl + twin).repeat(3000)}}`), "DS-GLASS-003").length, 0);
});

test("DS-GLASS-003 and -005 read the same code as the 1.48.3 version, on random files", async () => {
  const ref = await import("./__fixtures__/glass-reference.mjs");
  const now = await import("./glass-checks.mjs");
  const pieces = [
    "{", "}", "{ ", " }", ".a {", ".b{", "\n", " ", "  ", ";", ",", "(", ")", "@supports (", "@media (min-width: 1px) {", "a", "x: y;",
    "backdrop-filter: blur(1px);", "backdrop-filter: blur(2px);", "-webkit-backdrop-filter: blur(1px);", "-webkit-backdrop-filter: blur(2px);",
    "backdrop-filter:blur(1px)", "BACKDROP-FILTER: none;",
    "backdropFilter: 'blur(1px)',", "WebkitBackdropFilter: 'blur(1px)',", "WebkitBackdropFilter: 'blur(2px)',", "\"backdrop-filter\": \"blur(1px)\",",
    "animate={{", "initial={{", "whileHover={{", "style={{", "exit: {", "transition: 'backdrop-filter 1s'", "transitionProperty: \"backdrop-filter\",", "@keyframes k {", "@-webkit-keyframes k {",
    "el.style.backdropFilter = 'blur(1px)';", "el.style.webkitBackdropFilter = 'blur(1px)';", "cond ? backdropFilter : x", "'", "\"", "`", "${", "// c\n", "/* c */",
  ];
  let seed = 12345;
  const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const show = (fs) => fs.map((f) => `${f.line}: ${f.message}`);
  for (let n = 0; n < 1500; n++) {
    let src = "";
    for (let k = Math.floor(rand() * 40); k >= 0; k--) src += pieces[Math.floor(rand() * pieces.length)];
    for (const file of ["a.css", "a.scss", "a.tsx"]) {
      const lines = src.split("\n");
      const args = { content: src, lines, filePath: file };
      for (const fn of ["missingWebkitTwin", "animatedGlassBlur"]) assert.deepEqual(show(now[fn](args)), show(ref[fn](args)), `${fn} ${file}: ${JSON.stringify(src)}`);
    }
  }
});

test("DS-ELEVATION-007 is linear on a long chain of variant prefixes, and reads the same classes", () => {
  assert.ok(ruleTime("DS-ELEVATION-007", "a.tsx", "a:".repeat(50000)) < 1500, "a chain in code");
  assert.ok(ruleTime("DS-ELEVATION-007", "a.tsx", `"${"a:".repeat(50000)}"`) < 1500, "a chain in a string");
  assert.ok(ruleTime("DS-ELEVATION-007", "a.css", `.a{@apply ${"a:".repeat(50000)}}`) < 1500, "a chain in @apply");
  assert.ok(ruleTime("DS-ELEVATION-007", "a.tsx", `"${"a:".repeat(50000)}shadow-md"`) < 1500, "a chain, then a class");
  const e7 = (src) => has(detectFile("a.tsx", src), "DS-ELEVATION-007").map((f) => f.message.split(" ")[0]);
  assert.deepEqual(e7('<i className="shadow-md" />'), ["shadow-md"]);
  assert.deepEqual(e7('<i className="md:hover:shadow-lg" />'), ["shadow-lg"], "with variants");
  assert.deepEqual(e7('<i className="dark:inset-shadow-sm" />'), ["inset-shadow-sm"]);
  assert.deepEqual(e7('<i className="[&>*]:supports-[x]:shadow-xl" />'), ["shadow-xl"]);
  assert.deepEqual(e7('<i className="my-shadow-md shadow-mdx" />'), [], "not inside a longer word");
  assert.deepEqual(e7('<i className="shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />'), ["shadow-[...]"], "an arbitrary blur");
  assert.deepEqual(e7('<i className="md:hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />'), ["shadow-[...]"], "an arbitrary blur with variants");
  assert.deepEqual(e7('<i className="my-shadow-[0_4px_12px_red]" />'), [], "an arbitrary blur inside a longer word");
});

test("lineAt gives the line of an index as slice-and-split did, for any index, and stays fast for many findings", async () => {
  const { lineAt } = await import("./check-utils.mjs");
  const old = (text, index) => text.slice(0, index).split("\n").length;
  let seed = 99;
  const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let n = 0; n < 300; n++) {
    let text = "";
    for (let k = Math.floor(rand() * 30); k > 0; k--) text += ["a", "\n", "\n\n", " bc ", "\r\n", ""][Math.floor(rand() * 6)];
    for (let i = -2; i <= text.length + 2; i++) assert.equal(lineAt(text, i), old(text, i), `${JSON.stringify(text)} at ${i}`);
    assert.equal(lineAt(text, NaN), old(text, NaN));
    assert.equal(lineAt(text, undefined), old(text, undefined));
  }
  // Two files in turn, then back: the cache follows the text it is given.
  const a = "x\ny\nz", b = "p\nq";
  assert.deepEqual([lineAt(a, 4), lineAt(b, 2), lineAt(a, 4), lineAt(b, 3)], [old(a, 4), old(b, 2), old(a, 4), old(b, 3)]);
  const d = "backdrop-filter: blur(var(--glass-blur-standard));\n";
  assert.ok(ruleTime("DS-GLASS-003", "a.css", `.a{${d.repeat(30000)}}`) < 2500, "30,000 findings from one check");
  assert.ok(ruleTime("DS-GLASS-004", "a.css", `.a{${d.replace("var(--glass-blur-standard)", "12px").repeat(30000)}}`) < 2500, "30,000 findings from another");
  assert.ok(ruleTime("DS-COLOR-001", "a.tsx", '<i className="text-[#ff0000]" />\n'.repeat(30000)) < 2500, "30,000 findings from a rule in registry.mjs");
});

test("DS-GLASS-003 blockMap: a parent that never closes, with a child that never closes, owns no text after the child", async () => {
  const ref = await import("./__fixtures__/glass-reference.mjs");
  const now = await import("./glass-checks.mjs");
  const show = (fs) => fs.map((f) => `${f.line}: ${f.message}`);
  for (const src of [
    "{BACKDROP-FILTER: none;${-webkit-backdrop-filter: blur(2px);",
    ".a{backdrop-filter: blur(1px); .b{ -webkit-backdrop-filter: blur(1px);",
    ".a{ .b{ x:y } -webkit-backdrop-filter: blur(1px); } backdrop-filter: blur(1px);",
    ".a{ .b{ x:y } } } } backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px);",
    "} backdrop-filter: blur(1px); { -webkit-backdrop-filter: blur(2px); }",
  ]) for (const file of ["a.css", "a.tsx"]) {
    const args = { content: src, lines: src.split("\n"), filePath: file };
    assert.deepEqual(show(now.missingWebkitTwin(args)), show(ref.missingWebkitTwin(args)), `${file}: ${src}`);
  }
  const args = { content: "{BACKDROP-FILTER: none;${-webkit-backdrop-filter: blur(2px);", lines: ["{BACKDROP-FILTER: none;${-webkit-backdrop-filter: blur(2px);"], filePath: "a.css" };
  assert.match(now.missingWebkitTwin(args)[0].message, /no -webkit-backdrop-filter in the same rule/, "the twin is in the child, not in the parent's own text");
});

test("DS-GLASS-005 reads @keyframes in linear time, and finds a backdrop-filter in a nested block", () => {
  const fast = (what, src) => assert.ok(ruleTime("DS-GLASS-005", "a.css", src) < 1500, what);
  fast("20,000 keyframes in a row", "@keyframes k{ a{x:y} }\n".repeat(20000));
  fast("5,000 keyframes nested", `${"@keyframes k{".repeat(5000)}${"}".repeat(5000)}`);
  fast("20,000 keyframes nested", `${"@keyframes k{".repeat(20000)}${"}".repeat(20000)}`);
  fast("20,000 keyframes nested, each holding a declaration", `${"@keyframes k{ backdrop-filter: blur(1px);".repeat(20000)}${"}".repeat(20000)}`);
  fast("20,000 keyframes nested, closed, with a declaration", `${"@keyframes k{".repeat(20000)}backdrop-filter: blur(1px);${"}".repeat(20000)}`);
  fast("20,000 keyframes that never close", "@keyframes k{ a{x:y}\n".repeat(20000));
  fast("20,000 keyframes that never close, each with a declaration", "@keyframes k{ backdrop-filter: blur(1px);\n".repeat(20000));
  fast("one keyframes block and 20,000 declarations", `@keyframes k{${"backdrop-filter: blur(1px);".repeat(20000)}}`);
  const k = (src) => has(detectFile("a.css", src), "DS-GLASS-005").length;
  assert.equal(k("@keyframes k{ from{ backdrop-filter: blur(0) } to{ backdrop-filter: blur(8px) } }"), 1, "one finding per keyframes block");
  assert.equal(k("@keyframes k{ from{ opacity: 0 } to{ opacity: 1 } }"), 0);
  assert.equal(k("@keyframes k{ from{ opacity: 0 } } .a{ backdrop-filter: blur(1px) }"), 0, "a declaration after the block does not count");
  assert.equal(k(".a{ backdrop-filter: blur(1px) } @keyframes k{ from{ opacity: 0 } }"), 0, "nor one before it");
  assert.equal(k("@keyframes a{ from{ opacity: 0 } } @keyframes b{ to{ -webkit-backdrop-filter: blur(2px) } }"), 1, "the second block only");
  assert.equal(k("@-webkit-keyframes k{ 50%{ -webkit-backdrop-filter : blur(2px) } }"), 1, "prefixed, with a space before the colon");
  assert.equal(k("@keyframes outer{ @keyframes inner{ x:y } to{ backdrop-filter: blur(2px) } }"), 1, "the outer block holds the declaration; the inner one does not");
  assert.equal(k("@keyframes outer{ @keyframes inner{ to{ backdrop-filter: blur(2px) } } }"), 2, "a declaration in the inner block is in the outer block too");
  assert.equal(k("@keyframes k{ from{ my-backdrop-filter: x } }"), 0, "not inside a longer name");
  assert.equal(k("@keyframes k{ from{ backdrop-filter"), 0, "a name with no colon");
});

test("the glass Tailwind patterns read an unclosed bracket in linear time, and still read a closed one", () => {
  const fast = (id, file, src, what) => assert.ok(ruleTime(id, file, src) < 1500, `${id}: ${what}`);
  for (const [what, src] of [["unclosed transition-[", "transition-[".repeat(30000)], ["unclosed transition-[ in a string", `"${"transition-[".repeat(30000)}"`],
    ["unclosed with a variant", "md:transition-[".repeat(30000)], ["unclosed with spaces", "transition-[ ".repeat(30000)]]) fast("DS-GLASS-005", "a.tsx", src, what);
  for (const [what, src] of [["unclosed backdrop-blur-[ in a string", `"${"backdrop-blur-[".repeat(30000)}"`], ["unclosed backdrop-blur-[ in @apply", `@apply ${"backdrop-blur-[".repeat(30000)};`]]) fast("DS-GLASS-004", what.includes("@apply") ? "a.css" : "a.tsx", src, what);
  const g5 = (src) => has(detectFile("a.tsx", src), "DS-GLASS-005").length;
  assert.equal(g5('<i className="transition-[backdrop-filter]" />'), 1);
  assert.equal(g5('<i className="transition-[opacity,backdrop-filter,transform]" />'), 1);
  assert.equal(g5('<i className="transition-[opacity" />'), 0, "an unclosed one reads nothing");
  assert.equal(g5(`<i className="transition-[${"a,".repeat(200)}backdrop-filter]" />`), 1, "a long list, 400 characters");
  const g4 = (src) => has(detectFile("a.tsx", src), "DS-GLASS-004").length;
  assert.equal(g4('<i className="backdrop-blur-[12px]" />'), 1);
  assert.equal(g4('<i className="backdrop-blur-[var(--glass-blur-standard)]" />'), 0);
  assert.equal(g4('<i className="backdrop-blur-[12px" />'), 0, "an unclosed one reads nothing");
});

test("the glass and elevation checks stay fast on thousands of repeats of text that opens a scan and never closes it", () => {
  const tokens = ["transition-[", "backdrop-blur-[", "shadow-[", "inset-shadow-[", "backdrop-filter: ", "-webkit-backdrop-filter:", "backdropFilter: ", "box-shadow: ", "boxShadow: ",
    "@keyframes k{", "@apply ", "{", "(", "a:", " ", "\n", "[", "animate={{", "style={{"];
  const ids = ["DS-GLASS-003", "DS-GLASS-004", "DS-GLASS-005", "DS-ELEVATION-007"];
  for (const token of tokens) {
    for (const [file, src] of [["a.tsx", token.repeat(10000)], ["a.css", token.repeat(10000)], ["a.tsx", `"${token.repeat(10000)}"`]]) {
      for (const id of ids) assert.ok(ruleTime(id, file, src) < 1500, `${id} on ${JSON.stringify(token)} x 10,000 (${file})`);
    }
  }
});

// --- Hook state and config that have the wrong shape ---

/** A project whose `.vois/<name>` holds `text`, and a file that trips DS-COLOR-001 and DS-TAILWIND-004. */
function hookProject(files) {
  const root = ignoringProject([]);
  rmSync(join(root, ".vois", "config.json"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(root, ".vois", name), text);
  return root;
}

test("a hook-cache.json of the wrong shape resets instead of crashing either hook", () => {
  for (const text of ["{}", "null", "[]", '"x"', "5", '{"files":[]}', '{"files":{"FILE":5}}', '{"files":{"FILE":{"editCount":"a","seenKeys":3}}}', '{"files":{},"blockCounts":"x"}', '{"files":{},"blockCounts":[1]}']) {
    const root = hookProject({});
    const file = join(root, "src", "legacy", "a.tsx");
    writeFileSync(join(root, ".vois", "hook-cache.json"), text.replace("FILE", file.replace(/\\/g, "\\\\")));
    const after = afterEdit(root, file);
    assert.equal(after.status, 0, `hook.mjs with ${text}: ${after.stderr}`);
    assert.match(after.stdout, /DS-COLOR-001/, `hook.mjs still reports with ${text}`);
    assert.equal(after.stderr, "", `hook.mjs did not fall back to the catch with ${text}`);
    const before = beforeEdit(root, file);
    assert.equal(before.status, 2, `hook-before-edit.mjs still denies with ${text}: ${before.stderr}`);
  }
});

test("a config.json or config.local.json of the wrong shape is read as no waivers, not as a crash", () => {
  for (const text of ["null", "[]", '"x"', "5", '{"ignoredRules":null,"ignoredFiles":null,"ignoredValues":null}', '{"ignoredValues":{"DS-COLOR-001":null}}', '{"ignoredValues":[["DS-COLOR-001","#"]]}']) {
    for (const name of ["config.json", "config.local.json"]) {
      const root = hookProject({ [name]: text });
      const file = join(root, "src", "legacy", "a.tsx");
      const after = afterEdit(root, file);
      assert.equal(after.status, 0, `${name} = ${text}: ${after.stderr}`);
      assert.match(after.stdout, /DS-COLOR-001/, `${name} = ${text} waives nothing`);
      assert.equal(beforeEdit(root, file).status, 2, `${name} = ${text}: the Cursor hook still denies`);
    }
  }
});

test("a waiver of the wrong type never widens: a string ignoredRules is not a substring match", () => {
  const root = hookProject({ "config.json": JSON.stringify({ ignoredRules: "DS-COLOR-001 DS-TAILWIND-004", ignoredFiles: "src" }) });
  const file = join(root, "src", "legacy", "a.tsx");
  assert.match(afterEdit(root, file).stdout, /DS-COLOR-001/);
  assert.equal(beforeEdit(root, file).status, 2);
});

test("the hook waives exactly what the CI gate waives, for every config the gate accepts", async () => {
  const { loadWaivers, waived } = await import("./check.mjs");
  const { loadConfig, filterFindings } = await import("./hook-lib.mjs");
  const line = 'export const A = () => <div className="text-[#ff0000]" />;';
  const configs = [
    {},
    { ignoredRules: ["DS-COLOR-001"] },
    { ignoredRules: ["DS-COLOR"] },
    { ignoredFiles: ["src/legacy/**"] },
    { ignoredFiles: ["src/other/**"] },
    { ignoredValues: { "DS-COLOR-001": ["#ff0000"] } },
    { ignoredValues: { "DS-COLOR-001": ["#00ff00"] } },
    { ignoredValues: { "DS-COLOR-001": ["token"] } }, // in the message, not in the line
    { ignoredValues: { "DS-COLOR-001": ["Hardcoded"] } },
    { ignoredValues: { "DS-COLOR-002": ["#ff0000"] } },
  ];
  for (const config of configs) {
    const root = hookProject({ "config.json": JSON.stringify(config) });
    const file = join(root, "src", "legacy", "a.tsx");
    const findings = detectFile(file, line + "\n");
    const hook = filterFindings(loadConfig(root), findings, root).map((f) => f.ruleId);
    const gate = findings.filter((f) => !waived(loadWaivers(root), { ...f, file: "src/legacy/a.tsx", text: line }, root)).map((f) => f.ruleId);
    assert.deepEqual(hook, gate, JSON.stringify(config));
  }
});

test("an empty waiver value, which the gate rejects, waives nothing in the hook", () => {
  for (const config of [{ ignoredValues: { "DS-COLOR-001": [""] } }, { ignoredFiles: [""] }, { ignoredRules: [""] }]) {
    const root = hookProject({ "config.json": JSON.stringify(config) });
    const file = join(root, "src", "legacy", "a.tsx");
    assert.match(afterEdit(root, file).stdout, /DS-COLOR-001/, JSON.stringify(config));
  }
});

test("a block count that is not a non-negative integer never downgrades a blocking finding", async () => {
  const { isDowngraded, bumpBlockCount } = await import("./hook-lib.mjs");
  for (const bad of ["9", 9.5, -4, null, true, [5], { n: 5 }, Infinity]) {
    const cache = { files: {}, blockCounts: { "a.tsx::DS-X": bad } };
    assert.equal(isDowngraded(cache, "a.tsx", "DS-X"), false, JSON.stringify(bad));
    assert.equal(bumpBlockCount(cache, "a.tsx", "DS-X"), 1, JSON.stringify(bad));
  }
  const cache = { files: {}, blockCounts: {} };
  for (let n = 1; n <= 3; n++) assert.equal(bumpBlockCount(cache, "a.tsx", "DS-X"), n);
  assert.equal(isDowngraded(cache, "a.tsx", "DS-X"), true, "three real blocks still downgrade");
});
