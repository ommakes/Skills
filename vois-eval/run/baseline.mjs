#!/usr/bin/env node
// Phase 0 baseline (prds/jit-retrieval.md in the private repo): what does one design decision cost today?
// Runs each scenario's user_prompt through the `claude` CLI with the Vois skills copied in, asks for the decision only,
// and records tokens, cost, turns and lookups. It calls a model, so it costs money and is run by hand. CI never runs it.
//
//   node vois-eval/run/baseline.mjs --model claude-sonnet-5-5 --samples 3
//   node vois-eval/run/baseline.mjs --model claude-sonnet-5-5 --scenarios EVAL-001,EVAL-002 --samples 1
//   node vois-eval/run/baseline.mjs --dry-run
//   ... --resume          continue the same output file; finished samples are skipped
//   ... --tasks <file>    run the tasks in a file ({"tasks":[{"id","user_prompt",...}]}) instead of scenarios.json (held-out tasks, vois-eval/heldout/)
//   ... --no-skills       the control: an empty run directory and a prompt that does not mention skills
//   --gate <file> [--skills-file <file>] [--read ADV-09=pass] [--cards-decided]   score a finished result file with gate(); no model call
//   ... --retrieval       Phase 2 arm: the skills plus one line telling the model to use vois-components/scripts/query.mjs (Bash is allowed for that one command only)
//
// It measures cost, not quality. `auto_match` is a crude check (does the first line name the expected component, and not
// a forbidden one). The reports are kept so a person can read them. A pass here says nothing about rule recall: that
// is Phase 2.
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { copySkills, invokeClaude, SKILLS_UNDER_TEST } from "./run.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUT_DIR = join(HERE, "..", "baseline");
const SKILLS_HINT = "The skills are in ./skills/, one folder each, each starting with SKILL.md. Use the ones that apply.";

// The retrieval arm (Phase 2 of the JIT plan): the same skills, plus one line that points at the lookup script.
const QUERY_ONLY = /^node skills\/vois-components\/scripts\/query\.mjs(?: (?:--[a-z]+|[A-Za-z0-9_.:-]+))*$/; // same shape as query-only-hook.cjs
export const QUERY_CMD = "node skills/vois-components/scripts/query.mjs";
export const RETRIEVAL_ALLOWED = [`Bash(${QUERY_CMD}:*)`];
export const RETRIEVAL_HINT = `To look up a rule, run \`${QUERY_CMD}\` first: \`--jobs\` lists the jobs, \`--job <ID>\` gives a job's decision tree, \`<Component>\` gives the rules for one component, \`--id <ID>\` gives one rule (a \`DS-\`, \`PATH-\` or \`FIELD-\` id). \`--patterns\` lists page and form patterns, \`--group <name>\` lists the nodes of one pattern file, and \`--fields\` lists the form field rules. Run one command per call, with no \`;\`, \`&&\` or pipe.`;

/** The run directory gets a project hook that blocks every Bash command except one plain query.mjs call (see query-only-hook.cjs for why the allow rule alone is not enough). */
export function installQueryOnlyHook(dir) {
  mkdirSync(join(dir, ".claude"), { recursive: true });
  copyFileSync(new URL("./query-only-hook.cjs", import.meta.url), join(dir, ".claude", "query-only-hook.cjs"));
  writeFileSync(join(dir, ".claude", "settings.json"), JSON.stringify({ hooks: { PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "node .claude/query-only-hook.cjs" }] }] } }, null, 2));
}

export function buildPrompt(userPrompt, { skills = true, retrieval = false } = {}) {
  const context = skills
    ? `You are helping design one screen in a React + TypeScript + Tailwind v4 app with shadcn/ui. The Vois design system skills apply to this project. ${SKILLS_HINT}${retrieval ? ` ${RETRIEVAL_HINT}` : ""}`
    : "You are helping design one screen in a React + TypeScript + Tailwind v4 app with shadcn/ui.";
  const lookedUp = skills ? "Which rule files, ids or sections you looked up." : "Which rules or sources you relied on, or \"none\".";
  return `${context}\n\nTask: ${userPrompt}\n\nDecide only. Do not write code.${skills ? " Do not read the `vois-eval` folder." : ""} Reply in exactly three lines:\n1. What you would use.\n2. ${lookedUp}\n3. What was unclear, or "nothing".`;
}

/** Share of the required rule ids that the report names. An id counts only as a whole token: DS-MODAL-00 is not found inside DS-MODAL-004. Null when the task lists none. */
export function ruleRecall(report, required) {
  if (!Array.isArray(required) || !required.length) return null;
  const text = String(report ?? "").toUpperCase();
  const ids = [...new Set(required.map((r) => String(r).toUpperCase()))];
  const found = ids.filter((id) => new RegExp(`(?<![A-Z0-9-])${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Z0-9-])`).test(text));
  return { recall: found.length / ids.length, missing: ids.filter((i) => !found.includes(i)) };
}

const words = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
/** The lead of an outcome: the text before the first bracket, dash or full stop. */
const lead = (s) => String(s ?? "").split(/[(\[—–]| - |\.\s/)[0];

/** A crude check. The first line of the report must contain the expected lead's first word, and no forbidden lead's first word unless the expected one is also there. */
export function autoMatch(report, scenario) {
  const first = words(String(report ?? "").split("\n").find((l) => l.trim()) ?? "");
  const has = (w) => w && first.includes(w);
  const want = words(lead(scenario.expected_outcome))[0];
  const forbidden = (scenario.forbidden_outcomes ?? []).map((f) => words(lead(typeof f === "string" ? f : f?.outcome ?? ""))[0]).filter((w) => w && w !== want);
  const bad = forbidden.filter(has);
  return { match: Boolean(has(want)) && bad.length === 0, expected: want ?? null, forbidden_named: bad };
}

/** Lookups: file-tool calls. Skill bytes: the size of each distinct file under ./skills that was read (whole file, so an upper bound when a Read used offset or limit). */
export function lookups(toolUses, dir, toolResults = {}) {
  // Compare real paths: on macOS the temp folder is a link (/var -> /private/var), and the model may report either spelling.
  const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
  const root = real(dir) + sep;
  const files = new Set();
  let calls = 0, searches = 0, queries = 0, otherBash = 0;
  const packets = [], bash = [];
  for (const u of toolUses ?? []) {
    if (u.name === "Read") {
      calls++;
      const p = real(resolve(dir, String(u.input?.file_path ?? "")));
      if (p.startsWith(root) && existsSync(p)) files.add(p); // a path the model guessed that is not there is a call, not a file read
    } else if (u.name === "Grep" || u.name === "Glob") searches++;
    else if (u.name === "Bash") {
      const command = String(u.input?.command ?? ""), res = toolResults[u.id];
      if (QUERY_ONLY.test(command)) { queries++; if (res && !res.is_error) packets.push(res.text.trimEnd().split("\n").length); }
      else otherBash++;
      bash.push({ command: command.slice(0, 200), blocked: res ? res.is_error : null });
    }
  }
  let bytes = 0;
  for (const f of files) { try { bytes += statSync(f).size; } catch { /* gone */ } }
  return { read_calls: calls, search_calls: searches, query_calls: queries, other_bash_attempts: otherBash, packet_lines: packets, bash_commands: bash, files_read: files.size, file_paths: [...files].map((f) => f.slice(root.length)).sort(), skill_bytes_read: bytes, skill_tokens_est: Math.ceil(bytes / 4) };
}

export function tokensOf(usage) {
  const u = usage ?? {};
  const input = (u.input_tokens ?? 0), cacheW = (u.cache_creation_input_tokens ?? 0), cacheR = (u.cache_read_input_tokens ?? 0);
  return { input_tokens: input, cache_write_tokens: cacheW, cache_read_tokens: cacheR, output_tokens: u.output_tokens ?? 0, total_in: input + cacheW + cacheR };
}

function parseArgs(argv) {
  const o = { samples: 3, budget: 1, maxTurns: 40, concurrency: 2, bin: "claude" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (["--dry-run", "--resume", "--no-skills", "--retrieval"].includes(a)) o[a.slice(2).replace("-", "")] = true; // --dry-run -> dryrun, --no-skills -> noskills
    else if (["--model", "--scenarios", "--samples", "--budget", "--max-turns", "--concurrency", "--out", "--bin", "--limit-seconds", "--tasks"].includes(a)) {
      const v = argv[++i]; if (v === undefined) throw new Error(`${a} needs a value`);
      const k = a.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase());
      o[k] = ["samples", "budget", "maxTurns", "concurrency", "limitSeconds"].includes(k) ? Number(v) : v;
    } else throw new Error(`unknown argument ${a}`);
  }
  for (const k of ["samples", "budget", "maxTurns", "concurrency"]) if (!Number.isFinite(o[k]) || o[k] <= 0) throw new Error(`--${k} must be a positive number`);
  if (o.retrieval && o.noskills) throw new Error("--retrieval needs the skills, so it cannot be combined with --no-skills");
  return o;
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const sum = (a) => a.reduce((x, y) => x + y, 0);

export function summarize(rows) {
  const ok = rows.filter((r) => !r.error);
  const pick = (f) => ok.map(f);
  return {
    samples: rows.length, errored: rows.length - ok.length,
    cost_usd: { total: +sum(pick((r) => r.cost_usd)).toFixed(4), median: median(pick((r) => r.cost_usd)) },
    total_in_tokens: { median: median(pick((r) => r.tokens.total_in)), max: Math.max(0, ...pick((r) => r.tokens.total_in)) },
    output_tokens: { median: median(pick((r) => r.tokens.output_tokens)) },
    turns: { median: median(pick((r) => r.turns)) },
    read_calls: { median: median(pick((r) => r.lookups.read_calls)), max: Math.max(0, ...pick((r) => r.lookups.read_calls)) },
    search_calls: { median: median(pick((r) => r.lookups.search_calls)) },
    query_calls: { median: median(pick((r) => r.lookups.query_calls ?? 0)) },
    other_bash_attempts: { total: sum(pick((r) => r.lookups.other_bash_attempts ?? 0)) },
    packet_lines: (() => { const all = ok.flatMap((r) => r.lookups.packet_lines ?? []); return { count: all.length, median: median(all), max: all.length ? Math.max(...all) : null, over_40: all.filter((n) => n > 40).length }; })(),
    rule_recall: (() => { const x = ok.map((r) => r.rule_recall).filter((n) => typeof n === "number"); return x.length ? { samples: x.length, mean: +(sum(x) / x.length).toFixed(3), full: x.filter((n) => n === 1).length } : null; })(),
    files_read: { median: median(pick((r) => r.lookups.files_read)) },
    skill_tokens_est: { median: median(pick((r) => r.lookups.skill_tokens_est)), max: Math.max(0, ...pick((r) => r.lookups.skill_tokens_est)) },
    auto_match_rate: ok.some((r) => r.auto_match) ? +(ok.filter((r) => r.auto_match?.match).length / ok.filter((r) => r.auto_match).length).toFixed(3) : null,
  };
}

const HELD_ID = /^HELD-\d+$/;
const SKILL_OR_CARD = /(^|\/)SKILL\.md$|(^|\/)behaviors\/[^/]+\.md$/;
export const ADV_REQUIRED = { "ADV-07": ["FIELD-SENSITIVE-STORAGE"], "ADV-10": ["PATH-TABLE-NARROW-SELECT", "PATH-TABLE-BULK-DESTRUCTIVE"] }; // changelog 1.44.0: the samples that stopped at JOB-CONFIRM-DESTRUCTIVE / missed the field rule
export const HUMAN_READ = ["ADV-09"]; // no required ids; a person reads the reports

/**
 * The Phase 2 gate for one result file (the object baseline.mjs writes: { arm, rows, summary }). Pure: no model, no disk.
 *   opts.skills          the skills-arm result file for the same task file; retrieval recall must not be lower than its mean
 *   opts.reads           { "ADV-09": "pass" | "fail" } the person's read of reports that have no required ids
 *   opts.cardsDecided    false (default) = the cards question is open, so a retrieval row that read a SKILL.md or behaviors/*.md fails the gate
 * Returns { pass, checks: [{ name, pass, detail }], per_id: { id: { missing: [...], samples } }, reads_of_skill_or_card: [{ scenario, sample, path }] }.
 * Per-id misses come from rows[].rules_missing, never from the mean. ADV-09 stays out of the mean because it has no numeric recall.
 */
export function gate(file, opts = {}) {
  const rows = file?.rows ?? [], summary = file?.summary ?? summarize(rows), retrieval = file?.arm === "retrieval";
  const checks = [], add = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail });
  const rr = summary.rule_recall;
  add("rule_recall.mean >= 0.95", Boolean(rr) && rr.samples > 0 && rr.mean >= 0.95, rr ? `mean ${rr.mean} over ${rr.samples} samples` : "no row has a numeric rule_recall");
  const pl = summary.packet_lines ?? {};
  if (retrieval) {
    add("packet_lines.over_40 == 0", pl.over_40 === 0, `${pl.over_40 ?? "?"} of ${pl.count ?? 0} packets over 40 lines`);
    add("packet_lines.median <= 40", pl.median != null && pl.median <= 40, `median ${pl.median ?? "none (no packet read)"}`);
    const qc = summary.query_calls?.median;
    add("query_calls.median >= 1", qc != null && qc >= 1, `median ${qc ?? "none"}${qc === 0 ? ": the hint was ignored" : ""}`);
  }
  add("errored == 0", summary.errored === 0, `${summary.errored} errored of ${summary.samples}`);
  if (opts.skills) {
    const base = opts.skills.summary?.rule_recall?.mean;
    add("retrieval recall >= skills recall", retrieval && typeof base === "number" && rr != null && rr.mean >= base, `retrieval ${rr?.mean ?? "none"}, skills ${base ?? "none"}`);
  }

  const per_id = {};
  for (const r of rows) {
    if (r.error) continue;
    const e = (per_id[r.scenario] ??= { missing: [], samples: 0 });
    e.samples++;
    for (const m of r.rules_missing ?? []) if (!e.missing.includes(m)) e.missing.push(m);
  }
  const heldMiss = Object.entries(per_id).filter(([id, e]) => HELD_ID.test(id) && e.missing.length);
  if (Object.keys(per_id).some((id) => HELD_ID.test(id))) add("no HELD id misses a required rule on any row", heldMiss.length === 0, heldMiss.length ? heldMiss.map(([id, e]) => `${id}: ${e.missing.join(", ")}`).join("; ") : "none missed");
  for (const [id, need] of Object.entries(ADV_REQUIRED)) {
    const mine = rows.filter((r) => r.scenario === id && !r.error);
    if (!mine.length) continue;
    const bad = mine.filter((r) => need.every((n) => !ruleRecall(r.report, [n])?.recall));
    add(`${id} reports name ${need.join(" or ")}`, retrieval && bad.length === 0, bad.length ? `samples ${bad.map((r) => r.sample).join(", ")} name none of them` : `${mine.length} of ${mine.length} samples name one`);
  }
  for (const id of HUMAN_READ) {
    if (!rows.some((r) => r.scenario === id)) continue;
    const read = opts.reads?.[id];
    add(`${id} read by a person`, read === "pass", read ? `read: ${read}` : "no read recorded");
  }

  const reads = [];
  for (const r of rows) {
    if (r.error) continue;
    if (retrieval && r.lookups?.files_read > 0 && !Array.isArray(r.lookups.file_paths)) reads.push({ scenario: r.scenario, sample: r.sample, path: "(paths not recorded)" });
    for (const p of r.lookups?.file_paths ?? []) if (SKILL_OR_CARD.test(p)) reads.push({ scenario: r.scenario, sample: r.sample, path: p });
  }
  if (retrieval && !opts.cardsDecided) add("no retrieval row read a SKILL.md or behaviors/*.md (cards question open)", reads.length === 0, reads.length ? `${reads.length} reads in ${new Set(reads.map((x) => `${x.scenario}#${x.sample}`)).size} samples` : "none read");
  return { pass: checks.every((c) => c.pass), checks, per_id, reads_of_skill_or_card: reads };
}

/** Tasks from scenarios.json or from a held-out file. Every task needs a string id and user_prompt, and ids must be unique, or two tasks would share one result row. */
export function loadTasks(path) {
  const j = JSON.parse(readFileSync(path, "utf8"));
  const list = Array.isArray(j) ? j : j?.tasks ?? j?.scenarios;
  if (!Array.isArray(list) || !list.length) throw new Error(`${path}: no tasks found (expected {"tasks":[...]})`);
  const seen = new Set();
  for (const t of list) {
    if (!t || typeof t.id !== "string" || !t.id.trim() || typeof t.user_prompt !== "string" || !t.user_prompt.trim()) throw new Error(`${path}: every task needs a non-empty string id and user_prompt`);
    if (seen.has(t.id)) throw new Error(`${path}: duplicate task id ${t.id}`);
    seen.add(t.id);
  }
  return list;
}

/** `--gate <result.json> [--skills-file <skills-arm.json>] [--read ADV-09=pass] [--cards-decided]`: score a finished file. No model call; exits 1 when the gate fails. */
function gateCli(argv) {
  const val = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const file = JSON.parse(readFileSync(resolve(val("--gate")), "utf8"));
  const sk = val("--skills-file");
  const reads = {};
  argv.forEach((a, i) => { if (a === "--read") { const [id, v] = String(argv[i + 1]).split("="); reads[id] = v; } });
  const g = gate(file, { skills: sk ? JSON.parse(readFileSync(resolve(sk), "utf8")) : undefined, reads, cardsDecided: argv.includes("--cards-decided") });
  for (const c of g.checks) console.log(`${c.pass ? "pass" : "FAIL"}  ${c.name}  (${c.detail})`);
  for (const [id, e] of Object.entries(g.per_id)) if (e.missing.length) console.log(`missing  ${id}: ${e.missing.join(", ")}`);
  for (const r of g.reads_of_skill_or_card) console.log(`read     ${r.scenario}#${r.sample} ${r.path}`);
  console.log(g.pass ? "GATE: pass" : "GATE: fail");
  process.exit(g.pass ? 0 : 1);
}

async function main() {
  if (process.argv.includes("--gate")) return gateCli(process.argv.slice(2));
  const o = parseArgs(process.argv.slice(2));
  const all = loadTasks(o.tasks ? resolve(o.tasks) : join(HERE, "..", "scenarios.json"));
  const want = o.scenarios ? new Set(o.scenarios.split(",")) : null;
  const scenarios = all.filter((s) => !want || want.has(s.id));
  if (want && scenarios.length !== want.size) throw new Error(`unknown scenario in --scenarios: ${[...want].filter((w) => !all.some((s) => s.id === w)).join(", ")}`);
  const plan = scenarios.flatMap((s) => Array.from({ length: o.samples }, (_, i) => ({ s, sample: i + 1 })));
  if (o.dryrun) { console.log(`${scenarios.length} scenarios x ${o.samples} samples = ${plan.length} calls, model ${o.model ?? "(none given)"}, budget cap $${o.budget} each`); return; }
  if (!o.model) throw new Error("--model is required, and should be a full model id");
  mkdirSync(OUT_DIR, { recursive: true });
  const stem = o.tasks ? `tasks-${basename(o.tasks).replace(/\.json$/, "")}` : "phase0";
  const outPath = resolve(o.out ?? join(OUT_DIR, `${stem}-${o.model}${o.noskills ? "-noskills" : ""}${o.retrieval ? "-retrieval" : ""}.json`));
  let file = { model: o.model, samples_per_scenario: o.samples, skills: o.noskills ? [] : SKILLS_UNDER_TEST, arm: o.noskills ? "no-skills" : o.retrieval ? "retrieval" : "skills", started: new Date().toISOString(), rows: [] };
  if (o.resume && existsSync(outPath)) file = JSON.parse(readFileSync(outPath, "utf8"));
  else if (existsSync(outPath)) throw new Error(`${outPath} exists. Use --resume to continue it, or --out for a new file.`);
  const done = new Set(file.rows.filter((r) => !r.error).map((r) => `${r.scenario}#${r.sample}`));
  file.rows = file.rows.filter((r) => !r.error); // errored samples are run again
  const todo = plan.filter((p) => !done.has(`${p.s.id}#${p.sample}`));
  const deadline = o.limitSeconds ? Date.now() + o.limitSeconds * 1000 : Infinity;
  const save = () => writeFileSync(outPath, JSON.stringify({ ...file, summary: summarize(file.rows) }, null, 2) + "\n");
  let next = 0, errorsInARow = 0;
  const worker = async () => {
    while (next < todo.length && Date.now() < deadline && errorsInARow < 5) {
      const { s, sample } = todo[next++];
      const dir = mkdtempSync(join(tmpdir(), "vois-phase0-"));
      try {
        if (!o.noskills) copySkills(dir);
        if (o.retrieval) installQueryOnlyHook(dir);
        const r = await invokeClaude({ prompt: buildPrompt(s.user_prompt, { skills: !o.noskills, retrieval: Boolean(o.retrieval) }), cwd: dir, model: o.model, maxTurns: o.maxTurns, budget: o.budget, bin: o.bin, extraAllowed: o.retrieval ? RETRIEVAL_ALLOWED : [] });
        const mismatch = r.models && r.models.length && !r.models.some((m) => m.startsWith(o.model));
        const row = { scenario: s.id, job: s.source_job, sample, error: r.error ?? (mismatch ? `answered by ${r.models.join(", ")}, not ${o.model}` : undefined),
          cost_usd: r.cost_usd ?? 0, cost_unknown: Boolean(r.cost_unknown), turns: r.turns ?? 0, duration_ms: r.duration_ms ?? 0, truncated: Boolean(r.truncated),
          tokens: tokensOf(r.usage), lookups: lookups(r.tool_uses, dir, r.tool_results), rule_recall: ruleRecall(r.result, s.required_rules)?.recall, rules_missing: ruleRecall(r.result, s.required_rules)?.missing, auto_match: s.expected_outcome ? autoMatch(r.result, s) : null, report: String(r.result ?? "").slice(0, 1500) };
        errorsInARow = row.error ? errorsInARow + 1 : 0;
        file.rows.push(row); save();
        console.log(`${row.error ? "ERR " : "ok  "} ${s.id}#${sample} $${row.cost_usd.toFixed(3)} in=${row.tokens.total_in} reads=${row.lookups.read_calls} match=${row.auto_match?.match ?? "n/a"}${row.error ? ` ${row.error.slice(0, 80)}` : ""}`);
      } finally { rmSync(dir, { recursive: true, force: true }); }
    }
  };
  await Promise.all(Array.from({ length: o.concurrency }, worker));
  file.finished = new Date().toISOString(); save();
  const left = todo.length - next;
  console.log(JSON.stringify(summarize(file.rows), null, 2));
  if (errorsInARow >= 5) { console.error("stopped: 5 errors in a row. Fix the cause, then run again with --resume."); process.exit(1); }
  if (left > 0) console.log(`${left} samples not started (time limit). Run again with --resume.`);
  console.log(`written: ${outPath}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
