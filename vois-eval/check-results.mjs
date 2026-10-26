#!/usr/bin/env node
// Checks the committed eval results in vois-eval/results/*.json. CI runs this; it never calls a model.
//
//   1. Each file has the right shape, and its summary is what its own results add up to.
//   2. The newest full run has not got worse than the run before it: the skills-on pass rate, over
//      the tasks both runs contain, may not drop by more than 10 points. Smoke runs and runs of a
//      different model are shown but not compared.
//
// Usage: node vois-eval/check-results.mjs [results-dir]
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { answeredByOtherModel, CONDITIONS, TRUNCATED_SUBTYPES, compareRuns, summarize } from "./run/score.mjs";

const dir = process.argv[2] ?? fileURLToPath(new URL("./results", import.meta.url));

const isStr = (v) => typeof v === "string" && v.length > 0;
const isList = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");
// Same value, whatever order the keys were written in.
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);

export function validateRun(run) {
  const errs = [];
  const need = (ok, msg) => { if (!ok) errs.push(msg); };
  need(run && typeof run === "object", "not an object");
  if (errs.length) return errs;
  need(run.schema === "vois-eval-results/1", `schema is ${JSON.stringify(run.schema)}, expected "vois-eval-results/1"`);
  need(/^\d{4}-\d{2}-\d{2}$/.test(run.date ?? ""), "date must be YYYY-MM-DD");
  need(isStr(run.model), "model is missing");
  need(typeof run.smoke === "boolean", "smoke must be true or false");
  need(typeof run.full === "boolean", "full must be true or false");
  need(!(run.full && run.smoke), "a run cannot be both full and smoke");
  need(typeof run.created_at === "string" && !Number.isNaN(Date.parse(run.created_at)) && run.created_at.startsWith(run.date ?? "?"), "created_at must be an ISO time on the run's date");
  need(typeof run.git_dirty === "boolean", "git_dirty must be true or false");
  need(isList(run.isolation) && run.isolation.length > 0, "isolation must list how the run was kept comparable");
  need(run.skills && typeof run.skills === "object" && Object.keys(run.skills).length > 0, "skills versions are missing");
  need(Number.isInteger(run.samples_per_task) && run.samples_per_task >= 1, "samples_per_task must be a whole number of 1 or more");
  need(isList(run.tasks) && run.tasks.length > 0, "tasks must be a non-empty list of ids");
  need(isList(run.conditions) && run.conditions.length > 0 && run.conditions.every((c) => CONDITIONS.includes(c)), "conditions must be a non-empty list of on and off");
  need(!run.full || (isList(run.conditions) && CONDITIONS.every((c) => run.conditions.includes(c))), "a full run must cover both conditions");
  need(Array.isArray(run.results) && run.results.length > 0, "results must be a non-empty list");
  if (errs.length) return errs;

  const seen = new Set();
  for (const [i, r] of run.results.entries()) {
    const at = `results[${i}]`;
    if (!r || typeof r !== "object") { errs.push(`${at}: not an object`); continue; }
    need(run.tasks.includes(r.task), `${at}: task ${JSON.stringify(r.task)} is not in tasks`);
    need(CONDITIONS.includes(r.condition), `${at}: condition must be on or off`);
    need(Number.isInteger(r.sample) && r.sample >= 1 && r.sample <= run.samples_per_task, `${at}: sample must be 1 to ${run.samples_per_task}`);
    need(typeof r.pass === "boolean" && typeof r.decision === "boolean", `${at}: pass and decision must be true or false`);
    need(typeof r.truncated === "boolean" && typeof r.cost_unknown === "boolean", `${at}: truncated and cost_unknown must be true or false`);
    need(typeof r.model_mismatch === "boolean", `${at}: model_mismatch must be true or false`);
    need(!isList(r.served_models) || r.model_mismatch === answeredByOtherModel(r.served_models, run.model), `${at}: model_mismatch does not match served_models and the model the file names`);
    need(isList(r.served_models), `${at}: served_models must be a list of strings`);
    need(r.truncated === TRUNCATED_SUBTYPES.includes(r.stop_reason), `${at}: truncated must be true exactly when stop_reason is ${TRUNCATED_SUBTYPES.join(" or ")}`);
    need(r.stop_reason === undefined || isStr(r.stop_reason), `${at}: stop_reason must be a non-empty string when present`);
    for (const k of ["lookalike_hits", "forbidden_imports", "pattern_failures", "detector_findings", "dataviz_findings", "outside_cwd_access"]) need(isList(r[k]), `${at}: ${k} must be a list of strings`);
    need(r.error === undefined || isStr(r.error), `${at}: error must be a non-empty string when present`);
    need(typeof r.cost_usd === "number" && r.cost_usd >= 0, `${at}: cost_usd must be a number of 0 or more`);
    need(typeof r.duration_ms === "number" && r.duration_ms >= 0, `${at}: duration_ms must be a number of 0 or more`);
    need(!(r.pass && r.error !== undefined), `${at}: an errored sample cannot be marked as passing`);
    // The flags must follow from the findings, so flipping one by hand cannot hide a failure.
    const none = (k) => Array.isArray(r[k]) && r[k].length === 0;
    need(!r.decision || none("forbidden_imports"), `${at}: marked as a correct decision with forbidden imports`);
    need(!r.pass || (r.decision && none("lookalike_hits") && none("pattern_failures") && none("forbidden_imports")),
      `${at}: marked as passing with lookalike hits, pattern failures, forbidden imports or a wrong decision`);
    const key = `${r.task}|${r.condition}|${r.sample}`;
    need(!seen.has(key), `${at}: duplicate sample ${key}`);
    seen.add(key);
  }
  if (!errs.length) {
    // Every task x condition x sample the header promises must be there, so a file cannot be trimmed to hide failures.
    for (const t of run.tasks) for (const c of run.conditions) for (let n = 1; n <= run.samples_per_task; n++) need(seen.has(`${t}|${c}|${n}`), `missing sample ${t}|${c}|${n}`);
    need(run.results.every((r) => run.conditions.includes(r.condition)), "a result uses a condition the header does not list");
    need(JSON.stringify(canon(summarize(run.results))) === JSON.stringify(canon(run.summary)), "summary does not match what the results add up to");
  }
  return errs;
}

// For each model, compare its newest full run with the full run before it. Smoke and partial runs are never
// compared, and a run of another model in between does not hide a regression.
export function compareLatestPerModel(runs) {
  const byModel = {};
  for (const r of runs) if (r.run.full) (byModel[r.run.model] ??= []).push(r); // validateRun guarantees a full run is not a smoke run
  const out = [];
  for (const list of Object.values(byModel)) {
    list.sort((a, b) => Date.parse(a.run.created_at) - Date.parse(b.run.created_at) || a.f.localeCompare(b.f));
    if (list.length < 2) continue;
    // Compare with the newest earlier run that can be compared, so one run that had to be skipped (a fallback model, a
    // different sample count) does not leave the next run with nothing to be compared against.
    const next = list[list.length - 1];
    let chosen = null;
    for (let i = list.length - 2; i >= 0; i--) {
      const cmp = compareRuns(list[i].run, next.run);
      chosen ??= { prev: list[i], next, cmp };
      if (cmp.status !== "skipped") { chosen = { prev: list[i], next, cmp }; break; }
    }
    out.push(chosen);
  }
  return out;
}

function main() {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const runs = [];
  let failed = false;
  for (const f of files) {
    let run;
    try { run = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch (e) { console.error(`FAIL ${f}: ${e.message}`); failed = true; continue; }
    const errs = validateRun(run);
    const leaked = errs.length ? 0 : run.results.filter((r) => r.condition === "off" && r.outside_cwd_access.length > 0).length;
    const cut = errs.length ? 0 : run.results.filter((r) => r.truncated).length;
    const unknown = errs.length ? 0 : run.results.filter((r) => r.cost_unknown).length;
    const swapped = errs.length ? 0 : run.results.filter((r) => r.model_mismatch).length;
    if (swapped) console.warn(`WARN ${f}: ${swapped} sample(s) were answered by a model other than ${run.model}; the pass rate mixes models and is not compared`);
    if (cut) console.warn(`WARN ${f}: ${cut} sample(s) hit the turn or budget limit and were scored as they stood; compare the on and off counts before reading the rates`);
    if (unknown) console.warn(`WARN ${f}: ${unknown} sample(s) have an unknown cost (timed out or no result), so the cost total is a lower bound`);
    if (leaked) console.warn(`WARN ${f}: ${leaked} skills-off sample(s) touched files outside the run directory; check they did not read installed skills before trusting the off rate`);
    if (errs.length) { failed = true; console.error(`FAIL ${f}`); for (const e of errs) console.error(`  ${e}`); } else { runs.push({ f, run }); console.log(`ok   ${f}: ${run.model}, ${run.smoke ? "smoke, " : ""}${run.tasks.length} task(s), ${run.samples_per_task} sample(s)`); }
  }
  const comparisons = compareLatestPerModel(runs);
  for (const { prev, next, cmp } of comparisons) {
    if (cmp.status === "regressed") { failed = true; console.error(`FAIL ${next.f} vs ${prev.f}: skills-on pass rate fell from ${cmp.before} to ${cmp.after} over ${cmp.common_tasks} shared task(s) (allowed drop ${cmp.threshold}; truncated skills-on samples ${cmp.truncated_before} to ${cmp.truncated_after})`); }
    else if (cmp.status === "skipped" && cmp.kind === "mismatch") console.warn(`WARN ${next.f} vs ${prev.f}: NOT COMPARED, ${cmp.reason}. The regression check did not run for this model.`);
    else if (cmp.status === "skipped") console.log(`note ${next.f} vs ${prev.f}: not compared, ${cmp.reason}`);
    else console.log(`ok   ${next.f} vs ${prev.f}: skills-on pass rate ${cmp.before} to ${cmp.after} over ${cmp.common_tasks} shared task(s)${cmp.truncated_before || cmp.truncated_after ? `, truncated skills-on samples ${cmp.truncated_before} to ${cmp.truncated_after}` : ""}`);
  }
  if (!comparisons.length) console.log(`note ${runs.filter(({ run }) => run.full).length} full run(s) committed, none with an earlier full run of the same model; the regression check needs two`);
  if (failed) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
