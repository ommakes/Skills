// Tests for the eval runner's scoring, task loading, results checking and run loop.
// The model is replaced by a stub, so nothing here costs money. Each guard has a test that
// tries to get past it, and removing the guard makes that test fail.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTasks, validateTask } from "./tasks.mjs";
import { compareRuns, scoreSample, summarize } from "./score.mjs";
import { buildPlan, extractCode, main, outsideAccess, parseArgs, renderPrompt, runSample } from "./run.mjs";
import { validateRun } from "../check-results.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const task = (extra = {}) => ({ id: "T-1", user_prompt: "Build a thing.", expected_imports: ["alert-dialog"], ...extra });
const GOOD = `import { AlertDialog } from "@/components/ui/alert-dialog";\nexport default function A() { return <AlertDialog />; }`;

// ---------- tasks ----------

test("the committed task files load and every task has an expectation", () => {
  const tasks = loadTasks();
  assert.ok(tasks.length >= 45);
  assert.ok(tasks.some((t) => t.id === "DT-01"));
});

test("every source_rules entry on the design tasks is a real id", () => {
  const ids = new Set();
  const j = (p) => JSON.parse(readFileSync(join(REPO, p), "utf8"));
  for (const n of j("vois-patterns/data/patterns-rules.json").nodes) ids.add(n.id);
  for (const n of j("vois-components/data/components-rules.json").jobs) ids.add(n.id);
  for (const n of j("vois-tokens/data/vois-rules.json").rules) ids.add(n.id);
  // DS-SLOP-* rules are deliberately not indexed in the JSON; their tags live in anti-slop.md.
  for (const m of readFileSync(join(REPO, "vois-tokens/references/anti-slop.md"), "utf8").matchAll(/`\[(DS-SLOP-\d+)\]`/g)) ids.add(m[1]);
  const dt = j("vois-eval/tasks/design-tasks.json").scenarios;
  for (const t of dt) for (const r of t.source_rules) {
    if (r.startsWith("vois-dataviz ")) continue; // named by tree and job, not by id
    assert.ok(ids.has(r), `${t.id}: source rule ${r} does not exist`);
  }
});

test("a task that checks nothing is rejected", () => {
  assert.throws(() => validateTask({ id: "T", user_prompt: "x" }), /no expectations/);
});
test("a broken regex stops the run instead of scoring as nothing", () => {
  assert.throws(() => validateTask(task({ required_patterns: [{ id: "p", regex: "(" }] })), /not a valid regex/);
});
test("an unknown field, a bad component name and an empty prompt are rejected", () => {
  assert.throws(() => validateTask(task({ expected_import: ["x"] })), /unknown field/);
  assert.throws(() => validateTask(task({ expected_imports: ["Alert Dialog"] })), /component file names/);
  assert.throws(() => validateTask(task({ user_prompt: "  " })), /user_prompt is empty/);
});
test("the same task id in two files is rejected", () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-dup-"));
  try {
    const f = (n) => { const p = join(dir, n); writeFileSync(p, JSON.stringify({ scenarios: [task({ id: "SAME" })] })); return p; };
    assert.throws(() => loadTasks([f("a.json"), f("b.json")]), /duplicate task id SAME/);
    assert.equal(loadTasks([f("a.json")]).length, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("duplicate pattern ids are rejected", () => {
  const p = { id: "a", regex: "x" };
  assert.throws(() => validateTask(task({ required_patterns: [p, p] })), /duplicate pattern id/);
});

// ---------- scoring ----------

test("a screen with the expected component and nothing else wrong passes", () => {
  const s = scoreSample(GOOD, task());
  assert.equal(s.pass, true);
  assert.equal(s.decision, true);
});
test("missing the expected component fails the decision", () => {
  const s = scoreSample(`export default function A() { return <div />; }`, task());
  assert.equal(s.pass, false);
  assert.equal(s.decision, false);
});
test("an import named only in a comment does not count", () => {
  const src = `// import { AlertDialog } from "@/components/ui/alert-dialog";\n/* from "@/components/ui/alert-dialog" */\nexport default () => <div />;`;
  assert.equal(scoreSample(src, task()).decision, false);
});
test("a forbidden component fails even when the expected one is present", () => {
  const src = GOOD + `\nimport { Dialog } from "@/components/ui/dialog";`;
  const s = scoreSample(src, task({ forbidden_imports: ["dialog"] }));
  assert.deepEqual(s.forbidden_imports, ["dialog"]);
  assert.equal(s.pass, false);
});
test("forbidden dialog does not match alert-dialog", () => {
  assert.equal(scoreSample(GOOD, task({ forbidden_imports: ["dialog"] })).pass, true);
});
test("expected and forbidden imports use the same rule, sonner's package import included", () => {
  const src = `import { toast } from "sonner";\nexport default () => <div />;`;
  assert.deepEqual(scoreSample(src, task({ expected_imports: [], forbidden_imports: ["sonner"], required_patterns: [{ id: "x", regex: "toast" }] })).forbidden_imports, ["sonner"]);
  assert.equal(scoreSample(src, task({ expected_imports: ["sonner"] })).decision, true);
  const deep = `import x from "sonner/dist";\nexport default () => <div />;`;
  assert.equal(scoreSample(deep, task({ expected_imports: ["sonner"] })).decision, false, "a longer path is not the component");
});
test("sonner counts when imported from the package itself", () => {
  const src = `import { toast } from "sonner";\nexport default () => <button onClick={() => toast("x")} />;`;
  assert.equal(scoreSample(src, task({ expected_imports: ["sonner"] })).decision, true);
});
test("markup that does a component's job fails, even with the right import", () => {
  const src = GOOD + `\nexport function X() { return <button onClick={() => window.confirm("sure?")}>Delete</button>; }`;
  const s = scoreSample(src, task());
  assert.ok(s.lookalike_hits.length > 0, "expected a lookalike hit");
  assert.equal(s.pass, false);
});
test("required and forbidden patterns", () => {
  const t = task({ required_patterns: [{ id: "sel", regex: "selected", flags: "i" }], forbidden_patterns: [{ id: "pie", regex: "PieChart" }] });
  assert.deepEqual(scoreSample(GOOD, t).pattern_failures, ["missing:sel"]);
  assert.deepEqual(scoreSample(GOOD + "\nconst l = '3 Selected';\n<PieChart/>", t).pattern_failures, ["forbidden:pie"]);
  assert.equal(scoreSample(GOOD + "\nconst l = '3 selected';", t).pass, true);
});
test("a pattern in a comment does not satisfy a required pattern", () => {
  const t = task({ required_patterns: [{ id: "sel", regex: "selected" }] });
  assert.deepEqual(scoreSample(GOOD + "\n// selected\n/* selected */", t).pattern_failures, ["missing:sel"]);
});
test("detector findings are recorded but do not decide the pass", () => {
  const s = scoreSample(GOOD + `\nconst c = <div className="h-screen" />;`, task());
  assert.ok(s.detector_findings.includes("DS-LAYOUT-001"));
  assert.equal(s.pass, true);
});

// ---------- summary and comparison ----------

const row = (o = {}) => ({ task: "T-1", condition: "on", sample: 1, pass: true, decision: true, lookalike_hits: [], forbidden_imports: [], pattern_failures: [], detector_findings: [], dataviz_findings: [], outside_cwd_access: [], cost_usd: 0.01, duration_ms: 1000, ...o });

test("an errored sample counts as an attempt that failed", () => {
  const s = summarize([row(), row({ sample: 2, pass: false, decision: false, error: "boom" })]);
  assert.equal(s.on.samples, 2);
  assert.equal(s.on.errors, 1);
  assert.equal(s.on.pass_rate, 0.5);
});
test("summarize keeps conditions apart and sums cost", () => {
  const s = summarize([row(), row({ condition: "off", pass: false, decision: false, cost_usd: 0.5 })]);
  assert.equal(s.on.pass_rate, 1);
  assert.equal(s.off.pass_rate, 0);
  assert.equal(s.off.cost_usd, 0.5);
});

const run = (model, passes, extra = {}) => ({
  model,
  results: passes.map((p, i) => row({ task: `T-${i + 1}`, pass: p, decision: p })),
  ...extra,
});
test("compareRuns flags a drop of more than the threshold on shared tasks", () => {
  const prev = run("m", [true, true, true, true, true, true, true, true, true, true]);
  const next = run("m", [true, true, true, true, true, true, true, false, false, false]);
  assert.equal(compareRuns(prev, next).status, "regressed");
});
test("a drop of exactly the threshold is allowed", () => {
  const prev = run("m", Array(10).fill(true));
  const next = run("m", [...Array(9).fill(true), false]);
  assert.equal(compareRuns(prev, next).status, "ok");
});
test("a drop of exactly the threshold is allowed even where floating point says 0.7 < 0.7000000000000001", () => {
  const prev = run("m", [...Array(8).fill(true), false, false]);
  const next = run("m", [...Array(7).fill(true), ...Array(3).fill(false)]);
  assert.equal(compareRuns(prev, next).status, "ok");
  const worse = run("m", [...Array(6).fill(true), ...Array(4).fill(false)]);
  assert.equal(compareRuns(prev, worse).status, "regressed");
});
test("compareRuns does not compare across models or with too few shared tasks", () => {
  assert.equal(compareRuns(run("a", Array(10).fill(true)), run("b", Array(10).fill(false))).status, "skipped");
  assert.equal(compareRuns(run("a", [true, true]), run("a", [false, false])).status, "skipped");
});
test("only tasks both runs contain are compared", () => {
  const prev = run("m", Array(6).fill(true));
  const next = run("m", Array(6).fill(true));
  next.results.push(row({ task: "NEW-1", pass: false, decision: false }));
  assert.equal(compareRuns(prev, next).status, "ok");
});

// ---------- results file checks ----------

function validRun() {
  const results = [row(), row({ sample: 2 }), row({ condition: "off", pass: false, decision: false }), row({ condition: "off", sample: 2, pass: false, decision: false })];
  return { schema: "vois-eval-results/1", date: "2026-10-26", model: "m", smoke: false, git_dirty: false, skills: { "vois-tokens": "1.0.0" }, samples_per_task: 2,
    conditions: ["on", "off"], tasks: ["T-1"], results, summary: summarize(results) };
}
test("a well-formed run validates", () => assert.deepEqual(validateRun(validRun()), []));
test("a summary that disagrees with the results is rejected", () => {
  const r = validRun(); r.summary.on.pass_rate = 1; r.results[0].pass = false; r.results[0].decision = false;
  assert.match(validateRun(r).join("\n"), /summary does not match/);
});
test("a summary written with its keys in another order is accepted", () => {
  const r = validRun();
  r.summary = Object.fromEntries(Object.entries(r.summary).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).reverse())]));
  assert.deepEqual(validateRun(r), []);
});
test("a trimmed file that hides a failing sample is rejected", () => {
  const r = validRun(); r.results.pop(); r.summary = summarize(r.results);
  assert.match(validateRun(r).join("\n"), /missing sample T-1\|off\|2/);
});
test("duplicate samples, unknown tasks and unlisted conditions are rejected", () => {
  let r = validRun(); r.results[1].sample = 1;
  assert.match(validateRun(r).join("\n"), /duplicate sample/);
  r = validRun(); r.results[0].task = "OTHER";
  assert.match(validateRun(r).join("\n"), /not in tasks/);
  r = validRun(); r.conditions = ["on"];
  assert.match(validateRun(r).join("\n"), /condition the header does not list/);
});
test("a flag flipped by hand cannot hide a failure", () => {
  for (const [field, value] of [["pattern_failures", ["missing:x"]], ["forbidden_imports", ["dialog"]], ["lookalike_hits", ["fake-button"]]]) {
    const r = validRun(); r.results[0][field] = value; r.summary = summarize(r.results);
    assert.match(validateRun(r).join("\n"), /marked as/, field);
  }
  const r = validRun(); r.results[0].decision = false; r.summary = summarize(r.results);
  assert.match(validateRun(r).join("\n"), /wrong decision/);
});
test("a failing sample still cannot claim a correct decision while importing a forbidden component", () => {
  const r = validRun(); Object.assign(r.results[2], { decision: true, forbidden_imports: ["dialog"] }); r.summary = summarize(r.results);
  assert.match(validateRun(r).join("\n"), /correct decision with forbidden imports/);
});
test("a null result, an empty error and a missing git_dirty are rejected, not crashed on", () => {
  let r = validRun(); r.results.push(null);
  assert.match(validateRun(r).join("\n"), /not an object/);
  r = validRun(); r.results[2].error = ""; r.summary = summarize(r.results);
  assert.match(validateRun(r).join("\n"), /error must be a non-empty string/);
  r = validRun(); delete r.git_dirty;
  assert.match(validateRun(r).join("\n"), /git_dirty/);
});
test("an errored or lookalike-ridden sample cannot be marked as passing", () => {
  let r = validRun(); r.results[0].error = "x"; r.summary = summarize(r.results);
  assert.match(validateRun(r).join("\n"), /errored sample cannot be marked as passing/);
  r = validRun(); r.results[0].lookalike_hits = ["fake-button"]; r.summary = summarize(r.results);
  assert.match(validateRun(r).join("\n"), /lookalike hits/);
});
test("wrong schema, null and missing fields are rejected", () => {
  assert.ok(validateRun(null).length);
  const r = validRun(); r.schema = "other"; delete r.model;
  assert.match(validateRun(r).join("\n"), /schema is/);
});
test("the committed results directory passes the checker", () => {
  execFileSync("node", [join(REPO, "vois-eval/check-results.mjs")], { stdio: "pipe" });
});
test("the checker exits non-zero for a regression in a directory of results", () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-res-"));
  try {
    const mk = (date, passes) => {
      const results = passes.map((p, i) => row({ task: `T-${i + 1}`, pass: p, decision: p }));
      return { schema: "vois-eval-results/1", date, model: "m", smoke: false, git_dirty: false, skills: { a: "1" }, samples_per_task: 1, conditions: ["on"],
        tasks: results.map((r) => r.task), results, summary: summarize(results) };
    };
    const w = (n, o) => writeFileSync(join(dir, n), JSON.stringify(o));
    w("2026-10-01-m.json", mk("2026-10-01", Array(10).fill(true)));
    w("2026-10-20-m.json", mk("2026-10-20", [...Array(6).fill(true), ...Array(4).fill(false)]));
    assert.throws(() => execFileSync("node", [join(REPO, "vois-eval/check-results.mjs"), dir], { stdio: "pipe" }), (e) => e.status === 1 && /fell from 1 to 0.6/.test(e.stderr.toString()));
    w("2026-10-30-m-smoke.json", { ...mk("2026-10-30", [false, false, false, false, false]), smoke: true });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------- the run loop, with the model stubbed ----------

test("parseArgs rejects what would silently produce a bad run", () => {
  assert.throws(() => parseArgs(["--samples", "0", "--model", "m"]), /whole number/);
  assert.throws(() => parseArgs(["--samples", "2.5", "--model", "m"]), /whole number/);
  assert.throws(() => parseArgs(["--condition", "maybe", "--model", "m"]), /on, off or both/);
  assert.throws(() => parseArgs(["--nope", "x"]), /unknown option/);
  assert.throws(() => parseArgs(["--model"]), /needs a value/);
  assert.throws(() => parseArgs(["--model", "--smoke"]), /needs a value/);
  assert.throws(() => parseArgs([]), /--model is required/);
  assert.throws(() => parseArgs(["--model", "m", "--budget", "0"]), /more than 0/);
  assert.equal(parseArgs(["--dry-run"]).dryrun, true);
});
test("buildPlan expands tasks x conditions x samples and rejects unknown ids", () => {
  const tasks = loadTasks();
  const o = parseArgs(["--model", "m", "--tasks", "DT-01,DT-02", "--samples", "3"]);
  assert.equal(buildPlan(tasks, o).length, 2 * 2 * 3);
  assert.equal(buildPlan(tasks, parseArgs(["--model", "m", "--tasks", "DT-01", "--condition", "on", "--samples", "1"])).length, 1);
  assert.throws(() => buildPlan(tasks, parseArgs(["--model", "m", "--tasks", "DT-99"])), /unknown task id/);
});
test("a dollar sign sequence in a prompt is kept literally", () => {
  const p = renderPrompt("off", { user_prompt: "It costs $& and $' and $$ and $`." });
  assert.ok(p.includes("It costs $& and $' and $$ and $`."), p);
  assert.doesNotMatch(p, /\{\{/);
});
test("an empty task selection is rejected instead of running nothing or everything", () => {
  const tasks = loadTasks();
  assert.throws(() => buildPlan(tasks, parseArgs(["--model", "m", "--tasks", ","])), /names no task/);
  assert.throws(() => parseArgs(["--model", "m", "--tasks", ""]), /needs a value/);
  assert.throws(() => parseArgs(["--model", "m", "--tasks", "  "]), /needs a value/);
});
test("outsideAccess lists file-tool paths outside the run directory and ignores the inside", () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-out-"));
  try {
    const uses = [
      { name: "Read", input: { file_path: join(dir, "skills/a/SKILL.md") } },
      { name: "Read", input: { file_path: "./out.tsx" } },
      { name: "Glob", input: { pattern: "skills/**/SKILL.md" } },
      { name: "Grep", input: { pattern: "/etc/passwd|\\.claude", path: "." } },
      { name: "Read", input: { file_path: "/home/u/.claude/skills/vois-tokens/SKILL.md" } },
      { name: "Glob", input: { pattern: "/home/u/.claude/skills/**" } },
      { name: "Read", input: { file_path: join(dir, "..", "elsewhere", "x") } },
      { name: "Read", input: { file_path: dir + "-sibling/x" } },
    ];
    assert.deepEqual(outsideAccess(uses, dir), [
      "Glob:/home/u/.claude/skills/**", "Read:/home/u/.claude/skills/vois-tokens/SKILL.md", `Read:${dir}-sibling/x`, `Read:${join(dir, "..", "elsewhere", "x")}`,
    ].sort());
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("the two conditions get different prompts and only 'on' points at the skills", () => {
  const t = { user_prompt: "Do X." };
  assert.match(renderPrompt("on", t), /\.\/skills\//);
  assert.doesNotMatch(renderPrompt("off", t), /\.\/skills\//);
  assert.match(renderPrompt("off", t), /Do not invoke any skill/);
  assert.match(renderPrompt("on", t), /Do X\./);
  assert.doesNotMatch(renderPrompt("on", t), /\{\{/);
});
test("extractCode prefers the written file, falls back to a code block, else null", () => {
  assert.equal(extractCode("file", "```tsx\nblock\n```"), "file");
  assert.equal(extractCode("", "```tsx\nblock\n```"), "block\n");
  assert.equal(extractCode("  \n", "no code"), null);
});

test("main runs the plan, scores each sample, and writes a results file the checker accepts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-main-"));
  const out = join(dir, "r.json");
  const calls = [];
  const invoke = async ({ prompt, cwd }) => {
    calls.push({ prompt, skills: existsSync(join(cwd, "skills", "vois-tokens", "SKILL.md")) });
    return { result: "```tsx\nimport { Dialog } from \"@/components/ui/dialog\";\nexport default () => <Dialog/>;\n```", cost_usd: 0.02, duration_ms: 5, turns: 1, models: ["m"] };
  };
  try {
    const res = await main(["--model", "m", "--tasks", "DT-04", "--samples", "2", "--out", out], { invoke, log: () => {} });
    assert.equal(calls.length, 4);
    assert.deepEqual(calls.filter((c) => c.skills).length, 2, "skills are copied in only for the 'on' condition");
    assert.equal(res.run.results.length, 4);
    assert.ok(res.run.results.every((r) => r.pass === false && r.forbidden_imports.includes("dialog")));
    assert.deepEqual(validateRun(JSON.parse(readFileSync(out, "utf8"))), []);
    await assert.rejects(main(["--model", "m", "--tasks", "DT-04", "--samples", "1", "--out", out], { invoke, log: () => {} }), /already exists/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a model error or an empty answer becomes a failed, flagged sample and never a pass", async () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-err-"));
  const answers = [{ error: "claude reported an error: overloaded" }, { result: "I could not do that." }];
  let i = 0;
  try {
    const res = await main(["--model", "m", "--tasks", "DT-04", "--condition", "on", "--samples", "2", "--out", join(dir, "r.json")], { invoke: async () => answers[i++], log: () => {} });
    assert.ok(res.run.results.every((r) => r.pass === false && r.error));
    assert.equal(res.run.summary.on.errors, 2);
    assert.equal(res.run.summary.on.pass_rate, 0);
    assert.deepEqual(validateRun(res.run), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a dry run calls nothing and writes nothing", async () => {
  let called = false;
  const res = await main(["--dry-run", "--tasks", "DT-01"], { invoke: async () => { called = true; }, log: () => {} });
  assert.equal(called, false);
  assert.equal(res, null);
});

test("a sample that throws becomes an error row and the other samples still run", async () => {
  const t = loadTasks().find((x) => x.id === "DT-04");
  const o = parseArgs(["--model", "m"]);
  const boom = await runSample({ task: t, condition: "off", sample: 1 }, o, async () => { throw new Error("disk full"); });
  assert.equal(boom.pass, false);
  assert.match(boom.error, /runner error: disk full/);
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-throw-"));
  let n = 0;
  try {
    const res = await main(["--model", "m", "--tasks", "DT-04", "--condition", "on", "--samples", "3", "--out", join(dir, "r.json")], {
      invoke: async () => { if (++n === 2) throw new Error("boom"); return { result: "```tsx\nimport { Drawer } from \"@/components/ui/drawer\";\nexport default () => <Drawer/>;\n```", cost_usd: 0.01, duration_ms: 1, turns: 1, models: ["m"] }; },
      log: () => {},
    });
    assert.deepEqual(res.run.results.map((r) => r.pass), [true, false, true]);
    assert.equal(res.run.summary.on.errors, 1);
    assert.deepEqual(validateRun(res.run), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a results file that already exists stops the run before any model call is made", async () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-exists-"));
  const out = join(dir, "r.json");
  writeFileSync(out, "{}");
  let called = 0;
  try {
    await assert.rejects(main(["--model", "m", "--tasks", "DT-04", "--samples", "1", "--out", out], { invoke: async () => { called++; return {}; }, log: () => {} }), /already exists/);
    assert.equal(called, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("file access outside the run directory is recorded on the sample", async () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-leak-"));
  try {
    const res = await main(["--model", "m", "--tasks", "DT-04", "--condition", "off", "--samples", "1", "--out", join(dir, "r.json")], {
      invoke: async () => ({ result: "```tsx\nimport { Drawer } from \"@/components/ui/drawer\";\nexport default () => <Drawer/>;\n```", tool_uses: [{ name: "Read", input: { file_path: "/root/.claude/skills/x/SKILL.md" } }], cost_usd: 0, duration_ms: 1, turns: 2, models: ["m"] }),
      log: () => {},
    });
    assert.deepEqual(res.run.results[0].outside_cwd_access, ["Read:/root/.claude/skills/x/SKILL.md"]);
    assert.equal(res.run.summary.off.outside_access, 1);
    assert.equal(typeof res.run.git_dirty, "boolean");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
