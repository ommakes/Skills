// Deterministic, regex/string-level checks for the mechanically-verifiable
// subset of vois-tokens' [DS-*] rules. No parser dependency by design — see
// vois-tokens/references/hooks.md for which rules are intentionally NOT here
// (they require AST/layout/contrast computation and stay LLM-judgment-only).

const CSS_EXT = [".css", ".scss"];
const CODE_EXT = [".tsx", ".jsx", ".ts", ".js"];
const ALL_EXT = [...CSS_EXT, ...CODE_EXT];

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
    check({ content, lines }) {
      const pattern = /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[(\d+(?:\.\d+)?)px\]/g;
      const findings = [];
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const px = parseFloat(match[1]);
        if (px % 4 !== 0) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `Arbitrary value "${match[0]}" is not divisible by 4.` });
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
      return scanRegex(content, lines, /\btransition-all\b|transition(?:-property)?:\s*all\b/, "Transitioning \"all\" — list properties explicitly.");
    },
  },
  {
    id: "DS-ANIMATION-001",
    title: "Animation duration over 300ms",
    severity: "quality",
    extensions: ALL_EXT,
    fixHint: "Keep UI animations under 300ms (large elements up to 500ms).",
    check({ content, lines }) {
      const findings = [];
      const msPattern = /\bduration-\[(\d+)ms\]|\bduration-(\d{3,4})\b|transition-duration:\s*(\d+)ms/g;
      let match;
      while ((match = msPattern.exec(content)) !== null) {
        const ms = Number(match[1] ?? match[2] ?? match[3]);
        if (ms > 500) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `Duration ${ms}ms exceeds the 500ms ceiling (300ms for most UI).` });
        } else if (ms > 300) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `Duration ${ms}ms exceeds 300ms — only acceptable for large elements.` });
        }
      }
      const sPattern = /transition-duration:\s*(\d+(?:\.\d+)?)s\b/g;
      while ((match = sPattern.exec(content)) !== null) {
        const ms = Number(match[1]) * 1000;
        if (ms > 300) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `Duration ${ms}ms exceeds 300ms — only acceptable for large elements.` });
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
    check({ content, lines }) {
      const findings = [];
      let match;
      const twPattern = /active:scale-(\d{1,3})\b/g;
      while ((match = twPattern.exec(content)) !== null) {
        const scale = Number(match[1]) / 100;
        if (scale < 0.95) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `active:scale-${match[1]} (${scale}) is below the 0.95 floor.` });
        }
      }
      const motionPattern = /whileTap\s*=\s*\{\{[^}]*scale:\s*([\d.]+)/g;
      while ((match = motionPattern.exec(content)) !== null) {
        const scale = Number(match[1]);
        if (scale < 0.95) {
          const line = lineAt(content, match.index);
          findings.push({ line, snippet: snippetAt(lines, line), message: `whileTap scale ${scale} is below the 0.95 floor.` });
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
];

export function rulesForFile(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return RULES.filter((r) => r.extensions.includes(ext));
}

export function getRule(id) {
  return RULES.find((r) => r.id === id);
}
