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
// absolute paths, and the user's own CLAUDE.md memory may still load (untested, and not controlled here). So a
// skills-off agent could in principle read installed skills. The runner records every file-tool path outside the run
// directory (outside_cwd_access) so that shows up in the results. A memory file it cannot see, so run on a machine
// whose user-level memory says nothing about Vois, or the off rate may be too high.
import { spawn, execFileSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { homedir, tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTasks } from "./tasks.mjs";
import { answeredByOtherModel, CONDITIONS, scoreSample, summarize, TRUNCATED_SUBTYPES } from "./score.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
// What the runner does to keep the two conditions comparable. Recorded in every results file.
// The isolation flags are written once. The args passed to the CLI and the `isolation` list recorded in every results
// file both come from here, so the file cannot claim a flag the run did not have.
export const TOOLS = ["Read", "Write", "Glob", "Grep"];
export const ISOLATION_FLAGS = ["--setting-sources", "project", "--strict-mcp-config", "--tools", TOOLS.join(",")];
export const ISOLATION = [
  `tools:${TOOLS.join(",")}`, `setting-sources:${ISOLATION_FLAGS[ISOLATION_FLAGS.indexOf("--setting-sources") + 1]}`, "strict-mcp-config",
  "file-access:logged-not-blocked", "user-memory:not-controlled",
];
const BREAKER_AFTER = 5; // consecutive errored samples before a run stops itself
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
  const flags = new Set(["--dry-run", "--smoke", "--force", "--resume", "--retry-errors"]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (flags.has(a)) { o[a.slice(2).replace(/-/g, "")] = true; continue; }
    const v = argv[++i];
    if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
    if (a === "--tasks" && !v.trim()) throw new Error(`--tasks needs a value`);
    const key = { "--model": "model", "--tasks": "tasks", "--condition": "condition", "--samples": "samples", "--out": "out",
      "--save-output": "saveOutput", "--progress": "progress", "--max-turns": "maxTurns", "--budget": "budget", "--concurrency": "concurrency", "--limit": "limit" }[a];
    if (!key) throw new Error(`unknown option ${a}`);
    o[key] = ["samples", "maxTurns", "budget", "concurrency", "limit"].includes(key) ? Number(v) : v;
  }
  if (!["on", "off", "both"].includes(o.condition)) throw new Error(`--condition must be on, off or both`);
  for (const k of ["samples", "maxTurns", "concurrency"]) if (!Number.isInteger(o[k]) || o[k] < 1) throw new Error(`--${k} must be a whole number of 1 or more`);
  if (!(o.budget > 0)) throw new Error("--budget must be more than 0");
  if (o.limit !== undefined && !(Number.isInteger(o.limit) && o.limit >= 1)) throw new Error("--limit must be a whole number of 1 or more");
  if (!o.dryrun && !o.model) throw new Error("--model is required, so the results file says which model produced it");
  if (o.retryerrors && !o.resume) throw new Error("--retry-errors only makes sense with --resume");
  if (o.resume && !o.progress) throw new Error("--resume needs --progress <file>, the progress file of the run to continue");
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
// Expand {a,b} alternatives, nested ones included, so a Glob like {/home/u/.claude,/etc}/skills/** is checked per
// alternative. Past the cap, or with an unclosed brace, the pattern is returned as it is (and an over-long list is
// reported as outside, because it cannot be checked).
const BRACE_CAP = 64;
export function expandBraces(p) {
  const out = [];
  const walk = (s) => {
    if (out.length > BRACE_CAP) return;
    const open = s.indexOf("{");
    if (open === -1) { out.push(s); return; }
    let depth = 0, close = -1;
    for (let i = open; i < s.length && close === -1; i++) { if (s[i] === "{") depth++; else if (s[i] === "}" && --depth === 0) close = i; }
    if (close === -1) { out.push(s); return; }
    const alts = [];
    let level = 0, from = open + 1;
    for (let i = open + 1; i < close; i++) {
      if (s[i] === "{") level++; else if (s[i] === "}") level--;
      else if (s[i] === "," && level === 0) { alts.push(s.slice(from, i)); from = i + 1; }
    }
    alts.push(s.slice(from, close));
    for (const a of alts) walk(s.slice(0, open) + a + s.slice(close + 1));
  };
  walk(p);
  return out;
}

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
      // "~" is the home directory. "~name" is someone else's, which cannot be resolved here, so it counts as outside.
      // If a tool does not expand "~" at all, counting it as outside is still the safe answer.
      const alternatives = expandBraces(v);
      const unresolvable = alternatives.length > BRACE_CAP || alternatives.some((a) => /^~[^/]/.test(a));
      const outside = unresolvable || alternatives.some((a) => !inside(resolve(dir, a === "~" || a.startsWith("~/") ? join(homedir(), a.slice(1)) : a)));
      if (outside) found.add(`${u.name}:${v}`);
    }
  }
  return [...found].sort().slice(0, 10);
}

// One `claude -p` call. Resolves with whatever the CLI reported; never rejects.
export function invokeClaude({ prompt, cwd, model, maxTurns, budget, bin = "claude", timeoutMs = 15 * 60 * 1000 }) {
  return new Promise((resolveP) => {
    const args = ["-p", prompt, "--model", model, "--output-format", "stream-json", "--verbose", "--no-session-persistence",
      ...ISOLATION_FLAGS, "--allowedTools", ...TOOLS,
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
      const tool_uses = events.filter((e) => e.type === "assistant").flatMap((e) => (e.message?.content ?? []).filter((c) => c?.type === "tool_use"));
      // A timeout is like hitting the turn limit: the agent may already have written a whole screen, so it is scored and
      // flagged. Its cost is unknown (no result event). Any other missing result is an error.
      if (!j && timedOut) { resolveP({ result: "", tool_uses, truncated: true, stop_reason: "timeout", cost_unknown: true }); return; }
      if (!j) { resolveP({ error: `exit ${code}, no result event: ${(err || out).slice(0, 200)}`, cost_unknown: true, tool_uses }); return; }
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
export async function runSample(item, o, invoke = invokeClaude, skillsRepo = REPO) {
  try { return await runSampleInner(item, o, invoke, skillsRepo); }
  catch (e) { return failedRow(item.task, item.condition, item.sample, `runner error: ${String(e?.message ?? e).slice(0, 200)}`); }
}

async function runSampleInner({ task, condition, sample }, o, invoke, skillsRepo) {
  const dir = mkdtempSync(join(tmpdir(), `vois-eval-${task.id}-${condition}-`));
  try {
    if (condition === "on") copySkills(dir, skillsRepo);
    const r = await invoke({ prompt: renderPrompt(condition, task), cwd: dir, model: o.model, maxTurns: o.maxTurns, budget: o.budget });
    const file = join(dir, "out.tsx");
    const src = r.error ? null : extractCode(existsSync(file) ? readFileSync(file, "utf8") : "", r.result);
    const base = { task: task.id, condition, sample, cost_usd: r.cost_usd ?? 0, duration_ms: r.duration_ms ?? 0, turns: r.turns ?? 0, served_models: r.models ?? [], outside_cwd_access: outsideAccess(r.tool_uses, dir),
      truncated: Boolean(r.truncated), cost_unknown: Boolean(r.cost_unknown),
      // The CLI can fall back to another model on overload. Say so, so a change in pass rate is not blamed on the skills.
      model_mismatch: answeredByOtherModel(r.models, o.model), ...(r.stop_reason ? { stop_reason: r.stop_reason } : {}) };
    if (src && o.saveOutput) { mkdirSync(o.saveOutput, { recursive: true }); writeFileSync(join(o.saveOutput, `${task.id}-${condition}-${sample}.tsx`), src); }
    if (!src) return failedRow(task, condition, sample, r.error ?? "the agent wrote no ./out.tsx and gave no code block", base);
    try { return { ...base, ...scoreSample(src, task) }; }
    catch (e) { return failedRow(task, condition, sample, `scoring error: ${String(e?.message ?? e).slice(0, 200)}`, base); } // the call was paid for: keep its cost and flags
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function skillVersions() {
  const sj = JSON.parse(readFileSync(join(REPO, "skills.json"), "utf8"));
  return Object.fromEntries(SKILLS_UNDER_TEST.map((n) => [n, sj.skills.find((s) => s.name === n)?.version ?? "unknown"]));
}
function gitState() {
  const status = tryExec("git", ["status", "--porcelain"], REPO);
  return { sha: tryExec("git", ["rev-parse", "HEAD"], REPO), status, dirty: status === "unknown" || status.length > 0 };
}
const tryExec = (cmd, args, cwd) => { try { return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return "unknown"; } };

// results/<date>-<model>[-smoke|-partial][-N].json. The model is made safe for a file name, so one with a "/" in it
// cannot create a folder the checker never reads, and a name that is taken gets the next free -N, so a second run on
// the same day never overwrites the first.
export function resultStem({ date, model, smoke, full }) {
  return `${date}-${model.replace(/[^A-Za-z0-9._-]/g, "_")}${smoke ? "-smoke" : full ? "" : "-partial"}`;
}

// Write the file under the first free name. The write itself fails if the name is taken ("wx"), so two runs that
// finish at the same moment, in two shells, take different names instead of one overwriting the other.
export function writeResultFile(resultsDir, parts, text) {
  mkdirSync(resultsDir, { recursive: true });
  const stem = resultStem(parts);
  for (let n = 1; ; n++) {
    const path = join(resultsDir, n === 1 ? `${stem}.json` : `${stem}-${n}.json`);
    try { writeFileSync(path, text, { flag: "wx" }); return path; } catch (e) { if (e.code !== "EEXIST") throw e; }
  }
}

// ---- progress file: every finished sample is appended as one line, so a crash does not throw away what was paid for ----
// Line 1 is a header that pins what this run is (model, samples, tasks, conditions, git sha, skill versions). --resume
// continues a run only if the header still matches, so a resumed run is one run on one version of the skills.
export function progressHeader({ o, plan, startedAt, git, skills }) {
  return {
    type: "header", model: o.model, samples: o.samples, condition: o.condition, max_turns: o.maxTurns,
    tasks: [...new Set(plan.map((p) => p.task.id))], plan_size: plan.length, git_sha: git.sha, git_dirty: git.dirty, git_status: git.status,
    skills, created_at: startedAt,
  };
}
const HEADER_MUST_MATCH = ["model", "samples", "condition", "max_turns", "tasks", "plan_size", "git_sha", "git_status", "skills"];

// Read a progress file. A torn last line (the process died mid-write) is dropped; a bad line anywhere else is an error.
export function loadProgress(path) {
  const lines = readFileSync(path, "utf8").split("\n").filter((l) => l.length > 0);
  const parsed = lines.map((l, i) => { try { return JSON.parse(l); } catch { if (i === lines.length - 1) return null; throw new Error(`${path}: line ${i + 1} is not valid JSON`); } });
  const items = parsed.filter((x) => x !== null);
  const [header, ...rest] = items;
  if (!header || header.type !== "header") throw new Error(`${path}: the first line is not a progress header`);
  const rows = rest.map((x, i) => { if (x?.type !== "row" || typeof x.row !== "object" || x.row === null) throw new Error(`${path}: line ${i + 2} is not a sample row`); return x.row; });
  return { header, rows };
}

export function checkResume(saved, now) {
  const differs = HEADER_MUST_MATCH.filter((k) => JSON.stringify(saved[k]) !== JSON.stringify(now[k]));
  if (differs.length) throw new Error(`cannot resume: the saved run differs from this one in ${differs.join(", ")}`);
}

// Copy the skills once into a scratch folder before the plan starts. A broken checkout then stops the run before anything
// is spent, instead of turning every skills-on sample into an error row while the skills-off ones are still paid for.
export function preflightSkills(repo = REPO) {
  const dir = mkdtempSync(join(tmpdir(), "vois-eval-preflight-"));
  try { copySkills(dir, repo); } finally { rmSync(dir, { recursive: true, force: true }); }
}

export async function main(argv, { invoke = invokeClaude, log = console.log, now = () => new Date(), resultsDir = join(REPO, "vois-eval", "results"), skillsRepo = REPO, git = gitState, progressDir = tmpdir() } = {}) {
  const o = parseArgs(argv);
  const tasks = loadTasks();
  const plan = buildPlan(tasks, o);
  // One timestamp for the whole run, taken at the start: a run that crosses midnight must not get a date and a
  // created_at that disagree, which the results check rejects.
  const startedAt = now().toISOString();
  const gitAtStart = git();
  const date = startedAt.slice(0, 10);
  // Only a run of every default task, with both conditions, and no sample that ended in an error, is "full". A partial run is
  // kept but never compared. The error part is decided after the run.
  const fullPlan = !o.smoke && !o.limit && (!o.tasks || o.tasks === "all") && o.condition === "both";
  // An explicit --out that is taken is refused before anything is spent. The default name cannot clash: it is chosen
  // when the file is written, as the first free one.
  const explicitOut = o.out ? resolve(o.out) : null;
  if (!o.dryrun && explicitOut && existsSync(explicitOut) && !o.force) throw new Error(`${explicitOut} already exists; pass a different --out, or --force to overwrite it`);
  log(`${plan.length} call(s): ${new Set(plan.map((p) => p.task.id)).size} task(s) x ${o.condition === "both" ? "2 conditions" : o.condition} x ${o.samples} sample(s)`);
  if (o.dryrun) { for (const p of plan.slice(0, 20)) log(`  ${p.task.id} ${p.condition} #${p.sample}`); if (plan.length > 20) log(`  ... and ${plan.length - 20} more`); return null; }
  if (plan.some((p) => p.condition === "on")) preflightSkills(skillsRepo);

  // Progress file: new runs create it (and refuse to reuse one), --resume continues one whose header still matches.
  const progressPath = resolve(o.progress ?? join(progressDir, `vois-eval-progress-${startedAt.replace(/[^0-9]/g, "")}-${randomUUID().slice(0, 8)}.jsonl`));
  const header = progressHeader({ o, plan, startedAt, git: gitAtStart, skills: skillVersions() });
  const results = new Array(plan.length);
  let startedAtRun = startedAt;
  if (o.resume) {
    if (!existsSync(progressPath)) throw new Error(`--resume: ${progressPath} does not exist`);
    const { header: saved, rows: allRows } = loadProgress(progressPath);
    checkResume(saved, header);
    let rows = allRows;
    if (o.retryerrors) {
      // Drop the samples that ended in an error (a usage limit, an outage) so they are run again. The file is rewritten
      // whole to a temporary name and renamed, so a crash cannot leave it half written.
      rows = allRows.filter((r) => !r.error);
      const tmp = `${progressPath}.tmp`;
      writeFileSync(tmp, [JSON.stringify(saved), ...rows.map((r) => JSON.stringify({ type: "row", row: r }))].join("\n") + "\n");
      renameSync(tmp, progressPath);
      log(`retrying ${allRows.length - rows.length} sample(s) that ended in an error`);
    }
    const keyOf = (r) => `${r.task}|${r.condition}|${r.sample}`;
    const wanted = new Map(plan.map((p, i) => [`${p.task.id}|${p.condition}|${p.sample}`, i]));
    for (const r of rows) { const i = wanted.get(keyOf(r)); if (i === undefined) throw new Error(`cannot resume: the progress file has a sample (${keyOf(r)}) that is not in this plan`); if (results[i]) throw new Error(`cannot resume: ${keyOf(r)} appears twice in the progress file`); results[i] = r; }
    startedAtRun = saved.created_at; // one run, one start time, even across a restart
    log(`resuming: ${rows.length} of ${plan.length} sample(s) already done (${progressPath})`);
  } else {
    mkdirSync(join(progressPath, ".."), { recursive: true });
    try { writeFileSync(progressPath, JSON.stringify(header) + "\n", { flag: "wx" }); } catch (e) { if (e.code === "EEXIST") throw new Error(`${progressPath} already exists; pass --resume to continue that run, or a different --progress`); throw e; }
    log(`progress is saved to ${progressPath} (if this run dies, continue it with the same arguments plus --resume --progress ${progressPath})`);
  }
  const todo = plan.map((_, i) => i).filter((i) => !results[i]);
  let next = 0, done = plan.length - todo.length, inARow = 0, stopped = null;
  const worker = async () => {
    // Stop launching samples after a run of errors in a row: when the account hits its usage limit, or the service is down,
    // every remaining sample fails the same way, and a results file full of them is worse than none.
    while (next < todo.length && !stopped) {
      const i = todo[next++];
      results[i] = await runSample(plan[i], o, invoke, skillsRepo);
      appendFileSync(progressPath, JSON.stringify({ type: "row", row: results[i] }) + "\n");
      inARow = results[i].error ? inARow + 1 : 0;
      if (inARow >= BREAKER_AFTER && !stopped) stopped = `${BREAKER_AFTER} samples in a row ended in an error (the latest: ${results[i].error})`;
      log(`  [${++done}/${plan.length}] ${results[i].task} ${results[i].condition} #${results[i].sample}: ${results[i].error ? "ERROR " + results[i].error : results[i].pass ? "pass" : "fail"}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(o.concurrency, todo.length) }, worker));
  if (stopped) {
    const saved = results.filter(Boolean).length;
    throw new Error(`${stopped}. Stopped before spending more: ${saved} of ${plan.length} samples are saved in ${progressPath}, and no results file was written. `
      + `Fix the cause (a usage limit resets on its own), then continue with the same arguments plus --resume --retry-errors --progress ${progressPath}`);
  }
  const errored = results.filter((r) => r.error).length;
  const full = fullPlan && errored === 0;
  if (errored) log(`\nwarning: ${errored} of ${plan.length} sample(s) ended in an error, so this run is saved as partial and will not be compared. Re-run just those with the same arguments plus --resume --retry-errors --progress ${progressPath}`);

  // The skills are copied from the working tree for every sample. If the tree changed while the run was going, the samples
  // do not all share one skill text, so the run is recorded as not reproducible.
  const gitAtEnd = git();
  const gitChanged = gitAtEnd.sha !== gitAtStart.sha || gitAtEnd.dirty !== gitAtStart.dirty || gitAtEnd.status !== gitAtStart.status;
  const gitDirty = gitAtStart.dirty || gitChanged;
  if (gitChanged) log("\nnote: the repository changed while the run was going, so its samples may not share one skill text; recorded as git_dirty");
  else if (gitDirty) log("\nnote: the working tree has uncommitted changes; the results file records that, because git_sha alone will not reproduce this run");
  const run = {
    schema: "vois-eval-results/1", date: startedAtRun.slice(0, 10), created_at: startedAtRun, model: o.model, smoke: Boolean(o.smoke), full,
    claude_cli: tryExec("claude", ["--version"], REPO), git_sha: gitAtStart.sha, git_dirty: gitDirty,
    isolation: ISOLATION, skills: skillVersions(), samples_per_task: o.samples, conditions: [...new Set(plan.map((p) => p.condition))],
    tasks: [...new Set(plan.map((p) => p.task.id))], results, summary: summarize(results),
  };
  const text = JSON.stringify(run, null, 2) + "\n";
  let out;
  if (explicitOut) {
    mkdirSync(join(explicitOut, ".."), { recursive: true });
    try {
      writeFileSync(explicitOut, text, { flag: o.force ? "w" : "wx" });
      out = explicitOut;
    } catch (e) {
      // A file appeared at --out while the run was going. Do not overwrite it, and do not lose a paid run either.
      if (e.code !== "EEXIST") throw e;
      out = writeResultFile(resultsDir, { date, model: o.model, smoke: o.smoke, full }, text);
      log(`\nnote: ${explicitOut} appeared during the run and was left alone; the results were saved to ${out} instead`);
    }
  } else out = writeResultFile(resultsDir, { date, model: o.model, smoke: o.smoke, full }, text);
  log(`\nwrote ${out}`);
  for (const [c, s] of Object.entries(run.summary)) log(`  ${c}: ${s.pass_rate} pass over ${s.samples} sample(s), ${s.errors} error(s), $${s.cost_usd}${s.outside_access ? `, ${s.outside_access} sample(s) touched files outside the run directory` : ""}`);
  return { out, run };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
}
