#!/usr/bin/env node
// Standalone CLI:
//   node check-spec.mjs <spec.json>        check one chart spec (or an array of specs)
//   node check-spec.mjs --tree <job>       list every form reachable for a job
// Prints JSON. Exit code is 0 unless --strict is passed and a 'required' rule fails.
//
// A spec is the contract an agent fills in before writing chart code. See
// data/chart-spec.schema.json. This covers the rules with enforcement 'spec'
// plus the mechanical parts of a few judgment rules.

import { readFileSync } from "node:fs";
import { formIndex, loadData, resultsFrom, ruleIndex } from "./lib.mjs";

const BAR_FORMS = new Set(["FORM-BAR-V", "FORM-BAR-H", "FORM-BAR-GROUPED", "FORM-BAR-STACKED", "FORM-BAR-STACKED-PCT", "FORM-BAR-DIVERGING"]);
const PART_FORMS = new Set(["FORM-PIE", "FORM-DONUT"]);
const NO_TOOLTIP_OK = new Set(["FORM-STAT-TILE", "FORM-METER", "FORM-FLOWCHART"]);
const MANY_SERIES_OK = new Set(["FORM-SMALL-MULTIPLES", "FORM-EMPHASIS", "FORM-TABLE"]);
const ALL_PAIRS_FORMS = new Set(["FORM-SCATTER", "FORM-BUBBLE"]);

export function formsForJob(job) {
  const { jobs } = loadData("decision-tree.json");
  const entry = jobs[job];
  if (!entry) return null;
  const forms = new Set();
  for (const r of resultsFrom(entry)) {
    forms.add(r.form);
    for (const alt of r.alternatives || []) forms.add(alt);
  }
  return forms;
}

export function checkSpec(spec) {
  const rules = ruleIndex();
  const forms = formIndex();
  const findings = [];
  const add = (ruleId, message, fix) => {
    const rule = rules.get(ruleId);
    findings.push({ ruleId, severity: rule.severity, verdict: rule.severity === "required" ? "FAIL" : "WARN", viz: spec.id || "unnamed", message, fix: fix || rule.do });
  };

  if (!spec.question || spec.question.trim().length < 8) {
    add("DV-PURPOSE-001", "No question written for this chart.");
  }
  if (!spec.audience) add("DV-PURPOSE-002", "No audience named.");

  const form = forms.get(spec.form);
  const reachable = formsForJob(spec.job);
  if (!reachable) {
    add("DV-FORM-001", `Unknown job '${spec.job}'. Use one of: ${Object.keys(loadData("decision-tree.json").jobs).join(", ")}.`);
  }
  if (!form) {
    add("DV-FORM-001", `Unknown form '${spec.form}'. Pick a form id from data/chart-catalog.json.`);
  } else {
    if (reachable && !reachable.has(spec.form)) {
      add("DV-FORM-001", `${spec.form} is not reachable from job '${spec.job}' in the decision tree.`, `Forms for this job: ${[...reachable].join(", ")}.`);
    }
    if (form.audience === "analyst" && spec.audience && spec.audience !== "analyst") {
      add("DV-PURPOSE-002", `${spec.form} is an analyst form but the audience is ${spec.audience}.`, "Use a general-audience alternative from the tree, or confirm the audience is analyst.");
    }
    if (form.fit === "rare" && spec.audience !== "analyst") {
      add("DV-FORM-005", `${spec.form} is a specialist form and needs an analyst audience and a how-to-read note.`);
    }
    if (BAR_FORMS.has(spec.form) && spec.categories != null && spec.categories <= 1) {
      add("DV-FORM-003", "A bar chart with one bar. A single value is a stat tile.", "Use FORM-STAT-TILE.");
    }
    if (PART_FORMS.has(spec.form) && spec.categories != null) {
      if (spec.categories < 3) add("DV-FORM-004", `${spec.categories} segment(s) in a ${spec.form}. A part-to-whole of 2 is a meter or a stat.`, "Use FORM-METER or FORM-STAT-TILE.");
      if (spec.categories > 6) add("DV-FORM-004", `${spec.categories} segments in a ${spec.form}. Above 6, use a sorted horizontal bar.`, "Use FORM-BAR-H with top N plus Other.");
    }
    if (BAR_FORMS.has(spec.form) && spec.categories > 12 && !spec.top_n) {
      add("DV-FORM-007", `${spec.categories} categories with no top N. Cap at about 12 and fold the tail into Other.`);
    }
    if (spec.baseline === "non-zero" && form.baseline === "zero_required") {
      add("DV-HONEST-001", `${spec.form} requires a zero baseline.`);
    }
    if (spec.dual_axis === true && spec.form !== "FORM-PARETO") {
      add("DV-HONEST-002", "Dual axis. Use two charts, small multiples, or index to a common base.");
    }
    if (spec.has_tooltip === false && !NO_TOOLTIP_OK.has(spec.form)) {
      add("DV-INTERACT-001", "No tooltip planned. Charts are interactive by default.");
    }
    if (spec.form === "FORM-STAT-TILE" && spec.has_comparison === false) {
      add("DV-CONTEXT-002", "KPI tile with no comparison.");
    }
    if (spec.series > 3 && ALL_PAIRS_FORMS.has(spec.form)) {
      add("DV-COLOR-003", `${spec.series} grouped series on a ${spec.form}. Any two marks can be neighbors, so cap at 3 or facet.`);
    }
  }

  if (!spec.color_job) add("DV-COLOR-002", "No color job stated.");
  if (spec.series > 8) add("DV-COLOR-003", `${spec.series} series. Eight is the ceiling; fold the tail into Other or use small multiples.`);
  else if (spec.series > 5 && !MANY_SERIES_OK.has(spec.form)) add("DV-COLOR-003", `${spec.series} series. Five is comfortable; consider emphasis or small multiples.`);
  if (spec.series === 1 && spec.color_job === "categorical") {
    add("DV-COLOR-007", "One series should use a single color, not a categorical palette.", "Set color_job to 'single'.");
  }
  if (spec.series >= 2 && spec.has_legend === false) add("DV-CLARITY-004", "Two or more series with no legend.");
  if (spec.series === 1 && spec.has_legend === true) add("DV-CLARITY-004", "A legend box on a single series restates the title.");
  if (spec.has_text_alternative === false) add("DV-A11Y-003", "No text alternative planned.");
  if (spec.has_table_view === false) add("DV-A11Y-004", "No table view planned.");
  if (spec.config_driven === false) add("DV-SUSTAIN-001", "Chart is not driven by a typed config.");
  if (spec.points > 500) add("DV-SUSTAIN-002", `${spec.points} points per series. Downsample past about 500.`);

  const s = spec.states;
  if (s) {
    if (s.loading === false) add("DV-STATE-001", "No loading state.");
    if (s.error === false) add("DV-STATE-003", "No error state.");
    for (const key of ["empty_not_set_up", "empty_collecting", "empty_filtered"]) {
      if (s[key] === false) add("DV-STATE-002", `Missing empty case: ${key}. Four empty cases, four messages.`);
    }
  }

  const order = loadData("review-checklist.json").triage_order;
  const rank = (f) => order.indexOf(f.ruleId.replace(/-\d+$/, ""));
  findings.sort((a, b) => (a.verdict === b.verdict ? rank(a) - rank(b) : a.verdict === "FAIL" ? -1 : 1));
  return { viz: spec.id || "unnamed", ok: !findings.some((f) => f.verdict === "FAIL"), findings };
}

function main(argv) {
  const args = argv.slice(2);
  const strict = args.includes("--strict");
  const rest = args.filter((a) => a !== "--strict");
  if (rest[0] === "--tree") {
    const forms = formsForJob(rest[1]);
    if (!forms) {
      console.error(`Unknown job '${rest[1]}'.`);
      process.exit(1);
    }
    console.log(JSON.stringify({ job: rest[1], forms: [...forms] }, null, 2));
    return;
  }
  if (!rest[0]) {
    console.error("Usage: check-spec.mjs [--strict] <spec.json> | --tree <job>");
    process.exit(1);
  }
  const parsed = JSON.parse(readFileSync(rest[0], "utf8"));
  const specs = Array.isArray(parsed) ? parsed : [parsed];
  const results = specs.map(checkSpec);
  console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  if (strict && results.some((r) => !r.ok)) process.exit(1);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main(process.argv);
