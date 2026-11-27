// Every skill CLI must run when it is reached through a symlinked install (how `npx skills add` links a skill)
// and when its real path has a space, % or # in it. An entry-point check that compares argv[1] with import.meta.url
// as raw strings fails both ways and the script exits 0 with no output, which an agent reads as "no findings".
// Each CLI is run three ways and must print the same thing and exit the same way each time. Imported with an
// argv[1] that is some other file, it must not run at all.
// Run: node scripts/entry-points.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "entry-points-"));
const fixture = join(work, "fixture.tsx");
writeFileSync(fixture, 'export const A = () => <div className="text-[#ff0000]" />;\n');

const CLIS = [
  ["vois-components/scripts/query.mjs", ["Dialog"]],
  ["vois-components/scripts/retrieval.mjs", []],
  ["vois-components/scripts/behaviors.mjs", []],
  ["vois-fields/scripts/check-fields.mjs", []],
  ["vois-tokens/scripts/detect.mjs", [fixture]],
  ["vois-tokens/scripts/check.mjs", ["--no-such-option"]],
  ["vois-tokens/scripts/elevation-map.mjs", []],
  ["vois-dataviz/scripts/detect.mjs", [fixture]],
  ["vois-dataviz/scripts/check-spec.mjs", []],
  ["righter/scripts/ari.mjs", ["The cat sat on the mat."]],
  ["righter/scripts/check-slots.mjs", ["--list"]],
];

function run(script, args) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd: work, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

// A root whose top-level entries link back to the repo, except `skill`, which is a real copy. Scripts that
// read sibling skills (retrieval.mjs reads vois-patterns and registry) then see the same repo.
function rootWith(dir, skill, copySkill) {
  for (const name of readdirSync(repo)) {
    if (name === ".git" || name === "node_modules") continue;
    if (name === skill && copySkill) cpSync(join(repo, name), join(dir, name), { recursive: true });
    else symlinkSync(join(repo, name), join(dir, name));
  }
  return dir;
}

let canLink = true;
try { symlinkSync(repo, join(work, "probe")); } catch { canLink = false; }

for (const [rel, args] of CLIS) {
  const skill = rel.split("/")[0];
  const expected = run(join(repo, rel), args);

  test(`${rel} prints something from its real path`, () => {
    assert.ok((expected.stdout + expected.stderr).trim().length > 0, `${rel} printed nothing`);
  });

  test(`${rel} runs the same through a symlinked skill folder`, { skip: !canLink && "symlinks not available" }, () => {
    const root = rootWith(mkdtempSync(join(work, "link-")), skill, false);
    assert.deepEqual(run(join(root, rel), args), expected);
  });

  test(`${rel} runs the same from a real path with a space, % and # in it`, { skip: !canLink && "symlinks not available" }, () => {
    const root = rootWith(mkdtempSync(join(work, "sp ace %20 #1-")), skill, true);
    assert.deepEqual(run(join(root, rel), args), expected);
  });

  test(`${rel} does not run when imported with an argv[1] that is not it`, () => {
    for (const other of ["no-such-file.mjs", fixture]) {
      const code = `await import(${JSON.stringify(pathToFileURL(join(repo, rel)).href)});`;
      const r = spawnSync(process.execPath, ["--input-type=module", "-e", code, other], { cwd: work, encoding: "utf8" });
      assert.deepEqual({ status: r.status, out: r.stdout + r.stderr }, { status: 0, out: "" }, `${rel} with argv[1] = ${other}`);
    }
  });
}

test.after(() => rmSync(work, { recursive: true, force: true }));
