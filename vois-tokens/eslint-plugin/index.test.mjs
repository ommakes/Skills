// Run with: cd vois-tokens/eslint-plugin && npm ci --ignore-scripts && node --test index.test.mjs
// Uses the pinned ESLint and TypeScript parser from package.json, never the plugin's runtime (it has no dependencies).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Linter, RuleTester } from "eslint";
import tsParser from "@typescript-eslint/parser";
import vois, { CODE_EXTENSIONS, levelOf, ruleName, stats, VoisConfigError } from "./index.mjs";
import { SKIP_DIRS } from "../scripts/check.mjs";
import { RULES } from "../scripts/registry.mjs";
import { detectFile } from "../scripts/detect.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const JSON_RULES = (() => {
  const raw = JSON.parse(readFileSync(join(HERE, "../data/vois-rules.json"), "utf8"));
  return new Map((Array.isArray(raw) ? raw : raw.rules).map((r) => [r.id, r.severity]));
})();

const jsx = { parserOptions: { ecmaFeatures: { jsx: true } } };

/** A temporary project root holding the given files. */
function project(files = {}) {
  const root = mkdtempSync(join(tmpdir(), "vois-eslint-"));
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), typeof body === "string" ? body : JSON.stringify(body));
  }
  return root;
}

/** Lints `code` as `filename` (relative to `root`) with the recommended config plus `extra` config objects. */
function lint(code, filename, { root = project(), extra = [] } = {}) {
  const linter = new Linter({ cwd: root });
  const config = [
    { files: ["**/*.{js,jsx,mjs,cjs}", "**/*.css"], languageOptions: jsx },
    { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tsParser, ...jsx } },
    vois.configs.recommended,
    ...extra,
  ];
  return linter.verify(code, config, { filename: join(root, filename) });
}
const ids = (messages) => messages.map((m) => m.ruleId);
const fatal = (messages) => messages.filter((m) => m.fatal);

// ---- Rule set and configs ----

test("every detector id has exactly one ESLint rule, named by its lower-case id", () => {
  assert.deepEqual(Object.keys(vois.rules).sort(), RULES.map((r) => ruleName(r.id)).sort());
  assert.equal(new Set(RULES.map((r) => ruleName(r.id))).size, RULES.length, "two detector ids map to one rule name");
  assert.ok(vois.rules["ds-color-001"] && vois.rules["lookalike-002"] && vois.rules["ds-modal"]);
  for (const [name, rule] of Object.entries(vois.rules)) {
    assert.deepEqual(rule.meta.schema, [], `${name} takes no options`);
    assert.match(rule.meta.docs.description, /^(DS|LOOKALIKE)-/);
  }
});

test("recommended: required rules are errors and every other rule warns, as check.mjs's severityOf says", () => {
  const levels = vois.configs.recommended.rules;
  for (const r of RULES.filter((r) => r.extensions.some((e) => CODE_EXTENSIONS.includes(e)))) {
    assert.equal(levels[`vois/${ruleName(r.id)}`], levelOf(r.id), r.id);
  }
  // Read the JSON directly too, so a broken severityOf cannot make both sides agree on the wrong level.
  for (const [id, sev] of JSON_RULES) {
    const level = levels[`vois/${ruleName(id)}`];
    if (level === undefined) continue; // a rule with no detector, or a CSS-only detector
    assert.equal(level, sev === "required" ? "error" : "warn", id);
  }
  assert.equal(levels["vois/ds-color-001"], "error");
  assert.equal(levels["vois/ds-token-001"], "error");
  assert.equal(levels["vois/ds-icon-005"], "error");
  assert.equal(levels["vois/ds-modal"], "error", "DS-MODAL takes the strictest of the rules it covers");
  assert.equal(levels["vois/lookalike-002"], "warn", "lookalike checks have no JSON rule and count as recommended");
  assert.equal(levels["vois/ds-slop-002"], "warn");
  const warned = RULES.filter((r) => levels[`vois/${ruleName(r.id)}`] === "warn" && !/^(LOOKALIKE|DS-SLOP)-/.test(r.id));
  for (const r of warned) assert.notEqual(JSON_RULES.get(r.id), "required", r.id);
});

test("recommended leaves out only the CSS-only detectors, and lints only .js, .jsx, .ts and .tsx", () => {
  const listed = new Set(Object.keys(vois.configs.recommended.rules));
  const left = RULES.filter((r) => !listed.has(`vois/${ruleName(r.id)}`)).map((r) => r.id).sort();
  assert.deepEqual(left, ["DS-CSS-002", "DS-CSS-003", "DS-CSS-007"]);
  for (const id of left) assert.ok(RULES.find((r) => r.id === id).extensions.every((e) => e === ".css" || e === ".scss"), id);
  assert.deepEqual(vois.configs.recommended.files, ["**/*.{js,jsx,ts,tsx}"]);
  assert.deepEqual(vois.configs.recommended.ignores, [...SKIP_DIRS].map((d) => `**/${d}/**`));
  assert.equal(vois.configs.recommended.plugins.vois, vois);
});

test("the plugin version is the vois-tokens version in SKILL.md and skills.json", () => {
  const skills = JSON.parse(readFileSync(join(HERE, "../../skills.json"), "utf8"));
  const entry = (skills.skills ?? skills).find((s) => s.name === "vois-tokens");
  assert.equal(vois.meta.version, entry.version);
  assert.equal(vois.meta.version, /^version:\s*(\S+)/m.exec(readFileSync(join(HERE, "../SKILL.md"), "utf8"))[1]);
});

test("the flat config in references/hooks.md works as written", () => {
  // The same objects as the documented example, with the plugin imported from here.
  const config = [
    { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tsParser } },
    { files: ["**/*.{js,jsx,tsx}"], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
    vois.configs.recommended,
  ];
  const root = project();
  const run = (code, file) => new Linter({ cwd: root }).verify(code, config, { filename: join(root, file) });
  const tsx = 'export const A = (p: { n: number }) => <Button size="icon"><X /></Button>;\n';
  assert.deepEqual(run(tsx, "src/a.tsx").map((m) => m.ruleId), ["vois/ds-icon-005"]);
  assert.deepEqual(run('const A = () => <i className="animate-spin" />;\n', "src/a.jsx").map((m) => m.ruleId).sort(), ["vois/ds-animation-004", "vois/lookalike-002"]);
  // The documented disable comment, with a reason after --.
  const waived = '// eslint-disable-next-line vois/ds-color-001 -- brand color agreed with design\nconst brand = "#0a7cff";\n';
  assert.deepEqual(run(waived, "src/a.ts"), []);
  assert.deepEqual(run(waived.split("\n").slice(1).join("\n"), "src/a.ts").map((m) => m.ruleId), ["vois/ds-color-001"]);
  // JSX in a plain .js file parses too, so the detectors see it.
  assert.deepEqual(run('const A = () => <Button size="icon"><X /></Button>;\n', "src/App.js").map((m) => m.ruleId), ["vois/ds-icon-005"]);
});

// ---- RuleTester: valid and invalid cases ----

const tester = new RuleTester({ languageOptions: jsx });
const tsTester = new RuleTester({ languageOptions: { parser: tsParser, ...jsx } });

test("RuleTester: DS-COLOR-001", () => {
  tester.run("ds-color-001", vois.rules["ds-color-001"], {
    valid: [
      { code: 'const c = "var(--color-primary)";', filename: "src/a.jsx" },
      { code: "const css = `\n  --brand: #ff0000;\n`;", filename: "src/a.jsx" }, // a token definition line
    ],
    invalid: [
      {
        code: 'const a = 1;\nconst c = "#ff0000";',
        filename: "src/a.jsx",
        errors: [{ messageId: "finding", line: 2, column: 1, endLine: 2, endColumn: 21 }],
      },
    ],
  });
  const [m] = lint('const c = "#ff0000";', "src/a.js").filter((x) => x.ruleId === "vois/ds-color-001");
  assert.equal(m.severity, 2);
  assert.match(m.message, /^Hardcoded hex color — use a color token\. Use a color token \(e\.g\. var\(--color-\*\)/, "message then fix hint");
});

test("RuleTester: DS-TOKEN-001", () => {
  tester.run("ds-token-001", vois.rules["ds-token-001"], {
    valid: [
      { code: 'const A = () => <div className="bg-(--action-primary-resting)" />;', filename: "src/a.jsx" },
      { code: 'const s = { "--x": "var(--blue-9)" };', filename: "src/a.jsx" },
    ],
    invalid: [
      { code: 'const A = () => <div className="bg-(--blue-9)" />;', filename: "src/a.jsx", errors: [{ messageId: "finding", line: 1 }] },
    ],
  });
  tsTester.run("ds-token-001 (tsx)", vois.rules["ds-token-001"], {
    valid: [{ code: 'type P = { tone: string };\nexport const A = (p: P) => <div className="text-(--text-primary)" />;', filename: "src/a.tsx" }],
    invalid: [{ code: 'type P = { tone: string };\nexport const A = (p: P) => <div style={{ color: "var(--gray-12)" }} />;', filename: "src/a.tsx", errors: [{ messageId: "finding", line: 2 }] }],
  });
});

test("RuleTester: DS-ICON-005", () => {
  tsTester.run("ds-icon-005", vois.rules["ds-icon-005"], {
    valid: [
      { code: 'export const A = () => <Button size="icon" aria-label="Add to favorites"><Heart /></Button>;', filename: "src/a.tsx" },
      { code: 'export const A = () => <Button size="icon"><Heart /><span className="sr-only">Add</span></Button>;', filename: "src/a.tsx" },
    ],
    invalid: [
      {
        code: 'export const A = () => (\n  <Button size="icon">\n    <Heart />\n  </Button>\n);',
        filename: "src/a.tsx",
        errors: [{ messageId: "finding", line: 2 }],
      },
    ],
  });
});

test("RuleTester: LOOKALIKE-002", () => {
  tester.run("lookalike-002", vois.rules["lookalike-002"], {
    valid: [{ code: 'import { Spinner } from "./ui/spinner";\nconst A = () => <Loader className="animate-spin" />;', filename: "src/a.jsx" }],
    invalid: [{ code: 'const A = () => <i className="animate-spin" />;', filename: "src/a.jsx", errors: [{ messageId: "finding", line: 1 }] }],
  });
  const [m] = lint('const A = () => <i className="animate-spin" />;', "src/a.jsx").filter((x) => x.ruleId === "vois/lookalike-002");
  assert.equal(m.severity, 1, "lookalike checks warn");
  assert.match(m.message, /Use the Spinner component\./);
});

test("every finding is reported at the detector's line, with its message", () => {
  const code = 'const a = "#fff";\n\nconst A = () => <i className="animate-spin bg-(--blue-9)" />;\n';
  const want = detectFile("src/a.jsx", code).map((f) => [`vois/${ruleName(f.ruleId)}`, f.line]).sort();
  assert.ok(want.length >= 3);
  const got = lint(code, "src/a.jsx").map((m) => [m.ruleId, m.line]).sort();
  assert.deepEqual(got, want);
});

test("a line break ESLint counts and the detectors do not (U+2028, a lone CR) does not move a finding", () => {
  for (const sep of ["\u2028", "\u2029", "\r"]) {
    const code = `const s = "a";${sep}const t = 1;\nconst c = "#ff0000";\n`;
    const [m] = lint(code, "src/a.js").filter((x) => x.ruleId === "vois/ds-color-001");
    assert.equal(m.line, 3, JSON.stringify(sep));
    assert.equal(m.column, 1);
    const off = lint(`const s = "a";${sep}// eslint-disable-next-line vois/ds-color-001\nconst c = "#ff0000";\n`, "src/a.js");
    assert.deepEqual(ids(off), [], JSON.stringify(sep));
  }
  // Windows line endings: the line is reported without its "\r".
  const [m] = lint('const a = 1;\r\nconst c = "#ff0000";\r\n', "src/a.js");
  assert.deepEqual([m.line, m.column, m.endLine, m.endColumn], [2, 1, 2, 21]);
});

// ---- Disable comments ----

test("eslint-disable-next-line silences that rule on the next line only", () => {
  const code = '// eslint-disable-next-line vois/ds-color-001\nconst a = "#ff0000";\nconst b = "#00ff00";\n';
  assert.deepEqual(lint(code, "src/a.js").map((m) => [m.ruleId, m.line]), [["vois/ds-color-001", 3]]);
  // From the other side: disabling a different rule leaves this one on.
  const other = '// eslint-disable-next-line vois/ds-color-002\nconst a = "#ff0000";\n';
  // (ESLint also reports the directive itself as unused, with no rule id.)
  assert.deepEqual(ids(lint(other, "src/a.js")).filter(Boolean), ["vois/ds-color-001"]);
  // A block comment in JSX works too.
  const inJsx = 'const A = () => (\n  <div>\n    {/* eslint-disable-next-line vois/lookalike-002 */}\n    <i className="animate-spin" />\n  </div>\n);\n';
  assert.ok(!ids(lint(inJsx, "src/a.jsx")).includes("vois/lookalike-002"));
  assert.ok(ids(lint(inJsx.replace("eslint-disable-next-line", "note"), "src/a.jsx")).includes("vois/lookalike-002"));
});

test("rules can be turned off in config like any ESLint rule", () => {
  const off = { rules: { "vois/ds-color-001": "off" } };
  assert.deepEqual(ids(lint('const c = "#ff0000";', "src/a.js", { extra: [off] })), []);
});

// ---- Extensions ----

test("a detector does not run on a file type it does not declare", () => {
  // DS-ICON-005 declares code files only. The same JS, named .css or .mjs, is not read by it.
  const code = 'const A = () => <Button size="icon"><Heart /></Button>;\n';
  assert.deepEqual(ids(lint(code, "src/a.jsx")), ["vois/ds-icon-005"], "the guard's other side: it does run on .jsx");
  const everything = { rules: Object.fromEntries(Object.keys(vois.rules).map((n) => [`vois/${n}`, "error"])) };
  assert.deepEqual(ids(lint(code, "src/a.css", { extra: [{ files: ["**/*.css"], plugins: { vois }, ...everything }] })), []);
  assert.deepEqual(ids(lint(code, "src/a.mjs", { extra: [{ files: ["**/*.mjs"], plugins: { vois }, ...everything }] })), []);
  // DS-CSS-002 declares CSS only. CSS text inside a .tsx file is not read by it, even with the rule on.
  const css = "#main {\n  color: red;\n}\n";
  assert.ok(detectFile("a.css", css).some((f) => f.ruleId === "DS-CSS-002"), "the guard's other side: it fires on .css");
  const tsx = `export const styles = \`\n${css}\`;\n`;
  assert.deepEqual(ids(lint(tsx, "src/a.tsx", { extra: [{ rules: { "vois/ds-css-002": "error" } }] })).filter((r) => r === "vois/ds-css-002"), []);
  // DS-COLOR-001 declares CSS and code: a .css file is still not linted, because recommended lists only code files.
  assert.deepEqual(ids(lint('const c = "#ff0000";', "src/a.css")), []);
});

test("recommended skips the folders the CI gate skips, and only those", () => {
  const code = 'const c = "#ff0000";\n';
  for (const dir of ["dist", "build", ".next", "vendor", "node_modules"]) {
    // (For node_modules ESLint itself reports the file as ignored, with no rule id.)
    assert.deepEqual(ids(lint(code, `${dir}/a.js`)).filter(Boolean), [], dir);
    assert.deepEqual(ids(lint(code, `packages/web/${dir}/assets/a.js`)).filter(Boolean), [], `nested ${dir}`);
  }
  // From the other side: a name that only contains a skipped folder's name is still linted.
  for (const file of ["src/distance.js", "src/builder/a.js", "dist.js"]) assert.deepEqual(ids(lint(code, file)), ["vois/ds-color-001"], file);
});

// ---- Performance ----

test("the detectors run once per file, however many rules are on", () => {
  const before = stats.runs;
  const messages = lint('const a = "#fff";\nconst A = () => <i className="animate-spin" />;\n', "src/a.jsx");
  assert.ok(messages.length >= 2);
  assert.equal(stats.runs - before, 1);
  lint('const a = 1;\n', "src/b.jsx");
  assert.equal(stats.runs - before, 2, "a second file is a second run");
});

// ---- Waivers and team overrides ----

const HEX = 'const c = "#fafafa";\nconst d = "#000000";\n';

test("waivers in .vois/config.json apply, as in the CI gate", () => {
  const byRule = project({ ".vois/config.json": { ignoredRules: ["DS-COLOR-001"] } });
  assert.deepEqual(ids(lint(HEX, "src/a.js", { root: byRule })), []);
  const byFile = project({ ".vois/config.json": { ignoredFiles: ["src/legacy/**"] } });
  assert.deepEqual(ids(lint(HEX, "src/legacy/a.js", { root: byFile })), []);
  assert.equal(lint(HEX, "src/a.js", { root: byFile }).length, 2, "a file glob waives only the files it names");
  const byValue = project({ ".vois/config.json": { ignoredValues: { "DS-COLOR-001": ["#fafafa"] } } });
  assert.deepEqual(lint(HEX, "src/a.js", { root: byValue }).map((m) => m.line), [2], "a value waives only lines that contain it");
  // `enabled: false` is the hook's switch, not the plugin's.
  const off = project({ ".vois/config.json": { enabled: false } });
  assert.equal(lint(HEX, "src/a.js", { root: off }).length, 2);
});

test("a malformed waiver config stops the lint run instead of waiving more", () => {
  for (const cfg of ["{ not json", "[]", '{"ignoredRules":"DS-COLOR-001"}', '{"ignoredFiles":[""]}', '{"ignoredValues":{"DS-COLOR-001":[""]}}']) {
    const root = project({ ".vois/config.json": cfg });
    assert.throws(() => lint(HEX, "src/a.js", { root }), /\.vois\/config\.json/, cfg);
  }
});

const team = (name, overrides, scope) => ({ schema: "vois-team-override/1", team: name, ...(scope ? { scope: { paths: scope } } : {}), overrides });
const restrict = (rule, param, value) => ({ id: "x-001", op: "restrict", rule, param, value, reason: "Because this team needs it." });
const ICON = 'import { Heart } from "lucide-react";\nexport const A = () => <Heart size={24} />;\n';

test("team overrides tighten limits for the files in their scope", () => {
  const root = project({ ".vois/teams/pay.json": team("pay", [restrict("DS-ICON-002", "icon_sizes_px", [16, 20])], ["apps/pay/**"]) });
  const inScope = lint(ICON, "apps/pay/a.jsx", { root });
  assert.deepEqual(ids(inScope), ["vois/ds-icon-002"]);
  assert.match(inScope[0].message, /limit set by the pay team/);
  assert.deepEqual(ids(lint(ICON, "apps/web/a.jsx", { root })), [], "outside the scope the base sizes apply");
  // From the other side: a team cannot loosen a limit. 24 is in the base set; 12 is not, and stays a finding.
  const loose = project({ ".vois/teams/x.json": team("x", [restrict("DS-ICON-002", "icon_sizes_px", [12, 16, 20, 24, 32])]) });
  assert.deepEqual(ids(lint(ICON.replace("24", "12"), "src/a.jsx", { root: loose })), ["vois/ds-icon-002"]);
});

test("a malformed team file stops the lint run instead of dropping the team's limits", () => {
  for (const body of ["{ not json", '{"schema":"other"}', JSON.stringify({ ...team("t", []), scope: { paths: [] } })]) {
    const root = project({ ".vois/teams/t.json": body });
    assert.throws(() => lint(ICON, "src/a.jsx", { root }), /\.vois\/teams\/t\.json/, body);
  }
});

test("the lint run names the real reason a team setup is broken", () => {
  const good = restrict("DS-ICON-002", "icon_sizes_px", [16, 20]);
  const cases = [
    [{ ".vois/teams/t.json": '{"schema":"other"}' }, /\.vois\/teams\/t\.json: not a vois-team-override\/1 file/],
    [{ ".vois/teams/t.json": JSON.stringify({ ...team("t", []), scope: { paths: [] } }) }, /scope must be/],
    [{ ".vois/teams/t.json": JSON.stringify(team("t", [{ ...good, op: "restrct" }])) }, /override x-001 ignored: op "restrct"/],
    [{ ".vois/teams/t.json": JSON.stringify(team("t", [{ ...good, rule: "DS-ICON-0002" }])) }, /DS-ICON-0002/],
    [{ ".vois/teams/t.json": JSON.stringify(team("t", [{ ...good, param: "icon_size_px" }])) }, /icon_size_px/],
    [{ ".vois/teams": "not a folder" }, /\.vois\/teams.*cannot be read/],
  ];
  for (const [files, want] of cases) {
    const root = project(files);
    assert.throws(() => lint(ICON, "src/a.jsx", { root }), want, JSON.stringify(files));
    assert.throws(() => lint(ICON, "src/a.jsx", { root }), (e) => e instanceof VoisConfigError && !/invalid JSON/.test(e.message), JSON.stringify(files));
  }
  // From the other side: a limit the detectors cannot check, and a value looser than the base, are not errors.
  const quiet = project({ ".vois/teams/t.json": team("t", [restrict("DS-TYPOGRAPHY-001", "max_text_styles", 2), restrict("DS-ICON-002", "icon_sizes_px", [12, 16, 20, 24, 32])]) });
  assert.deepEqual(ids(lint(ICON, "src/a.jsx", { root: quiet })), []);
});

test("settings.vois.root names the project root; a wrong type stops the run", () => {
  const parent = project({ "app/.vois/config.json": { ignoredRules: ["DS-COLOR-001"] }, "app/src/a.js": "" });
  assert.equal(lint(HEX, "app/src/a.js", { root: parent }).length, 2, "the cwd has no config");
  assert.deepEqual(ids(lint(HEX, "app/src/a.js", { root: parent, extra: [{ settings: { vois: { root: "app" } } }] })), []);
  for (const vois of [null, "app", [], { root: 1 }, { root: "" }, { root: "  " }, { Root: "app" }, { root: "app", extra: 1 }, { root: "ap" }, { root: "app/src/a.js" }]) {
    assert.throws(() => lint(HEX, "app/src/a.js", { root: parent, extra: [{ settings: { vois } }] }), /settings\.vois/, JSON.stringify(vois));
  }
  assert.ok(new VoisConfigError("x") instanceof Error);
});

test("a TypeScript file parses with the TypeScript parser and is checked", () => {
  const code = 'interface P { open: boolean }\nexport function A({ open }: P): JSX.Element {\n  return <Button size="icon"><X /></Button>;\n}\n';
  const messages = lint(code, "src/a.tsx");
  assert.deepEqual(fatal(messages), []);
  assert.deepEqual(ids(messages), ["vois/ds-icon-005"]);
  assert.deepEqual(fatal(lint('const n: number = 1;\nconst c = "#123456";\n', "src/a.ts")), []);
  assert.deepEqual(ids(lint('const n: number = 1;\nconst c = "#123456";\n', "src/a.ts")), ["vois/ds-color-001"]);
});
