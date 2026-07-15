// check-voice.mjs — VOICE-* rules
//
// Catches corporate-press-release language, missing contractions, and the
// catchable half of "forced puns" — clichéd wordplay patterns and lampshading
// ("get it?", "pun intended"). The other half of pun quality — whether the
// second meaning is actually TRUE of what shipped, not just wordplay-adjacent —
// can't be scripted (VOICE-04, requires knowing the real feature). That stays
// a human/model judgment call, documented in SKILL.md and references/voice-examples.md.
//
// Usage: node check-voice.mjs <draft-file>

import { parseDraft } from "./parse.mjs";

const RULES = {
  "VOICE-01": "no corporate buzzwords or press-release phrasing",
  "VOICE-02": "use contractions instead of formal uncontracted forms",
  "VOICE-03": "no clichéd pun patterns or lampshaded jokes",
};

const BUZZWORDS = [
  "leverage", "utilize", "best-in-class", "cutting-edge", "cutting edge",
  "we are pleased to announce", "we're pleased to announce", "robust solution",
  "seamless experience", "empower", "unlock the power of", "game-changing",
  "game changer", "next-level", "next level", "synergy", "solutioning",
  "circle back", "deep dive", "unprecedented", "revolutionary", "world-class",
  "blazing fast", "delighted to", "excited to announce",
];

const UNCONTRACTED = [
  [/\bdo not\b/gi, "don't"],
  [/\bcannot\b/gi, "can't"],
  [/\bwill not\b/gi, "won't"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\byou will\b/gi, "you'll"],
  [/\bwe are\b/gi, "we're"],
  [/\bwe have\b/gi, "we've"],
  [/\bdoes not\b/gi, "doesn't"],
];

// Cliché pun patterns: wordplay templates so overused they read as lazy rather
// than clever, regardless of the feature they're bolted onto. Grouped by the
// "swap a real word for a similar-sounding one" trick they all rely on.
const CLICHE_PUN_PATTERNS = [
  // food/coffee substitution puns
  /\begg-?cellent\b/i, /\bbrew-?tiful\b/i, /\bespresso yourself\b/i,
  /\bdonut worry\b/i, /\blettuce\b.*\bcelebrate\b/i, /\bolive you\b/i,
  /\bwine not\b/i, /\bsub-?lime\b/i, /\bthyme after thyme\b/i,
  // animal substitution puns
  /\bpurr-?fect\b/i, /\bpaw-?some\b/i, /\bfur-?ever\b/i, /\bcat-?astrophe\b/i,
  /\bdog-?gone\b/i, /\bkitten around\b/i, /\botter-?ly\b/i, /\bwhale done\b/i,
  /\bso-?fish-?ticated\b/i, /\byou've got to be kitten me\b/i, /\bunbe-?leaf-?able\b/i,
  // generic "-tastic/-tacular" suffix bolt-ons
  /\bfin-?tastic\b/i, /\bfan-?tastic ?ally\b/i, /\b\w+-?tacular\b/i,
];

// Explicit lampshading — a pun that has to announce itself already failed.
const LAMPSHADE_PATTERNS = [
  /see what (we|i) did there/i,
  /get it\?/i,
  /pun intended/i,
  /wink,? wink/i,
  /;\)/,
  /😉/,
];

function allText(entry) {
  return [entry.headline, entry.hook, entry.sowhat, entry.receipt, entry.cta]
    .filter((t) => t && t.toLowerCase() !== "none")
    .join(" ");
}

export function checkVoice(entries) {
  const results = [];

  for (const entry of entries) {
    const text = allText(entry);
    const lower = text.toLowerCase();

    for (const phrase of BUZZWORDS) {
      if (lower.includes(phrase)) {
        results.push({
          rule: "VOICE-01", status: "FAIL", entry: entry.id,
          detail: `contains buzzword/press-release phrase: "${phrase}"`,
        });
      }
    }

    for (const [pattern, suggestion] of UNCONTRACTED) {
      if (pattern.test(text)) {
        results.push({
          rule: "VOICE-02", status: "WARN", entry: entry.id,
          detail: `formal form found, consider "${suggestion}"`,
        });
      }
    }

    for (const pattern of CLICHE_PUN_PATTERNS) {
      const match = pattern.exec(text);
      if (match) {
        results.push({
          rule: "VOICE-03", status: "FAIL", entry: entry.id,
          detail: `clichéd pun pattern found: "${match[0]}" — this template is worn out regardless of the feature`,
        });
      }
    }

    for (const pattern of LAMPSHADE_PATTERNS) {
      const match = pattern.exec(text);
      if (match) {
        results.push({
          rule: "VOICE-03", status: "FAIL", entry: entry.id,
          detail: `joke is lampshaded ("${match[0]}") — a pun that has to announce itself already failed`,
        });
      }
    }
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node check-voice.mjs <draft-file>");
    process.exit(2);
  }
  const entries = parseDraft(file);
  const results = checkVoice(entries);
  for (const r of results) {
    console.log(`[${r.status}] ${r.rule} (${r.entry}): ${r.detail}`);
  }
  if (results.length === 0) console.log("VOICE: all clear.");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}
