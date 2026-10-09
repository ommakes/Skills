#!/usr/bin/env node
// Standalone CLI: node detect.mjs [--strict] <file> [file...]
// Prints JSON findings to stdout. Exit code is 0 unless --strict is passed and a
// 'required' rule is hit. Same shape as vois-tokens/scripts/detect.mjs, so a
// caller can fold both together.
//
// Covers the rules in data/dataviz-rules.json with enforcement 'auto'. Heuristic
// by design: it reads text, not types. To silence a deliberate exception put
//   // dataviz-allow: <detector-id>
// on the same line or the line above (see DV-HONEST-002 for the one sanctioned case).

import { readFileSync } from "node:fs";
import { ruleIndex } from "./lib.mjs";

const CHART_TAGS = ["LineChart", "BarChart", "AreaChart", "PieChart", "RadarChart", "RadialBarChart", "ScatterChart", "ComposedChart", "Treemap", "Sankey", "FunnelChart"];
const TAG_ALT = CHART_TAGS.join("|");
const SKIP_DATA_FILES = /(\.test\.|\.spec\.|\.stories\.|__fixtures__|\.fixture\.|\.mock\.)/;

const lineOf = (content, index) => content.slice(0, index).split("\n").length;

function isChartFile(content) {
  return /from\s+["'](recharts|d3[\w-]*|chart\.js|react-chartjs-2|@visx\/[\w-]+|victory[\w-]*|@nivo\/[\w-]+)["']/.test(content) ||
    /from\s+["'][^"']*\/ui\/chart["']/.test(content) ||
    /\bChartContainer\b/.test(content);
}

// <LineChart ...> ... </LineChart> blocks, with the opening tag text isolated.
function chartBlocks(content) {
  const re = new RegExp(`<(${TAG_ALT})\\b[\\s\\S]*?</\\1>`, "g");
  const blocks = [];
  for (const m of content.matchAll(re)) {
    blocks.push({ tag: m[1], text: m[0], start: m.index, opening: openingTag(m[0]) });
  }
  return blocks;
}

// The opening tag only: scan to the first '>' that isn't inside {...}.
function openingTag(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return text.slice(0, i + 1);
  }
  return text;
}

function enclosingTag(lines, idx) {
  for (let i = idx; i >= Math.max(0, idx - 10); i--) {
    const m = lines[i].match(/<([A-Z]\w*)\b/);
    if (m) return m[1];
  }
  return null;
}

const DETECTORS = [
  {
    id: "dual-axis", ruleId: "DV-HONEST-002",
    run({ content }) {
      const hits = [];
      for (const b of chartBlocks(content)) {
        const axes = [...b.text.matchAll(/<YAxis\b/g)];
        if (axes.length >= 2) {
          hits.push({ index: b.start + axes[1].index, message: "Second y-axis in one chart. Use two charts, small multiples, or index both series to a common base." });
        }
      }
      return hits;
    },
  },
  {
    id: "non-zero-bar-domain", ruleId: "DV-HONEST-001",
    run({ content }) {
      const hits = [];
      for (const b of chartBlocks(content)) {
        if (!(b.tag === "BarChart" || /<(Bar|Area)\b/.test(b.text))) continue;
        for (const m of b.text.matchAll(/domain\s*=\s*\{\s*\[\s*([^,\]]+)/g)) {
          const first = m[1].trim().replace(/^["']|["']$/g, "");
          if (first !== "0") {
            hits.push({ index: b.start + m.index, message: `Bar or area axis domain starts at ${first}, not 0. Bars and areas must start at zero.` });
          }
        }
      }
      return hits;
    },
  },
  {
    id: "spline-curve", ruleId: "DV-HONEST-005",
    run({ lines, offset }) {
      const hits = [];
      lines.forEach((line, i) => {
        const m = line.match(/\btype\s*=\s*["'](natural|basis|basisClosed|cardinal|catmullRom|bumpX|bumpY)["']/);
        if (m && ["Line", "Area"].includes(enclosingTag(lines, i))) {
          hits.push({ index: offset(i), message: `Curve type '${m[1]}' interpolates values the data doesn't contain. Use linear, monotone or a step type.` });
        }
      });
      return hits;
    },
  },
  {
    id: "hardcoded-chart-color", ruleId: "DV-COLOR-001",
    run({ content }) {
      const hits = [];
      const re = /\b(stroke|fill|color|stopColor|backgroundColor)\s*[=:]\s*\{?\s*["'`](#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\))["'`]/g;
      for (const m of content.matchAll(re)) {
        hits.push({ index: m.index, message: `Literal color ${m[2]} in chart code. Use a chart token such as var(--chart-1) from the chart config.` });
      }
      return hits;
    },
  },
  {
    id: "cycled-colors", ruleId: "DV-COLOR-003",
    run({ lines, offset }) {
      const hits = [];
      lines.forEach((line, i) => {
        if (/\[\s*\w+\s*%\s*[\w.]+\.length\s*\]/.test(line) && /color|fill|palette|stroke/i.test(line)) {
          hits.push({ index: offset(i), message: "Colors cycled with a modulo. Categorical hues are assigned in fixed order and never cycled; fold the tail into Other or facet." });
        }
      });
      return hits;
    },
  },
  {
    id: "missing-accessibility-layer", ruleId: "DV-A11Y-003",
    run({ content }) {
      const hits = [];
      for (const b of chartBlocks(content)) {
        if (b.tag === "Sankey" || b.tag === "Treemap") continue;
        if (!/\baccessibilityLayer\b/.test(b.opening)) {
          hits.push({ index: b.start, message: `<${b.tag}> has no accessibilityLayer. Add it, and wrap the chart in a figure with a caption.` });
        }
      }
      return hits;
    },
  },
  {
    id: "slow-chart-animation", ruleId: "DV-A11Y-008",
    run({ content }) {
      const hits = [];
      for (const m of content.matchAll(/animationDuration\s*[=:]\s*\{?\s*(\d+)/g)) {
        if (Number(m[1]) > 300) hits.push({ index: m.index, message: `animationDuration ${m[1]}ms exceeds 300ms. Keep chart animation to 300ms or less, off under prefers-reduced-motion, and never replay it on a refetch.` });
      }
      return hits;
    },
  },
  {
    id: "label-every-point", ruleId: "DV-CLARITY-003",
    run({ content }) {
      const hits = [];
      for (const m of content.matchAll(/<(Line|Area)\b[\s\S]*?<\/\1>/g)) {
        const inner = m[0].indexOf("<LabelList");
        if (inner >= 0) hits.push({ index: m.index + inner, message: `<LabelList> inside <${m[1]}> labels every point. Label the end and the extreme only.` });
      }
      return hits;
    },
  },
  {
    id: "missing-legend", ruleId: "DV-CLARITY-004",
    run({ content }) {
      const hits = [];
      for (const b of chartBlocks(content)) {
        const series = [...b.text.matchAll(/<(Line|Bar|Area|Radar)\b/g)].length;
        if (series >= 2 && !/<(Legend|ChartLegend)\b|ChartLegendContent/.test(b.text)) {
          hits.push({ index: b.start, message: `<${b.tag}> plots ${series} series with no legend. Two or more series always get a legend.` });
        }
      }
      return hits;
    },
  },
  {
    id: "missing-tooltip", ruleId: "DV-INTERACT-001",
    run({ content }) {
      const hits = [];
      for (const b of chartBlocks(content)) {
        if (!/<(Tooltip|ChartTooltip)\b/.test(b.text)) {
          hits.push({ index: b.start, message: `<${b.tag}> has no tooltip. Charts are interactive by default: crosshair or per-mark tooltip.` });
        }
      }
      return hits;
    },
  },
  {
    id: "fixed-chart-width", ruleId: "DV-IMPL-007",
    run({ content }) {
      const hits = [];
      for (const b of chartBlocks(content)) {
        const m = b.opening.match(/\bwidth\s*=\s*\{?\s*(\d+)/);
        if (m) hits.push({ index: b.start, message: `<${b.tag}> has a fixed width of ${m[1]}. Use ChartContainer or ResponsiveContainer with a min height.` });
      }
      return hits;
    },
  },
  {
    id: "dashed-grid", ruleId: "DV-CLARITY-002",
    run({ content }) {
      const hits = [];
      for (const m of content.matchAll(/<CartesianGrid\b[^>]*?strokeDasharray/g)) {
        hits.push({ index: m.index, message: "Dashed gridlines. Gridlines are solid 1px hairlines, one step off the surface." });
      }
      return hits;
    },
  },
  {
    id: "inline-data", ruleId: "DV-SUSTAIN-005",
    appliesTo: (filePath) => !SKIP_DATA_FILES.test(filePath),
    run({ lines, offset }) {
      const hits = [];
      lines.forEach((line, i) => {
        if (!/\b(const|let|var)\s+\w+\s*(:[^=]+)?=\s*\[\s*$/.test(line)) return;
        let objects = 0;
        for (let j = i + 1; j < lines.length && !/^\s*\]/.test(lines[j]); j++) {
          if (/^\s*\{\s*\w+\s*:/.test(lines[j])) objects++;
        }
        if (objects >= 8) {
          hits.push({ index: offset(i), message: `Inline data array with ${objects} rows in a chart file. Pass data as a typed prop or query; keep fixtures in stories and tests.` });
        }
      });
      return hits;
    },
  },
];

export function detectFile(filePath, content) {
  if (!isChartFile(content)) return [];
  const rules = ruleIndex();
  const lines = content.split("\n");
  const offsets = [];
  let pos = 0;
  for (const l of lines) {
    offsets.push(pos);
    pos += l.length + 1;
  }
  const offset = (i) => offsets[i];
  const findings = [];
  for (const d of DETECTORS) {
    if (d.appliesTo && !d.appliesTo(filePath)) continue;
    for (const hit of d.run({ content, lines, offset, filePath })) {
      const line = lineOf(content, hit.index);
      const allow = new RegExp(`dataviz-allow:\\s*${d.id}`);
      if (allow.test(lines[line - 1] || "") || allow.test(lines[line - 2] || "")) continue;
      const rule = rules.get(d.ruleId);
      findings.push({
        ruleId: d.ruleId,
        severity: rule.severity,
        detector: d.id,
        file: filePath,
        line,
        snippet: (lines[line - 1] || "").trim().slice(0, 160),
        message: hit.message,
        fixHint: rule.do,
      });
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}

function main(argv) {
  const args = argv.slice(2);
  const strict = args.includes("--strict");
  const files = args.filter((a) => !a.startsWith("--"));
  if (files.length === 0) {
    console.error("Usage: detect.mjs [--strict] <file> [file...]");
    process.exit(1);
  }
  const all = [];
  for (const filePath of files) {
    let content;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    all.push(...detectFile(filePath, content));
  }
  console.log(JSON.stringify(all, null, 2));
  if (strict && all.some((f) => f.severity === "required")) process.exit(1);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main(process.argv);
