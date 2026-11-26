#!/usr/bin/env node
// Builds and checks the retrieval index (vois-components/data/retrieval-index.json) that query.mjs reads.
//   node vois-components/scripts/retrieval.mjs            check the links, and fail if the index is stale or missing
//   node vois-components/scripts/retrieval.mjs --write    rebuild the index, then check
//   --root <dir>                                          read a repo other than this one (the tests use a copy)
//
// The index is generated: edit the sources, then run with --write. Never edit it by hand. Sources:
//   vois-components/data/component-names.json   components, their aliases, registry item, `card`, and `ruleScopes`
//   vois-components/data/components-rules.json  jobs (decision trees) and lookalike rows
//   vois-components/behaviors/*.json            behavior cards, and the rules their rows cite
//   vois-tokens/data/vois-rules.json            rule text, copied for every rule a component links to, so an
//                                               installed vois-components works without vois-tokens next to it
//   vois-patterns/data/patterns-rules.json      every PATH node (pattern, sub-decision, cross-cutting rule), copied whole
//   vois-fields/data/fields-rules.json          every FIELD rule, copied whole. Both are copied so query.mjs can answer
//                                               --patterns, --group, --fields and --id PATH-* / FIELD-* without those skills
//   registry/registry.json                      optional: checks that each `registry` value names a real item
//
// A component reaches a rule four ways, each kept as provenance: its category is in `ruleScopes` (category), its
// behavior card cites it (card), a lookalike row that names it as the fix, or lists it in `components`, cites it (lookalike), or the rule text names
// it as a whole word (mentions). Every other rule is cross-cutting and stays out of packets. See prds/jit-retrieval.md.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const INDEX_REL = join("vois-components", "data", "retrieval-index.json");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
/** One form for a name: lower case, no spaces, hyphens or underscores. "Alert Dialog", "alert-dialog" and "AlertDialog" agree. */
export const norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, "");
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-word, case-sensitive: "Dialog" does not match inside "AlertDialog", "Dialogs", "Dialog-body" or "vois-Dialog". */
export const wordRe = (name, flags = "") => new RegExp(`(?<![A-Za-z0-9-])${escape(name)}(?![A-Za-z0-9-])`, flags);
/** Plain character order, the same in every locale. */
export const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** The file a PATH node comes from, as one word: "vois-patterns/references/table-interactions.md" is "table-interactions". Any path style. */
export const groupOf = (file) => String(file).split(/[\\/]/).pop().replace(/\.md$/i, "");

/** The text of a decision tree, depth first: every recommendation, at any depth. */
function recommendations(tree, out = []) {
  for (const node of Array.isArray(tree) ? tree : []) {
    if (node && typeof node.recommendation === "string") out.push(node.recommendation);
    if (node && Array.isArray(node.sub_branches)) recommendations(node.sub_branches, out);
  }
  return out;
}

/** Reads every source. Returns { sources, problems } so a missing file is a reported problem, not a crash. */
export function load(root) {
  const problems = [];
  const at = (rel) => join(root, rel);
  const need = (rel) => {
    try { return readJson(at(rel)); } catch (e) { problems.push(`${rel}: cannot read (${e.code || e.message})`); return null; }
  };
  const names = need("vois-components/data/component-names.json");
  const rules = need("vois-components/data/components-rules.json");
  const tokens = need("vois-tokens/data/vois-rules.json");
  const patterns = need("vois-patterns/data/patterns-rules.json");
  const fields = need("vois-fields/data/fields-rules.json");
  const cardsDir = at("vois-components/behaviors");
  const cards = [];
  if (existsSync(cardsDir)) {
    for (const f of readdirSync(cardsDir).filter((f) => f.endsWith(".json")).sort()) {
      try { cards.push({ file: f, card: readJson(join(cardsDir, f)) }); } catch (e) { problems.push(`behaviors/${f}: cannot read (${e.message})`); }
    }
  } else problems.push("vois-components/behaviors: missing");
  const registryPath = at("registry/registry.json");
  let registry = null;
  if (existsSync(registryPath)) {
    try { registry = readJson(registryPath); } catch (e) { problems.push(`registry/registry.json: cannot read (${e.message})`); }
  }
  return { sources: { names, rules, tokens, patterns, fields, cards, registry }, problems };
}

/** Builds the index from the sources and lists every broken link. A problem never widens what a packet holds. */
export function build({ names, rules, tokens, patterns, fields, cards, registry }) {
  const problems = [];
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (!isObj(names) || !Array.isArray(names.names)) return { index: null, problems: ["component-names.json: `names` must be a list"] };
  const outside = isObj(names.outsideInventory) && Array.isArray(names.outsideInventory.names) ? names.outsideInventory.names : [];
  const dsRules = (isObj(tokens) && Array.isArray(tokens.rules) ? tokens.rules : []).filter((r, i) => {
    if (isObj(r) && typeof r.id === "string" && typeof r.rule === "string") return true;
    problems.push(`vois-rules.json: rule ${i} has no id or no rule text`);
    return false;
  });
  if (!dsRules.length) problems.push("vois-rules.json: no rules");
  const dsById = new Map(dsRules.map((r) => [r.id, r]));
  const categories = isObj(tokens) && isObj(tokens.categories) ? tokens.categories : {};
  const keep = (list, what) => list.filter((x, i) => {
    if (isObj(x) && typeof x.id === "string") return true;
    problems.push(`components-rules.json: ${what} ${i} is not an object with an id`);
    return false;
  });
  const jobs = keep(isObj(rules) && Array.isArray(rules.jobs) ? rules.jobs : [], "job");
  const lookalikes = keep(isObj(rules) && isObj(rules.lookalikes) && Array.isArray(rules.lookalikes.rows) ? rules.lookalikes.rows : [], "lookalike row");
  if (!jobs.length) problems.push("components-rules.json: no jobs");

  // PATH nodes and FIELD rules. Copied whole, so the packet text is exactly the rule text. An id may belong to one
  // thing only, across every source, so --id never has to guess which one the caller meant.
  const ownerOf = new Map();
  // --id upper-cases what it is given, so ids are compared in upper case: "path-x" and "PATH-X" are one id.
  const claim = (id, what) => {
    const k = id.toUpperCase();
    if (ownerOf.has(k)) { problems.push(`${what} ${id} is also ${ownerOf.get(k)}; an id must belong to one thing`); return false; }
    ownerOf.set(k, what);
    return true;
  };
  for (const r of dsRules) claim(r.id, "vois-rules.json rule");
  for (const j of jobs) claim(j.id, "components-rules.json job");
  for (const l of lookalikes) claim(l.id, "components-rules.json lookalike");
  const nodeList = isObj(patterns) && Array.isArray(patterns.nodes) ? patterns.nodes : null;
  if (!nodeList) problems.push("patterns-rules.json: `nodes` must be a list");
  const pathNodes = new Map();
  for (const [i, n] of (nodeList || []).entries()) {
    if (!isObj(n) || typeof n.id !== "string" || !n.id || typeof n.condition !== "string" || typeof n.outcome !== "string") { problems.push(`patterns-rules.json: node ${i} needs a string id, condition and outcome`); continue; }
    if (typeof n.source_file !== "string" || !n.source_file) { problems.push(`patterns-rules.json: ${n.id} has no source_file`); continue; }
    if (claim(n.id, "patterns-rules.json node")) pathNodes.set(n.id, n);
  }
  const groupFiles = new Map(); // group name -> the one source file it stands for
  for (const n of pathNodes.values()) {
    const g = groupOf(n.source_file), seenFile = groupFiles.get(g);
    if (seenFile === undefined) groupFiles.set(g, n.source_file.replace(/\\/g, "/"));
    else if (seenFile !== n.source_file.replace(/\\/g, "/")) problems.push(`patterns-rules.json: ${n.id} comes from ${n.source_file} and ${seenFile} has the same file name; --group could not tell them apart`);
  }
  for (const n of pathNodes.values()) if (n.parent != null && !pathNodes.has(n.parent)) problems.push(`patterns-rules.json: ${n.id} names parent ${n.parent}, which is not a node`);
  const fieldList = isObj(fields) && Array.isArray(fields.rules) ? fields.rules : null;
  if (!fieldList) problems.push("fields-rules.json: `rules` must be a list");
  const fieldRules = new Map();
  for (const [i, r] of (fieldList || []).entries()) {
    if (!isObj(r) || typeof r.id !== "string" || !r.id || typeof r.rule !== "string" || typeof r.title !== "string") { problems.push(`fields-rules.json: rule ${i} needs a string id, title and rule text`); continue; }
    if (claim(r.id, "fields-rules.json rule")) fieldRules.set(r.id, r);
  }

  // Components and their names. Strong names (id, inventory) must be unique across every name. Weak names (shadcn file,
  // registry item, registry item without "vois-") may be shared; a shared weak name is an ambiguous lookup, not an error.
  const comps = [];
  const seen = new Set();
  for (const [from, list] of [["names", names.names], ["outsideInventory", outside]]) {
    for (const c of list) {
      if (!isObj(c) || typeof c.id !== "string" || !c.id) { problems.push(`component-names.json ${from}: an entry has no id`); continue; }
      if (seen.has(c.id)) { problems.push(`component-names.json: ${c.id} is listed twice`); continue; }
      seen.add(c.id);
      for (const k of ["inventory", "shadcn"]) if (c[k] != null && typeof c[k] !== "string") problems.push(`component-names.json: ${c.id} ${k} must be a string or null`);
      comps.push({ ...c, from });
    }
  }
  const compIds = new Set(comps.map((c) => c.id));
  const aliasOwners = new Map(); // norm -> [{ id, kind, strong }]
  const addAlias = (a, id, kind, strong) => {
    if (typeof a !== "string" || !a.trim()) return;
    const k = norm(a);
    const list = aliasOwners.get(k) || [];
    if (!list.some((x) => x.id === id)) list.push({ id, kind, strong });
    aliasOwners.set(k, list);
  };
  for (const c of comps) {
    addAlias(c.id, c.id, "id", true);
    addAlias(c.inventory, c.id, "inventory", true);
    addAlias(c.shadcn, c.id, "shadcn", false);
    if (typeof c.registry === "string") { addAlias(c.registry, c.id, "registry", false); addAlias(c.registry.replace(/^vois-/, ""), c.id, "registry", false); }
  }
  for (const [k, owners] of aliasOwners) {
    if (owners.length > 1 && owners.some((o) => o.strong)) {
      problems.push(`component-names.json: the name "${k}" belongs to ${owners.map((o) => `${o.id} (${o.kind})`).join(" and ")}; an id or inventory name must belong to one component`);
    }
  }

  // Registry items.
  const registryNames = registry && Array.isArray(registry.items) ? new Set(registry.items.map((i) => i.name)) : null;
  for (const c of comps) {
    if (c.registry != null && typeof c.registry !== "string") problems.push(`component-names.json: ${c.id} registry must be a string or null`);
    if (registryNames && typeof c.registry === "string" && !registryNames.has(c.registry)) problems.push(`component-names.json: ${c.id} names registry item ${c.registry}, which registry/registry.json does not have`);
  }

  // Behavior cards: each one claimed by exactly one component, and each claim names a card that exists.
  // A card's rows, or nothing: a card that is not an object, or rows that are not a list, are problems, not crashes.
  const cardById = new Map();
  const rowsOf = new Map();
  for (const { file, card } of cards) {
    const id = file.replace(/\.json$/, "");
    if (!isObj(card)) { problems.push(`behaviors/${file}: not an object`); continue; }
    const rows = [];
    for (const key of ["behaviors", "mistakes"]) {
      if (card[key] === undefined) continue;
      if (!Array.isArray(card[key])) { problems.push(`behaviors/${file}: ${key} must be a list`); continue; }
      card[key].forEach((r, i) => (isObj(r) ? rows.push(r) : problems.push(`behaviors/${file}: ${key}[${i}] is not an object`)));
    }
    cardById.set(id, card);
    rowsOf.set(id, rows);
  }
  const claimed = new Map();
  for (const c of comps) {
    if (c.card === undefined) continue;
    if (typeof c.card !== "string" || !c.card) { problems.push(`component-names.json: ${c.id} card must be a card id`); continue; }
    if (!cardById.has(c.card)) problems.push(`component-names.json: ${c.id} names card ${c.card}, but behaviors/${c.card}.json does not exist`);
    if (claimed.has(c.card)) problems.push(`component-names.json: card ${c.card} is claimed by ${claimed.get(c.card)} and ${c.id}`);
    else claimed.set(c.card, c.id);
  }
  for (const id of cardById.keys()) if (!claimed.has(id)) problems.push(`behaviors/${id}.json: no component in component-names.json names it as its card`);

  // Rule scopes. A malformed scope is an error and adds nothing, so a bad value can never put a category everywhere.
  const scopes = isObj(names.ruleScopes) ? names.ruleScopes.categories : undefined;
  const scopeOf = new Map(); // component -> categories
  if (names.ruleScopes !== undefined && !isObj(scopes)) problems.push("component-names.json: ruleScopes.categories must be an object");
  for (const [cat, list] of Object.entries(isObj(scopes) ? scopes : {})) {
    if (!(cat in categories)) { problems.push(`component-names.json: ruleScopes names ${cat}, which is not a category in vois-rules.json`); continue; }
    if (!Array.isArray(list) || !list.length || list.some((x) => typeof x !== "string")) { problems.push(`component-names.json: ruleScopes ${cat} must be a non-empty list of component ids`); continue; }
    for (const id of list) {
      if (!compIds.has(id)) { problems.push(`component-names.json: ruleScopes ${cat} names ${id}, which is not a component`); continue; }
      scopeOf.set(id, [...(scopeOf.get(id) || []), cat]);
    }
  }

  // Links.
  const links = new Map(comps.map((c) => [c.id, { rules: new Map(), lookalikes: new Set(), jobs: new Set() }]));
  const addRule = (cid, rid, via, where) => {
    if (!dsById.has(rid)) { problems.push(`${where} cites ${rid}, which is not a rule in vois-rules.json`); return; }
    const m = links.get(cid).rules;
    m.set(rid, new Set([...(m.get(rid) || []), via]));
  };
  for (const [cid, cats] of scopeOf) for (const r of dsRules) if (cats.includes(r.category)) addRule(cid, r.id, "category", "ruleScopes");
  for (const c of comps) {
    if (typeof c.card !== "string" || !cardById.has(c.card)) continue;
    for (const row of rowsOf.get(c.card)) {
      if (row.rules === undefined) continue;
      if (!Array.isArray(row.rules)) { problems.push(`behaviors/${c.card}.json ${row.id}: rules must be a list`); continue; }
      for (const rid of row.rules) addRule(c.id, rid, "card", `behaviors/${c.card}.json ${row.id}`);
    }
  }
  // Text matches use the names written in prose: the id and the inventory name (case-sensitive), and a shadcn file name
  // that is a different word from both (Toast's "sonner"; case-insensitive). The longest name is tried first and the text
  // it covers is blanked, so "Navigation Menu" counts once for NavigationMenu and not again for the "Menu" inside it.
  const textNames = [];
  for (const c of comps) {
    const strong = [c.id, c.inventory].filter((x) => typeof x === "string" && x.trim());
    for (const n of new Set(strong)) textNames.push({ id: c.id, name: n, re: wordRe(n, "g") });
    if (typeof c.shadcn === "string" && c.shadcn && !strong.some((n) => norm(n) === norm(c.shadcn))) textNames.push({ id: c.id, name: c.shadcn, re: wordRe(c.shadcn, "gi") });
  }
  textNames.sort((a, b) => b.name.length - a.name.length || byText(a.name, b.name));
  const named = (text) => {
    let rest = String(text);
    const found = new Set();
    for (const t of textNames) {
      t.re.lastIndex = 0;
      if (t.re.test(rest)) { found.add(t.id); t.re.lastIndex = 0; rest = rest.replace(t.re, (m) => " ".repeat(m.length)); }
    }
    return [...found];
  };
  for (const row of lookalikes) {
    if (row.rule_ids !== undefined && !Array.isArray(row.rule_ids)) problems.push(`components-rules.json: lookalike ${row.id} rule_ids must be a list`);
    if (row.components !== undefined && (!Array.isArray(row.components) || !row.components.length || row.components.some((x) => typeof x !== "string"))) problems.push(`components-rules.json: lookalike ${row.id} components must be a non-empty list of component ids`);
    if (row.short !== undefined && (typeof row.short !== "string" || !row.short.trim())) problems.push(`components-rules.json: lookalike ${row.id} short must be a non-empty string`);
    const listed = Array.isArray(row.components) ? row.components.filter((x) => typeof x === "string") : [];
    for (const cid of listed) if (!compIds.has(cid)) problems.push(`components-rules.json: lookalike ${row.id} components names ${cid}, which is not a component`);
    for (const cid of new Set([...named(String(row.instead || "")), ...listed.filter((x) => compIds.has(x))])) {
      links.get(cid).lookalikes.add(row.id);
      for (const rid of Array.isArray(row.rule_ids) ? row.rule_ids : []) addRule(cid, rid, "lookalike", `lookalike ${row.id}`);
    }
  }
  for (const r of dsRules) for (const cid of named(String(r.rule || ""))) addRule(cid, r.id, "mentions", "rule text");
  for (const j of jobs) {
    const text = recommendations(j.decision_tree).join("\n");
    for (const cid of named(text)) links.get(cid).jobs.add(j.id);
  }

  // The index. Sorted throughout, so the same sources always give the same bytes.
  const linkedRuleIds = new Set();
  const components = comps.map((c) => {
    const l = links.get(c.id);
    const card = typeof c.card === "string" && cardById.has(c.card) ? cardById.get(c.card) : null;
    const rows = card ? rowsOf.get(c.card) : [];
    const support = {};
    for (const r of rows) support[r.support] = (support[r.support] || 0) + 1;
    const ruleList = [...l.rules.entries()].sort(([a], [b]) => byText(a, b)).map(([id, via]) => { linkedRuleIds.add(id); return { rule: id, via: [...via].sort(byText) }; });
    const out = {
      id: c.id,
      from: c.from,
      status: c.status ?? null,
      registry: typeof c.registry === "string" ? c.registry : null,
      card: card ? { id: c.card, rows: rows.length, support: Object.fromEntries(Object.entries(support).sort(([a], [b]) => byText(a, b))) } : null,
      jobs: [...l.jobs].sort(byText),
      rules: ruleList,
      lookalikes: [...l.lookalikes].sort(byText),
    };
    for (const k of ["coveredBy", "composedFrom", "note"]) if (c[k] !== undefined) out[k] = c[k];
    return out;
  }).sort((a, b) => byText(a.id, b.id));
  const aliases = Object.fromEntries([...aliasOwners.entries()].sort(([a], [b]) => byText(a, b)).map(([k, v]) => [k, v.map((o) => ({ component: o.id, kind: o.kind })).sort((x, y) => byText(x.component, y.component))]));
  const ruleText = Object.fromEntries([...linkedRuleIds].sort().map((id) => {
    const r = dsById.get(id);
    return [id, { category: r.category, severity: r.severity ?? null, verification: typeof r.verification === "string" ? r.verification : (r.verification && r.verification.kind) || null, rule: r.rule }];
  }));
  const lookalikeText = Object.fromEntries(lookalikes.filter((r) => components.some((c) => c.lookalikes.includes(r.id))).map((r) => [r.id, { short: typeof r.short === "string" ? r.short : null, built: r.built, instead: r.instead, verification: r.verification ?? null }]).sort(([a], [b]) => byText(a, b)));
  const index = {
    note: "Generated by vois-components/scripts/retrieval.mjs from component-names.json, components-rules.json, behaviors/*.json and vois-tokens/data/vois-rules.json. Do not edit; run the script with --write. query.mjs reads it.",
    counts: { components: components.length, jobs: jobs.length, cards: cardById.size, rules: dsRules.length, linkedRules: linkedRuleIds.size, globalRules: dsRules.length - linkedRuleIds.size, pathNodes: pathNodes.size, fieldRules: fieldRules.size },
    aliases,
    components,
    rules: ruleText,
    lookalikes: lookalikeText,
    patterns: Object.fromEntries([...pathNodes.entries()].sort(([a], [b]) => byText(a, b)).map(([id, n]) => {
      const out = { kind: typeof n.node_type === "string" ? n.node_type : null, name: n.pattern_name ?? n.rule_name ?? null, group: groupOf(n.source_file), parent: n.parent ?? null, condition: n.condition, outcome: n.outcome };
      if (Array.isArray(n.builds_on) && n.builds_on.length) out.builds_on = n.builds_on.filter((x) => typeof x === "string");
      return [id, out];
    })),
    fields: Object.fromEntries([...fieldRules.entries()].sort(([a], [b]) => byText(a, b)).map(([id, r]) => [id, { category: r.category ?? null, title: r.title, severity: r.severity ?? null, rule: r.rule, never: Array.isArray(r.never) ? r.never.filter((x) => typeof x === "string") : [] }])),
  };
  return { index, problems };
}


export const serialize = (index) => JSON.stringify(index, null, 2) + "\n";

/** Checks one repo. With write, rewrites the index first. Returns the list of problems. */
export function run(root, { write = false } = {}) {
  const { sources, problems } = load(root);
  if (problems.length) return problems;
  const { index, problems: p2 } = build(sources);
  if (!index) return p2;
  const path = join(root, INDEX_REL);
  const text = serialize(index);
  if (write && !p2.length) writeFileSync(path, text);
  const out = [...p2];
  if (!existsSync(path)) out.push(`${INDEX_REL}: missing; run node vois-components/scripts/retrieval.mjs --write`);
  else if (readFileSync(path, "utf8") !== text) out.push(`${INDEX_REL}: stale; run node vois-components/scripts/retrieval.mjs --write`);
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const i = args.indexOf("--root");
  const root = i >= 0 ? args[i + 1] : join(here, "..", "..");
  const problems = run(root, { write: args.includes("--write") });
  if (problems.length) {
    console.error(`retrieval: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log("retrieval: OK");
}
