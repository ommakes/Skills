// Deterministic scoring for one generated screen, plus the roll-up and the regression
// comparison used by check-results.mjs. No model is called here, so everything in this
// file can be tested with plain strings.
//
// A sample passes when all four hold:
//   1. it imports one of the task's expected components (when the task names any),
//   2. it imports none of the task's forbidden components,
//   3. the lookalike scanner finds no markup that does a component's job without it,
//   4. every required pattern matches and no forbidden pattern does.
// The vois-tokens and vois-dataviz detector findings are recorded but do not decide the
// pass: they are advisory by design (see vois-tokens/references/hooks.md).
import { scan, imp } from "../lookalike-pass/scan.mjs";
import { detectFile as detectTokens } from "../../vois-tokens/scripts/detect.mjs";
import { detectFile as detectDataviz } from "../../vois-dataviz/scripts/detect.mjs";

export const CONDITIONS = ["on", "off"];

// The CLI can report a model with a context-window suffix ("claude-x[1m]") or a date ("claude-x-20260301"), and can list a helper model next to the
// main one. A sample is "answered by another model" only when the requested model is not among those reported.
const baseModel = (m) => String(m).replace(/\[[^\]]*\]$/, "").replace(/-\d{8}$/, "");
export const answeredByOtherModel = (served, model) => Array.isArray(served) && served.length > 0 && !served.some((m) => baseModel(m) === baseModel(model));
// Why a run stopped before the agent said it was done. Each is scored on the screen it had written and flagged `truncated`.
export const TRUNCATED_SUBTYPES = ["error_max_turns", "error_max_budget_usd", "timeout"];

const compile = (p) => new RegExp(p.regex, p.flags ?? "");

// Imports and patterns are read from code only. A component named in a comment, or a word like
// "selected" in a note to the reader, must not satisfy a check.
//
// A small scanner, not a regex, because a regex cannot tell a comment from text that looks like one:
//   - a string is skipped whole, so "components/*" does not start a block comment;
//   - a quote with no partner on its line is an apostrophe in JSX text ("Don't"), not a string;
//   - "/*" starts a comment only at the start of a line or right after ; { } ( ) [ ] , = : or a quote, so JSX text
//     such as <p>See src/* for details</p> is left alone;
//   - "//" starts a line comment in those places too, and also after whitespace when a space follows it, unless the rest
//     of the line closes a JSX tag. So `const open = isOpen // note` is a comment, while <p>Press // to search</p> and a
//     URL (http://x) are not;
//   - a block comment ends at the first "*/", and a "/*" inside a line comment does not start one.
// Known gaps: JSX text on its own line that contains " // " loses the words after it, and a comment glued to a word
// (x = 1// note) is kept. And "//" right after a closing quote starts a comment even in JSX text (<p>say "x" // hi</p>),
// because that is how a string followed by a comment is written in code.
// After ":" a block comment may start (key: /* c */ 1) but a line comment may not, because "//" after ":" is a URL (http://x).
const BLOCK_MAY_FOLLOW = ";{}()[],=:\"'`";
const LINE_MAY_FOLLOW = ";{}()[],=\"'`";
// Does the rest of this line close a JSX tag? Then a "//" before it is text (<p>Press // to search</p>), not a comment.
const closesTag = (src, from) => {
  const end = src.indexOf("\n", from);
  const rest = src.slice(from, end === -1 ? src.length : end);
  return rest.includes("</") || rest.includes("/>");
};
export function stripComments(src) {
  let out = "";
  let prev = ""; // last non-space character written on this line; "" at the start of a line
  const n = src.length;
  for (let i = 0; i < n; ) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "\n") { out += c; prev = ""; i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      if (src[j] === c) { out += src.slice(i, j + 1); prev = c; i = j + 1; continue; }
      out += c; prev = "a"; i++; continue; // no partner on this line: an apostrophe in text, which cannot be followed by a comment
    }
    if (c === "`") {
      let j = i + 1;
      while (j < n && src[j] !== "`") j += src[j] === "\\" ? 2 : 1;
      const end = Math.min(j + 1, n);
      out += src.slice(i, end); prev = "`"; i = end; continue;
    }
    if (c === "/" && d === "*" && (prev === "" || BLOCK_MAY_FOLLOW.includes(prev))) {
      const e = src.indexOf("*/", i + 2);
      out += " "; i = e === -1 ? n : e + 2; continue;
    }
    // A "//" with a space before and after it is also a comment, unless the line goes on to close a JSX tag.
    const spaced = /\s/.test(src[i - 1] ?? "") && /\s/.test(src[i + 2] ?? "") && !closesTag(src, i);
    if (c === "/" && d === "/" && (prev === "" || LINE_MAY_FOLLOW.includes(prev) || spaced)) {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}

// Patterns run on lines cut to this length. Two of them scan a line twice, which is quadratic, and a generated screen has
// no real line this long (a minified one would not be a screen to judge anyway).
export const MAX_LINE = 4000;
const boundLines = (s) => s.split("\n").map((l) => (l.length > MAX_LINE ? l.slice(0, MAX_LINE) : l)).join("\n");

export function scoreSample(raw, task) {
  const src = boundLines(stripComments(raw));
  const expected = task.expected_imports ?? [];
  const { hits, usedExpected } = scan(src, expected);
  const decisionOk = expected.length === 0 || usedExpected.length > 0;
  const forbiddenImports = (task.forbidden_imports ?? []).filter((n) => imp(src, n));
  const patternFailures = [
    ...(task.required_patterns ?? []).filter((p) => !compile(p).test(src)).map((p) => `missing:${p.id}`),
    ...(task.forbidden_patterns ?? []).filter((p) => compile(p).test(src)).map((p) => `forbidden:${p.id}`),
  ];
  const ids = (findings) => [...new Set(findings.map((f) => f.ruleId))].sort();
  return {
    pass: decisionOk && forbiddenImports.length === 0 && hits.length === 0 && patternFailures.length === 0,
    decision: decisionOk && forbiddenImports.length === 0,
    lookalike_hits: [...hits].sort(),
    forbidden_imports: forbiddenImports,
    pattern_failures: patternFailures,
    detector_findings: ids(detectTokens("out.tsx", raw)),
    dataviz_findings: ids(detectDataviz("out.tsx", raw)),
  };
}

const round = (n) => Math.round(n * 1000) / 1000;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// Roll results up per condition. An errored sample counts as a failed attempt, so an
// outage cannot make a run look better than it was.
export function summarize(results) {
  const out = {};
  for (const c of CONDITIONS) {
    const rows = results.filter((r) => r.condition === c);
    if (!rows.length) continue;
    out[c] = {
      samples: rows.length,
      errors: rows.filter((r) => r.error).length,
      outside_access: rows.filter((r) => (r.outside_cwd_access ?? []).length > 0).length,
      truncated: rows.filter((r) => r.truncated).length,
      cost_unknown: rows.filter((r) => r.cost_unknown).length,
      model_mismatch: rows.filter((r) => r.model_mismatch).length,
      pass_rate: round(rows.filter((r) => r.pass && !r.error).length / rows.length),
      decision_rate: round(rows.filter((r) => r.decision && !r.error).length / rows.length),
      mean_lookalike_hits: round(mean(rows.map((r) => r.lookalike_hits.length))),
      mean_detector_findings: round(mean(rows.map((r) => r.detector_findings.length))),
      cost_usd: round(rows.reduce((a, r) => a + (r.cost_usd ?? 0), 0)), // a lower bound when cost_unknown is above 0
      mean_duration_ms: Math.round(mean(rows.map((r) => r.duration_ms ?? 0))),
    };
  }
  return out;
}

// Pass rate of one condition over the tasks both runs share.
function rateOn(run, condition, taskIds) {
  const rows = run.results.filter((r) => r.condition === condition && taskIds.has(r.task));
  return rows.length ? rows.filter((r) => r.pass && !r.error).length / rows.length : null;
}

// Compare a run against the one before it. Only the tasks both runs contain are compared,
// and only skills-on, because that is the condition the skills are responsible for.
export function compareRuns(prev, next, { threshold = 0.1, minCommonTasks = 5 } = {}) {
  if (prev.model !== next.model) return { status: "skipped", reason: `model changed (${prev.model} to ${next.model})` };
  if (prev.samples_per_task !== next.samples_per_task) return { status: "skipped", reason: `samples per task changed (${prev.samples_per_task} to ${next.samples_per_task})` };
  const swapped = (run) => run.results.some((r) => r.model_mismatch);
  if (swapped(prev) || swapped(next)) return { status: "skipped", kind: "mismatch", reason: "a sample in one of the runs was answered by a different model than the file names, so the pass rates mix models" };
  const prevTasks = new Set(prev.results.filter((r) => r.condition === "on").map((r) => r.task));
  const common = new Set(next.results.filter((r) => r.condition === "on" && prevTasks.has(r.task)).map((r) => r.task));
  if (common.size < minCommonTasks) return { status: "skipped", reason: `only ${common.size} task(s) in common, need ${minCommonTasks}` };
  const before = rateOn(prev, "on", common);
  const after = rateOn(next, "on", common);
  const cut = (run) => run.results.filter((r) => r.condition === "on" && common.has(r.task) && r.truncated).length;
  return {
    // A small epsilon: 0.8 - 0.1 is 0.7000000000000001 in floating point, and a drop of exactly the threshold is allowed.
    status: after < before - threshold - 1e-9 ? "regressed" : "ok",
    before: round(before),
    after: round(after),
    truncated_before: cut(prev),
    truncated_after: cut(next),
    common_tasks: common.size,
    threshold,
  };
}
