// check-all.mjs — runs every rule checker against a draft and prints one report.
//
// Usage: node check-all.mjs <draft-file>
//
// Exit code 0 = no FAILs (WARNs are fine, worth a look but not blocking).
// Exit code 1 = at least one FAIL — fix and re-run before publishing.

import { parseDraft } from "./parse.mjs";
import { checkStructure } from "./check-structure.mjs";
import { checkSassBudget } from "./check-sass-budget.mjs";
import { checkVoice } from "./check-voice.mjs";
import { checkLength } from "./check-length.mjs";
import { checkCadence } from "./check-cadence.mjs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node check-all.mjs <draft-file>");
  process.exit(2);
}

const entries = parseDraft(file);

if (entries.length === 0) {
  console.error(`No entries found in ${file}. Check the ### ENTRY / ### END format.`);
  process.exit(2);
}

const allResults = [
  ...checkStructure(entries),
  ...checkSassBudget(entries),
  ...checkVoice(entries),
  ...checkLength(entries),
  ...checkCadence(entries),
];

const fails = allResults.filter((r) => r.status === "FAIL");
const warns = allResults.filter((r) => r.status === "WARN");

console.log(`Checked ${entries.length} entr${entries.length === 1 ? "y" : "ies"} from ${file}\n`);

if (allResults.length === 0) {
  console.log("All clear. Nothing flagged.");
} else {
  if (fails.length > 0) {
    console.log(`FAILS (${fails.length}) — fix before publishing:`);
    for (const r of fails) console.log(`  [${r.rule}] (${r.entry}) ${r.detail}`);
    console.log("");
  }
  if (warns.length > 0) {
    console.log(`WARNINGS (${warns.length}) — worth a look:`);
    for (const r of warns) console.log(`  [${r.rule}] (${r.entry}) ${r.detail}`);
  }
}

process.exit(fails.length > 0 ? 1 : 0);
