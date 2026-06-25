#!/usr/bin/env node
// CLI run inside the CONSUMER project (not this skills repo) to manage the
// vois-tokens hook: toggle it, manage ignore lists, and wire it into each
// harness's hook manifest. Usage: node <path-to-this-skill>/scripts/hook-admin.mjs <command> [...args]

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, saveCache } from "./hook-lib.mjs";

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const VOIS_DIR = join(ROOT, ".vois");

function readJsonSafe(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function ensureGitignore() {
  const path = join(VOIS_DIR, ".gitignore");
  if (existsSync(path)) return;
  mkdirSync(VOIS_DIR, { recursive: true });
  writeFileSync(path, "config.local.json\nhook-cache.json\n");
}

function cmdStatus() {
  const config = loadConfig(ROOT);
  console.log(`vois-tokens hook: ${config.enabled ? "ON" : "OFF"}`);
  console.log(`Ignored rules: ${config.ignoredRules.join(", ") || "(none)"}`);
  console.log(`Ignored files: ${config.ignoredFiles.join(", ") || "(none)"}`);
  const ignoredValueRules = Object.keys(config.ignoredValues);
  console.log(`Ignored values: ${ignoredValueRules.length ? ignoredValueRules.join(", ") : "(none)"}`);
}

function cmdToggle(enabled) {
  ensureGitignore();
  const path = join(VOIS_DIR, "config.json");
  const shared = readJsonSafe(path, {});
  shared.enabled = enabled;
  writeJson(path, shared);
  console.log(`vois-tokens hook: ${enabled ? "enabled" : "disabled"} (.vois/config.json)`);
}

function cmdIgnoreRule(ruleId, scope) {
  if (!ruleId) {
    console.error("Usage: hook-admin.mjs ignore-rule <id> [--shared|--local]");
    process.exit(1);
  }
  ensureGitignore();
  const local = scope === "--local";
  const path = join(VOIS_DIR, local ? "config.local.json" : "config.json");
  const config = readJsonSafe(path, {});
  config.ignoredRules = [...new Set([...(config.ignoredRules ?? []), ruleId])];
  writeJson(path, config);
  console.log(`Ignored rule ${ruleId} (${local ? "local" : "shared"}).`);
}

function cmdIgnoreFile(glob, scope) {
  if (!glob) {
    console.error("Usage: hook-admin.mjs ignore-file <glob> [--shared|--local]");
    process.exit(1);
  }
  ensureGitignore();
  const local = scope === "--local";
  const path = join(VOIS_DIR, local ? "config.local.json" : "config.json");
  const config = readJsonSafe(path, {});
  config.ignoredFiles = [...new Set([...(config.ignoredFiles ?? []), glob])];
  writeJson(path, config);
  console.log(`Ignored file pattern ${glob} (${local ? "local" : "shared"}).`);
}

function cmdIgnoreValue(ruleId, value, scope) {
  if (!ruleId || !value) {
    console.error('Usage: hook-admin.mjs ignore-value <ruleId> <value> [--shared|--local] [--reason "..."]');
    process.exit(1);
  }
  ensureGitignore();
  const local = scope === "--local";
  const path = join(VOIS_DIR, local ? "config.local.json" : "config.json");
  const config = readJsonSafe(path, {});
  config.ignoredValues ??= {};
  config.ignoredValues[ruleId] = [...new Set([...(config.ignoredValues[ruleId] ?? []), value])];
  writeJson(path, config);
  console.log(`Ignored value "${value}" for ${ruleId} (${local ? "local" : "shared"}).`);
}

function cmdReset() {
  const cachePath = join(VOIS_DIR, "hook-cache.json");
  saveCache(ROOT, { files: {}, blockCounts: {} });
  console.log(`Cleared finding cache, edit counts, and block counts (${cachePath}).`);
}

// ---- install ----

const CLAUDE_SETTINGS = ".claude/settings.json";
const CURSOR_HOOKS = ".cursor/hooks.json";
const CODEX_HOOKS = ".codex/hooks.json";

function mergeArray(arr, item) {
  const list = Array.isArray(arr) ? arr : [];
  if (list.some((x) => JSON.stringify(x) === JSON.stringify(item))) return list;
  return [...list, item];
}

function installClaude() {
  const path = join(ROOT, CLAUDE_SETTINGS);
  const settings = readJsonSafe(path, {});
  settings.hooks ??= {};
  settings.hooks.PostToolUse ??= [];
  const entry = {
    matcher: "Edit|Write|MultiEdit",
    hooks: [{ type: "command", command: `node "${join(SCRIPTS_DIR, "hook.mjs")}"` }],
  };
  settings.hooks.PostToolUse = mergeArray(settings.hooks.PostToolUse, entry);
  writeJson(path, settings);
  console.log(`Installed Claude Code PostToolUse hook in ${CLAUDE_SETTINGS}`);
}

function installCursor() {
  const path = join(ROOT, CURSOR_HOOKS);
  const hooks = readJsonSafe(path, {});
  hooks.hooks ??= {};
  hooks.hooks.beforeEdit ??= [];
  const entry = { command: `node "${join(SCRIPTS_DIR, "hook-before-edit.mjs")}"` };
  hooks.hooks.beforeEdit = mergeArray(hooks.hooks.beforeEdit, entry);
  writeJson(path, hooks);
  console.log(`Installed Cursor beforeEdit hook in ${CURSOR_HOOKS}`);
}

function installCodex() {
  const path = join(ROOT, CODEX_HOOKS);
  const hooks = readJsonSafe(path, {});
  hooks.hooks ??= {};
  hooks.hooks.PostToolUse ??= [];
  const entry = {
    matcher: "Edit|Write|MultiEdit",
    hooks: [{ type: "command", command: `node "${join(SCRIPTS_DIR, "hook.mjs")}"` }],
  };
  hooks.hooks.PostToolUse = mergeArray(hooks.hooks.PostToolUse, entry);
  writeJson(path, hooks);
  console.log(`Installed Codex PostToolUse hook in ${CODEX_HOOKS}`);
}

function cmdInstall(harnessArg) {
  const harness = harnessArg ?? "all";
  ensureGitignore();
  if (!existsSync(join(VOIS_DIR, "config.json"))) {
    writeJson(join(VOIS_DIR, "config.json"), { enabled: true, ignoredRules: [], ignoredFiles: [], ignoredValues: {} });
    console.log("Wrote default .vois/config.json");
  }
  if (harness === "all" || harness === "claude") installClaude();
  if (harness === "all" || harness === "cursor") installCursor();
  if (harness === "all" || harness === "codex") installCodex();
  if (!["all", "claude", "cursor", "codex"].includes(harness)) {
    console.error(`Unknown harness "${harness}". Expected claude|cursor|codex|all.`);
    process.exit(1);
  }
}

function parseScope(args) {
  return args.find((a) => a === "--shared" || a === "--local");
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "status":
      return cmdStatus();
    case "on":
      return cmdToggle(true);
    case "off":
      return cmdToggle(false);
    case "ignore-rule":
      return cmdIgnoreRule(args[0], parseScope(args));
    case "ignore-file":
      return cmdIgnoreFile(args[0], parseScope(args));
    case "ignore-value":
      return cmdIgnoreValue(args[0], args[1], parseScope(args));
    case "reset":
      return cmdReset();
    case "install": {
      const harnessFlagIdx = args.indexOf("--harness");
      const harness = harnessFlagIdx >= 0 ? args[harnessFlagIdx + 1] : "all";
      return cmdInstall(harness);
    }
    default:
      console.log(`Usage: hook-admin.mjs <command> [...args]

Commands:
  status                                Show current config
  on / off                              Enable / disable the hook
  ignore-rule <id> [--shared|--local]   Ignore a rule ID
  ignore-file <glob> [--shared|--local] Ignore files matching a glob
  ignore-value <ruleId> <value> [--shared|--local]
                                         Ignore a specific literal value for a rule
  reset                                  Clear the finding/edit/block cache
  install [--harness claude|cursor|codex|all]
                                         Wire the hook into this project's harness config`);
      process.exit(command ? 1 : 0);
  }
}

main();
