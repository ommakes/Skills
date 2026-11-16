// Run with: node registry/scripts/check-syntax.test.mjs (needs the registry's devDependencies: npm ci in registry/)
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkDirectory, sourceFiles, syntaxProblems } from "./check-syntax.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function withFiles(files, run) {
  const dir = mkdtempSync(join(tmpdir(), "vois-syntax-"));
  try {
    for (const [name, text] of Object.entries(files)) {
      const path = join(dir, name);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(path, text);
    }
    return await run(dir); // awaited, or the directory is removed before the check has read it
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const GOOD = 'export function A({ n }: { n: number }) { return <div className="a">{n > 0 ? "x" : null}</div> }\n';

test("every committed registry component and helper parses", async () => {
  const files = sourceFiles(join(registryDir, "vois"));
  assert.ok(files.length > 20, `expected the registry's components, found ${files.length} files`);
  assert.deepEqual(await syntaxProblems(files), []);
});

test("a valid file passes", async () => {
  await withFiles({ "a/a.tsx": GOOD, "b/b.ts": "export const x: number = 1\n" }, async (dir) => {
    assert.deepEqual(await syntaxProblems(sourceFiles(dir), dir), []);
  });
});

test("a missing closing bracket is a problem, with its file and line", async () => {
  // The merge slip this check exists for: a list that loses its closing "],".
  const slip = 'const v = {\n  glass: [\n    "a",\n  soft: [\n    "b",\n  ],\n}\nexport {}\n';
  await withFiles({ "a/a.tsx": slip }, async (dir) => {
    const problems = await syntaxProblems(sourceFiles(dir), dir);
    assert.ok(problems.length >= 1, "a dropped ] must fail");
    assert.match(problems[0], /^a\/a\.tsx:\d+:\d+: /);
  });
});

test("an unclosed JSX tag, an unclosed brace and a stray token are problems", async () => {
  for (const code of ["export const a = <div>\n", "export function f() {\n  return 1\n", "export const a = ;\n", "const x = {{ a: 1 }\n"]) {
    await withFiles({ "a/a.tsx": code }, async (dir) => {
      assert.ok((await syntaxProblems(sourceFiles(dir), dir)).length >= 1, code);
    });
  }
});

test("the problems of every bad file are reported, not just the first", async () => {
  await withFiles({ "a/a.tsx": "export const a = ;\n", "b/b.ts": "export const b = ;\n", "c/c.tsx": GOOD }, async (dir) => {
    const files = (await syntaxProblems(sourceFiles(dir), dir)).map((p) => p.split(":")[0]);
    assert.deepEqual([...new Set(files)], ["a/a.tsx", "b/b.ts"]);
  });
});

test("a .ts file is read as TypeScript and a .tsx file as JSX", async () => {
  await withFiles({ "a.ts": "export const a = (x: number): number => x\n" }, async (dir) => assert.deepEqual(await syntaxProblems(sourceFiles(dir), dir), []));
  await withFiles({ "a.ts": "export const a = <div />\n" }, async (dir) => assert.ok((await syntaxProblems(sourceFiles(dir), dir)).length >= 1, "JSX in a .ts file is not valid"));
});

test("no file to read fails closed", async () => {
  assert.deepEqual(await syntaxProblems([]), ["no .ts or .tsx file found to parse"]);
  await withFiles({ "a/readme.md": "# x\n", "a/styles.css": ".a {}\n" }, async (dir) => {
    assert.deepEqual(sourceFiles(dir), [], "only .ts and .tsx are read");
  });
});

test("a symbolic link to a file is not read (check-registry.mjs fails on links in registry/vois)", async () => {
  await withFiles({ "a/real.tsx": GOOD }, async (dir) => {
    const outside = mkdtempSync(join(tmpdir(), "vois-syntax-out-"));
    try {
      writeFileSync(join(outside, "bad.tsx"), "export const a = ;\n");
      symlinkSync(join(outside, "bad.tsx"), join(dir, "a/link.tsx"));
      assert.deepEqual(sourceFiles(dir).map((f) => f.slice(dir.length + 1)), ["a/real.tsx"]);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("sourceFiles finds nested files, ignores other extensions and does not follow a link", async () => {
  await withFiles({ "a/b/c/deep.tsx": GOOD, "a/x.tsx.bak": "garbage {", "a/y.mts": "garbage {", "a/.tsx": "garbage {" }, async (dir) => {
    const outside = mkdtempSync(join(tmpdir(), "vois-syntax-out-"));
    try {
      writeFileSync(join(outside, "bad.tsx"), "export const a = ;\n");
      symlinkSync(outside, join(dir, "linked"));
      assert.deepEqual(sourceFiles(dir).map((f) => f.slice(dir.length + 1)), ["a/b/c/deep.tsx"]);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("a directory that cannot be read is a problem, not a crash", async () => {
  const { files, problems } = await checkDirectory(join(tmpdir(), "vois-syntax-does-not-exist"), tmpdir());
  assert.deepEqual(files, []);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /cannot be read \(ENOENT\)/);
});

test("a file that is not .ts or .tsx is a problem, even in a folder with a dot in its name", async () => {
  await withFiles({ "a.b/noext": "export const a = 1\n", "a.b/style.css": ".a {}\n" }, async (dir) => {
    const problems = await syntaxProblems([join(dir, "a.b/noext"), join(dir, "a.b/style.css")], dir);
    assert.equal(problems.length, 2, problems.join("\n"));
    assert.ok(problems.every((p) => /not a \.ts or \.tsx file/.test(p)));
  });
});

test("a .tsx file in a folder with a dot in its name is parsed as TSX", async () => {
  await withFiles({ "v1.2/a.tsx": GOOD }, async (dir) => {
    assert.deepEqual(await syntaxProblems(sourceFiles(dir), dir), []);
  });
});

