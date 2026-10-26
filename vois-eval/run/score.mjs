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

// Sonner's toast() normally comes from the "sonner" package itself, not the ui wrapper.
const importsComponent = (src, name) =>
  imp(src, name) || (name === "sonner" && /from\s+["']sonner["']/.test(src));

const compile = (p) => new RegExp(p.regex, p.flags ?? "");

// Imports and patterns are read from code only. A component named in a comment, or a word like
// "selected" in a note to the reader, must not satisfy a check. A "//" after a colon (a URL) or
// inside a word is left alone.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\w"'`])\/\/.*$/gm, "$1");

export function scoreSample(raw, task) {
  const src = stripComments(raw);
  const expected = task.expected_imports ?? [];
  const { hits, usedExpected } = scan(src, expected);
  const decisionOk = expected.length === 0 || usedExpected.length > 0;
  const forbiddenImports = (task.forbidden_imports ?? []).filter((n) => importsComponent(src, n));
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
      pass_rate: round(rows.filter((r) => r.pass && !r.error).length / rows.length),
      decision_rate: round(rows.filter((r) => r.decision && !r.error).length / rows.length),
      mean_lookalike_hits: round(mean(rows.map((r) => r.lookalike_hits.length))),
      mean_detector_findings: round(mean(rows.map((r) => r.detector_findings.length))),
      cost_usd: round(rows.reduce((a, r) => a + (r.cost_usd ?? 0), 0)),
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
  const prevTasks = new Set(prev.results.filter((r) => r.condition === "on").map((r) => r.task));
  const common = new Set(next.results.filter((r) => r.condition === "on" && prevTasks.has(r.task)).map((r) => r.task));
  if (common.size < minCommonTasks) return { status: "skipped", reason: `only ${common.size} task(s) in common, need ${minCommonTasks}` };
  const before = rateOn(prev, "on", common);
  const after = rateOn(next, "on", common);
  return {
    status: after < before - threshold ? "regressed" : "ok",
    before: round(before),
    after: round(after),
    common_tasks: common.size,
    threshold,
  };
}
