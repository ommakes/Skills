# Changelog

All notable changes to the Righter skill are documented here.

---

## [1.4.0] — 2026-08-07

### Added

- **Stable `id` on every UX writing principle and every Error Message Guidelines rule** (e.g. `active-voice`, `error-decision-tree`), so a rule can be cited without depending on its position in the numbered list — numbers shift when principles are added or reordered, ids don't.
- **Principle 16, `no-em-dashes`.** `references/email.md` already assumed a "no em dashes" core principle existed ("Apply all core Righter principles... no em dashes..."); it was never actually defined in `SKILL.md`. It is now.
- **Fallback branch in the error component decision tree** — "None of the above → Inline Alert" — for copy that doesn't cleanly match any of the six existing questions.
- **`scripts/ari.mjs`** — deterministic ARI score, grade level, and word/character/sentence count calculator (`node scripts/ari.mjs "<copy>"`, `--before`/`--after` mode, or stdin). `SKILL.md`'s Reading Metrics section now points to it instead of asking for the multi-step formula to be computed by hand, which is error-prone done in-context.
- **`evals/cases.json`** — an 8-case regression corpus (copy paired with the rule ids a correct review should flag, plus expected component picks) for manually verifying that edits to principles, data files, or the decision tree don't silently change what the skill catches. Documented in a new "Maintaining This Skill" section in `SKILL.md`.

### Fixed

- `data/components.json`, `data/weakeners.json`, `data/phonaesthetics.json` — `source` fields corrected. They still pointed at the `references/*.md` files removed in 1.3.0 when this content moved to JSON.
- `data/weakeners.json` — filled in missing `example` pairs for four categories (`empty-intensifiers`, `vague-quantifiers`, `over-cautious-legalese`, `talking-about-talking`) that had none, so the skill has something to surface instead of improvising one.

### Changed

- **Version bump:** `1.3.1` → `1.4.0`

---

## [1.3.1] — 2026-07-23

### Fixed

- **MCP tool name/schema mismatch.** `SKILL.md` referenced `get_microcopy(context, copy_type)`, which doesn't match what's registered on the Vois MCP server. Corrected to `vois_get_microcopy(context, intent, constraints?)` — the real tool requires both `context` and `intent`, has no `copy_type` argument, and `constraints.placement` (optional) is the closest equivalent.

---

## [1.3.0] — 2026-07-23

### Changed

- **Converted prose reference data to structured JSON:** `data/weakeners.json`, `data/phonaesthetics.json`, `data/components.json` (full conversions of the former `references/*.md` files), and `data/email-benchmarks.json` (split off the numeric benchmarks in `references/email.md`). Behavior unchanged — only how the skill retrieves reference data changes, from reading a file top to bottom to looking up by id/category.
- Removed `references/weakeners.md`, `references/phonaesthetics.md`, `references/components.md` — fully superseded by their JSON conversions (verified 1:1 sentence coverage before deleting; no code examples or narrative content left behind).

---

## [1.2.0] — 2026-07-21

### Changed

- **Standalone-safe:** `vois_get_microcopy` is now optional — call it if available in the environment, otherwise apply the skill's principles directly with a documented fallback path. Removed the hard dependency on `vois-router`/`vois-loop`; the skill now reads and runs standalone, with no MCP server required.

---

## [1.1.0] — 2026-05-23

Initial tracked version. Core skill covering the UX writing principles (active voice, reading level, jargon, sentence structure, double negatives, contractions, tense, user-goal framing, interface references, terminology, progressive disclosure, apologies, exclamation marks, prepositions, weakeners), Error Message Guidelines with a component decision tree, Phonaesthetics guidance for labels and CTAs, ARI reading-level scoring, and product transactional email rules (`references/email.md`).
