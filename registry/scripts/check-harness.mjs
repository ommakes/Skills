#!/usr/bin/env node
// Checks the accessibility harness (registry/harness/) against the registry, with no browser. CI runs it in the registry-build job.
//
//   1. Every registry:ui item is shown on at least one harness page, so a new component cannot skip the rendered check. A story names
//      the items it exercises (`items`), and each name must be a real item.
//   2. registry/vois-render.json is exactly what `node harness/build.mjs --manifest` writes from the stories. A page added without
//      running it, or a manifest edited by hand, fails here.
//   3. Story ids are unique, lowercase with dashes, and safe in a path.
//   4. registry/a11y-baseline.json is well formed, and every problem it lists is on a page (and a state) the manifest has, so a removed
//      page cannot leave a stale entry behind that would hide a new problem on a page added later with the same id.
//
// It never reads a browser result: the rendered check itself runs in the Accessibility workflow. Bad input fails closed.
//
// Usage: node registry/scripts/check-harness.mjs

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { manifestFor, storyList } from "../harness/build.mjs";

const registryDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEY_PARTS = 4; // check|surface|state|viewport, the shape a11y-baseline.mjs writes
const BASELINE_SCHEMA = "vois-a11y-baseline/1";
/** Item types that are a page's own wiring (tokens, theme, a helper file), not a component to render. */
const NOT_RENDERED = new Set(["registry:theme", "registry:lib", "registry:hook", "registry:file"]);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Returns the list of problems (empty when the harness is sound).
 * `registry` is registry.json, `stories` is storyList()'s result, `manifest` is vois-render.json, `baseline` is a11y-baseline.json
 * or null when the file does not exist.
 */
export function checkHarness({ registry, stories, manifest, baseline }) {
  const problems = [];
  const add = (m) => problems.push(m);

  if (!Array.isArray(registry?.items)) return ["registry.json has no items list"];
  if (!Array.isArray(stories) || stories.length === 0) return ["the harness has no stories"];

  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const items = new Map();
  for (const i of registry.items) {
    if (!isObj(i) || typeof i.name !== "string") add("registry.json has an item with no name");
    else items.set(i.name, i);
  }
  const ids = new Set();
  const shown = new Set();
  for (const s of stories) {
    if (!isObj(s)) { add("a story is not an object"); continue; }
    if (typeof s.id !== "string" || !ID.test(s.id)) add(`story id "${s.id}" must be lowercase letters, digits and dashes`);
    else if (ids.has(s.id)) add(`two stories share the id "${s.id}"`);
    else ids.add(s.id);
    if (typeof s.title !== "string" || s.title.trim() === "") add(`story "${s.id}" has no title`);
    if (!Array.isArray(s.items) || s.items.length === 0 || !s.items.every((n) => typeof n === "string")) {
      add(`story "${s.id}" must name the registry items it shows, as a list of item names (items: ["vois-button"])`);
      continue;
    }
    for (const n of s.items) {
      if (!items.has(n)) add(`story "${s.id}" names "${n}", which is not an item in registry.json`);
      else shown.add(n);
    }
    if (s.states !== undefined && !isObj(s.states)) { add(`story "${s.id}": states must be an object of state name to { expect }`); continue; }
    for (const [name, st] of Object.entries(s.states ?? {})) {
      if (!ID.test(name) || name === "default") add(`story "${s.id}": state "${name}" must be lowercase with dashes and not "default"`);
      // The manifest adds "<name>-dark" for every state, so a state called "open-dark" would be a second "open-dark".
      if (name.endsWith("-dark")) add(`story "${s.id}": state "${name}" ends in -dark, which the harness adds itself for the dark theme`);
      if (typeof st?.expect !== "string" || st.expect.trim() === "") add(`story "${s.id}": state "${name}" needs an expect selector`);
    }
  }
  for (const [name, item] of items) {
    if (NOT_RENDERED.has(item.type) || shown.has(name)) continue;
    add(`registry item "${name}" is on no harness page. Add a story for it in harness/src/stories/ (or list it in another story's items), then run: node harness/build.mjs --manifest`);
  }

  if (manifest === null || manifest === undefined) add("registry/vois-render.json is missing. Run: node harness/build.mjs --manifest");
  // With a broken story there is nothing sound to compare the manifest with, and building it from one could throw.
  else if (problems.length === 0 && !same(manifest, manifestFor(stories))) add("registry/vois-render.json does not match the stories. Run: node harness/build.mjs --manifest");

  if (baseline !== null && baseline !== undefined) {
    const surfaces = new Map();
    for (const s of Array.isArray(manifest?.surfaces) ? manifest.surfaces : []) {
      if (isObj(s)) surfaces.set(s.id, new Set(["default", ...(Array.isArray(s.states) ? s.states : []).map((x) => x?.id)]));
    }
    const viewports = new Set(["mobile", "desktop"]);
    if (baseline?.schema !== BASELINE_SCHEMA) add(`a11y-baseline.json must have schema "${BASELINE_SCHEMA}"`);
    else if (!Array.isArray(baseline.known) || !baseline.known.every((k) => typeof k === "string")) add("a11y-baseline.json: known must be a list of strings");
    else {
      const seen = new Set();
      for (const k of baseline.known) {
        const parts = k.split("|");
        if (parts.length !== KEY_PARTS || parts.some((p) => p === "")) { add(`a11y-baseline.json: "${k}" is not check|surface|state|viewport`); continue; }
        if (seen.has(k)) add(`a11y-baseline.json lists "${k}" twice`);
        seen.add(k);
        const [check, surface, state, viewport] = parts;
        // The check names render-check writes: focus-visible, horizontal-overflow, axe:color-contrast and so on.
        if (!/^(?:axe:)?[a-z0-9][a-z0-9-]*$/.test(check)) add(`a11y-baseline.json: "${k}" starts with "${check}", which is not a check name`);
        if (!surfaces.has(surface)) add(`a11y-baseline.json: "${k}" is on page "${surface}", which the manifest does not have`);
        else if (!surfaces.get(surface).has(state)) add(`a11y-baseline.json: "${k}" is on state "${state}", which page "${surface}" does not have`);
        if (!viewports.has(viewport)) add(`a11y-baseline.json: "${k}" has viewport "${viewport}", and the manifest uses mobile and desktop`);
      }
    }
  }
  return problems;
}

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let problems;
  try {
    problems = checkHarness({
      registry: readJson(join(registryDir, "registry.json")),
      stories: await storyList(),
      manifest: readJson(join(registryDir, "vois-render.json")),
      baseline: readJson(join(registryDir, "a11y-baseline.json")),
    });
  } catch (e) {
    problems = [`could not read the harness: ${String(e.message).split("\n")[0]}`];
  }
  if (problems.length) {
    for (const p of problems) console.error(`FAIL  ${p}`);
    process.exit(1);
  }
  console.log("ok    every registry:ui item is on a harness page, and the manifest and baseline match the stories");
}
