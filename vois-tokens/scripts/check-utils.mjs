// Small helpers shared by regex-level checks (elevation-checks.mjs). grid-checks.mjs keeps its own copies of the first four.

export const lineAt = (content, index) => content.slice(0, index).split("\n").length;
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
 * Blank comments, keeping every newline. In code a "/*" can sit inside a string, so only a comment that starts after
 * whitespace or one of { ( , ; counts. A "//" counts when no ":" or word character or quote comes before it
 * (so "https://x" is not a comment). CSS has no "//" comments, SCSS does.
 */
export function uncomment(text, filePath) {
  let t = isCssFile(filePath)
    ? text.replace(/\/\*[\s\S]*?\*\//g, blank)
    : text.replace(/(?<![^\s{(,;])\/\*[\s\S]*?\*\//g, blank);
  if (!isCssFile(filePath) || isScssFile(filePath)) t = t.replace(/(?<![:\w"'`\\/])\/\/[^\n]*/g, blank);
  return t;
}
