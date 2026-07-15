// check-sass-budget.mjs — SASS-* rules
//
// Enforces the "sass budget": at most one bit per entry, zero bits anywhere
// near sensitive topics, and not every entry in a release trying to be funny.
//
// Usage: node check-sass-budget.mjs <draft-file>

import { parseDraft, jokeMarkerCount, isSensitive, isNone } from "./parse.mjs";

const RULES = {
  "SASS-01": "at most one joke marker across headline + hook per entry",
  "SASS-02": "sensitive-topic entries must have zero joke markers and hook=none",
  "SASS-03": "no more than ~70% of entries in one release should carry a hook (batch-level)",
};

export function checkSassBudget(entries) {
  const results = [];

  for (const entry of entries) {
    const headlineMarkers = jokeMarkerCount(entry.headline);
    const hookMarkers = jokeMarkerCount(entry.hook);
    const totalMarkers = headlineMarkers + hookMarkers;
    const sensitive = isSensitive(entry);

    if (sensitive) {
      if (!isNone(entry.hook)) {
        results.push({
          rule: "SASS-02", status: "FAIL", entry: entry.id,
          detail: "entry touches a sensitive topic (security/billing/data loss/etc.) but has a hook — remove it, straight talk only here",
        });
      }
      if (totalMarkers > 0) {
        results.push({
          rule: "SASS-02", status: "FAIL", entry: entry.id,
          detail: `entry touches a sensitive topic but contains ${totalMarkers} joke marker(s) (emoji/!/parenthetical/em-dash aside)`,
        });
      }
    } else if (totalMarkers > 1) {
      results.push({
        rule: "SASS-01", status: "FAIL", entry: entry.id,
        detail: `entry has ${totalMarkers} joke markers across headline+hook — budget is one bit per entry`,
      });
    }
  }

  // Batch-level check: overuse across the whole release
  const withHook = entries.filter((e) => !isNone(e.hook)).length;
  const ratio = entries.length > 0 ? withHook / entries.length : 0;
  if (entries.length >= 3 && ratio > 0.7) {
    results.push({
      rule: "SASS-03", status: "WARN", entry: "(batch)",
      detail: `${withHook}/${entries.length} entries (${Math.round(ratio * 100)}%) have a hook — save personality for what's worth it, not every line`,
    });
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node check-sass-budget.mjs <draft-file>");
    process.exit(2);
  }
  const entries = parseDraft(file);
  const results = checkSassBudget(entries);
  for (const r of results) {
    console.log(`[${r.status}] ${r.rule} (${r.entry}): ${r.detail}`);
  }
  if (results.length === 0) console.log("SASS: all clear.");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}
