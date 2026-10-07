// Finds JSX opening tags and returns their attribute text. Unlike a "[^>]*" regex, it skips over
// braces and quotes, so a ">" inside {count >= 3} or {a > b ? x : y} does not end the tag early.
// A tag longer than MAX_TAG characters, or one that never closes, is skipped.

const MAX_TAG = 3000;

/** Every opening tag whose name is in `names`: [{ index, name, attrs }]. */
export function openingTags(content, names) {
  const start = new RegExp(`<(${names.join("|")})(?=[\\s/>])`, "g");
  const tags = [];
  let m;
  while ((m = start.exec(content)) !== null) {
    const from = m.index + m[0].length;
    const limit = Math.min(content.length, from + MAX_TAG);
    let depth = 0;
    let quote = null;
    let end = -1;
    for (let i = from; i < limit; i++) {
      const c = content[i];
      if (quote) {
        if (c === quote && content[i - 1] !== "\\") quote = null;
      } else if (c === '"' || c === "'" || (c === "`" && depth > 0)) quote = c;
      else if (c === "{") depth++;
      else if (c === "}") depth = Math.max(0, depth - 1);
      else if (c === ">" && depth === 0) { end = i; break; }
    }
    if (end === -1) continue;
    tags.push({ index: m.index, name: m[1], attrs: content.slice(from, end) });
    start.lastIndex = end;
  }
  return tags;
}
