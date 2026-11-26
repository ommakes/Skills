#!/usr/bin/env node
// Phase 2 answer quality: the same design tasks, scored the same way as run.mjs, under two arms that differ in one thing.
//   skills      the skills are copied in and the prompt says they apply (run.mjs's "on" condition)
//   retrieval   the same, plus one line that points at vois-components/scripts/query.mjs; Bash is allowed for that one command only
// It calls a model, so it costs money and is run by hand; CI never runs it. The output goes to vois-eval/baseline/, not to
// vois-eval/results/, because check-results.mjs compares results files as on/off pairs and these are not.
//
//   node vois-eval/run/quality.mjs --dry-run
//   node vois-eval/run/quality.mjs --model claude-sonnet-5-5 --arms skills,retrieval --samples 3
//   node vois-eval/run/quality.mjs --model claude-sonnet-5-5 --tasks DT-01 --samples 1      # a small run first
import { mkdirSync, mkdtempSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { copySkills, extractCode, invokeClaude, outsideAccess, renderPrompt } from "./run.mjs";
import { installQueryOnlyHook, RETRIEVAL_ALLOWED, RETRIEVAL_HINT } from "./baseline.mjs";
import { loadTasks } from "./tasks.mjs";
import { answeredByOtherModel, scoreSample } from "./score.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
export const ARMS = ["skills", "retrieval"];

export function armPrompt(arm, task) {
  const base = renderPrompt("on", task);
  return arm === "retrieval" ? `${base}\n\n${RETRIEVAL_HINT}` : base;
}

export function parseArgs(argv) {
  const o = { arms: ARMS, samples: 3, maxTurns: 40, budget: 3, concurrency: 4 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") { o.dryrun = true; continue; }
    const v = argv[++i];
    if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
    const key = { "--model": "model", "--arms": "arms", "--tasks": "tasks", "--samples": "samples", "--out": "out", "--max-turns": "maxTurns", "--budget": "budget", "--concurrency": "concurrency" }[a];
    if (!key) throw new Error(`unknown option ${a}`);
    o[key] = ["samples", "maxTurns", "budget", "concurrency"].includes(key) ? Number(v) : v;
  }
  if (typeof o.arms === "string") o.arms = o.arms.split(",").map((s) => s.trim()).filter(Boolean);
  const bad = o.arms.filter((a) => !ARMS.includes(a));
  if (!o.arms.length || bad.length) throw new Error(`--arms takes ${ARMS.join(" and/or ")}${bad.length ? `, not ${bad.join(", ")}` : ""}`);
  for (const k of ["samples", "maxTurns", "concurrency"]) if (!Number.isInteger(o[k]) || o[k] < 1) throw new Error(`--${k} must be a whole number of 1 or more`);
  if (!(o.budget > 0)) throw new Error("--budget must be more than 0");
  if (!o.dryrun && !o.model) throw new Error("--model is required, so the file says which model produced it");
  return o;
}

export function buildPlan(tasks, o) {
  let picked = tasks;
  if (o.tasks && o.tasks !== "all") {
    const want = o.tasks.split(",").map((s) => s.trim()).filter(Boolean);
    const unknown = want.filter((id) => !tasks.some((t) => t.id === id));
    if (!want.length || unknown.length) throw new Error(`unknown task id(s): ${unknown.join(", ") || "(none given)"}`);
    picked = tasks.filter((t) => want.includes(t.id));
  }
  const plan = [];
  for (const task of picked) for (const arm of o.arms) for (let sample = 1; sample <= o.samples; sample++) plan.push({ task, arm, sample });
  return plan;
}

export async function runOne({ task, arm, sample }, o, invoke = invokeClaude, skillsRepo) {
  const dir = mkdtempSync(join(tmpdir(), `vois-quality-${task.id}-${arm}-`));
  const failed = (error, extra = {}) => ({ task: task.id, arm, sample, cost_usd: 0, turns: 0, pass: false, error, ...extra });
  try {
    copySkills(dir, skillsRepo);
    if (arm === "retrieval") installQueryOnlyHook(dir);
    const r = await invoke({ prompt: armPrompt(arm, task), cwd: dir, model: o.model, maxTurns: o.maxTurns, budget: o.budget, extraAllowed: arm === "retrieval" ? RETRIEVAL_ALLOWED : [] });
    const file = join(dir, "out.tsx");
    const src = r.error ? null : extractCode(existsSync(file) ? readFileSync(file, "utf8") : "", r.result);
    const queries = (r.tool_uses ?? []).filter((u) => u.name === "Bash").length;
    const base = { cost_usd: r.cost_usd ?? 0, turns: r.turns ?? 0, duration_ms: r.duration_ms ?? 0, queries, truncated: Boolean(r.truncated), cost_unknown: Boolean(r.cost_unknown),
      model_mismatch: answeredByOtherModel(r.models, o.model), outside_cwd_access: outsideAccess(r.tool_uses, dir) };
    if (!src) return failed(r.error ?? "the agent wrote no ./out.tsx and gave no code block", base);
    try { const s = scoreSample(src, task); return { task: task.id, arm, sample, ...base, ...s }; }
    catch (e) { return failed(`scoring error: ${String(e?.message ?? e).slice(0, 200)}`, base); }
  } catch (e) { return failed(`runner error: ${String(e?.message ?? e).slice(0, 200)}`); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}

/** Per arm: samples, errors, pass rate over all samples (an error counts as a fail), decision rate, mean cost, mean turns, mean queries. */
export function summarizeArms(rows) {
  const out = {};
  for (const arm of ARMS) {
    const r = rows.filter((x) => x.arm === arm);
    if (!r.length) continue;
    const n = r.length, mean = (f) => Math.round((r.reduce((s, x) => s + (f(x) || 0), 0) / n) * 1000) / 1000;
    out[arm] = { samples: n, errors: r.filter((x) => x.error).length, truncated: r.filter((x) => x.truncated).length, model_mismatch: r.filter((x) => x.model_mismatch).length,
      pass_rate: mean((x) => (x.pass ? 1 : 0)), decision_rate: mean((x) => (x.decision ? 1 : 0)), mean_cost_usd: mean((x) => x.cost_usd), mean_turns: mean((x) => x.turns), mean_queries: mean((x) => x.queries),
      total_cost_usd: Math.round(r.reduce((s, x) => s + (x.cost_usd || 0), 0) * 100) / 100 };
  }
  return out;
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => { for (;;) { const i = next++; if (i >= items.length) return; results[i] = await fn(items[i], i); } }));
  return results;
}

export async function main(argv, { invoke = invokeClaude, log = console.log, skillsRepo = resolve(HERE, "..", ".."), outDir = join(HERE, "..", "baseline") } = {}) {
  const o = parseArgs(argv);
  const plan = buildPlan(loadTasks(), o);
  log(`${plan.length} call(s): ${new Set(plan.map((p) => p.task.id)).size} task(s) x ${o.arms.join(" + ")} x ${o.samples} sample(s)`);
  if (o.dryrun) return null;
  const rows = await pool(plan, o.concurrency, async (item) => { const r = await runOne(item, o, invoke, skillsRepo); log(`${item.task.id} ${item.arm} #${item.sample} ${r.pass ? "pass" : r.error ? "ERROR" : "fail"} $${(r.cost_usd ?? 0).toFixed(2)}`); return r; });
  const date = new Date().toISOString().slice(0, 10);
  const outPath = resolve(o.out ?? join(outDir, `${date}-quality-${o.model.replace(/[^A-Za-z0-9._-]/g, "_")}.json`));
  mkdirSync(join(outPath, ".."), { recursive: true });
  const file = { schema: "vois-eval-quality/1", date, model: o.model, samples_per_task: o.samples, arms: o.arms, summary: summarizeArms(rows), results: rows };
  writeFileSync(outPath, JSON.stringify(file, null, 2) + "\n", { flag: "wx" });
  log(JSON.stringify(file.summary, null, 2));
  log(`written: ${outPath}`);
  return file;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
