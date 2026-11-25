// Tests for retrieval.mjs and query.mjs. Run: node vois-components/scripts/retrieval.test.mjs
// Each guard has a test that tries to get past it. See CLAUDE.md "Guards need a test from the other side".
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load, build, run, wordRe, serialize, INDEX_REL } from "./retrieval.mjs";
import { resolve, main, loadAll } from "./query.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..", "..");
const fresh = () => structuredClone(load(ROOT).sources);
const problemsOf = (s) => build(s).problems;
const has = (list, re) => list.some((p) => re.test(p));
const names = (s) => s.names.names;
const entry = (s, id) => names(s).find((c) => c.id === id);

/** A copy of the parts of the repo the index reads, so a test can break a file without touching the real one. */
function copyRepo() {
  const dir = mkdtempSync(join(tmpdir(), "vois-retrieval-"));
  cpSync(join(ROOT, "vois-components"), join(dir, "vois-components"), { recursive: true });
  mkdirSync(join(dir, "vois-tokens"), { recursive: true });
  cpSync(join(ROOT, "vois-tokens", "data"), join(dir, "vois-tokens", "data"), { recursive: true });
  mkdirSync(join(dir, "registry"), { recursive: true });
  cpSync(join(ROOT, "registry", "registry.json"), join(dir, "registry", "registry.json"));
  return dir;
}

test("the committed repo passes and the committed index is fresh", () => {
  assert.deepEqual(run(ROOT), []);
});

test("the build is deterministic", () => {
  assert.equal(serialize(build(fresh()).index), serialize(build(fresh()).index));
});

test("a stale or missing index fails", () => {
  const dir = copyRepo();
  const p = join(dir, INDEX_REL);
  const idx = JSON.parse(readFileSync(p, "utf8"));
  idx.components.find((c) => c.id === "Dialog").rules = [];
  writeFileSync(p, serialize(idx));
  assert.ok(has(run(dir), /stale/));
  assert.deepEqual(run(dir, { write: true }), [], "--write repairs it");
  writeFileSync(p, "");
  assert.ok(has(run(dir), /stale/));
  rmSync(p);
  assert.ok(has(run(dir), /missing; run/));
});

test("cards: a missing file, a card claimed twice and a card nobody claims all fail", () => {
  let s = fresh(); entry(s, "Dialog").card = "no-such-card";
  assert.ok(has(problemsOf(s), /no-such-card\.json does not exist/));
  assert.ok(has(problemsOf(s), /behaviors\/dialog\.json: no component/), "the dialog card is now unclaimed");
  s = fresh(); entry(s, "Popover").card = "dialog";
  assert.ok(has(problemsOf(s), /card dialog is claimed by Dialog and Popover/));
  s = fresh(); delete entry(s, "Tabs").card;
  assert.ok(has(problemsOf(s), /behaviors\/tabs\.json: no component/));
  s = fresh(); entry(s, "Tabs").card = 7;
  assert.ok(has(problemsOf(s), /Tabs card must be a card id/));
});

test("rule scopes fail closed: a bad scope is an error and adds no rule", () => {
  let s = fresh(); s.names.ruleScopes.categories["DS-NOPE"] = ["Dialog"];
  assert.ok(has(problemsOf(s), /DS-NOPE, which is not a category/));
  s = fresh(); s.names.ruleScopes.categories["DS-COLOR"] = "all";
  const r = build(s);
  assert.ok(has(r.problems, /DS-COLOR must be a non-empty list/));
  assert.ok(!r.index.components.some((c) => c.rules.some((x) => x.rule.startsWith("DS-COLOR-") && x.via.includes("category"))), "a string never means every component");
  s = fresh(); s.names.ruleScopes.categories["DS-COLOR"] = [];
  assert.ok(has(problemsOf(s), /DS-COLOR must be a non-empty list/));
  s = fresh(); s.names.ruleScopes.categories["DS-MODAL"] = ["Dialog", "Modal"];
  assert.ok(has(problemsOf(s), /names Modal, which is not a component/));
  s = fresh(); s.names.ruleScopes.categories = ["DS-MODAL"];
  assert.ok(has(problemsOf(s), /ruleScopes.categories must be an object/));
});

test("a scoped category reaches its components and no others", () => {
  const { index } = build(fresh());
  const modal = (id) => index.components.find((c) => c.id === id).rules.filter((r) => r.via.includes("category") && r.rule.startsWith("DS-MODAL-")).length;
  assert.ok(modal("Dialog") > 0 && modal("AlertDialog") > 0 && modal("Sheet") > 0);
  assert.equal(modal("Popover"), 0);
  assert.equal(modal("Button"), 0);
});

test("registry: a value naming a missing item fails; with no registry folder the check is skipped", () => {
  let s = fresh(); entry(s, "Tabs").registry = "vois-tabz";
  assert.ok(has(problemsOf(s), /vois-tabz, which registry\/registry.json does not have/));
  s = fresh(); s.registry = null; entry(s, "Tabs").registry = "vois-tabz";
  assert.ok(!has(problemsOf(s), /vois-tabz/));
  s = fresh(); entry(s, "Tabs").registry = ["vois-tabs"];
  assert.ok(has(problemsOf(s), /Tabs registry must be a string or null/));
});

test("a rule cited by a card or a lookalike row must exist", () => {
  let s = fresh();
  s.cards.find((c) => c.file === "dialog.json").card.behaviors[0].rules = ["DS-A11Y-999"];
  assert.ok(has(problemsOf(s), /behaviors\/dialog\.json BHV-DIALOG-001 cites DS-A11Y-999/));
  s = fresh();
  s.rules.lookalikes.rows.find((r) => r.id === "LOOKALIKE-006").rule_ids = ["DS-MODAL-099"];
  assert.ok(has(problemsOf(s), /lookalike LOOKALIKE-006 cites DS-MODAL-099/));
});

test("names: an id or inventory name owned twice fails; a shared shadcn or registry name is only ambiguous", () => {
  let s = fresh(); entry(s, "Popover").inventory = "Dialog";
  assert.ok(has(problemsOf(s), /"dialog" belongs to Dialog \(id\) and Popover \(inventory\)/));
  s = fresh(); entry(s, "Popover").inventory = "alert-dialog";
  assert.ok(has(problemsOf(s), /"alertdialog" belongs to/), "the check compares the normalized form, not the raw text");
  s = fresh(); names(s).push({ id: "Dialog", inventory: "Again", status: "skip" });
  assert.ok(has(problemsOf(s), /Dialog is listed twice/));
  s = fresh(); names(s).push({ inventory: "No id" });
  assert.ok(has(problemsOf(s), /an entry has no id/));
  s = fresh();
  const r = build(s);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.index.aliases["togglegroup"].map((o) => o.component), ["SegmentedControl", "Toggle"]);
});

test("malformed sources are reported, never a crash", () => {
  const cases = [
    ["a card that is null", (s) => { s.cards.find((c) => c.file === "tabs.json").card = null; }, /tabs\.json: not an object/],
    ["card rows that are not a list", (s) => { s.cards.find((c) => c.file === "tabs.json").card.behaviors = {}; }, /behaviors must be a list/],
    ["a card row that is null", (s) => { s.cards.find((c) => c.file === "tabs.json").card.behaviors.push(null); }, /is not an object/],
    ["a row's rules as a string", (s) => { s.cards.find((c) => c.file === "dialog.json").card.behaviors[0].rules = "DS-MODAL-001"; }, /rules must be a list/],
    ["a lookalike row that is null", (s) => { s.rules.lookalikes.rows.push(null); }, /lookalike row \d+ is not an object/],
    ["a lookalike's rule_ids as a string", (s) => { s.rules.lookalikes.rows[0].rule_ids = "DS-A11Y-001"; }, /rule_ids must be a list/],
    ["a job that is null", (s) => { s.rules.jobs.push(null); }, /job \d+ is not an object/],
    ["a rule that is null", (s) => { s.tokens.rules.push(null); }, /rule \d+ has no id/],
    ["an inventory name that is a number", (s) => { entry(s, "Tabs").inventory = 5; }, /Tabs inventory must be a string/],
  ];
  for (const [what, breakIt, re] of cases) {
    const s = fresh(); breakIt(s);
    let r;
    assert.doesNotThrow(() => { r = build(s); }, what);
    assert.ok(has(r.problems, re), `${what}: ${r.problems.join(" | ")}`);
  }
});

test("text matching: the longest name wins its words, and a shadcn brand name counts", () => {
  const s = fresh();
  s.tokens.rules.push({ id: "DS-A11Y-998", category: "DS-A11Y", rule: "A Navigation Menu and an Alert Dialog and a Number Input." });
  const { index } = build(s);
  const reaches = (id) => index.components.find((c) => c.id === id).rules.some((r) => r.rule === "DS-A11Y-998");
  for (const id of ["NavigationMenu", "AlertDialog", "NumberInput"]) assert.ok(reaches(id), id);
  for (const id of ["DropdownMenu", "Dialog", "Input"]) assert.ok(!reaches(id), `${id} is inside a longer name`);
  const toast = build(fresh()).index.components.find((c) => c.id === "Toast");
  assert.ok(toast.lookalikes.includes("LOOKALIKE-009"), "LOOKALIKE-009 names Sonner, Toast's shadcn file");
});

test("whole-word matching does not hit inside a longer name", () => {
  const re = wordRe("Dialog");
  for (const t of ["Use a Dialog.", "Dialog, AlertDialog or Sheet", "(Dialog)", "a Dialog's title"]) assert.ok(re.test(t), t);
  for (const t of ["AlertDialog", "Dialogs", "DialogTitle", "vois-Dialog", "Dialog-body", "dialog"]) assert.ok(!re.test(t), t);
  const { index } = build(fresh());
  const dialog = index.components.find((c) => c.id === "Dialog");
  assert.ok(!dialog.jobs.includes("JOB-CONFIRM-DESTRUCTIVE"), "that job names AlertDialog, never Dialog");
  const input = index.components.find((c) => c.id === "Input");
  assert.ok(!input.jobs.includes("JOB-REPRESENT-USER") , "Input is not found inside InputOTP or other words");
});

test("query: names resolve in any spelling to one component", () => {
  const { index } = loadAll(join(ROOT, "vois-components"));
  for (const n of ["AlertDialog", "alert-dialog", "Alert Dialog", "vois-alert-dialog", "ALERTDIALOG", "  alert dialog "]) {
    assert.deepEqual(resolve(index, n), { state: "match", ids: ["AlertDialog"], near: [] }, n);
  }
  assert.deepEqual(resolve(index, "dialog").ids, ["Dialog"]);
  assert.equal(resolve(index, "").state, "no_match");
  assert.equal(resolve(index, "x".repeat(5000)).state, "no_match");
  assert.deepEqual(resolve(index, "toggle group").ids, ["Toggle"], "vois-toggle-group is Toggle's item; SegmentedControl only wraps the shadcn file");
  for (const n of ["constructor", "__proto__", "toString", "hasOwnProperty"]) assert.equal(resolve(index, n).state, "no_match", n);
  assert.ok(resolve(index, "dialgo").near.includes("Dialog"));
});

test("query: exit codes and modes", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  assert.equal(main(["Dialog"], all).code, 0);
  assert.equal(main(["toggle", "group"], all).code, 0);
  const shared = { ...all, index: { ...all.index, aliases: { ...all.index.aliases, shared: [{ component: "Dialog", kind: "shadcn" }, { component: "Popover", kind: "shadcn" }] } } };
  assert.equal(main(["shared"], shared).code, 2, "a name two components share with no registry item between them is ambiguous");
  assert.equal(main(["constructor"], all).code, 3);
  for (const id of ["constructor", "__proto__", "toString"]) assert.equal(main(["--id", id], all).code, 3, id);
  assert.equal(main(["--id", "ds-modal-004"], all).code, 0, "ids are case-insensitive");
  assert.equal(main(["--job", "--full"], all).code, 1, "a flag is not a job id");
  assert.equal(main(["--id", "--json"], all).code, 1);
  assert.equal(main(["--id"], all).code, 1);
  assert.equal(main(["Dialog", "--job", "JOB-DATA-ENTRY"], all).code, 1, "two modes at once is a usage error, not a silent pick");
  assert.equal(main(["--bogus"], all).code, 1);
  assert.equal(main(["--job", "JOB-CONFIRM-DESTRUCTIVE", "--job", "JOB-NOPE"], all).code, 3, "one unknown job is a miss even when the other resolves");
  assert.equal(main(["--job", "confirm-destructive"], all).code, 0);
  assert.equal(main(["Nonesuch"], all).code, 3);
  assert.equal(main([], all).code, 1);
  assert.equal(main(["--job", "JOB-NOPE"], all).code, 3);
  const two = JSON.parse(main(["--job", "JOB-CONFIRM-DESTRUCTIVE", "--job", "JOB-TRANSIENT-FEEDBACK", "--json"], all).out);
  assert.equal(two.jobs.length, 2);
  const toast = two.components.find((c) => c.id === "Toast");
  assert.deepEqual(toast.jobs, ["JOB-CONFIRM-DESTRUCTIVE", "JOB-TRANSIENT-FEEDBACK"], "a component named by two jobs is listed once, with both");
  assert.equal(main(["--id", "DS-MODAL-004"], all).code, 0);
  assert.equal(main(["--id", "BHV-DIALOG-001"], all).code, 0);
  const cross = JSON.parse(main(["--id", "DS-COLOR-001", "--json"], all).out);
  assert.equal(cross.state, "no_match");
  assert.match(cross.note, /cross-cutting/);
  assert.equal(main(["--jobs"], all).code, 0);
  assert.equal(main(["--audit"], all).code, 0);
});

test("query: a packet says what it lacks", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const p = JSON.parse(main(["Carousel", "--json"], all).out);
  assert.ok(p.missing.includes("no behavior card"));
  assert.ok(p.missing.includes("no registry item"));
});

test("every component packet stays small", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  for (const c of all.index.components) {
    const lines = main([c.id], all).out.split("\n").length;
    assert.ok(lines <= 40, `${c.id}: ${lines} lines`);
  }
});
