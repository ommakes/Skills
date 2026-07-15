// check-length.mjs — LEN-* rules
//
// Enforces length discipline by category: fixes stay tiny, features get a
// little more room but not a paragraph.
//
// Usage: node check-length.mjs <draft-file>

import { parseDraft, wordCount } from "./parse.mjs";

const RULES = {
  "LEN-01": "Fixed entries: combined word count across all filled fields <= 30 words",
  "LEN-02": "New/Improved entries: combined sentence count across all filled fields <= 4",
  "LEN-03": "no single field runs longer than 40 words (it's a changelog entry, not a paragraph)",
};

function filledFields(entry) {
  return ["headline", "hook", "sowhat", "receipt", "cta"]
    .map((f) => entry[f])
    .filter((t) => t && t.toLowerCase() !== "none");
}

function sentenceCountAll(texts) {
  return texts.reduce((sum, t) => {
    const matches = t.match(/[^.!?]+[.!?]+/g);
    return sum + (matches ? matches.length : 1);
  }, 0);
}

export function checkLength(entries) {
  const results = [];

  for (const entry of entries) {
    const fields = filledFields(entry);
    const totalWords = fields.reduce((sum, t) => sum + wordCount(t), 0);

    if (entry.category === "Fixed" && totalWords > 30) {
      results.push({
        rule: "LEN-01", status: "FAIL", entry: entry.id,
        detail: `Fixed entry is ${totalWords} words — fixes should read in one breath`,
      });
    }

    if ((entry.category === "New" || entry.category === "Improved")) {
      const sentences = sentenceCountAll(fields);
      if (sentences > 4) {
        results.push({
          rule: "LEN-02", status: "FAIL", entry: entry.id,
          detail: `${entry.category} entry runs ${sentences} sentences across its fields — cap is 4`,
        });
      }
    }

    for (const [name, value] of Object.entries(entry)) {
      if (["headline", "hook", "sowhat", "receipt", "cta"].includes(name)) {
        const wc = wordCount(value);
        if (wc > 40) {
          results.push({
            rule: "LEN-03", status: "FAIL", entry: entry.id,
            detail: `field "${name}" is ${wc} words — if it needs this much room, the feature's confusing, not the changelog`,
          });
        }
      }
    }
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node check-length.mjs <draft-file>");
    process.exit(2);
  }
  const entries = parseDraft(file);
  const results = checkLength(entries);
  for (const r of results) {
    console.log(`[${r.status}] ${r.rule} (${r.entry}): ${r.detail}`);
  }
  if (results.length === 0) console.log("LEN: all clear.");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}
