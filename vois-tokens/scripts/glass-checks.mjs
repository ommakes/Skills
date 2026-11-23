// Regex-level checks for three frosted-glass rules (references/glass.md). No parser, no dependency, same as registry.mjs.
//   DS-GLASS-003  a backdrop-filter with no -webkit- twin in the same rule or style object, or a twin with another value
//   DS-GLASS-004  a literal blur radius in a backdrop filter, or a Tailwind backdrop-blur size, instead of a --glass-blur-* token
//   DS-GLASS-005  backdrop-filter in a transition, a @keyframes block or a motion prop (animate, initial, exit, while*)
//
// Each check reports one shape of the violation and stays quiet on anything it cannot read. A pass is
// not proof the rule is met. Known gaps are listed in references/hooks.md and pinned by tests in detect.test.mjs.

import { finding, isCssFile, uncomment } from "./check-utils.mjs";
import { STRING, stringsOfExpression } from "./elevation-checks.mjs";

/**
 * The blocks of `text`, read in one pass (braces are counted as they are written; strings are not read). `ownerOf(index)` is the
 * "{" that opens the innermost block around `index`, or -1 outside any block, and `ownText(index)` is that block's own text
 * without its nested blocks, kept in braces so the first key of an object still follows a "{". Outside any block it is the whole
 * text. Both are looked up, so many declarations in one block cost one pass in all, where scanning back from each one costs the
 * square of the block. A stray "}" closes nothing; a block that never closes runs to the end.
 */
function blockMap(text) {
  const n = text.length;
  const owner = new Int32Array(n + 1);
  const own = new Map(); // "{" index -> own text
  const stack = []; // open frames: { open, from, parts }
  let top = -1;
  for (let i = 0; i < n; i++) {
    owner[i] = top;
    const c = text[i];
    if (c === "{") {
      const parent = stack[stack.length - 1];
      if (parent) { parent.parts.push(text.slice(parent.from, i)); parent.from = n; } // it resumes after the child closes; a child that never closes takes the rest
      stack.push({ open: i, from: i + 1, parts: [] });
      top = i;
    } else if (c === "}" && stack.length > 0) {
      const frame = stack.pop();
      frame.parts.push(text.slice(frame.from, i));
      own.set(frame.open, `{${frame.parts.join("")}}`);
      const parent = stack[stack.length - 1];
      if (parent) parent.from = i + 1;
      top = parent ? parent.open : -1;
    }
  }
  owner[n] = top;
  for (const frame of stack) { frame.parts.push(text.slice(frame.from, n)); own.set(frame.open, `{${frame.parts.join("")}}`); }
  return {
    ownerOf: (index) => owner[Math.min(Math.max(index, 0), n)],
    ownText: (index) => { const open = owner[Math.min(Math.max(index, 0), n)]; return open === -1 ? text : own.get(open); },
  };
}

/** The index of the "}" that closes the block opened at `open`, or the end of the text. */
function blockEnd(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return i;
  }
  return text.length;
}

/** A CSS declaration's value: up to ";" or "}" (a value may wrap onto the next line), or a quote when it sits in a string. */
function cssValue(text, from) {
  const rest = text.slice(from, from + 400);
  const end = rest.search(/[;}"'`]/);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

const norm = (v) => v.replace(/\s+/g, " ").trim().toLowerCase();

// Declarations. A test inside parentheses, such as @supports ((backdrop-filter: blur(1px))), is a condition, not a declaration.
// Each pattern checks its own text with a lookahead BEFORE its variable-width lookbehind ((?<!\(\s*), (?<=[{,]\s*)). A lookbehind
// like that walks back over every space before the position, and it runs at every position, so on a long run of whitespace it
// costs time in proportion to the square of the run. With the lookahead first, only a position that holds the key pays for it.
const CSS_DECL = /(?<![\w-])(?=backdrop-filter\s*:)(?<!\(\s*)backdrop-filter\s*:/gi;
const CSS_TWIN = /(?<![\w-])(?=-webkit-backdrop-filter\s*:)(?<!\(\s*)-webkit-backdrop-filter\s*:/gi;
// A style object key ({ backdropFilter: ..., "backdrop-filter": ... }) or a DOM assignment (el.style.backdropFilter = ...).
// The key must open an object entry, so `cond ? backdropFilter : x` is not one.
const JS_KEY = /(?:(?=(?:["']?backdropFilter["']?|["']backdrop-filter["'])\s*:)(?<=[{,]\s*)(?:["']?backdropFilter["']?|["']backdrop-filter["'])\s*:|(?<=\.)backdropFilter\s*=(?![=>]))/g;
const JS_TWIN = /(?:(?=(?:["']?WebkitBackdropFilter["']?|["']-webkit-backdrop-filter["'])\s*:)(?<=[{,]\s*)(?:["']?WebkitBackdropFilter["']?|["']-webkit-backdrop-filter["'])\s*:|(?<=\.)[wW]ebkitBackdropFilter\s*=(?![=>]))/g;

/** The value after each match of `re` in `block`: a CSS value, or the first string of a JS expression (null if none). */
function valuesIn(block, re, js) {
  const out = [];
  const r = new RegExp(re.source, re.flags);
  let m;
  while ((m = r.exec(block)) !== null) {
    const from = m.index + m[0].length;
    out.push(js ? (stringsOfExpression(block, from)[0] ?? null) : cssValue(block, from));
  }
  return out;
}

/** DS-GLASS-003: a backdrop-filter with no -webkit- twin, or a twin with another value. */
export function missingWebkitTwin({ content, lines, filePath }) {
  const text = uncomment(content, filePath);
  const findings = [];
  const check = (index, twins, value, css) => {
    if (twins.length === 0) {
      findings.push(finding(content, lines, index, css
        ? "backdrop-filter with no -webkit-backdrop-filter in the same rule. Safari before 18 reads only the prefixed one."
        : "backdropFilter with no WebkitBackdropFilter in the same style object. Safari before 18 reads only the prefixed one."));
    } else if (value !== null && twins.every((t) => t !== null && norm(t) !== norm(value))) {
      findings.push(finding(content, lines, index, "backdrop-filter and its -webkit- twin have different values. Safari before 18 shows the twin's."));
    }
  };
  // The twins of a block are read once, however many declarations sit in it.
  let blocks = null;
  const twinCache = new Map();
  const twinsAt = (index, re, js) => {
    blocks ??= blockMap(text);
    const k = `${blocks.ownerOf(index)}${js ? "js" : "css"}`;
    if (!twinCache.has(k)) twinCache.set(k, valuesIn(blocks.ownText(index), re, js));
    return twinCache.get(k);
  };
  let m;
  const decl = new RegExp(CSS_DECL.source, "gi");
  while ((m = decl.exec(text)) !== null) {
    check(m.index, twinsAt(m.index, CSS_TWIN, false), cssValue(text, m.index + m[0].length), true);
  }
  if (!isCssFile(filePath)) {
    const key = new RegExp(JS_KEY.source, "g");
    while ((m = key.exec(text)) !== null) {
      const value = stringsOfExpression(text, m.index + m[0].length)[0] ?? null;
      check(m.index, twinsAt(m.index, JS_TWIN, true), value, false);
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}

// A Tailwind backdrop-blur class: bare (8px), a named size, or an arbitrary length. A var(...) or (--token) value
// and backdrop-blur-none pass. Variants (supports-[...]:, md:) are read like the plain class.
// No variant chain in front: `(?:[\w-]+:)*` before the class is quadratic on "a:a:a:...", and the class matches the same
// text without it (the ":" before it already passes the lookbehind).
const TW_BLUR = /(?<![\w-])backdrop-blur(?:-(xs|sm|md|lg|xl|2xl|3xl|none)|-\[([^\]\s]+)\]|-\(([^)\s]+)\))?(?![\w\[(-])/g;

/** DS-GLASS-004: a literal blur radius instead of a --glass-blur-* token. */
export function literalGlassBlur({ content, lines, filePath }) {
  const text = uncomment(content, filePath);
  const findings = [];
  const hint = "Use var(--glass-blur-subtle), -standard or -strong.";
  const blurs = (value, index) => {
    if (value === null || value.includes("${")) return; // an interpolation is not read
    const re = /blur\(\s*([^)]*)\)/g;
    let b;
    while ((b = re.exec(value)) !== null) {
      const arg = b[1].trim();
      if (/^var\(/.test(arg) || /^0(?:px)?$/.test(arg)) continue;
      findings.push(finding(content, lines, index, `backdrop blur(${arg}) is a literal. ${hint}`));
    }
  };
  let m;
  const decl = /(?<![\w-])(?=(?:-webkit-)?backdrop-filter\s*:)(?<!\(\s*)(?:-webkit-)?backdrop-filter\s*:/gi;
  while ((m = decl.exec(text)) !== null) blurs(cssValue(text, m.index + m[0].length), m.index);
  if (!isCssFile(filePath)) {
    for (const re of [JS_KEY, JS_TWIN]) {
      const key = new RegExp(re.source, "g");
      while ((m = key.exec(text)) !== null) for (const v of stringsOfExpression(text, m.index + m[0].length)) blurs(v, m.index);
    }
  }
  // Tailwind: in CSS only inside @apply; in code only inside strings.
  const scan = (body, base) => {
    const re = new RegExp(TW_BLUR.source, "g");
    let t;
    while ((t = re.exec(body)) !== null) {
      if (t[1] === "none" || t[3] !== undefined) continue;
      if (t[2] !== undefined && /^var\(/.test(t[2])) continue;
      const what = t[2] !== undefined ? `backdrop-blur-[${t[2]}]` : t[1] ? `backdrop-blur-${t[1]}` : "backdrop-blur";
      findings.push(finding(content, lines, base + t.index, `${what} is a literal blur. ${hint}`));
    }
  };
  if (isCssFile(filePath)) {
    const apply = /@apply\s+([^;}]*)/g;
    while ((m = apply.exec(text)) !== null) scan(m[1], m.index + m[0].length - m[1].length);
  } else {
    const str = new RegExp(STRING.source, "g");
    while ((m = str.exec(text)) !== null) scan(m[2], m.index + 1);
  }
  return findings.sort((a, b) => a.line - b.line);
}

const ANIMATED = /(?<![\w-])(?:-webkit-)?backdrop-filter\b/i;

/** DS-GLASS-005: backdrop-filter animated. */
export function animatedGlassBlur({ content, lines, filePath }) {
  const text = uncomment(content, filePath);
  const findings = [];
  const msg = "backdrop-filter is animated. The browser re-blurs every frame; fade opacity instead.";
  let m;
  // transition / transition-property, with or without -webkit- (CSS, or CSS in a string)
  const tr = /(?<![\w-])(?:-webkit-)?transition(?:-property)?\s*:\s*([^;{}"'`]*)/gi;
  while ((m = tr.exec(text)) !== null) if (ANIMATED.test(m[1])) findings.push(finding(content, lines, m.index, msg));
  if (!isCssFile(filePath)) {
    // transition: "backdrop-filter 200ms" or transitionProperty: "backdrop-filter" in a style object
    const key = /(?=["']?(?:transition|transitionProperty|WebkitTransition)["']?\s*:)(?<=[{,]\s*)["']?(?:transition|transitionProperty|WebkitTransition)["']?\s*:/g;
    while ((m = key.exec(text)) !== null) if (stringsOfExpression(text, m.index + m[0].length).some((v) => ANIMATED.test(v))) findings.push(finding(content, lines, m.index, msg));
    // Tailwind transition-[backdrop-filter] or a list that holds it
    const tw = /(?<![\w-])transition-\[([^\]\s]*)\]/g;
    while ((m = tw.exec(text)) !== null) if (/(?:^|,)(?:-webkit-)?backdrop-filter(?:,|$)/.test(m[1])) findings.push(finding(content, lines, m.index, msg));
    // A motion prop whose object sets the filter: animate={{ backdropFilter: ... }}
    const seen = new Set(); // one finding per object, even when it sets both keys
    let blocks = null;
    for (const re of [JS_KEY, JS_TWIN]) {
      const k = new RegExp(re.source, "g");
      while ((m = k.exec(text)) !== null) {
        blocks ??= blockMap(text);
        const open = blocks.ownerOf(m.index);
        if (open === -1 || seen.has(open)) continue;
        const before = text.slice(Math.max(0, open - 60), open);
        if (/(?<![\w$])(?:animate|initial|exit|while[A-Z]\w*)\s*(?:=\s*\{|:)\s*$/.test(before)) {
          seen.add(open);
          findings.push(finding(content, lines, m.index, msg));
        }
      }
    }
  }
  // @keyframes with backdrop-filter inside (CSS, or CSS in a string)
  const kf = /@(?:-webkit-)?keyframes\s+[\w-]+\s*\{/g;
  while ((m = kf.exec(text)) !== null) {
    const open = m.index + m[0].length - 1;
    const body = text.slice(open, blockEnd(text, open));
    if (/(?<![\w-])(?:-webkit-)?backdrop-filter\s*:/i.test(body)) findings.push(finding(content, lines, m.index, msg));
  }
  return findings.sort((a, b) => a.line - b.line);
}
