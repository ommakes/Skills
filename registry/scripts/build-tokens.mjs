#!/usr/bin/env node
// Builds vois/tokens/vois-tokens.css from the Figma export and a brand file.
//
//   node registry/scripts/build-tokens.mjs                 write the CSS (vois-tokens.css and motion-tokens.css)
//   node registry/scripts/build-tokens.mjs --check         fail if the committed CSS is not what this writes
//   node registry/scripts/build-tokens.mjs --brand <file>  use another brand file (a product's own theme;
//                                                          the CSS goes to stdout, nothing is written)
//   node registry/scripts/build-tokens.mjs --verify-export <checksum>
//                                                          check a fresh export against the checksum the
//                                                          Figma export script printed
//
// Source: source/figma-export.json (from scripts/figma-export.js, run in Figma) and
// source/brand-default.json, plus source/figma-pending.json: tokens decided but not yet in Figma
// (FIGMA-TODO.md lists them). They are build inputs, not shipped files, so they live outside vois/. The export holds the seventeen brand slots (DS-TOKEN-004) as null;
// the brand file fills them. Colors become OKLCH, numbers px (ms for --motion-duration-*, unitless for
// --font-weight-* and the --z-* layers), font-family lists as written, aliases
// var(--name). Light values go in :root, dark values in .dark (only where they differ), as DS-TOKEN-003
// says. The --motion-* tokens go to motion-tokens.css: the vois-tokens skill allows literal durations and
// curves only in a file with that name (DS-MOTION-001).

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const registryDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SOURCE = join(registryDir, "source");
const OUT = join(registryDir, "vois/tokens/vois-tokens.css");
const MOTION_OUT = join(registryDir, "vois/tokens/motion-tokens.css");

// ---- Color ---------------------------------------------------------------------------

export function parseHex(hex) {
  const m = typeof hex === "string" && /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(hex.toLowerCase());
  if (!m) throw new Error(`not a #rrggbb or #rrggbbaa color: ${hex}`);
  const n = (i) => parseInt(m[1].slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: m[2] === undefined ? 1 : parseInt(m[2], 16) / 255 };
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// sRGB -> OKLCH (Björn Ottosson's OKLab), rounded to what the CSS writes.
export function hexToOklch(hex) {
  const { r, g, b, a } = parseHex(hex);
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  if (C < 0.0005) { C = 0; H = 0; }
  return { L: +L.toFixed(4), C: +C.toFixed(4), H: +H.toFixed(2), a: +a.toFixed(3) };
}

export function oklchToSrgb({ L, C, H }) {
  const A = C * Math.cos((H * Math.PI) / 180);
  const B = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return lin.map((c) => Math.min(1, Math.max(0, fromLinear(c))));
}

export const oklchCss = (hex) => {
  const { L, C, H, a } = hexToOklch(hex);
  return a === 1 ? `oklch(${L} ${C} ${H})` : `oklch(${L} ${C} ${H} / ${a})`;
};

// ---- Values --------------------------------------------------------------------------

const ALIAS = /^=(--[a-z0-9-]+)$/;

// A cubic-bezier with four plain numbers, nothing else (a Figma string variable holds it).
const BEZIER = /^cubic-bezier\(\s*-?(?:\d+\.?\d*|\.\d+)\s*(?:,\s*-?(?:\d+\.?\d*|\.\d+)\s*){3}\)$/;
export const isMotion = (name) => name.startsWith("--motion-");

// A font-family list: names and generic families separated by commas, optionally quoted. No ; { } or
// other characters that could end the declaration.
const NAME = `(?:"[A-Za-z0-9 ._-]+"|'[A-Za-z0-9 ._-]+'|-?[A-Za-z_][A-Za-z0-9 _-]*)`;
const FAMILY = new RegExp(`^\\s*${NAME}(?:\\s*,\\s*${NAME})*\\s*$`);

export function cssValue(v, names, name = "") {
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new Error(`not a finite number: ${v}`);
    if (name.startsWith("--font-weight-")) {
      if (!Number.isInteger(v) || v < 1 || v > 1000) throw new Error(`${name}: a font weight is a whole number from 1 to 1000`);
      return String(v);
    }
    // A z-index layer (--z-dropdown, --z-modal): a whole number with no unit, or z-index ignores it.
    if (/^--z-[a-z0-9]/.test(name)) {
      if (!Number.isInteger(v)) throw new Error(`${name}: a z-index is a whole number`);
      return String(v);
    }
    if (name.startsWith("--motion-duration-")) {
      if (!(v > 0)) throw new Error(`${name}: a duration must be above 0`);
      return `${v}ms`;
    }
    return v === 0 ? "0" : `${v}px`;
  }
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const keys = Object.keys(v);
    if (keys.length !== 1 || keys[0] !== "css" || typeof v.css !== "string") throw new Error(`${name}: unsupported value ${JSON.stringify(v)}`);
    if (name.startsWith("--font-family-")) {
      if (!FAMILY.test(v.css)) throw new Error(`${name}: ${JSON.stringify(v.css)} is not a font-family list`);
      return v.css.trim();
    }
    if (!name.startsWith("--motion-ease-")) throw new Error(`${name}: a { css } value is only allowed for --motion-ease-* and --font-family-* tokens`);
    if (!BEZIER.test(v.css)) throw new Error(`${name}: ${JSON.stringify(v.css)} is not a cubic-bezier with four numbers`);
    // CSS requires both x values in [0, 1]; outside it the whole declaration is invalid and the browser
    // drops the transition without an error.
    const [x1, , x2] = v.css.slice(v.css.indexOf("(") + 1, -1).split(",").map(Number);
    if (!(x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1)) throw new Error(`${name}: ${v.css} has an x value outside 0 to 1, which CSS rejects`);
    return v.css;
  }
  if (typeof v === "string") {
    const m = ALIAS.exec(v);
    if (m) {
      if (!names.has(m[1])) throw new Error(`alias to unknown token ${m[1]}`);
      return `var(${m[1]})`;
    }
    return oklchCss(v);
  }
  throw new Error(`unsupported value ${JSON.stringify(v)}`);
}

// A value is one value for both modes, or [light, dark].
const modes = (v) => (Array.isArray(v) ? (v.length === 2 ? v : (() => { throw new Error(`[light, dark] must have two values, got ${v.length}`); })()) : [v, v]);

export function shadowCss(layers) {
  if (!Array.isArray(layers) || layers.length === 0) throw new Error("a shadow needs at least one layer");
  return layers.map((layer) => {
    if (!Array.isArray(layer) || layer.length !== 5) throw new Error(`a shadow layer is [x, y, blur, spread, color], got ${JSON.stringify(layer)}`);
    const [x, y, blur, spread, color] = layer;
    for (const n of [x, y, blur, spread]) if (typeof n !== "number" || !Number.isFinite(n)) throw new Error(`shadow offset/blur/spread must be numbers: ${JSON.stringify(layer)}`);
    const px = (n) => (n === 0 ? "0" : `${n}px`);
    return `${px(x)} ${px(y)} ${px(blur)} ${px(spread)} ${oklchCss(color)}`;
  }).join(", ");
}

// ---- Build ---------------------------------------------------------------------------

// Tokens decided but not yet in Figma. `add` holds new tokens, `change` holds { from, to } for a token
// the export already has. Every entry must still be pending: an added token that Figma now exports, or a
// change Figma now matches, fails, so the file empties as Figma catches up. `from` must equal the export
// exactly, so a change in Figma that this file did not expect fails too.
// JSON.parse keeps the last of two equal keys without a word. A token name written twice in the pending
// file (in add, in change, or once in each) is a hand-editing slip, so the raw text is checked.
export function pendingDuplicates(text) {
  const counts = new Map();
  for (const m of text.matchAll(/"(--[A-Za-z0-9_-]+)"\s*:/g)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  return [...counts].filter(([, n]) => n > 1).map(([k]) => k);
}

export function readPending(text) {
  const dup = pendingDuplicates(text);
  if (dup.length) throw new Error(`figma-pending.json: ${dup.join(", ")} written more than once`);
  return JSON.parse(text);
}

export function applyPending(tokens, slots, pending) {
  if (pending === undefined || pending === null) return { ...tokens };
  if (pending.format !== 1) throw new Error("figma-pending.json: format must be 1");
  const add = pending.add ?? {};
  const change = pending.change ?? {};
  for (const [label, o] of [["add", add], ["change", change]]) if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error(`figma-pending.json: ${label} must be an object`);
  const out = { ...tokens };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (const [k, v] of Object.entries(add)) {
    if (slots.includes(k)) throw new Error(`figma-pending.json: ${k} is a brand slot; brand values belong in a brand file`);
    if (Object.hasOwn(tokens, k)) throw new Error(`figma-pending.json: ${k} is now in the Figma export; remove it from add (and from FIGMA-TODO.md)`);
    if (v === null || v === undefined) throw new Error(`figma-pending.json: ${k} has no value`);
    out[k] = v;
  }
  for (const [k, c] of Object.entries(change)) {
    if (slots.includes(k)) throw new Error(`figma-pending.json: ${k} is a brand slot; brand values belong in a brand file`);
    if (Object.hasOwn(add, k)) throw new Error(`figma-pending.json: ${k} is in both add and change`);
    if (!Object.hasOwn(tokens, k)) throw new Error(`figma-pending.json: change ${k} is not in the Figma export`);
    if (!c || typeof c !== "object" || !Object.hasOwn(c, "from") || !Object.hasOwn(c, "to")) throw new Error(`figma-pending.json: change ${k} needs from and to`);
    if (same(tokens[k], c.to)) throw new Error(`figma-pending.json: Figma now has ${k} = ${JSON.stringify(c.to)}; remove it from change (and from FIGMA-TODO.md)`);
    if (!same(tokens[k], c.from)) throw new Error(`figma-pending.json: Figma has ${k} = ${JSON.stringify(tokens[k])}, but the change expects ${JSON.stringify(c.from)}`);
    if (c.to === null) throw new Error(`figma-pending.json: change ${k} has no value`);
    out[k] = c.to;
  }
  return out;
}

export function build(exportJson, brandJson, opts = {}) {
  return buildFiles(exportJson, brandJson, opts).tokens;
}

export function buildFiles(exportJson, brandJson, { brandLabel = "registry/source/brand-default.json", pending } = {}) {
  if (exportJson?.format !== 1) throw new Error("figma-export.json: format must be 1");
  const slots = exportJson.brandSlots;
  if (!Array.isArray(slots) || slots.length === 0) throw new Error("figma-export.json: brandSlots must be a non-empty list");
  const tokens = exportJson.tokens;
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) throw new Error("figma-export.json: tokens must be an object");
  for (const s of slots) {
    if (!Object.hasOwn(tokens, s)) throw new Error(`brand slot ${s} is not in the export`);
    if (tokens[s] !== null) throw new Error(`brand slot ${s} has a value in the export; brand values belong in a brand file, never in the export`);
  }
  for (const [k, v] of Object.entries(tokens)) if (v === null && !slots.includes(k)) throw new Error(`${k} is null but is not a brand slot`);
  const withPending = applyPending(tokens, slots, pending);

  const brand = brandJson?.tokens;
  if (!brand || typeof brand !== "object" || Array.isArray(brand)) throw new Error("brand file: tokens must be an object");
  for (const s of slots) if (!Object.hasOwn(brand, s) || brand[s] === null) throw new Error(`brand file: brand slot ${s} has no value`);
  for (const k of Object.keys(brand)) if (!slots.includes(k)) throw new Error(`brand file: ${k} is not a brand slot; a brand theme overrides the brand slots and nothing else`);

  const merged = { ...withPending, ...brand };
  const names = new Set(Object.keys(merged));
  for (const k of names) if (!/^--[a-z0-9]+(?:-[a-z0-9]+)*$/.test(k)) throw new Error(`not a token name: ${k}`);

  const light = [];
  const dark = [];
  const motion = [];
  for (const k of [...names].sort()) {
    const [l, d] = modes(merged[k]);
    const lc = cssValue(l, names, k);
    const dc = cssValue(d, names, k);
    if (isMotion(k)) {
      // Motion is the same in both modes, and a motion token may only alias another motion token, so
      // motion-tokens.css stands on its own.
      if (dc !== lc) throw new Error(`${k}: a motion token has one value for both modes`);
      if (lc.startsWith("var(") && !isMotion(lc.slice(4, -1))) throw new Error(`${k}: a motion token may only alias a motion token`);
      motion.push(`  ${k}: ${lc};`);
      continue;
    }
    if (lc.startsWith("var(") && isMotion(lc.slice(4, -1))) throw new Error(`${k}: aliases a motion token; motion tokens live in motion-tokens.css`);
    light.push(`  ${k}: ${lc};`);
    // A var() resolves where it is declared, so an alias declared only in :root keeps its light result
    // inside a .dark section. Every alias is declared again in .dark so it resolves there.
    if (dc !== lc || dc.startsWith("var(")) dark.push(`  ${k}: ${dc};`);
  }
  // An alias chain must end at a value. A chain longer than the number of tokens has to repeat, so it loops.
  for (const k of names) {
    for (const i of [0, 1]) {
      let cur = k;
      for (let steps = 0; ; steps++) {
        if (steps > names.size) throw new Error(`alias loop through ${k}`);
        const m = typeof modes(merged[cur])[i] === "string" && ALIAS.exec(modes(merged[cur])[i]);
        if (!m) break;
        cur = m[1];
      }
    }
  }

  // --grid-margin and --grid-gutter are generated, never stored (vois-tokens DS-GRID-004): one clamp() per
  // line, flat outside its two anchor widths, the same line as grid-logic.mjs computes.
  for (const line of ["--grid-margin", "--grid-gutter"]) {
    if (names.has(line)) throw new Error(`${line} is generated and must not be stored`);
    const parts = ["min", "max", "min-at", "max-at"].map((p) => `${line}-${p}`);
    const present = parts.filter((p) => names.has(p));
    if (present.length === 0) continue;
    if (present.length !== 4) throw new Error(`${line} needs all four of ${parts.join(", ")}`);
    const [min, max, minAt, maxAt] = parts.map((p) => merged[p]);
    if (![min, max, minAt, maxAt].every((n) => typeof n === "number")) throw new Error(`${line}: the four line tokens must be numbers`);
    if (!(min < max) || !(minAt < maxAt)) throw new Error(`${line}: needs min below max and min-at below max-at`);
    const slope = +((max - min) / (maxAt - minAt)).toFixed(6);
    light.push(`  ${line}: clamp(var(${line}-min), calc(var(${line}-min) + (100cqi - var(${line}-min-at)) * ${slope}), var(${line}-max));`);
  }

  const shadows = exportJson.shadows ?? {};
  if (!shadows || typeof shadows !== "object" || Array.isArray(shadows)) throw new Error("figma-export.json: shadows must be an object");
  for (const [k, layers] of Object.entries(shadows)) {
    if (!/^--[a-z0-9]+(?:-[a-z0-9]+)*$/.test(k)) throw new Error(`not a shadow token name: ${k}`);
    if (names.has(k)) throw new Error(`shadow ${k} has the same name as a token`);
    light.push(`  ${k}: ${shadowCss(layers)};`);
  }

  const pendingCount = Object.keys(pending?.add ?? {}).length + Object.keys(pending?.change ?? {}).length;
  const pendingLine = pendingCount ? ["  Plus registry/source/figma-pending.json: decided, not yet in Figma (registry/FIGMA-TODO.md)."] : [];
  const tokensCss = [
    "/*",
    "  GENERATED by registry/scripts/build-tokens.mjs. Do not edit by hand.",
    "  Source: registry/source/figma-export.json (the Vois Figma variables) and",
    `  ${brandLabel}${brandJson.name ? ` (${brandJson.name})` : ""}.`,
    ...pendingLine,
    "  Names are each variable's Web code syntax in Figma (vois-tokens DS-TOKEN-002).",
    "  Light values in :root, dark values in .dark (DS-TOKEN-003). Motion tokens are in motion-tokens.css.",
    "*/",
    ":root {",
    ...light,
    "}",
    ".dark {",
    ...dark,
    "}",
    "",
  ].join("\n");
  const motionCss = [
    "/*",
    "  GENERATED by registry/scripts/build-tokens.mjs. Do not edit by hand.",
    "  The Vois motion tokens (vois-tokens DS-MOTION-001), from the same sources as vois-tokens.css.",
    ...pendingLine,
    "  The vois-tokens skill allows literal durations and curves only in a file named motion-tokens.css.",
    "*/",
    ":root {",
    ...motion,
    "}",
    "",
  ].join("\n");
  return { tokens: tokensCss, motion: motionCss };
}

export const fnv1a = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };

function main(argv) {
  const args = argv.slice(2);
  const exportText = readFileSync(join(SOURCE, "figma-export.json"), "utf8");
  const vi = args.indexOf("--verify-export");
  if (vi !== -1) {
    const want = args[vi + 1];
    const got = fnv1a(exportText);
    if (got !== want) { console.error(`figma-export.json checksum ${got}, expected ${want}: the file is not what Figma exported`); process.exit(1); }
    console.log(`figma-export.json matches the export (${got})`);
    return;
  }
  const bi = args.indexOf("--brand");
  const brandPath = bi !== -1 ? resolve(args[bi + 1] ?? "") : join(SOURCE, "brand-default.json");
  const pending = readPending(readFileSync(join(SOURCE, "figma-pending.json"), "utf8"));
  const files = buildFiles(JSON.parse(exportText), JSON.parse(readFileSync(brandPath, "utf8")), { pending, ...(bi !== -1 ? { brandLabel: args[bi + 1] } : {}) });
  // A brand build writes only vois-tokens.css (to stdout); motion does not depend on the brand.
  if (bi !== -1) { process.stdout.write(files.tokens); return; }
  if (args.includes("--check")) {
    for (const [out, css] of [[OUT, files.tokens], [MOTION_OUT, files.motion]]) {
      let current = "";
      try { current = readFileSync(out, "utf8"); } catch { /* missing counts as stale */ }
      if (current !== css) { console.error(`${out} is not what build-tokens.mjs writes. Run: node registry/scripts/build-tokens.mjs`); process.exit(1); }
    }
    console.log("vois-tokens.css and motion-tokens.css are up to date");
    return;
  }
  writeFileSync(OUT, files.tokens);
  writeFileSync(MOTION_OUT, files.motion);
  console.log(`wrote ${OUT} and ${MOTION_OUT}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main(process.argv);
