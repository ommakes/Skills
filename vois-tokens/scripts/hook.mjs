#!/usr/bin/env node
// Non-blocking PostToolUse hook entry point for Claude Code and Codex.
// Reads the tool-call payload from stdin, runs the mechanical detector
// against the edited file, and prints a nudge. ALWAYS exits 0 — this hook
// never blocks an edit, it only reports back into the agent's context.

import { readFileSync } from "node:fs";
import { detectFile } from "./detect.mjs";
import { buildNudge } from "./hook-lib.mjs";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function extractFilePaths(payload) {
  const input = payload?.tool_input ?? {};
  if (Array.isArray(input.edits)) return [input.file_path].filter(Boolean); // MultiEdit — one file, many edits
  return [input.file_path].filter(Boolean);
}

function main() {
  const raw = readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // malformed/empty payload — say nothing, never block
  }

  const toolName = payload?.tool_name ?? "";
  if (!["Edit", "Write", "MultiEdit"].includes(toolName)) process.exit(0);

  const root = payload?.cwd || process.cwd();
  const files = extractFilePaths(payload);

  const messages = [];
  for (const filePath of files) {
    let content;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    const findings = detectFile(filePath, content);
    const nudge = buildNudge({ root, filePath, findings });
    if (nudge) messages.push(nudge);
  }

  if (messages.length) console.log(messages.join("\n\n"));
  process.exit(0);
}

main();
