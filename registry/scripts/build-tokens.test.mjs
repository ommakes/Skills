// Tests for build-tokens.mjs. Each guard gets an input that should pass and inputs that try to get past it.
// Run: node registry/scripts/build-tokens.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, cssValue, hexToOklch, oklchToSrgb, parseHex, shadowCss, fnv1a } from "./build-tokens.mjs";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => readFileSync(join(registryDir, p), "utf8");
const realExport = JSON.parse(read("source/figma-export.json"));
const realBrand = JSON.parse(read("source/brand-default.json"));

// A tiny export with one brand slot, used to try each guard.
const mini = (over = {}) => ({ format: 1, brandSlots: ["--base-brand"], tokens: { "--white": "#ffffff", "--blue-9": "#1d88ff", "--base-brand": null, "--bg-card": ["=--white", "=--blue-9"], ...over.tokens }, shadows: over.shadows ?? {}, ...(over.top ?? {}) });
const brand = (tokens = { "--base-brand": "=--blue-9" }) => ({ name: "test", file: "brand-test.json", tokens });

test("the committed CSS is exactly what the generator writes", () => {
  assert.equal(build(realExport, realBrand), read("vois/tokens/vois-tokens.css"));
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

test("the default brand is blue: every brand slot points at the blue palette", () => {
  for (const [k, v] of Object.entries(realBrand.tokens)) for (const x of Array.isArray(v) ? v : [v]) assert.match(x, /^=--blue-(?:a)?\d+$/, k);
  assert.deepEqual(Object.keys(realBrand.tokens).sort(), [...realExport.brandSlots].sort());
});

test("fnv1a matches the Figma export script's checksum", () => {
  assert.equal(fnv1a(""), "811c9dc5");
  assert.equal(fnv1a("a"), "e40c292c");
  assert.notEqual(fnv1a(read("source/figma-export.json")), fnv1a(read("source/figma-export.json") + " "));
});
