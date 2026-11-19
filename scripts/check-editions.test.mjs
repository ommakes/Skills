// Tests for scripts/check-editions.mjs. Run: node scripts/check-editions.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkEdition, editionVersion, runChecks, unnamedIds } from "./check-editions.mjs";

const fm = (v) => `---\nname: x\nversion: ${v}\n---\n`;
const run = (over = {}) => checkEdition({ name: "ed", text: fm("1.2.3") + "Cites `[A-1]` and A-2.", sourceIds: ["A-1", "A-2"], sourceVersion: "1.2.3", ...over });

test("an edition that names every id passes", () => {
  assert.deepEqual(run().problems, []);
});

test("a missing id fails and is named", () => {
  const r = run({ sourceIds: ["A-1", "A-2", "A-3"] });
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /A-3/);
});

test("an id is not named by a longer id that starts with it", () => {
  assert.deepEqual(unnamedIds("PATH-PRICE-U10", ["PATH-PRICE-U1"]), ["PATH-PRICE-U1"]);
  assert.deepEqual(unnamedIds("PATH-PRICE-U1", ["PATH-PRICE-U1"]), []);
});

test("an id is not named by a longer id that ends with it, or by a longer word", () => {
  assert.deepEqual(unnamedIds("XPATH-B-EDIT", ["PATH-B-EDIT"]), ["PATH-B-EDIT"]);
  assert.deepEqual(unnamedIds("PATH-B-EDIT-2", ["PATH-B-EDIT"]), ["PATH-B-EDIT"]);
  assert.deepEqual(unnamedIds("my_PATH-B-EDIT", ["PATH-B-EDIT"]), ["PATH-B-EDIT"]);
});

test("an id counts next to punctuation, backticks, brackets and line ends", () => {
  for (const around of ["`[A-1]`", "(A-1)", "A-1.", "A-1,", "\nA-1\n", "A-1:", '"A-1"', "*A-1*"]) assert.deepEqual(unnamedIds(around, ["A-1"]), [], around);
});

test("a range names only its two ends", () => {
  assert.deepEqual(unnamedIds("`[PATH-PRICE-U1]` to `[PATH-PRICE-U14]`", ["PATH-PRICE-U1", "PATH-PRICE-U2", "PATH-PRICE-U14"]), ["PATH-PRICE-U2"]);
});

test("regex characters in an id are literal", () => {
  assert.deepEqual(unnamedIds("A.1", ["A.1"]), []);
  assert.deepEqual(unnamedIds("AX1", ["A.1"]), ["A.1"]);
  assert.deepEqual(unnamedIds("a (b)", ["(b)"]), []);
});

test("an edition behind its source is skipped, not failed", () => {
  const r = run({ text: fm("1.2.2") + "nothing", sourceIds: ["A-1"] });
  assert.deepEqual(r.problems, []);
  assert.match(r.skipped, /behind/);
});

test("an edition ahead of its source fails", () => {
  const r = run({ text: fm("1.3.0") + "A-1 A-2" });
  assert.match(r.problems[0], /newer than its source/);
});

test("versions compare as numbers, not as text", () => {
  const r = run({ text: fm("1.9.0") + "nothing", sourceIds: ["A-1"], sourceVersion: "1.10.0" });
  assert.match(r.skipped, /behind/);
  const ahead = run({ text: fm("1.10.0") + "A-1", sourceIds: ["A-1"], sourceVersion: "1.9.0" });
  assert.match(ahead.problems[0], /newer/);
});

test("a missing or odd version fails closed", () => {
  assert.match(run({ text: "no frontmatter A-1 A-2" }).problems[0], /frontmatter version/);
  assert.match(run({ text: fm("latest") + "A-1 A-2" }).problems[0], /frontmatter version/);
  assert.match(run({ sourceVersion: undefined }).problems[0], /source version/);
  assert.match(run({ sourceVersion: "v1" }).problems[0], /source version/);
});

test("only the frontmatter version counts", () => {
  assert.equal(editionVersion("---\nname: x\n---\nversion: 9.9.9\n"), null);
  assert.equal(editionVersion(fm("1.2.3") + "version: 9.9.9"), "1.2.3");
});

test("a source with no ids, or a bad id, fails closed", () => {
  for (const sourceIds of [[], null, undefined, "A-1", [""], [1], ["A-1", null]]) assert.match(run({ sourceIds }).problems[0], /usable list/, JSON.stringify(sourceIds));
});

test("a duplicated source id is a problem", () => {
  assert.match(run({ sourceIds: ["A-1", "A-2", "A-1"] }).problems[0], /more than once/);
});

test("an empty or unreadable edition fails", () => {
  for (const text of ["", undefined, null, 5]) assert.match(run({ text }).problems[0], /empty or unreadable/);
});

test("an omitted id with a reason passes", () => {
  const r = run({ text: fm("1.2.3") + "A-1", omit: { "A-2": "kept in the full version" } });
  assert.deepEqual(r.problems, []);
});

test("an omit entry needs a reason", () => {
  for (const reason of ["", "   ", null, 5, undefined]) {
    const r = run({ text: fm("1.2.3") + "A-1", omit: { "A-2": reason } });
    assert.ok(r.problems.some((p) => /no reason/.test(p)), String(reason));
  }
});

test("an omit entry for an id the source lacks is stale", () => {
  const r = run({ omit: { "Z-9": "gone" } });
  assert.ok(r.problems.some((p) => /stale/.test(p)));
});

test("an omit entry for an id the edition names is redundant", () => {
  const r = run({ omit: { "A-1": "left out" } });
  assert.ok(r.problems.some((p) => /drop it from the omit list/.test(p)));
});

test("an omit list that is not an object fails", () => {
  for (const omit of [null, [], "A-2", 5]) assert.match(run({ omit }).problems[0], /not an object/, JSON.stringify(omit));
});

test("an omitted id does not hide a different missing id", () => {
  const r = run({ text: fm("1.2.3") + "A-1", sourceIds: ["A-1", "A-2", "A-3"], omit: { "A-2": "on purpose" } });
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /A-3/);
  assert.doesNotMatch(r.problems[0], /A-2/);
});

// ---- runChecks and the command line, against a small tree -------------------------------------------------------

function tree(over = {}) {
  const root = mkdtempSync(join(tmpdir(), "editions-"));
  const put = (rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), typeof body === "string" ? body : JSON.stringify(body)); };
  const v = "1.0.0";
  const files = {
    "skills.json": { skills: ["vois-tokens", "vois-patterns", "vois-components", "righter"].map((name) => ({ name, version: v })) },
    "figma-editions/omit.json": {},
    "vois-tokens/data/vois-rules.json": { rules: [{ id: "T-1" }] },
    "vois-patterns/data/patterns-rules.json": { nodes: [{ id: "P-1" }] },
    "vois-components/data/components-rules.json": { jobs: [{ id: "J-1" }], lookalikes: { rows: [{ id: "L-1" }] } },
    "righter/data/components.json": { components: [{ id: "toast" }] },
    "righter/SKILL.md": "### Active voice `id: active-voice`\n",
    "figma-editions/vois-tokens.md": fm(v) + "T-1",
    "figma-editions/vois-patterns.md": fm(v) + "P-1",
    "figma-editions/vois-components.md": fm(v) + "J-1 L-1",
    "figma-editions/righter.md": fm(v) + "### Toast `id: toast`\n### Active voice `id: active-voice`\n",
    ...over,
  };
  for (const [rel, body] of Object.entries(files)) if (body !== null) put(rel, body);
  return root;
}
const check = (over) => { const root = tree(over); try { return runChecks(root); } finally { rmSync(root, { recursive: true, force: true }); } };

test("a consistent tree passes", () => {
  const r = check();
  assert.deepEqual(r.problems, []);
  assert.equal(r.lines.length, 4);
});

test("Righter ids are matched as `id: name`, so the word alone does not count", () => {
  const r = check({ "figma-editions/righter.md": fm("1.0.0") + "### Toast\nA toast says what happened. `id: active-voice`\n" });
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /id: toast/);
});

test("a Righter omit entry is written as `id: name`", () => {
  const r = check({ "figma-editions/righter.md": fm("1.0.0") + "`id: active-voice`", "figma-editions/omit.json": { righter: { "id: toast": "kept in the full version" } } });
  assert.deepEqual(r.problems, []);
});

test("no principle headings in SKILL.md is an error, not a pass", () => {
  const r = check({ "righter/SKILL.md": "### Active voice\n" });
  assert.ok(r.problems.some((p) => /found no `id: name` principle headings/.test(p)));
});

test("a principle mentioned twice in SKILL.md is not a duplicate", () => {
  const r = check({ "righter/SKILL.md": "### Active voice `id: active-voice`\nSee also `id: active-voice`.\n" });
  assert.deepEqual(r.problems, []);
});

test("an omit entry for an edition the check does not know fails", () => {
  const r = check({ "figma-editions/omit.json": { nope: {} } });
  assert.ok(r.problems.some((p) => /nope/.test(p)));
});

test("a tree that cannot be read fails closed", () => {
  assert.ok(check({ "skills.json": "not json" }).problems.length > 0);
  assert.ok(check({ "skills.json": { skills: "x" } }).problems.length > 0);
  assert.ok(check({ "figma-editions/omit.json": [] }).problems.length > 0);
  assert.ok(check({ "figma-editions/omit.json": null }).problems.length > 0);
  assert.ok(check({ "figma-editions/vois-tokens.md": null }).problems.some((p) => /vois-tokens/.test(p)));
  assert.ok(check({ "vois-patterns/data/patterns-rules.json": { nodes: "x" } }).problems.some((p) => /vois-patterns/.test(p)));
});

test("a skill missing from skills.json fails", () => {
  const r = check({ "skills.json": { skills: [{ name: "vois-tokens", version: "1.0.0" }] } });
  assert.ok(r.problems.some((p) => /vois-patterns/.test(p)));
});

// This runs the live repo, so an edition may be either level (ok) or marked behind its source (skip). Both are
// allowed states. What it checks is that the script ran: one result line per edition and no problems.
test("run through a symlink it still runs and prints one result line per edition", () => {
  const dir = mkdtempSync(join(tmpdir(), "editions-link-"));
  try {
    const link = join(dir, "link.mjs");
    symlinkSync(join(dirname(fileURLToPath(import.meta.url)), "check-editions.mjs"), link);
    const r = spawnSync(process.execPath, [link], { encoding: "utf8" });
    const editions = ["vois-tokens", "vois-patterns", "vois-components", "righter"];
    const lines = r.stdout.split("\n").filter((l) => l.trim() !== "");
    for (const name of editions) {
      const hits = lines.filter((l) => l.startsWith(`ok    ${name}: `) || l.startsWith(`skip  ${name}: `));
      assert.equal(hits.length, 1, `expected one ok or skip line for ${name}, got:\n${r.stdout}`);
    }
    assert.equal(lines.length, editions.length, `expected only result lines, got:\n${r.stdout}`);
    assert.doesNotMatch(r.stderr, /FAIL/, r.stderr);
    assert.equal(r.status, 0, r.stderr);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
