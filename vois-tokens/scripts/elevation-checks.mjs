// Regex-level checks for two elevation rules. No parser, no dependency, same as registry.mjs.
//   DS-ELEVATION-007  a raw shadow with blur instead of a tier token (box-shadow, boxShadow, shadow-[...], shadow-md)
//   DS-ELEVATION-006  a docked panel whose shadow is the all-sides Large token or the token for another edge
//
// Each check reports one shape of the violation and stays quiet on anything it cannot read. A pass is
// not proof the rule is met. Known gaps are listed in references/hooks.md and pinned by tests in detect.test.mjs.
//
// What counts as a raw shadow (007): a layer whose blur is above 0. A zero-blur layer is an edge or a ring
// (`0 0 0 1px var(--border-default)`, `inset 0 0 0 2px red`), not elevation, so it is allowed. A layer with no third
// length ("none", a lone var(...), x and y only) or whose blur is a var(...) or calc(...) is not read.

import { finding, isCssFile, uncomment } from "./check-utils.mjs";

/** Split `text` on `sep` (a character, or " " for any whitespace) outside parentheses and brackets. */
function splitTop(text, sep) {
  const parts = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (depth === 0 && (sep === " " ? /\s/.test(c) : c === sep)) {
      if (i > from) parts.push(text.slice(from, i));
      from = i + 1;
    }
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts.map((p) => p.trim()).filter(Boolean);
}

const LENGTH = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:px|rem|em|pt|cm|mm|in|vw|vh|%)?$/i;

/**
 * The raw layers in one box-shadow value, each with its blur. The lengths of a layer are the run of plain lengths
 * that starts at its first length, and its blur is the third of them. A var() or calc() ends the run, so
 * `0 0 var(--b) 2px red` has no third length (the blur is unknown), and the 2px is not mistaken for it.
 */
export function rawLayers(value) {
  const out = [];
  for (const layer of splitTop(value, ",")) {
    const tokens = splitTop(layer, " ");
    const start = tokens.findIndex((t) => LENGTH.test(t));
    if (start === -1) continue;
    const run = [];
    for (let i = start; i < tokens.length && LENGTH.test(tokens[i]); i++) run.push(tokens[i]);
    if (!run[2] || !(parseFloat(run[2]) > 0)) continue; // no third length, or a ring or a hard edge
    out.push({ layer, blur: run[2] });
  }
  return out;
}

// A class string, or any quoted string or template literal. No escapes beyond a backslash are read, and a quote that does not close on its line is skipped.
const STRING = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const DEFAULT_TW_SHADOW = /(?<![\w-])((?:[\w-]+:)*)(inset-)?shadow-(2xs|xs|sm|md|lg|xl|2xl)(?![\w-])/g;

/**
 * The string literals of the expression that follows a style key, up to its end: a ternary (`a ? "x" : "y"`) gives both,
 * and a StyleX conditional object (`{ default: "x", ":hover": "y" }`) gives every value. The expression ends at a
 * "," ";" or closing bracket that is not inside brackets opened by the expression itself.
 */
function stringsOfExpression(text, from) {
  const strings = [];
  let depth = 0;
  const limit = Math.min(text.length, from + 1200);
  for (let i = from; i < limit; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < limit && text[j] !== c && text[j] !== "\n") j += text[j] === "\\" ? 2 : 1;
      if (text[j] !== c) break; // never closes on this line
      strings.push(text.slice(i + 1, j));
      i = j;
    } else if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") { if (--depth < 0) break; }
    else if (depth === 0 && (c === "," || c === ";")) break;
  }
  return strings;
}

/** DS-ELEVATION-007: a raw shadow with blur. */
export function rawShadow({ content, lines, filePath }) {
  const text = uncomment(content, filePath);
  const findings = [];
  const report = (index, message) => findings.push(finding(content, lines, index, message));
  const hint = "Use a tier token (--shadow-base to --shadow-xlarge). A zero-blur ring is fine.";
  let m;

  // 1. box-shadow: <value>  (CSS, and CSS inside a string or template literal; the vendor prefixes too)
  const decl = /(?<![\w-])(?:-(?:webkit|moz)-)?box-shadow\s*:\s*([^;{}"'`]*)/gi;
  while ((m = decl.exec(text)) !== null) {
    for (const r of rawLayers(m[1])) report(m.index, `box-shadow layer "${r.layer.slice(0, 70)}" has a ${r.blur} blur. ${hint}`);
  }

  // 2. A style object key or an assignment: boxShadow: "...", "boxShadow": "...", 'box-shadow': "...", el.style.boxShadow = "..."
  const key = /(?<![\w$-])["']?(?:boxShadow|box-shadow)["']?\]?\s*[:=](?![=>])/g;
  while ((m = key.exec(text)) !== null) {
    for (const value of stringsOfExpression(text, m.index + m[0].length)) {
      for (const r of rawLayers(value)) report(m.index, `boxShadow layer "${r.layer.slice(0, 70)}" has a ${r.blur} blur. ${hint}`);
    }
  }

  // 3. shadow-[...] and inset-shadow-[...] (Tailwind arbitrary value; "_" is a space)
  const arb = /(?<![\w-])((?:[\w-]+:)*)(?:inset-)?shadow-\[/g;
  while ((m = arb.exec(text)) !== null) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    let end = -1;
    for (let i = open; i < Math.min(text.length, open + 600); i++) {
      if (text[i] === "[") depth++;
      else if (text[i] === "]" && --depth === 0) { end = i; break; }
      else if (text[i] === "\n" || text[i] === '"' || text[i] === "'" || text[i] === "`") break; // a class string does not span these
    }
    if (end === -1) continue;
    for (const r of rawLayers(text.slice(open + 1, end).replace(/_/g, " "))) report(m.index, `shadow-[...] layer "${r.layer.slice(0, 70)}" has a ${r.blur} blur. ${hint}`);
  }

  // 4. Tailwind's own sizes. They are not Vois tiers. In CSS they count inside @apply; in code, inside a string.
  const sizes = (body, base) => {
    const re = new RegExp(DEFAULT_TW_SHADOW.source, "g");
    let s;
    while ((s = re.exec(body)) !== null) report(base + s.index, `${s[2] ?? ""}shadow-${s[3]} is a Tailwind default, not a Vois tier. ${hint}`);
  };
  if (isCssFile(filePath)) {
    const apply = /@apply\s+([^;}]*)/g;
    while ((m = apply.exec(text)) !== null) sizes(m[1], m.index + m[0].length - m[1].length);
  } else {
    const str = new RegExp(STRING.source, "g");
    while ((m = str.exec(text)) !== null) sizes(m[2], m.index + 1);
  }
  return findings;
}

const SHADOW_REF = /var\(\s*--shadow-(base|small|medium|large|xlarge)(?:-(right|left|bottom|top))?\s*[,)]/g;

/** Which edge a class list docks its element to: "right" | "left" | "bottom" | "top" | null. A `!` important marker is ignored. */
function dockOf(classes) {
  // A class behind a variant (md:right-0) is conditional, so it does not count.
  const has = new Set(classes.map((c) => c.replace(/^!|!$/g, "")).filter((c) => !c.includes(":")));
  if (!(has.has("fixed") || has.has("absolute"))) return null;
  // Docked: pinned to one edge and spanning the other axis. A span in both directions (inset-0, or inset-x-0 with right-0) is not one edge.
  // At most one of these can hold, because each one needs the other axis to span and the opposite edge to be unset.
  const spanH = has.has("inset-x-0") || (has.has("left-0") && has.has("right-0"));
  const spanV = has.has("inset-y-0") || (has.has("top-0") && has.has("bottom-0"));
  if (has.has("right-0") && !has.has("left-0") && !has.has("inset-x-0") && spanV) return "right";
  if (has.has("left-0") && !has.has("right-0") && !has.has("inset-x-0") && spanV) return "left";
  if (has.has("bottom-0") && !has.has("top-0") && !has.has("inset-y-0") && spanH) return "bottom";
  if (has.has("top-0") && !has.has("bottom-0") && !has.has("inset-y-0") && spanH) return "top";
  return null;
}

/**
 * DS-ELEVATION-006: in one class string, a panel fixed to one edge uses the directional Large shadow for that edge.
 * Flagged: the token for another edge, and the all-sides Large or XLarge token. Not flagged: Base, Small and Medium (a fixed app bar
 * or toolbar is static, and DS-ELEVATION-009 keeps Large off it), and a shadow class behind a variant (hover:, dark:, md:).
 */
export function dockedShadow({ content, lines, filePath }) {
  const text = uncomment(content, filePath);
  const findings = [];
  const str = new RegExp(STRING.source, "g");
  let m;
  while ((m = str.exec(text)) !== null) {
    if (!m[2].includes("--shadow-")) continue;
    const classes = m[2].split(/\s+/).filter(Boolean);
    const dock = dockOf(classes);
    if (!dock) continue;
    for (const cls of classes) {
      if (cls.replace(/^!|!$/g, "").includes(":")) continue; // a conditional class is not the resting shadow
      const refs = new RegExp(SHADOW_REF.source, "g");
      let r;
      while ((r = refs.exec(cls)) !== null) {
        const [, tier, side] = r;
        if (side === dock) continue;
        if (!side && tier !== "large" && tier !== "xlarge") continue;
        const got = `--shadow-${tier}${side ? `-${side}` : ""}`;
        findings.push(finding(content, lines, m.index, side
          ? `A ${dock}-docked panel uses ${got}, the shadow for a panel docked ${side}. Use --shadow-large-${dock}.`
          : `A ${dock}-docked panel uses ${got}, which falls on every side. Use --shadow-large-${dock}.`));
      }
    }
  }
  return findings;
}
