#!/usr/bin/env node
// Standalone CLI: node detect.mjs <file> [file...]
// Prints JSON findings to stdout. Exit code is always 0 — this script reports,
// it never blocks. (Blocking, where it happens at all, is hook-before-edit.mjs's job.)

import { readFileSync } from "node:fs";
import { rulesForFile } from "./registry.mjs";

export function detectFile(filePath, content) {
  const lines = content.split("\n");
  const findings = [];
  for (const rule of rulesForFile(filePath)) {
    const hits = rule.check({ content, lines, filePath }) || [];
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
  const files = argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: detect.mjs <file> [file...]");
    process.exit(1);
  }
  const allFindings = [];
  for (const filePath of files) {
    let content;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue; // file unreadable/deleted — nothing to detect
    }
    allFindings.push(...detectFile(filePath, content));
  }
  console.log(JSON.stringify(allFindings, null, 2));
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main(process.argv);
