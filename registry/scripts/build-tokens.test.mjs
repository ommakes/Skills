// Tests for build-tokens.mjs. Each guard gets an input that should pass and inputs that try to get past it.
// Run: node registry/scripts/build-tokens.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, buildFiles, buildShape, applyPending, pendingDuplicates, readPending, cssValue, hexToOklch, oklchToSrgb, parseHex, shadowCss, fnv1a } from "./build-tokens.mjs";

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
