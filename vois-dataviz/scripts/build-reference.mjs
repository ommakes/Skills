#!/usr/bin/env node
// Generates the data-derived reference docs from data/*.json so the prose and the
// machine-readable data can't drift.
//   node build-reference.mjs           write references/*.md
//   node build-reference.mjs --check   exit 1 if any generated file is stale (CI)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadData, SKILL_ROOT } from "./lib.mjs";

const NOTICE = (src) => `<!-- GENERATED from ${src} by scripts/build-reference.mjs. Edit the JSON, then run \`node vois-dataviz/scripts/build-reference.mjs\`. Do not edit by hand. -->\n\n`;
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const list = (items) => items.map((i) => `- ${i}`).join("\n");
const tag = (id) => `\`[${id}]\``;

function evidenceLinks(ids, byId) {
  return ids.map((id) => `[${id}](${byId.get(id).mobbin_url}) ${byId.get(id).app}`).join(", ");
}

function principlesMd() {
  const data = loadData("dataviz-rules.json");
  const ev = new Map(loadData("evidence.json").entries.map((e) => [e.id, e]));
  let out = NOTICE("data/dataviz-rules.json") + "# Principles, do's and don'ts, and rules\n\n";
  out += "Fourteen principles. Each has a headline do and don't list, then the checkable rules under it. **Severity:** `required` is a FAIL in review, `recommended` is a WARN. **Enforcement:** `auto` means `scripts/detect.mjs` finds it in code, `spec` means `scripts/check-spec.mjs` finds it in a chart spec, `judgment` means you look at the render.\n\n";
  out += "| Principle | Rules | Required | Auto or spec checked |\n|---|---|---|---|\n";
  for (const p of data.principles) {
    const rs = data.rules.filter((r) => r.category === p.id);
    out += `| [${p.name}](#${p.id.toLowerCase()}) | ${rs.length} | ${rs.filter((r) => r.severity === "required").length} | ${rs.filter((r) => r.enforcement !== "judgment").length} |\n`;
  }
  out += "\n";
  for (const p of data.principles) {
    out += `## ${p.id}\n\n### ${p.name}\n\n**${p.statement}**\n\n${p.why}\n\n`;
    out += `**Do**\n\n${list(p.dos)}\n\n**Don't**\n\n${list(p.donts)}\n\n`;
    out += "#### Rules\n\n";
    for (const r of data.rules.filter((x) => x.category === p.id)) {
      out += `##### ${tag(r.id)} ${r.severity}, ${r.enforcement}${r.detector ? `, detector \`${r.detector}\`` : ""}\n\n${r.rule}\n\n`;
      out += `- **Do:** ${r.do}\n- **Don't:** ${r.dont}\n- **Check:** ${r.check}\n- **Sources:** ${r.sources.join(", ")}\n`;
      if (r.evidence.length) out += `- **Seen in:** ${evidenceLinks(r.evidence, ev)}\n`;
      out += "\n";
    }
  }
  return out;
}

const mmId = (id) => id.replace(/-/g, "_");
const mmText = (s) => s.replace(/"/g, "'");

function mermaidFrom(startId, byId, seen = new Set()) {
  const lines = ["```mermaid", "flowchart TD"];
  const visit = (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    const n = byId.get(id);
    if (n.type === "result") {
      lines.push(`  ${mmId(id)}(["${mmText(id.replace("CHART-R-", "").toLowerCase())}: ${mmText(n.form.replace("FORM-", "").toLowerCase())}"])`);
      return;
    }
    lines.push(`  ${mmId(id)}{"${mmText(n.question)}"}`);
    for (const o of n.options) {
      visit(o.next);
      lines.push(`  ${mmId(id)} -->|"${mmText(o.label)}"| ${mmId(o.next)}`);
    }
  };
  visit(startId);
  lines.push("```");
  return lines.join("\n");
}

function treeMd() {
  const tree = loadData("decision-tree.json");
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  let out = NOTICE("data/decision-tree.json") + "# Chart selection decision tree\n\n";
  out += "Start at `" + tree.start + "`. Ask the question, follow the option, stop at a result. Then run the gates. The same tree is in `data/decision-tree.json` for programs; `scripts/check-spec.mjs --tree <job>` lists every form a job can reach.\n\n";
  out += "## Top level\n\n```mermaid\nflowchart TD\n";
  const root = byId.get(tree.start);
  out += `  ROOT{"${mmText(root.question)}"}\n`;
  root.options.forEach((o, i) => {
    out += `  ROOT -->|"${mmText(o.label)}"| B${i}["${mmText(o.next)}"]\n`;
  });
  out += "```\n\n";
  out += "## Gates every result must clear\n\n";
  out += tree.gates.map((g) => `- **${g.id}:** ${g.check} (${g.rules.map(tag).join(", ")})`).join("\n") + "\n\n";
  out += "## Branches\n\n";
  const heads = root.options.map((o) => o.next).filter((id) => byId.get(id).type === "question");
  for (const head of heads) {
    out += `### ${tag(head)} ${byId.get(head).question}\n\n${mermaidFrom(head, byId)}\n\n`;
  }
  out += "## Full outline\n\n";
  const walk = (id, depth, seen) => {
    const n = byId.get(id);
    const pad = "  ".repeat(depth);
    if (n.type === "result") {
      return `${pad}- **${tag(id)}** → \`${n.form}\`${n.alternatives.length ? ` (alternatives: ${n.alternatives.map((a) => `\`${a}\``).join(", ")})` : ""}, color job **${n.color_job}**. Rules: ${n.rules.map(tag).join(", ")}. ${n.notes}\n`;
    }
    let s = `${pad}- ${tag(id)} **${n.question}**\n`;
    for (const o of n.options) {
      s += `${pad}  - *${o.label}*\n`;
      const next = byId.get(o.next);
      if (seen.has(o.next)) s += `${pad}    - see ${tag(o.next)} above\n`;
      else {
        seen.add(o.next);
        s += walk(o.next, depth + 2, seen);
      }
    }
    return s;
  };
  const seen = new Set([tree.start]);
  out += walk(tree.start, 0, seen);
  const listed = new Set(tree.nodes.filter((n) => seen.has(n.id)).map((n) => n.id));
  const orphans = tree.nodes.filter((n) => !listed.has(n.id));
  if (orphans.length) out += `\n**Unreachable nodes:** ${orphans.map((n) => tag(n.id)).join(", ")}\n`;
  return out;
}

function catalogMd() {
  const cat = loadData("chart-catalog.json");
  let out = NOTICE("data/chart-catalog.json") + "# Chart catalog\n\n";
  out += "Every form, with its job, when to use it, when not to, baseline, limits, color job, audience, dashboard fit, and a build hint for shadcn Chart over Recharts. **Fit:** `core` is the default toolkit, `situational` is right for a specific job, `rare` is specialist and needs an analyst audience plus a how-to-read note.\n\n";
  out += "| Form | Name | Job | Fit | Audience | Baseline | Color job |\n|---|---|---|---|---|---|---|\n";
  for (const f of cat.forms) {
    out += `| ${tag(f.id)} | ${cell(f.name)} | ${cell(f.job)} | ${f.fit} | ${f.audience} | ${f.baseline} | ${f.color_job} |\n`;
  }
  out += "\n";
  const families = [...new Set(cat.forms.map((f) => f.family))];
  for (const fam of families) {
    out += `## ${fam[0].toUpperCase() + fam.slice(1)}\n\n`;
    for (const f of cat.forms.filter((x) => x.family === fam)) {
      out += `### ${tag(f.id)} ${f.name}\n\n`;
      out += `- **Job:** ${f.job}\n- **Use when:** ${f.use_when}\n- **Avoid when:** ${f.avoid_when}\n- **Baseline:** ${f.baseline}\n- **Limits:** ${f.limits}\n- **Color job:** ${f.color_job} · **Audience:** ${f.audience} · **Fit:** ${f.fit}\n- **Build:** ${f.recharts}\n- **Accessibility:** ${f.a11y}\n`;
      if (f.article_ref) out += `- **Playbook section:** ${f.article_ref}\n`;
      out += "\n";
    }
  }
  return out;
}

function dashMd() {
  const data = loadData("dashboard-patterns.json");
  const ev = new Map(loadData("evidence.json").entries.map((e) => [e.id, e]));
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  let out = NOTICE("data/dashboard-patterns.json") + "# Dashboard patterns\n\n";
  const q = data.nodes.find((n) => n.node_type === "decision");
  out += `## ${tag(q.id)} ${q.name}\n\n**${q.question}**\n\n`;
  out += q.options.map((o) => `- ${o.label} → ${tag(o.next)} (${byId.get(o.next).name})`).join("\n") + "\n\n";
  for (const kind of ["template", "component"]) {
    out += `## ${kind === "template" ? "Page templates" : "Reusable pieces"}\n\n`;
    for (const n of data.nodes.filter((x) => x.node_type === kind)) {
      out += `### ${tag(n.id)} ${n.name}\n\n**When:** ${n.when}\n\n**Structure, in order**\n\n${n.structure.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`;
      out += `- **Build from:** ${n.vois_components.join(", ")}\n- **Must follow:** ${n.must_follow.map(tag).join(", ")}\n- **Avoid:** ${n.anti_patterns.join("; ")}\n- **Seen in:** ${evidenceLinks(n.evidence, ev)}\n\n`;
    }
  }
  return out;
}

function evidenceMd() {
  const data = loadData("evidence.json");
  let out = NOTICE("data/evidence.json") + "# Evidence from real products\n\n";
  out += "Screens found through Mobbin and what each teaches. **adopt** means copy the pattern, **watch-out** means it breaks a rule and is kept as a counter-example. These are observations of other products for pattern research, not templates to copy visually.\n\n";
  for (const verdict of ["adopt", "watch-out"]) {
    out += `## ${verdict === "adopt" ? "Patterns to adopt" : "Watch-outs"}\n\n| Id | Product and screen | What it does | Lesson | Rules |\n|---|---|---|---|---|\n`;
    for (const e of data.entries.filter((x) => x.verdict === verdict)) {
      out += `| ${tag(e.id)} | [${e.app}](${e.mobbin_url}): ${cell(e.screen)} | ${cell(e.observation)} | ${cell(e.lesson)} | ${e.rules.map(tag).join(" ")} |\n`;
    }
    out += "\n";
  }
  return out;
}

const OUTPUTS = {
  "references/principles.md": principlesMd,
  "references/decision-tree.md": treeMd,
  "references/chart-catalog.md": catalogMd,
  "references/dashboard-patterns.md": dashMd,
  "references/evidence.md": evidenceMd,
};

function main() {
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const [rel, build] of Object.entries(OUTPUTS)) {
    const path = join(SKILL_ROOT, rel);
    const next = build();
    if (check) {
      const current = existsSync(path) ? readFileSync(path, "utf8") : "";
      if (current !== next) {
        console.error(`stale: vois-dataviz/${rel}`);
        stale++;
      }
    } else {
      writeFileSync(path, next);
      console.log(`wrote vois-dataviz/${rel}`);
    }
  }
  if (check) {
    if (stale) {
      console.error("Run: node vois-dataviz/scripts/build-reference.mjs");
      process.exit(1);
    }
    console.log("vois-dataviz generated references are up to date");
  }
}

main();
