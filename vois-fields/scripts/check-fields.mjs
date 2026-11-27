// Checks vois-fields/data/field-types.json: first against its JSON Schema, then against the rules a schema
// cannot say. Run: node vois-fields/scripts/check-fields.mjs
//
// The schema validator below is a small subset on purpose (type, enum, required, properties,
// additionalProperties, items, minItems, minLength, minimum, pattern, $ref to #/$defs). It fails closed:
// a schema keyword it does not know is an error, so a schema can never ask for a check that is skipped.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "..", "data");
const KNOWN = new Set(["$schema", "$id", "$defs", "$ref", "title", "description", "type", "enum", "required", "properties", "additionalProperties", "items", "minItems", "minLength", "minimum", "pattern"]);

const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
const matches = (t, v) => (t === "number" ? typeof v === "number" : t === "integer" ? Number.isInteger(v) : typeOf(v) === t);

export function validate(schema, value, root = schema, path = "$") {
  const out = [];
  for (const k of Object.keys(schema)) if (!KNOWN.has(k)) out.push(`${path}: the schema uses "${k}", which the checker does not support`);
  if (schema.$ref) {
    const m = /^#\/\$defs\/(.+)$/.exec(schema.$ref);
    const target = m && root.$defs && root.$defs[m[1]];
    if (!target) return [...out, `${path}: unknown $ref ${schema.$ref}`];
    return [...out, ...validate(target, value, root, path)];
  }
  if (schema.type && !matches(schema.type, value)) return [...out, `${path}: expected ${schema.type}, got ${typeOf(value)}`];
  if (schema.enum && !schema.enum.includes(value)) out.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) out.push(`${path}: empty or too short`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) out.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) out.push(`${path}: ${value} is under ${schema.minimum}`);
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) out.push(`${path}: needs at least ${schema.minItems} item(s)`);
    if (schema.items) value.forEach((v, i) => out.push(...validate(schema.items, v, root, `${path}[${i}]`)));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const r of schema.required ?? []) if (!Object.hasOwn(value, r)) out.push(`${path}: missing "${r}"`);
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(value)) {
      if (Object.hasOwn(props, k)) out.push(...validate(props[k], v, root, `${path}.${k}`));
      else if (schema.additionalProperties === false) out.push(`${path}: "${k}" is not a known property`);
    }
  }
  return out;
}

// Rules a schema cannot say. maskExempt (a sensitive field that is not masked, such as a one-time code that is
// never shown back) is data on the row, so no row id is named here.
export function semanticProblems(data) {
  const out = [];
  const ids = new Set();
  // The schema reports a malformed table. Here a row that is not an object is skipped, so this never throws.
  if (!data || !Array.isArray(data.types)) return out;
  for (const t of data.types) {
    if (!t || typeof t !== "object") continue;
    const at = `types[${t.id}]`;
    if (ids.has(t.id)) out.push(`${at}: duplicate id`);
    ids.add(t.id);
    const i = t.input ?? {}, p = t.privacy ?? {}, c = t.check ?? {};
    // type=number is never allowed (FIELD-TEXT-CODES). The schema enum on input.type is the guard: it does not list "number".
    if (i.type === "password" && p.class !== "sensitive") out.push(`${at}: type=password is only for sensitive fields`);
    // Sensitive data (FIELD-SENSITIVE-*): masked, never in URL, logs or analytics, no suggestions.
    if (p.class === "sensitive") {
      if (p.inUrl || p.inLogs || p.inAnalytics) out.push(`${at}: a sensitive field cannot go in a URL, log or analytics event`);
      if (p.suggestions) out.push(`${at}: a sensitive field cannot offer suggestions`);
    }
    if (p.class === "personal" && (p.inUrl || p.inAnalytics)) out.push(`${at}: a personal field cannot go in a URL or analytics event`);
    if (p.class === "sensitive" && !p.mask && !p.maskExempt) out.push(`${at}: a sensitive field is masked after entry`);
    // Checking while the user is still typing is an error (FIELD-INCOMPLETE).
    if (c.when === "typing" || c.blocksTyping) out.push(`${at}: a check must not run on every keystroke or block typing`);
    // A format check is not proof (FIELD-FORMAT-NOT-PROOF): a row that says it is proof must say what proves it.
    if (c.isProof === false && c.how && /\b(valid|exists|in service)\b/i.test(c.how)) out.push(`${at}: "how" claims validity. Say what the check does, and put what it cannot show in proofNote`);
    if (c.isProof === false && !c.proofNote) out.push(`${at}: a format check needs a proofNote that says what it cannot show`);
    // One-time codes must allow autofill.
    if (t.id === "one-time-code" && i.autocomplete !== "one-time-code") out.push(`${at}: autocomplete must be one-time-code`);
    // maxlength may not cut a pasted value that has separators: ZIP+4 and SSN rows count the separator.
    if (t.confidence === "proposed" && !t.needsTest) out.push(`${at}: a proposed row needs a needsTest note`);
  }
  return out;
}

export function checkAll(dir = DATA) {
  const schema = JSON.parse(readFileSync(join(dir, "field-types.schema.json"), "utf8"));
  const data = JSON.parse(readFileSync(join(dir, "field-types.json"), "utf8"));
  return [...validate(schema, data), ...semanticProblems(data)];
}

// realpath on both sides: a symlinked skill install gives argv[1] the link path but import.meta.url the real one.
// An argv[1] that does not resolve (an import from `node -e` with arguments) is not this script, so main() stays off.
const isEntry = (() => { let arg; try { arg = process.argv[1] && realpathSync(process.argv[1]); } catch { return false; } if (!arg) return false; try { return realpathSync(fileURLToPath(import.meta.url)) === arg; } catch { return true; } })();
if (isEntry) {
  const problems = checkAll();
  if (problems.length) { console.error(problems.map((p) => "  " + p).join("\n")); console.error(`check-fields: ${problems.length} problem(s)`); process.exit(1); }
  console.log("check-fields: OK");
}
