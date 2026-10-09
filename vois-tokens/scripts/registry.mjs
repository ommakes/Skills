// Deterministic, regex/string-level checks for the mechanically-verifiable
// subset of vois-tokens' [DS-*] rules. No parser dependency by design — see
// vois-tokens/references/hooks.md for which rules are intentionally NOT here
// (they require AST/layout/contrast computation and stay LLM-judgment-only).
//
// Note on `severity` below: this is a narrower, detector-specific vocabulary
// ("quality" | "slop") that only exists to decide hook-blocking behavior for
// the DS-* rules covered here. It's a different axis from the `severity`
// ("required"/"recommended"/"preferred") and `enforcement`
// ("blocking"/"advisory") fields on every rule in ../data/vois-rules.json —
// that pair is the corpus-wide, normative-weight signal; this one is
// "how confident is a regex check, and should Cursor deny the edit."
// `enforcement: "blocking"` in vois-rules.json is set on exactly the two
// rules marked "blockable" here (DS-TAILWIND-004, DS-ANIMATION-005) — the
// two vocabularies agree on those, they just answer different questions.

import { BASE_PARAMS, limitNote } from "./team-overrides.mjs";
import { openingTags } from "./jsx-tags.mjs";

const CSS_EXT = [".css", ".scss"];
const CODE_EXT = [".tsx", ".jsx", ".ts", ".js"];
const ALL_EXT = [...CSS_EXT, ...CODE_EXT];

// Basename of the one file allowed to DEFINE literal motion values (see DS-MOTION-001). Only scanned extensions appear here.
const MOTION_TOKEN_FILE = /^_?motion-tokens\.(css|scss|ts|js)$/i;

const TAILWIND_COLORS = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber",
  "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
];
const TAILWIND_COLOR_PREFIXES = [
  "bg", "text", "border", "ring", "fill", "stroke", "from", "via", "to",
  "outline", "divide", "accent", "caret", "decoration", "shadow",
];

function lineAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function snippetAt(lines, lineNo) {
  return (lines[lineNo - 1] || "").trim().slice(0, 160);
}

/** Run `pattern` (must be a `g` regex) over content, yielding one finding per match. */
function scanRegex(content, lines, pattern, message) {
  const findings = [];
  let match;
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  while ((match = re.exec(content)) !== null) {
    const line = lineAt(content, match.index);
    findings.push({
      line,
      snippet: snippetAt(lines, line),
      message: typeof message === "function" ? message(match) : message,
    });
    if (match[0] === "") re.lastIndex++; // avoid infinite loop on zero-width matches
  }
  return findings;
}

export const RULES = [
  {
    id: "DS-COLOR-001",
    title: "Hardcoded hex color",
    severity: "quality", // advisory-only — overlaps with the token-drift MCP's job, see hooks.md
    extensions: ALL_EXT,
    fixHint: "Use a color token (e.g. var(--color-*) or the Tailwind token class) instead of a literal hex value.",
    check({ content, lines }) {
      const findings = [];
      for (const raw of scanRegex(content, lines, /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/, "Hardcoded hex color — use a color token.")) {
        // Skip token *definitions* themselves (custom property declarations: --color-x: #fff;)
        if (/^\s*--[\w-]+\s*:/.test(lines[raw.line - 1] || "")) continue;
        findings.push(raw);
      }
      return findings;
    },
  },
  {
    id: "DS-COLOR-002",
    title: "Raw Tailwind palette utility",
    severity: "quality", // advisory-only — overlaps with the token-drift MCP's job, see hooks.md
    extensions: CODE_EXT,
    fixHint: "Use the workspace's semantic token class instead of a raw Tailwind palette color.",
    check({ content, lines }) {
      const pattern = new RegExp(
        `\\b(?:${TAILWIND_COLOR_PREFIXES.join("|")})-(?:${TAILWIND_COLORS.join("|")})-(?:50|100|150|200|250|300|350|400|450|500|550|600|650|700|750|800|850|900|950)\\b`,
        "g"
      );
      return scanRegex(content, lines, pattern, (m) => `Raw Tailwind palette class "${m[0]}" — use a semantic token class.`);
    },
  },
  {
    id: "DS-A11Y-003",
    title: "outline removed without focus-visible replacement",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Pair outline:none / outline-none with a :focus-visible style, or don't remove the outline.",
    check({ content, lines }) {
      const findings = [];
      for (const raw of scanRegex(content, lines, /outline:\s*none\b|\boutline-none\b/, "outline removed — no nearby focus-visible replacement found.")) {
        const windowStart = Math.max(0, raw.line - 4);
        const windowEnd = Math.min(lines.length, raw.line + 3);
        const nearby = lines.slice(windowStart, windowEnd).join("\n");
        if (!/focus-visible/.test(nearby)) findings.push(raw);
      }
      return findings;
    },
  },
  {
    id: "DS-A11Y-010",
    title: "<img> missing alt",
    severity: "quality",
    extensions: CODE_EXT,
    fixHint: "Add an alt attribute (alt=\"\" is valid for purely decorative images).",
    check({ content, lines }) {
      const findings = [];
      for (const raw of scanRegex(content, lines, /<img\b[^>]*>/, "img tag missing alt attribute.")) {
        const lineText = lines[raw.line - 1] || "";
        if (!/\balt\s*=/.test(lineText)) findings.push(raw);
      }
      return findings;
    },
  },
  {
    id: "DS-A11Y-012",
    title: "Consecutive <br> used for spacing",
    severity: "quality",
    extensions: CODE_EXT,
    fixHint: "Use gap/margin tokens instead of stacked <br> tags.",
    check({ content, lines }) {
      return scanRegex(content, lines, /(?:<br\s*\/?>\s*){2,}/, "Consecutive <br> tags — use spacing tokens instead.");
    },
  },
  {
    id: "DS-SPACING-001",
    title: "Arbitrary spacing value off the 4/8 scale",
    severity: "quality",
    extensions: CODE_EXT,
    fixHint: "Round to the nearest value on the 4/8 spacing scale, or flag as a missing token.",
    check({ content, lines, params = BASE_PARAMS }) {
      // A team may require 8 only. The base accepts anything divisible by 4 (which includes every multiple of 8).
      const divisor = Math.min(...params.get("DS-SPACING-001", "spacing_divisors"));
      const note = limitNote(params, "DS-SPACING-001", "spacing_divisors");
      const pattern = /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[(\d+(?:\.\d+)?)px\]/g;
      const findings = [];
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const px = parseFloat(match[1]);
        if (px % divisor !== 0) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `Arbitrary value "${match[0]}" is not divisible by ${divisor}.${note}` });
        }
      }
      // StyleX: bare numeric (or quoted "Npx") spacing property values in a stylex.create() object.
      const stylexPattern = /\b(padding|margin|gap|rowGap|columnGap|paddingTop|paddingRight|paddingBottom|paddingLeft|paddingInline|paddingBlock|paddingInlineStart|paddingInlineEnd|marginTop|marginRight|marginBottom|marginLeft|marginInline|marginBlock|marginInlineStart|marginInlineEnd)\s*:\s*["']?(\d+(?:\.\d+)?)(?:px)?["']?\s*[,}]/g;
      while ((match = stylexPattern.exec(content)) !== null) {
        const val = parseFloat(match[2]);
        if (val % divisor !== 0) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `Arbitrary value "${match[1]}: ${match[2]}" is not divisible by ${divisor}.${note}` });
        }
      }
      return findings;
    },
  },
  {
    id: "DS-TAILWIND-004",
    title: "!important usage",
    severity: "slop", // unambiguous — safe to block in Cursor
    extensions: ALL_EXT,
    fixHint: "Remove !important. If you must override, document why and scope it explicitly.",
    check({ content, lines }) {
      return scanRegex(content, lines, /!important\b/, "!important usage — should be rare and explicitly justified.");
    },
  },
  {
    id: "DS-TAILWIND-005",
    title: "transition: all / transition-all",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "List transitioned properties explicitly instead of transitioning all of them.",
    check({ content, lines }) {
      // Tailwind's transition-all / hand-authored CSS transition(-property): all, and StyleX's
      // camelCase transitionProperty: "all" — one rule, checked across both engines' syntax.
      return scanRegex(content, lines, /\btransition-all\b|transition(?:-property)?:\s*all\b|transitionProperty:\s*["']all["']/, "Transitioning \"all\" — list properties explicitly.");
    },
  },
  {
    id: "DS-ANIMATION-001",
    title: "Animation duration over 300ms",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Keep UI animations under 300ms (large elements up to 500ms).",
    check({ content, lines, params = BASE_PARAMS }) {
      const findings = [];
      const standard = params.get("DS-ANIMATION-001", "max_duration_ms");
      // The large-element ceiling can never sit below the standard one.
      const ceiling = Math.max(params.get("DS-ANIMATION-002", "max_duration_ms"), standard);
      const standardNote = limitNote(params, "DS-ANIMATION-001", "max_duration_ms");
      const ceilingNote = limitNote(params, "DS-ANIMATION-002", "max_duration_ms");
      // The ceiling note names a team only when a team set the ceiling in force.
      const ceilingCredit = ceilingNote || (ceiling === standard ? standardNote : "");
      // Tailwind, CSS and StyleX spellings, in ms or s: duration-300, duration-[0.6s], transition-duration: 300ms, transitionDuration: "0.3s".
      const durationPattern = /\bduration-\[(\d*\.?\d+)(ms|s)\]|\bduration-(\d{3,4})\b|transition-duration:\s*(\d*\.?\d+)(ms|s)\b|transitionDuration:\s*["'](\d*\.?\d+)(ms|s)["']/g;
      let match;
      while ((match = durationPattern.exec(content)) !== null) {
        const [num, unit] = match[3] !== undefined ? [match[3], "ms"] : match[1] !== undefined ? [match[1], match[2]] : match[4] !== undefined ? [match[4], match[5]] : [match[6], match[7]];
        const ms = Math.round(Number(num) * (unit === "s" ? 1000 : 1));
        const line = lineAt(content, match.index);
        if (ms > ceiling) {
          findings.push({ line, snippet: snippetAt(lines, line), message: `Duration ${ms}ms exceeds the ${ceiling}ms ceiling (${standard}ms for most UI).${ceilingCredit}` });
        } else if (ms > standard) {
          findings.push({ line, snippet: snippetAt(lines, line), message: `Duration ${ms}ms exceeds ${standard}ms — only acceptable for large elements.${standardNote}` });
        }
      }
      return findings;
    },
  },
  {
    id: "DS-ANIMATION-004",
    title: "Animation present without prefers-reduced-motion handling",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Add a prefers-reduced-motion fallback anywhere animation/transition is used.",
    check({ content }) {
      const hasAnimation = /@keyframes|\banimate-[\w-]+|\bmotion\.[A-Za-z]+|from\s+["']motion\/react["']|from\s+["']framer-motion["']|transition(?:-[\w]+)?:/.test(content);
      const hasReducedMotion = /prefers-reduced-motion/.test(content);
      if (hasAnimation && !hasReducedMotion) {
        return [{ line: 1, snippet: "(file-level)", message: "File uses animation/transitions but has no prefers-reduced-motion handling anywhere in it." }];
      }
      return [];
    },
  },
  {
    id: "DS-ANIMATION-005",
    title: "Animating from scale(0)",
    severity: "slop", // unambiguous — safe to block in Cursor
    extensions: ALL_EXT,
    fixHint: "Animate from scale(0.25) or similar, never from 0.",
    check({ content, lines }) {
      return scanRegex(content, lines, /scale\(\s*0\s*\)|scale:\s*0\b(?!\.\d)/, "Animating from scale(0) — start from a small non-zero scale instead.");
    },
  },
  {
    id: "DS-ANIMATION-008",
    title: "Press/active scale below 0.95",
    severity: "quality",
    extensions: CODE_EXT,
    fixHint: "Keep press/active scale at 0.96 or above; never below 0.95.",
    check({ content, lines, params = BASE_PARAMS }) {
      const findings = [];
      const floor = params.get("DS-ANIMATION-008", "min_press_scale");
      const note = limitNote(params, "DS-ANIMATION-008", "min_press_scale");
      let match;
      const twPattern = /active:scale-(\d{1,3})\b/g;
      while ((match = twPattern.exec(content)) !== null) {
        const scale = Number(match[1]) / 100;
        if (scale < floor) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `active:scale-${match[1]} (${scale}) is below the ${floor} floor.${note}` });
        }
      }
      const twArbitrary = /active:scale-\[(\d*\.?\d+)\]/g;
      while ((match = twArbitrary.exec(content)) !== null) {
        const scale = Number(match[1]);
        if (scale < floor) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `active:scale-[${match[1]}] is below the ${floor} floor.${note}` });
        }
      }
      const motionPattern = /whileTap\s*=\s*\{\{[^}]*scale:\s*([\d.]+)/g;
      while ((match = motionPattern.exec(content)) !== null) {
        const scale = Number(match[1]);
        if (scale < floor) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `whileTap scale ${scale} is below the ${floor} floor.${note}` });
        }
      }
      // StyleX: a ":active" pseudo-key with a scale value in the same stylex.create() object.
      const stylexPattern = /["']:active["']\s*:\s*\{[^}]*?\bscale:\s*([\d.]+)/g;
      while ((match = stylexPattern.exec(content)) !== null) {
        const scale = Number(match[1]);
        if (scale < floor) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `:active scale ${scale} is below the ${floor} floor.${note}` });
        }
      }
      return findings;
    },
  },
  {
    id: "DS-ANIMATION-009",
    title: "will-change on a disallowed property",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Only set will-change on transform, opacity, or filter.",
    check({ content, lines }) {
      const findings = [];
      let match;
      const cssPattern = /will-change:\s*([^;]+);/g;
      while ((match = cssPattern.exec(content)) !== null) {
        const values = match[1].split(",").map((v) => v.trim());
        const bad = values.filter((v) => !["transform", "opacity", "filter", "auto"].includes(v));
        if (bad.length) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `will-change: ${match[1].trim()} — only transform/opacity/filter are allowed.` });
        }
      }
      const twPattern = /\bwill-change-(\w+)\b/g;
      while ((match = twPattern.exec(content)) !== null) {
        if (!["transform", "auto"].includes(match[1])) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `will-change-${match[1]} — only transform/opacity/filter are allowed.` });
        }
      }
      // StyleX: camelCase willChange as a quoted, comma-separated string.
      const stylexPattern = /willChange:\s*["']([^"']+)["']/g;
      while ((match = stylexPattern.exec(content)) !== null) {
        const values = match[1].split(",").map((v) => v.trim());
        const bad = values.filter((v) => !["transform", "opacity", "filter", "auto"].includes(v));
        if (bad.length) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `willChange: "${match[1].trim()}" — only transform/opacity/filter are allowed.` });
        }
      }
      return findings;
    },
  },
  {
    id: "DS-LAYOUT-001",
    title: "vh used instead of svh/dvh/lvh",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Use svh/dvh/lvh depending on context instead of plain vh.",
    check({ content, lines }) {
      const findings = [];
      findings.push(...scanRegex(content, lines, /(?<![sdl])\b100vh\b/, "Plain 100vh — use svh/dvh/lvh for the right viewport behavior."));
      findings.push(...scanRegex(content, lines, /\b(?:h|min-h|max-h)-screen\b/, "Tailwind *-screen utility resolves to 100vh — prefer the svh/dvh/lvh equivalents."));
      return findings;
    },
  },
  {
    id: "DS-TYPOGRAPHY-009",
    title: "Three-period ellipsis instead of the … character",
    severity: "quality",
    extensions: CODE_EXT,
    fixHint: "Use the … character, not three periods.",
    check({ content, lines }) {
      return scanRegex(content, lines, /[a-zA-Z]\.\.\.(?!\w)/, "Three-period ellipsis — use the … character.");
    },
  },
  {
    id: "DS-CSS-002",
    title: "#id selector used for styling",
    severity: "quality",
    extensions: CSS_EXT,
    fixHint: "Use a class selector instead of an #id selector.",
    check({ content, lines }) {
      return scanRegex(content, lines, /#[a-zA-Z][\w-]*\s*\{/, "#id selector — use a class instead.");
    },
  },
  {
    id: "DS-CSS-007",
    title: "Hand-authored @media query in px",
    severity: "quality",
    extensions: CSS_EXT,
    fixHint: "Use em for hand-authored breakpoints, not px.",
    check({ content, lines }) {
      return scanRegex(content, lines, /@media[^{]*\d+px[^{]*\{/, "Hand-authored @media query uses px — use em.");
    },
  },
  {
    id: "DS-MODAL",
    title: "Dialog/Modal missing inert / overscroll-behavior safeguards",
    severity: "quality",
    extensions: CODE_EXT,
    fixHint: "Add inert on background content and overscroll-behavior: contain on the scroll container.",
    check({ content, lines }) {
      const modalMatch = /<Dialog\b|<Modal\b|\bfunction\s+\w*(?:Dialog|Modal)\w*/.exec(content);
      if (!modalMatch) return [];
      const usesRadix = /from\s+["']@radix-ui\/react-dialog["']|from\s+["']radix-ui["']/.test(content);
      if (usesRadix) return []; // Radix handles inert/focus-trap automatically
      const missing = [];
      if (!/\binert\b/.test(content)) missing.push("inert");
      if (!/overscroll-behavior:\s*contain/.test(content)) missing.push("overscroll-behavior: contain");
      if (!missing.length) return [];
      const line = lineAt(content, modalMatch.index);
      return [{ line, snippet: snippetAt(lines, line), message: `Custom Dialog/Modal missing: ${missing.join(", ")}.` }];
    },
  },
  {
    id: "DS-SLOP-002",
    title: "AI gradient (purple/indigo → blue/cyan)",
    severity: "quality", // advisory heuristic — a real brand can own this gradient; see references/anti-slop.md
    extensions: ALL_EXT,
    fixHint: "The purple/indigo→blue gradient is the template-output signature. Use the workspace's own accent tokens, or waive with ignore-rule DS-SLOP-002 if it's a genuine brand asset.",
    check({ content, lines }) {
      const AI_HUES = "violet|purple|indigo|fuchsia|blue|sky|cyan";
      const findings = [];
      // Tailwind gradient: bg-gradient-to-* with from-<hue> and to-<hue> both in the AI family.
      const twPattern = new RegExp(
        `\\bfrom-(?:${AI_HUES})-\\d{2,3}\\b[^"'\\n]*?\\bto-(?:${AI_HUES})-\\d{2,3}\\b`,
        "g"
      );
      for (const raw of scanRegex(content, lines, twPattern, "Purple/indigo→blue gradient — the AI-slop gradient signature.")) {
        // Only flag when the two stops are actually different hues (from-blue-500 to-blue-700 is a fine monochrome ramp).
        const hues = raw.snippet.match(new RegExp(`(?:from|to)-(${AI_HUES})-`, "g")) || [];
        const distinct = new Set(hues.map((h) => h.replace(/(?:from|to)-|-$/g, "")));
        if (distinct.size >= 2) findings.push(raw);
      }
      // CSS linear-gradient() between two distinct AI-family hue keywords.
      const cssPattern = /linear-gradient\([^)]*\)/g;
      let m;
      while ((m = cssPattern.exec(content)) !== null) {
        const named = m[0].match(new RegExp(`\\b(${AI_HUES})\\b`, "g")) || [];
        if (new Set(named).size >= 2) {
          const line = lineAt(content, m.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: "linear-gradient between purple/indigo and blue — the AI-slop gradient signature." });
        }
      }
      return findings;
    },
  },
  {
    id: "DS-TABLE-001",
    title: "Scroll wrapper that cannot hold a sticky table header",
    severity: "quality", // advisory-only: one file at a time, so it cannot see a wrapper and header split across files
    extensions: ALL_EXT,
    fixHint: "Pick one scroll owner. Complex table: wrapper with overflow: auto and a bounded block size, header sticky inside it. Simple table: no overflow on the wrapper, header sticky to the page. overflow: auto clip does not help, because clip computes to hidden. See references/data-tables.md.",
    check({ content, lines }) {
      const findings = [];
      const seen = new Set();
      const push = (line, message) => {
        if (seen.has(line)) return;
        seen.add(line);
        findings.push({ line, snippet: snippetAt(lines, line), message });
      };
      const clipMessage = "clip next to auto computes to hidden, so the wrapper is still a scroll container and a sticky header does not stick to the page.";

      // Shape 1: clip used as a workaround next to a scrolling axis.
      for (const raw of scanRegex(content, lines, /overflow\s*:\s*(?:auto|scroll)\s+clip\b/, clipMessage)) push(raw.line, raw.message);
      const blocks = cssBlocks(content);
      for (const b of blocks) {
        if (/overflow-x\s*:\s*(?:auto|scroll)\b/.test(b.body) && /overflow-y\s*:\s*clip\b/.test(b.body)) {
          push(lineAt(content, b.index), clipMessage);
        }
      }
      lines.forEach((l, i) => {
        if (/\boverflow-x-(?:auto|scroll)\b/.test(l) && /\boverflow-y-clip\b/.test(l)) push(i + 1, clipMessage);
      });

      // Shape 2: a scroll wrapper with no bounded block size, plus a sticky header, in the same file.
      const stickyCss = blocks.some((b) => /\b(?:thead|th)\b/.test(b.selector) && /position\s*:\s*sticky/.test(b.body));
      const stickyJsx = lines.some((l) => /<(?:thead|th|TableHeader|TableHead)\b[^>]*\bsticky\b/.test(l));
      if (stickyCss || stickyJsx) {
        const wrapMessage = "This scroll wrapper has no bounded block size, so it never scrolls vertically and the sticky table header sticks to nothing. Bound the height, or remove the overflow.";
        for (const b of blocks) {
          if (/overflow(?:-x|-y)?\s*:\s*(?:auto|scroll)\b/.test(b.body) && !/(?:max-)?(?:height|block-size)\s*:/.test(b.body)) {
            push(lineAt(content, b.index), wrapMessage);
          }
        }
        lines.forEach((l, i) => {
          if (/\boverflow(?:-x|-y)?-(?:auto|scroll)\b/.test(l) && !/(?:^|[\s"'`:])(?:max-)?(?:h|block)-[^\s"'`]+/.test(l)) push(i + 1, wrapMessage);
        });
      }
      return findings;
    },
  },

  {
    id: "DS-MOTION-001",
    title: "Literal duration, easing, or curve instead of a motion token",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Use a motion token: var(--motion-duration-*) or var(--motion-ease-*). Motion (JS) reads its numbers from motion-tokens.ts.",
    check({ content, lines, filePath = "" }) {
      const findings = [];
      // Line starts are computed once, so each finding is a binary search rather than a re-split of the file.
      const starts = [0];
      for (let i = 0; i < content.length; i++) if (content.charCodeAt(i) === 10) starts.push(i + 1);
      const lineOf = (index) => {
        let lo = 0;
        let hi = starts.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (starts[mid] <= index) lo = mid;
          else hi = mid - 1;
        }
        return lo + 1;
      };
      // One finding per position. Two scans can reach the same spot, and this keeps it to one report.
      const seen = new Set();
      const report = (index, message) => {
        if (seen.has(index)) return;
        seen.add(index);
        const line = lineOf(index);
        findings.push({ line, snippet: snippetAt(lines, line), message });
      };
      const each = (pattern, fn) => {
        const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
        let match;
        while ((match = re.exec(content)) !== null) {
          fn(match);
          if (match[0] === "") re.lastIndex++;
        }
      };
      // Zero is "no motion". 0.01ms is the reduced-motion value in references/animation.md. Neither is a literal.
      const isLiteral = (value, unit = "ms") => Math.abs(Number(value)) * (unit.toLowerCase() === "s" ? 1000 : 1) > 0.01;
      // A time: optional minus, a number (exponent allowed), then ms or s. The lookbehind keeps names like fade-150ms from matching.
      const TIME = /(?<![\w.-])(-?(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\d+))(ms|s)\b/gi;
      // Time values inside `text`, which starts at `base` in content. Underscores stand in for spaces in Tailwind arbitrary values.
      const reportTimes = (text, base, label) => {
        const re = new RegExp(TIME.source, "gi");
        const spaced = text.replace(/_/g, " ");
        let t;
        while ((t = re.exec(spaced)) !== null) {
          if (isLiteral(t[1], t[2])) report(base + t.index, `${label} ${t[1]}${t[2]}: use a motion token.`);
        }
      };
      const hasLiteralTime = (text) => {
        const re = new RegExp(TIME.source, "gi");
        let t;
        while ((t = re.exec(text.replace(/_/g, " "))) !== null) {
          if (isLiteral(t[1], t[2])) return true;
        }
        return false;
      };
      // Curves inside `text`, one report per curve.
      const reportCurves = (text, base, label) => {
        const re = /cubic-bezier\(\s*-?[\d.]/g;
        let c;
        while ((c = re.exec(text)) !== null) report(base + c.index, `${label}: use a motion easing token.`);
      };
      // The token file may DEFINE literal values. Usage is checked in every file. A file with a transition={{...}} JSX prop is a component, so it gets no exemption.
      const isTokenFile = MOTION_TOKEN_FILE.test(String(filePath).split(/[\\/]/).pop()) && !/\btransition=\{/.test(content);
      const isStylesheet = /\.(css|scss)$/i.test(String(filePath));

      // Usage (every file).
      // Tailwind arbitrary values: duration-[150ms], delay-[-200ms], animate-[spin_1s_..], ease-[cubic-bezier(..)].
      each(/\b(duration|delay|animate|ease)-\[([^\]\n]*)\]/, (m) => {
        const base = m.index + m[0].indexOf(m[2]);
        if (m[1] === "ease") reportCurves(m[2], base, "Literal cubic-bezier curve in a Tailwind class");
        else reportTimes(m[2], base, `Literal ${m[1]} in a Tailwind class`);
      });
      // Tailwind numeric classes: duration-200 (ms). Zero passes.
      each(/(?<![\w-])(duration|delay)-(\d+)(?![\w.-])/, (m) => {
        if (isLiteral(m[2])) report(m.index, `Literal class ${m[0]}: use duration-[var(--motion-duration-fast)] or a motion token.`);
      });
      // CSS transition and animation declarations. Every time and curve in the value is checked.
      // Stylesheets end a value at ; or a brace. Code files also end it at a comma, unless the next segment is a CSS "prop 150ms",
      // so animation: "fade", description: "Saved 2s ago" does not read the copy as a time.
      const declaration = isStylesheet
        ? /(?<![\w-])(?:transition|animation)(?:-duration|-delay)?\s*:([^;{}]*)/g
        : /(?<![\w-])(?:transition|animation)(?:-duration|-delay)?\s*:((?:[^;{},]|,(?=\s*[a-zA-Z-]+\s+-?[\d.]))*)/g;
      each(declaration, (m) => {
        const base = m.index + m[0].length - m[1].length;
        reportTimes(m[1], base, "Literal time in a transition or animation");
        reportCurves(m[1], base, "Literal cubic-bezier curve in a transition or animation");
      });
      // StyleX and string forms: transitionDuration: "150ms", animationDelay: "200ms".
      each(/\b(?:transition|animation)(?:Duration|Delay)\s*:\s*["']([^"'\n]{0,80})["']/, (m) => {
        reportTimes(m[1], m.index + m[0].indexOf(m[1]), "Literal time in a StyleX or string transition");
      });

      // Definitions. Allowed only in the token file. Time definitions are flagged here; curve definitions are flagged by the curve scan below.
      if (!isTokenFile) {
        each(/cubic-bezier\(\s*-?[\d.]/, (m) => report(m.index, "Literal cubic-bezier curve: use a motion easing token."));
        each(/(?<![\w$])ease:\s*\[\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*,/, (m) => report(m.index, "Literal easing array: use a motion easing token."));
        // Motion seconds inside a transition: transition={{ duration: 0.2 }}, transition: { duration: 0.2 }, const transition = { duration: 0.2 }, or nested per-key durations.
        // Only that context is checked, so toast({ duration: 3000 }) passes. transition-colors is a class name, not a context.
        each(/(?<![\w$])(duration|delay):\s*((?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)(?![\w.])/, (m) => {
          const before = content.slice(Math.max(0, m.index - 200), m.index);
          if (!/\btransition\b(?!-)/.test(before)) return;
          if (isLiteral(m[2], "s")) report(m.index, `Literal ${m[1]} ${m[2]} in a Motion transition: import it from motion-tokens.ts.`);
        });
        // Custom properties and SCSS variables whose value holds a literal time, under any name. Shorthands like "transform 200ms ease" count.
        const definedOutside = "Time defined outside motion-tokens.*: move the definition to the token file.";
        each(/(?<![\w-])--[\w-]+\s*:\s*([^;{}\n]{0,120})/, (m) => {
          if (hasLiteralTime(m[1])) report(m.index, definedOutside);
        });
        each(/\$[\w-]+\s*:\s*([^;\n]{0,120})/, (m) => {
          if (hasLiteralTime(m[1])) report(m.index, definedOutside);
        });
        // Inline style and runtime definitions: "--motion-duration-fast": "150ms", setProperty("--x", "150ms").
        each(/["']--[\w-]+["']\s*[:,]\s*["']([^"'\n]{0,120})["']/, (m) => {
          if (hasLiteralTime(m[1])) report(m.index, definedOutside);
        });
      }
      return findings;
    },
  },
];

// ---------------------------------------------------------------------------
// Lookalikes: markup that does a component's job without the component.
// Ids match the rows in vois-components/data/components-rules.json under
// `lookalikes`; detect.test.mjs checks every id here exists there. Rows 004
// (numbered circles) and 006 (a fixed inset-0 backdrop) have no precise regex
// and stay judgment-only. All of these are advisory ("quality").
// ---------------------------------------------------------------------------

// shadcn primitives (components/ui/*) are where the raw elements legitimately live.
function isUiPrimitive(filePath) {
  return /(?:^|[\\/])components[\\/]ui[\\/]/.test(filePath || "");
}

/** Whether the file imports one of these components from anywhere: "@/components/ui/x", "./ui/x", "@workspace/ui/components/x", "react-x" or a bare "x". */
function importsFrom(content, names) {
  return names.some((n) => new RegExp(`from\\s+["'](?:[^"']*/)?(?:react-)?${n}["']`).test(content));
}

/** One finding per opening tag in `names` whose attribute text passes `keep`. */
function tagFindings(content, lines, names, keep, message) {
  const findings = [];
  for (const t of openingTags(content, names)) {
    if (!keep(t.attrs)) continue;
    const line = lineAt(content, t.index);
    findings.push({ line, snippet: snippetAt(lines, line), message });
  }
  return findings;
}

/**
 * Flat CSS-like blocks: a run of text with no braces, then "{", a body with no braces, then "}".
 * One pass over the text. (The regex /([^{}]*)\{([^{}]*)\}/g gives the same blocks but rescans every
 * brace-free run from each start, which takes seconds on a large file with no braces.)
 */
export function cssBlocks(content) {
  const blocks = [];
  let runStart = 0;
  let i = 0;
  while (i < content.length) {
    const c = content[i];
    if (c === "}") { runStart = i + 1; i++; continue; }
    if (c !== "{") { i++; continue; }
    let j = i + 1;
    while (j < content.length && content[j] !== "{" && content[j] !== "}") j++;
    if (content[j] === "}") {
      blocks.push({ selector: content.slice(runStart, i), body: content.slice(i + 1, j), index: i });
      runStart = j + 1;
      i = j + 1;
    } else {
      runStart = i + 1; // a "{" with no closing "}" before the next brace is not a block
      i++;
    }
  }
  return blocks;
}

/** First match only: one finding per file for rules about a whole-file pattern. */
function firstMatch(content, lines, pattern, message) {
  const found = scanRegex(content, lines, pattern, message);
  return found.length ? [found[0]] : [];
}

const LOOKALIKE_RULES = [
  {
    id: "LOOKALIKE-001",
    title: "Raw <button> with a hand-written focus ring",
    fixHint: 'Use Button: variant="link" for text, variant="ghost" with an icon size and aria-label for icons, asChild as a trigger.',
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath)) return [];
      return tagFindings(content, lines, ["button"], (a) => /\bfocus-visible:(?:ring|outline)/.test(a), "Raw <button> with its own focus ring. Use Button.");
    },
  },
  {
    id: "LOOKALIKE-002",
    title: "Hand-rolled spinner",
    fixHint: "Use the Spinner component.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath) || importsFrom(content, ["spinner"])) return [];
      return firstMatch(content, lines, /\banimate-spin\b/, "animate-spin on a hand-built element. Use Spinner.");
    },
  },
  {
    id: "LOOKALIKE-003",
    title: 'Buttons with role="radio"',
    fixHint: "Use RadioGroup, or ToggleGroup (single) for a segmented control.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath) || importsFrom(content, ["radio-group", "toggle-group"])) return [];
      return firstMatch(content, lines, /\brole=["']radio["']/, 'role="radio" on hand-built markup. Use RadioGroup or ToggleGroup.');
    },
  },
  {
    id: "LOOKALIKE-005",
    title: "div, span, li or p with onClick",
    fixHint: "Use Button, or a link for navigation.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath)) return [];
      return tagFindings(content, lines, ["div", "span", "li", "p"], (a) => /\bonClick=/.test(a) && !/\brole=/.test(a) && !/stopPropagation/.test(a), "Clickable non-button element. Use Button, or a link for navigation.");
    },
  },
  {
    id: "LOOKALIKE-007",
    title: "setTimeout that hides a message held in state",
    fixHint: "Use a Sonner toast.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath) || /from\s+["'](?:@\/components\/ui\/)?sonner["']/.test(content)) return [];
      // () => setX(false) as the first argument, then a delay of 1.5s or more. Loading and busy flags are not toasts.
      const re = /setTimeout\(\s*(?:\(\s*\)\s*=>|function\s*\(\s*\))\s*\{?\s*(set[A-Z]\w*)\(\s*(?:false|null|""|'')\s*\)\s*;?\s*\}?\s*,\s*(\d[\d_]*(?:\s*\*\s*\d[\d_]*)*)/g;
      const busyFlag = /^set(?:Is)?(?:Loading|Pending|Busy|Saving|Fetching|Submitting|Uploading|Processing)$/;
      const findings = [];
      let m;
      while ((m = re.exec(content)) !== null) {
        const delay = m[2].split("*").reduce((n, part) => n * Number(part.replace(/_/g, "")), 1);
        if (busyFlag.test(m[1]) || delay < 1500) continue;
        const line = lineAt(content, m.index);
        findings.push({ line, snippet: snippetAt(lines, line), message: "A timer hides a message held in state. Use a Sonner toast." });
      }
      return findings;
    },
  },
  {
    id: "LOOKALIKE-008",
    title: "x or × as text for a close control",
    fixHint: "Use the Dialog or Sheet close, or a ghost icon Button with aria-label.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath)) return [];
      return scanRegex(content, lines, />\s*(?:×|✕|✖|&times;)\s*</, "A glyph used as a close control. Use the component's close, or an icon Button with aria-label.");
    },
  },
  {
    id: "LOOKALIKE-009",
    title: "window.confirm, alert or prompt",
    fixHint: "Use AlertDialog for confirmation, Sonner for notices, a Dialog with an Input for a prompt.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath)) return [];
      const findings = [];
      for (const name of ["confirm", "alert", "prompt"]) {
        // Declared in this file (a hook result, a parameter, a method): it is not the browser's.
        const declared = new RegExp(`\\b(?:const|let|var|function|class)\\s+${name}\\b|[{,]\\s*${name}\\s*[,}]|\\bimport\\s+${name}\\b|\\bimport\\s+(?:[\\w$]+\\s*,\\s*)?\\{[^}]*\\b${name}\\b[^}]*\\}|\\(\\s*${name}\\s*[,)=:]|(?:^|[,{;]\\s*|\\basync\\s+|\\bstatic\\s+)${name}\\s*\\([^)]*\\)\\s*\\{`, "m").test(content);
        const re = new RegExp(declared ? `\\b(?:window|globalThis)\\.${name}\\s*\\(` : `(?:\\b(?:window|globalThis)\\.|(?<![.\\w$]))${name}\\s*\\(`, "g");
        let m;
        while ((m = re.exec(content)) !== null) {
          const line = lineAt(content, m.index);
          const before = (lines[line - 1] || "").slice(0, m.index - content.lastIndexOf("\n", m.index - 1) - 1);
          if (/(?<!:)\/\/|^\s*(?:\/?\*)/.test(before)) continue; // in a comment (a "//" in a URL does not count)
          // Prose in JSX text ("Please confirm (this ...)"): a call follows an operator, a bracket or one of these keywords, not another word.
          if (!/window\.$|globalThis\.$/.test(before) && /\w\s+$/.test(before) && !/\b(?:return|await|if|else|typeof|void|case|yield)\s+$/.test(before)) continue;
          findings.push({ line, snippet: snippetAt(lines, line), message: "Native browser dialog. Use AlertDialog, Sonner or a Dialog." });
        }
      }
      return findings.sort((x, y) => x.line - y.line);
    },
  },
  {
    id: "LOOKALIKE-010",
    title: "Hand-built alert box",
    fixHint: "Use Alert with a status role (info, positive, negative, warning).",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath) || importsFrom(content, ["alert"])) return [];
      return tagFindings(content, lines, ["div", "p", "section", "span"], (a) => /\brole=["']alert["']/.test(a) && /border-l-4|\bbg-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d|(?<![:\w-])bg-destructive\/\d/.test(a), "A colored box with role=alert. Use Alert with a status role.");
    },
  },
  {
    id: "LOOKALIKE-011",
    title: "title attribute as a tooltip",
    fixHint: "Use Tooltip.",
    check({ content, lines, filePath }) {
      if (isUiPrimitive(filePath) || importsFrom(content, ["tooltip"])) return [];
      return tagFindings(content, lines, ["div", "span", "button", "a", "svg", "img", "td", "th", "p", "i"], (a) => /(?<![\w-])title=["'{]/.test(a), "title= used as a tooltip. Use Tooltip.");
    },
  },
].map((r) => ({ severity: "quality", extensions: CODE_EXT, ...r }));

RULES.push(...LOOKALIKE_RULES);

export function rulesForFile(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return RULES.filter((r) => r.extensions.includes(ext));
}

export function getRule(id) {
  return RULES.find((r) => r.id === id);
}
