// Run with: node dataviz.test.mjs
// No new dependency: uses Node's built-in test runner.
// Covers the detector, the spec checker, and the integrity of the data files
// the scripts and the docs are generated from.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectFile } from "./detect.mjs";
import { checkSpec, formsForJob } from "./check-spec.mjs";
import { SKILL_ROOT, formIndex, loadData, ruleIndex } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "__fixtures__");
// Fixtures are read from disk but reported under a virtual src/ path, because
// the inline-data detector deliberately skips anything under __fixtures__.
const findingsFor = (file) => detectFile(`src/components/${file}`, readFileSync(join(FIXTURES, file), "utf8"));

const bad = findingsFor("bad-chart.tsx");
const good = findingsFor("good-chart.tsx");

// ---- detector: every 'auto' rule has a detector that fires on bad code ----

const autoRules = loadData("dataviz-rules.json").rules.filter((r) => r.enforcement === "auto");
const detectorsDeclared = new Set(autoRules.map((r) => r.detector));

for (const detector of detectorsDeclared) {
  test(`detector '${detector}' fires on bad-chart.tsx`, () => {
    assert.ok(bad.some((f) => f.detector === detector), `expected '${detector}' to fire`);
  });
}

test("every auto rule names a detector", () => {
  for (const r of autoRules) assert.ok(r.detector, `${r.id} is 'auto' but has no detector`);
});

test("findings carry the rule's severity and fix hint", () => {
  const rules = ruleIndex();
  for (const f of bad) {
    assert.equal(f.severity, rules.get(f.ruleId).severity);
    assert.equal(f.fixHint, rules.get(f.ruleId).do);
    assert.ok(f.line > 0);
  }
});

test("good-chart.tsx has no findings, and dataviz-allow silences the Pareto dual axis", () => {
  assert.deepEqual(good, []);
});

test("non-chart files are ignored", () => {
  assert.deepEqual(detectFile("x.tsx", "const a = { stroke: '#fff' }; <YAxis /><YAxis />"), []);
});

test("bad-chart.tsx: dual axis flagged once, on the second YAxis", () => {
  const hits = bad.filter((f) => f.detector === "dual-axis");
  assert.equal(hits.length, 1);
  assert.match(hits[0].snippet, /orientation="right"/);
});

test("zero-based bar axes are not flagged", () => {
  const src = `import { BarChart, Bar, YAxis, Tooltip } from "recharts";
<BarChart accessibilityLayer><YAxis domain={[0, 'auto']} /><Bar dataKey="a" /><Tooltip /></BarChart>`;
  assert.equal(detectFile("a.tsx", src).filter((f) => f.detector === "non-zero-bar-domain").length, 0);
});

// ---- spec checker ----

const goodSpec = {
  id: "V1", question: "Which pages drive the most views this week?", audience: "executive", job: "compare", form: "FORM-BAR-H",
  series: 1, categories: 10, color_job: "single", has_legend: false, has_tooltip: true, has_table_view: true, has_text_alternative: true,
  baseline: "zero", dual_axis: false, config_driven: true,
  states: { loading: true, empty_not_set_up: true, empty_collecting: true, empty_filtered: true, error: true },
};

test("a good spec passes with no findings", () => {
  const r = checkSpec(goodSpec);
  assert.deepEqual(r.findings, []);
  assert.equal(r.ok, true);
});

const cases = [
  ["DV-PURPOSE-001", { question: "" }],
  ["DV-PURPOSE-002", { form: "FORM-VIOLIN", job: "distribution" }],
  ["DV-FORM-001", { form: "FORM-DONUT" }],
  ["DV-FORM-003", { form: "FORM-BAR-V", categories: 1 }],
  ["DV-FORM-004", { form: "FORM-DONUT", job: "part", categories: 9, color_job: "categorical", series: 1 }],
  ["DV-FORM-005", { form: "FORM-PAIRPLOT", job: "relate", audience: "executive" }],
  ["DV-FORM-007", { categories: 30 }],
  ["DV-HONEST-001", { baseline: "non-zero" }],
  ["DV-HONEST-002", { dual_axis: true }],
  ["DV-COLOR-002", { color_job: undefined }],
  ["DV-COLOR-003", { series: 9, color_job: "categorical", has_legend: true }],
  ["DV-COLOR-007", { series: 1, color_job: "categorical" }],
  ["DV-CLARITY-004", { series: 3, color_job: "categorical", has_legend: false }],
  ["DV-INTERACT-001", { has_tooltip: false }],
  ["DV-A11Y-003", { has_text_alternative: false }],
  ["DV-A11Y-004", { has_table_view: false }],
  ["DV-SUSTAIN-001", { config_driven: false }],
  ["DV-SUSTAIN-002", { points: 5000 }],
  ["DV-STATE-001", { states: { loading: false } }],
  ["DV-STATE-002", { states: { empty_collecting: false } }],
  ["DV-STATE-003", { states: { error: false } }],
  ["DV-CONTEXT-002", { form: "FORM-STAT-TILE", job: "single", categories: undefined, has_comparison: false, color_job: "status" }],
];

for (const [ruleId, patch] of cases) {
  test(`check-spec flags ${ruleId}`, () => {
    const r = checkSpec({ ...goodSpec, ...patch });
    assert.ok(r.findings.some((f) => f.ruleId === ruleId), `expected ${ruleId}, got ${r.findings.map((f) => f.ruleId).join(", ") || "none"}`);
  });
}

test("a Pareto chart may have a second axis", () => {
  const r = checkSpec({ ...goodSpec, form: "FORM-PARETO", job: "compare", audience: "analyst", dual_axis: true });
  assert.ok(!r.findings.some((f) => f.ruleId === "DV-HONEST-002"));
});

test("failures sort before warnings, in triage order", () => {
  const r = checkSpec({ ...goodSpec, has_table_view: false, categories: 30, dual_axis: true });
  const verdicts = r.findings.map((f) => f.verdict);
  assert.deepEqual(verdicts, [...verdicts].sort((a, b) => (a === b ? 0 : a === "FAIL" ? -1 : 1)));
  assert.equal(r.findings[0].ruleId, "DV-A11Y-004");
});

test("formsForJob walks the tree", () => {
  assert.ok(formsForJob("time").has("FORM-LINE"));
  assert.ok(formsForJob("part").has("FORM-DONUT"));
  assert.ok(!formsForJob("part").has("FORM-LINE"));
  assert.equal(formsForJob("nope"), null);
});

// ---- data integrity ----

test("every spec 'enforcement: spec' rule is exercised by check-spec", () => {
  const specRules = loadData("dataviz-rules.json").rules.filter((r) => r.enforcement === "spec").map((r) => r.id);
  const covered = new Set(cases.map(([id]) => id));
  for (const id of specRules) assert.ok(covered.has(id), `${id} has no check-spec test case`);
});

test("decision tree: every option leads somewhere, every node is reachable, every form exists", () => {
  const tree = loadData("decision-tree.json");
  const ids = new Set(tree.nodes.map((n) => n.id));
  const forms = formIndex();
  const rules = ruleIndex();
  const reached = new Set([tree.start]);
  const queue = [tree.start];
  while (queue.length) {
    const id = queue.pop();
    const n = tree.nodes.find((x) => x.id === id);
    if (n.type === "question") {
      assert.ok(n.options.length >= 2, `${n.id} needs at least 2 options`);
      for (const o of n.options) {
        assert.ok(ids.has(o.next), `${n.id} -> missing ${o.next}`);
        if (!reached.has(o.next)) { reached.add(o.next); queue.push(o.next); }
      }
    } else {
      assert.ok(forms.has(n.form), `${n.id}: unknown form ${n.form}`);
      for (const a of n.alternatives) assert.ok(forms.has(a), `${n.id}: unknown alternative ${a}`);
      for (const r of n.rules) assert.ok(rules.has(r), `${n.id}: unknown rule ${r}`);
    }
  }
  for (const n of tree.nodes) assert.ok(reached.has(n.id), `${n.id} is unreachable from the start`);
  for (const [job, entry] of Object.entries(tree.jobs)) assert.ok(ids.has(entry), `job ${job} -> missing ${entry}`);
});

test("rules, patterns and checklists only cite rules and evidence that exist", () => {
  const rules = ruleIndex();
  const evidence = new Set(loadData("evidence.json").entries.map((e) => e.id));
  for (const r of rules.values()) for (const e of r.evidence) assert.ok(evidence.has(e), `${r.id} cites missing ${e}`);
  for (const e of loadData("evidence.json").entries) for (const id of e.rules) assert.ok(rules.has(id), `${e.id} cites missing ${id}`);
  for (const n of loadData("dashboard-patterns.json").nodes) {
    for (const id of n.must_follow || []) assert.ok(rules.has(id), `${n.id} cites missing ${id}`);
    for (const id of n.evidence || []) assert.ok(evidence.has(id), `${n.id} cites missing ${id}`);
    for (const o of n.options || []) assert.ok(loadData("dashboard-patterns.json").nodes.some((x) => x.id === o.next), `${n.id} -> missing ${o.next}`);
  }
  const rev = loadData("review-checklist.json");
  for (const p of rev.improvement_playbook) {
    for (const id of p.rules) assert.ok(rules.has(id), `playbook cites missing ${id}`);
    for (const f of p.forms) assert.ok(formIndex().has(f), `playbook cites missing ${f}`);
  }
});

test("every principle has do's and don't's, and every rule belongs to a principle", () => {
  const data = loadData("dataviz-rules.json");
  const principles = new Set(data.principles.map((p) => p.id));
  for (const p of data.principles) {
    assert.ok(p.dos.length >= 3 && p.donts.length >= 2, `${p.id} needs at least 3 do's and 2 don't's`);
    assert.ok(data.rules.some((r) => r.category === p.id), `${p.id} has no rules`);
  }
  for (const r of data.rules) {
    assert.ok(principles.has(r.category), `${r.id}: unknown category ${r.category}`);
    for (const k of ["rule", "do", "dont", "check", "severity", "enforcement", "sources"]) assert.ok(r[k], `${r.id} missing ${k}`);
    assert.ok(["required", "recommended"].includes(r.severity));
    assert.ok(["auto", "spec", "judgment"].includes(r.enforcement));
  }
});

test("every catalog form has the fields the docs rely on", () => {
  for (const f of formIndex().values()) {
    for (const k of ["name", "family", "job", "use_when", "avoid_when", "baseline", "limits", "color_job", "audience", "fit", "recharts", "a11y"]) {
      assert.ok(f[k] != null, `${f.id} missing ${k}`);
    }
    assert.ok(["general", "analyst"].includes(f.audience));
    assert.ok(["core", "situational", "rare"].includes(f.fit));
  }
});

test("the 23 chart families from the source playbook are all covered", () => {
  const refs = new Set([...formIndex().values()].map((f) => String(f.article_ref || "").split(".")[0]));
  for (let n = 1; n <= 23; n++) assert.ok(refs.has(String(n)), `playbook section ${n} has no form`);
});

// ---- wiring and prose/JSON sync ----

const repoJson = (...parts) => JSON.parse(readFileSync(join(SKILL_ROOT, "..", ...parts), "utf8"));

test("skills.json and vois-components know about vois-dataviz", () => {
  const entry = repoJson("skills.json").skills.find((s) => s.name === "vois-dataviz");
  assert.ok(entry, "skills.json has no vois-dataviz entry");
  for (const f of entry.dataFiles) assert.doesNotThrow(() => loadData(f.path.replace("data/", "")), f.path);
  assert.ok(repoJson("vois-components", "data", "components-rules.json").jobs.some((j) => j.id === "JOB-VISUALIZE-DATA"));
});

// Port of the repo-level rule-id sync check: every id cited in this skill's prose
// must exist in its JSON, and every JSON id must be cited in prose.
const FAMILIES = [
  [/(?<![\w-])DV-[A-Z][A-Z0-9]*-\d+\b/g, "dataviz-rules.json", "rules"],
  [/(?<![\w-])FORM-[A-Z][A-Z0-9-]*\b/g, "chart-catalog.json", "forms"],
  [/(?<![\w-])CHART-[A-Z][A-Z0-9-]*\b/g, "decision-tree.json", "nodes"],
  [/(?<![\w-])DASH-[A-Z][A-Z0-9-]*\b/g, "dashboard-patterns.json", "nodes"],
  [/(?<![\w-])MOB-\d+\b/g, "evidence.json", "entries"],
];

function proseText() {
  const files = ["SKILL.md", "README.md", ...readdirSync(join(SKILL_ROOT, "references")).filter((f) => f.endsWith(".md")).map((f) => `references/${f}`)];
  return files.map((f) => readFileSync(join(SKILL_ROOT, f), "utf8")).join("\n");
}

for (const [re, file, key] of FAMILIES) {
  test(`prose ids and ${file} ids match both ways`, () => {
    const inJson = new Set(loadData(file)[key].map((x) => x.id));
    const inProse = new Set(proseText().match(re) || []);
    const dangling = [...inProse].filter((id) => !inJson.has(id));
    const unmentioned = [...inJson].filter((id) => !inProse.has(id));
    assert.deepEqual(dangling, [], `prose cites ids missing from ${file}`);
    assert.deepEqual(unmentioned, [], `${file} ids never mentioned in prose`);
  });
}

test("rules stay platform-agnostic: sources come from a short allowed list", () => {
  const allowed = new Set(["article", "mobbin", "dataviz-skill", "wcag", "vois"]);
  for (const r of ruleIndex().values()) {
    for (const src of r.sources) assert.ok(allowed.has(src), `${r.id} cites '${src}', which is not an allowed source`);
  }
});
