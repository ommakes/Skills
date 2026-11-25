import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { autoMatch, lookups, tokensOf, summarize, buildPrompt, loadTasks } from "./baseline.mjs";

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
    assert.equal(f.rows[0].lookups.query_calls, 1, "only the query.mjs command counts");
    assert.equal(f.summary.query_calls.median, 1);
    const bad = run([...base, "--retrieval", "--no-skills", "--out", join(dir, "x.json")], events);
    assert.notEqual(bad.status, 0);
    assert.match(bad.stderr, /cannot be combined/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
