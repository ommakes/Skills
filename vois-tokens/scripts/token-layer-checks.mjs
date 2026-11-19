// DS-TOKEN-001: component code never names a Global palette step directly. Palettes are reached through the
// Base, System and Component tokens that alias them (references/figma-variables.md).
//
// Flagged: a palette step named as a value: `var(--blue-9)`, Tailwind v4's `bg-(--blue-9)` and
// `bg-[color:var(--blue-9)]`, a style object string, a CSS declaration, a bare name in a string.
// Not flagged: the palette defining itself (`--blue-9: oklch(...)`) and a custom property that aliases a step
// (`--bg-card: var(--white)`, `"--accent": "var(--blue-9)"`, Tailwind's `[--accent:var(--blue-9)]`). Aliasing is how
// the layers are built, so a token file or a theme block passes as it is. Comments are skipped.
// Known gaps: because aliasing passes everywhere, a step can be laundered through a custom property, a component's
// own (style={{ "--x": "var(--blue-9)" }}, then var(--x)) or a Tailwind theme alias (@theme { --color-blue-9:
// var(--blue-9) }, then bg-blue-9, which DS-COLOR-002 does not read either). Catching that needs to know which files
// are token files.
//
// The hue list is the Vois Global palette. registry/scripts/check-registry.test.mjs checks it against every
// palette family in registry/source/figma-export.json, so a new or renamed hue fails CI instead of slipping by.
// A product palette with other hue names is not read: an unknown name is never flagged, which is the narrow side.

import { finding, uncomment } from "./check-utils.mjs";

export const PALETTE_HUES = [
  "aqua", "blue", "blurple", "cool-gray", "cyan", "goldie", "gray", "green", "lawn", "lipstick",
  "nude", "orange", "rose", "smurf", "tomato", "violet", "warm-gray", "yellow",
];

// Steps 0 to 12, plain or alpha (-a). black and white also stand alone (--white, --black).
const STEP = "(?:1[0-2]|[0-9])";
const HUES = [...PALETTE_HUES].sort((a, b) => b.length - a.length).join("|");
// A palette name that is not part of a longer name: no word character or dash before the "--" (so a BEM class
// such as card--blue-3 does not count) and none after the step (so --blue-9-text or --gray-10x does not count).
// Exported as a source string, not a RegExp: a shared global regex carries lastIndex between callers.
export const PALETTE_NAME_SOURCE = `(?<![\\w-])--(?:(?:${HUES})-a?${STEP}|(?:white|black)(?:-a${STEP})?)(?![\\w-])`;

/** True when `name` is a Global palette step (`--blue-9`, `--gray-a4`, `--white`). */
export function isPaletteToken(name) {
  return new RegExp(`^${PALETTE_NAME_SOURCE}$`).test(name);
}

// Walk back from `index` to the start of the declaration it sits in. A declaration ends at ; { } or a newline,
// and at a comma that is outside every bracket, so a fallback (var(--a, var(--blue-9))) or a shadow list stays one
// value while two keys of one style object ({ "--x": "...", color: "..." }) do not.
function declarationStart(text, index) {
  let depth = 0;
  let comma = -1; // the nearest comma at the current bracket level, kept until we know no bracket encloses it
  for (let i = index - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ")" || ch === "]") depth++;
    else if (ch === "(" || ch === "[") {
      if (depth > 0) depth--;
      else comma = -1; // an enclosing bracket: a comma seen so far is inside it, so it does not end the declaration
    } else if (ch === ";" || ch === "{" || ch === "}" || ch === "\n") return comma >= 0 ? comma + 1 : i + 1;
    else if (ch === "," && depth === 0 && comma < 0) comma = i;
  }
  return comma >= 0 ? comma + 1 : 0;
}

// A custom property being declared: `--x:` in CSS, `"--x":`, `'--x':` or `["--x"]:` in a style object.
const DEFINES_CUSTOM_PROPERTY = /^\s*\[?\s*["'`]?--[\w-]+["'`]?\s*\]?\s*:/;

export function paletteRefs({ content, lines, filePath }) {
  const text = uncomment(content, filePath);
  const out = [];
  const re = new RegExp(PALETTE_NAME_SOURCE, "g");
  let m;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[0].length;
    const start = declarationStart(text, m.index);
    const before = text.slice(start, m.index);
    // The palette defining itself (--blue-9: oklch(...), "--blue-9": "#..."): the name starts its declaration and a
    // colon follows. A colon after a name elsewhere (the first branch of a ternary) does not count.
    if (/^\s*\[?\s*["'`]?$/.test(before) && /^["'`]?\s*\]?\s*:/.test(text.slice(end, end + 8))) continue;
    if (DEFINES_CUSTOM_PROPERTY.test(before)) continue;
    // Tailwind arbitrary property: [--accent:var(--blue-9)]
    if (/\[--[\w-]+:[^\]\s]*$/.test(text.slice(Math.max(0, m.index - 200), m.index))) continue;
    out.push(finding(content, lines, m.index, `Global palette step ${m[0]} used directly. Use the System or Component token that aliases it.`));
  }
  return out;
}

