// An ESLint plugin (flat config, ESLint 9) that runs the vois-tokens detectors, so an editor shows design-rule
// findings as you type and a team can use standard `// eslint-disable-next-line` comments. It is the editor-side
// complement of scripts/check.mjs (the CI gate), not a replacement: both read the same detectors, the same
// severities, the same waivers and the same team limits.
//
// No runtime dependency: it imports the detector code next to it and needs only the project's own ESLint.
// Setup and coverage are in ../references/hooks.md, "ESLint plugin".
//
// - One ESLint rule per detector id: DS-COLOR-001 is vois/ds-color-001, LOOKALIKE-002 is vois/lookalike-002.
// - The detectors run once per file, the first time an enabled vois rule asks, and each rule reports only its own
//   findings. A detector runs only on the extensions it declares (scripts/registry.mjs). This plugin covers
//   .js, .jsx, .ts and .tsx; CSS and SCSS stay with the hook and the CI gate (ESLint does not parse them by default).
// - `configs.recommended` sets a rule to "error" when its severity in data/vois-rules.json is required, else "warn",
//   through check.mjs's severityOf, so the plugin and the gate never disagree on a rule's weight.
// - Waivers in .vois/config.json and team overrides in .vois/teams apply, read from the project root
//   (settings.vois.root, default ESLint's cwd) by the gate's own functions. Malformed config throws, so the lint run
//   fails instead of dropping a team's limits or waiving more than was agreed.

import { statSync } from "node:fs";
import { resolve } from "node:path";
import { detectFile } from "../scripts/detect.mjs";
import { RULES } from "../scripts/registry.mjs";
import { loadTeams, paramsFor } from "../scripts/team-overrides.mjs";
import { loadWaivers, severityOf, SKIP_DIRS, waived } from "../scripts/check.mjs";

// The vois-tokens version this plugin ships with. A test checks it against SKILL.md and skills.json.
const VERSION = "1.48.5";

/** The file extensions this plugin lints. CSS and SCSS are left to the hook and the CI gate. */
export const CODE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

/** The ESLint rule name (without the plugin prefix) for a detector id: DS-COLOR-001 becomes ds-color-001. */
export const ruleName = (id) => id.toLowerCase();

/** How many times the detectors have run, for the test that they run once per file, not once per rule. */
export const stats = { runs: 0 };

export class VoisConfigError extends Error {}

/**
 * The project root: settings.vois.root (resolved from ESLint's cwd) or the cwd. A wrong type, an unknown key or a
 * root that is not a folder throws: each would otherwise find no .vois folder and drop the waivers and team limits.
 */
function rootOf(context) {
  const s = context.settings?.vois;
  if (s === undefined) return context.cwd;
  if (s === null || typeof s !== "object" || Array.isArray(s)) throw new VoisConfigError("settings.vois must be an object, such as { root: \".\" }");
  const unknown = Object.keys(s).filter((k) => k !== "root");
  if (unknown.length) throw new VoisConfigError(`settings.vois has unknown keys (${unknown.join(", ")}); the only key is root`);
  if (s.root === undefined) return context.cwd;
  if (typeof s.root !== "string" || s.root.trim() === "") throw new VoisConfigError("settings.vois.root must be a non-empty path");
  const root = resolve(context.cwd, s.root);
  let folder = false;
  try { folder = statSync(root).isDirectory(); } catch { /* missing: not a folder */ }
  if (!folder) throw new VoisConfigError(`settings.vois.root ${s.root} is not a folder (resolved to ${root})`);
  return root;
}

// One SourceCode object per file per lint pass, shared by every rule that reads it.
const cache = new WeakMap();

function findingsFor(context) {
  const sourceCode = context.sourceCode;
  let byRule = cache.get(sourceCode);
  if (byRule) return byRule;
  const root = rootOf(context);
  const waivers = loadWaivers(root); // throws on a malformed .vois/config.json
  const teams = loadTeams(root, (name, why) => {
    throw new VoisConfigError(`${name ? `.vois/teams/${name}` : ".vois/teams"}: ${why}. A broken team setup would drop the team's tighter limits, so the lint run stops.`);
  });
  // The physical file is what waivers and team scopes name; the virtual name (a code block inside a Markdown file
  // through a processor) decides which detectors run, by its extension.
  const physical = resolve(context.cwd, context.physicalFilename);
  const text = sourceCode.text;
  const lines = text.split("\n");
  // Where each detector line starts. The detectors count lines by "\n" alone; ESLint also breaks lines at a lone
  // "\r", U+2028 and U+2029. Reporting by offset keeps a finding (and its disable comment) on the right line.
  const starts = [0];
  for (const l of lines) starts.push(starts[starts.length - 1] + l.length + 1);
  stats.runs++;
  byRule = new Map();
  for (const f of detectFile(context.filename, text, { params: paramsFor(teams, root, physical) })) {
    const known = Number.isInteger(f.line) && f.line >= 1 && f.line <= lines.length;
    const n = known ? f.line : 1; // a line the file does not have is reported on the first line, never dropped
    const range = [starts[n - 1], starts[n - 1] + lines[n - 1].replace(/\r$/, "").length];
    const finding = { ...f, file: physical, text: (lines[f.line - 1] ?? "").trim(), range };
    if (waived(waivers, finding, root)) continue;
    if (!byRule.has(f.ruleId)) byRule.set(f.ruleId, []);
    byRule.get(f.ruleId).push(finding);
  }
  cache.set(sourceCode, byRule);
  return byRule;
}

function eslintRule(rule) {
  return {
    meta: {
      type: "suggestion",
      docs: { description: `${rule.id}: ${rule.title}` }, // no url: the docs live in the skill, see references/hooks.md
      schema: [],
      messages: { finding: "{{text}}" },
    },
    create(context) {
      return {
        "Program:exit"() {
          const { sourceCode } = context;
          for (const f of findingsFor(context).get(rule.id) ?? []) {
            const text = f.fixHint && !f.message.includes(f.fixHint) ? `${f.message} ${f.fixHint}` : f.message;
            context.report({
              loc: { start: sourceCode.getLocFromIndex(f.range[0]), end: sourceCode.getLocFromIndex(f.range[1]) },
              messageId: "finding",
              data: { text },
            });
          }
        },
      };
    },
  };
}

const rules = Object.fromEntries(RULES.map((r) => [ruleName(r.id), eslintRule(r)]));

/** The ESLint level a rule gets in the recommended config, from its severity in data/vois-rules.json. */
export const levelOf = (id) => (severityOf(id) === "required" ? "error" : "warn");

/** A rule is in the recommended config when it reads at least one of the extensions this plugin lints. */
const lintsCode = (r) => r.extensions.some((e) => CODE_EXTENSIONS.includes(e));

const plugin = {
  meta: { name: "eslint-plugin-vois", version: VERSION },
  rules,
  configs: {},
};

plugin.configs.recommended = {
  name: "vois/recommended",
  files: ["**/*.{js,jsx,ts,tsx}"],
  // The folders the CI gate never walks (generated, vendored and tool output), so `eslint .` agrees with the gate.
  ignores: [...SKIP_DIRS].map((d) => `**/${d}/**`),
  plugins: { vois: plugin },
  rules: Object.fromEntries(RULES.filter(lintsCode).map((r) => [`vois/${ruleName(r.id)}`, levelOf(r.id)])),
};

export default plugin;
