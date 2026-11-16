// Tests for build-tokens.mjs. Each guard gets an input that should pass and inputs that try to get past it.
// Run: node registry/scripts/build-tokens.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, buildFiles, buildShape, applyPending, pendingDuplicates, readPending, cssValue, hexToOklch, oklchToSrgb, parseHex, shadowCss, fnv1a, dockedShadowProblems } from "./build-tokens.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => readFileSync(join(registryDir, p), "utf8");
const realExport = JSON.parse(read("source/figma-export.json"));
const realBrand = JSON.parse(read("source/brand-default.json"));
const realPending = JSON.parse(read("source/figma-pending.json"));

// A tiny export with one brand slot, used to try each guard.
const mini = (over = {}) => ({ format: 1, brandSlots: ["--base-brand"], tokens: { "--white": "#ffffff", "--blue-9": "#1d88ff", "--base-brand": null, "--bg-card": ["=--white", "=--blue-9"], ...over.tokens }, shadows: over.shadows ?? {}, ...(over.top ?? {}) });
const brand = (tokens = { "--base-brand": "=--blue-9" }) => ({ name: "test", file: "brand-test.json", tokens });

test("the committed CSS is exactly what the generator writes", () => {
  const files = buildFiles(realExport, realBrand, { pending: realPending });
  assert.equal(files.tokens, read("vois/tokens/vois-tokens.css"));
  assert.equal(files.motion, read("vois/tokens/motion-tokens.css"));
});

test("every Figma color survives the trip to OKLCH and back within 1/255 per channel", () => {
  for (const [k, v] of Object.entries(realExport.tokens)) {
    for (const x of Array.isArray(v) ? v : [v]) {
      if (typeof x !== "string" || x[0] !== "#") continue;
      const p = parseHex(x);
      const back = oklchToSrgb(hexToOklch(x));
      [p.r, p.g, p.b].forEach((c, i) => assert.ok(Math.abs(c - back[i]) * 255 <= 1, `${k} ${x}`));
    }
  }
});

test("values: numbers become px, aliases var(), colors oklch", () => {
  const names = new Set(["--white"]);
  assert.equal(cssValue(16, names), "16px");
  assert.equal(cssValue(0, names), "0");
  assert.equal(cssValue("=--white", names), "var(--white)");
  assert.match(cssValue("#ffffff", names), /^oklch\(1 0 0\)$/);
  assert.match(cssValue("#00000033", names), /^oklch\(0 0 0 \/ 0\.2\)$/);
  assert.throws(() => cssValue("=--nope", names), /unknown token/);
  for (const bad of ["#fff", "ffffff", "#gggggg", "#ffffff0", "red", "", null, NaN, Infinity, {}, true]) assert.throws(() => cssValue(bad, names), String(bad));
});

test("light goes in :root, dark goes in .dark only where it differs", () => {
  const css = build(mini(), brand());
  const [rootPart, darkPart] = css.split(".dark {");
  assert.match(rootPart, /--bg-card: var\(--white\);/);
  assert.match(darkPart, /--bg-card: var\(--blue-9\);/);
  assert.doesNotMatch(darkPart, /--white:/, "a value that is the same in dark is not repeated");
});

test("every alias is declared again in .dark, so a dark section re-resolves it", () => {
  // --focus has one value, an alias, but its target differs in dark. Declared only in :root, it would
  // keep the light result inside a .dark section.
  const css = build(mini({ tokens: { "--ring-blue": ["=--blue-9", "=--white"], "--focus": "=--ring-blue" } }), brand());
  const darkPart = css.split(".dark {")[1];
  assert.match(darkPart, /--focus: var\(--ring-blue\);/);
  assert.doesNotMatch(darkPart, /--blue-9:/, "a literal that is the same in dark is still not repeated");
});

test("hex colors are read case-insensitively; anything else still fails", () => {
  assert.equal(cssValue("#FFFFFF", new Set()), cssValue("#ffffff", new Set()));
  assert.equal(cssValue("#1D88FF", new Set()), cssValue("#1d88ff", new Set()));
  assert.throws(() => cssValue("#FFF", new Set()));
});

test("the header names the brand file that was used", () => {
  assert.match(build(mini(), brand()), /registry\/source\/brand-default\.json \(test\)\./);
  assert.match(build(mini(), { tokens: { "--base-brand": "=--blue-9" } }, { brandLabel: "../acme/brand.json" }), /\.\.\/acme\/brand\.json\./);
});

test("brand slots: null in the export, filled by the brand file and only there", () => {
  assert.match(build(mini(), brand()), /--base-brand: var\(--blue-9\);/);
  assert.throws(() => build(mini({ tokens: { "--base-brand": "=--white" } }), brand()), /has a value in the export/);
  assert.throws(() => build(mini({ tokens: { "--white": null } }), brand()), /is null but is not a brand slot/);
  assert.throws(() => build(mini({ top: { brandSlots: ["--base-brand", "--missing"] } }), brand()), /--missing is not in the export/);
  assert.throws(() => build(mini({ top: { brandSlots: [] } }), brand()), /brandSlots must be a non-empty list/);
  assert.throws(() => build(mini(), brand({})), /brand slot --base-brand has no value/);
  assert.throws(() => build(mini(), brand({ "--base-brand": null })), /has no value/);
  assert.throws(() => build(mini(), brand({ "--base-brand": "=--blue-9", "--bg-card": "=--white" })), /--bg-card is not a brand slot/);
  assert.throws(() => build(mini(), { tokens: [] }), /tokens must be an object/);
});

test("export shape fails closed", () => {
  assert.throws(() => build({ ...mini(), format: 2 }, brand()), /format must be 1/);
  assert.throws(() => build({ ...mini(), tokens: [] }, brand()), /tokens must be an object/);
  assert.throws(() => build(mini({ tokens: { "--Bad-Name": "#ffffff" } }), brand()), /not a token name/);
  assert.throws(() => build(mini({ tokens: { "--x": ["#ffffff"] } }), brand()), /must have two values/);
  assert.throws(() => build(mini({ tokens: { "--x": ["#ffffff", "#000000", "#111111"] } }), brand()), /must have two values/);
});

test("an alias chain must end at a value", () => {
  assert.throws(() => build(mini({ tokens: { "--a": "=--b", "--b": "=--a" } }), brand()), /alias loop/);
  assert.throws(() => build(mini({ tokens: { "--a": "=--a" } }), brand()), /alias loop/);
  assert.throws(() => build(mini({ tokens: { "--a": ["=--white", "=--b"], "--b": ["#ffffff", "=--a"] } }), brand()), /alias loop/, "a loop in the dark mode only");
  assert.doesNotThrow(() => build(mini({ tokens: { "--a": "=--b", "--b": "=--white" } }), brand()));
});

test("shadows: [x, y, blur, spread, color] layers, names apart from tokens", () => {
  assert.equal(shadowCss([[0, 1, 4, 1, "#0000000a"]]), "0 1px 4px 1px oklch(0 0 0 / 0.039)");
  for (const bad of [[], [[0, 1, 4, "#000000"]], [[0, "1", 4, 0, "#000000"]], [[0, 1, 4, 0, "black"]], "x"]) assert.throws(() => shadowCss(bad), JSON.stringify(bad));
  assert.throws(() => build(mini({ shadows: { "--white": [[0, 0, 1, 0, "#000000"]] } }), brand()), /same name as a token/);
  assert.throws(() => build({ ...mini(), shadows: [[[0, 1, 2, 0, "#000000"]]] }, brand()), /shadows must be an object/);
  assert.throws(() => build(mini({ shadows: { "Elevation Base": [[0, 1, 2, 0, "#000000"]] } }), brand()), /not a shadow token name/);
});

test("grid lines: generated from all four tokens, never stored, never inverted", () => {
  const line = { "--grid-margin-min": 16, "--grid-margin-max": 32, "--grid-margin-min-at": 360, "--grid-margin-max-at": 1024 };
  const css = build(mini({ tokens: line }), brand());
  assert.match(css, /--grid-margin: clamp\(var\(--grid-margin-min\), calc\(var\(--grid-margin-min\) \+ \(100cqi - var\(--grid-margin-min-at\)\) \* 0\.024096\), var\(--grid-margin-max\)\);/);
  const { "--grid-margin-max-at": _, ...three } = line;
  assert.throws(() => build(mini({ tokens: three }), brand()), /needs all four/);
  assert.throws(() => build(mini({ tokens: { ...line, "--grid-margin-min": 40 } }), brand()), /min below max/);
  assert.throws(() => build(mini({ tokens: { ...line, "--grid-margin-min-at": 2000 } }), brand()), /min-at below max-at/);
  assert.throws(() => build(mini({ tokens: { ...line, "--grid-margin-max": "=--white" } }), brand()), /must be numbers/);
  assert.throws(() => build(mini({ tokens: { ...line, "--grid-margin": 20 } }), brand()), /generated and must not be stored/);
  assert.throws(() => build(mini({ tokens: { "--grid-gutter": 24 } }), brand()), /generated and must not be stored/, "even with none of the four line tokens");
});

test("the default brand is blue, and its fonts are generic system families", () => {
  const GENERIC = new Set(["system-ui", "sans-serif", "serif", "monospace", "ui-monospace", "ui-sans-serif", "ui-serif", "inherit"]);
  for (const [k, v] of Object.entries(realBrand.tokens)) {
    if (k.startsWith("--font-family-")) {
      assert.ok(v && typeof v.css === "string", k);
      for (const f of v.css.split(",").map((s) => s.trim())) assert.ok(GENERIC.has(f), `${k}: ${f} is not a generic family; a product's font is its brand and stays out of this repo`);
      continue;
    }
    // Text on primary is the one color slot that isn't blue: white, readable on the blue default.
    if (k === "--action-primary-text") { assert.equal(v, "=--white", k); continue; }
    for (const x of Array.isArray(v) ? v : [v]) assert.match(x, /^=--blue-(?:a)?\d+$/, k);
  }
  assert.deepEqual(Object.keys(realBrand.tokens).sort(), [...realExport.brandSlots].sort());
  for (const s of ["--font-family-brand", "--font-family-system", "--font-family-written", "--font-family-mono"]) assert.equal(realExport.tokens[s], null, `${s} must be null in the export`);
});

test("shape roles: the committed shape-tokens.css is what the generator writes, from shape.json", () => {
  const css = buildShape(JSON.parse(read("source/shape.json")), realExport.tokens);
  assert.equal(read("vois/tokens/shape-tokens.css"), css);
  for (const r of ["--shape-subtle: var(--radius-buttons-and-controls);", "--shape-pill: 9999px;", "--shape-circle: 50%;", "--shape-responsive-soft: clamp(var(--radii-16), 4cqi, var(--radii-40));", "--shape-responsive-elliptical: 4% / 6%;"]) assert.ok(css.includes(r), r);
});

test("shape roles fail closed on anything odd", () => {
  const t = { "--radii-16": 16, "--radii-40": 40, "--radius-card": "=--radii-16", "--blue-9": "#1d88ff", "--size-24": 24 };
  const sh = (roles) => ({ format: 1, roles });
  const ok = { type: "proportional", min: "=--radii-16", scale: "4cqi", max: "=--radii-40" };
  assert.match(buildShape(sh({ "--shape-a": ok }), t), /--shape-a: clamp\(var\(--radii-16\), 4cqi, var\(--radii-40\)\);/);
  assert.match(buildShape(sh({ "--shape-a": { type: "fixed", value: "=--radius-card" } }), t), /--shape-a: var\(--radius-card\);/, "an alias chain to a number is fine");
  const bad = [
    [{ format: 2, roles: { "--shape-a": ok } }, /format must be 1/],
    [sh({}), /non-empty/],
    [sh([]), /non-empty/],
    [sh({ "--radius-a": ok }), /not a --shape-\* name/],
    [sh({ "--shape-A": ok }), /not a --shape-\* name/],
    [sh({ "--shape-a": null }), /must be an object/],
    [sh({ "--shape-a": { type: "squircle" } }), /unknown type/],
    [sh({ "--shape-a": { type: "capsule", value: "9999px" } }), /value is not a key/],
    [sh({ "--shape-a": { type: "fixed" } }), /needs value/],
    [sh({ "--shape-a": { type: "fixed", value: "19px" } }), /alias to a radius token/],
    [sh({ "--shape-a": { type: "fixed", value: "=--blue-9" } }), /alias to a radius token/],
    [sh({ "--shape-a": { type: "fixed", value: "=--size-24" } }), /alias to a radius token/],
    [sh({ "--shape-a": { type: "fixed", value: "=--radii-99" } }), /not a token/],
    [sh({ "--shape-a": { ...ok, scale: "4vw" } }), /scale must be/],
    [sh({ "--shape-a": { ...ok, scale: "0cqi" } }), /scale must be/],
    [sh({ "--shape-a": { ...ok, scale: "21cqi" } }), /scale must be/],
    [sh({ "--shape-a": { ...ok, scale: "4cqi; color: red" } }), /scale must be/],
    [sh({ "--shape-a": { ...ok, min: "=--radii-40", max: "=--radii-16" } }), /min must be below max/],
    [sh({ "--shape-a": { ...ok, max: "=--radii-16" } }), /min must be below max/],
    [sh({ "--shape-a": { type: "elliptical", horizontal: "4%", vertical: "60%" } }), /percentages above 0 and at most 50/],
    [sh({ "--shape-a": { type: "elliptical", horizontal: "4px", vertical: "6%" } }), /percentages/],
    [sh({ "--shape-a": { type: "elliptical", horizontal: "0%", vertical: "6%" } }), /percentages/],
    [sh({ "--shape-a": { type: "capsule", note: 3 } }), /note must be text/],
  ];
  for (const [input, re] of bad) assert.throws(() => buildShape(input, t), re, JSON.stringify(input));
  assert.throws(() => buildShape(sh({ "--shape-a": ok }), { ...t, "--shape-a": 4 }), /already has a token/);
  // A radius token added in figma-pending.json counts, as it does for vois-tokens.css.
  const withPending = applyPending(t, [], { format: 1, add: { "--radii-20": 20 }, change: {} });
  assert.match(buildShape(sh({ "--shape-a": { type: "fixed", value: "=--radii-20" } }), withPending), /var\(--radii-20\)/);
  // A radius-named token that is not a number (a color, by mistake) is caught, not written as var().
  assert.throws(() => buildShape(sh({ "--shape-a": { type: "fixed", value: "=--radius-oops" } }), { ...t, "--radius-oops": "#ffffff" }), /does not resolve to a number/);
});

test("z-index layers are unitless whole numbers; only --z-<name> counts", () => {
  const n = new Set();
  assert.equal(cssValue(1000, n, "--z-dropdown"), "1000");
  assert.equal(cssValue(0, n, "--z-base"), "0");
  assert.equal(cssValue(-1, n, "--z-behind"), "-1", "a negative z-index is valid");
  for (const bad of [1000.5, 0.1]) assert.throws(() => cssValue(bad, n, "--z-modal"), /a z-index is a whole number/, String(bad));
  // Lookalikes stay px: no dash after z, nothing after the dash, or z later in the name.
  for (const name of ["--zoom-level", "--z", "--z-", "--size-z-8", "--Z-modal"]) assert.equal(cssValue(8, n, name), "8px", name);
  // Through the whole build: the generated CSS has no unit on a z layer.
  const css = build(mini({ tokens: { "--z-dropdown": 1000, "--zoom": 4 } }), brand());
  assert.match(css, /--z-dropdown: 1000;/);
  assert.match(css, /--zoom: 4px;/);
});

test("fonts: weights are unitless whole numbers, families are validated lists", () => {
  const n = new Set();
  assert.equal(cssValue(600, n, "--font-weight-semi-bold"), "600");
  for (const bad of [600.5, 0, 1001, -1]) assert.throws(() => cssValue(bad, n, "--font-weight-x"), /whole number from 1 to 1000/, String(bad));
  assert.equal(cssValue(16, n, "--font-size-small"), "16px");
  assert.equal(cssValue({ css: '"Inter Tight", system-ui, sans-serif' }, n, "--font-family-system"), '"Inter Tight", system-ui, sans-serif');
  assert.equal(cssValue({ css: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Text 2.0", sans-serif' }, n, "--font-family-system"), '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Text 2.0", sans-serif', "the usual system stack");
  for (const bad of ["Geist; color: red", "a}b", "", "Geist,", ", Geist", '"Unclosed, serif', "url(x)", "--custom", "2Geist", '"a"b"']) assert.throws(() => cssValue({ css: bad }, n, "--font-family-x"), /not a font-family list/, bad);
  assert.throws(() => cssValue({ css: "Geist" }, n, "--font-size-small"), /only allowed for --motion-ease-\* and --font-family-\*/);
});

test("fnv1a matches the Figma export script's checksum", () => {
  assert.equal(fnv1a(""), "811c9dc5");
  assert.equal(fnv1a("a"), "e40c292c");
  assert.notEqual(fnv1a(read("source/figma-export.json")), fnv1a(read("source/figma-export.json") + " "));
});

// ---- Pending tokens (decided, not yet in Figma) ----

const pend = (add = {}, change = {}) => ({ format: 1, add, change });

test("pending: add and change apply on top of the export", () => {
  const css = build(mini({ tokens: { "--size-40": 40, "--size-action-large": "=--size-40" } }), brand(),
    { pending: pend({ "--size-36": 36 }, { "--size-action-large": { from: "=--size-40", to: "=--size-36" } }) });
  assert.match(css, /--size-36: 36px;/);
  assert.match(css, /--size-action-large: var\(--size-36\);/);
  assert.match(css, /figma-pending\.json/, "the header says pending tokens are in");
  assert.doesNotMatch(build(mini(), brand()), /figma-pending\.json/, "no pending, no header line");
});

test("pending: an entry Figma now has fails, so the file empties as Figma catches up", () => {
  assert.throws(() => applyPending({ "--size-36": 36 }, [], pend({ "--size-36": 36 })), /now in the Figma export/);
  assert.throws(() => applyPending({ "--a": "=--b" }, [], pend({}, { "--a": { from: "=--c", to: "=--b" } })), /Figma now has --a/);
});

test("pending: a change whose from no longer matches Figma fails", () => {
  assert.throws(() => applyPending({ "--a": "=--size-32" }, [], pend({}, { "--a": { from: "=--size-40", to: "=--size-36" } })), /but the change expects/);
  assert.throws(() => applyPending({ "--a": ["=--x", "=--y"] }, [], pend({}, { "--a": { from: ["=--y", "=--x"], to: "=--z" } })), /but the change expects/, "light and dark order matters");
});

test("pending: malformed input fails closed", () => {
  assert.throws(() => applyPending({}, [], { format: 2 }), /format must be 1/);
  assert.throws(() => applyPending({}, [], { format: 1, add: [] }), /add must be an object/);
  assert.throws(() => applyPending({}, [], { format: 1, change: "x" }), /change must be an object/);
  assert.throws(() => applyPending({}, [], pend({ "--a": null })), /has no value/);
  assert.throws(() => applyPending({ "--a": 1 }, [], pend({}, { "--a": { to: 2 } })), /needs from and to/);
  assert.throws(() => applyPending({}, [], pend({}, { "--a": { from: 1, to: 2 } })), /not in the Figma export/);
  assert.throws(() => applyPending({ "--a": 1 }, [], pend({ "--a": 2 }, { "--a": { from: 1, to: 3 } })), /now in the Figma export|both add and change/);
  assert.throws(() => applyPending({ "--a": 1 }, [], pend({}, { "--a": { from: 1, to: null } })), /has no value/);
});

test("pending: brand slots stay out, from both sides", () => {
  assert.throws(() => applyPending({ "--base-brand": null }, ["--base-brand"], pend({ "--base-brand": "=--blue-9" })), /brand slot/);
  assert.throws(() => applyPending({ "--base-brand": null }, ["--base-brand"], pend({}, { "--base-brand": { from: null, to: "=--blue-9" } })), /brand slot/);
});

// ---- Motion tokens ----

test("motion: durations are ms, easing is a cubic-bezier, and they go to motion-tokens.css only", () => {
  const files = buildFiles(mini(), brand(), { pending: pend({ "--motion-duration-fast": 150, "--motion-ease-standard": { css: "cubic-bezier(.165, .84, .44, 1)" }, "--motion-distance-short": 12 }) });
  assert.match(files.motion, /--motion-duration-fast: 150ms;/);
  assert.match(files.motion, /--motion-ease-standard: cubic-bezier\(\.165, \.84, \.44, 1\);/);
  assert.match(files.motion, /--motion-distance-short: 12px;/);
  assert.doesNotMatch(files.tokens, /--motion-/, "no motion token in vois-tokens.css");
  assert.doesNotMatch(files.motion, /--white|\.dark/, "only motion, only :root");
});

test("motion: a { css } value is a four-number cubic-bezier on an ease token, nothing else", () => {
  const names = new Set();
  for (const bad of ["ease-out", "cubic-bezier(1, 2, 3)", "cubic-bezier(.1, .2, .3, .4) ; color: red", "cubic-bezier(a, b, c, d)", "steps(4)", "cubic-bezier(.1,.2,.3,.4))"]) {
    assert.throws(() => cssValue({ css: bad }, names, "--motion-ease-x"), /not a cubic-bezier/, bad);
  }
  assert.throws(() => cssValue({ css: "cubic-bezier(.1, .2, .3, .4)" }, names, "--bg-card"), /only allowed for --motion-ease/);
  assert.throws(() => cssValue({ css: "x", extra: 1 }, names, "--motion-ease-x"), /unsupported value/);
  assert.equal(cssValue({ css: "cubic-bezier(.1, -1.2, .3, 1)" }, names, "--motion-ease-x"), "cubic-bezier(.1, -1.2, .3, 1)", "a negative y is valid CSS");
});

test("motion: a duration is ms and above 0; other numbers stay px", () => {
  assert.equal(cssValue(150, new Set(), "--motion-duration-fast"), "150ms");
  assert.throws(() => cssValue(0, new Set(), "--motion-duration-fast"), /above 0/);
  assert.throws(() => cssValue(-5, new Set(), "--motion-duration-fast"), /above 0/);
  assert.equal(cssValue(12, new Set(), "--motion-distance-short"), "12px");
  assert.equal(cssValue(150, new Set(), "--size-150"), "150px");
});

test("motion: one value for both modes, and motion and non-motion tokens do not alias each other", () => {
  assert.throws(() => buildFiles(mini({ tokens: { "--motion-duration-fast": [150, 200] } }), brand()), /one value for both modes/);
  assert.throws(() => buildFiles(mini({ tokens: { "--motion-distance-short": "=--white" } }), brand()), /may only alias a motion token/);
  assert.throws(() => buildFiles(mini({ tokens: { "--motion-distance-short": 12, "--gap": "=--motion-distance-short" } }), brand()), /aliases a motion token/);
});

test("motion: a cubic-bezier with an x value outside 0 to 1 fails; y values may overshoot", () => {
  const n = new Set();
  for (const bad of ["cubic-bezier(1.2, 0, .3, 1)", "cubic-bezier(.1, 0, -.3, 1)", "cubic-bezier(-0.01, 0, .5, 1)"]) assert.throws(() => cssValue({ css: bad }, n, "--motion-ease-x"), /outside 0 to 1/, bad);
  assert.equal(cssValue({ css: "cubic-bezier(0, -0.5, 1, 1.5)" }, n, "--motion-ease-x"), "cubic-bezier(0, -0.5, 1, 1.5)");
});

test("pending: a token written twice fails, in one section or across add and change", () => {
  assert.deepEqual(pendingDuplicates('{"add": {"--a": 1, "--b": 2}}'), []);
  assert.deepEqual(pendingDuplicates('{"add": {"--a": 1, "--a": 2}}'), ["--a"]);
  assert.deepEqual(pendingDuplicates('{"add": {"--a": 1}, "change": {"--a" : {"from": 1, "to": 2}}}'), ["--a"]);
  assert.throws(() => readPending('{"format": 1, "add": {"--a": 1, "--a": 2}}'), /--a written more than once/);
  assert.deepEqual(readPending('{"format": 1, "about": "mentions --a in prose", "add": {"--a": 1}}').add, { "--a": 1 }, "a name in a string value is not a key");
});

test("pending: the committed figma-pending.json has no duplicate names", () => {
  assert.deepEqual(pendingDuplicates(read("source/figma-pending.json")), []);
});

// ---- Form control edges: the lightest gray that still meets 3:1 (WCAG 1.4.11) in light mode, and 3:1 in dark ----
// The field edge (--input-border) has to meet 3:1 against the surface outside it and against the resting fill inside it.
// --control-border (Checkbox, Radio) and --switch-outline (off Switch) share the same gray in light. A lighter edge fails
// 3:1, a darker one is heavier than it needs to be, so the test derives the lightest passing gray from the export itself.
// Dark mode is not tuned to the minimum, but it has to meet 3:1 too.
const edgeColors = (() => {
  const parse = (hex) => {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(hex);
    assert.ok(m, `not a hex color: ${hex}`);
    return { c: [1, 2, 3].map((i) => parseInt(m[i], 16)), a: m[4] ? parseInt(m[4], 16) / 255 : 1 };
  };
  // mode 0 is light, 1 is dark. A token with one value (not a pair) has it in both modes.
  const value = (token, mode, seen = []) => {
    assert.ok(!seen.includes(token), `alias loop at ${token}`);
    let v = realExport.tokens[token];
    assert.ok(v !== undefined && v !== null, `${token} is not in the export`);
    if (Array.isArray(v)) v = v[mode];
    return typeof v === "string" && v.startsWith("=") ? value(v.slice(1), mode, [...seen, token]) : v;
  };
  const over = (top, under) => top.c.map((x, i) => Math.round(x * top.a + under[i] * (1 - top.a)));
  const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const solid = (token, mode) => { const p = parse(value(token, mode)); assert.equal(p.a, 1, `${token} must be opaque`); return p.c; };
  const surfaces = (mode) => {
    const pageTokens = ["--bg-background", "--bg-card", "--bg-subtle"];
    const pages = pageTokens.map((t) => ({ name: t, rgb: solid(t, mode) }));
    const fill = parse(value("--input-resting", mode));
    return {
      field: [...pages, ...pages.map((p) => ({ name: `--input-resting over ${p.name}`, rgb: over(fill, p.rgb) }))],
      control: pages,
      // In light the outline also clears the track it sits on. In dark it does not (about 2:1 on --switch-off, as before
      // this change), and it does not need to: the boundary of the Switch is the outline against the page around it.
      switch: mode === 0 ? [...pages, { name: "--switch-off", rgb: solid("--switch-off", mode) }] : pages,
    };
  };
  const worst = (gray, list) => list.reduce((w, s) => { const r = ratio(s.rgb, [gray, gray, gray]); return r < w.ratio ? { ratio: r, name: s.name } : w; }, { ratio: Infinity, name: "" });
  const lightestPassing = (list) => { for (let g = 255; g >= 0; g--) if (worst(g, list).ratio >= 3) return g; return -1; };
  const grayOf = (token, mode = 0) => { const p = parse(value(token, mode)); assert.equal(p.a, 1); assert.ok(p.c[0] === p.c[1] && p.c[1] === p.c[2], `${token} is not a gray`); return p.c[0]; };
  return { grayOf, worst, lightestPassing, surfaces, value, parse, ratio };
})();

test("edges: --input-border is the lightest gray that meets 3:1 on every surface and on the resting fill (light)", () => {
  const { grayOf, worst, lightestPassing, surfaces } = edgeColors;
  const list = surfaces(0).field, g = grayOf("--input-border");
  const w = worst(g, list);
  assert.ok(w.ratio >= 3, `--input-border is ${g}, which is ${w.ratio.toFixed(3)}:1 on ${w.name}, under 3:1`);
  const best = lightestPassing(list);
  assert.equal(g, best, `--input-border is ${g}; the lightest gray that still meets 3:1 is ${best}, and ${g} is ${w.ratio.toFixed(3)}:1 on ${w.name}. If a surface or the resting fill changed, re-pick the gray.`);
});

test("edges: the Checkbox, Radio and Switch edges use the same gray and meet 3:1 on their own surfaces (light)", () => {
  const { grayOf, worst, surfaces } = edgeColors;
  const g = grayOf("--input-border"), s = surfaces(0);
  assert.equal(grayOf("--control-border"), g, "--control-border should be the same gray as --input-border in light mode");
  assert.equal(grayOf("--switch-outline"), g, "--switch-outline should be the same gray as --input-border in light mode");
  const c = worst(g, s.control), w = worst(g, s.switch);
  assert.ok(c.ratio >= 3, `control edge is ${c.ratio.toFixed(3)}:1 on ${c.name}`);
  assert.ok(w.ratio >= 3, `switch edge is ${w.ratio.toFixed(3)}:1 on ${w.name}`);
});

test("edges: in dark mode the field and control edges meet 3:1 on every surface, and the dark values did not move", () => {
  const { grayOf, worst, surfaces } = edgeColors;
  const s = surfaces(1);
  for (const [token, list] of [["--input-border", s.field], ["--control-border", s.control], ["--switch-outline", s.switch]]) {
    const w = worst(grayOf(token, 1), list);
    assert.ok(w.ratio >= 3, `${token} (dark) is ${w.ratio.toFixed(3)}:1 on ${w.name}, under 3:1`);
  }
  // Dark is gray-5 for the field and the Checkbox and Radio, and gray-6 for the Switch edge, as before.
  assert.equal(grayOf("--input-border", 1), grayOf("--gray-5"), "--input-border in dark is --gray-5");
  assert.equal(grayOf("--control-border", 1), grayOf("--gray-5"), "--control-border in dark is --gray-5");
  assert.equal(grayOf("--switch-outline", 1), grayOf("--gray-6"), "--switch-outline in dark is --gray-6");
});

test("edges: the gray is darker than the border steps below it and the hover edge stays darker than resting", () => {
  const { grayOf } = edgeColors;
  assert.ok(grayOf("--input-border") < grayOf("--gray-5"), "--input-border should be darker than --gray-5");
  assert.ok(grayOf("--border-state-hover") < grayOf("--input-border"), "the hover edge should be darker than the resting edge");
});

// ---- Focus ring: one color token, 3:1 on every surface in both modes, and a fixed width and offset ----
test("focus: --border-state-focus meets 3:1 on the page, a card and the subtle surface in light and dark, and --control-focus is the same token", () => {
  const { surfaces, value, parse, ratio } = edgeColors;
  for (const mode of [0, 1]) {
    const ring = parse(value("--border-state-focus", mode)).c;
    // The ring sits outside the control, so it is read against the surfaces a control stands on.
    for (const s of surfaces(mode).control) {
      const r = ratio(s.rgb, ring);
      assert.ok(r >= 3, `ring (${mode ? "dark" : "light"}) is ${r.toFixed(2)}:1 on ${s.name}, under 3:1`);
    }
  }
  assert.equal(realExport.tokens["--control-focus"], "=--border-state-focus", "--control-focus must alias --border-state-focus so the Checkbox and Radio ring passes too");
  assert.equal(realExport.tokens["--select-focus"], "=--border-state-focus");
});

test("focus: the ring is 2px wide and 2px out, and does not drift", () => {
  assert.equal(realExport.tokens["--focus-ring-width"], 2);
  assert.equal(realExport.tokens["--focus-ring-offset"], 2);
});

test("focus: the ring is not a pale blue: at least 4.5:1 on the page in light and in dark, so a small surface change cannot push it under 3:1", () => {
  const { surfaces, value, parse, ratio } = edgeColors;
  for (const mode of [0, 1]) {
    const ring = parse(value("--border-state-focus", mode)).c;
    const page = surfaces(mode).control[0];
    assert.ok(ratio(page.rgb, ring) >= 4.5, `ring (${mode ? "dark" : "light"}) is ${ratio(page.rgb, ring).toFixed(2)}:1 on the page`);
  }
});

// ---- Dialog widths (vois-patterns PATH-D-SIZE, DS-LAYOUT-WIDTH-004) ----
test("dialog widths: both tokens exist, the small one is the Figma Dialog's 344, the large one is wider", () => {
  const sm = realExport.tokens["--width-dialog-sm"], lg = realExport.tokens["--width-dialog-lg"];
  assert.equal(sm, 344, "--width-dialog-sm is the width the Figma Dialog is built at");
  assert.ok(Number.isInteger(lg) && lg > sm, "--width-dialog-lg is a whole number wider than the small tier");
  assert.ok(lg + 32 <= 1024, "the large tier plus the 16 side margins fits the smallest desktop width");
});

test("dialog widths: the registry Dialog reads the tokens and never a literal width", () => {
  const src = read("vois/dialog/dialog.tsx");
  assert.match(src, /w-\[var\(--width-dialog-sm\)\]/);
  assert.match(src, /data-\[size=lg\]:w-\[var\(--width-dialog-lg\)\]/);
  assert.doesNotMatch(src, /\bw-\[\d+px\]/, "a literal pixel width on the Dialog");
});

// ---- Dark elevation (DS-ELEVATION-005) -------------------------------------------------------------

const withDark = (dark, shadows) => mini({ shadows: shadows ?? { "--shadow-base": [[0, 0, 1, 1, "#0000000a"]], "--shadow-small": [[0, 1, 1, 0, "#0000000a"]], "--shadow-medium": [[0, 2, 2, 0, "#0000000d"]] }, top: { darkShadows: dark } });
const darkBlock = (css) => css.slice(css.indexOf(".dark {"));
const lightBlock = (css) => css.slice(0, css.indexOf(".dark {"));

test("dark shadows: Base and Small draw nothing, Medium and up come from the dark styles, light is untouched", () => {
  const dark = { "--shadow-medium": [[0, 2, 2, 0, "#00000029"]] };
  const css = build(withDark(dark), brand());
  const d = darkBlock(css);
  assert.match(d, /--shadow-base: 0 0 0 0 oklch\(0 0 0 \/ 0\);/);
  assert.match(d, /--shadow-small: 0 0 0 0 oklch\(0 0 0 \/ 0\);/);
  assert.match(d, /--shadow-medium: 0 2px 2px 0 oklch\(0 0 0 \/ 0\.161\);/);
  // The light block is byte-for-byte what it was without any dark shadows.
  const plain = build(withDark(undefined), brand());
  assert.equal(lightBlock(css), lightBlock(plain));
  assert.doesNotMatch(darkBlock(plain), /--shadow-/, "no darkShadows block: dark keeps the light shadows, as before");
});

test("dark shadows fail closed: no light twin, a flat tier given a shadow, a tier left out, wrong shapes", () => {
  const dark = { "--shadow-medium": [[0, 2, 2, 0, "#00000029"]] };
  assert.throws(() => build(withDark({ ...dark, "--shadow-huge": [[0, 1, 1, 0, "#00000029"]] }), brand()), /no light shadow of the same name/);
  assert.throws(() => build(withDark({ ...dark, "--shadow-small": [[0, 1, 1, 0, "#00000029"]] }), brand()), /carries no shadow in dark/);
  assert.throws(() => build(withDark({ ...dark, "--shadow-base": [[0, 1, 1, 0, "#00000029"]] }), brand()), /carries no shadow in dark/);
  assert.throws(() => build(withDark({}), brand()), /--shadow-medium has no dark style/);
  for (const bad of [[], "x", 5, null]) assert.throws(() => build(withDark(bad), brand()), /darkShadows must be an object/, JSON.stringify(bad));
  // The layers must be the light ones (minus the 1px ring), in black: truncated, moved or recolored styles fail.
  assert.throws(() => build(withDark({ "--shadow-medium": [] }), brand()), /must have the layers of the light one/);
  assert.throws(() => build(withDark({ "--shadow-medium": [[0, 2, 2, "#00000029"]] }), brand()), /must have the layers of the light one/);
  assert.throws(() => build(withDark({ "--shadow-medium": [[0, 2, 2, 0, "#00000029"], [0, 4, 4, 0, "#00000029"]] }), brand()), /must have the layers of the light one/);
  assert.throws(() => build(withDark({ "--shadow-medium": [[0, 3, 2, 0, "#00000029"]] }), brand()), /must have the layers of the light one/);
  assert.throws(() => build(withDark({ "--shadow-medium": [[0, 2, 2, 0, "#ff000029"]] }), brand()), /layers are black at some alpha/);
  assert.throws(() => build(withDark({ "--shadow-medium": [[0, 2, 2, 0, "#000000"]] }), brand()), /layers are black at some alpha/);
  assert.throws(() => build(withDark({ "--shadow-medium": "x" }), brand()), /must have the layers of the light one/);
  // A light 1px ring is the hairline's job in dark, so the dark style leaves it out and may not keep it.
  const ringed = { "--shadow-base": [[0, 0, 1, 1, "#0000000a"]], "--shadow-small": [[0, 1, 1, 0, "#0000000a"]], "--shadow-medium": [[0, 0, 0, 1, "#0000000d"], [0, 2, 2, 0, "#0000000d"]] };
  assert.doesNotThrow(() => build(withDark({ "--shadow-medium": [[0, 2, 2, 0, "#00000029"]] }, ringed), brand()));
  assert.throws(() => build(withDark({ "--shadow-medium": [[0, 0, 0, 1, "#00000029"], [0, 2, 2, 0, "#00000029"]] }, ringed), brand()), /must have the layers of the light one/);
});

test("dark shadows: the committed export has Medium, Large, XLarge, the four docked Large shadows and the three glass shadows, each heavier than its light twin", () => {
  assert.deepEqual(Object.keys(realExport.darkShadows), ["--shadow-medium", "--shadow-large", "--shadow-xlarge", "--shadow-large-right", "--shadow-large-left", "--shadow-large-bottom", "--shadow-large-top", "--glass-shadow-subtle", "--glass-shadow-standard", "--glass-shadow-strong"]);
  const alpha = (hex) => parseInt(hex.slice(7, 9) || "ff", 16);
  for (const [k, layers] of Object.entries(realExport.darkShadows)) {
    const lightA = Math.max(...realExport.shadows[k].map((l) => alpha(l[4])));
    for (const l of layers) assert.ok(alpha(l[4]) > lightA, `${k} dark layer ${JSON.stringify(l)} is not heavier than light (${lightA})`);
    assert.ok(!layers.some((l) => l[0] === 0 && l[1] === 0 && l[2] === 0 && l[3] === 1), `${k}: the 1px ring is the hairline token's job in dark`);
  }
  assert.match(darkBlock(read("vois/tokens/vois-tokens.css")), /--shadow-base: 0 0 0 0 oklch\(0 0 0 \/ 0\);/);
});

test("dark fills: each step up the ladder is lighter than the one below, and light stays white", () => {
  const { value, parse } = edgeColors;
  const L = (token, mode) => hexToOklch(value(token, mode)).L;
  const page = L("--bg-background", 1), card = L("--bg-card", 1), small = L("--elevation-surface-small", 1), raised = L("--elevation-surface-raised", 1), popup = L("--elevation-surface-popup", 1);
  // About 0.02 OKLCH lightness is the smallest step that reads as a different surface on a real screen.
  // The popup step is for a menu, select list or hover card. It stacks above a Dialog (z-index 1400 and 1500 over 1300), so it is lighter than the Dialog's raised fill.
  for (const [lo, hi, name] of [[page, card, "card over page"], [card, small, "small over base"], [small, raised, "raised over small"], [raised, popup, "popup over a Dialog"]]) assert.ok(hi - lo >= 0.02, `${name}: only ${(hi - lo).toFixed(4)} lighter`);
  for (const token of ["--elevation-surface-small", "--elevation-surface-raised", "--elevation-surface-popup"]) assert.equal(value(token, 0), value("--bg-card", 0), `${token} in light is the card white`);
  // The hairline draws nothing in light, so adding it changes no light pixel.
  assert.equal(parse(value("--elevation-hairline", 0)).a, 0);
  assert.ok(parse(value("--elevation-hairline", 1)).a > 0);
});

test("dark fills: text meets 4.5:1 and edges meet 3:1 on every elevated fill", () => {
  const { value, parse, ratio } = edgeColors;
  const rgb = (token, mode) => { const p = parse(value(token, mode)); assert.equal(p.a, 1, `${token} must be opaque`); return p.c; };
  for (const fill of ["--bg-card", "--elevation-surface-small", "--elevation-surface-raised", "--elevation-surface-popup"]) {
    for (const text of ["--text-primary", "--text-secondary"]) {
      const r = ratio(rgb(text, 1), rgb(fill, 1));
      assert.ok(r >= 4.5, `${text} on ${fill} (dark) is ${r.toFixed(2)}:1, under 4.5:1`);
    }
    for (const edge of ["--input-border", "--control-border", "--border-default"]) {
      const r = ratio(rgb(edge, 1), rgb(fill, 1));
      assert.ok(r >= 3, `${edge} on ${fill} (dark) is ${r.toFixed(2)}:1, under 3:1`);
    }
  }
});

test("dark fills: text stays 4.5:1 on a menu or select item hover over the raised and popup fills", () => {
  const { value, parse, ratio } = edgeColors;
  const over = (top, under) => top.c.map((x, i) => Math.round(x * top.a + under[i] * (1 - top.a)));
  for (const fillToken of ["--elevation-surface-raised", "--elevation-surface-popup"]) {
    const fill = parse(value(fillToken, 1)).c;
    for (const hover of ["--bg-hover", "--bg-pressed"]) {
      const bg = over(parse(value(hover, 1)), fill);
      for (const text of ["--text-primary", "--text-secondary"]) {
        const r = ratio(parse(value(text, 1)).c, bg);
        assert.ok(r >= 4.5, `${text} on ${hover} over ${fillToken} (dark) is ${r.toFixed(2)}:1, under 4.5:1`);
      }
    }
  }
});

test("dark fills: the built components read the new fills, never --bg-card on an elevated surface", () => {
  const uses = (file, token) => assert.match(read(file), new RegExp(`bg-\\[color:var\\(${token}\\)\\]`), `${file} should use ${token}`);
  // A popup (menu, select list, hover card) is lighter than the Dialog it can open from. The Dialog keeps the raised fill.
  for (const f of ["vois/hover-card/hover-card.tsx", "vois/dropdown-menu/dropdown-menu.tsx", "vois/select/select.tsx"]) {
    uses(f, "--elevation-surface-popup");
    assert.doesNotMatch(read(f).replace(/^\s*\/\/.*$/gm, ""), /--elevation-surface-(?:raised|small)/, `${f} should not use the Dialog or Card fill`);
  }
  uses("vois/dialog/dialog.tsx", "--elevation-surface-raised");
  for (const f of ["vois/hover-card/hover-card.tsx", "vois/dropdown-menu/dropdown-menu.tsx", "vois/select/select.tsx", "vois/dialog/dialog.tsx"]) {
    assert.doesNotMatch(read(f).replace(/^\s*\/\/.*$/gm, ""), /bg-\[color:var\(--bg-card\)\]/, `${f} still fills with --bg-card`);
  }
  assert.match(read("vois/hover-card/hover-card.tsx"), /fill-\[color:var\(--elevation-surface-popup\)\]/, "the Hover Card arrow takes the same fill");
  assert.match(read("vois/card/card.tsx"), /hover:bg-\[color:var\(--elevation-surface-small\)\]/);
  assert.match(read("vois/command/command.tsx"), /\[&_\[data-slot=command\]\]:bg-transparent/, "CommandDialog must let the Dialog fill show");
});

// ---- Docked panels (DS-ELEVATION-006) ---------------------------------------------------------------

// The sign rule: a panel docked to an edge casts its shadow away from that edge. Right-docked is negative x, left-docked is
// positive x, bottom-docked is negative y, top-docked is positive y. The other axis is 0 and the spread is negative, so the
// shadow does not leak along the panel's sides. A centered element (the Dialog) has x = 0.
const DOCK_SIGN = { right: [-1, 0], left: [1, 0], bottom: [0, -1], top: [0, 1] };

test("docked shadows: the committed export passes the sign rule on every layer, in light and in dark", () => {
  for (const [source, name] of [[realExport.shadows, "light"], [realExport.darkShadows, "dark"]]) {
    for (const dock of Object.keys(DOCK_SIGN)) {
      const layers = source[`--shadow-large-${dock}`];
      assert.ok(Array.isArray(layers) && layers.length > 0, `${name} --shadow-large-${dock} is missing`);
      assert.deepEqual(dockedShadowProblems(`--shadow-large-${dock}`, layers), [], `${name} ${dock}`);
    }
  }
});

test("docked shadows: the generator refuses a wrong side, a layer across the edge and a spread that is not minus half the blur", () => {
  const base = { "--shadow-base": [[0, 0, 1, 1, "#0000000a"]], "--shadow-small": [[0, 1, 1, 0, "#0000000a"]], "--shadow-large-right": [[-2, 0, 2, -1, "#0000000d"]] };
  const dark = { "--shadow-large-right": [[-2, 0, 2, -1, "#00000033"]] };
  const fine = (sh, dk) => build(mini({ shadows: sh, top: { darkShadows: dk } }), brand());
  assert.doesNotThrow(() => fine(base, dark));
  for (const [label, layers, re] of [
    ["flipped", [[2, 0, 2, -1, "#0000000d"]], /must fall away from the right edge/],
    ["zero offset", [[0, 0, 2, -1, "#0000000d"]], /must fall away/],
    ["across the edge", [[-2, 1, 2, -1, "#0000000d"]], /moves across the dock edge/],
    ["no spread", [[-2, 0, 2, 0, "#0000000d"]], /spread 0 must be minus half the blur/],
    ["too much spread", [[-2, 0, 2, -2, "#0000000d"]], /spread -2 must be minus half the blur/],
  ]) assert.throws(() => fine({ ...base, "--shadow-large-right": layers }, dark), re, `light ${label}`);
  assert.throws(() => fine(base, { "--shadow-large-right": [[2, 0, 2, -1, "#00000033"]] }), /dark --shadow-large-right/, "dark flipped");
  for (const [dock, ok, bad] of [["left", [2, 0, 2, -1], [-2, 0, 2, -1]], ["bottom", [0, -2, 2, -1], [0, 2, 2, -1]], ["top", [0, 2, 2, -1], [0, -2, 2, -1]]]) {
    const name = `--shadow-large-${dock}`;
    assert.deepEqual(dockedShadowProblems(name, [[...ok, "#0000000d"]]), [], dock);
    assert.ok(dockedShadowProblems(name, [[...bad, "#0000000d"]]).length > 0, `${dock} flipped`);
  }
  // Names that are not docked shadows are not touched.
  assert.deepEqual(dockedShadowProblems("--shadow-large", [[5, 5, 2, 9, "#0000000d"]]), []);
  assert.deepEqual(dockedShadowProblems("--shadow-large-right", "x"), []);
});

test("docked shadows: the same layers as Large without its ring, in the same depths, light and dark alike", () => {
  const depth = (ls, dock) => ls.map((l) => Math.abs(DOCK_SIGN[dock][0] !== 0 ? l[0] : l[1]));
  const large = realExport.shadows["--shadow-large"].filter((l) => !(l[0] === 0 && l[1] === 0 && l[2] === 0 && l[3] === 1));
  for (const dock of Object.keys(DOCK_SIGN)) {
    for (const source of [realExport.shadows, realExport.darkShadows]) assert.deepEqual(depth(source[`--shadow-large-${dock}`], dock), large.map((l) => l[1]), dock);
    assert.deepEqual(realExport.shadows[`--shadow-large-${dock}`].map((l) => l[2]), large.map((l) => l[2]), `${dock} blur`);
  }
  // A centered element casts straight down, x = 0 (the Dialog).
  for (const layers of [realExport.shadows["--shadow-large"], realExport.darkShadows["--shadow-large"]]) for (const l of layers) assert.equal(l[0], 0, "a centered shadow has x = 0");
});

test("docked shadows: the generator writes all eight, and dark docked shadows are blacker", () => {
  const css = read("vois/tokens/vois-tokens.css");
  const maxA = (block, name) => Math.max(...[...new RegExp(`${name}: ([^;]*);`).exec(block)[1].matchAll(/\/ ([0-9.]+)\)/g)].map((m) => +m[1]));
  for (const dock of Object.keys(DOCK_SIGN)) assert.ok(maxA(darkBlock(css), `--shadow-large-${dock}`) > maxA(lightBlock(css), `--shadow-large-${dock}`), `${dock}: dark is not blacker than light`);
  for (const dock of Object.keys(DOCK_SIGN)) {
    assert.match(lightBlock(css), new RegExp(`--shadow-large-${dock}: `));
    assert.match(darkBlock(css), new RegExp(`--shadow-large-${dock}: `));
  }
});

test("choice card: a resting card steps up to Small on hover and drops its shadow when pressed; the other states keep Base", () => {
  const src = read("vois/choice-card/choice-card.tsx").replace(/^\s*\/\/.*$/gm, "");
  const resting = /resting:\s*\n?\s*"([^"]*)"/.exec(src)?.[1] ?? "";
  assert.match(resting, /hover:shadow-\[inset_0_0_0_1px_var\(--border-state-hover\),var\(--shadow-small\)\]/);
  assert.match(resting, /active:shadow-\[inset_0_0_0_1px_var\(--border-state-hover\)\]/, "pressed drops the shadow");
  for (const state of ["checked", "invalid", "disabled"]) {
    const cls = new RegExp(`${state}:\\s*\\n?\\s*"([^"]*)"`).exec(src)?.[1] ?? "";
    assert.ok(cls.length > 0, `${state} classes not found`);
    assert.doesNotMatch(cls, /--shadow-small/, `${state} must keep Base`);
  }
});

test("glass tokens: tints, edges and highlights are white at an alpha, lighter in dark; blur is 8 / 16 / 24 (vois-tokens DS-GLASS-002)", () => {
  const t = realExport.tokens;
  const whiteAlpha = (ref) => {
    const m = /^=--white-a(\d+)$/.exec(ref);
    assert.ok(m, `${ref} is not a White Alpha step`);
    return Number(m[1]);
  };
  for (const tier of ["subtle", "standard", "strong"]) {
    for (const part of ["tint", "stroke", "highlight"]) {
      const v = t[`--glass-${part}-${tier}`];
      assert.ok(Array.isArray(v) && v.length === 2, `--glass-${part}-${tier} has a light and a dark value`);
      assert.ok(whiteAlpha(v[1]) <= whiteAlpha(v[0]), `--glass-${part}-${tier}: dark is not more opaque than light`);
    }
  }
  const tints = ["subtle", "standard", "strong"].map((tier) => t[`--glass-tint-${tier}`].map(whiteAlpha));
  for (const mode of [0, 1]) assert.ok(tints[0][mode] < tints[1][mode] && tints[1][mode] < tints[2][mode], "each tier's tint is more opaque than the one below");
  assert.deepEqual(["subtle", "standard", "strong"].map((tier) => t[`--glass-blur-${tier}`]), [8, 16, 24]);
});
