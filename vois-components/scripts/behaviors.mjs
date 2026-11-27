#!/usr/bin/env node
// Checks the component behavior cards (vois-components/behaviors/*.json) and builds their Markdown.
//   node vois-components/scripts/behaviors.mjs            check the cards, and fail if a .md is stale or missing
//   node vois-components/scripts/behaviors.mjs --write    rewrite the .md files, then check
//
// The JSON is the source of truth. The .md next to each card is generated: edit the JSON, then run with --write.
//
// The schema validator below is a small subset on purpose (same one vois-fields uses). It fails closed: a schema
// keyword it does not know is an error, so a schema can never ask for a check that is skipped.
import { readFileSync, readdirSync, writeFileSync, existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const SCHEMA = join(ROOT, "data", "behavior-card.schema.json");
const CARDS = join(ROOT, "behaviors");
const DS_RULES = join(ROOT, "..", "vois-tokens", "data", "vois-rules.json");
const KNOWN = new Set(["$schema", "$id", "$defs", "$ref", "title", "description", "type", "enum", "required", "properties", "additionalProperties", "items", "minItems", "minLength", "minimum", "pattern"]);

const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
const matches = (t, v) => (t === "number" ? typeof v === "number" : t === "integer" ? Number.isInteger(v) : typeOf(v) === t);

export function validate(schema, value, root = schema, path = "$") {
  const out = [];
  for (const k of Object.keys(schema)) if (!KNOWN.has(k)) out.push(`${path}: the schema uses "${k}", which the checker does not support`);
  // Shapes the checker does not handle are errors, so a schema never asks for a check that is skipped.
  if (Array.isArray(schema.type)) return [...out, `${path}: the schema uses a list for "type", which the checker does not support`];
  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties !== "boolean") out.push(`${path}: the schema uses an object for "additionalProperties", which the checker does not support`);
  if (schema.$ref) {
    for (const k of Object.keys(schema)) if (!["$ref", "$defs", "$schema", "$id", "title", "description"].includes(k) && KNOWN.has(k)) out.push(`${path}: "${k}" next to $ref is not checked, so the checker does not support it`);
    const m = /^#\/\$defs\/(.+)$/.exec(schema.$ref);
    const target = m && root.$defs && root.$defs[m[1]];
    if (!target) return [...out, `${path}: unknown $ref ${schema.$ref}`];
    return [...out, ...validate(target, value, root, path)];
  }
  if (schema.type && !matches(schema.type, value)) return [...out, `${path}: expected ${schema.type}, got ${typeOf(value)}`];
  if (schema.enum && !schema.enum.includes(value)) out.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) out.push(`${path}: empty or too short`);
    if (schema.pattern) {
      let re = null;
      try { re = new RegExp(schema.pattern); } catch { out.push(`${path}: the schema pattern ${JSON.stringify(schema.pattern)} is not a valid regular expression`); }
      if (re && !re.test(value)) out.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
    }
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

// Rules a schema cannot say. `cards` is an array of { file, card }. `dsIds` is a Set of DS-* ids, or null when
// the rule file could not be read (that is an error: a rule link must never pass because the list was missing).
export function semanticProblems(cards, dsIds) {
  const out = [];
  if (!(dsIds instanceof Set)) out.push("the DS rule list could not be read, so rule links cannot be checked");
  const seenCards = new Map();
  const seenIds = new Map();
  for (const { file, card } of cards) {
    // The schema reports a malformed card. Here a card that is not an object is skipped, so this never throws.
    if (!card || typeof card !== "object" || Array.isArray(card)) continue;
    const at = `${file}`;
    if (typeof card.id === "string" && file.replace(/\.json$/, "") !== card.id) out.push(`${at}: the file name must be ${card.id}.json`);
    const date = card.basis && card.basis.checkedAt;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const t = new Date(`${date}T00:00:00Z`);
      if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== date) out.push(`${at}: basis.checkedAt ${date} is not a real date`);
    }
    if (seenCards.has(card.id)) out.push(`${at}: duplicate card id ${card.id}, also in ${seenCards.get(card.id)}`);
    seenCards.set(card.id, file);
    const prefix = typeof card.id === "string" ? `BHV-${card.id.toUpperCase()}-` : null;
    const lists = [["behaviors", card.behaviors], ["mistakes", card.mistakes]];
    for (const [listName, list] of lists) {
      if (!Array.isArray(list)) continue;
      for (const b of list) {
        if (!b || typeof b !== "object") continue;
        const bat = `${at}: ${b.id}`;
        if (typeof b.id === "string") {
          // The rest after the prefix must be exactly three digits, so "tabs" cannot take an id of "tabs-two".
          if (prefix && !(b.id.startsWith(prefix) && /^\d{3}$/.test(b.id.slice(prefix.length)))) out.push(`${bat}: id must be ${prefix} followed by three digits`);
          if (seenIds.has(b.id)) out.push(`${bat}: duplicate behavior id, also in ${seenIds.get(b.id)}`);
          seenIds.set(b.id, file);
        }
        if ((listName === "mistakes") !== (b.group === "mistake")) out.push(`${bat}: group "mistake" belongs in mistakes, and only there`);
        const has = (k) => typeof b[k] === "string" && b[k].trim().length > 0;
        // A claim about the library needs proof. An unchecked row must not pretend to have it.
        if (b.support === "native" && !has("evidence")) out.push(`${bat}: a native row needs evidence (the file and what it shows)`);
        if (b.support === "differs" && !(has("evidence") && has("note"))) out.push(`${bat}: a differs row needs evidence and a note that says what to do`);
        if (b.support === "decide" && !has("note")) out.push(`${bat}: a decide row needs a note that says what is open`);
        // Evidence is proof of a claim about the library, so only the two tags that make such a claim may carry it.
        if (b.support !== "native" && b.support !== "differs" && Object.hasOwn(b, "evidence")) out.push(`${bat}: a ${b.support} row cannot carry evidence. Only native and differs rows can. Change support or remove it`);
        if (dsIds instanceof Set && Array.isArray(b.rules)) {
          for (const r of b.rules) if (!dsIds.has(r)) out.push(`${bat}: ${r} is not a rule in vois-tokens/data/vois-rules.json`);
          if (new Set(b.rules).size !== b.rules.length) out.push(`${bat}: a rule is listed twice`);
        }
      }
    }
  }
  return out;
}

// The cards are trusted, but a newline in free text would start a new Markdown block. Keep each field on one line.
const flat = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ");
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const LEGEND = [
  ["native", "The library does this. Do not undo it."],
  ["differs", "The library does something else. Read the note."],
  ["supply", "The library does not do this. You build it."],
  ["decide", "This needs a product or design decision."],
  ["unchecked", "Not checked against the library yet."],
];
const GROUPS = [["interaction", "Interaction"], ["keyboard", "Keyboard"], ["focus", "Focus"], ["state", "State"], ["accessibility", "Accessibility"]];

function line(b) {
  let s = `- **${b.id}** \`${b.support}\` ${flat(b.text)}`;
  if (b.note) s += ` ${flat(b.note)}`;
  if (b.rules.length) s += ` (${b.rules.join(", ")})`;
  return s;
}

export function render(card) {
  let o = `<!-- GENERATED from behaviors/${card.id}.json by scripts/behaviors.mjs. Edit the JSON, then run \`node vois-components/scripts/behaviors.mjs --write\`. Do not edit by hand. -->\n\n`;
  o += `# ${flat(card.name)} behavior\n\n${flat(card.purpose)}\n\n`;
  if (card.notFor.length) o += `**Use something else when:**\n\n${card.notFor.map((n) => `- ${flat(n.use)}: ${flat(n.when)}`).join("\n")}\n\n`;
  o += `**Basis:** ${flat(card.basis.library)}, checked ${card.basis.checkedAt}. ${flat(card.basis.note)}\n\n`;
  o += `**Support tags**\n\n${LEGEND.map(([k, v]) => `- \`${k}\`: ${v}`).join("\n")}\n\n`;
  o += `## Anatomy\n\n| Part | Required | Note |\n|---|---|---|\n${card.anatomy.map((a) => `| ${cell(a.part)} | ${a.required ? "yes" : "no"} | ${cell(a.note)} |`).join("\n")}\n\n`;
  for (const [g, title] of GROUPS) {
    const rows = card.behaviors.filter((b) => b.group === g);
    if (rows.length) o += `## ${title}\n\n${rows.map(line).join("\n")}\n\n`;
  }
  if (card.mistakes.length) o += `## Common mistakes\n\n${card.mistakes.map(line).join("\n")}\n`;
  return o.replace(/\n+$/, "\n");
}

function loadCards(dir) {
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((file) => ({ file, card: JSON.parse(readFileSync(join(dir, file), "utf8")) }));
}

// Files in the folder that a card does not own. A name like Tabs.JSON is not read as a card, so it would hide a card
// from every check. A .md with no card is a leftover that an agent reading behaviors/<id>.md could still be served.
function strayFiles(dir, cards) {
  const ids = new Set(cards.map(({ file }) => file.replace(/\.json$/, "")));
  const out = [];
  for (const f of readdirSync(dir)) {
    if (/\.json$/i.test(f) && !f.endsWith(".json")) out.push(`${f}: the extension must be lowercase .json, or the card is never checked`);
    else if (/\.md$/i.test(f) && !(f.endsWith(".md") && ids.has(f.slice(0, -3)))) out.push(`${f}: no card ${f.replace(/\.md$/i, "")}.json owns this file. Delete it, or add the card`);
  }
  return out;
}

function loadDsIds() {
  try {
    const d = JSON.parse(readFileSync(DS_RULES, "utf8"));
    const rules = Array.isArray(d) ? d : d.rules;
    return new Set(rules.map((r) => r.id));
  } catch { return null; }
}

export function checkAll({ dir = CARDS, schemaPath = SCHEMA, dsIds = loadDsIds(), write = false } = {}) {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  let cards;
  try { cards = loadCards(dir); } catch (e) { return [`${dir}: ${e.message}`]; }
  if (!cards.length) return [`${dir}: no cards found`];
  const out = [];
  for (const { file, card } of cards) out.push(...validate(schema, card).map((p) => `${file} ${p}`));
  out.push(...semanticProblems(cards, dsIds));
  out.push(...strayFiles(dir, cards));
  if (out.length) return out; // a card that fails the schema may not render, so stop here
  for (const { file, card } of cards) {
    const mdPath = join(dir, file.replace(/\.json$/, ".md"));
    const want = render(card);
    if (write) writeFileSync(mdPath, want);
    else if (!existsSync(mdPath) || readFileSync(mdPath, "utf8") !== want) out.push(`${file.replace(/\.json$/, ".md")}: stale or missing. Run: node vois-components/scripts/behaviors.mjs --write`);
  }
  return out;
}

// realpath on both sides: a symlinked skill install gives argv[1] the link path but import.meta.url the real one.
// An argv[1] that does not resolve (an import from `node -e` with arguments) is not this script, so main() stays off.
const isEntry = (() => { let arg; try { arg = process.argv[1] && realpathSync(process.argv[1]); } catch { return false; } if (!arg) return false; try { return realpathSync(fileURLToPath(import.meta.url)) === arg; } catch { return true; } })();
if (isEntry) {
  const problems = checkAll({ write: process.argv.includes("--write") });
  if (problems.length) { console.error(problems.map((p) => "  " + p).join("\n")); console.error(`behaviors: ${problems.length} problem(s)`); process.exit(1); }
  console.log("behaviors: OK");
}
