import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { autoMatch, lookups, tokensOf, summarize, buildPrompt } from "./baseline.mjs";

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
