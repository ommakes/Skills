// Each guard gets an input that should pass and inputs that try to get past it.
// Run: node vois-fields/scripts/check-fields.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validate, semanticProblems, checkAll } from "./check-fields.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const schema = JSON.parse(readFileSync(join(dir, "field-types.schema.json"), "utf8"));
const real = () => JSON.parse(readFileSync(join(dir, "field-types.json"), "utf8"));
const all = (d) => [...validate(schema, d), ...semanticProblems(d)];
const row = (d, id) => d.types.find((t) => t.id === id);

test("the committed table passes", () => assert.deepEqual(checkAll(), []));

test("schema: a missing required property fails, at every level", () => {
  for (const mutate of [(d) => delete d.types[0].privacy, (d) => delete d.types[0].privacy.inLogs, (d) => delete d.types[0].check.when, (d) => delete d.types[0].input.autocomplete, (d) => delete d.privacyClasses.sensitive]) {
    const d = real(); mutate(d);
    assert.ok(all(d).length > 0, String(mutate));
  }
});

test("schema: an invented property fails, at every level", () => {
  for (const mutate of [(d) => (d.types[0].colour = "red"), (d) => (d.types[0].input.pattern = "x"), (d) => (d.types[0].privacy.risk = true), (d) => (d.extra = 1)]) {
    const d = real(); mutate(d);
    assert.match(all(d).join("\n"), /not a known property/, String(mutate));
  }
});

test("schema: a wrong type, an unknown enum value, an empty string and a bad id all fail", () => {
  const cases = [
    (d) => (d.types[0].input.spellcheck = "false"),
    (d) => (d.types[0].input.type = "number"),
    (d) => (d.types[0].input.inputmode = "number"),
    (d) => (d.types[0].privacy.class = "secret"),
    (d) => (d.types[0].shown = ""),
    (d) => (d.types[0].id = "Email Address"),
    (d) => (d.types[0].input.maxlength = 0),
    (d) => (d.types[0].never = []),
    (d) => (d.types[0].confidence = "sure"),
  ];
  for (const mutate of cases) { const d = real(); mutate(d); assert.ok(all(d).length > 0, String(mutate)); }
});

test("schema checker fails closed: a keyword it does not support is an error, not a skipped check", () => {
  const s = { type: "object", properties: { a: { type: "string", format: "email" } } };
  assert.match(validate(s, { a: "x" }).join(), /does not support/);
  assert.match(validate({ $ref: "#/$defs/missing" }, {}).join(), /unknown \$ref/);
});

test("type=number is never allowed: the schema enum on input.type does not list it", () => {
  const d = real(); row(d, "postal-code-us").input.type = "number";
  assert.match(all(d).join("\n"), /is not one of/);
  assert.ok(!schema.$defs.fieldType.properties.input.properties.type.enum.includes("number"));
});

test("semantic: a sensitive field is masked unless the row says maskExempt, and maskExempt does not excuse a URL or log leak", () => {
  let d = real(); row(d, "drivers-license").privacy.maskExempt = true; row(d, "drivers-license").privacy.mask = false;
  assert.deepEqual(all(d), [], "an exempt row passes");
  row(d, "drivers-license").privacy.inLogs = true;
  assert.match(all(d).join("\n"), /sensitive field cannot go/);
});

test("semantic: a malformed table is reported by the schema and never throws", () => {
  for (const bad of [{}, { types: {} }, { types: [null] }, { types: [1, "x"] }, null]) {
    assert.doesNotThrow(() => all(bad), JSON.stringify(bad));
  }
  assert.ok(all({ types: {} }).length > 0);
});

test("semantic: a sensitive field cannot go in a URL, a log or an analytics event, and cannot offer suggestions", () => {
  for (const key of ["inUrl", "inLogs", "inAnalytics", "suggestions"]) {
    const d = real(); row(d, "ssn").privacy[key] = true;
    assert.match(all(d).join("\n"), /sensitive field/, key);
  }
});

test("semantic: a personal field cannot go in a URL or analytics, and a sensitive one must be masked", () => {
  let d = real(); row(d, "email").privacy.inUrl = true;
  assert.match(all(d).join("\n"), /personal field/);
  d = real(); row(d, "drivers-license").privacy.mask = false;
  assert.match(all(d).join("\n"), /masked after entry/);
});

test("semantic: a check may not run on every keystroke or block typing", () => {
  let d = real(); row(d, "vin").check.when = "typing";
  assert.match(all(d).join("\n"), /every keystroke/);
  d = real(); row(d, "vin").check.blocksTyping = true;
  assert.match(all(d).join("\n"), /every keystroke/);
});

test("semantic: a format check must say what it cannot show, and may not claim the value is valid", () => {
  let d = real(); row(d, "email").check.proofNote = "";
  assert.match(all(d).join("\n"), /proofNote/);
  d = real(); row(d, "email").check.how = "The address is valid and exists.";
  assert.match(all(d).join("\n"), /claims validity/);
});

test("semantic: the one-time code keeps autofill, and a proposed row says what to test", () => {
  let d = real(); row(d, "one-time-code").input.autocomplete = "off";
  assert.match(all(d).join("\n"), /one-time-code/);
  d = real(); delete row(d, "vin").needsTest;
  assert.match(all(d).join("\n"), /needsTest/);
});

test("semantic: a duplicate id fails", () => {
  const d = real(); d.types.push(structuredClone(d.types[0]));
  assert.match(all(d).join("\n"), /duplicate id/);
});

test("the prefill answer schema: the four properties are required, the enums are closed, and an invented property fails", () => {
  const a = JSON.parse(readFileSync(join(dir, "prefill-answer.schema.json"), "utf8"));
  const good = { fieldType: "vin", value: "1HGCM82633A004352", origin: "lookup", confidence: "high" };
  assert.deepEqual(validate(a, good), []);
  assert.deepEqual(validate(a, { ...good, sourceLabel: "From the VIN lookup" }), []);
  for (const k of ["fieldType", "value", "origin", "confidence"]) { const x = { ...good }; delete x[k]; assert.match(validate(a, x).join(), new RegExp(`missing "${k}"`), k); }
  assert.ok(validate(a, { ...good, origin: "guess" }).length > 0);
  assert.ok(validate(a, { ...good, confidence: "medium" }).length > 0);
  assert.match(validate(a, { ...good, extra: 1 }).join(), /not a known property/);
  assert.ok(validate(a, { ...good, fieldType: "Not A Row" }).length > 0);
  assert.ok(validate(a, { ...good, sourceLabel: "" }).length > 0);
  // the field type must name a real row
  const ids = new Set(real().types.map((t) => t.id));
  assert.ok(ids.has(good.fieldType));
});

test("the VIN row follows the rules it is built on: 17 characters, uppercase, text, paste allowed", () => {
  const v = row(real(), "vin");
  assert.equal(v.input.maxlength, 17);
  assert.equal(v.input.autocapitalize, "characters");
  assert.equal(v.input.type, "text");
  assert.ok(v.never.some((x) => /paste/i.test(x)));
  assert.ok(v.stored.rule.includes("I, O and Q"));
});
