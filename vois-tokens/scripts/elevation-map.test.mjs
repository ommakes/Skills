// Each guard gets an input that should pass and inputs that try to get past it.
// Run: node vois-tokens/scripts/elevation-map.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validate, semanticProblems, loadAll, checkAll, lightAndDarkShadows } from "./elevation-map.mjs";

const { schema, data: realData, registryItems, readComponent, shadowTokens } = loadAll();
const real = () => structuredClone(realData);
const ctx = { registryItems, readComponent, shadowTokens };
const all = (d) => [...validate(schema, d), ...semanticProblems(d, ctx)];
const el = (d, id) => d.elements.find((e) => e.id === id);

test("the committed map passes", () => assert.deepEqual(checkAll(), []));

test("schema: a missing property, an invented property, a wrong type and a bad enum all fail", () => {
  const cases = [
    (d) => delete d.elements[0].rest, (d) => delete d.layers.modal, (d) => delete d.dark.xlarge,
    (d) => (d.elements[0].colour = "red"), (d) => (d.layers.page.extra = 1), (d) => (d.extra = 1),
    (d) => (d.elements[0].layer = "floating"), (d) => (d.elements[0].rest = "huge"), (d) => (d.elements[0].status = "done"),
    (d) => (d.elements[0].dock = "diagonal"), (d) => (d.elements[0].id = "Card Thing"), (d) => (d.elements[0].label = ""), (d) => (d.elements[0].note = 5),
    (d) => (d.elements = []),
  ];
  for (const m of cases) { const d = real(); m(d); assert.ok(all(d).length > 0, String(m)); }
});

test("schema checker fails closed: an unknown keyword is an error, and a type list accepts null but not a number", () => {
  assert.match(validate({ type: "object", properties: { a: { type: "string", format: "x" } } }, { a: "s" }).join(), /does not support/);
  assert.deepEqual(validate({ type: ["string", "null"] }, null), []);
  assert.ok(validate({ type: ["string", "null"] }, 5).length > 0);
});

test("ladder: a reordered, shortened or extended ladder fails", () => {
  for (const m of [(d) => d.ladder.reverse(), (d) => d.ladder.pop(), (d) => d.ladder.splice(1, 1)]) {
    const d = real(); m(d); assert.match(all(d).join("\n"), /ladder must be exactly/);
  }
});

test("states: hover goes up at most one tier and never down", () => {
  let d = real(); el(d, "card").hover = "large";
  assert.match(all(d).join("\n"), /hover is large/);
  d = real(); el(d, "card").rest = "small"; el(d, "card").hover = "base";
  assert.match(all(d).join("\n"), /hover is base/);
});

test("states: pressed goes down at most one tier or flat, never up; a card may drop to flat", () => {
  let d = real(); el(d, "card").pressed = "medium";
  assert.match(all(d).join("\n"), /pressed is medium/);
  d = real(); el(d, "dialog").pressed = "base";
  assert.match(all(d).join("\n"), /pressed is base/);
  d = real(); assert.deepEqual(validate(schema, d).concat(semanticProblems(d, ctx)), []);
  assert.equal(el(d, "card").pressed, "none");
});

test("states: a disabled element is flat or unchanged, and a dragged item never sits lower than rest", () => {
  let d = real(); el(d, "card").disabled = "large";
  assert.match(all(d).join("\n"), /disabled is large/);
  d = real(); el(d, "dragged-item").rest = "xlarge"; el(d, "dragged-item").dragged = "small";
  assert.match(all(d).join("\n"), /cannot sit lower than rest/);
});

test("layers: a tier outside its layer fails, and so does a layer lighter than the one below it", () => {
  let d = real(); el(d, "dialog").rest = "base"; el(d, "dialog").hover = "base"; el(d, "dialog").pressed = "base"; el(d, "dialog").disabled = "base";
  assert.match(all(d).join("\n"), /not allowed on the modal layer/);
  d = real(); d.layers.modal.tiers = ["small"];
  assert.match(all(d).join("\n"), /lighter than the layer below/);
  d = real(); d.layers.page.tiers = ["huge"];
  assert.match(all(d).join("\n"), /not a tier/);
});

test("dock: a docked element must be on an overlay or modal layer", () => {
  const d = real(); el(d, "card").dock = "right";
  assert.match(all(d).join("\n"), /only for an overlay or modal/);
});

test("identity: a duplicate id fails", () => {
  const d = real(); d.elements.push(structuredClone(d.elements[0]));
  assert.match(all(d).join("\n"), /duplicate id/);
});

test("built rows: a component must be named, must be a registry item, and its source must use the tier the map claims", () => {
  let d = real(); el(d, "card").component = null;
  assert.match(all(d).join("\n"), /must name its registry component/);
  d = real(); el(d, "card").component = "vois-nothing";
  assert.match(all(d).join("\n"), /not an item in registry/);
  d = real(); el(d, "dialog").rest = "xlarge"; el(d, "dialog").hover = "xlarge"; el(d, "dialog").pressed = "xlarge"; el(d, "dialog").disabled = "xlarge";
  assert.match(all(d).join("\n"), /never uses --shadow-xlarge/);
  d = real(); el(d, "sheet-right").component = "vois-dialog";
  assert.match(all(d).join("\n"), /no component yet/);
});

test("source match: a longer token name does not count (--shadow-small-hover is not --shadow-small)", () => {
  const d = real();
  const only = (name) => (n) => (n === "vois-switch" ? `x { box-shadow: var(--shadow-${name}-hover); }` : readComponent(n));
  const sw = d.elements.find((e) => e.id === "switch-knob");
  assert.ok(sw && sw.component === "vois-switch");
  const problems = semanticProblems(d, { registryItems, readComponent: only("small") });
  assert.match(problems.join("\n"), /switch-knob.*never uses --shadow-small/);
});

test("dragged: any layer may drag, but only to large or xlarge", () => {
  let d = real(); el(d, "dragged-item").layer = "page"; el(d, "dragged-item").dragged = "xlarge";
  assert.deepEqual(all(d), []);
  d = real(); el(d, "dragged-item").layer = "page"; el(d, "dragged-item").dragged = "large";
  assert.deepEqual(all(d), []);
  d = real(); el(d, "dragged-item").dragged = "base";
  assert.match(all(d).join("\n"), /must be large or xlarge/);
});

test("source match ignores comments", () => {
  const d = real();
  const commentOnly = (n) => (n === "vois-select" ? "/* uses --shadow-medium */ // --shadow-medium\nconst x = 1;" : readComponent(n));
  const problems = semanticProblems(d, { registryItems, readComponent: commentOnly });
  assert.match(problems.join("\n"), /select-list.*never uses --shadow-medium/);
});

test("schema checker: a $ref with a sibling keyword and a non-boolean additionalProperties are errors", () => {
  const root = { $defs: { t: { type: "string" } } };
  assert.match(validate({ ...root, $ref: "#/$defs/t", minLength: 3 }, "ab").join(), /cannot sit beside/);
  assert.match(validate({ type: "object", additionalProperties: { type: "string" } }, { a: 1 }).join(), /true or false/);
});

test("run as a script through a symlink still checks", async () => {
  const { symlinkSync } = await import("node:fs");
  const { spawnSync } = await import("node:child_process");
  const dir = mkdtempSync(join(tmpdir(), "elev-ln-"));
  try {
    const link = join(dir, "link.mjs");
    symlinkSync(new URL("./elevation-map.mjs", import.meta.url).pathname, link);
    const r = spawnSync(process.execPath, [link], { encoding: "utf8" });
    assert.match(r.stdout + r.stderr, /elevation-map: OK|problem/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("docked: a side-docked element needs a directional token for every tier it uses, in light and in dark", () => {
  let d = real(); assert.ok(shadowTokens.has("--shadow-large-right"));
  d = real(); el(d, "sheet-right").dock = "left"; assert.deepEqual(all(d), [], "left has its own token too");
  d = real(); el(d, "sheet-right").rest = "medium"; el(d, "sheet-right").hover = "medium"; el(d, "sheet-right").pressed = "medium"; el(d, "sheet-right").disabled = "medium";
  assert.match(all(d).join("\n"), /needs --shadow-medium-right/);
  // A token that exists only in light is not enough: dark needs it too.
  const lightOnly = new Set([...shadowTokens].filter((t) => t !== "--shadow-large-bottom"));
  assert.match(semanticProblems(real(), { registryItems, readComponent, shadowTokens: lightOnly }).join("\n"), /needs --shadow-large-bottom/);
  // No export: fail closed, never skip.
  assert.match(semanticProblems(real(), { registryItems, readComponent, shadowTokens: null }).join("\n"), /cannot be checked without registry\/source\/figma-export\.json/);
  // A centered element needs no directional token.
  assert.deepEqual(semanticProblems(real(), { registryItems, readComponent, shadowTokens: new Set() }).filter((p) => /dialog/.test(p)), []);
});

test("docked: a built side-docked element must use the directional token, not the all-sides one", () => {
  const d = real();
  Object.assign(el(d, "sheet-right"), { status: "built", component: "vois-dialog" });
  const dialogSrc = readComponent("vois-dialog");
  const problems = semanticProblems(d, { registryItems, readComponent: () => dialogSrc, shadowTokens });
  assert.match(problems.join("\n"), /sheet-right\]\.rest: vois-dialog never uses --shadow-large-right/);
  const ok = semanticProblems(d, { registryItems, readComponent: () => "x { box-shadow: var(--shadow-large-right); }", shadowTokens });
  assert.deepEqual(ok.filter((p) => /sheet-right/.test(p)), []);
});

test("lightAndDarkShadows: only tokens in both blocks count, and malformed input is null", () => {
  assert.deepEqual([...lightAndDarkShadows({ shadows: { "--a": [], "--b": [] }, darkShadows: { "--b": [], "--c": [] } })], ["--b"]);
  for (const bad of [null, [], "x", {}, { shadows: [] , darkShadows: {} }, { shadows: {}, darkShadows: "x" }, { shadows: {} }, { darkShadows: {} }, { shadows: { "--a": [] }, darkShadows: [] }]) assert.equal(lightAndDarkShadows(bad), null, JSON.stringify(bad));
  assert.ok(shadowTokens instanceof Set && shadowTokens.has("--shadow-large-left"), "the committed export gives all eight");
});

test("a missing export is reported once, not once per tier", () => {
  const root = mkdtempSync(join(tmpdir(), "elev3-"));
  try {
    mkdirSync(join(root, "vois-tokens", "data"), { recursive: true }); mkdirSync(join(root, "registry"), { recursive: true });
    for (const f of ["elevation-map.json", "elevation-map.schema.json"]) cpSync(new URL("../data/" + f, import.meta.url), join(root, "vois-tokens", "data", f));
    cpSync(new URL("../../registry/registry.json", import.meta.url), join(root, "registry", "registry.json"));
    const problems = checkAll({ skill: join(root, "vois-tokens"), repo: root }).filter((p) => /figma-export|docked element/.test(p));
    assert.equal(problems.length, 1, problems.join("\n"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("fail closed: without registry/source/figma-export.json the docked check reports a problem", () => {
  const root = mkdtempSync(join(tmpdir(), "elev2-"));
  try {
    mkdirSync(join(root, "vois-tokens", "data"), { recursive: true });
    mkdirSync(join(root, "registry"), { recursive: true });
    cpSync(new URL("../data/elevation-map.json", import.meta.url), join(root, "vois-tokens", "data", "elevation-map.json"));
    cpSync(new URL("../data/elevation-map.schema.json", import.meta.url), join(root, "vois-tokens", "data", "elevation-map.schema.json"));
    cpSync(new URL("../../registry/registry.json", import.meta.url), join(root, "registry", "registry.json"));
    assert.match(checkAll({ skill: join(root, "vois-tokens"), repo: root }).join("\n"), /figma-export\.json is missing or unreadable/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("malformed input never throws", () => {
  for (const bad of [null, [], "x", { elements: {} }, { elements: [null, 1, "x"] }, { layers: [], elements: [] }, { layers: { page: { tiers: [] } }, elements: [] }]) {
    assert.doesNotThrow(() => all(bad), JSON.stringify(bad));
  }
});

test("fail closed: without registry/registry.json the check reports a problem", () => {
  const root = mkdtempSync(join(tmpdir(), "elev-"));
  try {
    mkdirSync(join(root, "vois-tokens", "data"), { recursive: true });
    cpSync(new URL("../data/elevation-map.json", import.meta.url), join(root, "vois-tokens", "data", "elevation-map.json"));
    cpSync(new URL("../data/elevation-map.schema.json", import.meta.url), join(root, "vois-tokens", "data", "elevation-map.schema.json"));
    const problems = checkAll({ skill: join(root, "vois-tokens"), repo: root });
    assert.match(problems.join("\n"), /registry\/registry\.json is missing/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
