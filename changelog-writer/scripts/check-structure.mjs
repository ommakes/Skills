// check-structure.mjs — STRUCT-* rules
//
// Verifies every entry has the mandatory skeleton parts filled in
// (headline, so-what, receipt) and that the receipt is specific enough
// to actually tell the reader what changed.
//
// Usage: node check-structure.mjs <draft-file>

import { parseDraft, isNone, wordCount } from "./parse.mjs";

const RULES = {
  "STRUCT-01": "headline is required and non-empty",
  "STRUCT-02": "sowhat is required and non-empty",
  "STRUCT-03": "receipt is required, non-empty, and specific (not vague marketing language)",
};

// Heuristic for "specific": receipt should contain a concrete noun/number/action,
// not just vibes. We flag it if it's short AND matches a vague-phrase pattern.
const VAGUE_PATTERNS = [
  /\bimproved (experience|performance|reliability)\b/i,
  /\benhanced\b/i,
  /\bbetter overall\b/i,
  /\bvarious (bugs|fixes|improvements)\b/i,
  /\bunder the hood\b/i,
];

export function checkStructure(entries) {
  const results = [];

  for (const entry of entries) {
    // Fixed entries are allowed to collapse everything into the headline —
    // sowhat/receipt are only mandatory for New/Improved.
    const requireFullSkeleton = entry.category !== "Fixed";

    if (isNone(entry.headline)) {
      results.push({ rule: "STRUCT-01", status: "FAIL", entry: entry.id, detail: "headline is missing or 'none'" });
    }
    if (requireFullSkeleton && isNone(entry.sowhat)) {
      results.push({ rule: "STRUCT-02", status: "FAIL", entry: entry.id, detail: "sowhat is missing or 'none'" });
    }
    if (requireFullSkeleton && isNone(entry.receipt)) {
      results.push({ rule: "STRUCT-03", status: "FAIL", entry: entry.id, detail: "receipt is missing or 'none'" });
    } else if (!isNone(entry.receipt)) {
      const vague = VAGUE_PATTERNS.some((re) => re.test(entry.receipt));
      const tooShort = wordCount(entry.receipt) < 5;
      if (vague || tooShort) {
        results.push({
          rule: "STRUCT-03",
          status: "WARN",
          entry: entry.id,
          detail: vague
            ? `receipt reads like vague marketing copy: "${entry.receipt}"`
            : `receipt is very short (${wordCount(entry.receipt)} words) — make sure it actually says what changed`,
        });
      }
    }
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node check-structure.mjs <draft-file>");
    process.exit(2);
  }
  const entries = parseDraft(file);
  const results = checkStructure(entries);
  for (const r of results) {
    console.log(`[${r.status}] ${r.rule} (${r.entry}): ${r.detail}`);
  }
  if (results.length === 0) console.log("STRUCT: all clear.");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}
