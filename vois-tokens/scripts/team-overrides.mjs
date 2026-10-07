// Reads team override files from <root>/.vois/teams/*.json and turns them into the limits the
// detector checks against. Only the limits listed in TUNABLES are read, and only the stricter side
// of the base is accepted, so a bad or loosening override file is ignored, never applied.
// The override format, and the validator that rejects loosening at review time, are in
// ../../vois-teams. This file is self-contained so the hook works from vois-tokens alone.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, isAbsolute } from "node:path";

export const OVERRIDE_SCHEMA = "vois-team-override/1";

/**
 * The limits the hook can check. Each one mirrors an entry in vois-teams/data/ranges.json, and a
 * test in detect.test.mjs fails if they drift apart. Other tunable limits (contrast ratios, widths,
 * component thresholds) are not mechanically checked by the hook, so a team can set them but the
 * hook has nothing to compare against.
 */
export const TUNABLES = {
  "DS-ANIMATION-001": { max_duration_ms: { type: "number", base: 300, stricter: "lower", min: 100, max: 300 } },
  "DS-ANIMATION-002": { max_duration_ms: { type: "number", base: 500, stricter: "lower", min: 200, max: 500 } },
  "DS-ANIMATION-008": { min_press_scale: { type: "number", base: 0.95, stricter: "higher", min: 0.95, max: 1 } },
  "DS-SPACING-001": { spacing_divisors: { type: "set", base: [4, 8], stricter: "subset", allowed: [4, 8] } },
};

// For a set the hook uses the smallest divisor, so [4] and [4,8] check the same thing.
const sameValue = (spec, a, b) => (spec.type === "number" ? a === b : Math.min(...a) === Math.min(...b));
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** A value for a tunable limit, or undefined if it is missing, malformed, or looser than the base. */
function acceptedValue(spec, value) {
  if (spec.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    if (value < spec.min || value > spec.max) return undefined;
    if (spec.stricter === "lower" && value > spec.base) return undefined;
    if (spec.stricter === "higher" && value < spec.base) return undefined;
    return value;
  }
  if (!Array.isArray(value) || value.length === 0 || !value.every((v) => typeof v === "number" && spec.allowed.includes(v))) return undefined;
  if (new Set(value).size !== value.length) return undefined;
  return spec.stricter === "subset" && value.every((v) => spec.base.includes(v)) ? [...value].sort((a, b) => a - b) : undefined;
}

/** Whether `candidate` is stricter than `current` for this spec. */
function stricterThan(spec, candidate, current) {
  if (spec.type === "number") return spec.stricter === "lower" ? candidate < current : candidate > current;
  return candidate.length < current.length || (candidate.length === current.length && !sameSet(candidate, current) && Math.min(...candidate) > Math.min(...current));
}

// A path glob, as vois-teams/README.md describes scope.paths (the validator only compares the text
// before the first wildcard, so it is case-insensitive and the hook is not): ** crosses folders, * and ?
// stay inside one, {a,b} and [abc] work, a leading ./ or / is ignored, \ counts as /, and a glob
// that names a folder also covers everything inside it. Case matters here.
const normalizeGlob = (g) => g.replace(/\\/g, "/").replace(/^(?:\.?\/)+/, "").replace(/\/+$/, "");

function globToRegExp(glob) {
  let out = "";
  let inBraces = false;
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") { out += "(?:.*/)?"; i += 2; } else { out += ".*"; i += 1; }
    } else if (c === "*") out += "[^/]*";
    else if (c === "?") out += "[^/]";
    else if (c === "{" && !inBraces && glob.indexOf("}", i) !== -1) { out += "(?:"; inBraces = true; }
    else if (c === "}" && inBraces) { out += ")"; inBraces = false; }
    else if (c === "," && inBraces) out += "|";
    else if (c === "[" && glob.indexOf("]", i + 2) !== -1) {
      const end = glob.indexOf("]", i + 2);
      const body = glob.slice(i + 1, end).replace(/^!/, "^").replace(/[\\\]]/g, "\\$&");
      out += `[${body}]`;
      i = end;
    } else out += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${out}(?:/.*)?$`);
}

/** A scope is well formed when it is absent (whole repo) or { paths: [one or more strings] }. */
export function validScope(scope) {
  if (scope === undefined) return true;
  return !!scope && typeof scope === "object" && !Array.isArray(scope) && Array.isArray(scope.paths) && scope.paths.length > 0 && scope.paths.every((p) => typeof p === "string" && p.trim() !== "");
}

export function matchesScope(scopePaths, relPath) {
  if (scopePaths === undefined) return true; // no scope: the whole repo
  if (!Array.isArray(scopePaths) || scopePaths.length === 0) return false; // malformed: match nothing
  return scopePaths.some((g) => typeof g === "string" && g.trim() !== "" && globToRegExp(normalizeGlob(g)).test(relPath));
}

/** Every well-formed team override file under <root>/.vois/teams. Never throws. */
export function loadTeams(root, onSkip = () => {}) {
  const dir = join(root, ".vois", "teams");
  if (!existsSync(dir)) return [];
  const teams = [];
  let names = [];
  try { names = readdirSync(dir).filter((f) => f.endsWith(".json")).sort(); } catch { return []; }
  for (const name of names) {
    try {
      const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
      if (data && data.schema === OVERRIDE_SCHEMA && typeof data.team === "string" && Array.isArray(data.overrides) && validScope(data.scope)) teams.push(data);
      else onSkip(name, data && data.schema === OVERRIDE_SCHEMA && !validScope(data.scope) ? "scope must be { paths: [one or more globs] }" : "not a vois-team-override/1 file");
    } catch { onSkip(name, "unreadable or invalid JSON"); }
  }
  return teams;
}

/**
 * The limits that apply to one file. `get(rule, param)` returns the team value if one applies and is
 * accepted, otherwise the base. `source(rule, param)` names the team that set it, or null.
 * Where several teams cover the file, the strictest accepted value wins.
 */
export function paramsFor(teams, root, filePath) {
  const rel = filePath ? relative(root, isAbsolute(filePath) ? filePath : join(root, filePath)).split("\\").join("/") : "";
  const inside = filePath && rel !== "" && rel !== ".." && !rel.startsWith("../") && !isAbsolute(rel);
  const chosen = new Map(); // "rule\0param" -> { value, team }
  if (inside) {
    for (const team of teams) {
      if (!matchesScope(team.scope?.paths, rel)) continue;
      for (const o of team.overrides) {
        if (!o || (o.op !== "restrict" && o.op !== "refine")) continue;
        const spec = TUNABLES[o.rule]?.[o.param];
        if (!spec) continue;
        const value = acceptedValue(spec, o.value);
        if (value === undefined || sameValue(spec, value, spec.base)) continue; // a value equal to the base changes nothing, so no team is credited
        const key = `${o.rule}\u0000${o.param}`;
        const have = chosen.get(key);
        if (!have || stricterThan(spec, value, have.value)) chosen.set(key, { value, team: team.team });
      }
    }
  }
  return {
    get(rule, param) {
      return chosen.get(`${rule}\u0000${param}`)?.value ?? TUNABLES[rule][param].base;
    },
    source(rule, param) {
      return chosen.get(`${rule}\u0000${param}`)?.team ?? null;
    },
  };
}

/** The base limits, for callers that have no team files. */
export const BASE_PARAMS = paramsFor([], "/", "");

/** " (limit set by the payments team)" when a team changed this limit, otherwise "". */
export function limitNote(params, rule, param) {
  const team = params.source(rule, param);
  return team ? ` (limit set by the ${team} team)` : "";
}

/**
 * One line per team override, for `hook-admin.mjs status`: what the hook applies, what it ignores
 * because the value loosens the base, and what it has nothing to check.
 */
export function summarizeTeams(teams) {
  const lines = [];
  for (const team of teams) {
    const scope = team.scope?.paths ? team.scope.paths.join(", ") : "whole repo";
    lines.push(`${team.team} (${scope})`);
    for (const o of team.overrides) {
      if (o && o.op === "add") { lines.push(`  added rule, not checked by the hook: ${o.id ?? "(no id)"}`); continue; }
      if (!o || (o.op !== "restrict" && o.op !== "refine")) continue;
      const spec = TUNABLES[o.rule]?.[o.param];
      const label = `${o.rule} ${o.param} = ${JSON.stringify(o.value)}`;
      if (!spec) lines.push(`  not checked by the hook: ${label}`);
      else if (acceptedValue(spec, o.value) !== undefined && sameValue(spec, acceptedValue(spec, o.value), spec.base)) lines.push(`  no change from the base: ${label}`);
      else if (acceptedValue(spec, o.value) === undefined) lines.push(`  ignored, not on the stricter side of the base or outside its range: ${label}`);
      else lines.push(`  applied: ${label}`);
    }
  }
  return lines;
}
