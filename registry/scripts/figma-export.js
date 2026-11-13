// Vois token export. A read-only script for the Figma `use_figma` tool (Plugin API), run on the Vois
// design system file. It returns { checksum, json }: save `json` byte for byte as
// registry/source/figma-export.json, then check the checksum with
// `node registry/scripts/build-tokens.mjs --verify-export <checksum>`.
//
// What it exports: every variable that has Web code syntax (its CSS name). A value is a color
// (#rrggbb or #rrggbbaa), a number (px) or an alias ("=--name"). When Light and Dark differ the value is
// [light, dark]; otherwise one value. Plus the Elevation/* effect styles as [x, y, blur, spread, color] layers.
// The seventeen brand slots (DS-TOKEN-004: thirteen colors, four font families) are written as null: a product's brand never leaves Figma here.

const BRAND_SLOTS = [
  "--base-brand", "--base-accent-solid", "--base-accent-soft",
  "--action-primary-resting", "--action-primary-hover", "--action-primary-focus", "--action-primary-pressed", "--action-primary-disabled", "--action-primary-text",
  "--bg-accent", "--text-accent", "--icon-accent", "--border-accent",
  // The font families carry the brand too (DS-TOKEN-004).
  "--font-family-brand", "--font-family-system", "--font-family-written", "--font-family-mono",
];
const SHADOW_NAMES = { "Elevation/Base": "--shadow-base", "Elevation/Small": "--shadow-small", "Elevation/Medium": "--shadow-medium", "Elevation/Large": "--shadow-large", "Elevation/XLarge": "--shadow-xlarge" };

const hex = (c) => {
  const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && Math.round(c.a * 255) < 255 ? h(c.a) : "");
};
const cssOf = (v) => {
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(v.codeSyntax?.WEB ?? "");
  return m ? m[1] : null;
};

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const byId = new Map();
for (const v of await figma.variables.getLocalVariablesAsync()) byId.set(v.id, v);

const tokens = {};
const enc = (val, v, key) => {
  if (val && typeof val === "object" && val.type === "VARIABLE_ALIAS") {
    const target = byId.get(val.id);
    const tcss = target && cssOf(target);
    if (!tcss) throw new Error(`${v.name} (${key}) aliases ${target ? target.name : val.id}, which has no Web code syntax`);
    return "=" + tcss;
  }
  if (val && typeof val === "object" && "r" in val) return hex(val);
  if (typeof val === "number") return val;
  // A string variable (an easing curve) goes out as { css }. build-tokens.mjs accepts it only for a
  // --motion-ease-* token holding a cubic-bezier, so anything else fails there.
  if (typeof val === "string") return { css: val };
  throw new Error(`${v.name} (${key}): unsupported value ${JSON.stringify(val)}`);
};
for (const col of collections) {
  const light = col.modes.find((m) => /light/i.test(m.name));
  const dark = col.modes.find((m) => /dark/i.test(m.name));
  // A collection whose modes are not Light and Dark (Breakpoints: narrow, sm, md, lg) gives constants only:
  // a variable with code syntax must have one value in every mode, or the export stops.
  const constantsOnly = col.modes.length > 1 && (!light || !dark);
  for (const id of col.variableIds) {
    const v = byId.get(id);
    const css = v && cssOf(v);
    if (!css) continue;
    if (Object.hasOwn(tokens, css)) throw new Error(`duplicate CSS name ${css}`);
    if (BRAND_SLOTS.includes(css)) { tokens[css] = null; continue; }
    if (constantsOnly) {
      const vals = col.modes.map((m) => enc(v.valuesByMode[m.modeId], v, m.name));
      if (vals.some((x) => JSON.stringify(x) !== JSON.stringify(vals[0]))) throw new Error(`${v.name} has code syntax but differs between ${col.name} modes; a token needs one value`);
      tokens[css] = vals[0];
      continue;
    }
    if (col.modes.length === 1) { tokens[css] = enc(v.valuesByMode[col.modes[0].modeId], v, "all"); continue; }
    const l = enc(v.valuesByMode[light.modeId], v, "light");
    const d = enc(v.valuesByMode[dark.modeId], v, "dark");
    // Compare by value: two equal { css } objects are one value, not [light, dark].
    tokens[css] = JSON.stringify(l) === JSON.stringify(d) ? l : [l, d];
  }
}
for (const s of BRAND_SLOTS) if (!Object.hasOwn(tokens, s)) throw new Error(`brand slot ${s} has no variable`);

const shadows = {};
for (const s of await figma.getLocalEffectStylesAsync()) {
  const css = SHADOW_NAMES[s.name];
  if (!css) continue;
  const visible = s.effects.filter((e) => e.type === "DROP_SHADOW" && e.visible !== false);
  // A shadow bound to variables would change by mode; flattening it to one hex would lose that silently.
  for (const e of visible) if (e.boundVariables && Object.keys(e.boundVariables).length) throw new Error(`${s.name} has a shadow bound to a variable; the export does not support that yet`);
  shadows[css] = visible.map((e) => [e.offset.x, e.offset.y, e.radius, e.spread ?? 0, hex(e.color)]);
}
if (Object.keys(shadows).length !== Object.keys(SHADOW_NAMES).length) throw new Error(`expected ${Object.keys(SHADOW_NAMES).length} elevation styles, found ${Object.keys(shadows).length}`);

// One token per line, sorted, so a re-export diffs cleanly.
const line = (k, v) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`;
const tokenLines = Object.keys(tokens).sort().map((k) => line(k, tokens[k]));
const shadowLines = Object.values(SHADOW_NAMES).map((k) => line(k, shadows[k]));
const json = "{\n" +
  ` "format": 1,\n "brandSlots": ${JSON.stringify(BRAND_SLOTS)},\n` +
  ` "tokens": {\n${tokenLines.join(",\n")}\n },\n` +
  ` "shadows": {\n${shadowLines.join(",\n")}\n }\n}\n`;
JSON.parse(json);
// FNV-1a over UTF-16 code units, as an 8-digit hex string.
let h = 0x811c9dc5;
for (let i = 0; i < json.length; i++) { h ^= json.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
return { checksum: h.toString(16).padStart(8, "0"), length: json.length, tokens: Object.keys(tokens).length, shadows: Object.keys(shadows).length, json };
