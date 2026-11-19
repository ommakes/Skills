// Tests for check.mjs, the CI gate. Each guard gets an input that should pass and inputs that try to get past it.
// Run: node vois-tokens/scripts/check.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  severityOf, fails, collectFiles, loadWaivers, waived, readBaseline, baselineOf, compare, keyOf,
  run, main, parseArgs, formatGithub, summaryMarkdown, InputError, BASELINE_SCHEMA, LEVELS,
} from "./check.mjs";
import { isFileIgnored } from "./hook-lib.mjs";

const HEX = 'export const A = () => <div className="text-[#ff0000]">a</div>;\n'; // DS-COLOR-001, required
const PALETTE = 'export const B = () => <div className="bg-(--blue-9)">b</div>;\n'; // DS-TOKEN-001, required
const CLICK = "export const C = () => <div onClick={go}>c</div>;\n"; // LOOKALIKE-005, recommended
const CLEAN = 'export const D = () => <div className="bg-(--bg-card)">d</div>;\n';

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "vois-check-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}
const cli = (root, args) => {
  const out = [];
  const err = [];
  const cwd = process.cwd();
  process.chdir(root);
  try {
    const code = main(args, { stdout: (s) => out.push(s), stderr: (s) => err.push(s) });
    return { code, out: out.join("\n"), err: err.join("\n") };
  } finally {
    process.chdir(cwd);
  }
};

// ---- Severity ----

test("severity comes from the rule's JSON entry", () => {
  assert.equal(severityOf("DS-COLOR-001"), "required");
  assert.equal(severityOf("DS-TOKEN-001"), "required");
  assert.equal(severityOf("DS-GRID-007"), JSON.parse(readFileSync(new URL("../data/vois-rules.json", import.meta.url))).rules.find((r) => r.id === "DS-GRID-007").severity);
});

test("a detector that covers other rules takes the strictest of them", () => {
  assert.equal(severityOf("DS-MODAL"), "required"); // covers DS-MODAL-001 and -002
});

test("heuristics without a JSON rule are recommended; any other unknown id is required (fails closed)", () => {
  assert.equal(severityOf("LOOKALIKE-005"), "recommended");
  assert.equal(severityOf("DS-SLOP-002"), "recommended");
  for (const id of ["DS-NEW-001", "LOOKALIKE-", "LOOKALIKE-5x", "DS-SLOP", "", "constructor", "__proto__"]) assert.equal(severityOf(id), "required", id);
});

test("fails: a level fails at its own threshold and every looser one", () => {
  assert.ok(fails("required", "required") && fails("required", "preferred"));
  assert.ok(!fails("recommended", "required") && fails("recommended", "recommended"));
  assert.ok(!fails("preferred", "recommended") && fails("preferred", "preferred"));
  assert.deepEqual(LEVELS, ["required", "recommended", "preferred"]);
});

// ---- Files ----

test("folders are walked; generated, vendored and tool folders are skipped; only detector file types count", () => {
  const root = project({
    "src/a.tsx": HEX, "src/deep/b.css": ".a{}", "src/c.md": "# no", "src/d.json": "{}",
    "node_modules/x/a.tsx": HEX, "dist/a.css": ".a{}", ".next/a.js": "x", ".vois/a.tsx": HEX, ".vois-tools/a.tsx": HEX,
  });
  try {
    const files = collectFiles([root], root).map((f) => f.slice(root.length + 1).split("\\").join("/"));
    assert.deepEqual(files, ["src/a.tsx", "src/deep/b.css"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("a missing path, a path outside the root, an unsupported file or nothing to check is an error, never a pass", () => {
  const root = project({ "src/a.tsx": HEX, "readme.md": "x", "empty/.keep": "" });
  const outside = project({ "x.tsx": HEX });
  const cwd = process.cwd();
  process.chdir(root);
  try {
    assert.throws(() => collectFiles(["nope"], root), InputError);
    assert.throws(() => collectFiles(["readme.md"], root), /not a file type/);
    assert.throws(() => collectFiles(["empty"], root), /no files to check/);
    assert.throws(() => collectFiles([join(outside, "x.tsx")], root), /outside --root/);
    assert.throws(() => collectFiles(["../"], root), /outside --root/);
  } finally {
    process.chdir(cwd);
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("symbolic links are not followed, so a link cannot pull outside files in or loop", () => {
  const root = project({ "src/a.tsx": CLEAN });
  const outside = project({ "x.tsx": HEX });
  try {
    symlinkSync(outside, join(root, "src", "linked"));
    symlinkSync(join(root, "src"), join(root, "src", "loop"));
    const files = collectFiles([root], root);
    assert.equal(files.length, 1);
    assert.throws(() => collectFiles([join(root, "src", "linked")], root), /symbolic link/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

// ---- Waivers ----

test("the shared hook config waives rules, files and values; local config and the on/off switch do not", () => {
  const root = project({
    "src/a.tsx": HEX, "src/legacy/b.tsx": PALETTE, "src/c.tsx": 'export const E = () => <i className="text-[#fafafa]" />;\n',
    ".vois/config.json": JSON.stringify({ enabled: false, ignoredFiles: ["src/legacy/**"], ignoredValues: { "DS-COLOR-001": ["#fafafa"] } }),
    ".vois/config.local.json": JSON.stringify({ ignoredRules: ["DS-COLOR-001"] }),
  });
  try {
    const r = run({ root, paths: [root] });
    assert.deepEqual(r.gating.map((f) => `${f.file} ${f.ruleId}`), ["src/a.tsx DS-COLOR-001"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("a malformed waiver config is an error, never 'waive everything'", () => {
  for (const cfg of [
    "{ not json",
    "[]",
    "null",
    JSON.stringify({ ignoredRules: "DS-COLOR-001" }), // a string would make includes() a substring test
    JSON.stringify({ ignoredFiles: "src/**" }),
    JSON.stringify({ ignoredFiles: [""] }),
    JSON.stringify({ ignoredFiles: [3] }),
    JSON.stringify({ ignoredValues: { "DS-COLOR-001": "#fff" } }),
    JSON.stringify({ ignoredValues: { "DS-COLOR-001": [""] } }), // "" is inside every snippet
    JSON.stringify({ ignoredValues: [] }),
  ]) {
    const root = project({ "src/a.tsx": HEX, ".vois/config.json": cfg });
    try {
      assert.throws(() => loadWaivers(root), InputError, cfg);
      assert.equal(cli(root, ["src"]).code, 2, cfg);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }
});

test("ignore globs are read by the hook's own matcher, so the hook and the gate agree", () => {
  const root = "/proj";
  const at = (glob, file) => waived({ ignoredRules: [], ignoredFiles: [glob], ignoredValues: {} }, { ruleId: "X", file, text: "", message: "" }, root);
  for (const [glob, file] of [["src/legacy/**", "src/legacy/a/b.tsx"], ["src/legacy", "src/legacy/a.tsx"], ["src/{old,legacy}/*.tsx", "src/legacy/a.tsx"], ["./src/legacy/**", "src/legacy/a.tsx"], ["src/*.tsx", "src/a/b.tsx"], ["../x/**", "src/a.tsx"]]) {
    assert.equal(at(glob, file), isFileIgnored({ ignoredFiles: [glob] }, file, root), `${glob} on ${file}`);
  }
  assert.ok(at("src/legacy/**", "src/legacy/a/b.tsx"));
  assert.ok(at("./src/legacy/**", "src/legacy/a.tsx"), "a leading ./ is dropped");
  assert.ok(at("src\\legacy\\**", "src/legacy/a.tsx"), "a backslash counts as /");
  assert.ok(!at("src/*.tsx", "src/a/b.tsx"), "* stays inside a folder");
  assert.ok(!at("src/a.tsx", "src/aXtsx"), "a dot is literal");
  assert.ok(!at("legacy/**", "src/legacy/a.tsx"), "anchored at the root");
  assert.ok(!waived({ ignoredRules: [], ignoredFiles: [], ignoredValues: {} }, { ruleId: "X", file: "a.tsx", text: "", message: "" }, root), "no globs waive nothing");
});

test("an ignored value is matched against the line, never the message", () => {
  const w = { ignoredRules: [], ignoredFiles: [], ignoredValues: { "DS-TOKEN-001": ["Use"], "DS-COLOR-001": ["#fafafa"] } };
  const msg = "Global palette step --blue-9 used directly. Use the System or Component token that aliases it.";
  assert.ok(!waived(w, { ruleId: "DS-TOKEN-001", file: "a.tsx", text: '<i className="bg-(--blue-9)" />', message: msg }, "/p"), "a word in the message waives nothing");
  assert.ok(waived(w, { ruleId: "DS-COLOR-001", file: "a.tsx", text: '<i className="text-[#fafafa]" />', message: "Hardcoded hex color" }));
  assert.ok(!waived(w, { ruleId: "DS-TOKEN-001", file: "a.tsx", text: "#fafafa", message: "" }), "a value waives only its own rule");
});

test("a malformed team override file fails the gate instead of dropping the team's limits", () => {
  for (const team of ["{ broken", JSON.stringify({ schema: "vois-team-override/1", team: "pay", overrides: [], scope: { paths: [] } }), JSON.stringify({ schema: "other" })]) {
    const root = project({ "src/a.tsx": CLEAN, ".vois/teams/pay.json": team });
    try {
      const r = cli(root, ["src"]);
      assert.equal(r.code, 2, team);
      assert.match(r.err, /\.vois\/teams\/pay\.json/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }
});

test("a folder whose name starts with two dots is inside the root", () => {
  const root = project({ "..generated/a.tsx": HEX });
  try {
    assert.equal(collectFiles([join(root, "..generated")], root).length, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---- Baseline ----

test("a baseline must have the schema and well-formed entries", () => {
  for (const bad of [null, [], {}, { schema: "other/1", findings: [] }, { schema: BASELINE_SCHEMA }, { schema: BASELINE_SCHEMA, findings: {} },
    { schema: BASELINE_SCHEMA, findings: [{ rule: "A", file: "b" }] }, { schema: BASELINE_SCHEMA, findings: [{ rule: 1, file: "b", text: "c" }] }, { schema: BASELINE_SCHEMA, findings: [{ rule: "A", file: "b", snippet: "c" }] }, { schema: BASELINE_SCHEMA, findings: [null] }]) {
    assert.throws(() => readBaseline(bad), InputError, JSON.stringify(bad));
  }
  assert.equal(readBaseline({ schema: BASELINE_SCHEMA, findings: [] }).size, 0);
});

test("baseline matching counts duplicates: two identical lines need two entries", () => {
  const f = { ruleId: "DS-COLOR-001", file: "a.tsx", text: "x", line: 1 };
  const g = { ...f, line: 9 };
  const known = readBaseline(baselineOf([f]));
  const { added, fixed } = compare([f, g], known);
  assert.equal(added.length, 1, "the second copy is new");
  assert.equal(fixed, 0);
  assert.equal(compare([], known).fixed, 1);
  assert.equal(keyOf(f), keyOf(g), "the line number is not part of the identity");
  assert.notEqual(keyOf(f), keyOf({ ...f, file: "b.tsx" }));
});

// ---- CLI ----

test("exit 1 on a new required finding, 0 when clean, and --fail-on widens the gate", () => {
  const root = project({ "src/a.tsx": HEX, "src/c.tsx": CLICK, "src/d.tsx": CLEAN });
  try {
    assert.equal(cli(root, ["src"]).code, 1);
    assert.equal(cli(root, ["src/c.tsx", "src/d.tsx"]).code, 0, "a recommended finding does not fail by default");
    assert.equal(cli(root, ["--fail-on", "recommended", "src/c.tsx"]).code, 1);
    assert.equal(cli(root, ["src/d.tsx"]).code, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("two long lines that share their first 160 characters are different findings", () => {
  const prefix = "x".repeat(170);
  const root = project({ "src/a.tsx": `const a = "${prefix}1"; <i className="text-[#ff0000]" />;\n` });
  try {
    assert.equal(cli(root, ["--baseline", "b.json", "--update", "src"]).code, 0);
    writeFileSync(join(root, "src", "a.tsx"), `const a = "${prefix}2"; <i className="text-[#ff0000]" />;\n`);
    assert.equal(cli(root, ["--baseline", "b.json", "src"]).code, 1, "an edited long line is a new finding");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("--update writes a baseline that makes the same tree pass, and a new finding still fails", () => {
  const root = project({ "src/a.tsx": HEX, "src/c.tsx": CLICK });
  try {
    assert.equal(cli(root, ["--baseline", "b.json", "src"]).code, 2, "a missing baseline is an error");
    assert.equal(cli(root, ["--baseline", "b.json", "--update", "src"]).code, 0);
    const written = JSON.parse(readFileSync(join(root, "b.json"), "utf8"));
    assert.equal(written.schema, BASELINE_SCHEMA);
    assert.equal(written.findings.length, 2, "every finding, so --fail-on can be tightened later");
    const pass = cli(root, ["--baseline", "b.json", "src"]);
    assert.equal(pass.code, 0);
    assert.doesNotMatch(pass.out, /fixed since/, "a baselined note that is still there is not fixed");
    assert.equal(cli(root, ["--baseline", "b.json", "--fail-on", "recommended", "src"]).code, 0, "the note is baselined too");
    writeFileSync(join(root, "src", "e.tsx"), PALETTE);
    assert.equal(cli(root, ["--baseline", "b.json", "src"]).code, 1);
    writeFileSync(join(root, "b.json"), "{ broken");
    assert.equal(cli(root, ["--baseline", "b.json", "src"]).code, 2);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("bad options exit 2", () => {
  const root = project({ "src/a.tsx": CLEAN });
  try {
    for (const args of [[], ["--fail-on", "warn", "src"], ["--fail-on"], ["--format", "xml", "src"], ["--update", "src"], ["--nope", "src"], ["--root"], ["--baseline", "--update", "src"]]) {
      assert.equal(cli(root, args).code, 2, JSON.stringify(args));
    }
    assert.throws(() => parseArgs(["--fail-on", "Required", "src"]), InputError, "levels are exact");
    assert.deepEqual(parseArgs(["--fail-on", "recommended", "--", "--odd", "src"]).paths, ["--odd", "src"], "after -- every argument is a path");
    assert.equal(parseArgs(["--", "src"]).failOn, "required");
    assert.equal(cli(root, ["--"]).code, 2, "-- with no paths is still nothing to check");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("GitHub annotations: new failures are errors, the rest warnings, and file text cannot break the command", () => {
  const f = { ruleId: "DS-COLOR-001", level: "required", file: "src/a,b:c%.tsx", line: 3, message: "bad\n::error::x", fixHint: "fix", snippet: "", text: "" };
  const k = { ...f, file: "k.tsx" };
  const r = { all: [f, k], gating: [f, k], added: [f], fixed: 0, failOn: "required", files: 2, fresh: (x) => x === f };
  const out = formatGithub(r).split("\n");
  assert.equal(out.length, 2, "a newline in a message cannot start a second command");
  assert.match(out[0], /^::error file=src\/a%2Cb%3Ac%25\.tsx,line=3,title=DS-COLOR-001 \(required\)::bad%0A::error::x fix$/);
  assert.match(out[1], /^::warning file=k\.tsx/);
  const md = summaryMarkdown({ ...r, all: [f], gating: [f] });
  assert.doesNotMatch(md, /bad\n/, "the summary keeps each finding on one row");
});

test("the format json report marks which findings are new", () => {
  const root = project({ "src/a.tsx": HEX });
  try {
    const { code, out } = cli(root, ["--format", "json", "src"]);
    assert.equal(code, 1);
    const j = JSON.parse(out);
    assert.equal(j.verdict, "FAIL");
    assert.equal(j.findings[0].new, true);
    assert.equal(j.findings[0].file, "src/a.tsx");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("a file that cannot be read exits 2, never a crash that reads as a finding or a pass", () => {
  const root = project({ "src/a.tsx": CLEAN });
  try {
    mkdirSync(join(root, "src", "dir.tsx")); // a folder named like a file: walked, holds nothing
    assert.equal(cli(root, ["src"]).code, 0);
    if (process.getuid && process.getuid() !== 0) {
      writeFileSync(join(root, "src", "locked.tsx"), CLEAN, { mode: 0o000 });
      assert.equal(cli(root, ["src"]).code, 2);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("the summary file gets a markdown table of new findings", () => {
  const root = project({ "src/a.tsx": HEX });
  try {
    cli(root, ["--summary", "sum.md", "src"]);
    const md = readFileSync(join(root, "sum.md"), "utf8");
    assert.match(md, /### Design system check/);
    assert.match(md, /\| `src\/a\.tsx` \| 1 \| DS-COLOR-001 \|/);
    assert.ok(existsSync(join(root, "sum.md")));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
