// Flat CSS-like blocks, shared by registry.mjs and grid-checks.mjs.

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
