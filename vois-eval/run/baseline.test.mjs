import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { autoMatch, lookups, tokensOf, summarize, buildPrompt, loadTasks, gate, REPORT_ID_HINT } from "./baseline.mjs";
import { main as queryMain, loadAll as loadQuery } from "../../vois-components/scripts/query.mjs";

const FAKE = fileURLToPath(new URL("./fake-claude.cjs", import.meta.url));
const SCRIPT = fileURLToPath(new URL("./baseline.mjs", import.meta.url));
const scenario = { expected_outcome: "Sheet (right-anchored, partial overlap)", forbidden_outcomes: ["Popover", "Dialog (modal)"] };

test("autoMatch: the first line names the expected component and no forbidden one", () => {
  assert.equal(autoMatch("Sheet, right-anchored\n2\n3", scenario).match, true);
  assert.equal(autoMatch("Popover\n2\n3", scenario).match, false);
  assert.deepEqual(autoMatch("Popover or Sheet\n2\n3", scenario).forbidden_named, ["popover"]);
  assert.equal(autoMatch("Popover or Sheet\n2\n3", scenario).match, false, "naming a forbidden one too is not a match");
});
test("autoMatch: an empty or missing report, or an odd scenario, is no match and does not throw", () => {
  for (const r of ["", null, undefined, "\n\n"]) assert.equal(autoMatch(r, scenario).match, false);
  assert.equal(autoMatch("Sheet", {}).match, false);
  assert.equal(autoMatch("Sheet", { expected_outcome: "Sheet", forbidden_outcomes: [null, 5, { outcome: "Popover" }] }).match, true);
});
test("autoMatch: a word inside a longer word does not count", () => {
  assert.equal(autoMatch("Sheets of paper\n2\n3", scenario).match, false);
});

test("lookups counts Read calls, search calls and only files under the run directory", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-"));
  try {
    writeFileSync(join(dir, "a.md"), "x".repeat(400));
    const uses = [
      { name: "Read", input: { file_path: join(dir, "a.md") } },
      { name: "Read", input: { file_path: "a.md" } },            // the same file again: two calls, one file
      { name: "Read", input: { file_path: "/etc/hostname" } },    // outside the run directory: a call, but no skill bytes
      { name: "Grep", input: {} }, { name: "Glob", input: {} }, { name: "Write", input: {} },
    ];
    const l = lookups(uses, dir);
    assert.deepEqual([l.read_calls, l.search_calls, l.files_read, l.skill_bytes_read, l.skill_tokens_est], [3, 2, 1, 400, 100]);
    assert.equal(lookups(undefined, dir).read_calls, 0);
    assert.equal(lookups([{ name: "Read", input: {} }, { name: "Read" }], dir).files_read, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("a file reached by the real path counts when the run directory is a link to it (macOS /var -> /private/var)", () => {
  const real = mkdtempSync(join(tmpdir(), "bl-real-"));
  const link = real + "-link";
  const outside = mkdtempSync(join(tmpdir(), "bl-out-"));
  try {
    symlinkSync(real, link);
    writeFileSync(join(real, "a.md"), "x".repeat(400));
    writeFileSync(join(outside, "secret.md"), "y".repeat(900));
    symlinkSync(join(outside, "secret.md"), join(real, "escape.md"));
    const l = lookups([
      { name: "Read", input: { file_path: join(real, "a.md") } },     // real spelling, directory given as the link (the old check missed this)
      { name: "Read", input: { file_path: join(real, "escape.md") } }, // a link inside the directory that leaves it
    ], link);
    assert.deepEqual([l.read_calls, l.files_read, l.skill_bytes_read], [2, 1, 400]);
  } finally { for (const d of [real, link, outside]) rmSync(d, { recursive: true, force: true }); }
});
test("a Read of a path under the run directory that does not exist is a call but not a file read", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-miss-"));
  try {
    const l = lookups([{ name: "Read", input: { file_path: join(dir, "skills", "nope", "SKILL.md") } }], dir);
    assert.deepEqual([l.read_calls, l.files_read, l.skill_bytes_read], [1, 0, 0]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("a sibling folder that shares the run directory's name as a prefix is outside it", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-"));
  try { assert.equal(lookups([{ name: "Read", input: { file_path: dir + "-other/x.md" } }], dir).files_read, 0); }
  finally { rmSync(dir, { recursive: true, force: true }); }
});

test("tokensOf adds the cache counts into total_in and survives a missing usage", () => {
  assert.deepEqual(tokensOf({ input_tokens: 5, cache_creation_input_tokens: 100, cache_read_input_tokens: 1000, output_tokens: 7 }),
    { input_tokens: 5, cache_write_tokens: 100, cache_read_tokens: 1000, output_tokens: 7, total_in: 1105 });
  assert.equal(tokensOf(undefined).total_in, 0);
});

test("summarize ignores errored rows for the medians and counts them", () => {
  const row = (cost, total_in, reads, match) => ({ cost_usd: cost, tokens: { total_in, output_tokens: 10 }, turns: 3, lookups: { read_calls: reads, search_calls: 0, files_read: reads, skill_tokens_est: reads * 100 }, auto_match: { match } });
  const s = summarize([row(1, 100, 2, true), row(3, 300, 4, false), row(2, 200, 3, true), { error: "x", cost_usd: 0 }]);
  assert.equal(s.errored, 1);
  assert.equal(s.total_in_tokens.median, 200);
  assert.equal(s.cost_usd.total, 6);
  assert.equal(s.auto_match_rate, 0.667);
  assert.equal(summarize([]).auto_match_rate, null);
});

test("the prompt asks for a decision only and does not pass the scenario's expected outcome", () => {
  const p = buildPrompt("Edit a status inline");
  assert.match(p, /Edit a status inline/);
  assert.match(p, /Decide only/);
  assert.doesNotMatch(p, /expected|forbidden/i);
});

function run(args, cfg) {
  return spawnSync("node", [SCRIPT, ...args], { encoding: "utf8", env: { ...process.env, FAKE_CLAUDE: JSON.stringify(cfg ?? {}) } });
}
const ok = { events: [
  { type: "assistant", message: { content: [{ type: "tool_use", name: "Read", input: { file_path: "skills/vois-components/SKILL.md" } }] } },
  { type: "result", subtype: "success", is_error: false, result: "Sheet\nvois-components SKILL.md\nnothing", total_cost_usd: 0.25, num_turns: 3,
    usage: { input_tokens: 10, cache_creation_input_tokens: 5000, cache_read_input_tokens: 20000, output_tokens: 80 }, modelUsage: { "claude-sonnet-5-5": {} } },
] };

test("end to end with a fake CLI: one row, skill bytes counted, file written, resume skips finished samples", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-e2e-"));
  const out = join(dir, "r.json");
  try {
    const args = ["--model", "claude-sonnet-5-5", "--scenarios", "EVAL-006", "--samples", "1", "--bin", FAKE, "--out", out];
    const r = run(args, ok);
    assert.equal(r.status, 0, r.stderr);
    const f = JSON.parse(readFileSync(out, "utf8"));
    assert.equal(f.rows.length, 1);
    assert.equal(f.rows[0].tokens.total_in, 25010);
    assert.equal(f.rows[0].lookups.read_calls, 1);
    assert.ok(f.rows[0].lookups.skill_bytes_read > 1000, "the copied SKILL.md was found and sized");
    assert.equal(f.rows[0].auto_match.match, true);
    assert.equal(f.summary.cost_usd.total, 0.25);
    assert.notEqual(run(args, ok).status, 0, "an existing file is not overwritten");
    const again = run([...args, "--resume"], { events: [] });
    assert.equal(again.status, 0, again.stderr);
    assert.equal(JSON.parse(readFileSync(out, "utf8")).rows.length, 1, "the finished sample was not run again");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a wrong model, an auth error and a missing result are recorded as errors, and --resume runs them again", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-err-"));
  const out = join(dir, "r.json");
  try {
    const args = ["--model", "claude-sonnet-5-5", "--scenarios", "EVAL-006", "--samples", "1", "--bin", FAKE, "--out", out];
    const wrong = { events: [{ ...ok.events[1], modelUsage: { "claude-haiku-5-5": {} } }] };
    run(args, wrong);
    assert.match(JSON.parse(readFileSync(out, "utf8")).rows[0].error, /not claude-sonnet-5-5/);
    run([...args, "--resume"], { events: [] });
    assert.match(JSON.parse(readFileSync(out, "utf8")).rows[0].error, /no result event/);
    run([...args, "--resume"], ok);
    const f = JSON.parse(readFileSync(out, "utf8"));
    assert.equal(f.rows.length, 1);
    assert.equal(f.rows[0].error, undefined);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("bad arguments stop before any call", () => {
  assert.notEqual(run(["--model", "m", "--scenarios", "EVAL-999", "--bin", FAKE]).status, 0);
  assert.notEqual(run(["--model", "m", "--samples", "0"]).status, 0);
  assert.notEqual(run(["--bogus"]).status, 0);
  const noModel = run(["--bin", FAKE]);
  assert.notEqual(noModel.status, 0);
  assert.match(noModel.stderr, /--model is required/, "stops on the missing model, before any call");
});

test("the normal prompt keeps its exact wording, with no stray backslash", () => {
  assert.ok(buildPrompt("T").includes("Do not write code. Do not read the `vois-eval` folder. Reply in exactly three lines:"));
});
test("the control prompt does not mention skills; the normal prompt does", () => {
  const off = buildPrompt("Pick a date", { skills: false });
  assert.match(off, /Pick a date/);
  assert.doesNotMatch(off, /skill|Vois|\.\/skills/i);
  assert.match(buildPrompt("Pick a date"), /skills/i);
});

test("loadTasks takes a tasks file, and rejects a missing prompt, a blank or non-string id, a duplicate id and an empty list", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-tasks-"));
  const w = (name, v) => { const p = join(dir, name); writeFileSync(p, JSON.stringify(v)); return p; };
  try {
    assert.equal(loadTasks(w("a.json", { tasks: [{ id: "H-1", user_prompt: "x" }] })).length, 1);
    assert.equal(loadTasks(w("b.json", [{ id: "H-1", user_prompt: "x" }])).length, 1, "a bare list works too");
    for (const bad of [{ tasks: [] }, {}, { tasks: [{ id: "H-1" }] }, { tasks: [{ id: "H-1", user_prompt: "  " }] },
      { tasks: [{ id: " ", user_prompt: "x" }] }, { tasks: [{ id: 1, user_prompt: "x" }] }, { tasks: [null] },
      { tasks: [{ id: "H-1", user_prompt: "x" }, { id: "H-1", user_prompt: "y" }] }]) {
      assert.throws(() => loadTasks(w("bad.json", bad)), /no tasks|every task needs|duplicate/, JSON.stringify(bad));
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("--tasks with --no-skills: no skills are copied, there is no auto_match, and the file says no skills", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-ctl-"));
  const out = join(dir, "r.json");
  const tasks = join(dir, "t.json");
  try {
    writeFileSync(tasks, JSON.stringify({ tasks: [{ id: "HELD-01", user_prompt: "Confirm a delete", om_answer: "never sent" }] }));
    const r = run(["--model", "claude-sonnet-5-5", "--tasks", tasks, "--no-skills", "--samples", "1", "--bin", FAKE, "--out", out], ok);
    assert.equal(r.status, 0, r.stderr);
    const f = JSON.parse(readFileSync(out, "utf8"));
    assert.deepEqual(f.skills, []);
    assert.equal(f.rows[0].scenario, "HELD-01");
    assert.equal(f.rows[0].auto_match, null);
    assert.equal(f.rows[0].lookups.read_calls, 1, "the fake model still tried to read a skill file");
    assert.equal(f.rows[0].lookups.files_read, 0, "but no skills folder was there to find");
    assert.equal(f.rows[0].lookups.skill_bytes_read, 0);
    assert.equal(f.summary.auto_match_rate, null);
    const withSkills = join(dir, "s.json");
    assert.equal(run(["--model", "claude-sonnet-5-5", "--tasks", tasks, "--samples", "1", "--bin", FAKE, "--out", withSkills], ok).status, 0);
    assert.ok(JSON.parse(readFileSync(withSkills, "utf8")).rows[0].lookups.skill_bytes_read > 1000, "without --no-skills the same task does find the skills");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("retrieval arm: the one-line hint is in the prompt only with --retrieval, and only with skills", async () => {
  const { buildPrompt: bp, QUERY_CMD, RETRIEVAL_ALLOWED } = await import("./baseline.mjs");
  assert.ok(bp("x", { skills: true, retrieval: true }).includes(QUERY_CMD));
  assert.ok(!bp("x", { skills: true }).includes("query.mjs"), "the plain skills arm does not mention the script");
  assert.ok(!bp("x", { skills: false, retrieval: true }).includes("query.mjs"), "the no-skills control never mentions it");
  assert.deepEqual(RETRIEVAL_ALLOWED, [`Bash(${QUERY_CMD}:*)`], "Bash is allowed for that one command only");
});

test("retrieval arm: Bash is made available and allowed only for the query command, and never without --retrieval", async () => {
  const { invokeClaude, TOOLS } = await import("./run.mjs");
  const { RETRIEVAL_ALLOWED } = await import("./baseline.mjs");
  const dir = mkdtempSync(join(tmpdir(), "bl-argv-"));
  try {
    process.env.FAKE_CLAUDE = JSON.stringify({ events: [] });
    await invokeClaude({ prompt: "p", cwd: dir, model: "m", maxTurns: 1, budget: 1, bin: FAKE, extraAllowed: RETRIEVAL_ALLOWED });
    let argv = JSON.parse(readFileSync(join(dir, "argv.json"), "utf8"));
    assert.equal(argv[argv.indexOf("--tools") + 1], [...TOOLS, "Bash"].join(","));
    const allowed = argv.slice(argv.indexOf("--allowedTools") + 1, argv.indexOf("--max-turns"));
    assert.deepEqual(allowed, [...TOOLS, ...RETRIEVAL_ALLOWED]);
    assert.ok(!allowed.includes("Bash"), "a bare Bash permission would allow any command");
    await invokeClaude({ prompt: "p", cwd: dir, model: "m", maxTurns: 1, budget: 1, bin: FAKE });
    argv = JSON.parse(readFileSync(join(dir, "argv.json"), "utf8"));
    assert.equal(argv[argv.indexOf("--tools") + 1], TOOLS.join(","), "no Bash on the other arms");
    assert.ok(!argv.join(" ").includes("Bash"));
  } finally { delete process.env.FAKE_CLAUDE; rmSync(dir, { recursive: true, force: true }); }
});

test("retrieval arm: query calls are counted, the arm is recorded, and it cannot be combined with --no-skills", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-ret-"));
  const out = join(dir, "r.json");
  try {
    const events = { events: [
      { type: "assistant", message: { content: [
        { type: "tool_use", name: "Bash", input: { command: "node skills/vois-components/scripts/query.mjs --jobs" } },
        { type: "tool_use", name: "Bash", input: { command: "ls" } },
      ] } },
      ok.events[1],
    ] };
    const base = ["--model", "claude-sonnet-5-5", "--scenarios", "EVAL-006", "--samples", "1", "--bin", FAKE];
    const r = run([...base, "--retrieval", "--out", out], events);
    assert.equal(r.status, 0, r.stderr);
    const f = JSON.parse(readFileSync(out, "utf8"));
    assert.equal(f.arm, "retrieval");
    assert.equal(f.rows[0].lookups.query_calls, 1, "only a plain query.mjs command counts");
    assert.equal(f.rows[0].lookups.other_bash_attempts, 1, "any other Bash attempt is counted apart");
    assert.equal(f.summary.query_calls.median, 1);
    const bad = run([...base, "--retrieval", "--no-skills", "--out", join(dir, "x.json")], events);
    assert.notEqual(bad.status, 0);
    assert.match(bad.stderr, /cannot be combined/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("query-only hook: one plain query.mjs call passes, every way of adding another command is blocked", () => {
  const HOOK = fileURLToPath(new URL("./query-only-hook.cjs", import.meta.url));
  const Q = "node skills/vois-components/scripts/query.mjs";
  const verdict = (command) => spawnSync("node", [HOOK], { input: JSON.stringify({ tool_name: "Bash", tool_input: { command } }), encoding: "utf8" }).status;
  for (const ok of [`${Q} --jobs`, `${Q} --job JOB-CONFIRM-DESTRUCTIVE`, `${Q} AlertDialog`, `${Q} --id DS-MODAL-004 --full`]) assert.equal(verdict(ok), 0, ok);
  for (const bad of [
    `${Q} --jobs; ls`, `${Q} --jobs && ls`, `${Q} --jobs | head`, `${Q} --jobs\nls`, `${Q} $(ls)`, `${Q} \`ls\``, `${Q} > out.txt`, `${Q} --jobs & ls`,
    `${Q} "x"`, `${Q} 'x'`, `${Q} --jobs || ls`, `ls`, `cat skills/vois-patterns/SKILL.md`, "node ./skills/vois-components/scripts/query.mjs", ` ${Q}`, `${Q}  --jobs`, `node skills/vois-components/scripts/query.mjs.evil`,
    `node skills/vois-components/scripts/query.mjs --jobs\r`, "",
  ]) assert.equal(verdict(bad), 2, JSON.stringify(bad));
  for (const input of ["", "not json", "{}", JSON.stringify({ tool_input: { command: 5 } })]) assert.equal(spawnSync("node", [HOOK], { input, encoding: "utf8" }).status, 2, `bad input fails closed: ${input}`);
});

test("query-only hook: the counter in baseline.mjs and the hook use the same pattern, and the hook is installed into the run directory", async () => {
  const { installQueryOnlyHook } = await import("./baseline.mjs");
  const src = (f) => readFileSync(new URL(f, import.meta.url), "utf8").match(/\/(\^node skills[^\n]*?\$)\/[;\s]/)?.[1];
  assert.ok(src("./baseline.mjs"), "pattern found in baseline.mjs");
  assert.equal(src("./baseline.mjs"), src("./query-only-hook.cjs"));
  const dir = mkdtempSync(join(tmpdir(), "bl-hook-"));
  try {
    installQueryOnlyHook(dir);
    const s = JSON.parse(readFileSync(join(dir, ".claude", "settings.json"), "utf8"));
    assert.equal(s.hooks.PreToolUse[0].matcher, "Bash");
    assert.equal(s.hooks.PreToolUse[0].hooks[0].command, "node .claude/query-only-hook.cjs");
    assert.ok(readFileSync(join(dir, ".claude", "query-only-hook.cjs"), "utf8").includes("exit(2)"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("ruleRecall: whole ids only, any case, nothing required means null", async () => {
  const { ruleRecall } = await import("./baseline.mjs");
  assert.deepEqual(ruleRecall("used DS-MODAL-004 and ds-panel-003.", ["DS-MODAL-004", "DS-PANEL-003"]), { recall: 1, missing: [] });
  assert.deepEqual(ruleRecall("DS-MODAL-0041, XDS-MODAL-004", ["DS-MODAL-004"]), { recall: 0, missing: ["DS-MODAL-004"] }, "an id inside a longer token is not a hit");
  assert.equal(ruleRecall("DS-MODAL-004", ["DS-MODAL-00"]).recall, 0, "a prefix of a real id is not a hit");
  assert.equal(ruleRecall("DS-MODAL-004", ["DS-MODAL-004", "DS-MODAL-004"]).recall, 1, "a repeated required id counts once");
  assert.equal(ruleRecall("x", []), null);
  assert.equal(ruleRecall("x", undefined), null);
  assert.equal(ruleRecall(null, ["DS-A-1"]).recall, 0);
  assert.equal(ruleRecall("a.b", ["A.B"]).recall, 1, "regex characters in an id are not special");
  assert.equal(ruleRecall("axb", ["A.B"]).recall, 0);
});

test("lookups records packet size per query call and every Bash command, blocked or not", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-pk-"));
  try {
    const Q = "node skills/vois-components/scripts/query.mjs";
    const uses = [
      { id: "a", name: "Bash", input: { command: `${Q} --jobs` } },
      { id: "b", name: "Bash", input: { command: `${Q} --jobs; ls` } },
      { id: "c", name: "Bash", input: { command: `${Q} Dialog` } },
      { id: "d", name: "Bash", input: { command: "ls" } },
    ];
    const results = { a: { text: "one\ntwo\nthree\n", is_error: false }, b: { text: "blocked", is_error: true }, c: { text: "x", is_error: true }, d: { text: "skills", is_error: false } };
    const l = lookups(uses, dir, results);
    assert.deepEqual(l.packet_lines, [3], "only a query call that was not blocked has a packet, and trailing blank lines are not counted");
    assert.equal(l.query_calls, 2);
    assert.equal(l.other_bash_attempts, 2);
    assert.deepEqual(l.bash_commands.map((c) => c.blocked), [false, true, true, false]);
    assert.equal(lookups(uses, dir).packet_lines.length, 0, "without results there is no packet size and nothing throws");
    assert.equal(lookups(uses, dir).bash_commands[0].blocked, null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("rows carry rule_recall for tasks that list required_rules, and the summary reports packet size and recall", () => {
  const dir = mkdtempSync(join(tmpdir(), "bl-rr-"));
  try {
    const tasks = join(dir, "t.json"), out = join(dir, "r.json");
    writeFileSync(tasks, JSON.stringify({ tasks: [{ id: "T-1", user_prompt: "x", required_rules: ["DS-MODAL-004", "DS-PANEL-003"] }, { id: "T-2", user_prompt: "y" }] }));
    const events = { events: [
      { type: "assistant", message: { content: [{ type: "tool_use", id: "q1", name: "Bash", input: { command: "node skills/vois-components/scripts/query.mjs --jobs" } }] } },
      { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "q1", content: [{ type: "text", text: "a\nb" }] }] } },
      { type: "result", subtype: "success", is_error: false, result: "Sheet\nDS-MODAL-004\nnothing", total_cost_usd: 0.1, num_turns: 2,
        usage: { input_tokens: 1, output_tokens: 1 }, modelUsage: { "claude-sonnet-5-5": {} } },
    ] };
    const r = run(["--model", "claude-sonnet-5-5", "--tasks", tasks, "--retrieval", "--samples", "1", "--bin", FAKE, "--out", out], events);
    assert.equal(r.status, 0, r.stderr);
    const f = JSON.parse(readFileSync(out, "utf8"));
    const t1 = f.rows.find((x) => x.scenario === "T-1"), t2 = f.rows.find((x) => x.scenario === "T-2");
    assert.equal(t1.rule_recall, 0.5);
    assert.deepEqual(t1.rules_missing, ["DS-PANEL-003"]);
    assert.equal(t2.rule_recall, undefined, "a task with no required rules has no recall");
    assert.deepEqual(t1.lookups.packet_lines, [2]);
    assert.deepEqual(f.summary.rule_recall, { samples: 1, mean: 0.5, full: 0 });
    assert.equal(f.summary.packet_lines.count, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("the retrieval hint names only flags query.mjs accepts, and the ids it shows resolve", () => {
  const hint = buildPrompt("x", { skills: true, retrieval: true });
  const all = loadQuery();
  const flags = [...new Set(hint.match(/--[a-z]+/g) || [])];
  for (const f of ["--jobs", "--patterns", "--group", "--fields", "--id", "--job"]) assert.ok(flags.includes(f), `the hint names ${f}`);
  for (const f of flags) {
    const r = queryMain([f], all);
    assert.ok(!/unknown flag/.test(r.out), `${f} is a flag query.mjs knows`);
  }
  for (const args of [["--patterns"], ["--fields"], ["--group", "table-interactions"], ["--id", "PATH-B-ROW-OPEN"], ["--id", "FIELD-SENSITIVE-STORAGE"]]) assert.equal(queryMain(args, all).code, 0, args.join(" "));
});

test("the retrieval prompt asks for whole rule ids, with example ids that name no answer", () => {
  const p = buildPrompt("x", { skills: true, retrieval: true });
  assert.ok(p.includes("in full"));
  assert.ok(!buildPrompt("x", { skills: true }).includes("in full"), "the skills arm does not get the id hint");
  assert.ok(!REPORT_ID_HINT.match(/(DS|PATH|JOB|FIELD)-(?!NAME)[A-Z]/), "example ids are invented");
});

// gate(): the Phase 2 pass rule as a pure function. Fixtures only; no model is called.
const gateRow = (scenario, sample, o = {}) => ({
  scenario, sample, cost_usd: 0.1, turns: 4, tokens: { total_in: 1000, output_tokens: 50 },
  lookups: { read_calls: 0, search_calls: 0, files_read: 0, file_paths: [], skill_tokens_est: 0, query_calls: 2, packet_lines: [22, 30], other_bash_attempts: 0, ...o.lookups },
  rule_recall: "recall" in o ? o.recall : 1, rules_missing: o.missing ?? [], report: o.report ?? "", ...(o.error ? { error: o.error } : {}),
});
const gateFile = (arm, rows) => ({ arm, rows, summary: summarize(rows) });
const heldRows = (over = {}) => Array.from({ length: 10 }, (_, i) => gateRow(`HELD-${String(i + 1).padStart(2, "0")}`, 1, over[i] ?? {}));
const failed = (g) => g.checks.filter((c) => !c.pass).map((c) => c.name);

test("gate: a clean retrieval run over HELD-01..10 passes", () => {
  const g = gate(gateFile("retrieval", heldRows()));
  assert.equal(g.pass, true, JSON.stringify(failed(g)));
});

test("gate: recall mean under 0.95 fails, 0.95 passes, and no numeric recall at all fails", () => {
  const rows = (n) => Array.from({ length: 20 }, (_, i) => gateRow(`ADV-0${(i % 8) + 1}`, i, { recall: i < n ? 0 : 1, missing: [] }));
  assert.ok(failed(gate(gateFile("retrieval", rows(2)))).includes("rule_recall.mean >= 0.95"), "0.9 fails");
  assert.ok(!failed(gate(gateFile("retrieval", rows(1)))).includes("rule_recall.mean >= 0.95"), "exactly 0.95 passes");
  const none = [gateRow("ADV-09", 1, { recall: undefined })];
  assert.ok(failed(gate(gateFile("retrieval", none))).includes("rule_recall.mean >= 0.95"));
});

test("gate: one HELD id missing on one row fails even when the mean stays above 0.95", () => {
  const rows = [...heldRows(), ...Array.from({ length: 40 }, (_, i) => gateRow("HELD-02", i + 2))];
  rows[0] = gateRow("HELD-01", 1, { recall: 0.5, missing: ["DS-A11Y-020"] });
  const f = gateFile("retrieval", rows);
  assert.ok(f.summary.rule_recall.mean >= 0.95, "the mean alone would pass");
  const g = gate(f);
  assert.equal(g.pass, false);
  assert.deepEqual(g.per_id["HELD-01"].missing, ["DS-A11Y-020"]);
  assert.ok(failed(g).includes("no HELD id misses a required rule on any row"));
});

test("gate: packets over 40 lines, a median over 40, and a median of zero query calls each fail a retrieval run", () => {
  assert.ok(failed(gate(gateFile("retrieval", heldRows({ 0: { lookups: { packet_lines: [41] } } })))).includes("packet_lines.over_40 == 0"));
  const big = heldRows(Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, { lookups: { packet_lines: [41] } }])));
  assert.ok(failed(gate(gateFile("retrieval", big))).includes("packet_lines.median <= 40"));
  const ignored = heldRows(Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, { lookups: { query_calls: 0, packet_lines: [] } }])));
  const names = failed(gate(gateFile("retrieval", ignored)));
  assert.ok(names.includes("query_calls.median >= 1"));
  assert.ok(names.includes("packet_lines.median <= 40"), "no packet read is not a pass");
});

test("gate: an errored row fails the gate; dropping it would have hidden the miss", () => {
  const rows = heldRows({ 3: { error: "timeout", recall: undefined } });
  const f = gateFile("retrieval", rows);
  assert.equal(f.summary.errored, 1);
  assert.ok(failed(gate(f)).includes("errored == 0"));
});

test("gate: retrieval recall lower than the skills arm fails, equal passes", () => {
  const skills = gateFile("skills", heldRows());
  const lower = heldRows({ 0: { recall: 0.5, missing: ["DS-A11Y-020"] } });
  const many = [...lower, ...Array.from({ length: 90 }, (_, i) => gateRow("HELD-02", i + 2))];
  assert.ok(failed(gate(gateFile("retrieval", many), { skills })).includes("retrieval recall >= skills recall"));
  assert.ok(!failed(gate(gateFile("retrieval", heldRows()), { skills })).includes("retrieval recall >= skills recall"));
});

test("gate: reading a SKILL.md or a behaviors card fails while the cards question is open, and is only recorded once it is decided", () => {
  const rows = heldRows({ 4: { lookups: { files_read: 2, file_paths: ["skills/vois-components/SKILL.md", "skills/vois-components/behaviors/dialog.md"] } }, 5: { lookups: { files_read: 1, file_paths: ["skills/vois-tokens/references/x.md"] } } });
  const g = gate(gateFile("retrieval", rows));
  assert.ok(failed(g).includes("no retrieval row read a SKILL.md or behaviors/*.md (cards question open)"));
  assert.deepEqual(g.reads_of_skill_or_card.map((r) => r.path), ["skills/vois-components/SKILL.md", "skills/vois-components/behaviors/dialog.md"]);
  const decided = gate(gateFile("retrieval", rows), { cardsDecided: true });
  assert.equal(decided.pass, true);
  assert.equal(decided.reads_of_skill_or_card.length, 2, "still recorded");
  const old = gate(gateFile("retrieval", heldRows({ 0: { lookups: { files_read: 1, file_paths: undefined } } })));
  assert.equal(old.reads_of_skill_or_card[0].path, "(paths not recorded)", "a file read with no path cannot be waved through");
});

test("gate: ADV-07 must name FIELD-SENSITIVE-STORAGE and ADV-10 one of the two PATH-TABLE ids; ADV-09 needs a person's read and stays out of the mean", () => {
  const adv = (o = {}) => [
    gateRow("ADV-07", 1, { report: o.a07 ?? "Use FIELD-SENSITIVE-STORAGE." }),
    gateRow("ADV-10", 1, { report: o.a10 ?? "Per PATH-TABLE-NARROW-SELECT, then JOB-CONFIRM-DESTRUCTIVE." }),
    gateRow("ADV-09", 1, { recall: undefined, report: "No rule covers this." }),
  ];
  const f = (o, opts) => gate(gateFile("retrieval", adv(o)), { cardsDecided: true, ...opts });
  assert.equal(f({}, { reads: { "ADV-09": "pass" } }).pass, true);
  assert.deepEqual(failed(f({})), ["ADV-09 read by a person"], "no read recorded");
  assert.deepEqual(failed(f({}, { reads: { "ADV-09": "fail" } })), ["ADV-09 read by a person"]);
  assert.ok(failed(f({ a07: "Use a date input." }, { reads: { "ADV-09": "pass" } })).includes("ADV-07 reports name FIELD-SENSITIVE-STORAGE"));
  assert.ok(failed(f({ a10: "JOB-CONFIRM-DESTRUCTIVE only." }, { reads: { "ADV-09": "pass" } })).includes("ADV-10 reports name PATH-TABLE-NARROW-SELECT or PATH-TABLE-BULK-DESTRUCTIVE"));
  assert.equal(gateFile("retrieval", adv()).summary.rule_recall.samples, 2, "ADV-09 is not in the mean");
});

test("lookups records the relative path of each file read", () => {
  const dir = mkdtempSync(join(tmpdir(), "gate-paths-"));
  try {
    mkdirSync(join(dir, "skills", "vois-components"), { recursive: true });
    writeFileSync(join(dir, "skills", "vois-components", "SKILL.md"), "x");
    const l = lookups([{ name: "Read", input: { file_path: join(dir, "skills", "vois-components", "SKILL.md") } }], dir);
    assert.deepEqual(l.file_paths, ["skills/vois-components/SKILL.md"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("--gate scores a finished file from the command line and exits 1 on a fail", () => {
  const dir = mkdtempSync(join(tmpdir(), "gate-cli-"));
  try {
    const good = join(dir, "good.json"), bad = join(dir, "bad.json");
    writeFileSync(good, JSON.stringify(gateFile("retrieval", heldRows())));
    writeFileSync(bad, JSON.stringify(gateFile("retrieval", heldRows({ 0: { recall: 0, missing: ["JOB-X"] } }))));
    const run = (f, ...x) => spawnSync(process.execPath, [fileURLToPath(new URL("./baseline.mjs", import.meta.url)), "--gate", f, ...x], { encoding: "utf8" });
    const a = run(good), b = run(bad);
    assert.equal(a.status, 0, a.stdout + a.stderr);
    assert.match(a.stdout, /GATE: pass/);
    assert.equal(b.status, 1);
    assert.match(b.stdout, /missing  HELD-01: JOB-X/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
