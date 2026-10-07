#!/usr/bin/env node
// Standalone CLI: node detect.mjs [--root <dir>] <file> [file...]
// Prints JSON findings to stdout. Exit code is always 0 — this script reports,
// it never blocks. (Blocking, where it happens at all, is hook-before-edit.mjs's job.)
// With --root, team override files in <dir>/.vois/teams tighten the limits for the files they cover.
// Without it the base limits apply.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { rulesForFile } from "./registry.mjs";
import { BASE_PARAMS, loadTeams, paramsFor } from "./team-overrides.mjs";

/** `params` is the limits that apply to this file (see team-overrides.mjs). It defaults to the base limits. */
export function detectFile(filePath, content, { params = BASE_PARAMS } = {}) {
  const lines = content.split("\n");
  const findings = [];
  for (const rule of rulesForFile(filePath)) {
    const hits = rule.check({ content, lines, filePath, params }) || [];
    for (const hit of hits) {
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        file: filePath,
        line: hit.line,
        snippet: hit.snippet,
        message: hit.message,
        fixHint: rule.fixHint,
      });
    }
  }
  return findings;
}

function main(argv) {
  const args = argv.slice(2);
  let root = null;
  const r = args.indexOf("--root");
  if (r !== -1) { root = args[r + 1]; args.splice(r, 2); }
  const files = args;
  if (files.length === 0 || (r !== -1 && !root)) {
    console.error("Usage: detect.mjs [--root <dir>] <file> [file...]");
    process.exit(1);
  }
  const teams = root ? loadTeams(root) : [];
  const allFindings = [];
  for (const filePath of files) {
    let content;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue; // file unreadable/deleted — nothing to detect
    }
    allFindings.push(...detectFile(filePath, content, { params: root ? paramsFor(teams, resolve(root), resolve(filePath)) : BASE_PARAMS }));
  }
  console.log(JSON.stringify(allFindings, null, 2));
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main(process.argv);
