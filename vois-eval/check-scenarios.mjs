#!/usr/bin/env node
// Checks scenarios.json against the decision trees it quotes. Zero dependencies.
// Usage: node check-scenarios.mjs
// Each scenario names a leaf of its job's decision_tree with tree_path (indexes into decision_tree,
// then into sub_branches). The scenario's condition must be that leaf's condition word for word, and
// its expected_outcome must start with the same component name as the leaf's recommendation. If a
// tree changes and a scenario no longer matches, this fails instead of the scenario quietly going stale.
import { readFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const { scenarios, score_categories: categories } = read("./scenarios.json");
const jobs = Object.fromEntries(read("../vois-components/data/components-rules.json").jobs.map((j) => [j.id, j]));

const firstWord = (s) => s.split(/[\s(,]/)[0];
const problems = [];
const seen = new Set();

for (const s of scenarios) {
  const fail = (msg) => problems.push(`${s.id}: ${msg}`);
  if (seen.has(s.id)) fail("duplicate id");
  seen.add(s.id);
  const job = jobs[s.source_job];
  if (!job) { fail(`unknown source_job ${s.source_job}`); continue; }

  let nodes = job.decision_tree;
  let leaf;
  for (const i of s.tree_path ?? []) {
    leaf = nodes?.[i];
    if (!leaf) { fail(`tree_path ${JSON.stringify(s.tree_path)} does not resolve in ${s.source_job}`); break; }
    nodes = leaf.sub_branches;
  }
  if (!s.tree_path?.length) fail("missing tree_path");
  else if (leaf) {
    if (leaf.condition !== s.condition) fail(`condition differs from the tree.\n    scenario: ${s.condition}\n    tree:     ${leaf.condition}`);
    if (!leaf.recommendation) fail("tree_path points at a branch with no recommendation");
    else if (firstWord(leaf.recommendation) !== firstWord(s.expected_outcome)) {
      fail(`expected_outcome starts with "${firstWord(s.expected_outcome)}" but the tree recommends "${firstWord(leaf.recommendation)}"`);
    }
  }

  if (!s.user_prompt?.trim()) fail("empty user_prompt");
  if (!Array.isArray(s.forbidden_outcomes) || s.forbidden_outcomes.length === 0) fail("no forbidden_outcomes");
  for (const c of s.score_categories_checked ?? []) if (!categories.includes(c)) fail(`unknown score category ${c}`);
}

const covered = new Set(scenarios.map((s) => s.source_job));
const uncovered = Object.keys(jobs).filter((id) => !covered.has(id));

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s) in ${scenarios.length} scenarios.`);
  process.exit(1);
}
console.log(`check-scenarios: OK, ${scenarios.length} scenarios, ${covered.size} of ${Object.keys(jobs).length} jobs covered${uncovered.length ? ` (no scenario: ${uncovered.join(", ")})` : ""}`);
