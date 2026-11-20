// Tests for typecheck.mjs: the committed registry passes, and code that misuses a component fails.
// The misuse files sit in a temporary folder inside registry/, so `react` and the types resolve from registry/node_modules.
// Run: node registry/scripts/typecheck.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sourceFiles, tsconfigFor, typecheck } from "./typecheck.mjs";
import { aliasMap } from "../harness/build.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

/** Type-check the registry plus one extra file with `code`; returns typecheck()'s result. */
function withFile(code) {
  const dir = mkdtempSync(join(registryDir, ".typecheck-tmp-"));
  try {
    const file = join(dir, "usage.tsx");
    writeFileSync(file, code);
    return typecheck([file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const IMPORTS = 'import { Button } from "@/components/ui/button"\nimport { IconButton } from "@/components/ui/icon-button"\n';

test("the committed registry type-checks", () => {
  const r = typecheck();
  assert.equal(r.ok, true, r.out);
  assert.ok(r.files > 40, "every component file is included");
});

test("correct use of IconButton and Button compiles", () => {
  const r = withFile(`${IMPORTS}export const A = () => <>
  <IconButton label="Close" icon={<svg />} />
  <IconButton label="Add" icon={<svg />} size="icon-sm" variant="soft" tooltip={false} disabled />
  <Button size="icon" aria-label="Close"><svg /></Button>
  <Button size="icon"><svg /><span className="sr-only">Close</span></Button>
</>\n`);
  assert.equal(r.ok, true, r.out);
});

/** Asserts the run failed in usage.tsx with an error matching `pattern`, so an unrelated error cannot pass the test. */
function failsWith(r, pattern, what) {
  assert.equal(r.ok, false, `${what}: expected a type error`);
  const own = r.out.split("\n").filter((l) => l.includes("usage.tsx"));
  assert.ok(own.length > 0, `${what}: the error is not in usage.tsx:\n${r.out}`);
  assert.ok(own.some((l) => pattern.test(l)), `${what}: no usage.tsx error matches ${pattern}:\n${own.join("\n")}`);
}

test("an IconButton without a label does not compile", () => {
  failsWith(withFile(`${IMPORTS}export const A = () => <IconButton icon={<svg />} />\n`), /Property 'label' is missing/, "no label");
});

// aria-label and aria-labelledby are not here: TypeScript never checks hyphenated JSX attributes. IconButton drops them
// at runtime instead, which icon-button.test.mjs checks.
test("IconButton takes its name only from label: children, a text size and asChild are type errors", () => {
  for (const [jsx, pattern] of [
    ['<IconButton label="Close" icon={<svg />}>Close</IconButton>', /children/],
    ['<IconButton label="Close" icon={<svg />} size="lg" />', /"lg"/],
    ['<IconButton label="Close" icon={<svg />} asChild />', /asChild/],
    ['<IconButton label={undefined} icon={<svg />} />', /undefined' is not assignable to type 'string'/],
  ]) {
    failsWith(withFile(`${IMPORTS}export const A = () => ${jsx}\n`), pattern, jsx);
  }
});

test("a wrong Button prop does not compile, so the check reads props and not only syntax", () => {
  failsWith(withFile(`${IMPORTS}export const A = () => <Button size="huge">Save</Button>\n`), /"huge"/, "size huge");
});

test("an import of a component the registry does not ship does not compile", () => {
  failsWith(withFile('import { Nope } from "@/components/ui/nope"\nexport const A = () => <Nope />\n'), /Cannot find module '@\/components\/ui\/nope'/, "unshipped import");
});

test("the tsconfig maps every install target and leaves .d.ts files to their .js", () => {
  const registry = JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf8"));
  const aliases = aliasMap(registry);
  const cfg = tsconfigFor(aliases, sourceFiles());
  assert.equal(cfg.compilerOptions.strict, true);
  assert.ok(cfg.compilerOptions.paths["@/components/ui/icon-button"], "the new item resolves");
  assert.ok(cfg.compilerOptions.paths["@/lib/utils"], "shadcn's cn resolves");
  assert.ok(sourceFiles().every((f) => !f.endsWith(".d.ts")));
});

