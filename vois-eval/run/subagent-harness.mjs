#!/usr/bin/env node
// A second harness for the Phase 2 gate, for machines with no `claude` CLI. A person or an agent runs each prompt in a
// Cursor subagent instead of `claude -p`. It writes rows in the same shape as baseline.mjs, so `baseline.mjs --gate` scores them.
//
// This is NOT the same measurement as baseline.mjs and a file from here must not be mixed with one from there:
//   - the query-only Bash hook cannot be enforced, so other Bash use is not counted (other_bash_attempts is null)
//   - tokens, cost and turns are not available (null / 0, cost_unknown true)
//   - query calls and packet sizes are measured: the copy of query.mjs in each run directory logs every call
//   - files read are measured by the kernel (inotify, see watch-opens.py), not reported by the model
//   - the subagent sees whatever rules its host project loads, which the `claude -p` run does not
//
//   node vois-eval/run/subagent-harness.mjs prepare --tasks <file> --arm skills|retrieval --samples 3 --root /tmp/vois-subagent/<name> [--scenarios A,B]
//   (start watch-opens.py on the root, run one subagent per entry in <root>/manifest.json, stop the watcher)
//   node vois-eval/run/subagent-harness.mjs collect --root <root> --tasks <file> --model <slug> --out <result.json>
//
// Answer quality (the port of quality.mjs): the same design tasks and arm prompts, but each subagent writes ./out.tsx in its run directory,
// and `collect-quality` scores it with the same deterministic scoreSample.
//   node vois-eval/run/subagent-harness.mjs prepare-quality --arms skills,retrieval --samples 1 --root /tmp/vois-subagent/<name> [--tasks LP-01a,LP-01b]
//   (start watch-opens.py on the root, run one subagent per run in manifest.json, stop the watcher)
//   node vois-eval/run/subagent-harness.mjs collect-quality --root <root> --model <slug> --out <quality.json>
//   node vois-eval/run/subagent-harness.mjs quality-gate <quality.json>
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPrompt, loadTasks, ruleRecall, autoMatch, summarize } from "./baseline.mjs";
import { copySkills, extractCode, SKILLS_UNDER_TEST } from "./run.mjs";
import { armPrompt, summarizeArms } from "./quality.mjs";
import { loadTasks as loadDesignTasks } from "./tasks.mjs";
import { scoreSample } from "./score.mjs";

const QUERY_REL = ["skills", "vois-components", "scripts", "query.mjs"];

/** The copy of query.mjs gets a preamble that appends {start, end, argv, code, lines} to logFile for every call. The packet is unchanged. */
export function instrumentQuery(source, logFile) {
  const pre = `import { appendFileSync as __af } from "node:fs";
const __t0 = Math.floor(Date.now() - process.uptime() * 1000), __w = process.stdout.write.bind(process.stdout); let __out = "";
process.stdout.write = (c, ...a) => { __out += typeof c === "string" ? c : Buffer.from(c).toString(); return __w(c, ...a); };
process.on("exit", (code) => { try { __af(${JSON.stringify(logFile)}, JSON.stringify({ start: __t0, end: Date.now(), argv: process.argv.slice(2), code, lines: __out ? __out.trimEnd().split("\\n").length : 0 }) + "\\n"); } catch {} });
`;
  const nl = source.indexOf("\n");
  return source.startsWith("#!") ? source.slice(0, nl + 1) + pre + source.slice(nl + 1) : pre + source;
}

const runName = (id, sample) => `${id}-s${sample}`;

export function prepare({ tasksFile, arm, samples, root, scenarios }) {
  if (!["skills", "retrieval"].includes(arm)) throw new Error("--arm must be skills or retrieval");
  const tasks = loadTasks(resolve(tasksFile)).filter((t) => !scenarios || scenarios.includes(t.id));
  if (scenarios && tasks.length !== scenarios.length) throw new Error("unknown id in --scenarios");
  mkdirSync(root, { recursive: true });
  const manifest = [];
  for (const t of tasks) for (let sample = 1; sample <= samples; sample++) {
    const base = join(root, runName(t.id, sample)), work = join(base, "work"), log = join(base, "log");
    if (existsSync(base)) throw new Error(`${base} exists; use a new --root`);
    mkdirSync(work, { recursive: true }); mkdirSync(log, { recursive: true });
    copySkills(work);
    const q = join(work, ...QUERY_REL);
    writeFileSync(q, instrumentQuery(readFileSync(q, "utf8"), join(log, "query-log.jsonl")));
    const report = join(work, "report.txt");
    const prompt = `${buildPrompt(t.user_prompt, { skills: true, retrieval: arm === "retrieval" })}\n\nWorking rules for this run: your working directory is ${work}. Read and run things only inside it (run shell commands with that as the working directory). Do not open any other folder. When you have your three lines, write exactly those three lines to ${report} with the Write tool, then reply with the same three lines.`;
    writeFileSync(join(log, "prompt.txt"), prompt);
    manifest.push({ id: t.id, sample, arm, work, log, report, prompt });
  }
  writeFileSync(join(root, "manifest.json"), JSON.stringify({ arm, samples, tasks_file: resolve(tasksFile), runs: manifest.map(({ prompt, ...m }) => m) }, null, 2) + "\n");
  return manifest;
}

const readJsonl = (p) => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);

/** Files opened in the run directory, from watch-opens.py. Not counted: opens inside a logged query.mjs call (it reads the index and card json itself), and
 * search sweeps. A text search over skills/ opens every file in a few milliseconds; a model's own Read takes a tool call per file. A sweep is sweepMin or
 * more distinct files inside windowMs. They are returned as `swept` so a person can see them, but they are not reads. */
export function filesOpened(opens, work, queryCalls, { sweepMin = 20, windowMs = 1000 } = {}) {
  const root = work + sep;
  const mine = opens
    .filter((o) => !o.isdir && o.path.startsWith(root) && !queryCalls.some((q) => o.t >= q.start - 50 && o.t <= q.end + 50))
    .filter((o) => { const rel = o.path.slice(root.length); return rel !== "report.txt" && !rel.startsWith("."); })
    .sort((a, b) => a.t - b.t);
  const swept = new Set();
  for (let i = 0, j = 0; i < mine.length; i++) {
    while (mine[i].t - mine[j].t > windowMs) j++;
    const win = new Set(mine.slice(j, i + 1).map((o) => o.path));
    if (win.size >= sweepMin) for (const o of mine.slice(j, i + 1)) swept.add(o.path);
  }
  const rels = (set) => [...set].map((p) => p.slice(root.length)).sort();
  const read = new Set(mine.map((o) => o.path).filter((p) => !swept.has(p)));
  return { read: rels(read), swept: rels(swept) };
}

export function collect({ root, model, tasksFile }) {
  const m = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
  const tasks = new Map(loadTasks(resolve(tasksFile ?? m.tasks_file)).map((t) => [t.id, t]));
  const opens = readJsonl(join(root, "opens.jsonl"));
  const outside = opens.filter((o) => o.outside && !o.isdir).map((o) => o.path);
  const rows = m.runs.map((r) => {
    const s = tasks.get(r.id);
    const calls = readJsonl(join(r.log, "query-log.jsonl"));
    const report = existsSync(r.report) ? readFileSync(r.report, "utf8").trim() : "";
    const { read: paths, swept } = filesOpened(opens, r.work, calls);
    const rc = ruleRecall(report, s.required_rules);
    return {
      scenario: r.id, job: s.source_job, sample: r.sample, error: report ? undefined : "no report.txt written by the subagent",
      cost_usd: 0, cost_unknown: true, turns: 0, duration_ms: 0, truncated: false,
      tokens: { input_tokens: null, cache_write_tokens: null, cache_read_tokens: null, output_tokens: null, total_in: null },
      lookups: {
        read_calls: paths.length, search_calls: null, query_calls: calls.length, other_bash_attempts: null,
        packet_lines: calls.filter((c) => c.code === 0).map((c) => c.lines), query_exit_codes: calls.map((c) => c.code), bash_commands: calls.map((c) => ({ command: ["node skills/vois-components/scripts/query.mjs", ...c.argv].join(" ").slice(0, 200), blocked: false })),
        files_read: paths.length, file_paths: paths, search_sweep_files: swept.length, skill_bytes_read: null, skill_tokens_est: null,
      },
      rule_recall: rc?.recall, rules_missing: rc?.missing, auto_match: s.expected_outcome ? autoMatch(report, s) : null, report: report.slice(0, 1500),
    };
  });
  const arm = m.arm;
  return { model, harness: "cursor-subagent", harness_note: "Not comparable with baseline.mjs files: no Bash hook, no tokens or cost, other Bash use and searches unmeasured (a burst of 20 or more file opens inside one second is treated as a text search and not counted as reads; see search_sweep_files), host project rules visible to the subagent. Query calls, packet lines and file opens are measured.", samples_per_scenario: m.samples, skills: SKILLS_UNDER_TEST, arm, outside_opens: outside, rows, summary: summarize(rows) };
}

const qualityRunName = (id, arm, sample) => `${id}-${arm}-s${sample}`;

/** One run directory per task x arm x sample. The prompt is quality.mjs's armPrompt, plus the working rules every run here carries. */
export function prepareQuality({ arms = ["skills", "retrieval"], samples, root, taskIds }) {
  const all = loadDesignTasks();
  const tasks = taskIds ? all.filter((t) => taskIds.includes(t.id)) : all;
  if (taskIds && tasks.length !== taskIds.length) throw new Error("unknown id in --tasks");
  const bad = arms.filter((a) => !["skills", "retrieval"].includes(a));
  if (!arms.length || bad.length) throw new Error("--arms takes skills and/or retrieval");
  mkdirSync(root, { recursive: true });
  const runs = [];
  for (const t of tasks) for (const arm of arms) for (let sample = 1; sample <= samples; sample++) {
    const base = join(root, qualityRunName(t.id, arm, sample)), work = join(base, "work"), log = join(base, "log");
    if (existsSync(base)) throw new Error(`${base} exists; use a new --root`);
    mkdirSync(work, { recursive: true }); mkdirSync(log, { recursive: true });
    copySkills(work);
    const q = join(work, ...QUERY_REL);
    if (arm === "retrieval") writeFileSync(q, instrumentQuery(readFileSync(q, "utf8"), join(log, "query-log.jsonl")));
    const out = join(work, "out.tsx");
    const prompt = `${armPrompt(arm, t)}\n\nWorking rules for this run: your working directory is ${work}. Read and run things only inside it${arm === "retrieval" ? " (run shell commands with that as the working directory)" : ""}. Do not open any other folder. Write the file to ${out} (that is the ./out.tsx above) with the Write tool, then reply with one line.`;
    writeFileSync(join(log, "prompt.txt"), prompt);
    runs.push({ id: t.id, sample, arm, work, log, out, prompt });
  }
  writeFileSync(join(root, "manifest.json"), JSON.stringify({ kind: "quality", arms, samples, runs: runs.map(({ prompt, ...m }) => m) }, null, 2) + "\n");
  return runs;
}

/** Rows in quality.mjs's shape, so summarizeArms and the gate rule apply unchanged. A run with no out.tsx is an error row and counts as a fail. */
export function collectQuality({ root, model }) {
  const m = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
  if (m.kind !== "quality") throw new Error("this root was not made by prepare-quality");
  const tasks = new Map(loadDesignTasks().map((t) => [t.id, t]));
  const opens = readJsonl(join(root, "opens.jsonl"));
  const outside = opens.filter((o) => o.outside && !o.isdir).map((o) => o.path);
  const rows = m.runs.map((r) => {
    const calls = readJsonl(join(r.log, "query-log.jsonl"));
    const { read, swept } = filesOpened(opens, r.work, calls);
    const file = existsSync(r.out) ? readFileSync(r.out, "utf8") : "";
    const src = extractCode(file, "");
    const base = { task: r.id, arm: r.arm, sample: r.sample, cost_usd: 0, cost_unknown: true, turns: 0, duration_ms: 0, queries: calls.length, query_exit_codes: calls.map((c) => c.code), truncated: false, model_mismatch: false,
      outside_cwd_access: [], files_read: read.length, file_paths: read.filter((p) => p !== "out.tsx"), search_sweep_files: swept.length };
    if (!src) return { ...base, pass: false, error: "the subagent wrote no out.tsx" };
    try { return { ...base, ...scoreSample(src, tasks.get(r.id)) }; }
    catch (e) { return { ...base, pass: false, error: `scoring error: ${String(e?.message ?? e).slice(0, 200)}` }; }
  });
  return { schema: "vois-eval-quality/1", harness: "cursor-subagent", harness_note: "Not comparable with quality.mjs files: no cost, turns or tokens; the query-only hook is not enforced; other Bash use is unmeasured; host project rules visible to the subagent. Pass/fail is the same deterministic scoreSample. Query calls and file opens are measured.", date: new Date().toISOString().slice(0, 10), model, samples_per_task: m.samples, arms: m.arms, outside_opens: outside, summary: summarizeArms(rows), results: rows };
}

/** The Phase 2 quality rule: retrieval pass_rate >= skills pass_rate, over the same number of samples, with no more errors on the retrieval side than it can explain. */
export function qualityGate(file) {
  const { skills, retrieval } = file.summary ?? {};
  if (!skills || !retrieval) return { pass: false, reason: "both arms are needed", skills: skills?.pass_rate ?? null, retrieval: retrieval?.pass_rate ?? null };
  const checks = [
    { name: "same number of samples in both arms", pass: skills.samples === retrieval.samples },
    { name: "retrieval pass_rate >= skills pass_rate", pass: retrieval.pass_rate >= skills.pass_rate },
  ];
  const perTask = {};
  for (const r of file.results) { const k = (perTask[r.task] ??= { skills: 0, retrieval: 0, n: 0 }); k[r.arm] += r.pass ? 1 : 0; if (r.arm === "retrieval") k.n++; }
  const worse = Object.entries(perTask).filter(([, v]) => v.retrieval < v.skills).map(([id, v]) => `${id} (${v.retrieval} vs ${v.skills} of ${v.n})`);
  return { pass: checks.every((c) => c.pass), skills: skills.pass_rate, retrieval: retrieval.pass_rate, errors: { skills: skills.errors, retrieval: retrieval.errors }, checks, tasks_where_retrieval_is_worse: worse };
}

function main() {
  const [cmd, ...argv] = process.argv.slice(2);
  const v = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  if (cmd === "prepare") {
    const root = resolve(v("--root") ?? "");
    const man = prepare({ tasksFile: v("--tasks"), arm: v("--arm"), samples: Number(v("--samples") ?? 3), root, scenarios: v("--scenarios")?.split(",") });
    console.log(`${man.length} runs prepared under ${root}; manifest.json lists them`);
  } else if (cmd === "collect") {
    const f = collect({ root: resolve(v("--root")), model: v("--model"), tasksFile: v("--tasks") });
    if (existsSync(resolve(v("--out")))) throw new Error(`${v("--out")} exists`);
    writeFileSync(resolve(v("--out")), JSON.stringify(f, null, 2) + "\n");
    console.log(JSON.stringify(f.summary, null, 2));
    if (f.outside_opens.length) console.log(`WARNING: ${f.outside_opens.length} opens outside the run directories (held-out or eval files): ${f.outside_opens.slice(0, 5).join(", ")}`);
  } else if (cmd === "prepare-quality") {
    const runs = prepareQuality({ arms: (v("--arms") ?? "skills,retrieval").split(","), samples: Number(v("--samples") ?? 1), root: resolve(v("--root") ?? ""), taskIds: v("--tasks")?.split(",") });
    console.log(`${runs.length} runs prepared under ${resolve(v("--root"))}; manifest.json lists them`);
  } else if (cmd === "collect-quality") {
    const f = collectQuality({ root: resolve(v("--root")), model: v("--model") });
    if (existsSync(resolve(v("--out")))) throw new Error(`${v("--out")} exists`);
    writeFileSync(resolve(v("--out")), JSON.stringify(f, null, 2) + "\n");
    console.log(JSON.stringify(f.summary, null, 2));
    if (f.outside_opens.length) console.log(`WARNING: ${f.outside_opens.length} opens outside the run directories: ${f.outside_opens.slice(0, 5).join(", ")}`);
  } else if (cmd === "quality-gate") {
    const g = qualityGate(JSON.parse(readFileSync(resolve(argv[0]), "utf8")));
    console.log(JSON.stringify(g, null, 2));
    process.exit(g.pass ? 0 : 1);
  } else { console.error("usage: subagent-harness.mjs prepare|collect|prepare-quality|collect-quality|quality-gate ..."); process.exit(1); }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { try { main(); } catch (e) { console.error(e.message); process.exit(1); } }
