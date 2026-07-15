// parse.mjs — turns a draft file into an array of entry objects.
//
// Expected format, one block per entry:
//
// ### ENTRY id=bulk-actions category=New sass=hook
// headline: Bulk actions have entered the chat.
// hook: You can now select every unread thread at once.
// sowhat: Stop clicking the same checkbox forty times.
// receipt: Select multiple conversations from the inbox and archive, tag, or reassign them in one action.
// cta: none
// ### END
//
// Fields with no content should be the literal word "none" (lowercase), not blank —
// that's what lets the checkers tell "not written yet" apart from "deliberately skipped."

import { readFileSync } from "node:fs";

const FIELD_NAMES = ["headline", "hook", "sowhat", "receipt", "cta"];

export function parseDraft(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const blocks = raw.split(/^### ENTRY/m).slice(1); // drop anything before the first entry

  return blocks.map((block, i) => {
    const headerLine = block.split("\n")[0];
    const body = block.slice(headerLine.length).split(/^### END/m)[0];

    const id = /id=(\S+)/.exec(headerLine)?.[1] ?? `entry-${i + 1}`;
    const category = /category=(\S+)/.exec(headerLine)?.[1] ?? null;
    const sass = /sass=(\S+)/.exec(headerLine)?.[1] ?? null;

    const fields = {};
    for (const name of FIELD_NAMES) {
      const re = new RegExp(`^${name}:\\s*(.+)$`, "m");
      const match = re.exec(body);
      fields[name] = match ? match[1].trim() : null;
    }

    return { id, category, sass, ...fields, _raw: block };
  });
}

// Rough sentence count. Not linguistically perfect, good enough for a length guardrail.
export function sentenceCount(text) {
  if (!text || text.toLowerCase() === "none") return 0;
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : text.trim().length > 0 ? 1 : 0;
}

export function wordCount(text) {
  if (!text || text.toLowerCase() === "none") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isNone(text) {
  return !text || text.trim().toLowerCase() === "none";
}

export const SENSITIVE_KEYWORDS = [
  "security", "breach", "vulnerability", "exploit", "password", "payment",
  "billing", "charge", "refund", "data loss", "deleted", "delete", "outage",
  "incident", "downtime", "leak", "exposed", "unauthorized", "compromise",
];

export function isSensitive(entry) {
  const haystack = [entry.headline, entry.hook, entry.sowhat, entry.receipt]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return SENSITIVE_KEYWORDS.some((kw) => haystack.includes(kw));
}

// Counts "joke markers" — crude proxies for a bit being present: emoji, exclamation
// marks, parenthetical asides, em-dash asides. Not a humor detector, just a tripwire.
export function jokeMarkerCount(text) {
  if (!text || text.toLowerCase() === "none") return 0;
  let count = 0;
  count += (text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length; // emoji
  count += (text.match(/!/g) || []).length;
  count += (text.match(/\([^)]+\)/g) || []).length; // parentheticals
  count += (text.match(/—[^—]+—?/g) || []).length; // em-dash asides
  return count;
}
