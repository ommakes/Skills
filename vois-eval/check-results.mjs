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
import { CONDITIONS, compareRuns, summarize } from "./run/score.mjs";

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
  need(typeof run.git_dirty === "boolean", "git_dirty must be true or false");
  need(run.skills && typeof run.skills === "object" && Object.keys(run.skills).length > 0, "skills versions are missing");
  need(Number.isInteger(run.samples_per_task) && run.samples_per_task >= 1, "samples_per_task must be a whole number of 1 or more");
  need(isList(run.tasks) && run.tasks.length > 0, "tasks must be a non-empty list of ids");
  need(isList(run.conditions) && run.conditions.length > 0 && run.conditions.every((c) => CONDITIONS.includes(c)), "conditions must be a non-empty list of on and off");
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

function main() {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const runs = [];
  let failed = false;
  for (const f of files) {
    let run;
    try { run = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch (e) { console.error(`FAIL ${f}: ${e.message}`); failed = true; continue; }
    const errs = validateRun(run);
    const leaked = errs.length ? 0 : run.results.filter((r) => r.condition === "off" && r.outside_cwd_access.length > 0).length;
    if (leaked) console.warn(`WARN ${f}: ${leaked} skills-off sample(s) touched files outside the run directory; check they did not read installed skills before trusting the off rate`);
    if (errs.length) { failed = true; console.error(`FAIL ${f}`); for (const e of errs) console.error(`  ${e}`); } else { runs.push({ f, run }); console.log(`ok   ${f}: ${run.model}, ${run.smoke ? "smoke, " : ""}${run.tasks.length} task(s), ${run.samples_per_task} sample(s)`); }
  }
  const full = runs.filter(({ run }) => !run.smoke).sort((a, b) => a.run.date.localeCompare(b.run.date) || a.f.localeCompare(b.f));
  if (full.length >= 2) {
    const prev = full[full.length - 2], next = full[full.length - 1];
    const cmp = compareRuns(prev.run, next.run);
    if (cmp.status === "regressed") { failed = true; console.error(`FAIL ${next.f} vs ${prev.f}: skills-on pass rate fell from ${cmp.before} to ${cmp.after} over ${cmp.common_tasks} shared task(s) (allowed drop ${cmp.threshold})`); }
    else if (cmp.status === "skipped") console.log(`note ${next.f} vs ${prev.f}: not compared, ${cmp.reason}`);
    else console.log(`ok   ${next.f} vs ${prev.f}: skills-on pass rate ${cmp.before} to ${cmp.after} over ${cmp.common_tasks} shared task(s)`);
  } else console.log(`note ${full.length} full run(s) committed; the regression check needs two`);
  if (failed) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
