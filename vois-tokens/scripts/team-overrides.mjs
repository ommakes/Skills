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

// A path glob: ** crosses folders, * and ? stay inside one.
function globToRegExp(glob) {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") { out += "(?:.*/)?"; i += 2; } else { out += ".*"; i += 1; }
    } else if (c === "*") out += "[^/]*";
    else if (c === "?") out += "[^/]";
    else out += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${out}$`);
}

export function matchesScope(scopePaths, relPath) {
  if (!Array.isArray(scopePaths) || scopePaths.length === 0) return true; // no scope: the whole repo
  return scopePaths.some((g) => typeof g === "string" && globToRegExp(g.replace(/^\.\//, "")).test(relPath));
}

/** Every well-formed team override file under <root>/.vois/teams. Never throws. */
export function loadTeams(root) {
  const dir = join(root, ".vois", "teams");
  if (!existsSync(dir)) return [];
  const teams = [];
  let names = [];
  try { names = readdirSync(dir).filter((f) => f.endsWith(".json")).sort(); } catch { return []; }
  for (const name of names) {
    try {
      const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
      if (data && data.schema === OVERRIDE_SCHEMA && typeof data.team === "string" && Array.isArray(data.overrides)) teams.push(data);
    } catch { /* unreadable or invalid JSON: skip the file */ }
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
  const inside = filePath && rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
  const chosen = new Map(); // "rule\0param" -> { value, team }
  if (inside) {
    for (const team of teams) {
      if (!matchesScope(team.scope?.paths, rel)) continue;
      for (const o of team.overrides) {
        if (!o || (o.op !== "restrict" && o.op !== "refine")) continue;
        const spec = TUNABLES[o.rule]?.[o.param];
        if (!spec) continue;
        const value = acceptedValue(spec, o.value);
        if (value === undefined) continue;
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
    const scope = team.scope?.paths?.length ? team.scope.paths.join(", ") : "whole repo";
    lines.push(`${team.team} (${scope})`);
    for (const o of team.overrides) {
      if (!o || (o.op !== "restrict" && o.op !== "refine")) continue;
      const spec = TUNABLES[o.rule]?.[o.param];
      const label = `${o.rule} ${o.param} = ${JSON.stringify(o.value)}`;
      if (!spec) lines.push(`  not checked by the hook: ${label}`);
      else if (acceptedValue(spec, o.value) === undefined) lines.push(`  ignored, not on the stricter side of the base or outside its range: ${label}`);
      else lines.push(`  applied: ${label}`);
    }
  }
  return lines;
}
