// Tests for port-from-private.mjs. Run: node scripts/port-from-private.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import {
  compareVersions, skillVersion, changelogEntries, mergeChangelog, setSkillVersion, setReadmeVersion,
  setSkillsJsonVersion, setEditionNote, port, drift,
} from "./port-from-private.mjs";
import { ruleFileEquivalent } from "./mirror-config.mjs";

const SKILL = (v, extra = "") => `---\nname: s\ndescription: d\nversion: ${v}\n---\n\n# S\n${extra}`;
const LOG = (...vs) => `# Changelog\n\nintro\n\n---\n\n${vs.map((v) => `## [${v}] - 2026-01-01\n\n### Added\n- thing ${v}\n\n---\n`).join("\n")}`;

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), "port-"));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), text);
  }
  return root;
}
const rd = (root, p) => readFileSync(join(root, p), "utf8");
const CFG = { SHARED_CODE: ["s/scripts/a.mjs"], RULE_FILES: ["s/data/rules.json"], ALLOWED: {}, MIRRORED_TREES: [], STANDALONE_SKILLS: ["s"], trackedFiles: () => new Map() };

test("versions compare as numbers, and junk compares as null", () => {
  assert.equal(compareVersions("1.9.0", "1.10.0"), -1, "1.9 is older than 1.10, not newer as text");
  assert.equal(compareVersions("2.0.0", "1.99.99"), 1);
  assert.equal(compareVersions("1.2.3", "1.2.3"), 0);
  for (const bad of ["1.2", "v1.2.3", "1.2.3-beta", "", null, undefined]) assert.equal(compareVersions(bad, "1.0.0"), null, String(bad));
});

test("only the frontmatter version counts, and only that line is changed", () => {
  const text = SKILL("1.2.3", "\nversion: 9.9.9\n");
  assert.equal(skillVersion(text), "1.2.3");
  assert.equal(skillVersion("# no frontmatter\nversion: 1.0.0\n"), null);
  const out = setSkillVersion(text, "1.3.0");
  assert.equal(skillVersion(out), "1.3.0");
  assert.ok(out.includes("\nversion: 9.9.9\n"), "the body line is untouched");
  assert.equal(setSkillVersion("# none\nversion: 1.0.0\n", "2.0.0"), null);
  assert.equal(setSkillVersion("---\nname: s\n---\nversion: 1.0.0\n", "2.0.0"), null, "a version outside the frontmatter is not set");
});

test("the README version line and the skills.json entry change for the right skill only", () => {
  assert.equal(setReadmeVersion("a\n**v1.0.0** - x **v0.1.0**\n", "1.1.0"), "a\n**v1.1.0** - x **v0.1.0**\n", "first one only");
  assert.equal(setReadmeVersion("**Version 1.48.7** · For use", "1.48.8"), "**Version 1.48.8** · For use", "the long form keeps its words");
  assert.equal(setReadmeVersion("**Versions 1.0.0**", "1.1.0"), null);
  assert.equal(setReadmeVersion("no version", "1.1.0"), null);
  const json = `{"skills":[{"name": "vois-tokens-extra", "version": "9.0.0"},{"name": "vois-tokens", "path": "vois-tokens", "version": "1.0.0", "tags": []}]}`;
  const out = setSkillsJsonVersion(json, "vois-tokens", "1.1.0");
  assert.match(out, /"vois-tokens-extra", "version": "9.0.0"/, "a longer name is a different skill");
  assert.match(out, /"name": "vois-tokens", "path": "vois-tokens", "version": "1.1.0"/);
  assert.equal(setSkillsJsonVersion(json, "missing", "1.0.0"), null);
  assert.equal(setSkillsJsonVersion(json + json, "vois-tokens", "2.0.0"), null, "two entries is not one");
});

test("changelog: only entries newer than the public version, none twice, above the newest public entry", () => {
  const pub = LOG("1.1.0", "1.0.0"), priv = LOG("1.3.0", "1.2.0", "1.1.0", "1.0.0", "0.9.0");
  const r = mergeChangelog(pub, priv, "1.1.0");
  assert.deepEqual(r.added, ["1.3.0", "1.2.0"]);
  assert.deepEqual(changelogEntries(r.text).map((e) => e.version), ["1.3.0", "1.2.0", "1.1.0", "1.0.0"]);
  assert.equal(mergeChangelog(r.text, priv, "1.3.0").added.length, 0, "a second run adds nothing");
  assert.equal(mergeChangelog("# Changelog\nno entries", priv, "1.1.0"), null);
  assert.deepEqual(mergeChangelog(pub, LOG("1.10.0", "1.2.0"), "1.9.0").added, ["1.10.0"], "1.10.0 is newer than 1.9.0");
});

test("the edition note changes only a row marked behind, and warns otherwise", () => {
  const t = "| `s.md` | 1.0.0 (behind: source is 1.1.0) | x |\n| `s2.md` | 1.0.0 (behind: source is 1.1.0) | x |\n| `t.md` | 1.0.0 | In sync |";
  assert.match(setEditionNote(t, "s", "1.2.0").text, /`s.md` \| 1.0.0 \(behind: source is 1.2.0\)[^\n]*\n\| `s2.md` \| 1.0.0 \(behind: source is 1.1.0\)/);
  assert.match(setEditionNote(t, "t", "1.2.0").warn, /not marked behind/);
  assert.match(setEditionNote(t, "zz", "1.2.0").warn, /no row/);
});

function pair(extra = {}) {
  const base = (v, code) => ({
    "s/SKILL.md": SKILL(v), "s/README.md": `x\n**v${v}** - y\n`, "s/CHANGELOG.md": v === "1.0.0" ? LOG("1.0.0") : LOG("1.1.0", "1.0.0"),
    "s/scripts/a.mjs": code, "s/data/rules.json": JSON.stringify({ rules: [{ id: "R-1", text: v }] }),
  });
  return {
    pub: repo({ ...base("1.0.0", "old"), "skills.json": `{"skills":[{"name": "s", "version": "1.0.0"}]}`, "figma-editions/README.md": "| `s.md` | 1.0.0 (behind: source is 1.0.0) | x |", ...extra.pub }),
    priv: repo({ ...base("1.1.0", "new"), ...extra.priv }),
  };
}

test("port copies, bumps and notes; a second run has nothing to do", () => {
  const { pub, priv } = pair();
  const r = port({ publicRoot: pub, privateRoot: priv, config: CFG });
  assert.deepEqual(r.errors, []);
  assert.equal(rd(pub, "s/scripts/a.mjs"), "new");
  assert.equal(skillVersion(rd(pub, "s/SKILL.md")), "1.1.0");
  assert.match(rd(pub, "s/README.md"), /\*\*v1.1.0\*\*/);
  assert.match(rd(pub, "skills.json"), /"version": "1.1.0"/);
  assert.match(rd(pub, "figma-editions/README.md"), /source is 1.1.0/);
  assert.deepEqual(changelogEntries(rd(pub, "s/CHANGELOG.md")).map((e) => e.version), ["1.1.0", "1.0.0"]);
  const again = port({ publicRoot: pub, privateRoot: priv, config: CFG });
  assert.deepEqual([again.actions, again.warnings, again.errors], [[], [], []]);
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("--dry-run reports the same actions and writes nothing", () => {
  const { pub, priv } = pair();
  const before = rd(pub, "s/scripts/a.mjs") + rd(pub, "s/SKILL.md") + rd(pub, "skills.json");
  const dry = port({ publicRoot: pub, privateRoot: priv, dryRun: true, config: CFG });
  assert.equal(rd(pub, "s/scripts/a.mjs") + rd(pub, "s/SKILL.md") + rd(pub, "skills.json"), before);
  const real = port({ publicRoot: pub, privateRoot: priv, config: CFG });
  assert.deepEqual(dry.actions, real.actions);
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("a public version newer than private is an error and nothing for that skill is changed", () => {
  const { pub, priv } = pair({ pub: { "s/SKILL.md": SKILL("2.0.0") } });
  const r = port({ publicRoot: pub, privateRoot: priv, config: CFG });
  assert.match(r.errors.join(), /public version 2.0.0 is newer/);
  assert.equal(skillVersion(rd(pub, "s/SKILL.md")), "2.0.0");
  assert.doesNotMatch(rd(pub, "skills.json"), /1.1.0/);
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("a file with allowed wording differences is never copied over", () => {
  const rules = (do_) => JSON.stringify({ rules: [{ id: "R-1", do: do_, text: "same" }] });
  const { pub, priv } = pair({ pub: { "s/data/rules.json": rules("public wording") }, priv: { "s/data/rules.json": rules("private wording") } });
  const cfg = { ...CFG, ALLOWED: { "s/data/rules.json": { "R-1": ["do"] } } };
  const r = port({ publicRoot: pub, privateRoot: priv, config: cfg });
  assert.equal(rd(pub, "s/data/rules.json"), rules("public wording"));
  assert.deepEqual(r.warnings.filter((w) => /hand/i.test(w)), [], "an allowed difference alone needs no merge");
  writeFileSync(join(priv, "s/data/rules.json"), JSON.stringify({ rules: [{ id: "R-1", do: "x", text: "CHANGED" }] }));
  const r2 = port({ publicRoot: pub, privateRoot: priv, config: cfg });
  assert.match(r2.warnings.join(), /Merge it by hand/);
  assert.equal(rd(pub, "s/data/rules.json"), rules("public wording"), "still not copied");
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("an allowed file listed as shared code is not copied either", () => {
  const { pub, priv } = pair({ pub: { "s/scripts/a.mjs": "public wording" } });
  const cfg = { ...CFG, ALLOWED: { "s/scripts/a.mjs": { $top: ["x"] } } };
  const r = port({ publicRoot: pub, privateRoot: priv, config: cfg });
  assert.equal(rd(pub, "s/scripts/a.mjs"), "public wording");
  assert.match(r.warnings.join(), /s\/scripts\/a\.mjs: carries allowed wording/);
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("a changelog entry the public file already has is not added again, even above the public skill version", () => {
  const pub = LOG("1.2.0", "1.0.0"), priv = LOG("1.2.0", "1.1.0", "1.0.0");
  const r = mergeChangelog(pub, priv, "1.0.0");
  assert.deepEqual(r.added, ["1.1.0"]);
  assert.deepEqual(changelogEntries(r.text).map((e) => e.version).sort(), ["1.0.0", "1.1.0", "1.2.0"]);
});

test("rule files are equal by content, not by bytes or key order", () => {
  const a = JSON.stringify({ rules: [{ id: "R-1", a: 1, b: [1, 2] }] });
  const b = JSON.stringify({ rules: [{ b: [1, 2], a: 1, id: "R-1" }] }, null, 2);
  assert.equal(ruleFileEquivalent("x.json", a, b), true);
  assert.equal(ruleFileEquivalent("x.json", a, JSON.stringify({ rules: [{ id: "R-1", a: 2, b: [1, 2] }] })), false);
  assert.equal(ruleFileEquivalent("x.json", a, JSON.stringify({ rules: [{ id: "R-1", a: 1, b: [1, 2] }, { id: "R-2" }] })), false, "an id on one side only");
  assert.equal(ruleFileEquivalent("x.json", a, "{ not json"), false, "bad input is not equal");
});

test("a mirrored folder: private files are copied, public-only files are named and kept", () => {
  const { pub, priv } = pair({ pub: { "reg/old.json": "1", "reg/x.json": "old" }, priv: { "reg/x.json": "new", "reg/y.json": "y" } });
  const tracked = (root, tree) => new Map([["reg/old.json", "100644"], ["reg/x.json", "100644"], ["reg/y.json", "100644"]].filter(([f]) => existsSync(join(root, f))));
  const r = port({ publicRoot: pub, privateRoot: priv, config: { ...CFG, MIRRORED_TREES: ["reg"], trackedFiles: tracked } });
  assert.equal(rd(pub, "reg/x.json"), "new");
  assert.equal(rd(pub, "reg/y.json"), "y");
  assert.equal(rd(pub, "reg/old.json"), "1", "never deleted");
  assert.match(r.warnings.join(), /reg\/old\.json: is in public only/);
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("drift names differing prose files and one-sided files, and flags shared files", () => {
  const { pub, priv } = pair({ priv: { "s/references/r.md": "only private\n", "s/SKILL.md": SKILL("1.0.0", "private line\n") }, pub: { "s/references/p.md": "x" } });
  const { execFileSync } = await_git();
  for (const d of [pub, priv]) { execFileSync("git", ["-C", d, "init", "-q"]); execFileSync("git", ["-C", d, "add", "-A"]); }
  const d = drift({ publicRoot: pub, privateRoot: priv, config: CFG, skills: ["s"] });
  const row = d.skills[0];
  assert.deepEqual(row.differ.map((f) => f.file), ["s/README.md", "s/SKILL.md"], "the README differs by its version line");
  const skill = row.differ.find((f) => f.file === "s/SKILL.md");
  assert.deepEqual([skill.added, skill.removed], [1, 0]);
  assert.deepEqual(row.privateOnly, ["s/references/r.md"]);
  assert.deepEqual(row.publicOnly, ["s/references/p.md"]);
  assert.deepEqual(d.shared.sort(), ["s/data/rules.json", "s/scripts/a.mjs"].sort(), "mirror-compared files are not prose drift");
  assert.ok(!row.differ.some((f) => f.file.endsWith("CHANGELOG.md")), "changelogs are left out");
  for (const x of [pub, priv]) rmSync(x, { recursive: true });
});
function await_git() { return { execFileSync: (...a) => import_exec(...a) }; }
import { execFileSync as import_exec } from "node:child_process";

test("a private file that is not a regular file is an error and nothing is written", () => {
  const { pub, priv } = pair({ priv: { "reg/link": "/etc/hostname" } });
  const tracked = (root) => new Map(root === priv ? [["reg/link", "120000"]] : []);
  const r = port({ publicRoot: pub, privateRoot: priv, config: { ...CFG, MIRRORED_TREES: ["reg"], trackedFiles: tracked } });
  assert.match(r.errors.join(), /reg\/link: is not a regular file in private \(git mode 120000\)/);
  assert.equal(existsSync(join(pub, "reg/link")), false);
  assert.equal(rd(pub, "s/scripts/a.mjs"), "old", "an error stops every write, not only the bad one");
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});

test("a malformed private rule file, or one with a duplicate id, is never copied", () => {
  for (const bad of ["{bad", JSON.stringify({ rules: [{ id: "R-1" }, { id: "R-1" }] })]) {
    const { pub, priv } = pair({ priv: { "s/data/rules.json": bad } });
    const before = rd(pub, "s/data/rules.json");
    const r = port({ publicRoot: pub, privateRoot: priv, config: CFG });
    assert.match(r.errors.join(), /not valid JSON or has a duplicate id/);
    assert.equal(rd(pub, "s/data/rules.json"), before);
    for (const d of [pub, priv]) rmSync(d, { recursive: true });
  }
});

test("a wording swap that does not hit exactly once is not equivalent, and an id like toString does not crash", () => {
  const swapRel = "vois-dataviz/data/review-checklist.json";
  const text = (n) => JSON.stringify({ description: "d", note: Array(n).fill("what to fix first. Call vois_record_rule_usage for the rule ids that drove changes.").join(" ") });
  const pubText = JSON.stringify({ note: "what to fix first. If the vois_record_rule_usage tool is available, call it for the rule ids that drove changes." });
  const allowed = { [swapRel]: { $top: ["description"] } };
  assert.equal(ruleFileEquivalent(swapRel, pubText, text(1), allowed), true);
  assert.equal(ruleFileEquivalent(swapRel, pubText, pubText, allowed), false, "private already has the public wording: the swap hits nothing, and check-mirror fails on that");
  assert.equal(ruleFileEquivalent(swapRel, pubText, text(2), allowed), false, "two hits");
  const r = JSON.stringify({ rules: [{ id: "toString", a: 1 }, { id: "constructor", a: 2 }] });
  assert.equal(ruleFileEquivalent("x.json", r, r, {}), true);
  assert.equal(ruleFileEquivalent("x.json", r, r.replace('"a":1', '"a":9'), {}), false);
});

test("changelog: a repeated version, an Unreleased or pre-release heading and CRLF", () => {
  const pub = LOG("1.0.0");
  const priv = LOG("1.2.0", "1.2.0", "1.1.0") + "\n## [Unreleased]\n\n- later\n\n---\n\n## [1.3.0-beta.1] - 2026-02-02\n\n- beta\n";
  const r = mergeChangelog(pub, priv, "1.0.0");
  assert.deepEqual(r.added, ["1.2.0", "1.1.0"], "each version once, no pre-release");
  assert.doesNotMatch(r.text, /Unreleased|beta/, "the entries after it are not dragged in");
  const crlf = mergeChangelog(pub.replace(/\n/g, "\r\n"), priv, "1.0.0");
  assert.equal(crlf.text.replace(/\r\n/g, "").includes("\n"), false, "every line break stays CRLF");
});

test("the report flags mirrored-folder differences and a rule file missing in private", () => {
  const { pub, priv } = pair({ pub: { "reg/a.json": "1" }, priv: { "reg/a.json": "2" } });
  const tracked = (root) => new Map([["reg/a.json", "100644"]]);
  const cfg = { ...CFG, MIRRORED_TREES: ["reg"], trackedFiles: tracked };
  const { execFileSync } = await_git();
  for (const d of [pub, priv]) { execFileSync("git", ["-C", d, "init", "-q"]); execFileSync("git", ["-C", d, "add", "-A"]); }
  assert.ok(drift({ publicRoot: pub, privateRoot: priv, config: cfg, skills: ["s"] }).shared.includes("reg/a.json"));
  const modes = (root) => new Map([["reg/a.json", root === pub ? "100644" : "100755"]]);
  writeFileSync(join(priv, "reg/a.json"), "1");
  assert.ok(drift({ publicRoot: pub, privateRoot: priv, config: { ...cfg, trackedFiles: modes }, skills: ["s"] }).shared.includes("reg/a.json"), "same bytes, different mode");
  const oneSide = (root) => new Map(root === pub ? [["reg/a.json", "100644"]] : []);
  assert.ok(drift({ publicRoot: pub, privateRoot: priv, config: { ...cfg, trackedFiles: oneSide }, skills: ["s"] }).shared.includes("reg/a.json"), "listed on one side only");
  rmSync(join(priv, "s/data/rules.json"));
  assert.ok(drift({ publicRoot: pub, privateRoot: priv, config: cfg, skills: ["s"] }).shared.includes("s/data/rules.json"));
  for (const d of [pub, priv]) rmSync(d, { recursive: true });
});
