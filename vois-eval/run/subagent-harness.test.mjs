import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { instrumentQuery, prepare, collect, filesOpened } from "./subagent-harness.mjs";
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
