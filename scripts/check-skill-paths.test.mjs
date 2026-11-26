// Tests for check-skill-paths.mjs. Run: node scripts/check-skill-paths.test.mjs
// Each guard has a test that tries to get past it. See CLAUDE.md "Guards need a test from the other side".
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { check, pathsIn, resolvePath, skillDirs } from "./check-skill-paths.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(here, "check-skill-paths.mjs");

/** A repo with the given files, each a [path, text] pair. A SKILL.md gets frontmatter if its text has none. */
function repo(files) {
  const root = mkdtempSync(join(tmpdir(), "skill-paths-"));
  for (const [p, text = ""] of Object.entries(files)) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), p.endsWith("SKILL.md") && !text.startsWith("---") ? `---\nname: x\n---\n${text}` : text);
  }
  return root;
}
const names = (text) => pathsIn(`---\nname: x\n---\n${text}`).map((p) => p.path);

test("a path that resolves from the skill folder, from ./ or from the repo root is found", () => {
  const root = repo({
    "a/SKILL.md": "`references/x.md` `./references/x.md` `a/references/x.md` `b/data/y.json` `../b/data/y.json` `registry/z.json` `scripts/s.mjs`",
    "a/references/x.md": "", "b/SKILL.md": "", "b/data/y.json": "{}", "registry/z.json": "{}", "scripts/s.mjs": "",
  });
  assert.deepEqual(check(root), []);
  rmSync(root, { recursive: true });
});

test("a missing path is a problem with its line number", () => {
  const root = repo({ "a/SKILL.md": "line one\nsee `references/gone.md` here" });
  const p = check(root);
  assert.equal(p.length, 1);
  assert.match(p[0], /a\/SKILL\.md:5: `references\/gone\.md` does not exist/, "line 5 counts the three frontmatter lines");
  rmSync(root, { recursive: true });
});

test("a bare path that only exists in another skill is a problem, and the message gives the fix", () => {
  const root = repo({ "a/SKILL.md": "`references/x.md`", "b/SKILL.md": "", "b/references/x.md": "" });
  const p = check(root);
  assert.equal(p.length, 1);
  assert.match(p[0], /is in b\. Write it as `b\/references\/x\.md`/);
  rmSync(root, { recursive: true });
});

test("what is not a path is skipped: bare names, URLs, placeholders, globs, absolute and home paths, two names with a slash", () => {
  assert.deepEqual(names("`VOIS.md` `package.json` https://example.com/a/b.json `refs/<name>.md` `refs/{x}.md` `refs/*.md` `data/*.json` `/etc/x.json` `~/x/y.json` `$HOME/x/y.json` `PRODUCT.md/VOIS.md`"), []);
  // The same shapes written as real paths are found, so the skips above are the reason they are not.
  assert.deepEqual(names("`refs/real.md` `data/real.json`"), ["refs/real.md", "data/real.json"]);
});

test("a path with a longer extension or a template suffix is that path, not a shorter one", () => {
  assert.deepEqual(names("`references/VOIS.md.template`"), ["references/VOIS.md.template"]);
  assert.deepEqual(names("`data/a.json5`"), [], "an unknown longer extension is not a .json path");
  assert.deepEqual(names("`data/a.mdxx`"), [], "nor is .mdxx a .md or .mdx path");
  assert.deepEqual(names("`data/a.mdx`"), ["data/a.mdx"]);
});

test("a name followed by more extension, or by a glob or placeholder mark, is not that path; sentence punctuation still is", () => {
  assert.deepEqual(names("`data/a.json.bak` `refs/x.md.orig`"), [], "a longer name is a different file");
  assert.deepEqual(names("`refs/x.md*` `refs/x.md<n>` `refs/x.md{a,b}`"), [], "a glob or placeholder tail means no fixed file");
  assert.deepEqual(names("see refs/x.md. Then (refs/y.md), or `refs/z.md`,"), ["refs/x.md", "refs/y.md", "refs/z.md"]);
});

test("a path inside a code fence is checked like any other", () => {
  const root = repo({ "a/SKILL.md": "```bash\nnode a/scripts/gone.mjs\n```" });
  assert.equal(check(root).length, 1);
  rmSync(root, { recursive: true });
});

test("a path that climbs out of the repo is never found, even when the file exists there", () => {
  const outer = mkdtempSync(join(tmpdir(), "skill-paths-outer-"));
  writeFileSync(join(outer, "secret.json"), "{}");
  const root = join(outer, "repo");
  mkdirSync(join(root, "a"), { recursive: true });
  writeFileSync(join(root, "a", "SKILL.md"), "---\nname: x\n---\n`../../secret.json`");
  assert.equal(resolvePath(root, "a", "../../secret.json"), null);
  assert.equal(check(root).length, 1);
  rmSync(outer, { recursive: true });
});

test("the allow list silences only its own skill and path, and a stale entry is a problem", () => {
  const root = repo({ "a/SKILL.md": "`data/none.json`", "b/SKILL.md": "`data/none.json`" });
  const p = check(root, { "a:data/none.json": "stated as absent" });
  assert.equal(p.length, 1);
  assert.match(p[0], /^b\/SKILL\.md/, "the entry for a does not cover b");
  const stale = check(root, { "a:data/none.json": "r", "b:data/none.json": "r", "a:data/other.json": "r" });
  assert.equal(stale.length, 1);
  assert.match(stale[0], /"a:data\/other\.json" is listed but no SKILL\.md names it/);
  rmSync(root, { recursive: true });
});

test("bad config fails closed: an unreadable allow file stops the run, a wrong shape allows nothing", () => {
  const root = repo({ "a/SKILL.md": "`data/none.json`", "scripts/skill-paths-allow.json": "{ not json" });
  const r = spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
  assert.notEqual(r.status, 0, "malformed JSON must not pass");
  writeFileSync(join(root, "scripts", "skill-paths-allow.json"), JSON.stringify({ allow: ["a:data/none.json"] }));
  const r2 = spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
  assert.notEqual(r2.status, 0, "a list in place of an object allows nothing");
  writeFileSync(join(root, "scripts", "skill-paths-allow.json"), JSON.stringify({ allow: "a:data/none.json" }));
  assert.notEqual(spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" }).status, 0, "a string in place of an object allows nothing");
  rmSync(root, { recursive: true });
});

test("skillDirs finds a folder only when it holds a SKILL.md", () => {
  const root = repo({ "a/SKILL.md": "", "b/README.md": "", "node_modules/c/SKILL.md": "", ".hidden/SKILL.md": "" });
  assert.deepEqual(skillDirs(root), ["a"]);
  rmSync(root, { recursive: true });
});

test("the repo's own SKILL.md files pass", () => {
  const out = execFileSync("node", [SCRIPT], { encoding: "utf8", cwd: join(here, "..") });
  assert.match(out, /OK/);
});

test("bold, italic, upper case, Windows and newer-extension paths are still checked", () => {
  assert.deepEqual(names("**a/b.md** and *c/d.md* and `e/f.md*`"), ["a/b.md", "c/d.md"], "wrapped is a path, a bare glob tail is not");
  assert.deepEqual(names("`a/B.MD` `a/c.JSON` `a/i.svg` `a/t.toml`"), ["a/B.MD", "a/c.JSON", "a/i.svg", "a/t.toml"]);
  assert.deepEqual(names("`vois-tokens\\data\\t.json`"), ["vois-tokens/data/t.json"]);
});

test("an allow entry without a reason is a problem", () => {
  const root = repo({ "a/SKILL.md": "`data/none.json`" });
  for (const bad of ["", "  ", null, 1]) {
    const p = check(root, { "a:data/none.json": bad });
    assert.equal(p.length, 1, JSON.stringify(bad));
    assert.match(p[0], /needs a reason/);
  }
  rmSync(root, { recursive: true });
});

test("the script still runs and fails when the checkout path has a space or a non-ASCII letter", () => {
  const outer = mkdtempSync(join(tmpdir(), "skill-paths-sp "));
  const root = join(outer, "répo x");
  mkdirSync(join(root, "a"), { recursive: true });
  writeFileSync(join(root, "a", "SKILL.md"), "---\nname: x\n---\n`gone/x.md`");
  const copy = join(outer, "sp ace é");
  mkdirSync(copy);
  writeFileSync(join(copy, "check-skill-paths.mjs"), readFileSync(SCRIPT, "utf8"));
  const r = spawnSync("node", [join(copy, "check-skill-paths.mjs"), "--root", root], { encoding: "utf8" });
  assert.equal(r.status, 1, "must report the missing path, not exit 0 silently: " + r.stdout + r.stderr);
  assert.match(r.stderr, /gone\/x\.md/);
  rmSync(outer, { recursive: true });
});
