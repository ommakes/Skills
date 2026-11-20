#!/usr/bin/env node
// Tests for check-harness.mjs and the small pure parts of the harness build and server. Run: node registry/scripts/check-harness.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { aliasMap, manifestFor, storyList } from "../harness/build.mjs";
import { pick } from "../harness/serve.mjs";
import { checkHarness } from "./check-harness.mjs";

const registryDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(readFileSync(join(registryDir, f), "utf8"));
const clone = (v) => JSON.parse(JSON.stringify(v));

const registry = read("registry.json");
const stories = await storyList();
const goodInputs = () => ({ registry: clone(registry), stories: clone(stories), manifest: manifestFor(clone(stories)), baseline: read("a11y-baseline.json") });
const problems = (mutate) => {
  const i = goodInputs();
  mutate(i);
  return checkHarness(i);
};
const has = (list, re) => list.some((p) => re.test(p));

test("the real harness passes", () => {
  assert.deepEqual(checkHarness({ registry, stories, manifest: read("vois-render.json"), baseline: read("a11y-baseline.json") }), []);
});

test("a registry:ui item on no page fails, and a theme, lib or file item does not need one", () => {
  const list = problems((i) => i.registry.items.push({ name: "vois-newthing", type: "registry:ui", files: [] }));
  assert.ok(has(list, /"vois-newthing" is on no harness page/), list.join("\n"));
  assert.deepEqual(problems((i) => i.registry.items.push({ name: "vois-x", type: "registry:theme", files: [] }, { name: "vois-y", type: "registry:lib", files: [] }, { name: "vois-z", type: "registry:file", files: [] })), []);
});

test("removing the only story for an item fails, and removing one of two does not", () => {
  const only = problems((i) => { i.stories = i.stories.filter((s) => s.id !== "avatar"); i.manifest = manifestFor(i.stories); });
  assert.ok(has(only, /"vois-avatar" is on no harness page/), only.join("\n"));
  // vois-spinner is on the spinner page and on the button page, so the spinner page can go.
  assert.deepEqual(problems((i) => { i.stories = i.stories.filter((s) => s.id !== "spinner"); i.manifest = manifestFor(i.stories); i.baseline = null; }), []);
});

test("a story that names an unknown item, or no items, fails", () => {
  assert.ok(has(problems((i) => { i.stories[0].items = ["vois-nope"]; i.manifest = manifestFor(i.stories); }), /"vois-nope", which is not an item/));
  for (const bad of [[], undefined, null, "vois-button", [5], [null]]) {
    const list = problems((i) => { i.stories[0].items = bad; i.manifest = manifestFor(i.stories); });
    assert.ok(has(list, /must name the registry items it shows/), JSON.stringify(bad));
  }
});

test("story ids: duplicates, capitals and path characters fail", () => {
  assert.ok(has(problems((i) => { i.stories[1].id = i.stories[0].id; i.manifest = manifestFor(i.stories); }), /share the id/));
  for (const bad of ["Button", "a/b", "../x", "a b", "a_b", "-a", "a-", "", "a--b", "é"]) {
    const list = problems((i) => { i.stories[0].id = bad; i.manifest = manifestFor(i.stories); });
    assert.ok(has(list, /must be lowercase letters, digits and dashes/), JSON.stringify(bad));
  }
});

test("a state needs a lowercase name that is not default, and an expect selector", () => {
  const withState = (name, st) => problems((i) => { i.stories[0].states = { [name]: st }; });
  assert.ok(has(withState("default", { expect: "a" }), /not "default"/));
  assert.ok(has(withState("Open", { expect: "a" }), /lowercase/));
  for (const st of [{}, { expect: "" }, { expect: "   " }, { expect: 5 }, null]) assert.ok(has(withState("open", st), /needs an expect selector/), JSON.stringify(st));
});

test("a state ending in -dark is refused, because the manifest adds <name>-dark itself", () => {
  const list = problems((i) => { i.stories[0].states = { open: { expect: "a" }, "open-dark": { expect: "a" } }; });
  assert.ok(has(list, /state "open-dark" ends in -dark/), list.join("\n"));
  assert.ok(has(problems((i) => { i.stories[0].states = { "dark": { expect: "a" } }; }), /ends in -dark/) === false, "a state that is only the word dark is not a suffix");
});

test("odd shapes return problems and do not throw", () => {
  for (const bad of [null, 5, "x", [], undefined]) {
    assert.doesNotThrow(() => problems((i) => { i.stories.push(bad); }), `story ${JSON.stringify(bad)}`);
    assert.ok(problems((i) => { i.stories.push(bad); }).length > 0, `story ${JSON.stringify(bad)}`);
    assert.doesNotThrow(() => problems((i) => { i.registry.items.push(bad); }), `item ${JSON.stringify(bad)}`);
    assert.ok(problems((i) => { i.registry.items.push(bad); }).length > 0, `item ${JSON.stringify(bad)}`);
  }
  for (const bad of ["x", 5, [], null, ["a"]]) {
    assert.ok(problems((i) => { i.stories[0].states = bad; }).length > 0 || bad === null, `states ${JSON.stringify(bad)}`);
  }
  assert.doesNotThrow(() => problems((i) => { i.manifest = { surfaces: "nope" }; }));
  assert.doesNotThrow(() => problems((i) => { i.manifest = { surfaces: [null, 5, { id: "x", states: "y" }] }; }));
});

test("a stories list that is empty or not a list fails closed", () => {
  for (const bad of [[], null, undefined, {}]) assert.ok(checkHarness({ ...goodInputs(), stories: bad }).length > 0, JSON.stringify(bad));
  for (const bad of [null, {}, { items: "x" }]) assert.ok(checkHarness({ ...goodInputs(), registry: bad }).length > 0, JSON.stringify(bad));
});

test("the manifest must be exactly what the stories give", () => {
  assert.ok(has(problems((i) => { i.manifest = null; }), /vois-render.json is missing/));
  assert.ok(has(problems((i) => { i.manifest.surfaces.push({ id: "extra", path: "/extra" }); }), /does not match the stories/));
  assert.ok(has(problems((i) => { i.manifest.surfaces.pop(); }), /does not match the stories/));
  assert.ok(has(problems((i) => { i.manifest.surfaces[0].path = "/elsewhere"; }), /does not match the stories/));
  assert.ok(has(problems((i) => { i.manifest.requiredStates = ["empty"]; }), /does not match the stories/));
  assert.ok(has(problems((i) => { const s = i.manifest.surfaces.find((x) => x.states); s.states.pop(); }), /does not match the stories/));
});

test("manifestFor gives each extra state in both themes, and none for a page without states", () => {
  const m = manifestFor([{ id: "a", states: {} }, { id: "b", states: { open: { expect: ".x" } } }]);
  assert.deepEqual(m.surfaces[0], { id: "a", path: "/a" });
  assert.deepEqual(m.surfaces[1].states, [
    { id: "open", path: "/b?state=open&theme=light", expect: ".x" },
    { id: "open-dark", path: "/b?state=open&theme=dark", expect: ".x" },
  ]);
  assert.deepEqual(m.requiredStates, []);
});

test("the baseline: wrong shape, bad keys, stale pages and states fail; no file is fine", () => {
  assert.deepEqual(problems((i) => { i.baseline = null; }), []);
  assert.ok(has(problems((i) => { i.baseline = { schema: "x", known: [] }; }), /must have schema/));
  assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: "a|b|c|d" }; }), /known must be a list of strings/));
  assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: [5] }; }), /known must be a list of strings/));
  for (const bad of ["a|b|c", "a|b|c|d|e", "a||c|desktop", "|button|default|desktop", "", "axe:x|button|default|"]) {
    assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: [bad] }; }), /is not check\|surface\|state\|viewport/), JSON.stringify(bad));
  }
  assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: ["axe:x|gone|default|desktop"] }; }), /page "gone", which the manifest does not have/));
  assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: ["axe:x|button|open|desktop"] }; }), /state "open", which page "button" does not have/));
  assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: ["axe:x|button|default|tablet"] }; }), /viewport "tablet"/));
  for (const bad of ["zzz yyy|button|default|desktop", "Axe:x|button|default|desktop", "axe:|button|default|desktop", "-x|button|default|desktop", "axe:x y|button|default|desktop"]) {
    assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: [bad] }; }), /is not a check name/), JSON.stringify(bad));
  }
  assert.deepEqual(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: ["focus-visible|button|default|desktop", "axe:color-contrast|button|default|mobile"] }; }), []);
  assert.ok(has(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: ["axe:x|button|default|desktop", "axe:x|button|default|desktop"] }; }), /twice/));
  assert.deepEqual(problems((i) => { i.baseline = { schema: "vois-a11y-baseline/1", known: ["axe:x|select|open-dark|mobile"] }; }), [], "a real state, including a dark one, is accepted");
});

test("every baseline entry in the repo is on a real page and state", () => {
  const baseline = read("a11y-baseline.json");
  assert.ok(baseline.known.length > 0);
  assert.deepEqual(checkHarness({ registry, stories, manifest: read("vois-render.json"), baseline }), []);
});

test("aliasMap: install targets become @/ paths, utils is the harness's own, and two files on one target throw", () => {
  const map = aliasMap(registry);
  assert.ok(map.get("@/components/ui/button").endsWith("vois/button/button.tsx"));
  assert.ok(map.get("@/lib/panel-logic").endsWith("vois/panel-layout/panel-logic.ts"));
  assert.ok(map.get("@/components/ui/questionnaire/question").endsWith("vois/questionnaire/question.tsx"));
  assert.ok(map.get("@/lib/utils").includes("harness"));
  assert.equal(map.has("@/styles/vois-tokens"), false, "css files are not importable modules");
  const dup = { items: [{ files: [{ path: "vois/a.tsx", target: "components/ui/a.tsx" }] }, { files: [{ path: "vois/b.tsx", target: "components/ui/a.tsx" }] }] };
  assert.throws(() => aliasMap(dup), /two registry files install to components\/ui\/a.tsx/);
});

test("the server answers app.js and app.css by name and everything else with the page", () => {
  assert.deepEqual(pick("/app.js"), { file: "app.js", type: "text/javascript; charset=utf-8" });
  assert.deepEqual(pick("/app.css?x=1"), { file: "app.css", type: "text/css; charset=utf-8" });
  for (const u of ["/", "/button", "/button?state=open&theme=dark", "/../package.json", "/app.js/../../package.json", "//evil.example/app.js", "/APP.JS", "/%2e%2e/secret", "/app.js.map", "/app.jsx", "/app.css/x", "", "app.js"]) {
    assert.deepEqual(pick(u), { file: "index.html", type: "text/html; charset=utf-8" }, u);
  }
  assert.equal(pick("/app.js#frag").file, "app.js");
  // Names every plain object inherits must not count as a file.
  for (const u of ["constructor", "toString", "__proto__", "hasOwnProperty", "/constructor", "/__proto__", "/toString"]) {
    assert.deepEqual(pick(u), { file: "index.html", type: "text/html; charset=utf-8" }, u);
  }
});
