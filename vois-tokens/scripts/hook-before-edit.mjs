#!/usr/bin/env node
// Blocking PreToolUse hook entry point for Cursor. Reads the tool-call payload
// from stdin, runs the mechanical detector against the PROPOSED content (not
// what's on disk yet), and denies the edit only for "slop"-severity findings
// (currently DS-TAILWIND-004, DS-ANIMATION-005) — unambiguous, high-confidence
// rules. "quality"-severity findings are never blocked here; they stay
// advisory and are surfaced by hook.mjs after the edit lands.
//
// Denial-fatigue safeguard: after DOWNGRADE_AFTER_BLOCKS consecutive blocks on
// the same (file, rule) pair, this downgrades to allow+nudge instead of
// denying again — a single rule must never be able to deadlock the agent.

import { readFileSync } from "node:fs";
import { rulesForFile } from "./registry.mjs";
import {
  loadConfig,
  filterFindings,
  loadCache,
  saveCache,
  bumpBlockCount,
  isDowngraded,
  resetBlockCount,
} from "./hook-lib.mjs";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/** Cursor's PreToolUse fires before the write — detect against the PROPOSED content, not disk. */
function proposedContent(input) {
  if (typeof input.content === "string") return input.content; // Write
  if (Array.isArray(input.edits)) return input.edits.map((e) => e.new_string ?? "").join("\n"); // MultiEdit
  if (typeof input.new_string === "string") return input.new_string; // Edit
  return null;
}

function detectProposed(filePath, content) {
  const lines = content.split("\n");
  const findings = [];
  for (const rule of rulesForFile(filePath)) {
    const hits = rule.check({ content, lines, filePath }) || [];
    for (const hit of hits) {
      findings.push({ ruleId: rule.id, severity: rule.severity, file: filePath, line: hit.line, snippet: hit.snippet, message: hit.message, fixHint: rule.fixHint });
    }
  }
  return findings;
}

function denyDecision(reason) {
  // Claude-Code-style hookSpecificOutput JSON on stdout, plus exit code 2 +
  // stderr text as a portable fallback for harnesses (Cursor) that only look
  // at the exit code / stderr rather than parsing structured JSON.
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  console.error(reason);
  process.exit(2);
}

function main() {
  const raw = readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // malformed/empty payload — never block on our own confusion
  }

  const toolName = payload?.tool_name ?? "";
  if (!["Edit", "Write", "MultiEdit"].includes(toolName)) process.exit(0);

  const root = payload?.cwd || process.cwd();
  const input = payload?.tool_input ?? {};
  const filePath = input.file_path;
  if (!filePath) process.exit(0);

  const content = proposedContent(input);
  if (content == null) process.exit(0);

  const config = loadConfig(root);
  if (!config.enabled) process.exit(0);

  const findings = detectProposed(filePath, content);
  const relevant = filterFindings(config, findings).filter((f) => f.severity === "slop");

  const cache = loadCache(root);
  // A rule that no longer fires has been fixed — reset its fatigue counter so
  // a future, unrelated reintroduction starts the downgrade clock fresh.
  const stillFiring = new Set(relevant.map((f) => f.ruleId));
  for (const rule of rulesForFile(filePath)) {
    if (rule.severity === "slop" && !stillFiring.has(rule.id)) resetBlockCount(cache, filePath, rule.id);
  }

  if (relevant.length === 0) {
    saveCache(root, cache);
    process.exit(0);
  }

  const blocking = [];
  const downgraded = [];
  for (const f of relevant) {
    if (isDowngraded(cache, filePath, f.ruleId)) {
      downgraded.push(f);
    } else {
      bumpBlockCount(cache, filePath, f.ruleId);
      blocking.push(f);
    }
  }
  saveCache(root, cache);

  if (blocking.length === 0) {
    // Every remaining slop finding has been downgraded — allow, but nudge.
    const lines = downgraded.map((f) => `  [${f.ruleId}] ${f.file}:${f.line} — ${f.message}`);
    console.log(`vois-tokens: allowing despite repeated ${downgraded.length} finding(s) (downgraded after repeated blocks)\n${lines.join("\n")}`);
    process.exit(0);
  }

  const reasonLines = blocking.map((f) => `[${f.ruleId}] ${f.file}:${f.line} — ${f.message} ${f.fixHint ? `(${f.fixHint})` : ""}`);
  denyDecision(`vois-tokens: blocked — ${reasonLines.join(" | ")}`);
}

main();
