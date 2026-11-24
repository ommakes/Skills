// Tests for behaviors.mjs. Run: node vois-components/scripts/behaviors.test.mjs
// Each guard has a test that tries to get past it. See CLAUDE.md "Guards need a test from the other side".
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validate, semanticProblems, render, checkAll } from "./behaviors.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(join(here, "..", "data", "behavior-card.schema.json"), "utf8"));
const DS = new Set(["DS-A11Y-007", "DS-A11Y-032"]);

const good = () => ({
  id: "tabs", name: "Tabs", purpose: "p", notFor: [],
  basis: { library: "radix-ui", checkedAt: "2026-11-23", source: "s", note: "n" },
  anatomy: [{ part: "Tabs", required: true, note: "n" }],
  behaviors: [
    { id: "BHV-TABS-001", group: "keyboard", text: "t", support: "native", evidence: "tabs.tsx", rules: ["DS-A11Y-032"] },
    { id: "BHV-TABS-002", group: "state", text: "t", support: "unchecked", rules: [] },
  ],
  mistakes: [{ id: "BHV-TABS-003", group: "mistake", text: "t", support: "supply", rules: [] }],
});
const sem = (card, file = "tabs.json", ds = DS) => semanticProblems([{ file, card }], ds);
const withB = (patch, i = 0) => { const c = good(); Object.assign(c.behaviors[i], patch); return c; };

test("a good card has no problems", () => {
  assert.deepEqual(validate(schema, good()), []);
  assert.deepEqual(sem(good()), []);
});

test("schema: an extra property, a bad id and a bad group all fail", () => {
  assert.ok(validate(schema, { ...good(), extra: 1 }).some((p) => /not a known property/.test(p)));
  assert.ok(validate(schema, withB({ id: "TABS-001" })).some((p) => /does not match/.test(p)));
  assert.ok(validate(schema, withB({ group: "other" })).some((p) => /is not one of/.test(p)));
  assert.ok(validate(schema, withB({ support: "yes" })).some((p) => /is not one of/.test(p)));
  assert.ok(validate(schema, withB({ rules: ["ds-a11y-1"] })).some((p) => /does not match/.test(p)));
});

test("schema: a keyword the checker does not know fails closed", () => {
  const bad = { ...schema, properties: { ...schema.properties, id: { type: "string", format: "uri" } } };
  assert.ok(validate(bad, good()).some((p) => /does not support/.test(p)));
});

test("native needs evidence, and unchecked cannot carry it", () => {
  assert.ok(sem(withB({ evidence: undefined })).some((p) => /native row needs evidence/.test(p)));
  assert.ok(sem(withB({ evidence: "" })).some((p) => /native row needs evidence/.test(p)));
  assert.ok(sem(withB({ evidence: 5 })).some((p) => /native row needs evidence/.test(p)));
  assert.ok(sem(withB({ evidence: "tabs.tsx" }, 1)).some((p) => /unchecked row cannot carry evidence/.test(p)));
});

test("differs needs evidence and a note, decide needs a note", () => {
  assert.ok(sem(withB({ support: "differs", evidence: "x" })).some((p) => /differs row needs/.test(p)));
  assert.ok(sem(withB({ support: "differs", note: "x", evidence: undefined })).some((p) => /differs row needs/.test(p)));
  assert.deepEqual(sem(withB({ support: "differs", evidence: "x", note: "y" })), []);
  assert.ok(sem(withB({ support: "decide", evidence: undefined })).some((p) => /decide row needs a note/.test(p)));
});

test("an id must carry the card's prefix, and must be unique inside and across cards", () => {
  assert.ok(sem(withB({ id: "BHV-DIALOG-001" })).some((p) => /id must be BHV-TABS- followed by three digits/.test(p)));
  assert.ok(sem(withB({ id: "BHV-TABS-001" }, 1)).some((p) => /duplicate behavior id/.test(p)));
  const other = good(); other.id = "tabs-two";
  other.behaviors = [{ id: "BHV-TABS-TWO-001", group: "state", text: "t", support: "unchecked", rules: [] }]; other.mistakes = [];
  assert.deepEqual(semanticProblems([{ file: "tabs.json", card: good() }, { file: "tabs-two.json", card: other }], DS), []);
  // The same card id in two files is caught across cards. The prefix clash has its own test below.
  const clash = good(); clash.id = "tabs"; clash.behaviors[0].id = "BHV-TABS-001";
  assert.ok(semanticProblems([{ file: "tabs.json", card: good() }, { file: "tabs.json", card: clash }], DS).some((p) => /duplicate card id/.test(p)));
});

test("the file name must match the card id", () => {
  assert.ok(sem(good(), "tab.json").some((p) => /file name must be tabs.json/.test(p)));
});

test("mistakes and the mistake group go together", () => {
  const a = good(); a.mistakes[0].group = "state";
  assert.ok(sem(a).some((p) => /belongs in mistakes/.test(p)));
  const b = good(); b.behaviors[0].group = "mistake";
  assert.ok(sem(b).some((p) => /belongs in mistakes/.test(p)));
});

test("a rule link must exist, must not repeat, and a missing rule list is an error", () => {
  assert.ok(sem(withB({ rules: ["DS-NOPE-001"] })).some((p) => /not a rule in/.test(p)));
  assert.ok(sem(withB({ rules: ["DS-A11Y-007", "DS-A11Y-007"] })).some((p) => /listed twice/.test(p)));
  assert.ok(sem(good(), "tabs.json", null).some((p) => /rule list could not be read/.test(p)));
  assert.ok(sem(good(), "tabs.json", ["DS-A11Y-007"]).some((p) => /rule list could not be read/.test(p)));
});

test("a malformed card does not throw", () => {
  assert.doesNotThrow(() => semanticProblems([{ file: "x.json", card: null }, { file: "y.json", card: [] }, { file: "z.json", card: { id: "z", behaviors: [null, 4], mistakes: "no" } }], DS));
});

test("render puts a pipe in a table cell safely and leaves out evidence", () => {
  const c = good(); c.anatomy[0].part = "A | B";
  const md = render(c);
  assert.match(md, /A \\\| B/);
  assert.doesNotMatch(md, /tabs\.tsx/);
  assert.match(md, /BHV-TABS-001\*\* `native`/);
});

test("checkAll: a stale or missing .md is reported, --write fixes it, and an empty folder fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "bhv-"));
  writeFileSync(join(dir, "tabs.json"), JSON.stringify(good()));
  const sp = join(here, "..", "data", "behavior-card.schema.json");
  assert.ok(checkAll({ dir, schemaPath: sp, dsIds: DS }).some((p) => /stale or missing/.test(p)));
  assert.deepEqual(checkAll({ dir, schemaPath: sp, dsIds: DS, write: true }), []);
  assert.deepEqual(checkAll({ dir, schemaPath: sp, dsIds: DS }), []);
  writeFileSync(join(dir, "tabs.md"), readFileSync(join(dir, "tabs.md"), "utf8") + "\nhand edit\n");
  assert.ok(checkAll({ dir, schemaPath: sp, dsIds: DS }).some((p) => /stale or missing/.test(p)));
  const empty = mkdtempSync(join(tmpdir(), "bhv-"));
  assert.ok(checkAll({ dir: empty, schemaPath: sp, dsIds: DS }).some((p) => /no cards found/.test(p)));
});

test("checkAll: a card that fails the schema stops before rendering", () => {
  const dir = mkdtempSync(join(tmpdir(), "bhv-"));
  const bad = good(); delete bad.purpose;
  writeFileSync(join(dir, "tabs.json"), JSON.stringify(bad));
  const p = checkAll({ dir, schemaPath: join(here, "..", "data", "behavior-card.schema.json"), dsIds: DS, write: true });
  assert.ok(p.some((x) => /missing "purpose"/.test(x)));
});

test("an id is the card prefix plus exactly three digits, so one card cannot take another's ids", () => {
  assert.ok(sem(withB({ id: "BHV-TABS-TWO-001" })).some((p) => /followed by three digits/.test(p)));
  assert.ok(sem(withB({ id: "BHV-TABS-0001" })).some((p) => /followed by three digits/.test(p)));
  assert.ok(sem(withB({ id: "BHV-TABS-01" })).some((p) => /followed by three digits/.test(p)));
});

test("a field of only spaces counts as empty: text, evidence and note", () => {
  assert.ok(validate(schema, withB({ text: "   " })).length > 0);
  assert.ok(validate(schema, withB({ text: "\n\t" })).length > 0);
  assert.ok(sem(withB({ evidence: "   " })).some((p) => /native row needs evidence/.test(p)));
  assert.ok(sem(withB({ support: "differs", evidence: "e", note: "  " })).some((p) => /differs row needs evidence and a note/.test(p)));
  assert.ok(sem(withB({ support: "decide", note: " " }, 1)).some((p) => /decide row needs a note/.test(p)));
});

test("evidence belongs only on native and differs rows", () => {
  for (const support of ["supply", "decide", "unchecked"]) {
    const c = withB({ support, evidence: "claims", note: "n" }, 1);
    assert.ok(sem(c).some((p) => new RegExp(`a ${support} row cannot carry evidence`).test(p)), support);
  }
  assert.ok(sem(withB({ support: "supply", evidence: "" }, 1)).some((p) => /cannot carry evidence/.test(p)));
});

test("basis.checkedAt must be a real calendar date", () => {
  for (const d of ["9999-99-99", "2026-13-45", "2026-02-30", "2026-00-10"]) {
    const c = good(); c.basis.checkedAt = d;
    assert.ok(sem(c).some((p) => /not a real date/.test(p)), d);
  }
  const ok = good(); ok.basis.checkedAt = "2024-02-29";
  assert.deepEqual(sem(ok), []);
});

test("schema: shapes the checker cannot handle are errors, and a bad pattern does not throw", () => {
  assert.ok(validate({ type: "object", additionalProperties: { type: "string" } }, { a: 1 }).some((p) => /object for "additionalProperties"/.test(p)));
  assert.ok(validate({ $defs: { s: { type: "string" } }, $ref: "#/$defs/s", pattern: "^a$" }, "b").some((p) => /next to \$ref/.test(p)));
  assert.ok(validate({ type: ["string", "null"] }, "x").some((p) => /list for "type"/.test(p)));
  let out;
  assert.doesNotThrow(() => { out = validate({ type: "string", pattern: "[" }, "x"); });
  assert.ok(out.some((p) => /not a valid regular expression/.test(p)));
  // the allowed form of additionalProperties still works
  assert.deepEqual(validate({ type: "object", additionalProperties: true }, { a: 1 }), []);
});

test("a card with no id does not make a misleading file-name message", () => {
  const c = good(); delete c.id;
  assert.ok(!sem(c).some((p) => /undefined/.test(p)));
});

test("checkAll: an orphan .md, and a card file whose extension is not lowercase .json, are reported", () => {
  const sp = join(here, "..", "data", "behavior-card.schema.json");
  const dir = mkdtempSync(join(tmpdir(), "bhv-"));
  writeFileSync(join(dir, "tabs.json"), JSON.stringify(good()));
  assert.deepEqual(checkAll({ dir, schemaPath: sp, dsIds: DS, write: true }), []);
  writeFileSync(join(dir, "gone.md"), "left over");
  assert.ok(checkAll({ dir, schemaPath: sp, dsIds: DS }).some((p) => /gone\.md: no card gone\.json owns this file/.test(p)));
  writeFileSync(join(dir, "TABS.MD"), "x");
  assert.ok(checkAll({ dir, schemaPath: sp, dsIds: DS }).some((p) => /TABS\.MD: no card/.test(p)));
  const dir2 = mkdtempSync(join(tmpdir(), "bhv-"));
  writeFileSync(join(dir2, "tabs.json"), JSON.stringify(good()));
  writeFileSync(join(dir2, "Hidden.JSON"), JSON.stringify(good()));
  assert.ok(checkAll({ dir: dir2, schemaPath: sp, dsIds: DS }).some((p) => /Hidden\.JSON: the extension must be lowercase/.test(p)));
});

test("render keeps free text on one line, so a newline cannot start a heading", () => {
  const c = good(); c.purpose = "line1\n\n## Fake"; c.behaviors[0].text = "a\n\n# Also fake"; c.behaviors[0].note = "n1\n- x";
  const md = render(c);
  assert.ok(!/^## Fake/m.test(md));
  assert.ok(!/^# Also fake/m.test(md));
  assert.ok(!/^- x/m.test(md));
});

test("the real cards pass", () => {
  assert.deepEqual(checkAll(), []);
});
