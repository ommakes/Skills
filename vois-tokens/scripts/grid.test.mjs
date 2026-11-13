// Run with: node grid.test.mjs
// No new dependency: uses Node's built-in test runner.
// Covers the maths in grid-logic.mjs against the rules in references/grid.md, and the
// integrity of the layout data in vois-patterns/data/page-templates.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as g from "./grid-logic.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const FIX = JSON.parse(readFileSync(join(HERE, "grid-fixture.json"), "utf8"));
const T = FIX.tokens;
const SCALE = readFileSync(join(ROOT, "vois-tokens/references/spacing.md"), "utf8").match(/\*\*Allowed values:\*\*\s*([\d, ]+)px/)[1].split(",").map(Number);
const WIDTHS = Array.from({ length: 2560 - 360 + 1 }, (_, i) => 360 + i);

// ---- tokens and fixture

test("fixture: names, logic tokens and the grid.md class order agree", () => {
  const n = (k) => FIX.named[k].value;
  assert.deepEqual(T.grid.classes.map((c) => c.id), ["narrow", "snug", "roomy", "wide"]);
  assert.deepEqual(T.grid.classes.map((c) => c.min), [n("--width-viewport-min"), n("--breakpoint-snug"), n("--breakpoint-roomy"), n("--breakpoint-wide")]);
  assert.equal(T.grid.contentMax, n("--grid-content-max"));
  assert.equal(T.nav.rail, n("--nav-rail"));
  assert.equal(T.nav.sidebar, n("--nav-sidebar"));
  assert.equal(T.panel.pushMin, n("--panel-push-min"));
  assert.equal(T.panel.pushDefault, n("--panel-push-default"));
  assert.equal(T.panel.pushMax, n("--panel-push-max"));
  assert.equal(T.panel.mainMin, n("--main-min"));
  assert.equal(T.panel.overlay.sm, n("--panel-overlay-sm"));
  assert.equal(T.panel.overlay.md, n("--panel-overlay-md"));
  assert.equal(T.panel.overlay.lg, n("--panel-overlay-lg"));
  assert.equal(T.panel.overlayMin, n("--panel-overlay-min"));
  assert.equal(T.panel.paneMin, n("--pane-min"));
});

test("DS-GRID-004: the end values of margin and gutter are on the spacing scale", () => {
  for (const a of [T.grid.margin, T.grid.gutter]) {
    assert.ok(SCALE.includes(a.from.v), `from ${a.from.v}`);
    assert.ok(SCALE.includes(a.to.v), `to ${a.to.v}`);
  }
});

test("DS-GRID-004: interpolate is flat outside the anchors and linear between them", () => {
  const a = { from: { w: 100, v: 16 }, to: { w: 200, v: 32 } };
  assert.equal(g.interpolate(a, 0), 16);
  assert.equal(g.interpolate(a, 100), 16);
  assert.equal(g.interpolate(a, 150), 24);
  assert.equal(g.interpolate(a, 200), 32);
  assert.equal(g.interpolate(a, 9999), 32); // guard from the other side: no extrapolation past the end
});

// ---- grid classes, shell, frame

test("DS-GRID-001: class edges", () => {
  const id = (w) => g.classOf(T, w).id;
  assert.equal(id(100), "narrow"); // below the lowest min still gets the lowest class
  assert.equal(id(360), "narrow");
  assert.equal(id(599), "narrow");
  assert.equal(id(600), "snug");
  assert.equal(id(767), "snug");
  assert.equal(id(768), "roomy");
  assert.equal(id(1023), "roomy");
  assert.equal(id(1024), "wide");
  assert.equal(id(5000), "wide");
});

test("DS-GRID-002: navigation by window width, and the region is what is left", () => {
  assert.equal(g.navFor(T, 767, "app"), 0);
  assert.equal(g.navFor(T, 768, "app"), 80);
  assert.equal(g.navFor(T, 1023, "app"), 80);
  assert.equal(g.navFor(T, 1024, "app"), 240);
  for (const w of [360, 800, 1500]) assert.equal(g.navFor(T, w, "site"), 0); // the site shell never has side nav
  assert.equal(g.regionWidth(T, 1440, "app"), 1200);
  assert.equal(g.regionWidth(T, 1440, "site"), 1440);
});

test("DS-GRID-001: the app shell picks the class from the region, not the window", () => {
  // A 768 window has an 80 rail, so the region is 688 and that is `snug`, though the window is `roomy`.
  assert.equal(g.classOf(T, g.regionWidth(T, 768, "app")).id, "snug");
  assert.equal(g.classOf(T, 768).id, "roomy");
});

test("DS-GRID-003: content never passes the content max", () => {
  for (const w of WIDTHS) assert.ok(g.frame(T, w).inner <= T.grid.contentMax + 1e-9, `w=${w}`);
  assert.equal(g.frame(T, 1920).inner, 1200);
  assert.equal(g.frame(T, 360).inner, 360 - 2 * 16);
});

// ---- collections

const ROWS = {
  "Metric cards (app)": ["app", { narrow: 2, snug: 2, roomy: 2, wide: 4 }, 152],
  "Browse cards": ["site", { narrow: 2, snug: 3, roomy: 3, wide: 4 }, 152],
  "Feature and story cards": ["site", { narrow: 1, snug: 2, roomy: 2, wide: 3 }, 264],
  "Plans x4": ["site", { narrow: 1, snug: 1, roomy: 2, wide: 4 }, 216],
  "Plans x3": ["site", { narrow: 1, snug: 1, roomy: 3, wide: 3 }, 216],
  Logos: ["site", { narrow: 3, snug: 4, roomy: 6, wide: 8 }, 96],
  Integrations: ["site", { narrow: 4, snug: 6, roomy: 6, wide: 8 }, 64],
};
const PROBES = { narrow: [360, 599], snug: [600, 767], roomy: [768, 1023], wide: [1024, 1100, 1264, 1920] };

test("DS-GRID-007: each collection reaches its cap at the start and end of every class", () => {
  for (const [name, [shell, cap, min]] of Object.entries(ROWS))
    for (const [cls, ws] of Object.entries(PROBES))
      for (const w of ws) assert.equal(g.collectionCols(T, w, shell, cap, min), cap[cls], `${name} ${shell} ${cls} ${w}`);
});

test("DS-GRID-007: a count is never above the cap, never below 1, and an item is never under itemMin", () => {
  for (const [name, [shell, cap, min]] of Object.entries(ROWS))
    for (const w of WIDTHS) {
      const n = g.collectionCols(T, w, shell, cap, min);
      const rw = g.regionWidth(T, w, shell);
      const f = g.frame(T, rw);
      assert.ok(n >= 1 && n <= cap[g.classOf(T, w).id], `${name} ${w}: ${n}`);
      if (n > 1) assert.ok((f.inner - (n - 1) * f.gutter) / n >= min - 1e-9, `${name} ${w}: ${n} columns make items under ${min}`);
    }
});

test("DS-GRID-007: a narrower container than the region gives fewer columns", () => {
  const wide = g.collectionCols(T, 1440, "site", { wide: 8 }, 96);
  const inCard = g.collectionCols(T, 1440, "site", { wide: 8 }, 96, 400);
  assert.ok(inCard < wide);
  assert.equal(g.collectionCols(T, 1440, "site", { wide: 8 }, 96, 50), 1); // too small still gives one column
});

test("DS-GRID-007: the site shell never loses columns as the window grows", () => {
  for (const [name, [shell, cap, min]] of Object.entries(ROWS)) {
    if (shell !== "site") continue; // the app shell steps its nav at 768 and 1024, so the region can shrink there
    let prev = 0;
    for (const w of WIDTHS) {
      const n = g.collectionCols(T, w, shell, cap, min);
      assert.ok(n >= prev, `${name}: ${prev} columns at ${w - 1}, ${n} at ${w}`);
      prev = n;
    }
  }
});

test("DS-GRID-003 and DS-GRID-007: a fill page is not capped at the content max", () => {
  assert.equal(g.frame(T, 1920).inner, 1200);
  assert.equal(g.frame(T, 1920, { fill: true }).inner, 1920 - 2 * 32);
  const cap = { wide: 12 };
  assert.ok(g.collectionCols(T, 1920, "site", cap, 96, undefined, { fill: true }) > g.collectionCols(T, 1920, "site", cap, 96));
});

test("DS-GRID-007: a container uses its own width, without the page margins", () => {
  // 400 wide, items 96, gutter 24: floor((400 + 24) / 120) = 3. With margins taken off again it would be 2.
  assert.equal(g.collectionCols(T, 1440, "site", { wide: 8 }, 96, 400), 3);
});

test("fails closed: bad tokens, shells, tiers, caps and numbers throw and never return NaN", () => {
  const bad = (fn) => assert.throws(fn, /grid-logic:/);
  bad(() => g.collectionCols(T, 1440, "site", { narrow: 2 }, 96)); // no cap for the window class
  bad(() => g.collectionCols(T, 1440, "site", { wide: 0 }, 96));
  bad(() => g.collectionCols(T, 1440, "site", { wide: 2.5 }, 96));
  bad(() => g.collectionCols(T, 1440, "site", { wide: 8 }, 96, NaN));
  bad(() => g.overlayWidth(T, 1000, "xl"));
  bad(() => g.navFor(T, 1200, "App")); // a typo'd shell is an error, not the site shell
  bad(() => g.regionWidth(T, NaN, "app"));
  const reversed = structuredClone(T);
  reversed.grid.classes.reverse();
  bad(() => g.classOf(reversed, 1100));
  const renamed = structuredClone(T);
  renamed.grid.classes[1].id = "medium"; // mins still in order, so only the id check can catch it
  bad(() => g.frame(renamed, 800));
  const fewer = structuredClone(T);
  fewer.grid.classes.pop();
  bad(() => g.navFor(fewer, 1000, "app"));
  const flat = structuredClone(T);
  flat.grid.margin.to.w = flat.grid.margin.from.w;
  bad(() => g.frame(flat, 800));
  const nonnum = structuredClone(T);
  nonnum.panel.mainMin = "480";
  bad(() => g.pushFits(nonnum, 1000));
});

// ---- panels

test("DS-PANEL-002 and DS-PANEL-003: push needs a roomy window and room for the main area", () => {
  assert.equal(g.pushFits(T, 767), false);
  assert.equal(g.pushFits(T, 879), false);
  assert.equal(g.pushFits(T, 880), true); // 880 - 80 - 320 = 480
  assert.equal(g.pushFits(T, 959, 400), false);
  assert.equal(g.pushFits(T, 960, 400), true); // 960 - 80 - 400 = 480
});

test("DS-PANEL-003: once a panel pushes, it keeps pushing as the window grows", () => {
  for (const p of [T.panel.pushMin, T.panel.pushDefault, T.panel.pushMax]) {
    let seen = false;
    for (const w of WIDTHS) {
      const f = g.pushFits(T, w, p);
      if (seen) assert.ok(f, `panel ${p} stops pushing at ${w}`);
      seen = seen || f;
    }
    assert.ok(seen);
  }
});

test("DS-PANEL-004: the sidebar gives way before the panel does, and main never drops under mainMin", () => {
  assert.equal(g.navWhilePushOpen(T, 1023), 80);
  assert.equal(g.navWhilePushOpen(T, 1024), 80); // 1024 - 240 - 320 = 464, under 480
  assert.equal(g.navWhilePushOpen(T, 1039), 80);
  assert.equal(g.navWhilePushOpen(T, 1040), 240); // 1040 - 240 - 320 = 480
  assert.equal(g.navWhilePushOpen(T, 1119, 400), 80);
  assert.equal(g.navWhilePushOpen(T, 1120, 400), 240);
  for (const p of [T.panel.pushMin, T.panel.pushDefault, T.panel.pushMax])
    for (const w of WIDTHS) {
      if (!g.pushFits(T, w, p)) continue;
      assert.ok(w - g.navWhilePushOpen(T, w, p) - p >= T.panel.mainMin, `w=${w} panel=${p}`);
    }
});

test("DS-PANEL-006: overlay width", () => {
  for (const w of [360, 600, 767]) assert.equal(g.overlayWidth(T, w, "lg"), w); // phones: full screen
  assert.equal(g.overlayWidth(T, 768, "md"), 384);
  assert.equal(g.overlayWidth(T, 768, "lg"), 384);
  assert.equal(g.overlayWidth(T, 959, "md"), 476);
  assert.equal(g.overlayWidth(T, 960, "md"), 480);
  assert.equal(g.overlayWidth(T, 1279, "lg"), 636);
  assert.equal(g.overlayWidth(T, 1280, "lg"), 640);
  assert.equal(g.overlayWidth(T, 771, "sm"), 360);
  for (const tier of ["sm", "md", "lg"])
    for (const w of WIDTHS) {
      if (w < 768) continue;
      const o = g.overlayWidth(T, w, tier);
      assert.equal(o % 4, 0, `${tier} ${w}`);
      assert.ok(o >= T.panel.overlayMin && o <= T.panel.overlay[tier], `${tier} ${w}: ${o}`);
      assert.ok(o <= Math.max(T.panel.overlayMin, w / 2), `${tier} ${w}: covers more than half`);
    }
});

test("DS-PANEL-006: --panel-overlay-min holds when half the window is smaller than it", () => {
  // With the default values the min never binds (half of 768 is already 384), so change the token to try the guard.
  const t2 = structuredClone(T);
  t2.panel.overlayMin = 400;
  assert.equal(g.overlayWidth(t2, 768, "lg"), 400);
  assert.equal(g.overlayWidth(t2, 768, "sm"), 400); // a tier under the min is lifted to it
  assert.equal(g.overlayWidth(t2, 1280, "lg"), 640);
});

test("DS-PANEL-007: two panes from 800, and they stay on as the window grows", () => {
  assert.equal(g.twoPaneFits(T, 799), false);
  assert.equal(g.twoPaneFits(T, 800), true);
  let seen = false;
  for (const w of WIDTHS) {
    const f = g.twoPaneFits(T, w);
    if (seen) assert.ok(f, `stops at ${w}`);
    seen = seen || f;
  }
});

// ---- the worked example in grid.md matches the maths

test("grid.md example table matches the maths", () => {
  const md = read("vois-tokens/references/grid.md");
  const first = (fn) => WIDTHS.find(fn);
  const lines = [
    `Pushes from a window of ${first((w) => g.pushFits(T, w, 320))}`,
    `Pushes from a window of ${first((w) => g.pushFits(T, w, 400))}`,
    `Sidebar shows as the rail from ${T.grid.classes[3].min} to ${first((w) => g.navWhilePushOpen(T, w, 320) === 240) - 1}, full sidebar from ${first((w) => g.navWhilePushOpen(T, w, 320) === 240)}`,
    `\`md\` and \`lg\` overlays are both ${g.overlayWidth(T, 768, "md")}`,
    `\`md\` overlay reaches its full width at ${first((w) => w >= 768 && g.overlayWidth(T, w, "md") === 480)}, \`lg\` at ${first((w) => w >= 768 && g.overlayWidth(T, w, "lg") === 640)}`,
    `Two panes from a window of ${first((w) => g.twoPaneFits(T, w))}`,
  ];
  for (const l of lines) assert.ok(md.includes(l), `grid.md is missing or wrong: ${l}`);
});

// ---- layout data in the page templates

const TEMPLATES = JSON.parse(read("vois-patterns/data/page-templates.json"));
const CLASS_IDS = T.grid.classes.map((c) => c.id);
const TOKEN_FIELD = /^--[a-z0-9-]+$/;

/** Returns a list of problems with one template's layout. Used by the test and tested itself below. */
const own = (o, k) => Object.hasOwn(o, k);
const BELOW = ["fullscreen", "detail-page", "inline-row", "push-screen"];
export function layoutProblems(t, tokens = FIX.named) {
  const out = [];
  const l = t.layout;
  if (!l || typeof l !== "object") return [`${t.id}: no layout`];
  if (!["app", "site"].includes(l.shell)) out.push(`${t.id}: shell ${l.shell}`);
  if (!["contained", "fill"].includes(l.frame)) out.push(`${t.id}: frame ${l.frame}`);
  for (const k of ["regions", "collections", "panels"]) if (!Array.isArray(l[k])) out.push(`${t.id}: ${k} is not a list`);
  const tok = (x, where) => { if (typeof x !== "string" || !own(tokens, x)) out.push(`${t.id}: ${where} names unknown token ${String(x)}`); };
  const items = (k) => (Array.isArray(l[k]) ? l[k] : []).filter((x) => { if (x && typeof x === "object" && !Array.isArray(x) && typeof x.name === "string" && x.name) return true; out.push(`${t.id}: ${k} has an entry that is not an object with a name`); return false; });
  for (const r of items("regions")) {
    if (!CLASS_IDS.includes(r.from)) out.push(`${t.id}: region ${r.name} from ${r.from}`);
    if (typeof r.track !== "string") out.push(`${t.id}: region ${r.name} track is not a string`);
    else if (TOKEN_FIELD.test(r.track)) tok(r.track, `region ${r.name}`);
    else if (!/^(fluid|auto|[1-9]\d*fr)$/.test(r.track)) out.push(`${t.id}: region ${r.name} track ${r.track}`);
  }
  for (const c of items("collections")) {
    tok(c.item_min, `collection ${c.name}`);
    if (JSON.stringify(Object.keys(c.caps ?? {})) !== JSON.stringify(CLASS_IDS)) out.push(`${t.id}: collection ${c.name} caps must list ${CLASS_IDS.join(", ")} in order`);
    const v = Object.values(c.caps ?? {});
    if (!v.every((n, i) => Number.isInteger(n) && n >= 1 && (i === 0 || n >= v[i - 1]))) out.push(`${t.id}: collection ${c.name} caps must be whole numbers that do not shrink`);
  }
  for (const p of items("panels")) {
    if (!["push", "overlay", "two-pane"].includes(p.mode)) out.push(`${t.id}: panel ${p.name} mode ${p.mode}`);
    tok(p.size, `panel ${p.name}`);
    if (!CLASS_IDS.includes(p.from)) out.push(`${t.id}: panel ${p.name} from ${p.from}`);
    if (p.until !== undefined && !(CLASS_IDS.includes(p.until) && CLASS_IDS.indexOf(p.until) > CLASS_IDS.indexOf(p.from))) out.push(`${t.id}: panel ${p.name} until ${p.until} must be a class above from`);
    if (!BELOW.includes(p.below)) out.push(`${t.id}: panel ${p.name} below ${p.below}`);
    if (p.mode === "two-pane" && p.size !== "--pane-min") out.push(`${t.id}: two-pane ${p.name} should use --pane-min`);
    if (p.mode === "push" && p.size !== "--panel-push-default") out.push(`${t.id}: push panel ${p.name} should use --panel-push-default`);
    if (p.mode === "overlay" && !/^--panel-overlay-(sm|md|lg)$/.test(p.size)) out.push(`${t.id}: overlay panel ${p.name} should use an overlay tier`);
  }
  return out;
}

test("page templates: every template has a valid layout", () => {
  assert.equal(TEMPLATES.templates.length, 21);
  const problems = TEMPLATES.templates.flatMap((t) => layoutProblems(t));
  assert.deepEqual(problems, []);
});

test("page templates: layout checks catch bad input from the other side", () => {
  const good = TEMPLATES.templates[0];
  const bad = (patch) => layoutProblems({ ...good, layout: { ...good.layout, ...patch } });
  assert.ok(layoutProblems({ id: "x" }).length, "missing layout");
  assert.ok(bad({ shell: "tablet" }).length);
  assert.ok(bad({ frame: "wide" }).length);
  assert.ok(bad({ panels: [{ name: "p", mode: "push", size: "--panel-push-max", from: "wide" }] }).length, "push must use the default");
  assert.ok(bad({ panels: [{ name: "p", mode: "overlay", size: "320px", from: "wide" }] }).length, "raw size");
  assert.ok(bad({ panels: [{ name: "p", mode: "drawer", size: "--panel-overlay-md", from: "wide" }] }).length, "unknown mode");
  assert.ok(bad({ collections: [{ name: "c", item_min: "--item-min-card", caps: { narrow: 2, snug: 3, roomy: 3, wide: 4, huge: 5 } }] }).length, "extra class");
  assert.ok(bad({ collections: [{ name: "c", item_min: "--item-min-card", caps: { narrow: 4, snug: 3, roomy: 3, wide: 4 } }] }).length, "shrinking caps");
  assert.ok(bad({ collections: [{ name: "c", item_min: "--item-min-nope", caps: { narrow: 1, snug: 1, roomy: 1, wide: 1 } }] }).length, "unknown token");
  assert.ok(bad({ regions: [{ name: "r", track: "6/12", from: "wide" }] }).length, "bad track");
  assert.ok(bad({ regions: [{ name: "r", track: "fluid", from: "xl" }] }).length, "unknown class");
  assert.ok(bad({ regions: [{ name: "r", track: ["--region-filters"], from: "wide" }] }).length, "array track");
  assert.ok(bad({ regions: [{ name: "r", track: "0fr", from: "wide" }] }).length, "zero fr");
  assert.ok(bad({ regions: [{ name: "r", track: "01fr", from: "wide" }] }).length, "leading zero fr");
  assert.ok(bad({ regions: [null] }).length, "null entry reports, not throws");
  assert.ok(bad({ collections: [{ name: "c", item_min: "toString", caps: { narrow: 1, snug: 1, roomy: 1, wide: 1 } }] }).length, "inherited property is not a token");
  assert.ok(bad({ collections: [{ name: "c", item_min: "constructor", caps: { narrow: 1, snug: 1, roomy: 1, wide: 1 } }] }).length, "inherited property is not a token");
  assert.ok(bad({ panels: [{ name: "p", mode: "overlay", size: "--panel-overlay-md", from: "wide", below: "sideways" }] }).length, "unknown below");
  assert.ok(bad({ panels: [{ name: "p", mode: "overlay", size: "--panel-overlay-md", from: "wide" }] }).length, "missing below");
  assert.ok(bad({ panels: [{ name: "p", mode: "overlay", size: "--panel-overlay-md", from: "wide", below: "fullscreen", until: "roomy" }] }).length, "until must be above from");
  assert.ok(bad({ panels: [{ name: "p", mode: "two-pane", size: "--panel-push-default", from: "roomy", below: "push-screen" }] }).length, "two-pane must use --pane-min");
});

test("page templates: dense pages fill the region and the rest are contained (DS-GRID-003)", () => {
  const dense = TEMPLATES.templates.filter((t) => t.density === "PATH-DENSITY-DENSE").map((t) => t.id).sort();
  const fill = TEMPLATES.templates.filter((t) => t.layout.frame === "fill").map((t) => t.id).sort();
  assert.deepEqual(fill, dense);
});

test("page templates: collection caps agree with the verified table where they share an item token", () => {
  const want = {
    "--item-min-logo": [3, 4, 6, 8],
    "--item-min-icon-tile": [4, 6, 6, 8],
  };
  for (const t of TEMPLATES.templates)
    for (const c of t.layout.collections)
      if (want[c.item_min]) assert.deepEqual(Object.values(c.caps), want[c.item_min], `${t.id} ${c.name}`);
});

test("page templates: the split view starts at two panes of --pane-min and says so (DS-PANEL-007)", () => {
  const split = TEMPLATES.templates.find((t) => t.id === "PATH-PAGE-SPLIT");
  assert.ok(split.layout.panels.some((p) => p.mode === "two-pane" && p.size === "--pane-min"));
  assert.ok(split.layout.note.includes(String(g.twoPaneFits(T, 800) && WIDTHS.find((w) => g.twoPaneFits(T, w)))));
  assert.ok(split.responsive.tablet.includes(String(WIDTHS.find((w) => g.twoPaneFits(T, w)))));
});

// ---- rules, docs and the token request agree

test("every DS-GRID and DS-PANEL id in grid.md is in vois-rules.json, and the other way round", () => {
  const md = read("vois-tokens/references/grid.md");
  const inMd = new Set([...md.matchAll(/\[(DS-(?:GRID|PANEL)-\d+)\]/g)].map((m) => m[1]));
  const rules = JSON.parse(read("vois-tokens/data/vois-rules.json")).rules;
  const inJson = new Set(rules.filter((r) => /^DS-(GRID|PANEL)-/.test(r.id)).map((r) => r.id));
  assert.deepEqual([...inMd].sort(), [...inJson].sort());
  for (const r of rules.filter((x) => /^DS-(GRID|PANEL)-/.test(x.id))) assert.equal(r.source_file, "vois-tokens/references/grid.md");
});

test("every token name in grid.md and the templates is in the fixture and in the token request", () => {
  const md = read("vois-tokens/references/grid.md");
  const req = read("prds/grid-token-request.md");
  const names = new Set([...md.matchAll(/`(--[a-z][a-z0-9-]*)`/g)].map((m) => m[1]));
  for (const t of TEMPLATES.templates) {
    for (const r of t.layout.regions) if (TOKEN_FIELD.test(r.track)) names.add(r.track);
    for (const c of t.layout.collections) names.add(c.item_min);
    for (const p of t.layout.panels) names.add(p.size);
  }
  // `--grid-*` and similar wildcards are not names; the pattern above only keeps full names.
  for (const n of names) {
    assert.ok(n in FIX.named, `${n} is not in grid-fixture.json`);
    assert.ok(req.includes("`" + n + "`"), `${n} is not in prds/grid-token-request.md`);
  }
  for (const [prefix, a] of [["--grid-margin", T.grid.margin], ["--grid-gutter", T.grid.gutter]]) {
    assert.equal(FIX.named[`${prefix}-min`].value, a.from.v);
    assert.equal(FIX.named[`${prefix}-max`].value, a.to.v);
    assert.equal(FIX.named[`${prefix}-min-at`].value, a.from.w);
    assert.equal(FIX.named[`${prefix}-max-at`].value, a.to.w);
    assert.equal(FIX.named[prefix].value, "generated", `${prefix} is an output, not a stored value`);
  }
  for (const [n, v] of Object.entries(FIX.named)) {
    const row = req.split("\n").find((l) => l.startsWith("| `" + n + "` |"));
    assert.ok(row, `${n} missing from the token request`);
    const cell = row.split("|")[2].trim();
    assert.equal(cell, v.value === null ? "not set" : String(v.value), `${n}: value cell in the token request`);
  }
});

test("DS-RESPONSIVE-002: the pixel list in the rule, the teams base and the class starts agree", () => {
  const mins = T.grid.classes.map((c) => c.min);
  const rule = JSON.parse(read("vois-tokens/data/vois-rules.json")).rules.find((r) => r.id === "DS-RESPONSIVE-002").rule;
  const fromRule = [...rule.matchAll(/\((\d+)px\)/g)].map((m) => Number(m[1]));
  assert.deepEqual(fromRule, mins);
  const entry = JSON.parse(read("vois-teams/data/ranges.json")).ranges?.find?.((x) => x.rule === "DS-RESPONSIVE-002") ??
    JSON.parse(read("vois-teams/data/ranges.json")).rules?.find?.((x) => x.rule === "DS-RESPONSIVE-002");
  assert.ok(entry, "teams ranges entry not found");
  assert.deepEqual(entry.base, mins);
  const md = read("vois-tokens/references/layout-and-responsive.md");
  for (const m of mins) assert.ok(md.includes(`(${m}px)`), `${m}px missing from layout-and-responsive.md`);
});
