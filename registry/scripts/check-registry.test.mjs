// Tests for check-registry.mjs. Each guard gets an input that should pass and inputs that try to get past it.
// Run: node registry/scripts/check-registry.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, symlinkSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pathProblem, checkRegistryJson, cssProblems, mappingProblems, ruleSection, checkRegistry, kindAt, MAPPINGS, SHADCN_VARS } from "./check-registry.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repo = resolve(registryDir, "..");
const block = (body) => `:root:root,\n.dark.dark {\n${body}\n}\n`;
const css = (text, seen) => cssProblems(text, { seen });
const good = "--destructive: var(--color-negative);\n--ring: var(--color-focus-ring);";

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
  const text = `/* top { ; } */\n:root:root,\n  .dark.dark {\n  /* why */ --destructive: var(--color-negative);\n  --ring:var(--color-focus-ring)\n}\n`;
  assert.deepEqual(css(text), []);
});

test("css: each variable must point at exactly the token its rule names", () => {
  assert.equal(SHADCN_VARS.size, 32);
  assert.match(css(block("--ring: var(--color-negative);")).join(), /must be exactly var\(--color-focus-ring\) \(DS-A11Y-002\)/);
  assert.match(css(block("--destructive: var(--color-positive);")).join(), /must be exactly var\(--color-negative\) \(DS-COLOR-009\)/);
  for (const value of ["oklch(0.58 0.22 27)", "#ff0000", "var(--color-negative, red)", "var( --color-negative )", "calc(var(--color-negative))", "var(--color-negative) var(--color-border)", "var(--Color-Negative)", ""]) {
    assert.ok(css(block(`--destructive: ${value};`)).length, value);
  }
});

test("css: a shadcn variable with no Vois rule cannot be mapped yet", () => {
  assert.match(css(block("--card: var(--color-surface);")).join(), /no Vois rule names a token for it yet/);
  assert.match(css(block("--radius: var(--radius-md);")).join(), /no Vois rule names a token/);
  // An object built-in name is not a shadcn variable, so it never reaches the MAPPINGS lookup.
  assert.match(css(block("--constructor: var(--color-negative);")).join(), /not one of shadcn's theme variables/);
});

test("css: the left side must be one of shadcn's theme variables", () => {
  assert.match(css(block("--destrutive: var(--color-negative);")).join(), /not one of shadcn's theme variables/);
  assert.match(css(block("--color-destructive: var(--color-negative);")).join(), /not one of shadcn's theme variables/);
  assert.match(css(block("--destructive-foreground: var(--color-negative);")).join(), /not one of shadcn's/, "not a v4 variable");
});

test("css: a variable is mapped once, in one block, across blocks and across files", () => {
  assert.match(css(block("--destructive: var(--color-negative);\n--destructive: var(--color-negative);")).join(), /mapped more than once/);
  assert.match(css(block("--ring: var(--color-focus-ring);") + block("--ring: var(--color-focus-ring);")).join(), /mapped more than once/);
  const seen = new Set();
  assert.deepEqual(css(block("--ring: var(--color-focus-ring);"), seen), []);
  assert.match(css(block("--ring: var(--color-focus-ring);"), seen).join(), /mapped more than once/);
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
  assert.ok(css(block("--Destructive: var(--color-negative);")).length, "uppercase name");
  assert.ok(css("").length, "empty file");
  assert.ok(css("/* only a comment */").length);
});

test("css: a very long line is still checked, not skipped", () => {
  const long = `--destructive: ${"var(--color-negative)".repeat(5000)};`;
  assert.ok(css(block(long)).length);
});

// ---- Mappings stay backed by their rules ----

test("each mapping's rule still names its token", () => {
  assert.deepEqual(mappingProblems(repo), []);
});

test("a mapping whose rule does not name the token, or does not exist, fails", () => {
  assert.match(mappingProblems(repo, { ring: { token: "--color-negative", rule: "DS-A11Y-002" } }).join(), /no longer names --color-negative/);
  assert.match(mappingProblems(repo, { ring: { token: "--color-focus-ring", rule: "DS-COLOR-009" } }).join(), /no longer names --color-focus-ring/);
  assert.match(mappingProblems(repo, { ring: { token: "--color-focus-ring", rule: "DS-NOPE-001" } }).join(), /not in vois-rules\.json/);
  // A longer token that starts with the same text does not count.
  assert.match(mappingProblems(repo, { destructive: { token: "--color-negative-x", rule: "DS-COLOR-009" } }).join(), /no longer names/);
  assert.match(mappingProblems(repo, { destructive: { token: "--color-neg", rule: "DS-COLOR-009" } }).join(), /no longer names/);
  assert.match(mappingProblems("/nonexistent").join(), /vois-rules\.json/);
  // --color-border-focus is in accessibility.md, but in the :focus-within example, not DS-A11Y-002's own section.
  assert.match(mappingProblems(repo, { ring: { token: "--color-border-focus", rule: "DS-A11Y-002" } }).join(), /no longer names --color-border-focus/);
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
    writeFileSync(join(r, "vois/sneaky/values.CSS"), ":root { --color-negative: oklch(0.58 0.22 27); }\n");
  });
  assert.match(out.join("\n"), /vois\/sneaky\/values\.CSS: only ":root:root, \.dark\.dark \{ \}" blocks/);
});

test("whole registry: two files mapping the same variable fail", () => {
  const out = withCopy((r) => {
    addItem(r, { name: "second-theme", type: "registry:theme", files: [file("vois/second/t.css", "src/styles/t.css")] });
    mkdirSync(join(r, "vois/second"), { recursive: true });
    writeFileSync(join(r, "vois/second/t.css"), block("--destructive: var(--color-negative);"));
  });
  assert.match(out.join("\n"), /--destructive: mapped more than once/);
});

test("whole registry: symlinks are reported, not followed", { skip: process.platform === "win32" }, () => {
  const out = withCopy((r, root) => {
    symlinkSync("..", join(r, "vois/loop")); // a loop that would recurse forever if followed
    writeFileSync(join(root, "outside.css"), block("--destructive: var(--color-negative);"));
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
    list.splice(list.findIndex((x) => x.id === "DS-A11Y-002"), 1);
    writeFileSync(p, JSON.stringify(data));
  });
  assert.match(out.join("\n"), /MAPPINGS\.ring: rule DS-A11Y-002 is not in vois-rules\.json/);
});

test("whole registry: a broken registry.json fails", () => {
  const out = withCopy((r) => writeFileSync(join(r, "registry.json"), "{ not json"));
  assert.match(out.join("\n"), /registry\.json:/);
});

test("MAPPINGS only names shadcn variables", () => {
  for (const name of Object.keys(MAPPINGS)) assert.ok(SHADCN_VARS.has(name), name);
});
