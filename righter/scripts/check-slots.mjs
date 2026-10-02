// check-slots.mjs: checks marketing copy against the per-slot limits in
// data/marketing-limits.json. Counts words exactly so nobody counts by hand.
//
// Usage:
//   node check-slots.mjs hero-h1 "Martial arts for all ages in Ashburn"
//   echo '{"hero-h1":"...","hero-sub":"..."}' | node check-slots.mjs
//   node check-slots.mjs --file copy.json
//   node check-slots.mjs --list
//
// Exit code is 0 (no failures) or 1 (at least one failure). Warnings do not
// change the exit code.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LIMITS = JSON.parse(readFileSync(join(ROOT, "data/marketing-limits.json"), "utf8"));
const WEAKENERS = JSON.parse(readFileSync(join(ROOT, "data/weakeners.json"), "utf8"));

/** Tokens split on whitespace that contain a letter or digit. "—" and "&" alone are not words. */
export function countWords(text) {
  return (text ?? "")
    .trim()
    .split(/\s+/)
    .filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

function countSentences(text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]*[.!?]+/g);
  if (!matches) return 1;
  const rest = trimmed.slice(matches.join("").length).trim();
  return matches.filter((s) => s.trim()).length + (rest ? 1 : 0);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findTerms(text, terms) {
  return terms.filter((t) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(t)}($|[^\\p{L}\\p{N}])`, "iu").test(text));
}

// Flat weakener terms. Skips weak-verb-phrases (pairs, not a flat list) and
// annotated terms like "pretty (as adverb)".
const WEAKENER_TERMS = WEAKENERS.categories
  .filter((c) => Array.isArray(c.terms))
  .flatMap((c) => c.terms)
  .filter((t) => !t.includes("("));

function acronymsIn(sentence) {
  return (sentence.match(/\b[A-Z]{2,}\b/g) || []).length;
}

export function checkSlot(slotId, text) {
  const slot = LIMITS.slots.find((s) => s.id === slotId);
  if (!slot) {
    return { slot: slotId, error: `Unknown slot. Run with --list to see slot ids.` };
  }

  const words = countWords(text);
  const sentences = countSentences(text);
  const fail = [];
  const warn = [];

  if (slot.max_words != null && words > slot.max_words) {
    fail.push(`${words} words, limit is ${slot.max_words}`);
  }
  if (slot.min_words != null && words < slot.min_words) {
    fail.push(`${words} words, minimum is ${slot.min_words}`);
  }
  if (slot.max_sentences != null && sentences > slot.max_sentences) {
    fail.push(`${sentences} sentences, limit is ${slot.max_sentences}`);
  }

  if (text.includes("—")) {
    (LIMITS.checks.em_dash === "fail" ? fail : warn).push("contains an em dash (use a period, comma, or colon)");
  }

  const banned = findTerms(text, LIMITS.banned_terms.fail);
  if (banned.length) fail.push(`puffery: ${banned.join(", ")}`);
  const bannedWarn = findTerms(text, LIMITS.banned_terms.warn);
  if (bannedWarn.length) warn.push(`check wording: ${bannedWarn.join(", ")}`);

  const weak = findTerms(text, WEAKENER_TERMS);
  if (weak.length) warn.push(`weakeners: ${weak.join(", ")}`);

  const sentenceList = text.match(/[^.!?]+[.!?]*/g) || [];
  const maxAcronyms = slot.max_acronyms ?? 1;
  const crowded = sentenceList.some((s) => acronymsIn(s) > maxAcronyms);
  if (crowded) warn.push(`more than ${maxAcronyms} acronym in one sentence (define or drop)`);

  return { slot: slotId, label: slot.label, text, words, limit: slot.max_words, sentences, fail, warn };
}

function render(result) {
  if (result.error) return `?  ${result.slot}: ${result.error}`;
  const status = result.fail.length ? "FAIL" : result.warn.length ? "WARN" : "PASS";
  const lines = [`${status}  ${result.label} (${result.words}/${result.limit} words)  "${result.text}"`];
  for (const f of result.fail) lines.push(`      fail: ${f}`);
  for (const w of result.warn) lines.push(`      warn: ${w}`);
  return lines.join("\n");
}

function main(argv) {
  const args = argv.slice(2);

  if (args[0] === "--list") {
    for (const s of LIMITS.slots) {
      const range = s.min_words != null ? `${s.min_words} to ${s.max_words}` : `max ${s.max_words}`;
      console.log(`${s.id.padEnd(18)} ${range} words  ${s.notes}`);
    }
    return 0;
  }

  let entries;
  if (args[0] === "--file") {
    entries = Object.entries(JSON.parse(readFileSync(args[1], "utf8")));
  } else if (args.length >= 2) {
    entries = [[args[0], args.slice(1).join(" ")]];
  } else {
    const stdin = readFileSync(0, "utf8").trim();
    if (!stdin) {
      console.error("Usage: check-slots.mjs <slot> \"copy\" | --file copy.json | --list | JSON on stdin");
      return 2;
    }
    entries = Object.entries(JSON.parse(stdin));
  }

  const results = entries.map(([slot, text]) => checkSlot(slot, String(text)));
  for (const r of results) console.log(render(r));
  return results.some((r) => r.error || r.fail.length) ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv));
}
