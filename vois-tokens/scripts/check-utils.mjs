// Small helpers shared by regex-level checks (elevation-checks.mjs). grid-checks.mjs keeps its own copies of all but lineAt.

let breaksOf = null; // the text whose newline positions are kept
let breaks = [];

/**
 * The line (from 1) that `index` falls on: one more than the number of newlines before it, as
 * `content.slice(0, index).split("\n").length` counts. The newline positions of the last text are kept and searched, so
 * a check with many findings in one file reads the file once and not once per finding. An index that is not a whole
 * number of zero or more takes the slow way, so it means what it always did.
 */
export function lineAt(content, index) {
  if (typeof content !== "string" || !Number.isInteger(index) || index < 0) return content.slice(0, index).split("\n").length;
  if (content !== breaksOf) {
    breaks = [];
    for (let i = content.indexOf("\n"); i !== -1; i = content.indexOf("\n", i + 1)) breaks.push(i);
    breaksOf = content;
  }
  let lo = 0;
  let hi = breaks.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (breaks[mid] < index) lo = mid + 1;
    else hi = mid;
  }
  return lo + 1;
}
export const snippetAt = (lines, lineNo) => (lines[lineNo - 1] || "").trim().slice(0, 160);
/** Turn every character but newlines into a space, so line numbers do not move. */
export const blank = (c) => c.replace(/[^\n]/g, " ");
export const finding = (content, lines, index, message) => {
  const line = lineAt(content, index);
  return { line, snippet: snippetAt(lines, line), message };
};
export const isCssFile = (filePath = "") => /\.(?:css|scss)$/i.test(filePath);
export const isScssFile = (filePath = "") => /\.scss$/i.test(filePath);

/**
 * Blank comments, keeping every newline, in one pass over the text (so a long file, or one full of unclosed "/*",
 * costs time in proportion to its length). Strings are skipped, so a "//" or "/*" inside one is not a comment.
 * A string ends at its closing quote, or at the end of the line for " and ' (an apostrophe in JSX text then
 * hides nothing beyond its own line). In code a "/*" counts only after whitespace or one of { ( , ; and a "//" counts
 * when no ":" or word character or quote comes before it (so "https://x" is not a comment), and not right after
 * "url(". JSX text is not told apart from code, so "//" in it still starts a comment. CSS has no "//" comments,
 * SCSS does. A "/*" that never closes is left alone.
 */
export function uncomment(text, filePath) {
  const css = isCssFile(filePath);
  const lineComments = !css || isScssFile(filePath);
  const n = text.length;
  const parts = [];
  let last = 0;
  let i = 0;
  let noBlockClose = false; // once a search finds no "*/", no later search can
  while (i < n) {
    const c = text[i];
    if (c === '"' || c === "'" || (c === "`" && !css)) {
      let j = i + 1;
      while (j < n) {
        const ch = text[j];
        if (ch === "\\") j += 2;
        else if (ch === c) { j++; break; }
        else if (ch === "\n" && c !== "`") break;
        else j++;
      }
      i = Math.min(j, n);
      continue;
    }
    if (c === "/" && text[i + 1] === "*" && !noBlockClose && (css || i === 0 || /[\s{(,;]/.test(text[i - 1]))) {
      const close = text.indexOf("*/", i + 2);
      if (close === -1) { noBlockClose = true; i += 2; continue; }
      parts.push(text.slice(last, i), blank(text.slice(i, close + 2)));
      i = last = close + 2;
      continue;
    }
    if (c === "/" && text[i + 1] === "/" && lineComments && (i === 0 || !/[:\w"'`\\/]/.test(text[i - 1])) && !/url\($/i.test(text.slice(Math.max(0, i - 4), i))) {
      let eol = text.indexOf("\n", i);
      if (eol === -1) eol = n;
      parts.push(text.slice(last, i), blank(text.slice(i, eol)));
      i = last = eol;
      continue;
    }
    i++;
  }
  parts.push(text.slice(last));
  return parts.join("");
}
