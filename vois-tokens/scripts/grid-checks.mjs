// Regex-level checks for three grid and panel rules. No parser, no dependency, same as registry.mjs.
//   DS-GRID-007  a hard-coded column count instead of the collection formula
//   DS-GRID-004  a raw gutter on a grid container instead of --grid-gutter
//   DS-PANEL-008 a hard-coded width on a panel or pane instead of a panel token
//
// Each check reports one shape of the violation and stays quiet on anything it cannot read. A pass is
// not proof the rule is met. Known gaps are listed in references/hooks.md and in
// __fixtures__/adversarial.tsx, and pinned by tests in detect.test.mjs.

import { openingTags } from "./jsx-tags.mjs";
import { cssBlocks } from "./css-blocks.mjs";

const lineAt = (content, index) => content.slice(0, index).split("\n").length;
const snippetAt = (lines, lineNo) => (lines[lineNo - 1] || "").trim().slice(0, 160);
// Blank block comments but keep every newline, so line numbers do not move.
const blank = (c) => c.replace(/[^\n]/g, " ");
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, blank);
// In code a "/*" can sit inside a string ("src/*.ts"), so only a comment that starts after whitespace or one of { ( , ; counts.
const stripCodeComments = (text) => text.replace(/(?<![^\s{(,;])\/\*[\s\S]*?\*\//g, blank);
const uncomment = (text, filePath) => (isCssFile(filePath) ? stripComments(text) : stripCodeComments(text));
const isCssFile = (filePath = "") => /\.(?:css|scss)$/i.test(filePath);

function finding(content, lines, index, message) {
  const line = lineAt(content, index);
  return { line, snippet: snippetAt(lines, line), message };
}

/** Run a `g` regex over text and call fn(match) for each hit. Zero-width matches do not loop. */
function each(text, pattern, fn) {
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  let m;
  while ((m = re.exec(text)) !== null) {
    fn(m);
    if (m[0] === "") re.lastIndex++;
  }
}

/** Lower-case words of a name: SidePanel, side-panel, SIDE_PANEL and sidePanel all give side, panel. */
function words(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Whole words only, so "spreadsheet" and "stylesheet" are not a sheet.
const PANEL_WORDS = new Set(["panel", "panels", "drawer", "sheet", "flyout", "tray", "inspector", "pane", "panes"]);
// The panel itself, not a part of it: Sheet, SidePanel, DrawerContent, Dialog.Panel. SheetClose, PanelLeft and panel-title are parts.
function isPanelContainer(name) {
  const w = words(name);
  const last = w[w.length - 1];
  return PANEL_WORDS.has(last) || (last === "content" && w.length > 1 && PANEL_WORDS.has(w[w.length - 2]));
}
// The last compound selector of each selector in a list is the element the rules style: ".panel .icon" styles the icon.
function selectorIsPanel(selector) {
  return selector.split(",").some((sel) => {
    const last = sel.trim().split(/[\s>+~]+/).pop() || "";
    return (last.match(/[.#][A-Za-z_][\w-]*/g) || []).some((t) => isPanelContainer(t.slice(1)));
  });
}

// ---- DS-GRID-007 ---------------------------------------------------------------------------------

// A page grid is 4, 8 or 12 columns (DS-GRID-001), so those counts are left alone. That also hides a
// collection that hard-codes one of them: a known gap, written down in adversarial.tsx.
const PAGE_GRID_COLUMNS = new Set([4, 8, 12]);

export function rawColumnCount({ content, lines, filePath }) {
  content = uncomment(content, filePath);
  const findings = [];
  const seen = new Set();
  const report = (index, n, what) => {
    if (n < 2 || PAGE_GRID_COLUMNS.has(n) || seen.has(index)) return;
    seen.add(index);
    findings.push(finding(content, lines, index, `${what} hard-codes ${n} columns. Let the width of an item set the count (DS-GRID-007).`));
  };
  // Tailwind: grid-cols-3, md:grid-cols-3. Not data-grid-cols-3, not grid-cols-subgrid.
  each(content, /(?<![\w-])grid-cols-(\d+)(?![\w-])/g, (m) => report(m.index, Number(m[1]), `"${m[0]}"`));
  // Tailwind arbitrary value: grid-cols-[repeat(3,1fr)]
  each(content, /(?<![\w-])grid-cols-\[repeat\(\s*(\d+)\s*,/g, (m) => report(m.index, Number(m[1]), `"${m[0]}…"`));
  // CSS, StyleX and inline styles: grid-template-columns: repeat(3, 1fr)
  each(content, /(?<![\w$-])(?:grid-template-columns|gridTemplateColumns)\s*:\s*["'`]?[^;}\n]{0,200}?repeat\(\s*(\d+)\s*,/g, (m) =>
    report(m.index, Number(m[1]), "grid-template-columns"));
  return findings;
}

// ---- DS-GRID-004 ---------------------------------------------------------------------------------

/** A plain length: 24px, 1.5rem, 24 (a number in a style object). Zero is no gutter. calc(), var(), min() and % are not plain. */
function plainLength(v, unitless = false) {
  const m = (unitless ? /^(\d+(?:\.\d+)?)(?:px|rem|em)?$/i : /^(\d+(?:\.\d+)?)(?:px|rem|em)$/i).exec(String(v).trim());
  return m !== null && Number(m[1]) > 0;
}

const GRID_CLASS = /(?<![\w-])(?:[a-z0-9-]+:)*(?:inline-)?grid(?![\w-])|(?<![\w-])(?:[a-z0-9-]+:)*grid-cols-/;
const TW_GAP = /(?<![\w-])(?:[a-z0-9-]+:)*(?:gap|gap-x)-\[([^\]\s]{0,100})\](?![\w-])/g;
const GRID_OBJECT = /(?<![\w$.-])display\s*:\s*["'`](?:inline-)?grid["'`]|(?<![\w$.-])gridTemplateColumns\s*:/;
const OBJECT_GAP = /(?<![\w$.-])(?:gap|columnGap|gridGap|gridColumnGap)\s*:\s*(?:(\d+(?:\.\d+)?)|["'`](\d+(?:\.\d+)?(?:px|rem|em))["'`])(?![\w.])/g;
const CSS_GAP_PROPS = new Set(["gap", "column-gap", "grid-gap", "grid-column-gap"]);

export function rawGridGutter({ content, lines, filePath }) {
  content = uncomment(content, filePath);
  const findings = [];
  const msg = (what) => `${what} is a raw gutter on a grid. Use var(--grid-gutter) (DS-GRID-004).`;

  if (isCssFile(filePath)) {
    for (const b of cssBlocks(content)) {
      let offset = 0;
      const decls = [];
      for (const d of b.body.split(";")) {
        const i = d.indexOf(":");
        if (i !== -1) {
          decls.push({ prop: d.slice(0, i).trim().toLowerCase(), value: d.slice(i + 1).replace(/!important\s*$/i, "").trim(), at: b.index + 1 + offset + (d.length - d.trimStart().length) });
        }
        offset += d.length + 1;
      }
      const isGrid = decls.some((d) => (d.prop === "display" && /^(?:inline-)?grid$/i.test(d.value)) || d.prop === "grid-template-columns");
      if (!isGrid) continue;
      for (const d of decls) {
        if (!CSS_GAP_PROPS.has(d.prop)) continue;
        // `gap: 16px 24px` is row then column: a plain length in it is a raw gutter. A value with a function in it (var, calc, min, clamp) is not read.
        if (!d.value.includes("(") && d.value.split(/\s+/).some((p) => plainLength(p))) {
          findings.push(finding(content, lines, d.at, msg(`"${d.prop}: ${d.value}"`)));
        }
      }
    }
    return findings;
  }

  // Tailwind arbitrary gap on a tag that is a grid.
  for (const t of openingTags(content, ["[A-Za-z][\\w.]*"])) {
    // Other attributes' string values (aria-label="Photo grid") are not classes.
    const classy = t.attrs.replace(/(?<![\w-])(?!class(?:Name)?\s*=)[\w:-]+\s*=\s*(?:"[^"]*"|'[^']*')/g, blank);
    if (!GRID_CLASS.test(classy)) continue;
    each(classy, TW_GAP, (m) => {
      if (plainLength(m[1])) findings.push(finding(content, lines, t.index + 1 + t.name.length + m.index, msg(`"${m[0]}"`)));
    });
  }
  // A flat object literal (an inline style, a StyleX style) that is a grid and sets a literal gap.
  each(content, /\{([^{}]*)\}/g, (o) => {
    if (!GRID_OBJECT.test(o[1])) return;
    each(o[1], OBJECT_GAP, (g) => {
      if (Number(g[1] ?? parseFloat(g[2])) > 0) findings.push(finding(content, lines, o.index + 1 + g.index, msg(`"${g[0]}"`)));
    });
  });
  return findings;
}

// ---- DS-PANEL-008 --------------------------------------------------------------------------------

const TW_WIDTH = /(?<![\w-])(?:[a-z0-9-]+:)*(?:min-|max-)?w-(?:\[([^\]\s]{0,100})\]|(\d+(?:\.\d+)?))(?![\w/.-])/g;
const STYLE_WIDTH = /(?<![\w$.-])(?:(?:min|max)-?)?[Ww]idth\s*:\s*(?:(\d+(?:\.\d+)?)|["'`](\d+(?:\.\d+)?)(?:px|rem|em)?["'`])(?![\w.%])/g;
const PROP_WIDTH = /(?<![\w$.-])(?:min|max|default)?[Ww]idth\s*=\s*(?:\{\s*(\d+(?:\.\d+)?)\s*\}|["'](\d+(?:\.\d+)?)(?:px)?["'])/g;
// A name that holds a panel width: const PANEL_WIDTH = 320, { panelWidth: 320 }, <Layout panelWidth={320} />.
const NAMED_NUMBER = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*(?::\s*[\w.<>[\]| ]{1,40}?\s*)?[:=]\s*\{?\s*(\d+(?:\.\d+)?)(?![\w.%])/g;
const STATE_WIDTH = /\[\s*([A-Za-z_$][\w$]*)\s*,[^\]]{0,100}\]\s*=\s*useState(?:<[^>]*>)?\(\s*(\d+(?:\.\d+)?)\s*\)/g;
const PANEL_OBJECT = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*:\s*\{([^{}]*)\}/g;
const CSS_WIDTH_PROPS = new Set(["width", "min-width", "max-width", "flex-basis", "inline-size", "min-inline-size", "max-inline-size"]);
const CLASS_ATTR = /(?<![\w-])class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\}|\{\s*"([^"]*)"\s*\})/;

const panelMessage = (what) => `${what} hard-codes a panel width. Use a panel token (DS-PANEL-008).`;

export function rawPanelWidth({ content, lines, filePath }) {
  content = uncomment(content, filePath);
  const findings = [];
  const seen = new Set();
  const report = (index, what) => {
    if (seen.has(index)) return;
    seen.add(index);
    findings.push(finding(content, lines, index, panelMessage(what)));
  };

  if (isCssFile(filePath)) {
    for (const b of cssBlocks(content)) {
      const selector = b.selector.replace(/\/\/[^\n]*/g, "").replace(/^[\s\S]*[;}]/, "");
      if (!selectorIsPanel(selector)) continue;
      let offset = 0;
      for (const d of b.body.split(";")) {
        const i = d.indexOf(":");
        if (i !== -1) {
          const prop = d.slice(0, i).trim().toLowerCase();
          const value = d.slice(i + 1).replace(/!important\s*$/i, "").trim();
          // One plain length only. min(), clamp(), calc(), var() and percentages are read as built from tokens or fractions.
          if (CSS_WIDTH_PROPS.has(prop) && /^(\d+(?:\.\d+)?)(?:px|rem|em)?$/.test(value) && Number(value.replace(/[a-z]+$/i, "")) > 0) {
            report(b.index + 1 + offset + (d.length - d.trimStart().length), `"${prop}: ${value}"`);
          }
        }
        offset += d.length + 1;
      }
    }
    return findings;
  }

  // A tag that is a panel, by its name or by a word in its class, with a raw width in its own attributes.
  for (const t of openingTags(content, ["[A-Za-z][\\w.]*"])) {
    const cls = CLASS_ATTR.exec(t.attrs);
    const classText = cls ? cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? "" : "";
    if (!isPanelContainer(t.name) && !classText.split(/\s+/).some((c) => c && isPanelContainer(c))) continue;
    const base = t.index + 1 + t.name.length;
    each(t.attrs, TW_WIDTH, (m) => {
      const raw = m[1] !== undefined ? plainLength(m[1], true) : Number(m[2]) > 0;
      if (raw) report(base + m.index, `"${m[0]}"`);
    });
    each(t.attrs, STYLE_WIDTH, (m) => { if (Number(m[1] ?? m[2]) > 0) report(base + m.index, `"${m[0].trim()}"`); });
    each(t.attrs, PROP_WIDTH, (m) => { if (Number(m[1] ?? m[2]) > 0) report(base + m.index, `"${m[0].trim()}"`); });
  }
  // A style object named for a panel: panel: { width: 320 } in stylex.create().
  each(content, PANEL_OBJECT, (o) => {
    if (!isPanelContainer(o[1])) return;
    each(o[2], STYLE_WIDTH, (m) => { if (Number(m[1] ?? m[2]) > 0) report(o.index + o[0].indexOf("{") + 1 + m.index, `"${m[0].trim()}"`); });
  });
  // A name that says it is a panel width, set to a number.
  each(content, NAMED_NUMBER, (m) => {
    const w = words(m[1]);
    if (w.includes("width") && w.some((x) => PANEL_WORDS.has(x)) && Number(m[2]) > 0) report(m.index, `"${m[1]} = ${m[2]}"`);
  });
  each(content, STATE_WIDTH, (m) => {
    const w = words(m[1]);
    if (w.includes("width") && w.some((x) => PANEL_WORDS.has(x)) && Number(m[2]) > 0) report(m.index, `useState(${m[2]}) for ${m[1]}`);
  });
  return findings;
}
