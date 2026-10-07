// Validation for team overrides, base-change proposals and the ranges file. Zero dependencies.
// A team override can add a rule, tighten a limit the base marks as tunable, or choose a value inside
// a range the base leaves open. It can never loosen a base rule: that goes through a base-change proposal.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SKILLS_DIR = join(HERE, "..", "..");
export const RANGES_FILE = join(HERE, "..", "data", "ranges.json");

export const OVERRIDE_SCHEMA = "vois-team-override/1";
export const PROPOSAL_SCHEMA = "vois-base-proposal/1";
export const RANGES_SCHEMA = "vois-ranges/1";

const SEVERITIES = ["required", "recommended", "preferred"];
const ENFORCEMENTS = ["advisory", "blocking"];
const RELAXING_OPS = ["relax", "disable", "ignore", "exempt", "waive", "remove"];
const STATUSES = ["open", "accepted", "rejected", "withdrawn"];
const CHANGE_KINDS = ["value", "text", "new-rule", "relax", "remove"];

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v, min = 1) => typeof v === "string" && v.trim().length >= min;
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

function collectStrings(o, out = []) {
  if (typeof o === "string") out.push(o);
  else if (Array.isArray(o)) o.forEach((v) => collectStrings(v, out));
  else if (isObj(o)) Object.values(o).forEach((v) => collectStrings(v, out));
  return out;
}

/** Every base rule id mapped to its text, read from the three skills' data files. */
export function loadBase(skillsDir = DEFAULT_SKILLS_DIR) {
  const rules = new Map();
  for (const r of readJson(join(skillsDir, "vois-tokens", "data", "vois-rules.json")).rules) rules.set(r.id, r.rule);

  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!isObj(o)) return;
    if (typeof o.id === "string" && o.id.startsWith("PATH-") && !rules.has(o.id)) {
      rules.set(o.id, [o.condition, o.outcome, o.rule].filter(Boolean).join("\n"));
    }
    Object.values(o).forEach(walk);
  };
  walk(readJson(join(skillsDir, "vois-patterns", "data", "patterns-rules.json")));

  for (const j of readJson(join(skillsDir, "vois-components", "data", "components-rules.json")).jobs) {
    rules.set(j.id, collectStrings(j).join("\n"));
  }
  return rules;
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const subsetOf = (a, b) => a.every((x) => b.includes(x));
const uniq = (a) => new Set(a).size === a.length;

/** Check the ranges file against the base rules it points at. */
export function validateRanges(file, baseRules) {
  const errors = [];
  if (file.schema !== RANGES_SCHEMA) errors.push(`schema must be "${RANGES_SCHEMA}"`);
  const seen = new Set();
  for (const e of file.ranges ?? []) {
    const at = `${e.rule} ${e.param}`;
    const err = (m) => errors.push(`${at}: ${m}`);
    const text = baseRules.get(e.rule);
    if (text === undefined) { err("rule is not in the base rules"); continue; }
    if (!isStr(e.param)) err("missing param");
    if (seen.has(at)) err("listed twice");
    seen.add(at);
    if (!isStr(e.match) || !text.includes(e.match)) err(`match text ${JSON.stringify(e.match)} is not in the base rule, so the rule was reworded or renumbered`);
    if (e.at_least !== undefined) {
      const other = file.ranges.find((r) => r.rule === e.at_least?.rule && r.param === e.at_least?.param);
      if (!other || other.type !== "number" || e.type !== "number") err("at_least must name another number range in this file");
    }
    if (e.type === "number") {
      if (![e.base, e.min, e.max].every(isNum)) { err("base, min and max must be numbers"); continue; }
      if (e.min > e.max) err("min is above max");
      if (e.base < e.min || e.base > e.max) err("base is outside min and max");
      if (e.stricter === "lower" && e.max !== e.base) err("stricter is lower, so max must equal base");
      if (e.stricter === "higher" && e.min !== e.base) err("stricter is higher, so min must equal base");
      if (![ "lower", "higher", null ].includes(e.stricter)) err('stricter must be "lower", "higher" or null');
    } else if (e.type === "set") {
      if (!Array.isArray(e.base) || !e.base.length || !e.base.every(isNum) || !uniq(e.base)) { err("base must be a non-empty list of unique numbers"); continue; }
      if (!Array.isArray(e.allowed) || !e.allowed.every(isNum) || !subsetOf(e.base, e.allowed)) { err("allowed must be a list that contains base"); continue; }
      if (e.stricter === "subset" && !sameSet(e.base, e.allowed)) err("stricter is subset, so allowed must equal base");
      if (e.stricter === "superset" && sameSet(e.base, e.allowed)) err("stricter is superset, so allowed must be larger than base");
      if (!["subset", "superset"].includes(e.stricter)) err('stricter must be "subset" or "superset"');
    } else err('type must be "number" or "set"');
  }
  return errors;
}

function rangeIndex(ranges) {
  return new Map(ranges.ranges.map((r) => [`${r.rule}\u0000${r.param}`, r]));
}

const OP_KEYS = {
  restrict: ["id", "op", "rule", "param", "value", "reason"],
  refine: ["id", "op", "rule", "param", "value", "reason"],
  add: ["id", "op", "rule", "extends", "text", "severity", "enforcement", "applies_when", "reason"],
};

/** Check one team's override file. Returns { errors, warnings }. */
export function validateOverride(data, { file = "", baseRules, ranges }) {
  const errors = [];
  const warnings = [];
  const index = rangeIndex(ranges);
  const err = (m) => errors.push(m);
  if (!isObj(data)) return { errors: ["file must be a JSON object"], warnings };
  if (data.schema !== OVERRIDE_SCHEMA) err(`schema must be "${OVERRIDE_SCHEMA}"`);
  const team = data.team;
  const teamOk = typeof team === "string" && /^[a-z][a-z0-9-]{1,30}$/.test(team);
  if (!teamOk) err("team must be 2 to 31 lowercase letters, digits or hyphens, starting with a letter");
  if (file && teamOk && basename(file, extname(file)) !== team) err(`file name must be ${team}.json`);
  if (data.scope !== undefined) {
    if (!isObj(data.scope) || !Array.isArray(data.scope.paths) || !data.scope.paths.length || !data.scope.paths.every((p) => isStr(p))) err("scope must be { paths: [one or more path globs] }");
  }
  if (!Array.isArray(data.overrides) || data.overrides.length === 0) { err("overrides must be a non-empty list"); return { errors, warnings }; }

  const ids = new Set();
  const targets = new Set();
  for (const [i, o] of data.overrides.entries()) {
    const at = `overrides[${i}]${isStr(o?.id) ? ` (${o.id})` : ""}`;
    const e = (m) => err(`${at}: ${m}`);
    if (!isObj(o)) { e("must be an object"); continue; }
    if (RELAXING_OPS.includes(o.op)) { e(`op "${o.op}" would loosen a base rule. A team override can only add, restrict or refine. To loosen a rule for everyone, file a base-change proposal (see README.md)`); continue; }
    if (!OP_KEYS[o.op]) { e(`unknown op ${JSON.stringify(o.op)}; use add, restrict or refine`); continue; }
    for (const k of Object.keys(o)) if (!OP_KEYS[o.op].includes(k)) e(`unknown key "${k}" for op ${o.op}`);
    if (teamOk && !new RegExp(`^${team}-\\d{3}$`).test(o.id ?? "")) e(`id must look like ${team}-001`);
    if (ids.has(o.id)) e("duplicate id");
    ids.add(o.id);
    if (!isStr(o.reason, 12)) e("reason is required, at least 12 characters, and says why this team needs it");

    if (o.op === "add") {
      const want = `TEAM-${teamOk ? team.toUpperCase() : "<TEAM>"}-`;
      if (!teamOk || !new RegExp(`^${want}\\d{3}$`).test(o.rule ?? "")) e(`rule must be a new id like ${want}001`);
      if (baseRules.has(o.rule)) e("rule id is already a base rule");
      if (!isStr(o.text, 20)) e("text is required, at least 20 characters");
      if (!SEVERITIES.includes(o.severity)) e(`severity must be one of ${SEVERITIES.join(", ")}`);
      if (o.enforcement !== undefined && !ENFORCEMENTS.includes(o.enforcement)) e(`enforcement must be one of ${ENFORCEMENTS.join(", ")}`);
      if (o.extends !== undefined && !baseRules.has(o.extends)) e(`extends ${JSON.stringify(o.extends)} is not a base rule`);
      if (o.applies_when !== undefined && !isStr(o.applies_when)) e("applies_when must be a string");
      continue;
    }

    // restrict and refine both point at a tunable range
    const range = index.get(`${o.rule}\u0000${o.param}`);
    if (!baseRules.has(o.rule)) { e(`rule ${JSON.stringify(o.rule)} is not a base rule`); continue; }
    if (!range) { e(`${o.rule} has no tunable "${o.param}" in vois-teams/data/ranges.json. Only listed limits can be changed by a team`); continue; }
    const key = `${o.rule}\u0000${o.param}`;
    if (targets.has(key)) e(`${o.rule} ${o.param} is overridden twice in this file`);
    targets.add(key);
    const directional = range.stricter !== null;
    if (o.op === "restrict" && !directional) { e(`${o.rule} ${o.param} has no stricter direction, so there is nothing to restrict. Use refine`); continue; }
    if (o.op === "refine" && directional) { e(`${o.rule} ${o.param} has a stricter direction (${range.stricter}), so a change must be a restrict`); continue; }

    if (range.type === "number") {
      if (!isNum(o.value)) { e("value must be a number"); continue; }
      if (o.value < range.min || o.value > range.max) e(`value ${o.value} is outside the allowed ${range.min} to ${range.max}`);
      else if (range.stricter === "lower" && o.value > range.base) e(`value ${o.value} is above the base ${range.base}, which would loosen the rule`);
      else if (range.stricter === "higher" && o.value < range.base) e(`value ${o.value} is below the base ${range.base}, which would loosen the rule`);
      else if (o.value === range.base) warnings.push(`${at}: value equals the base ${range.base}, so this changes nothing`);
    } else {
      if (!Array.isArray(o.value) || !o.value.length || !o.value.every(isNum) || !uniq(o.value)) { e("value must be a non-empty list of unique numbers"); continue; }
      if (!subsetOf(o.value, range.allowed)) e(`value has numbers outside the allowed ${JSON.stringify(range.allowed)}`);
      else if (range.stricter === "subset" && !subsetOf(o.value, range.base)) e("value is not a subset of the base");
      else if (range.stricter === "superset" && !subsetOf(range.base, o.value)) e(`value drops part of the base ${JSON.stringify(range.base)}, which would loosen the rule`);
      else if (sameSet(o.value, range.base)) warnings.push(`${at}: value equals the base, so this changes nothing`);
    }
  }
  // A limit that must stay at or above another one: compare what the team ends up with.
  const valueOf = (rule, param, fallback) => data.overrides.find((o) => o.rule === rule && o.param === param && isNum(o.value))?.value ?? fallback;
  for (const o of data.overrides) {
    const r = isObj(o) && o.op !== "add" ? index.get(`${o.rule}\u0000${o.param}`) : undefined;
    if (!r?.at_least || !isNum(o.value)) continue;
    const other = index.get(`${r.at_least.rule}\u0000${r.at_least.param}`);
    const floor = valueOf(r.at_least.rule, r.at_least.param, other.base);
    if (o.value < floor) err(`${o.id}: ${o.rule} ${o.param} (${o.value}) cannot be below ${r.at_least.rule} ${r.at_least.param} (${floor})`);
  }
  return { errors, warnings };
}

// The part of a path glob before its first wildcard.
const prefixOf = (p) => p.split(/[*?[{]/)[0];
function scopesOverlap(a, b) {
  if (!a || !b) return true; // a team with no scope covers the whole repo
  return a.some((x) => b.some((y) => prefixOf(x).startsWith(prefixOf(y)) || prefixOf(y).startsWith(prefixOf(x))));
}

/** Check several teams together: unique teams, and no two overlapping teams setting one limit to different values. */
export function validateTeams(files) {
  const errors = [];
  const byTeam = new Map();
  for (const { file, data } of files) {
    if (!isObj(data) || typeof data.team !== "string") continue;
    if (byTeam.has(data.team)) errors.push(`${file}: team "${data.team}" is also defined in ${byTeam.get(data.team)}`);
    else byTeam.set(data.team, file);
  }
  const list = files.filter((f) => isObj(f.data) && Array.isArray(f.data.overrides));
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const A = list[i], B = list[j];
      if (!scopesOverlap(A.data.scope?.paths, B.data.scope?.paths)) continue;
      for (const a of A.data.overrides) for (const b of B.data.overrides) {
        if (a.op === "add" || b.op === "add") continue;
        if (a.rule === b.rule && a.param === b.param && JSON.stringify(a.value) !== JSON.stringify(b.value)) {
          errors.push(`${A.data.team} and ${B.data.team} cover overlapping paths and set ${a.rule} ${a.param} to different values (${JSON.stringify(a.value)} and ${JSON.stringify(b.value)}). Give each team its own scope`);
        }
      }
    }
  }
  return errors;
}

/** Check one base-change proposal. Returns { errors, warnings }. */
export function validateProposal(data, { file = "", baseRules, ranges }) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  if (!isObj(data)) return { errors: ["file must be a JSON object"], warnings };
  if (data.schema !== PROPOSAL_SCHEMA) err(`schema must be "${PROPOSAL_SCHEMA}"`);
  if (!/^BCP-\d{3}$/.test(data.id ?? "")) err("id must look like BCP-001");
  if (file && basename(file, extname(file)) !== data.id) err(`file name must be ${data.id}.json`);
  if (typeof data.from_team !== "string" || !/^[a-z][a-z0-9-]{1,30}$/.test(data.from_team)) err("from_team must be a team id");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.created ?? "")) err("created must be a date like 2026-10-06");
  if (!STATUSES.includes(data.status)) err(`status must be one of ${STATUSES.join(", ")}`);
  if (!isStr(data.reason, 20)) err("reason is required, at least 20 characters");
  if (!isStr(data.why_everyone, 20)) err("why_everyone is required, at least 20 characters. A base change is for changes every team should inherit. A change only your team needs is an override");
  if (!isObj(data.change) || !CHANGE_KINDS.includes(data.change.kind)) { err(`change.kind must be one of ${CHANGE_KINDS.join(", ")}`); return { errors, warnings }; }

  if (data.status === "accepted" && !isStr(data.resolved_in)) err('accepted proposals need resolved_in, for example "vois-tokens 1.20.0"');
  if (data.status === "rejected" && !isStr(data.decision_note, 12)) err("rejected proposals need a decision_note");
  const open = data.status === "open";
  const c = data.change;
  const current = baseRules.get(data.rule);

  if (c.kind === "new-rule") {
    if (data.rule !== undefined && baseRules.has(data.rule)) err("new-rule: rule is already a base rule");
    if (!isStr(c.text, 20)) err("new-rule: change.text is required");
    if (!SEVERITIES.includes(c.severity)) err(`new-rule: change.severity must be one of ${SEVERITIES.join(", ")}`);
    return { errors, warnings };
  }
  if (current === undefined) { err(`rule ${JSON.stringify(data.rule)} is not a base rule`); return { errors, warnings }; }

  if (c.kind === "value") {
    const range = ranges.ranges.find((r) => r.rule === data.rule && r.param === c.param);
    if (!range) { err(`value: ${data.rule} has no "${c.param}" in ranges.json. Add it to the ranges file first, or propose a text change`); return { errors, warnings }; }
    const typeOk = range.type === "number" ? isNum(c.from) && isNum(c.to) : Array.isArray(c.from) && Array.isArray(c.to);
    if (!typeOk) { err("value: change.from and change.to must match the type of the range"); return { errors, warnings }; }
    if (open && JSON.stringify(c.from) !== JSON.stringify(range.base)) err(`value: change.from is ${JSON.stringify(c.from)} but the base is now ${JSON.stringify(range.base)}. Update the proposal`);
    if (JSON.stringify(c.from) === JSON.stringify(c.to)) err("value: from and to are the same");
    if (range.type === "number" && (c.to < range.min || c.to > range.max)) warnings.push(`value: ${c.to} is outside the current range ${range.min} to ${range.max}, so the range changes too`);
  } else if (c.kind === "text") {
    if (!isStr(c.from) || !isStr(c.to)) err("text: change.from and change.to are required");
    else if (open && !current.includes(c.from)) err("text: change.from is not in the base rule any more. Update the proposal");
  } else if (c.kind === "relax" || c.kind === "remove") {
    if (!Array.isArray(data.evidence) || !data.evidence.length || !data.evidence.every((x) => isStr(x))) err(`${c.kind}: evidence is required (links, scenario ids or run notes that show the rule is wrong or costs too much)`);
    if (!isStr(c.summary, 12)) err(`${c.kind}: change.summary is required`);
  }
  return { errors, warnings };
}

/** Validate files, or the .json files in directories, together. Returns { errors, warnings, checked }. */
export function validatePaths(paths, ctx) {
  const files = [].concat(paths).flatMap((p) => statSync(p).isDirectory()
    ? readdirSync(p).filter((f) => f.endsWith(".json")).sort().map((f) => join(p, f))
    : [p]);
  const errors = [];
  const warnings = [];
  const overrides = [];
  for (const f of files) {
    let data;
    try { data = readJson(f); } catch (x) { errors.push(`${f}: not valid JSON (${x.message})`); continue; }
    const pick = data?.schema === OVERRIDE_SCHEMA ? validateOverride : data?.schema === PROPOSAL_SCHEMA ? validateProposal : null;
    if (!pick) { errors.push(`${f}: schema must be "${OVERRIDE_SCHEMA}" or "${PROPOSAL_SCHEMA}"`); continue; }
    if (pick === validateOverride) overrides.push({ file: f, data });
    const r = pick(data, { ...ctx, file: f });
    errors.push(...r.errors.map((m) => `${f}: ${m}`));
    warnings.push(...r.warnings.map((m) => `${f}: ${m}`));
  }
  errors.push(...validateTeams(overrides));
  return { errors, warnings, checked: files.length };
}
