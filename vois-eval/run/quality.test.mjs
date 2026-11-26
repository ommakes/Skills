// Tests for quality.mjs. Run: node --test vois-eval/run/quality.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { armPrompt, buildPlan, parseArgs, runOne, summarizeArms, main } from "./quality.mjs";
import { loadTasks } from "./tasks.mjs";
import { RETRIEVAL_ALLOWED, RETRIEVAL_HINT } from "./baseline.mjs";

const REPO = new URL("../../", import.meta.url).pathname;
const task = loadTasks()[0];

test("the two arms differ by the retrieval line and nothing else", () => {
  const a = armPrompt("skills", task), b = armPrompt("retrieval", task);
  assert.equal(b, `${a}\n\n${RETRIEVAL_HINT}`);
  assert.ok(!a.includes("query.mjs"), "the skills arm never mentions the lookup");
});

test("arguments: arms are checked, and a bad value fails", () => {
  assert.deepEqual(parseArgs(["--model", "m"]).arms, ["skills", "retrieval"]);
  assert.deepEqual(parseArgs(["--model", "m", "--arms", "retrieval"]).arms, ["retrieval"]);
  assert.throws(() => parseArgs(["--model", "m", "--arms", "skills,none"]), /--arms takes/);
  assert.throws(() => parseArgs(["--model", "m", "--arms", ""]), /--arms/);
  assert.throws(() => parseArgs(["--arms", "skills"]), /--model is required/);
  assert.throws(() => parseArgs(["--model", "m", "--samples", "0"]), /whole number/);
  assert.throws(() => parseArgs(["--model", "m", "--bogus", "1"]), /unknown option/);
  assert.doesNotThrow(() => parseArgs(["--dry-run"]));
});

test("the plan is task x arm x sample, and an unknown task is refused", () => {
  const o = parseArgs(["--model", "m", "--samples", "2", "--tasks", task.id]);
  assert.equal(buildPlan(loadTasks(), o).length, 4);
  assert.throws(() => buildPlan(loadTasks(), { ...o, tasks: "NOPE-1" }), /unknown task/);
});

test("only the retrieval arm gets Bash and the query-only hook", async () => {
  const seen = {};
  const invoke = async (a) => { seen[a.prompt.includes("query.mjs") ? "retrieval" : "skills"] = { allowed: a.extraAllowed, hook: existsSync(join(a.cwd, ".claude", "query-only-hook.cjs")) }; return { result: "```tsx\nexport default function A(){return null}\n```", cost_usd: 0.5, turns: 2, tool_uses: [] }; };
  const o = parseArgs(["--model", "m"]);
  await runOne({ task, arm: "skills", sample: 1 }, o, invoke, REPO);
  await runOne({ task, arm: "retrieval", sample: 1 }, o, invoke, REPO);
  assert.deepEqual(seen.skills, { allowed: [], hook: false });
  assert.deepEqual(seen.retrieval, { allowed: RETRIEVAL_ALLOWED, hook: true });
});

test("a failed call is an error row with its cost kept, not a thrown error", async () => {
  const r = await runOne({ task, arm: "skills", sample: 1 }, parseArgs(["--model", "m"]), async () => ({ error: "exit 1", cost_usd: 0.2 }), REPO);
  assert.equal(r.pass, false); assert.match(r.error, /exit 1/); assert.equal(r.cost_usd, 0.2);
  const t = await runOne({ task, arm: "skills", sample: 1 }, parseArgs(["--model", "m"]), async () => { throw new Error("boom"); }, REPO);
  assert.match(t.error, /runner error: boom/);
});

test("an error counts as a fail in the pass rate, per arm", () => {
  const s = summarizeArms([
    { arm: "skills", pass: true, decision: true, cost_usd: 1, turns: 2, queries: 0 },
    { arm: "skills", pass: false, error: "x", cost_usd: 1, turns: 0, queries: 0 },
    { arm: "retrieval", pass: true, decision: true, cost_usd: 0.5, turns: 3, queries: 2 },
  ]);
  assert.equal(s.skills.pass_rate, 0.5); assert.equal(s.skills.errors, 1); assert.equal(s.skills.total_cost_usd, 2);
  assert.equal(s.retrieval.pass_rate, 1); assert.equal(s.retrieval.mean_queries, 2);
});

test("main writes the file, and refuses to overwrite an existing one", async () => {
  const dir = mkdtempSync(join(tmpdir(), "q-out-"));
  const out = join(dir, "q.json"), log = () => {};
  const invoke = async () => ({ result: "```tsx\nexport default function A(){return null}\n```", cost_usd: 0.1, turns: 1, tool_uses: [] });
  const args = ["--model", "m", "--tasks", task.id, "--samples", "1", "--out", out];
  const f = await main(args, { invoke, log, skillsRepo: REPO });
  assert.equal(f.results.length, 2); assert.ok(JSON.parse(readFileSync(out, "utf8")).summary.skills);
  await assert.rejects(() => main(args, { invoke, log, skillsRepo: REPO }), /EEXIST/);
  rmSync(dir, { recursive: true });
});
