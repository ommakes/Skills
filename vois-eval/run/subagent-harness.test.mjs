import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { instrumentQuery, prepare, collect, filesOpened, prepareQuality, collectQuality, qualityGate } from "./subagent-harness.mjs";
import { gate } from "./baseline.mjs";

const TASKS = fileURLToPath(new URL("../heldout/om-2026-11-25.json", import.meta.url));

test("instrumentQuery keeps the shebang first and logs one line per call without changing the packet", () => {
  const dir = mkdtempSync(join(tmpdir(), "sah-"));
  try {
    const m = prepare({ tasksFile: TASKS, arm: "retrieval", samples: 1, root: join(dir, "r"), scenarios: ["HELD-01"] });
    const q = join(m[0].work, "skills/vois-components/scripts/query.mjs");
    assert.ok(readFileSync(q, "utf8").startsWith("#!/usr/bin/env node\nimport { appendFileSync"));
    const real = spawnSync(process.execPath, [fileURLToPath(new URL("../../vois-components/scripts/query.mjs", import.meta.url)), "Dialog"], { encoding: "utf8" });
    const wrapped = spawnSync(process.execPath, [q, "Dialog"], { encoding: "utf8", cwd: m[0].work });
    assert.equal(wrapped.stdout, real.stdout, "same packet");
    const log = readFileSync(join(m[0].log, "query-log.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    assert.equal(log.length, 1);
    assert.deepEqual(log[0].argv, ["Dialog"]);
    assert.equal(log[0].code, 0);
    assert.equal(log[0].lines, real.stdout.trimEnd().split("\n").length);
    assert.match(m[0].prompt, /report\.txt/);
    assert.ok(!/om_answer|required_rules/.test(m[0].prompt), "the prompt carries only the user prompt");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("collect builds rows the gate can score: recall from the report text, packet lines from the query log, opens minus query-internal reads", () => {
  const dir = mkdtempSync(join(tmpdir(), "sah-"));
  try {
    const root = join(dir, "r");
    const m = prepare({ tasksFile: TASKS, arm: "retrieval", samples: 1, root, scenarios: ["HELD-02", "HELD-05"] });
    const need = JSON.parse(readFileSync(TASKS, "utf8")).tasks.find((t) => t.id === "HELD-02").required_rules;
    writeFileSync(m[0].report, `1. Use X.\n2. ${need.join(", ")}\n3. nothing`);
    writeFileSync(join(m[0].log, "query-log.jsonl"), JSON.stringify({ start: 1000, end: 1100, argv: ["--job", "JOB-X"], code: 0, lines: 12 }) + "\n");
    writeFileSync(join(root, "opens.jsonl"), [
      { t: 1050, path: join(m[0].work, "skills/vois-components/data/retrieval-index.json"), isdir: false },
      { t: 2000, path: join(m[0].work, "skills/vois-components/SKILL.md"), isdir: false },
      { t: 2001, path: join(m[0].work, "skills/vois-components"), isdir: true },
      { t: 3000, path: "/agent/repos/Skills/vois-eval/heldout/om-2026-11-25.json", isdir: false, outside: true },
    ].map((o) => JSON.stringify(o)).join("\n") + "\n");
    const f = collect({ root, model: "m" });
    const [a, b] = f.rows;
    assert.equal(a.rule_recall, 1);
    assert.deepEqual(a.lookups.packet_lines, [12]);
    assert.deepEqual(a.lookups.file_paths, ["skills/vois-components/SKILL.md"]);
    assert.equal(b.error, "no report.txt written by the subagent", "a missing report is an error, not a pass");
    assert.equal(f.outside_opens.length, 1);
    const g = gate(f, { cardsDecided: false });
    assert.equal(g.pass, false);
    assert.ok(g.checks.find((c) => c.name.startsWith("errored")).pass === false);
    assert.equal(g.reads_of_skill_or_card[0].path, "skills/vois-components/SKILL.md");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("prepare refuses an existing run directory and unknown ids", () => {
  const dir = mkdtempSync(join(tmpdir(), "sah-"));
  try {
    prepare({ tasksFile: TASKS, arm: "skills", samples: 1, root: join(dir, "r"), scenarios: ["HELD-01"] });
    assert.throws(() => prepare({ tasksFile: TASKS, arm: "skills", samples: 1, root: join(dir, "r"), scenarios: ["HELD-01"] }), /exists/);
    assert.throws(() => prepare({ tasksFile: TASKS, arm: "skills", samples: 1, root: join(dir, "r2"), scenarios: ["NOPE"] }), /unknown id/);
    assert.throws(() => prepare({ tasksFile: TASKS, arm: "none", samples: 1, root: join(dir, "r3") }), /--arm/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a burst of opens is a text search sweep, not reads; single opens are still reads", () => {
  const work = "/w/run/work";
  const burst = Array.from({ length: 30 }, (_, i) => ({ t: 5000 + i * 3, path: `${work}/skills/vois-components/behaviors/c${i}.md`, isdir: false }));
  const slow = [{ t: 9000, path: `${work}/skills/vois-components/SKILL.md`, isdir: false }, { t: 12000, path: `${work}/skills/vois-components/behaviors/dialog.md`, isdir: false }];
  const r = filesOpened([...slow, ...burst], work, []);
  assert.deepEqual(r.read, ["skills/vois-components/SKILL.md", "skills/vois-components/behaviors/dialog.md"]);
  assert.equal(r.swept.length, 30);
  const few = Array.from({ length: 5 }, (_, i) => ({ t: 100 + i, path: `${work}/skills/s${i}/SKILL.md`, isdir: false }));
  assert.equal(filesOpened(few, work, []).read.length, 5, "five SKILL.md read in a row are reads");
});

test("prepareQuality: the two arms differ by the retrieval line; only the retrieval arm gets the logging query.mjs; nothing from the task's answer keys is in the prompt", () => {
  const dir = mkdtempSync(join(tmpdir(), "sah-"));
  try {
    const runs = prepareQuality({ samples: 1, root: join(dir, "r"), taskIds: ["LP-01a"] });
    assert.deepEqual(runs.map((r) => r.arm), ["skills", "retrieval"]);
    const [a, b] = runs;
    assert.ok(!a.prompt.includes("query.mjs") && b.prompt.includes("query.mjs"));
    assert.ok(!readFileSync(join(a.work, "skills/vois-components/scripts/query.mjs"), "utf8").includes("__af"));
    assert.ok(readFileSync(join(b.work, "skills/vois-components/scripts/query.mjs"), "utf8").includes("__af"));
    assert.ok(!/expected_imports|forbidden_patterns|required_patterns/.test(a.prompt + b.prompt));
    assert.throws(() => prepareQuality({ samples: 1, root: join(dir, "r"), taskIds: ["LP-01a"] }), /exists/);
    assert.throws(() => prepareQuality({ samples: 1, root: join(dir, "x"), taskIds: ["NOPE"] }), /unknown id/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("collectQuality scores out.tsx with scoreSample, counts a missing file as an error fail, and qualityGate applies the retrieval >= skills rule", () => {
  const dir = mkdtempSync(join(tmpdir(), "sah-"));
  try {
    const root = join(dir, "r");
    const runs = prepareQuality({ samples: 1, root, taskIds: ["LP-01a"] });
    const [sk, re] = runs;
    writeFileSync(sk.out, "export default function X() { return <div>hi</div>; }");
    writeFileSync(join(root, "opens.jsonl"), "");
    const f = collectQuality({ root, model: "m" });
    const rs = f.results.find((r) => r.arm === "skills"), rr = f.results.find((r) => r.arm === "retrieval");
    assert.equal(typeof rs.pass, "boolean");
    assert.equal(rr.error, "the subagent wrote no out.tsx");
    assert.equal(rr.pass, false);
    assert.equal(f.summary.retrieval.errors, 1);
    const g = (skillsPass, retrievalPass) => qualityGate({ summary: { skills: { samples: 2, pass_rate: skillsPass, errors: 0 }, retrieval: { samples: 2, pass_rate: retrievalPass, errors: 0 } }, results: [] });
    assert.equal(g(0.5, 0.5).pass, true);
    assert.equal(g(0.5, 0.6).pass, true);
    assert.equal(g(0.6, 0.5).pass, false);
    assert.equal(qualityGate({ summary: { skills: { samples: 1, pass_rate: 1 } }, results: [] }).pass, false);
    assert.equal(re.arm, "retrieval");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("quality runs can be split across roots by sample number and collected together; a repeated sample is refused", () => {
  const dir = mkdtempSync(join(tmpdir(), "sah-"));
  try {
    const a = join(dir, "a"), b = join(dir, "b");
    prepareQuality({ samples: 1, root: a, taskIds: ["LP-01a"] });
    const rb = prepareQuality({ samples: 2, firstSample: 2, root: b, taskIds: ["LP-01a"] });
    assert.deepEqual([...new Set(rb.map((r) => r.sample))], [2, 3]);
    for (const r of [a, b]) writeFileSync(join(r, "opens.jsonl"), "");
    const f = collectQuality({ roots: [a, b], model: "m" });
    assert.equal(f.samples_per_task, 3);
    assert.equal(f.results.length, 6);
    assert.throws(() => collectQuality({ roots: [a, a], model: "m" }), /twice/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
