// Tests for check-registry.mjs. Each guard gets an input that should pass and inputs that try to get past it.
// Run: node registry/scripts/check-registry.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, symlinkSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pathProblem, checkRegistryJson, cssProblems, mappingProblems, ruleSection, versionProblems, checkRegistry, kindAt, token005Table, tableProblems, definedTokens, tokenRefProblems, motionProblems, pendingLogProblems, starterBlock, MAPPINGS, SHADCN_VARS, TOKENS_FILE } from "./check-registry.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repo = resolve(registryDir, "..");
const block = (body) => `:root:root,\n.dark.dark {\n${body}\n}\n`;
const css = (text, seen) => cssProblems(text, { seen });
const good = "--destructive: var(--base-negative);\n--ring: var(--border-state-focus);";

test("the committed registry passes", () => {
  assert.deepEqual(checkRegistry(registryDir), []);
});

// ---- Paths ----

test("paths: relative, forward slashes, no dot segments, under the prefix", () => {
  assert.equal(pathProblem("vois/theme/a.css", { prefix: "vois/" }), null);
  assert.equal(pathProblem("src/styles/a.css"), null);
  for (const bad of ["", "/vois/a.css", "C:/vois/a.css", "c:\\vois\\a.css", "vois\\a.css", "./vois/a.css", "vois/../a.css", "vois//a.css", "vois/./a.css"]) {
    assert.notEqual(pathProblem(bad, { prefix: "vois/" }), null, bad);
  }
  assert.notEqual(pathProblem("other/a.css", { prefix: "vois/" }), null);
  assert.notEqual(pathProblem("voisx/a.css", { prefix: "vois/" }), null, "a prefix match must end at a slash");
  // Targets have no prefix, so only these guards stop a Windows or absolute target.
  assert.match(pathProblem("src\\styles\\a.css"), /backslash/);
  assert.match(pathProblem("C:/styles/a.css"), /absolute/);
  assert.match(pathProblem("/src/a.css"), /absolute/);
  assert.notEqual(pathProblem(null), null);
  assert.notEqual(pathProblem(42), null);
});

// ---- registry.json ----

const file = (path, target) => ({ path, type: "registry:file", ...(target ? { target } : {}) });
const item = (over = {}) => ({ name: "vois-theme", type: "registry:theme", files: [file("vois/theme/a.css", "src/styles/a.css")], ...over });
const reg = (items) => ({ name: "vois", items });
const kind = () => "file";
const problems = (r, k = kind) => checkRegistryJson(r, { kind: k }).problems;

test("registry.json: a good item passes and its file is accepted", () => {
  const { problems: p, accepted } = checkRegistryJson(reg([item()]), { kind });
  assert.deepEqual(p, []);
  assert.deepEqual(accepted.map(({ file: f }) => f.path), ["vois/theme/a.css"]);
});

test("registry.json: bad shapes fail closed", () => {
  assert.ok(problems(null).length);
  assert.ok(problems([]).length);
  assert.ok(problems({ name: "vois" }).length, "no items");
  assert.ok(problems({ name: "vois", items: [] }).length, "empty items");
  assert.ok(problems({ name: "other", items: [item()] }).length, "wrong registry name");
  assert.ok(problems(reg([null])).length);
});

test("registry.json: names are kebab-case and unique", () => {
  for (const name of ["Vois-Theme", "vois_theme", "-vois", "vois-", "vois--theme", "", 7]) {
    assert.ok(problems(reg([item({ name })])).length, String(name));
  }
  const two = reg([item(), item({ files: [file("vois/theme/b.css", "src/styles/b.css")] })]);
  assert.match(problems(two).join("\n"), /duplicate name/);
});

test("registry.json: unknown item types fail", () => {
  for (const type of ["registry:nope", "theme", "", undefined, "REGISTRY:THEME"]) {
    assert.ok(problems(reg([item({ type })])).length, String(type));
  }
});

test("registry.json: files must be listed, unique, regular and safe", () => {
  assert.ok(problems(reg([item({ files: [] })])).length);
  assert.ok(problems(reg([item({ files: "vois/a.css" })])).length);
  const dup = reg([item(), item({ name: "other", files: [file("vois/theme/a.css", "src/styles/b.css")] })]);
  assert.match(problems(dup).join("\n"), /listed twice/);
  assert.match(problems(reg([item()]), () => null).join("\n"), /does not exist/);
  assert.match(problems(reg([item()]), () => "symlink").join("\n"), /goes through a symlink/);
  assert.match(problems(reg([item()]), () => "other").join("\n"), /not a regular file/);
  assert.ok(problems(reg([item({ files: [file("../secrets.css", "src/a.css")] })])).length);
  assert.ok(problems(reg([item({ files: [file("vois/a.css", "../../etc/a.css")] })])).length);
  assert.ok(problems(reg([item({ files: [{ path: "vois/a.css", type: "file" }] })])).length);
});

test("registry.json: source paths are one file whatever their case", () => {
  const cased = reg([item({ files: [file("vois/theme/a.css", "src/a.css")] }), item({ name: "other", files: [file("vois/Theme/a.css", "src/b.css")] })]);
  assert.match(problems(cased).join("\n"), /listed twice/);
});

test("registry.json: two files cannot install to the same target, whatever the case", () => {
  const same = reg([item({ files: [file("vois/a.css", "src/styles/x.css")] }), item({ name: "other", files: [file("vois/b.css", "src/styles/x.css")] })]);
  assert.match(problems(same).join("\n"), /target src\/styles\/x\.css is used by another file/);
  const cased = reg([item({ files: [file("vois/a.css", "src/styles/x.css"), file("vois/b.css", "src/styles/X.css")] })]);
  assert.match(problems(cased).join("\n"), /used by another file/);
  const apart = reg([item({ files: [file("vois/a.css", "src/styles/a.css"), file("vois/b.css", "src/styles/b.css")] })]);
  assert.deepEqual(problems(apart), []);
});

test("registry.json: a registry:file needs a target; other file types may leave it out", () => {
  assert.match(problems(reg([item({ files: [file("vois/a.css")] })])).join("\n"), /needs a target/);
  assert.deepEqual(problems(reg([item({ type: "registry:ui", files: [{ path: "vois/button/button.tsx", type: "registry:ui" }] })])), []);
});

test("registry.json: only safe paths are accepted for the later checks", () => {
  const r = reg([item({ files: [file("vois/a.css", "src/a.css"), file("../x.css", "src/x.css"), null, file("vois\\b.css", "src/b.css")] })]);
  assert.deepEqual(checkRegistryJson(r, { kind }).accepted.map(({ file: f }) => f.path), ["vois/a.css"]);
  assert.deepEqual(checkRegistryJson(null, { kind }).accepted, []);
});

// ---- CSS ----

test("css: the two mapped variables pass, with comments and line breaks anywhere", () => {
  const text = `/* top { ; } */\n:root:root,\n  .dark.dark {\n  /* why */ --destructive: var(--base-negative);\n  --ring:var(--border-state-focus)\n}\n`;
  assert.deepEqual(css(text), []);
});

test("css: each variable must point at exactly the token its rule names", () => {
  assert.equal(SHADCN_VARS.size, 32);
  assert.match(css(block("--ring: var(--base-negative);")).join(), /must be exactly var\(--border-state-focus\) \(DS-TOKEN-005\)/);
  assert.match(css(block("--destructive: var(--base-positive);")).join(), /must be exactly var\(--base-negative\) \(DS-TOKEN-005\)/);
  for (const value of ["oklch(0.58 0.22 27)", "#ff0000", "var(--base-negative, red)", "var( --base-negative )", "calc(var(--base-negative))", "var(--base-negative) var(--border-default)", "var(--Base-Negative)", ""]) {
    assert.ok(css(block(`--destructive: ${value};`)).length, value);
  }
});

test("css: a shadcn variable not in MAPPINGS yet cannot be mapped", () => {
  assert.match(css(block("--sidebar: var(--bg-subtle);")).join(), /--sidebar: not in MAPPINGS yet/);
  assert.match(css(block("--chart-1: var(--blue-9);")).join(), /--chart-1: not in MAPPINGS yet/);
  assert.match(css(block("--radius: var(--radii-6);")).join(), /must be exactly var\(--radii-8\)/, "a mapped variable pointed at the wrong token");
  // An object built-in name is not a shadcn variable, so it never reaches the MAPPINGS lookup.
  assert.match(css(block("--constructor: var(--base-negative);")).join(), /not one of shadcn's theme variables/);
});

test("css: the left side must be one of shadcn's theme variables", () => {
  assert.match(css(block("--destrutive: var(--base-negative);")).join(), /not one of shadcn's theme variables/);
  assert.match(css(block("--color-destructive: var(--base-negative);")).join(), /not one of shadcn's theme variables/);
  assert.match(css(block("--destructive-foreground: var(--base-negative);")).join(), /not one of shadcn's/, "not a v4 variable");
});

test("css: a variable is mapped once, in one block, across blocks and across files", () => {
  assert.match(css(block("--destructive: var(--base-negative);\n--destructive: var(--base-negative);")).join(), /mapped more than once/);
  assert.match(css(block("--ring: var(--border-state-focus);") + block("--ring: var(--border-state-focus);")).join(), /mapped more than once/);
  const seen = new Set();
  assert.deepEqual(css(block("--ring: var(--border-state-focus);"), seen), []);
  assert.match(css(block("--ring: var(--border-state-focus);"), seen).join(), /mapped more than once/);
});

test("css: only the mapping block, no nesting, no stray text", () => {
  assert.ok(css(`:root:root { ${good} }`).length, "without .dark.dark a dark section reads shadcn's value");
  assert.ok(css(`:root { ${good} }`).length, "plain :root loses to shadcn's later block");
  assert.ok(css(`.dark.dark, :root:root { ${good} }`).length, "order is fixed");
  assert.ok(css(`@theme inline { ${good} }`).length);
  assert.ok(css(`:root :root, .dark.dark { ${good} }`).length, "a descendant selector is not the same selector");
  assert.ok(css(`@media (x) { ${block(good)} }`).length);
  assert.match(css(`:root:root, .dark.dark { .x { ${good} } }`).join(), /nested block/);
  assert.ok(css(block(good) + "@import 'x.css';").length);
  assert.ok(css(`:root:root, .dark.dark { ${good}`).length, "unclosed");
  assert.ok(css(block("color: red;")).length, "not a custom property");
  assert.ok(css(block("--Destructive: var(--base-negative);")).length, "uppercase name");
  assert.ok(css("").length, "empty file");
  assert.ok(css("/* only a comment */").length);
});

test("css: a very long line is still checked, not skipped", () => {
  const long = `--destructive: ${"var(--base-negative)".repeat(5000)};`;
  assert.ok(css(block(long)).length);
});

// ---- Mappings stay backed by their rules ----

test("each mapping's rule still names its token", () => {
  assert.deepEqual(mappingProblems(repo), []);
});

test("a mapping whose rule does not name the token, or does not exist, fails", () => {
  assert.match(mappingProblems(repo, { ring: { token: "--base-negative", rule: "DS-A11Y-002" } }).join(), /no longer names --base-negative/);
  assert.match(mappingProblems(repo, { ring: { token: "--border-state-focus", rule: "DS-COLOR-009" } }).join(), /no longer names --border-state-focus/);
  assert.match(mappingProblems(repo, { ring: { token: "--border-state-focus", rule: "DS-NOPE-001" } }).join(), /not in vois-rules\.json/);
  // A longer token that starts with the same text does not count.
  assert.match(mappingProblems(repo, { destructive: { token: "--base-negative-x", rule: "DS-COLOR-009" } }).join(), /no longer names/);
  assert.match(mappingProblems(repo, { destructive: { token: "--base-neg", rule: "DS-COLOR-009" } }).join(), /no longer names/);
  assert.match(mappingProblems("/nonexistent").join(), /vois-rules\.json/);
  // --hit-area-min is in accessibility.md, but in DS-A11Y-001's section, not DS-A11Y-002's. The near
  // boundary (the paragraph right after a rule's code block) is covered by the ruleSection test below.
  assert.match(mappingProblems(repo, { ring: { token: "--hit-area-min", rule: "DS-A11Y-002" } }).join(), /no longer names --hit-area-min/);
});

test("ruleSection is the tag's paragraph plus the code block right under it", () => {
  const src = "intro\n\nUse this for rings: `[DS-X-001]`\n\n```css\n.a { outline: var(--t-one); }\n```\n\nNext paragraph var(--t-two).\n";
  const sec = ruleSection(src, src.indexOf("[DS-X-001]"));
  assert.match(sec, /--t-one/);
  assert.doesNotMatch(sec, /--t-two/);
  assert.doesNotMatch(sec, /intro/);
  const noBlock = "a\n\nRule text `[DS-X-002]` names --t-three.\n\nOther --t-four.";
  const s2 = ruleSection(noBlock, noBlock.indexOf("[DS-X-002]"));
  assert.match(s2, /--t-three/);
  assert.doesNotMatch(s2, /--t-four/);
});

// ---- Paths on disk ----

test("kindAt reports a symlinked parent folder, not just a symlinked file", { skip: process.platform === "win32" }, () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-kind-"));
  try {
    mkdirSync(join(dir, "real/theme"), { recursive: true });
    writeFileSync(join(dir, "real/theme/a.css"), "x");
    mkdirSync(join(dir, "reg"));
    symlinkSync(join(dir, "real"), join(dir, "reg/vois"));
    assert.equal(kindAt(join(dir, "reg"), "vois/theme/a.css"), "symlink");
    assert.equal(kindAt(join(dir, "real"), "theme/a.css"), "file");
    assert.equal(kindAt(join(dir, "real"), "theme"), "other");
    assert.equal(kindAt(join(dir, "real"), "theme/missing.css"), null);
    assert.equal(kindAt(join(dir, "real"), "theme/a.css/deeper"), null, "a file in the middle of a path");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---- Whole registry, on a copy with one change ----

function withCopy(edit) {
  const dir = mkdtempSync(join(tmpdir(), "vois-registry-"));
  try {
    cpSync(join(repo, "vois-tokens"), join(dir, "vois-tokens"), { recursive: true });
    // Skip installed and built folders by their place in registry/, not by a word anywhere in the path.
    cpSync(registryDir, join(dir, "registry"), { recursive: true, filter: (p) => !/^(node_modules|public)([\\/]|$)/.test(relative(registryDir, p)) });
    edit(join(dir, "registry"), dir);
    return checkRegistry(join(dir, "registry"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const addItem = (r, entry) => {
  const regPath = join(r, "registry.json");
  const json = JSON.parse(readFileSync(regPath, "utf8"));
  json.items.push(entry);
  writeFileSync(regPath, JSON.stringify(json));
};

test("whole registry: a file no item lists fails", () => {
  const out = withCopy((r) => { mkdirSync(join(r, "vois/stray"), { recursive: true }); writeFileSync(join(r, "vois/stray/x.css"), "a {}"); });
  assert.match(out.join("\n"), /vois\/stray\/x\.css: not part of any item/);
});

test("whole registry: a detector finding fails", () => {
  const out = withCopy((r) => {
    addItem(r, { name: "bad-file", type: "registry:ui", files: [{ path: "vois/bad/bad.tsx", type: "registry:ui" }] });
    mkdirSync(join(r, "vois/bad"), { recursive: true });
    writeFileSync(join(r, "vois/bad/bad.tsx"), "export const X = () => <div style={{ color: '#ff0000' }} />;\n");
  });
  assert.match(out.join("\n"), /DS-COLOR-001/);
});

test("whole registry: a file type the detector does not read fails", () => {
  const out = withCopy((r) => {
    addItem(r, { name: "colors", type: "registry:lib", files: [{ path: "vois/lib/colors.mjs", type: "registry:lib" }] });
    mkdirSync(join(r, "vois/lib"), { recursive: true });
    writeFileSync(join(r, "vois/lib/colors.mjs"), "export const red = '#ff0000';\n");
  });
  assert.match(out.join("\n"), /vois\/lib\/colors\.mjs: the vois-tokens detector does not read this file type/);
});

test("whole registry: CSS in any item, with any case of extension, gets the CSS check", () => {
  const out = withCopy((r) => {
    addItem(r, { name: "sneaky", type: "registry:file", files: [file("vois/sneaky/values.CSS", "src/styles/values.css")] });
    mkdirSync(join(r, "vois/sneaky"), { recursive: true });
    writeFileSync(join(r, "vois/sneaky/values.CSS"), ":root { --base-negative: oklch(0.58 0.22 27); }\n");
  });
  assert.match(out.join("\n"), /vois\/sneaky\/values\.CSS: only ":root:root, \.dark\.dark \{ \}" blocks/);
});

test("whole registry: two files mapping the same variable fail", () => {
  const out = withCopy((r) => {
    addItem(r, { name: "second-theme", type: "registry:theme", files: [file("vois/second/t.css", "src/styles/t.css")] });
    mkdirSync(join(r, "vois/second"), { recursive: true });
    writeFileSync(join(r, "vois/second/t.css"), block("--destructive: var(--base-negative);"));
  });
  assert.match(out.join("\n"), /--destructive: mapped more than once/);
});

test("whole registry: symlinks are reported, not followed", { skip: process.platform === "win32" }, () => {
  const out = withCopy((r, root) => {
    symlinkSync("..", join(r, "vois/loop")); // a loop that would recurse forever if followed
    writeFileSync(join(root, "outside.css"), block("--destructive: var(--base-negative);"));
    mkdirSync(join(r, "vois/linked"), { recursive: true });
    symlinkSync(join(root, "outside.css"), join(r, "vois/linked/a.css"));
    addItem(r, { name: "linked", type: "registry:file", files: [file("vois/linked/a.css", "src/styles/linked.css")] });
  });
  const text = out.join("\n");
  assert.match(text, /vois\/loop: is a symlink/);
  assert.match(text, /vois\/linked\/a\.css is or goes through a symlink/);
});

test("whole registry: the vois folder itself as a symlink fails", { skip: process.platform === "win32" }, () => {
  const out = withCopy((r, root) => {
    renameSync(join(r, "vois"), join(root, "elsewhere"));
    symlinkSync(join(root, "elsewhere"), join(r, "vois"));
  });
  const text = out.join("\n");
  assert.match(text, /vois: is a symlink/);
  assert.match(text, /vois\/theme\/vois-theme\.css is or goes through a symlink/);
});

test("whole registry: a mapping whose rule is gone fails", () => {
  const out = withCopy((r, root) => {
    const p = join(root, "vois-tokens/data/vois-rules.json");
    const data = JSON.parse(readFileSync(p, "utf8"));
    const list = Array.isArray(data) ? data : data.rules;
    list.splice(list.findIndex((x) => x.id === "DS-TOKEN-005"), 1);
    writeFileSync(p, JSON.stringify(data));
  });
  assert.match(out.join("\n"), /MAPPINGS\.ring: rule DS-TOKEN-005 is not in vois-rules\.json/);
});

test("whole registry: a broken registry.json fails", () => {
  const out = withCopy((r) => writeFileSync(join(r, "registry.json"), "{ not json"));
  assert.match(out.join("\n"), /registry\.json:/);
});

test("version: package.json matches the newest CHANGELOG entry", () => {
  const log = "# Changelog\n\n## [0.2.0] - 2026-12-01\n\n- x\n\n## [0.1.0] - 2026-11-13\n";
  assert.deepEqual(versionProblems('{"version":"0.2.0"}', log), []);
  assert.match(versionProblems('{"version":"0.1.0"}', log).join(), /not the newest CHANGELOG\.md entry \(0\.2\.0\)/);
  assert.match(versionProblems('{"name":"x"}', log).join(), /version must be x\.y\.z/);
  assert.match(versionProblems('{"version":"v0.2.0"}', log).join(), /version must be x\.y\.z/);
  assert.match(versionProblems('{"version":"0.2.0"}', "# Changelog\n").join(), /no `## \[x\.y\.z\]` entry/);
  assert.match(versionProblems('{"version":"0.2.0"}', null).join(), /no `## \[x\.y\.z\]` entry/);
  assert.match(versionProblems("{ nope", log).join(), /package\.json:/);
  // A version in body text, not a heading, does not count.
  assert.match(versionProblems('{"version":"0.2.0"}', "Moved to [0.2.0] later\n## [0.1.0]\n").join(), /\(0\.1\.0\)/);
});

test("whole registry: a version that does not match the CHANGELOG fails", () => {
  const out = withCopy((r) => {
    const p = join(r, "package.json");
    const before = readFileSync(p, "utf8");
    // A version no release can have yet, so the test does not break each time the real version moves.
    const after = before.replace(/"version": "\d+\.\d+\.\d+"/, '"version": "99.0.0"');
    assert.notEqual(after, before, "the test must actually change the version");
    writeFileSync(p, after);
  });
  assert.match(out.join("\n"), /package\.json version 99\.0\.0 is not the newest/);
});

// ---- DS-TOKEN-005 table and generated tokens ----

const md5 = (rows) => `# x\n\n## shadcn/ui variables \`[DS-TOKEN-005]\`\n\n| shadcn | Vois token |\n|---|---|\n${rows.map(([a, b]) => `| \`${a}\` | \`${b}\` |`).join("\n")}\n\nAfter the table.\n\n## Next section\n\n| \`ring\` | \`--outside\` |\n`;

test("the DS-TOKEN-005 table in figma-variables.md equals MAPPINGS", () => {
  const { problems, table } = token005Table(readFileSync(join(repo, "vois-tokens/references/figma-variables.md"), "utf8"));
  assert.deepEqual(problems, []);
  assert.deepEqual(tableProblems(table), []);
  assert.equal(Object.keys(table).length, Object.keys(MAPPINGS).length);
});

test("token005Table reads only its own section, and fails closed", () => {
  const { table } = token005Table(md5([["ring", "--border-state-focus"]]));
  assert.deepEqual(table, { ring: "--border-state-focus" }, "a row in the next section is not part of the table");
  assert.match(token005Table("# nothing here").problems.join(), /no \[DS-TOKEN-005\] section/);
  assert.match(token005Table(md5([])).problems.join(), /has no rows/);
  assert.match(token005Table(md5([["ring", "--a"], ["ring", "--b"]])).problems.join(), /lists ring twice/);
  assert.deepEqual(token005Table(md5([["ring", "--border-state-focus"]]).replace(/\n/g, "\r\n")).table, { ring: "--border-state-focus" }, "CRLF line endings");
});

test("tableProblems: MAPPINGS and the table must agree both ways", () => {
  const m = { ring: { token: "--border-state-focus" } };
  assert.deepEqual(tableProblems({ ring: "--border-state-focus" }, m), []);
  assert.match(tableProblems({ ring: "--other" }, m).join(), /MAPPINGS\.ring: --border-state-focus, but the DS-TOKEN-005 table says --other/);
  assert.match(tableProblems({}, m).join(), /MAPPINGS\.ring: not in the DS-TOKEN-005 table/);
  assert.match(tableProblems({ ring: "--border-state-focus", card: "--bg-card" }, m).join(), /DS-TOKEN-005 maps card, but MAPPINGS does not/);
});

test("definedTokens reads declarations, not uses", () => {
  assert.deepEqual([...definedTokens(":root {\n  --a: 1px;\n  --b: var(--c);\n}\n")].sort(), ["--a", "--b"]);
});

test("whole registry: a theme that drops a mapping fails", () => {
  const out = withCopy((r) => { const p = join(r, "vois/theme/vois-theme.css"); writeFileSync(p, readFileSync(p, "utf8").replace("  --ring: var(--border-state-focus);\n", "")); });
  assert.match(out.join("\n"), /MAPPINGS\.ring: no theme file maps --ring/);
});

test("whole registry: a stale token file fails", () => {
  const out = withCopy((r) => { const p = join(r, TOKENS_FILE); writeFileSync(p, readFileSync(p, "utf8").replace("--bg-card: var(--white);", "--bg-card: var(--black);")); });
  assert.match(out.join("\n"), /vois\/tokens\/vois-tokens\.css: not what build-tokens\.mjs writes/);
});

test("whole registry: missing or broken token sources fail, they never skip the check", () => {
  const gone = withCopy((r) => rmSync(join(r, "source/brand-default.json")));
  assert.match(gone.join("\n"), /token build:/);
  const leak = withCopy((r) => {
    const p = join(r, "source/figma-export.json");
    writeFileSync(p, readFileSync(p, "utf8").replace('"--base-brand": null', '"--base-brand": "=--goldie-7"'));
  });
  assert.match(leak.join("\n"), /token build: brand slot --base-brand has a value in the export/);
});

test("whole registry: a mapping to a token that is not generated fails", () => {
  const out = withCopy((r) => {
    const p = join(r, "source/figma-export.json");
    writeFileSync(p, readFileSync(p, "utf8").replace('  "--bg-subtle": ["=--warm-gray-1","=--warm-gray-11"],\n', ""));
    const css = join(r, TOKENS_FILE);
    writeFileSync(css, readFileSync(css, "utf8"));
  });
  assert.match(out.join("\n"), /MAPPINGS\.muted: --bg-subtle is not a generated token/);
});

test("MAPPINGS only names shadcn variables", () => {
  for (const name of Object.keys(MAPPINGS)) assert.ok(SHADCN_VARS.has(name), name);
});

// ---- Token reads in component files ----

const known = new Set(["--size-36", "--border-state-focus", "--action-primary-resting"]);
const refs = (t) => tokenRefProblems(t, known);

test("token reads: generated tokens pass in every read form", () => {
  assert.deepEqual(refs('h-[var(--size-36)] outline-[var(--border-state-focus)]'), []);
  assert.deepEqual(refs('h-(--size-36) bg-(--action-primary-resting)'), [], "Tailwind (--x) shorthand");
  assert.deepEqual(refs('style={{ height: "var( --size-36 )" }}'), [], "space inside var(");
  assert.deepEqual(refs('calc(var(--size-36) + 4px)'), [], "inside calc");
  assert.deepEqual(refs('no tokens here'), []);
});

test("token reads: a token that is not generated fails, whatever the read form", () => {
  for (const t of ['h-[var(--hit-area-min)]', 'min-h-(--hit-area-min)', 'duration-[var(--motion-duration-fast)]', 'style={{ minHeight: "var(--hit-area-min)" }}']) {
    assert.equal(refs(t).length, 1, t);
  }
  assert.match(refs('h-[var(--hit-area-min)]')[0], /--hit-area-min/);
});

test("token reads: names compare exactly, never by prefix or case", () => {
  assert.equal(refs('h-[var(--Size-36)]').length, 1, "case");
  assert.equal(refs('h-[var(--size-3)]').length, 1, "a prefix of a real token");
  assert.equal(refs('h-[var(--size-360)]').length, 1, "a real token as a prefix");
});

test("token reads: a fallback does not excuse a missing token", () => {
  assert.equal(refs('duration-[var(--motion-duration-fast,150ms)]').length, 1);
});

test("token reads: a name the file defines itself passes; a definition elsewhere in a value does not", () => {
  assert.deepEqual(refs('[--btn-h:var(--size-36)] h-(--btn-h)'), [], "Tailwind arbitrary property");
  assert.deepEqual(refs('style={{ "--btn-h": "var(--size-36)", height: "var(--btn-h)" }}'), [], "style key");
  assert.equal(refs('h-(--btn-h)').length, 1, "read with no definition");
  assert.equal(refs('h-[var(--a)] [x:var(--a)]').length, 1, "var(--a) inside a value is a read, not a definition");
});

test("token reads: comments count, so a stale name in a comment fails too", () => {
  assert.equal(refs('// uses var(--hit-area-min)\nconst a = 1').length, 1);
});

test("token reads: each missing name is reported once, with the line of its first read", () => {
  const out = refs('a\nh-[var(--x-y)]\nw-[var(--x-y)]');
  assert.equal(out.length, 1);
  assert.match(out[0], /^2: /);
});

test("whole registry: a component file that reads a missing token fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-reg-"));
  try {
    cpSync(registryDir, dir, { recursive: true, filter: (p) => !p.includes("node_modules") });
    mkdirSync(join(dir, "vois/probe"), { recursive: true });
    writeFileSync(join(dir, "vois/probe/probe.tsx"), 'export const c = "min-h-[var(--not-a-vois-token)]";\n');
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    reg.items.push({ name: "probe", type: "registry:ui", title: "Probe", description: "test", files: [{ path: "vois/probe/probe.tsx", type: "registry:ui" }] });
    writeFileSync(join(dir, "registry.json"), JSON.stringify(reg, null, 2));
    // checkRegistry reads the skill folders from the copy's parent (the temp dir), so checks that need them
    // report "missing" here. Only the probe's own message is asserted.
    const out = checkRegistry(dir);
    assert.ok(out.some((p) => /probe\.tsx:1: reads --not-a-vois-token/.test(p)), out.join("\n"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---- Motion tokens equal the animation.md starter block ----

const anim = (body) => `# Animation\n\n### Starter token file\n\nText.\n\n\`\`\`css\n:root {\n${body}\n}\n\`\`\`\n\n\`\`\`ts\nconst x = 1;\n\`\`\`\n`;
const motionCss = (body) => `/* generated */\n:root {\n${body}\n}\n`;

test("motion: equal names and values pass, with comments and spacing ignored", () => {
  const md = anim("  --motion-duration-fast: 150ms; /* small */\n  --motion-ease-standard: cubic-bezier(.165, .84, .44, 1);");
  assert.deepEqual(motionProblems(motionCss("  --motion-ease-standard: cubic-bezier(.165,  .84, .44, 1);\n  --motion-duration-fast: 150ms;"), md), []);
});

test("motion: a value, a missing token or an extra token fails, from both sides", () => {
  const md = anim("  --motion-duration-fast: 150ms;\n  --motion-duration-base: 250ms;");
  assert.equal(motionProblems(motionCss("  --motion-duration-fast: 160ms;\n  --motion-duration-base: 250ms;"), md).length, 1, "value differs");
  assert.equal(motionProblems(motionCss("  --motion-duration-fast: 150ms;"), md).length, 1, "generated is missing one");
  assert.equal(motionProblems(motionCss("  --motion-duration-fast: 150ms;\n  --motion-duration-base: 250ms;\n  --motion-x: 1px;"), md).length, 1, "generated has an extra");
  assert.equal(motionProblems(motionCss("  --motion-duration-fast: 150ms;\n  --motion-duration-base: 250ms;"), md.replace("150ms", "15ms")).length, 1, "the doc changed");
});

test("motion: a missing or empty starter block fails, it never passes by default", () => {
  assert.equal(motionProblems(motionCss("  --motion-duration-fast: 150ms;"), "# no block here").length, 1);
  assert.equal(motionProblems(motionCss("  --motion-duration-fast: 150ms;"), anim("")).length, 1);
  assert.equal(starterBlock("### Starter token file\n\n```ts\nx\n```"), null, "only a css block counts");
  assert.equal(starterBlock("### Starter token file\n\nNo block.\n\n## Other\n\n```css\n:root { --motion-x: 1ms; }\n```"), null, "a css block in a later section does not count");
  assert.match(starterBlock("### Starter token file\n\n```css\n:root { --motion-x: 1ms; }\n```\n"), /--motion-x/);
});

test("motion: the real animation.md starter block is what motion-tokens.css holds", () => {
  const md = readFileSync(join(repo, "vois-tokens/references/animation.md"), "utf8");
  assert.deepEqual(motionProblems(readFileSync(join(registryDir, "vois/tokens/motion-tokens.css"), "utf8"), md), []);
});

// ---- FIGMA-TODO.md lists every pending token ----

test("pending log: every add and change name must be listed as `--name`", () => {
  const pending = { format: 1, add: { "--size-36": 36 }, change: { "--size-action-large": { from: 1, to: 2 } } };
  assert.deepEqual(pendingLogProblems(pending, "| `--size-36` | x |\n| `--size-action-large` | y |"), []);
  assert.equal(pendingLogProblems(pending, "| `--size-36` | x |").length, 1, "change not listed");
  assert.equal(pendingLogProblems(pending, "--size-36 and --size-action-large in plain text").length, 2, "must be in backticks");
  assert.equal(pendingLogProblems(pending, "`--size-360` `--size-action-large`").length, 1, "a longer name does not count");
  assert.deepEqual(pendingLogProblems({ format: 1 }, ""), [], "nothing pending, nothing to list");
});

test("whole registry: a pending token missing from FIGMA-TODO.md fails, and a missing log fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-reg-"));
  try {
    cpSync(registryDir, dir, { recursive: true, filter: (p) => !p.includes("node_modules") });
    // A token Figma doesn't have yet, pending but not listed in the log.
    writeFileSync(join(dir, "source/figma-pending.json"), JSON.stringify({ format: 1, add: { "--size-probe-999": 999 }, change: {} }));
    assert.ok(checkRegistry(dir).some((p) => /does not list --size-probe-999/.test(p)));
    rmSync(join(dir, "FIGMA-TODO.md"));
    assert.ok(checkRegistry(dir).some((p) => /FIGMA-TODO\.md: missing/.test(p)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("whole registry: a stale or hand-edited motion-tokens.css fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "vois-reg-"));
  try {
    cpSync(registryDir, dir, { recursive: true, filter: (p) => !p.includes("node_modules") });
    const f = join(dir, "vois/tokens/motion-tokens.css");
    writeFileSync(f, readFileSync(f, "utf8").replace("150ms", "151ms"));
    assert.ok(checkRegistry(dir).some((p) => /motion-tokens\.css: not what build-tokens\.mjs writes/.test(p)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("whole registry: a stale shape-tokens.css, a bad shape.json, or a missing shape item file fails", () => {
  const run = (edit) => {
    const dir = mkdtempSync(join(tmpdir(), "vois-reg-"));
    try { cpSync(registryDir, dir, { recursive: true, filter: (p) => !p.includes("node_modules") }); edit(dir); return checkRegistry(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
  };
  const stale = run((dir) => { const f = join(dir, "vois/tokens/shape-tokens.css"); writeFileSync(f, readFileSync(f, "utf8").replace("4cqi", "5cqi")); });
  assert.ok(stale.some((p) => /shape-tokens\.css: not what build-tokens\.mjs writes/.test(p)), stale.join("\n"));
  const badSource = run((dir) => { const f = join(dir, "source/shape.json"); writeFileSync(f, readFileSync(f, "utf8").replace('"type": "capsule"', '"type": "blob"')); });
  assert.ok(badSource.some((p) => /shape build: .*unknown type/.test(p)), badSource.join("\n"));
  const unlisted = run((dir) => { const f = join(dir, "registry.json"); const j = JSON.parse(readFileSync(f, "utf8")); const it = j.items.find((i) => i.name === "vois-tokens"); it.files = it.files.filter((x) => !x.path.endsWith("shape-tokens.css")); writeFileSync(f, JSON.stringify(j, null, 2)); });
  assert.ok(unlisted.some((p) => /shape-tokens\.css/.test(p)), "a shape-tokens.css that no item lists is a problem: " + unlisted.join("\n"));
});

test("token reads: a definition inside a comment does not vouch for a read", () => {
  assert.equal(refs('h-[var(--fake)]\n// --fake: 1px').length, 1, "line comment");
  assert.equal(refs('h-[var(--fake)]\n/* --fake: 1px */').length, 1, "block comment");
  assert.deepEqual(refs('[--fake:var(--size-36)] h-[var(--fake)]'), [], "a real definition still counts");
});

test("token reads: Radix runtime properties pass by exact prefix, lookalikes fail", () => {
  assert.deepEqual(refs("max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width)"), []);
  for (const t of ["w-(--radixselect-width)", "w-(--Radix-select-width)", "w-(--x-radix-select)", "w-(--radix_select)", "w-(--radix-select-trigger-widht)", "w-(--radix-select-trigger-width-x)", "w-(--radix-popover-trigger-width)"]) assert.equal(refs(t).length, 1, t);
});
