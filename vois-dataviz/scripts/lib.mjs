// Shared loaders for the vois-dataviz scripts. Everything the scripts know comes
// from data/*.json, so the scripts and the docs can't disagree about a rule.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function loadData(name) {
  return JSON.parse(readFileSync(join(SKILL_ROOT, "data", name), "utf8"));
}

export function ruleIndex() {
  const byId = new Map();
  for (const rule of loadData("dataviz-rules.json").rules) byId.set(rule.id, rule);
  return byId;
}

export function formIndex() {
  const byId = new Map();
  for (const form of loadData("chart-catalog.json").forms) byId.set(form.id, form);
  return byId;
}

export function treeIndex() {
  const tree = loadData("decision-tree.json");
  const byId = new Map();
  for (const node of tree.nodes) byId.set(node.id, node);
  return { tree, byId };
}

// Every result node reachable from `startId`, depth first, each visited once.
export function resultsFrom(startId) {
  const { byId } = treeIndex();
  const seen = new Set();
  const results = [];
  const stack = [startId];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    const node = byId.get(id);
    if (!node) continue;
    if (node.type === "result") results.push(node);
    else for (const opt of node.options) stack.push(opt.next);
  }
  return results;
}
