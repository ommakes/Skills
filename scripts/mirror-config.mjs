// One definition of what the public repo mirrors from the private one. check-mirror.mjs checks it,
// port-from-private.mjs copies it. Change a list here and both follow.
import { execFileSync } from "node:child_process";

export const SHARED_CODE = [
  "vois-tokens/scripts/detect.mjs",
  "vois-tokens/scripts/registry.mjs",
  "vois-tokens/scripts/team-overrides.mjs",
  "vois-tokens/scripts/jsx-tags.mjs",
  "vois-tokens/scripts/css-blocks.mjs",
  "vois-tokens/scripts/grid-checks.mjs",
  // The ESLint plugin carries its own copy of the skill version, so a version bump has to reach it in both repos.
  "vois-tokens/eslint-plugin/index.mjs",
  "vois-tokens/eslint-plugin/index.test.mjs",
  "vois-tokens/eslint-plugin/package.json",
  // The retrieval pilot (prds/jit-retrieval.md): one build path, so both repos ship the same index and query tool.
  // The index is generated from the rule files checked below, so it matching here also means the links match.
  "vois-components/scripts/retrieval.mjs",
  "vois-components/scripts/query.mjs",
  "vois-components/scripts/retrieval.test.mjs",
  "vois-components/data/component-names.json",
  "vois-components/data/retrieval-index.json",
];


// Premium wording that is allowed to differ. Keep this list short. Each entry names the
// file, the rule ID (or the top-level key) and the fields that may differ.
export const ALLOWED = {
  "vois-dataviz/data/dataviz-rules.json": {
    "DV-IMPL-004": ["do", "rule"], // private: "Call vois_get_tokens"; public: standalone wording
  },
  "vois-dataviz/data/review-checklist.json": {
    "$top": ["loop_checklist", "description"], // vois-loop wiring exists only in private
  },
};


export const RULE_FILES = [
  "vois-tokens/data/vois-rules.json",
  "vois-patterns/data/patterns-rules.json",
  "vois-components/data/components-rules.json",
  "vois-dataviz/data/dataviz-rules.json",
];


export const MIRRORED_TREES = ["registry"];


// path -> git file mode, for every tracked file under `tree`. Null when git cannot list them.
export function trackedFiles(root, tree) {
  let out;
  try { out = execFileSync("git", ["-C", root, "ls-files", "-s", "-z", "--", tree], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); }
  catch { return null; }
  const files = new Map();
  for (const entry of out.split("\0")) {
    if (!entry) continue;
    const tab = entry.indexOf("\t");
    files.set(entry.slice(tab + 1), entry.split(" ")[0]);
  }
  return files;
}


export const STANDALONE_SKILLS = ["righter", "vois-components", "vois-dataviz", "vois-patterns", "vois-tokens"];

// Collect every object that carries a string "id", keyed by that id. A duplicate ID is an
// error: identity has to be unique inside a file.
export function collectById(node, out, file, dupes) {
  if (Array.isArray(node)) {
    for (const v of node) collectById(v, out, file, dupes);
  } else if (node && typeof node === "object") {
    if (typeof node.id === "string") {
      if (out.has(node.id)) dupes.push(node.id);
      out.set(node.id, node);
    }
    for (const v of Object.values(node)) collectById(v, out, file, dupes);
  }
}

export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, canonical(value[k])]),
    );
  }
  return value;
}

export function withoutFields(obj, fields) {
  const copy = { ...obj };
  for (const f of fields) delete copy[f];
  return copy;
}

export const WORDING_SWAPS = {
  "vois-dataviz/data/review-checklist.json": [
    [
      "what to fix first. Call vois_record_rule_usage for the rule ids that drove changes.",
      "what to fix first. If the vois_record_rule_usage tool is available, call it for the rule ids that drove changes.",
    ],
  ],
};


/**
 * True when the public and private text of a rule file say the same thing, allowing the named differences:
 * the fields in ALLOWED per rule id, the top-level keys under "$top", and the wording swaps. Content, not bytes.
 */
export function ruleFileEquivalent(rel, publicText, privateText, allowed = ALLOWED) {
  const allow = allowed[rel] ?? {};
  let priv = privateText;
  for (const [from, to] of WORDING_SWAPS[rel] ?? []) {
    if (priv.split(from).length - 1 !== 1) return false; // the swap must hit exactly once, as check-mirror requires
    priv = priv.replace(from, to);
  }
  let pub, prv;
  try { pub = JSON.parse(publicText); prv = JSON.parse(priv); } catch { return false; }
  if (allow.$top) return JSON.stringify(canonical(withoutFields(pub, allow.$top))) === JSON.stringify(canonical(withoutFields(prv, allow.$top)));
  const a = new Map(), b = new Map(), dupes = [];
  collectById(pub, a, rel, dupes); collectById(prv, b, rel, dupes);
  if (dupes.length || a.size !== b.size) return false;
  for (const [id, x] of a) {
    const y = b.get(id);
    if (!y) return false;
    const f = Object.hasOwn(allow, id) ? allow[id] : [];
    if (JSON.stringify(canonical(withoutFields(x, f))) !== JSON.stringify(canonical(withoutFields(y, f)))) return false;
  }
  return true;
}

/** True when the text is JSON whose ids are all unique: the shape a rule file must have before it is copied. */
export function validRuleFile(text) {
  try {
    const dupes = [];
    collectById(JSON.parse(text), new Map(), "", dupes);
    return dupes.length === 0;
  } catch { return false; }
}
