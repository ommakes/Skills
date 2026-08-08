// check-cadence.mjs — CAD-* rules
//
// Verifies release-metadata hygiene: category is one of the three known
// values, and every entry has a unique, stable (non-sequence-number) id so
// entries can be tracked and diffed release over release.
//
// Usage: node check-cadence.mjs <draft-file>

import { parseDraft } from "./parse.mjs";

const RULES = {
  "CAD-01": "category must be New, Improved, or Fixed",
  "CAD-02": "every entry needs a unique, stable id (a slug, not a sequence number)",
};

const VALID_CATEGORIES = ["New", "Improved", "Fixed"];

export function checkCadence(entries) {
  const results = [];
  const idCounts = new Map();

  for (const entry of entries) {
    if (!VALID_CATEGORIES.includes(entry.category)) {
      results.push({
        rule: "CAD-01", status: "FAIL", entry: entry.id,
        detail: `category is "${entry.category ?? "missing"}" — must be one of New, Improved, or Fixed`,
      });
    }

    if (/^entry-\d+$/.test(entry.id)) {
      results.push({
        rule: "CAD-02", status: "WARN", entry: entry.id,
        detail: `id "${entry.id}" looks like an auto-generated sequence number — use a stable slug derived from the feature name instead`,
      });
    }

    idCounts.set(entry.id, (idCounts.get(entry.id) ?? 0) + 1);
  }

  for (const [id, count] of idCounts) {
    if (count > 1) {
      results.push({
        rule: "CAD-02", status: "WARN", entry: id,
        detail: `id "${id}" is used by ${count} entries — ids must be unique so entries can be tracked release over release`,
      });
    }
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node check-cadence.mjs <draft-file>");
    process.exit(2);
  }
  const entries = parseDraft(file);
  const results = checkCadence(entries);
  for (const r of results) {
    console.log(`[${r.status}] ${r.rule} (${r.entry}): ${r.detail}`);
  }
  if (results.length === 0) console.log("CAD: all clear.");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}
