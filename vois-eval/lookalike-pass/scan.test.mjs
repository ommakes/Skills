// Run with: node scan.test.mjs
// Pins what each fixture in fixtures/ must hit, so a change to a signal (or to the hook rules the
// scanner borrows) that stops it matching fails here instead of going unnoticed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scan } from "./scan.mjs";

const EXPECTED = {
  "LP-01a": ["fake-button"],
  "LP-03a": ["fake-close", "fake-overlay", "native-dialog"],
  "LP-04a": ["fake-toast"],
  "LP-05a": ["fake-alert", "raw-palette-color"],
  "LP-06a": ["raw-button-focus-ring"],
  "LP-07b": [], // a funnel bar, the word "progress" and a "/" path string must hit nothing
  "LP-09a": [],
  "LP-09b": ["raw-palette-color"],
  "HP-07": ["fake-progress"],
};

for (const [id, hits] of Object.entries(EXPECTED)) {
  test(`fixture ${id} hits ${hits.join(", ") || "nothing"}`, () => {
    const src = readFileSync(new URL(`./fixtures/${id}.tsx`, import.meta.url), "utf8");
    assert.deepEqual(scan(src, []).hits.sort(), [...hits].sort());
  });
}
