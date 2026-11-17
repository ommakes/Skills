// Tests for vois/panel-layout/panel-logic.ts. The decision it makes is the one in vois-tokens scripts/grid-logic.mjs
// (pushFits, navWhilePushOpen), which is the reference, so this compares the two at every window width from
// 300 to 1600 for all three push widths. It also checks that a token that is missing or not a plain px length
// makes the answer "full" (a full-screen panel), never "push".
// Run: node registry/scripts/panel-logic.test.mjs (needs `npm ci` in registry/ for esbuild).
import { readFileSync } from "node:fs";
import { transform } from "esbuild";
import assert from "node:assert/strict";
import test from "node:test";

const here = (p) => new URL(p, import.meta.url);
const { code } = await transform(readFileSync(here("../vois/panel-layout/panel-logic.ts"), "utf8"), { loader: "ts", format: "esm" });
const L = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
const G = await import(here("../../vois-tokens/scripts/grid-logic.mjs").href);

// The token values come from the token file the registry ships, so a change there is tested too.
const css = readFileSync(here("../vois/tokens/vois-tokens.css"), "utf8");
const px = (name) => {
  const m = css.match(new RegExp(`(?:^|\\s)${name}:\\s*(\\d+(?:\\.\\d+)?)px;`));
  assert.ok(m, `${name} is a px token in vois-tokens.css`);
  return m[1] + "px";
};
const NAMES = ["--breakpoint-md", "--breakpoint-lg", "--nav-rail", "--nav-sidebar", "--main-min", "--panel-push-min", "--panel-push-default", "--panel-push-max"];
const values = Object.fromEntries(NAMES.map((n) => [n, px(n)]));
const withStub = (vals, fn) => {
  globalThis.getComputedStyle = () => ({ getPropertyValue: (n) => (Object.hasOwn(vals, n) ? vals[n] : "") });
  try { return fn(); } finally { delete globalThis.getComputedStyle; }
};
const tokens = withStub(values, () => L.readPanelTokens({}));
const num = (n) => parseFloat(values[n]);
const T = {
  grid: { classes: [{ id: "narrow", min: 360, cols: 4 }, { id: "sm", min: 600, cols: 8 }, { id: "md", min: num("--breakpoint-md"), cols: 8 }, { id: "lg", min: num("--breakpoint-lg"), cols: 12 }], margin: { from: { w: 360, v: 16 }, to: { w: 1024, v: 32 } }, gutter: { from: { w: 600, v: 16 }, to: { w: 768, v: 24 } }, contentMax: 1200 },
  nav: { rail: num("--nav-rail"), sidebar: num("--nav-sidebar") },
  panel: { pushMin: num("--panel-push-min"), pushDefault: num("--panel-push-default"), pushMax: num("--panel-push-max"), mainMin: num("--main-min"), overlayMin: 320, overlay: { sm: 360, md: 480, lg: 640 }, paneMin: 360 },
};

test("the tokens are read in pixels", () => {
  assert.equal(tokens.md, num("--breakpoint-md"));
  assert.equal(tokens.rail, num("--nav-rail"));
  assert.deepEqual(tokens.push, { min: num("--panel-push-min"), default: num("--panel-push-default"), max: num("--panel-push-max") });
});

test("mode matches grid-logic at every width and push width", () => {
  for (const key of ["min", "default", "max"]) for (let w = 300; w <= 1600; w++) {
    const want = w < T.grid.classes[2].min ? "full" : G.pushFits(T, w, tokens.push[key]) ? "push" : "overlay";
    assert.equal(L.panelMode(tokens, w, key), want, `window ${w}, ${key}`);
  }
});

test("the 320 and 400 push panels switch where grid.md says (880 and 960 with the default tokens)", () => {
  assert.equal(L.panelMode(tokens, 879, "default"), "overlay");
  assert.equal(L.panelMode(tokens, 880, "default"), "push");
  assert.equal(L.panelMode(tokens, 959, "max"), "overlay");
  assert.equal(L.panelMode(tokens, 960, "max"), "push");
  assert.equal(L.panelMode(tokens, 767, "default"), "full");
});

test("nav mode matches grid-logic: bottom, rail, sidebar, and the sidebar folds while a push panel is open", () => {
  for (const key of ["min", "default", "max"]) for (let w = 300; w <= 1600; w++) {
    for (const pushOpen of [false, true]) {
      let want;
      if (w < T.grid.classes[2].min) want = "bottom";
      else if (w < T.grid.classes[3].min) want = "rail";
      else if (pushOpen) want = G.navWhilePushOpen(T, w, tokens.push[key]) === T.nav.sidebar ? "sidebar" : "rail";
      else want = "sidebar";
      assert.equal(L.navMode(tokens, w, pushOpen, key), want, `window ${w}, ${key}, pushOpen ${pushOpen}`);
    }
  }
});

test("the sidebar folds to the rail from 1024 to 1039 and is full from 1040 with a 320 panel (grid.md)", () => {
  assert.equal(L.navMode(tokens, 1023, true, "default"), "rail");
  assert.equal(L.navMode(tokens, 1024, true, "default"), "rail");
  assert.equal(L.navMode(tokens, 1039, true, "default"), "rail");
  assert.equal(L.navMode(tokens, 1040, true, "default"), "sidebar");
  assert.equal(L.navMode(tokens, 1040, false, "default"), "sidebar");
});

test("a token that is missing or not a plain px length reads as null, and the mode is full", () => {
  for (const name of NAMES) {
    for (const bad of [undefined, "", "banana", "1rem", "NaN", "-5px", "+5px", "320", "12px 4px", "calc(1px + 2px)"]) {
      const vals = { ...values };
      if (bad === undefined) delete vals[name]; else vals[name] = bad;
      const t = withStub(vals, () => L.readPanelTokens({}));
      assert.equal(t, null, `${name} = ${JSON.stringify(bad)}`);
      assert.equal(L.panelMode(t, 1600, "default"), "full");
    }
  }
});

test("an unreadable window or an unknown push width is full, never push", () => {
  for (const w of [null, undefined, NaN, Infinity, "900"]) assert.equal(L.panelMode(tokens, w, "default"), "full", String(w));
  for (const key of ["huge", "toString", "__proto__", ""]) assert.equal(L.panelMode(tokens, 1600, key), "full", String(key));
  assert.equal(L.navMode(null, 1600, true), "bottom");
  assert.equal(L.navMode(tokens, NaN, true), "bottom");
});
