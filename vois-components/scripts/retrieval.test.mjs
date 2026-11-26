// Tests for retrieval.mjs and query.mjs. Run: node vois-components/scripts/retrieval.test.mjs
// Each guard has a test that tries to get past it. See CLAUDE.md "Guards need a test from the other side".
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load, build, run, wordRe, serialize, groupOf, INDEX_REL } from "./retrieval.mjs";
import { resolve, main, loadAll, groupPacket, componentPacket } from "./query.mjs";

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
  for (const skill of ["vois-patterns", "vois-fields"]) {
    mkdirSync(join(dir, skill), { recursive: true });
    cpSync(join(ROOT, skill, "data"), join(dir, skill, "data"), { recursive: true });
  }
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

test("query: the job list and a component miss both tell the model to say so when nothing fits", () => {
  const all = loadAll();
  const jobs = main(["--jobs"], all).out;
  assert.match(jobs, /If no job fits, say the skills have no rule for this task\. Do not use the nearest job\./);
  const miss = main(["CursorOverlay"], all);
  assert.equal(miss.code, 3);
  assert.match(miss.out, /If nothing fits, say the skills have no rule for it\./);
});

test("query: a packet says what it lacks", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const p = JSON.parse(main(["Meter", "--json"], all).out);
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

// ---------------- PATH nodes and FIELD rules

const nodeOf = (s, id) => s.patterns.nodes.find((n) => n.id === id);
const fieldOf = (s, id) => s.fields.rules.find((r) => r.id === id);

test("PATH nodes: a copy keeps the rule text whole, and the id set matches the source", () => {
  const s = fresh();
  const { index } = build(s);
  assert.equal(Object.keys(index.patterns).length, s.patterns.nodes.length);
  assert.equal(Object.keys(index.fields).length, s.fields.rules.length);
  const row = index.patterns["PATH-B-ROW-OPEN"];
  assert.equal(row.outcome, nodeOf(s, "PATH-B-ROW-OPEN").outcome, "the outcome is copied word for word");
  assert.equal(row.group, "table-list");
  assert.equal(row.parent, "PATH-B");
});

test("PATH nodes and FIELD rules: an id may belong to one thing, across every source", () => {
  let s = fresh(); nodeOf(s, "PATH-B-ROW-OPEN").id = "PATH-B-ROW-ACTIONS";
  assert.ok(has(problemsOf(s), /PATH-B-ROW-ACTIONS is also patterns-rules\.json node/), "two nodes with one id");
  s = fresh(); nodeOf(s, "PATH-B-ROW-OPEN").id = "DS-MODAL-004";
  assert.ok(has(problemsOf(s), /DS-MODAL-004 is also vois-rules\.json rule/), "a node that takes a DS id");
  s = fresh(); fieldOf(s, "FIELD-PASTE").id = "JOB-CONFIRM-DESTRUCTIVE";
  assert.ok(has(problemsOf(s), /JOB-CONFIRM-DESTRUCTIVE is also components-rules\.json job/), "a field rule that takes a job id");
  s = fresh(); fieldOf(s, "FIELD-PASTE").id = "PATH-B";
  assert.ok(has(problemsOf(s), /PATH-B is also patterns-rules\.json node/), "a field rule that takes a PATH id");
});

test("PATH nodes and FIELD rules: malformed entries are reported, never a crash", () => {
  let s = fresh(); s.patterns.nodes.push(null, { id: "PATH-X" }, { id: 7, condition: "c", outcome: "o" });
  assert.ok(has(problemsOf(s), /patterns-rules\.json: node \d+ needs a string id, condition and outcome/));
  s = fresh(); s.patterns.nodes = "no";
  assert.ok(has(problemsOf(s), /patterns-rules\.json: `nodes` must be a list/));
  s = fresh(); s.fields.rules = {};
  assert.ok(has(problemsOf(s), /fields-rules\.json: `rules` must be a list/));
  s = fresh(); s.fields.rules.push({ id: "FIELD-NEW", title: "t" });
  assert.ok(has(problemsOf(s), /fields-rules\.json: rule \d+ needs a string id, title and rule text/));
  s = fresh(); nodeOf(s, "PATH-B-ROW-OPEN").source_file = "";
  assert.ok(has(problemsOf(s), /PATH-B-ROW-OPEN has no source_file/));
  s = fresh(); nodeOf(s, "PATH-B-ROW-OPEN").parent = "PATH-NOPE";
  assert.ok(has(problemsOf(s), /PATH-B-ROW-OPEN names parent PATH-NOPE, which is not a node/));
  s = fresh(); s.patterns = null; s.fields = null;
  assert.ok(has(problemsOf(s), /`nodes` must be a list/) && has(problemsOf(s), /`rules` must be a list/), "a missing source file is a problem, not an empty index");
});

test("a missing patterns or fields file fails the run", () => {
  const dir = copyRepo();
  rmSync(join(dir, "vois-patterns", "data", "patterns-rules.json"));
  assert.ok(has(run(dir), /patterns-rules\.json: cannot read/));
  const dir2 = copyRepo();
  rmSync(join(dir2, "vois-fields", "data", "fields-rules.json"));
  assert.ok(has(run(dir2), /fields-rules\.json: cannot read/));
});

test("groupOf takes the file name from any path style", () => {
  for (const f of ["vois-patterns/references/table-interactions.md", "./vois-patterns/references/table-interactions.md", "/abs/x/table-interactions.md", "vois-patterns\\references\\table-interactions.md", "table-interactions.md", "table-interactions.MD"]) assert.equal(groupOf(f), "table-interactions", f);
});

test("query: --patterns, --group, --fields and --id read PATH and FIELD ids", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const pat = main(["--patterns"], all);
  assert.equal(pat.code, 0);
  assert.match(pat.out, /PATH-B {2}Table\/List with Details/);
  assert.match(pat.out, /table-interactions {2}35 nodes/);
  assert.match(pat.out, /table-list {2}8 nodes/, "a file with no cross-cutting rules is listed too");
  assert.match(main(["--group", "pricing-pages"], all).out, /\(64 nodes/, "the count in --patterns is the count --group shows");
  assert.match(pat.out, /If no pattern fits, say the skills have no rule for this task\./);
  const fld = main(["--fields"], all);
  assert.equal(fld.code, 0);
  assert.match(fld.out, /FIELD-SENSITIVE-STORAGE/);
  assert.match(fld.out, /If no field rule fits/);
  const grp = main(["--group", "Table Interactions"], all);
  assert.equal(grp.code, 0, "a group name matches in any spelling");
  assert.match(grp.out, /PATH-TABLE-BULK-BAR/);
  assert.equal(main(["--group", "nope"], all).code, 3);
  assert.match(main(["--group", "nope"], all).out, /Groups: .*table-interactions/);
  assert.equal(main(["--group", "constructor"], all).code, 3, "a built-in name is not a group");
  const row = main(["--id", "path-b-row-open"], all);
  assert.equal(row.code, 0, "PATH ids are case-insensitive");
  assert.match(row.out, /PATH-B-ROW-OPEN \[table-list/);
  const top = main(["--id", "PATH-B"], all).out;
  assert.match(top, /sub-decisions\n {2}PATH-B-COMPLEX/);
  assert.match(main(["--id", "FIELD-SENSITIVE-STORAGE"], all).out, /never: /);
  const j = JSON.parse(main(["--id", "PATH-B-ROW-OPEN", "--json"], all).out);
  assert.equal(j.kind, "path", "the node's own kind does not replace the packet kind");
  assert.equal(j.nodeKind, "sub_decision");
});

test("query: the new modes are modes, and each needs its value", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  assert.equal(main(["--group"], all).code, 1);
  assert.equal(main(["--group", "--json"], all).code, 1);
  assert.equal(main(["--patterns", "--fields"], all).code, 1);
  assert.equal(main(["--patterns", "Dialog"], all).code, 1);
  assert.equal(main(["--group", "table-list", "--id", "PATH-B"], all).code, 1);
  assert.equal(main(["--patterns", "--audit"], all).code, 1);
});

test("query: the job list points at --patterns and --fields", () => {
  assert.match(main(["--jobs"], loadAll()).out, /run --patterns[\s\S]*run --fields/);
});

test("query: the new packets stay small, and a long group says what it cut", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  for (const args of [["--patterns"], ["--fields"], ["--id", "PATH-B"], ["--id", "PATH-PAGE"]]) {
    const n = main(args, all).out.split("\n").length;
    assert.ok(n <= 40, `${args.join(" ")}: ${n} lines`);
  }
  const groups = JSON.parse(main(["--patterns", "--json"], all).out).groups;
  for (const g of groups) {
    const out = main(["--group", g.group], all).out.split("\n");
    assert.ok(out.length <= 42, `${g.group}: ${out.length} lines`);
  }
  const big = main(["--group", "pricing-pages"], all).out;
  assert.match(big, /\+\d+ more; add --full/);
  const full = main(["--group", "pricing-pages", "--full"], all).out;
  assert.ok(full.split("\n").length > 60, "--full lists every node");
  assert.equal(groupPacket(all, "pricing-pages").rows.length, 40);
});

test("the old index shape still answers the old modes", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const old = { ...all, index: { ...all.index } };
  delete old.index.patterns; delete old.index.fields;
  assert.equal(main(["Dialog"], old).code, 0);
  assert.equal(main(["--id", "PATH-B"], old).code, 3, "no copy of the nodes: a miss, not a crash");
  for (const m of ["--fields", "--patterns"]) {
    const r = main([m], old);
    assert.equal(r.code, 3, `${m}: an index with no copy is a miss, not an empty list`);
    assert.doesNotMatch(r.out, /say the skills have no rule/);
    assert.match(r.out, /not the same as there being no rule/);
  }
});

test("ids are one id in any case, and one file name is one group", () => {
  let s = fresh(); s.patterns.nodes.push({ id: "path-b-row-open", condition: "c", outcome: "o", source_file: "vois-patterns/references/x.md", node_type: "cross_cutting_rule", parent: null });
  assert.ok(has(problemsOf(s), /path-b-row-open is also patterns-rules\.json node/), "a lower-case copy of an id");
  s = fresh(); s.fields.rules.push({ ...fieldOf(s, "FIELD-PASTE"), id: "field-paste" });
  assert.ok(has(problemsOf(s), /field-paste is also fields-rules\.json rule/), "a lower-case copy of a field rule id");
  s = fresh(); nodeOf(s, "PATH-B-ROW-OPEN").source_file = "other-skill/references/table-interactions.md";
  assert.ok(has(problemsOf(s), /has the same file name; --group could not tell them apart/));
  s = fresh(); for (const n of s.patterns.nodes) if (/table-list/.test(n.source_file)) n.source_file = n.source_file.replace(/\//g, "\\");
  assert.deepEqual(problemsOf(s), [], "the same file written with backslashes is still one group");
});

test("component packets point to the PATH nodes that name the component", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const sheet = main(["Sheet"], all).out;
  assert.match(sheet, /^patterns   .*PATH-B-ROW-OPEN/m, "Sheet leads to the row-open rule that holds DS-PANEL-003");
  assert.equal(JSON.parse(main(["Sheet", "--json"], all).out).patterns.includes("PATH-B-ROW-OPEN"), true);
  // A common name is capped on one line and says how many it left out.
  const dialog = main(["Dialog"], all).out.split("\n").filter((l) => l.startsWith("patterns"));
  assert.equal(dialog.length, 1);
  assert.match(dialog[0], /\(\+\d+ more\)/);
  const dp = JSON.parse(main(["Dialog", "--json"], all).out);
  const total = Object.values(all.index.patterns).filter((n) => /(?<![A-Za-z0-9])Dialog(?![A-Za-z0-9])/.test(`${n.condition} ${n.outcome}`)).length;
  assert.equal(dp.patterns.length, 6, "the cut is at 6 ids");
  assert.equal(dp.patternsMore, total - 6, "the count of the rest is the total minus the 6 shown");
  assert.match(dialog[0], new RegExp(`\\(\\+${total - 6} more\\)`));
});

test("the patterns line matches whole component names only, in the same case", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const fake = { ...all, index: structuredClone(all.index) };
  fake.index.patterns = {
    "PATH-X-1": { kind: "decision", name: "x", group: "x", condition: "Sheets and sheet are not the component", outcome: "Use the Sheetlike thing", builds_on: [] },
    "PATH-X-2": { kind: "decision", name: "x", group: "x", condition: "Open a Sheet", outcome: "(Sheet)", builds_on: [] },
    "PATH-X-3": { kind: "decision", name: "x", group: "x", condition: "A BottomSheet or NativeSheet", outcome: "2Sheet and Sheet2", builds_on: [] },
  };
  const p = JSON.parse(main(["Sheet", "--json"], fake).out);
  assert.deepEqual(p.patterns, ["PATH-X-2"], "'Sheets', 'sheet', 'Sheetlike', 'BottomSheet' and '2Sheet' do not count");
  // An id with a regex character in it must not break the match or crash.
  const odd = { ...fake, index: structuredClone(fake.index) };
  odd.index.components.push({ ...odd.index.components.find((c) => c.id === "Sheet"), id: "A+B(" });
  assert.deepEqual(componentPacket(odd, "A+B(").patterns, [], "an id with regex characters does not throw or match everything");
  odd.index.patterns["PATH-X-4"] = { kind: "decision", name: "x", group: "x", condition: "Use A+B( here", outcome: "ok", builds_on: [] };
  odd.index.patterns["PATH-X-5"] = { kind: "decision", name: "x", group: "x", condition: "Use AAB( here", outcome: "ok", builds_on: [] };
  assert.deepEqual(componentPacket(odd, "A+B(").patterns, ["PATH-X-4"], "the id is matched as written, not as a pattern");
});

test("a component packet from an index with no PATH copy has no patterns line", () => {
  const all = loadAll(join(ROOT, "vois-components"));
  const old = { ...all, index: { ...all.index } };
  delete old.index.patterns;
  const r = main(["Sheet"], old);
  assert.equal(r.code, 0);
  assert.doesNotMatch(r.out, /^patterns /m);
});
