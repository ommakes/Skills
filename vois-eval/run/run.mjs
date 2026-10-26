#!/usr/bin/env node
// Runs eval tasks through the `claude` CLI, with and without the Vois skills, and writes a
// results file. It calls a model, so it costs money and is run by hand; CI never runs it.
//
//   node vois-eval/run/run.mjs --model claude-sonnet-5-5 --samples 3
//   node vois-eval/run/run.mjs --model claude-haiku-5-5 --tasks DT-01,LP-03a --samples 1 --smoke
//   node vois-eval/run/run.mjs --dry-run            # print the plan, call nothing
//
// How the two conditions differ (and only this):
//   on   the run directory holds a copy of the skills from this checkout under ./skills, and the
//        prompt says they apply and where they are. This pins the version under test.
//   off  an empty run directory and the baseline prompt that forbids reading skills.
// Both get the same four tools (Read, Write, Glob, Grep), no MCP servers and project-only settings. That removes
// the Skill tool, skill listing, shell and any MCP tools. It does NOT sandbox the files: Read and Glob accept
// absolute paths, and the user's own CLAUDE.md memory still loads. So a skills-off agent could in principle read
// installed skills. The runner records every file-tool path outside the run directory (outside_cwd_access) so that
// shows up in the results; the memory file it cannot see. Run on a machine whose user-level memory says nothing
// about Vois, or the off rate may be too high.
import { spawn, execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTasks } from "./tasks.mjs";
import { CONDITIONS, scoreSample, summarize } from "./score.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
// What the runner does to keep the two conditions comparable. Recorded in every results file.
export const ISOLATION = ["tools:Read,Write,Glob,Grep", "setting-sources:project", "strict-mcp-config", "file-access:logged-not-blocked", "user-memory:not-controlled"];
const TRUNCATED_SUBTYPES = ["error_max_turns", "error_max_budget_usd"];
export const SKILLS_UNDER_TEST = ["vois-patterns", "vois-components", "vois-tokens", "vois-dataviz", "righter"];
const TEMPLATE_ON = readFileSync(new URL("../lookalike-pass/runner-prompt.md", import.meta.url), "utf8");
const TEMPLATE_OFF = readFileSync(new URL("../lookalike-pass/runner-prompt-baseline.md", import.meta.url), "utf8");
const SKILLS_HINT = "\n\nThe skills are in ./skills/, one folder each, each starting with SKILL.md. Use the ones that apply.";

export function renderPrompt(condition, task) {
  const t = condition === "on" ? TEMPLATE_ON + SKILLS_HINT : TEMPLATE_OFF;
  // Function replacements, so a "$&" or "$'" inside a task prompt is kept literally.
  return t.replaceAll("{{user_prompt}}", () => task.user_prompt).replaceAll("{{out_path}}", () => "./out.tsx");
}

// The agent is asked to write ./out.tsx. If it answers with a code block instead, take that.
export function extractCode(fileText, resultText) {
  if (fileText && fileText.trim()) return fileText;
  const m = /```(?:tsx|jsx|typescript|ts)?\n([\s\S]*?)```/.exec(resultText ?? "");
  return m ? m[1] : null;
}

export function parseArgs(argv) {
  const o = { condition: "both", samples: 3, maxTurns: 40, budget: 1, concurrency: 1 };
  const flags = new Set(["--dry-run", "--smoke", "--force"]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (flags.has(a)) { o[a.slice(2).replace(/-/g, "")] = true; continue; }
    const v = argv[++i];
    if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
    if (a === "--tasks" && !v.trim()) throw new Error(`--tasks needs a value`);
    const key = { "--model": "model", "--tasks": "tasks", "--condition": "condition", "--samples": "samples", "--out": "out",
      "--save-output": "saveOutput", "--max-turns": "maxTurns", "--budget": "budget", "--concurrency": "concurrency", "--limit": "limit" }[a];
    if (!key) throw new Error(`unknown option ${a}`);
    o[key] = ["samples", "maxTurns", "budget", "concurrency", "limit"].includes(key) ? Number(v) : v;
  }
  if (!["on", "off", "both"].includes(o.condition)) throw new Error(`--condition must be on, off or both`);
  for (const k of ["samples", "maxTurns", "concurrency"]) if (!Number.isInteger(o[k]) || o[k] < 1) throw new Error(`--${k} must be a whole number of 1 or more`);
  if (!(o.budget > 0)) throw new Error("--budget must be more than 0");
  if (o.limit !== undefined && !(Number.isInteger(o.limit) && o.limit >= 1)) throw new Error("--limit must be a whole number of 1 or more");
  if (!o.dryrun && !o.model) throw new Error("--model is required, so the results file says which model produced it");
  return o;
}

export function buildPlan(tasks, o) {
  let picked = tasks;
  if (o.tasks && o.tasks !== "all") {
    const want = o.tasks.split(",").map((s) => s.trim()).filter(Boolean);
    if (!want.length) throw new Error(`--tasks "${o.tasks}" names no task; use ids like DT-01,LP-03a or "all"`);
    const known = new Set(tasks.map((t) => t.id));
    const unknown = want.filter((id) => !known.has(id));
    if (unknown.length) throw new Error(`unknown task id(s): ${unknown.join(", ")}`);
    picked = tasks.filter((t) => want.includes(t.id));
  }
  if (o.limit) picked = picked.slice(0, o.limit);
  const conds = o.condition === "both" ? CONDITIONS : [o.condition];
  const plan = [];
  for (const task of picked) for (const condition of conds) for (let sample = 1; sample <= o.samples; sample++) plan.push({ task, condition, sample });
  return plan;
}

// Paths the agent's file tools touched outside the run directory. In the off condition any entry means
// the agent went looking elsewhere (for example in ~/.claude/skills), so the run needs a look.
export function outsideAccess(toolUses, dir) {
  const roots = new Set([resolve(dir)]);
  try { roots.add(realpathSync(dir)); } catch { /* the directory is gone; compare lexically */ }
  const inside = (p) => [...roots].some((r) => p === r || p.startsWith(r + sep));
  const found = new Set();
  for (const u of toolUses ?? []) {
    const input = u?.input ?? {};
    for (const key of ["file_path", "path", "notebook_path", "pattern", "glob"]) {
      const v = input[key];
      if (typeof v !== "string" || !v) continue;
      if (key === "pattern" && u.name !== "Glob") continue; // a Grep pattern is a regex, not a path
      if (key === "glob" && u.name !== "Grep") continue; // Grep's glob filters files under its path
      // "~" is the home directory. If the tool does not expand it, counting it as outside is still the safe answer.
      const p = v === "~" || v.startsWith("~/") ? join(homedir(), v.slice(1)) : v;
      if (!inside(resolve(dir, p))) found.add(`${u.name}:${v}`);
    }
  }
  return [...found].sort().slice(0, 10);
}

// One `claude -p` call. Resolves with whatever the CLI reported; never rejects.
export function invokeClaude({ prompt, cwd, model, maxTurns, budget, bin = "claude", timeoutMs = 15 * 60 * 1000 }) {
  return new Promise((resolveP) => {
    const args = ["-p", prompt, "--model", model, "--output-format", "stream-json", "--verbose", "--no-session-persistence",
      "--setting-sources", "project", "--strict-mcp-config", "--tools", "Read,Write,Glob,Grep", "--allowedTools", "Read", "Write", "Glob", "Grep",
      "--max-turns", String(maxTurns), "--max-budget-usd", String(budget)];
    const child = spawn(bin, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "", timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => { clearTimeout(timer); resolveP({ error: `could not start ${bin}: ${e.message}` }); });
    child.on("close", (code) => {
      clearTimeout(timer);
      const events = [];
      for (const line of out.split("\n")) { try { if (line.trim()) events.push(JSON.parse(line)); } catch { /* not an event line */ } }
      const j = events.findLast?.((e) => e.type === "result") ?? [...events].reverse().find((e) => e.type === "result");
      // No result event means the model was probably paid for but we cannot say how much: flag the cost as unknown.
      if (!j) { resolveP({ error: timedOut ? `timed out after ${Math.round(timeoutMs / 1000)}s` : `exit ${code}, no result event: ${(err || out).slice(0, 200)}`, cost_unknown: true }); return; }
      const tool_uses = events.filter((e) => e.type === "assistant").flatMap((e) => (e.message?.content ?? []).filter((c) => c?.type === "tool_use"));
      // Hitting the turn or budget limit is not a failure of the run: the agent may already have written a whole screen.
      // That sample is scored and flagged `truncated`, so a skills-on run that reads many files first is not marked down for it.
      const truncated = TRUNCATED_SUBTYPES.includes(j.subtype);
      const stopped = j.subtype && j.subtype !== "success" ? j.subtype : undefined;
      resolveP({
        result: j.result ?? "", cost_usd: j.total_cost_usd ?? 0, duration_ms: j.duration_ms ?? 0, turns: j.num_turns ?? 0, tool_uses,
        models: Object.keys(j.modelUsage ?? {}), truncated, stop_reason: stopped,
        error: truncated ? undefined : j.is_error || stopped ? `claude stopped${stopped ? ` (${stopped})` : ""}: ${String(j.result).slice(0, 200)}` : undefined,
      });
    });
  });
}

// Copy the skills under test into the run directory. The node_modules filter looks at the path inside each
// skill folder, not the absolute path, so a checkout that itself sits under a node_modules folder still
// copies. A copy that comes out without its SKILL.md throws: running "skills on" with no skills in the
// folder would record a meaningless result as a real one.
export function copySkills(dir, repo = REPO, names = SKILLS_UNDER_TEST) {
  for (const name of names) {
    const from = join(repo, name);
    const to = join(dir, "skills", name);
    cpSync(from, to, { recursive: true, filter: (p) => !relative(from, p).split(sep).includes("node_modules") });
    if (!existsSync(join(to, "SKILL.md"))) throw new Error(`skills/${name}/SKILL.md is missing after the copy from ${from}`);
  }
}

const failedRow = (task, condition, sample, error, extra = {}) => ({ task: task.id, condition, sample, cost_usd: 0, duration_ms: 0, turns: 0, served_models: [],
  truncated: false, cost_unknown: false, model_mismatch: false, pass: false, decision: false, lookalike_hits: [], forbidden_imports: [], pattern_failures: [], detector_findings: [], dataviz_findings: [], outside_cwd_access: [], ...extra, error });

// One bad sample (a copy that fails, a detector that throws on odd code) becomes an error row; it must not
// take the other samples' paid results down with it.
export async function runSample(item, o, invoke = invokeClaude) {
  try { return await runSampleInner(item, o, invoke); }
  catch (e) { return failedRow(item.task, item.condition, item.sample, `runner error: ${String(e?.message ?? e).slice(0, 200)}`); }
}

async function runSampleInner({ task, condition, sample }, o, invoke) {
  const dir = mkdtempSync(join(tmpdir(), `vois-eval-${task.id}-${condition}-`));
  try {
    if (condition === "on") copySkills(dir);
    const r = await invoke({ prompt: renderPrompt(condition, task), cwd: dir, model: o.model, maxTurns: o.maxTurns, budget: o.budget });
    const file = join(dir, "out.tsx");
    const src = r.error ? null : extractCode(existsSync(file) ? readFileSync(file, "utf8") : "", r.result);
    const base = { task: task.id, condition, sample, cost_usd: r.cost_usd ?? 0, duration_ms: r.duration_ms ?? 0, turns: r.turns ?? 0, served_models: r.models ?? [], outside_cwd_access: outsideAccess(r.tool_uses, dir),
      truncated: Boolean(r.truncated), cost_unknown: Boolean(r.cost_unknown),
      // The CLI can fall back to another model on overload. Say so, so a change in pass rate is not blamed on the skills.
      model_mismatch: (r.models ?? []).some((m) => m !== o.model), ...(r.stop_reason ? { stop_reason: r.stop_reason } : {}) };
    if (src && o.saveOutput) { mkdirSync(o.saveOutput, { recursive: true }); writeFileSync(join(o.saveOutput, `${task.id}-${condition}-${sample}.tsx`), src); }
    if (!src) return failedRow(task, condition, sample, r.error ?? "the agent wrote no ./out.tsx and gave no code block", base);
    return { ...base, ...scoreSample(src, task) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function skillVersions() {
  const sj = JSON.parse(readFileSync(join(REPO, "skills.json"), "utf8"));
  return Object.fromEntries(SKILLS_UNDER_TEST.map((n) => [n, sj.skills.find((s) => s.name === n)?.version ?? "unknown"]));
}
const tryExec = (cmd, args, cwd) => { try { return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return "unknown"; } };

export async function main(argv, { invoke = invokeClaude, log = console.log, now = () => new Date() } = {}) {
  const o = parseArgs(argv);
  const tasks = loadTasks();
  const plan = buildPlan(tasks, o);
  const date = now().toISOString().slice(0, 10);
  // Decide where the file goes before spending anything, so a clash cannot throw away a paid run.
  const out = resolve(o.out ?? join(REPO, "vois-eval", "results", `${date}-${o.model}${o.smoke ? "-smoke" : ""}.json`));
  if (!o.dryrun && existsSync(out) && !o.force) throw new Error(`${out} already exists; pass --out or --force`);
  log(`${plan.length} call(s): ${new Set(plan.map((p) => p.task.id)).size} task(s) x ${o.condition === "both" ? "2 conditions" : o.condition} x ${o.samples} sample(s)`);
  if (o.dryrun) { for (const p of plan.slice(0, 20)) log(`  ${p.task.id} ${p.condition} #${p.sample}`); if (plan.length > 20) log(`  ... and ${plan.length - 20} more`); return null; }

  const results = new Array(plan.length);
  let next = 0, done = 0;
  const worker = async () => {
    while (next < plan.length) {
      const i = next++;
      results[i] = await runSample(plan[i], o, invoke);
      log(`  [${++done}/${plan.length}] ${results[i].task} ${results[i].condition} #${results[i].sample}: ${results[i].error ? "ERROR " + results[i].error : results[i].pass ? "pass" : "fail"}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(o.concurrency, plan.length) }, worker));

  const dirty = tryExec("git", ["status", "--porcelain"], REPO);
  if (dirty && dirty !== "unknown") log("\nnote: the working tree has uncommitted changes; the results file records that, because git_sha alone will not reproduce this run");
  // Only a run of every default task, with both conditions, is "full". A partial run is kept but never compared.
  const full = !o.smoke && !o.limit && (!o.tasks || o.tasks === "all") && o.condition === "both";
  const run = {
    schema: "vois-eval-results/1", date, created_at: now().toISOString(), model: o.model, smoke: Boolean(o.smoke), full,
    claude_cli: tryExec("claude", ["--version"], REPO), git_sha: tryExec("git", ["rev-parse", "HEAD"], REPO), git_dirty: dirty === "unknown" || dirty.length > 0,
    isolation: ISOLATION, skills: skillVersions(), samples_per_task: o.samples, conditions: [...new Set(plan.map((p) => p.condition))],
    tasks: [...new Set(plan.map((p) => p.task.id))], results, summary: summarize(results),
  };
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, JSON.stringify(run, null, 2) + "\n");
  log(`\nwrote ${out}`);
  for (const [c, s] of Object.entries(run.summary)) log(`  ${c}: ${s.pass_rate} pass over ${s.samples} sample(s), ${s.errors} error(s), $${s.cost_usd}${s.outside_access ? `, ${s.outside_access} sample(s) touched files outside the run directory` : ""}`);
  return { out, run };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
}
