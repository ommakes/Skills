// Tests for check-reference-files.mjs. Run: node scripts/check-reference-files.test.mjs
// Each guard has a test that tries to get past it. See CLAUDE.md "Guards need a test from the other side".
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { check, isNamed, referenceFiles } from "./check-reference-files.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-reference-files.mjs");

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), "ref-files-"));
  for (const [p, text = ""] of Object.entries(files)) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), p.endsWith("SKILL.md") && !text.startsWith("---") ? `---\nname: x\n---\n${text}` : text);
  }
  return root;
}
const done = (root, fn) => { try { fn(); } finally { rmSync(root, { recursive: true }); } };

test("a file named as references/x.md, skill/references/x.md or x.md is named", () => {
  for (const text of ["`references/color.md`", "`a/references/color.md`", "see color.md here", "| `references/color.md` | Color |"]) {
    assert.equal(isNamed(text, "a", "color.md"), true, text);
  }
});

test("a longer name does not name a shorter one", () => {
  for (const text of ["`references/x-color.md`", "`references/color.md.bak`", "`references/colors.md`", "`references/color.mdx`", "`references/color.md-old`", "my_color.md", "color.md.old"]) {
    assert.equal(isNamed(text, "a", "color.md"), false, text);
  }
});

test("a path in a longer path or another skill's folder does not name this skill's file", () => {
  assert.equal(isNamed("`b/references/color.md`", "a", "color.md"), false, "another skill's file");
  assert.equal(isNamed("`docs/color.md`", "a", "color.md"), false, "a different folder");
  assert.equal(isNamed("`./references/color.md`", "a", "color.md"), true, "./ prefix is the same file");
  assert.equal(isNamed("`../b/references/color.md`", "a", "color.md"), false, "a sibling skill's file");
});

test("a nested file needs its folder in the name", () => {
  assert.equal(isNamed("`references/sub/deep.md`", "a", "sub/deep.md"), true);
  assert.equal(isNamed("`references/deep.md`", "a", "sub/deep.md"), false, "the folder part is missing");
  assert.equal(isNamed("`other/sub/deep.md`", "a", "sub/deep.md"), false);
});

test("a name with regex characters is matched as text", () => {
  assert.equal(isNamed("`references/a+b.md`", "a", "a+b.md"), true);
  assert.equal(isNamed("`references/aab.md`", "a", "a+b.md"), false);
  assert.equal(isNamed("`references/a.b.md`", "a", "a.b.md"), true);
  assert.equal(isNamed("`references/axb.md`", "a", "a.b.md"), false, ". is a dot, not any character");
});

test("case must match, and a different file name is a different file", () => {
  assert.equal(isNamed("`references/Color.md`", "a", "color.md"), false);
  assert.equal(isNamed("`references/color.md`", "a", "Color.md"), false);
  assert.equal(isNamed("`references/colour.md`", "a", "color.md"), false);
});

test("two files that differ only by case each need their own mention", () => {
  const root = repo({ "a/SKILL.md": "`references/color.md`", "a/references/color.md": "", "a/references/Color.md": "" });
  done(root, () => { const p = check(root); if (referenceFiles(root, "a").length === 2) assert.equal(p.length, 1); });
});

test("a Windows-style path in another skill's folder does not name this skill's file", () => {
  assert.equal(isNamed("`b\\references\\color.md`", "a", "color.md"), false);
  assert.equal(isNamed("`..\\b\\references\\color.md`", "a", "color.md"), false);
});

test("a file in references/ that SKILL.md does not name is a problem", () => {
  const root = repo({ "a/SKILL.md": "`references/one.md`", "a/references/one.md": "", "a/references/two.md": "" });
  done(root, () => {
    const p = check(root);
    assert.equal(p.length, 1);
    assert.match(p[0], /a\/references\/two\.md is not named in a\/SKILL\.md/);
  });
});

test("a nested reference file is found and checked", () => {
  const root = repo({ "a/SKILL.md": "nothing", "a/references/sub/deep.md": "" });
  done(root, () => {
    assert.deepEqual(referenceFiles(root, "a"), ["sub/deep.md"]);
    assert.equal(check(root).length, 1);
  });
});

test("only .md files count; dotfiles and templates are left out", () => {
  const root = repo({ "a/SKILL.md": "x", "a/references/T.md.template": "", "a/references/.hidden.md": "", "a/references/data.json": "" });
  done(root, () => { assert.deepEqual(referenceFiles(root, "a"), []); assert.deepEqual(check(root), []); });
});

test("a skill with no references folder, or an empty one, has nothing to check", () => {
  const root = repo({ "a/SKILL.md": "x", "b/SKILL.md": "x", "b/references/.keep": "" });
  done(root, () => assert.deepEqual(check(root), []));
});

test("a folder without SKILL.md is not a skill, so its references are not checked", () => {
  const root = repo({ "a/SKILL.md": "x", "notskill/references/z.md": "" });
  done(root, () => assert.deepEqual(check(root), []));
});

test("a mention in another skill's SKILL.md does not count", () => {
  const root = repo({ "a/SKILL.md": "nothing here", "a/references/x.md": "", "b/SKILL.md": "`a/references/x.md`" });
  done(root, () => assert.equal(check(root).length, 1));
});

test("a mention in the frontmatter-free body or the frontmatter both count as named text", () => {
  const root = repo({ "a/SKILL.md": "---\nname: a\ndescription: read references/x.md\n---\nbody", "a/references/x.md": "" });
  done(root, () => assert.deepEqual(check(root), []));
});

test("the allow list silences a file, needs a reason, and fails when stale", () => {
  const root = repo({ "a/SKILL.md": "`references/one.md`", "a/references/one.md": "", "a/references/two.md": "" });
  done(root, () => {
    assert.deepEqual(check(root, { "a:two.md": "kept for the build script" }), []);
    assert.match(check(root, { "a:two.md": "" }).join("\n"), /needs a reason/);
    assert.match(check(root, { "a:two.md": "   " }).join("\n"), /needs a reason/);
    assert.match(check(root, { "a:two.md": 5 }).join("\n"), /needs a reason/);
    assert.match(check(root, { "a:two.md": "r", "a:one.md": "r" }).join("\n"), /"a:one\.md" is listed but/, "named now, so the entry is stale");
    assert.match(check(root, { "a:two.md": "r", "a:gone.md": "r" }).join("\n"), /"a:gone\.md" is listed but/, "the file does not exist");
    assert.match(check(root, { "b:two.md": "r" }).join("\n"), /a\/references\/two\.md is not named/, "an entry for another skill does not cover it");
  });
});

test("the command line exits 1 on a problem and 0 when clean", () => {
  const bad = repo({ "a/SKILL.md": "x", "a/references/y.md": "" });
  done(bad, () => {
    const r = spawnSync("node", [SCRIPT, "--root", bad], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /y\.md is not named/);
    mkdirSync(join(bad, "scripts"), { recursive: true });
    writeFileSync(join(bad, "scripts", "reference-files-allow.json"), `{"allow": {"a:y.md": "kept on purpose"}}`);
    assert.equal(spawnSync("node", [SCRIPT, "--root", bad], { encoding: "utf8" }).status, 0);
  });
  const good = repo({ "a/SKILL.md": "`references/y.md`", "a/references/y.md": "" });
  done(good, () => assert.equal(spawnSync("node", [SCRIPT, "--root", good], { encoding: "utf8" }).status, 0));
});

test("a malformed allow list fails even when every file is named (it must not read as empty)", () => {
  const good = repo({ "a/SKILL.md": "`references/y.md`", "a/references/y.md": "" });
  done(good, () => {
    mkdirSync(join(good, "scripts"), { recursive: true });
    for (const allow of ["[]", "null", "\"yes\"", "5", "true"]) {
      writeFileSync(join(good, "scripts", "reference-files-allow.json"), `{"allow": ${allow}}`);
      const q = spawnSync("node", [SCRIPT, "--root", good], { encoding: "utf8" });
      assert.equal(q.status, 1, `allow = ${allow}`);
      assert.match(q.stderr, /must be an object/);
    }
  });
});

test("on the real repo the check passes", () => {
  const r = spawnSync("node", [SCRIPT], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});
