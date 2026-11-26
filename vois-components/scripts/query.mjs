#!/usr/bin/env node
// Answers one design question with a small packet, from the retrieval index (see prds/jit-retrieval.md).
//   node vois-components/scripts/query.mjs Dialog                      build path: rules, card, registry item for one component
//   node vois-components/scripts/query.mjs --jobs                      the jobs to choose from, one line each
//   node vois-components/scripts/query.mjs --job JOB-CONFIRM-DESTRUCTIVE [--job ...]   pick path: decision trees, merged
//   node vois-components/scripts/query.mjs --id DS-MODAL-004           one rule, behavior row, lookalike or job; also a PATH-* node or a FIELD-* rule
//   node vois-components/scripts/query.mjs --patterns                  the top-level page and form patterns, and every pattern file with its node count
//   node vois-components/scripts/query.mjs --group table-interactions  every PATH node from one pattern file, one line each
//   node vois-components/scripts/query.mjs --fields                    the form field rules (FIELD-*), one line each
//   node vois-components/scripts/query.mjs --audit                     coverage and gaps
// Flags: --full adds the card's rows and the job rationale. --json prints the same data as JSON.
// Exit codes: 0 found, 2 ambiguous (candidates listed), 3 not found (nearest names listed), 1 bad usage or a broken index.
// It never falls back to reading the whole skill. What it cannot provide, it says.
//
// It reads the index, the job file and the behavior cards, all inside vois-components, so an installed skill works alone.
// The index carries a copy of the vois-patterns and vois-fields rule text for the same reason.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { norm, byText } from "./retrieval.mjs";

/** An own key only, so "constructor" or "__proto__" never reads a built-in. */
const own = (obj, k) => (obj && Object.hasOwn(obj, k) ? obj[k] : undefined);

const here = dirname(fileURLToPath(import.meta.url));
const SKILL = join(here, "..");

export function loadAll(skill = SKILL) {
  const read = (rel) => JSON.parse(readFileSync(join(skill, rel), "utf8"));
  const index = read("data/retrieval-index.json");
  const rules = read("data/components-rules.json");
  const card = (id) => {
    const p = join(skill, "behaviors", `${id}.json`);
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  };
  return { index, jobs: rules.jobs || [], card };
}

/** Edit distance, for "did you mean". */
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Name -> { state, ids, near }. Matches whole names only: "dialog" finds Dialog, not AlertDialog. When a shared name is
 * one component's registry item and only another's shadcn file, the registry item wins: it is what the code imports. */
export function resolve(index, name) {
  const k = norm(name || "");
  if (!k) return { state: "no_match", ids: [], near: [] };
  const owners = own(index.aliases, k) || [];
  const reg = owners.filter((o) => o.kind === "registry");
  const chosen = owners.length > 1 && reg.length === 1 ? reg : owners;
  const ids = chosen.map((o) => o.component);
  if (ids.length === 1) return { state: "match", ids, near: [] };
  if (ids.length > 1) return { state: "ambiguous", ids, near: [] };
  const near = Object.keys(index.aliases)
    .map((a) => ({ a, d: distance(k, a) }))
    .filter((x) => x.d <= Math.max(2, Math.floor(k.length / 3)))
    .sort((x, y) => x.d - y.d || byText(x.a, y.a))
    .flatMap((x) => index.aliases[x.a].map((o) => o.component));
  return { state: "no_match", ids: [], near: [...new Set(near)].slice(0, 5) };
}

const compById = (index, id) => index.components.find((c) => c.id === id);

/** The build-path packet for one component, as data. */
export function componentPacket(all, id, { full = false } = {}) {
  const { index } = all;
  const c = compById(index, id);
  const rules = c.rules.map((r) => ({ id: r.rule, via: r.via, ...index.rules[r.rule] }));
  // A rule reached only because its text names the component is listed by id: it is usually a cross-cutting rule that
  // mentions the component in passing (an elevation or a token mapping rule). --id gives its text.
  const strong = (r) => r.via.some((v) => v !== "mentions");
  const decide = rules.filter((r) => r.verification !== "detector" && strong(r));
  const mentions = rules.filter((r) => r.verification !== "detector" && !strong(r)).map((r) => r.id);
  const validate = [
    ...rules.filter((r) => r.verification === "detector").map((r) => r.id),
    ...c.lookalikes.filter((l) => index.lookalikes[l] && index.lookalikes[l].verification === "detector"),
  ];
  const missing = [];
  if (!c.card) missing.push("no behavior card");
  if (!c.registry) missing.push(c.coveredBy ? `no registry item of its own (covered by ${c.coveredBy})` : "no registry item");
  if (!c.jobs.length) missing.push("no job names it");
  // The PATH nodes (from vois-patterns) whose text names this component as a whole word, so a lookup of Sheet leads to
  // PATH-B-ROW-OPEN. An index with no copy of the nodes gives none. Capped, so a common name stays one line.
  const named = new RegExp(`(?<![A-Za-z0-9])${c.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9])`);
  const patternIds = pathNodes(index).filter((n) => named.test(`${n.condition} ${n.outcome}`)).map((n) => n.id).sort(byText);
  const packet = {
    kind: "component", state: "match", component: c.id, status: c.status, registry: c.registry,
    card: c.card, jobs: c.jobs, patterns: patternIds.slice(0, 6), patternsMore: Math.max(0, patternIds.length - 6), decide, mentions, validate,
    lookalikes: c.lookalikes.map((l) => ({ id: l, ...index.lookalikes[l] })),
    global: index.counts.globalRules, missing,
  };
  for (const k of ["coveredBy", "composedFrom", "note"]) if (c[k] !== undefined) packet[k] = c[k];
  if (full && c.card) {
    const card = all.card(c.card.id);
    packet.rows = card ? [...(card.behaviors || []), ...(card.mistakes || [])].map((r) => ({ id: r.id, group: r.group, support: r.support, text: r.text, note: r.note })) : [];
  }
  return packet;
}

function treeLines(tree, depth = 0, out = []) {
  for (const n of tree || []) {
    const pad = "  ".repeat(depth + 1);
    if (n.recommendation) out.push(`${pad}- ${n.condition} -> ${n.recommendation}`);
    else { out.push(`${pad}- ${n.condition}`); treeLines(n.sub_branches, depth + 1, out); }
  }
  return out;
}

/** The pick-path packet for one or more jobs. Components named by more than one job are listed once with every job. */
export function jobPacket(all, ids, { full = false } = {}) {
  const found = [];
  const unknown = [];
  for (const id of ids) {
    const up = String(id).trim().toUpperCase();
    const j = all.jobs.find((x) => x.id === up || x.id === `JOB-${up}`);
    if (j) { if (!found.includes(j)) found.push(j); } else unknown.push(id);
  }
  const byComp = new Map();
  for (const j of found) for (const c of all.index.components) if (c.jobs.includes(j.id)) byComp.set(c.id, [...(byComp.get(c.id) || []), j.id]);
  const components = [...byComp.entries()].sort(([a], [b]) => byText(a, b)).map(([id, jobs]) => {
    const c = compById(all.index, id);
    return { id, jobs, registry: c.registry, card: c.card ? c.card.id : null };
  });
  return {
    kind: "jobs",
    // Any unknown id is a miss the caller must see, so the exit code says not found even when other jobs resolved.
    state: unknown.length ? "no_match" : "match",
    jobs: found.map((j) => {
      // The PATH nodes (from vois-patterns) that list this job in builds_on, so a job leads to the page rules that use it.
      // An index with no copy of the nodes gives none. Up to 12 are listed; the rest are counted.
      const ids = pathNodes(all.index).filter((n) => Array.isArray(n.builds_on) && n.builds_on.includes(j.id)).map((n) => n.id).sort(byText);
      return { id: j.id, title: j.title, framing: j.framing, tree: j.decision_tree, patterns: ids.slice(0, 12), patternsMore: Math.max(0, ids.length - 12), rationale: full ? j.rationale : undefined };
    }),
    components,
    unknown,
  };
}

/** A line-length cut at a word edge, so a one-line list stays one line. */
const cut = (text, n = 110) => {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const head = t.slice(0, n - 3);
  const at = head.lastIndexOf(" ");
  return `${(at > n / 2 ? head.slice(0, at) : head).replace(/[ ,;:]+$/, "")}...`;
};

const pathNodes = (index) => Object.entries(own(index, "patterns") || {}).map(([id, n]) => ({ id, ...n }));

/** The top-level patterns, and each source file that holds cross-cutting rules with how many. */
export function patternsList(all) {
  const nodes = pathNodes(all.index);
  const groups = new Map();
  for (const n of nodes) groups.set(n.group, (groups.get(n.group) || 0) + 1);
  // An index with no copy of the nodes is a miss, not an empty list: an empty list would read as "no rule exists".
  return {
    kind: "patterns", state: nodes.length ? "match" : "no_match",
    top: nodes.filter((n) => n.kind === "top_level_pattern").map((n) => ({ id: n.id, name: n.name, condition: n.condition })),
    groups: [...groups.entries()].sort(([a], [b]) => byText(a, b)).map(([group, count]) => ({ group, count })),
  };
}

/** Every PATH node from one pattern file. A group of more than 40 lines is cut to 40 unless full is set, and says so. */
export function groupPacket(all, name, { full = false } = {}) {
  const nodes = pathNodes(all.index);
  const known = [...new Set(nodes.map((n) => n.group))].sort(byText);
  const hit = known.find((g) => norm(g) === norm(name || ""));
  if (!hit) return { kind: "group", state: "no_match", query: name, known };
  const inGroup = nodes.filter((n) => n.group === hit);
  const rows = full ? inGroup : inGroup.slice(0, 40);
  return { kind: "group", state: "match", group: hit, total: inGroup.length, rows: rows.map((n) => ({ id: n.id, kind: n.kind, name: n.name, condition: n.condition })) };
}

export function fieldsList(all) {
  const rules = Object.entries(own(all.index, "fields") || {});
  return { kind: "fields", state: rules.length ? "match" : "no_match", rules: rules.map(([id, r]) => ({ id, title: r.title, category: r.category })) };
}

/** One id: a rule the index carries, a behavior row, a lookalike, a job, a PATH node or a FIELD rule. */
export function idLookup(all, raw) {
  const { index } = all;
  const id = String(raw).trim().toUpperCase();
  if (own(index.rules, id)) return { kind: "rule", state: "match", id, ...index.rules[id], components: index.components.filter((c) => c.rules.some((r) => r.rule === id)).map((c) => c.id) };
  if (own(index.lookalikes, id)) return { kind: "lookalike", state: "match", id, ...index.lookalikes[id] };
  const node = own(own(index, "patterns"), id);
  if (node) return { ...node, nodeKind: node.kind, kind: "path", state: "match", id, children: pathNodes(index).filter((n) => n.parent === id).map((n) => ({ id: n.id, name: n.name, condition: n.condition })) };
  const field = own(own(index, "fields"), id);
  if (field) return { kind: "field", state: "match", id, ...field };
  const job = all.jobs.find((j) => j.id === id);
  if (job) return jobPacket(all, [id], { full: true });
  const m = /^BHV-(.+)-\d{3}$/.exec(id);
  if (m) {
    const owner = index.components.find((c) => c.card && norm(c.card.id) === norm(m[1]));
    const card = owner && all.card(owner.card.id);
    const row = card && [...(card.behaviors || []), ...(card.mistakes || [])].find((r) => r && r.id === id);
    if (row) return { kind: "behavior", state: "match", id, component: owner.id, ...row };
  }
  return { kind: "id", state: "no_match", id, note: /^DS-/.test(id) ? "No component links to this rule, so it is cross-cutting: read it in vois-tokens/data/vois-rules.json." : "No such id in the index." };
}

export function audit(all) {
  const { index } = all;
  const linked = new Set(index.components.flatMap((c) => c.jobs));
  return {
    kind: "audit", state: "match",
    counts: index.counts,
    jobsNamingNoComponent: all.jobs.map((j) => j.id).filter((id) => !linked.has(id)),
    componentsWithoutCard: index.components.filter((c) => !c.card).map((c) => c.id),
    componentsWithoutRegistry: index.components.filter((c) => !c.registry).map((c) => c.id),
    componentsNoJobNames: index.components.filter((c) => !c.jobs.length).map((c) => c.id),
  };
}

// ---------------- text output

function textComponent(p) {
  const L = [`VOIS PACKET  component: ${p.component}  (match)`];
  L.push(`registry   ${p.registry || "none"}${p.status ? `  [status: ${p.status}]` : ""}`);
  if (p.coveredBy) L.push(`covered by ${p.coveredBy}`);
  if (p.composedFrom) L.push(`compose    ${p.composedFrom.join(", ")}`);
  if (p.card) L.push(`card       behaviors/${p.card.id}.md  ${p.card.rows} rows: ${Object.entries(p.card.support).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  L.push(`jobs       ${p.jobs.join(", ") || "none"}`);
  if (p.patterns && p.patterns.length) L.push(`patterns   ${p.patterns.join(", ")}${p.patternsMore ? ` (+${p.patternsMore} more)` : ""} (page rules that name it; --id for the text)`);
  if (p.decide.length) {
    L.push("rules");
    for (const r of p.decide) L.push(`  ${r.id}  [${r.via.join(", ")}] ${r.rule}`);
  }
  if (p.mentions.length) L.push(`also named ${p.mentions.join(", ")} (rules that name it in passing; --id for the text)`);
  if (p.lookalikes.length) {
    L.push("lookalikes");
    for (const l of p.lookalikes) L.push(`  ${l.id}  built: ${l.built}  instead: ${l.instead}`);
  }
  L.push(`validate   ${p.validate.join(", ") || "none"} (checked by detectors)`);
  L.push(`global     ${p.global} cross-cutting rules in vois-tokens apply as well`);
  L.push(`missing    ${p.missing.join("; ") || "none"}`);
  if (p.note) L.push(`note       ${p.note}`);
  if (p.rows) {
    L.push("card rows");
    for (const r of p.rows) L.push(`  ${r.id} [${r.group}, ${r.support}] ${r.text}${r.note ? `  Note: ${r.note}` : ""}`);
  }
  return L.join("\n");
}

function textJobs(p) {
  const L = [`VOIS PACKET  jobs: ${p.jobs.map((j) => j.id).join(", ") || "none"}  (${p.state})`];
  for (const j of p.jobs) {
    L.push(`${j.id}: ${j.title}`, `  ${j.framing}`, ...treeLines(j.tree));
    if (j.patterns && j.patterns.length) L.push(`  page rules that build on it: ${j.patterns.join(", ")}${j.patternsMore ? ` (+${j.patternsMore} more)` : ""} (--id for the text)`);
    if (j.rationale) for (const r of j.rationale) L.push(`  Q: ${r.question}`, `     ${r.answer}`);
  }
  L.push("components named");
  for (const c of p.components) L.push(`  ${c.id}  [${c.jobs.join(", ")}] registry: ${c.registry || "none"}, card: ${c.card || "none"}`);
  if (!p.components.length) L.push("  none");
  if (p.unknown.length) L.push(`unknown    ${p.unknown.join(", ")} (list them with --jobs)`);
  L.push("next       run query.mjs <component> for the one you pick");
  return L.join("\n");
}

function textOther(p) {
  if (p.kind === "audit") {
    return [
      "VOIS AUDIT",
      `counts     ${Object.entries(p.counts).map(([k, v]) => `${k} ${v}`).join(", ")}`,
      `jobs that name no known component: ${p.jobsNamingNoComponent.join(", ") || "none"}`,
      `components with no card (${p.componentsWithoutCard.length}): ${p.componentsWithoutCard.join(", ")}`,
      `components with no registry item (${p.componentsWithoutRegistry.length}): ${p.componentsWithoutRegistry.join(", ")}`,
      `components no job names (${p.componentsNoJobNames.length}): ${p.componentsNoJobNames.join(", ")}`,
    ].join("\n");
  }
  if ((p.kind === "patterns" || p.kind === "fields") && p.state !== "match") return `This index has no copy of the ${p.kind === "patterns" ? "PATH nodes" : "FIELD rules"}, so it cannot answer. Run node vois-components/scripts/retrieval.mjs --write, or read the skill file. This is not the same as there being no rule.`;
  if (p.kind === "patterns") {
    return [
      "VOIS PATTERNS  top-level patterns (run --id <ID> for one, with its sub-decisions)",
      ...p.top.map((n) => `${n.id}  ${n.name}. ${cut(n.condition)}`),
      "every PATH node, by pattern file (run --group <name> to list the ids)",
      ...p.groups.map((g) => `  ${g.group}  ${g.count} nodes`),
      "If no pattern fits, say the skills have no rule for this task.",
    ].join("\n");
  }
  if (p.kind === "group") {
    if (p.state !== "match") return `"${p.query}" is not a pattern file in the index. Groups: ${p.known.join(", ")}. If nothing fits, say the skills have no rule for it.`;
    const L = [`VOIS PATTERNS  group: ${p.group}  (${p.total} nodes; --id <ID> for the full text)`, ...p.rows.map((n) => `${n.id}  ${n.name ? `${n.name}. ` : ""}${cut(n.condition, 100)}`)];
    if (p.rows.length < p.total) L.push(`+${p.total - p.rows.length} more; add --full to list them all`);
    return L.join("\n");
  }
  if (p.kind === "fields") return ["VOIS FIELD RULES  (run --id <ID> for the full text; vois-fields)", ...p.rules.map((r) => `${r.id}  ${r.title}`), "If no field rule fits, say the skills have no rule for this task."].join("\n");
  if (p.state !== "match") return `${p.id}: not found. ${p.note}`;
  if (p.kind === "path") {
    const L = [`${p.id} [${p.group}${p.name ? `, ${p.name}` : ""}]`, `when: ${p.condition}`, `then: ${p.outcome}`];
    if (p.builds_on) L.push(`builds on ${p.builds_on.join(", ")}`);
    if (p.parent) L.push(`part of ${p.parent}`);
    if (p.children.length) { L.push("sub-decisions"); for (const c of p.children) L.push(`  ${c.id}  ${c.name ? `${c.name}. ` : ""}${cut(c.condition, 100)}`); }
    return L.join("\n");
  }
  if (p.kind === "field") return [`${p.id} [${p.category}, ${p.severity}] ${p.title}`, p.rule, ...(p.never.length ? [`never: ${p.never.join("; ")}`] : [])].join("\n");
  if (p.kind === "rule") return `${p.id} [${p.category}, ${p.severity}, ${p.verification}] ${p.rule}\ncomponents ${p.components.join(", ")}`;
  if (p.kind === "lookalike") return `${p.id} [${p.verification}] built: ${p.built}\ninstead: ${p.instead}`;
  if (p.kind === "behavior") return `${p.id} [${p.component}, ${p.group}, ${p.support}] ${p.text}${p.note ? `\nNote: ${p.note}` : ""}${p.evidence ? `\nEvidence: ${p.evidence}` : ""}`;
  return JSON.stringify(p, null, 2);
}

export function main(argv, all = loadAll()) {
  const has = (f) => argv.includes(f);
  const USAGE = "usage: query.mjs <component> | --jobs | --job <JOB-ID> [--job ...] | --id <id> | --patterns | --group <name> | --fields | --audit  [--full] [--json]";
  const KNOWN = new Set(["--job", "--id", "--group", "--jobs", "--patterns", "--fields", "--audit", "--full", "--json"]);
  const flagArgs = new Set(["--job", "--id", "--group"]);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--") && !KNOWN.has(argv[i])) return { code: 1, out: `unknown flag ${argv[i]}\n${USAGE}` };
    if (flagArgs.has(argv[i]) && (argv[i + 1] === undefined || argv[i + 1].startsWith("--"))) return { code: 1, out: `${argv[i]} needs a value\n${USAGE}` };
  }
  const values = (f) => argv.flatMap((a, i) => (a === f ? [argv[i + 1]] : []));
  const positional = argv.filter((a, i) => !a.startsWith("--") && !flagArgs.has(argv[i - 1]));
  const modes = [has("--jobs"), has("--patterns"), has("--fields"), has("--audit"), values("--group").length > 0, values("--id").length > 0, values("--job").length > 0, positional.length > 0].filter(Boolean).length;
  if (modes > 1) return { code: 1, out: `pick one mode: a component name, --jobs, --job, --id, --patterns, --group, --fields or --audit\n${USAGE}` };
  const full = has("--full");
  let result;
  if (has("--jobs")) result = { kind: "joblist", state: "match", jobs: all.jobs.map((j) => ({ id: j.id, title: j.title, framing: j.framing })) };
  else if (has("--patterns")) result = patternsList(all);
  else if (has("--fields")) result = fieldsList(all);
  else if (values("--group").length) result = groupPacket(all, values("--group")[0], { full });
  else if (has("--audit")) result = audit(all);
  else if (values("--id").length) result = idLookup(all, values("--id")[0]);
  else if (values("--job").length) result = jobPacket(all, values("--job"), { full });
  else if (positional.length) {
    const name = positional.join(" ");
    const r = resolve(all.index, name);
    if (r.state === "match") result = componentPacket(all, r.ids[0], { full });
    else result = { kind: "component", state: r.state, query: name, candidates: r.ids, near: r.near };
  } else return { code: 1, out: USAGE };

  const code = result.state === "match" ? 0 : result.state === "ambiguous" ? 2 : 3;
  if (has("--json")) return { code, out: JSON.stringify(result, null, 2) };
  let out;
  if (result.kind === "joblist") out = ["Pick the job IDs that fit, then run --job <ID> for each. If no job fits, say the skills have no rule for this task. Do not use the nearest job.", ...result.jobs.map((j) => `${j.id}  ${j.title}. ${j.framing}`), "For page layout, tables, forms and dialogs run --patterns. For form field types and sensitive data run --fields."].join("\n");
  else if (result.kind === "component" && result.state === "match") out = textComponent(result);
  else if (result.kind === "component" && result.state === "ambiguous") out = `"${result.query}" names more than one component: ${result.candidates.join(", ")}. Run query.mjs with one of them.`;
  else if (result.kind === "component") out = `"${result.query}" is not a component in the index.${result.near.length ? ` Nearest: ${result.near.join(", ")}.` : ""} To choose by need instead, run --jobs. If nothing fits, say the skills have no rule for it.`;
  else if (result.kind === "jobs") out = textJobs(result);
  else out = textOther(result);
  return { code, out };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let r;
  try { r = main(process.argv.slice(2)); } catch (e) { r = { code: 1, out: `query: ${e.message}. Run node vois-components/scripts/retrieval.mjs to check the index.` }; }
  (r.code === 1 ? console.error : console.log)(r.out);
  process.exit(r.code);
}
