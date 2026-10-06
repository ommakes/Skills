# Changelog

All notable changes to the Righter skill are documented here.

---

## [1.9.1] - 2026-10-06

### Fixed

- **`no-pii-in-copy` and `PATH-PERM-PII-KEEP-OUT` disagreed about names in titles.** The principle banned names from page titles, while the pattern allowed one on a screen whose job is that person. The principle now has the same exception: a name may appear in a page title or breadcrumb on a person's own screen, never an email, phone number, address, or ID. The checklist line says so too.

### Changed

- **Version bump:** `1.9.0` → `1.9.1`

---

## [1.9.0] - 2026-10-06

### Added

- **`no-invented-claims`** (principle 19). No numbers, times, guarantees, prices, legal terms, or compliance and security claims unless the product team or legal supplied them. Write copy that makes no promise and flag the gap.
- **`no-pii-in-copy`** (principle 20). Keep personal data out of errors, toasts, titles, URLs, subjects, notification previews, and analytics labels. Name the record by role or mask the value. Points to `vois-patterns` for on-screen PII display.
- **Eval cases 25 to 27,** and a "Claims and data" block in the Review Checklist.

### Changed

- **Version bump:** `1.8.0` → `1.9.0`

---

## [1.8.0] - 2026-10-02

### Added

- **Marketing copy guidance.** `references/marketing-copy.md` covers word limits per marketing slot (hero h1 7, hero sub 12, section head 5, card title 4, card description 20, button 2 to 4, eyebrow 2, form helper 12) and ten `mkt-*` rules. Where a rule already exists (`consistent-terminology`, `eliminate-weakeners`, `user-goal-framing`, `accessible-copy`), the new file cites the existing id.
- **`data/marketing-limits.json`,** the canonical source for the slot limits, the banned puffery list, and check severities.
- **`scripts/check-slots.mjs`,** counts words per slot and checks limits, sentence counts, puffery, em dashes, and acronym crowding. Fails on limits, puffery, and em dashes. Warns on weakeners and acronyms. The source guidance's own word counts were off by one to six in places, which is why this is a script.
- **Eval cases 20 to 24** from the before and after examples.
- **A marketing section in the Review Checklist,** and a note on `rhetorical-devices`: on marketing pages the slot limits win.

### Changed

- **Version bump:** `1.7.0` → `1.8.0`

---

## [1.7.0] - 2026-10-02

### Added

- **Two `empty-state` variants** in `data/components.json`: `Empty by nature` (zero rows is normal, no action) and `No access` (the user's role cannot see any rows, no create action).
- **A "Table copy" note** in `SKILL.md` that routes table states to existing components: empty table to `empty-state`, one cell's validation to Helper Text, a table-level partial failure to Inline Alert, a bulk delete confirmation to Alert Dialog. No new components, because the existing ones already cover these.
- **Eval cases 16 to 19** for table copy. Case 19 deliberately has no `expected_component`: the error decision tree has no clear slot for a failed single-row action. If it keeps needing a judgment call, add a row to the tree.

---

## [1.6.0] - 2026-09-29

The gap analysis behind this release comes from [content-designer/ux-writing-skill](https://github.com/content-designer/ux-writing-skill) (MIT). No text was copied. Ideas only, rewritten in Righter's voice.

### Added

- **Audience and Reading Target section.** Three tiers: `consumer` (default, ARI 6 or lower), `professional` (10), `technical` (12). Tiers change the reading target only. Every other principle still applies. With no audience stated, reviews behave as they did in 1.5.0. A non-default tier is named at the top of the output.
- **Principle 18, `accessible-copy`,** and `references/accessibility.md`. Covers labels and links that work out of context, no "click here", status that isn't color alone, errors that name their field, placeholders that don't replace labels, and `aria-label` copy for icon-only controls. When an object noun doesn't fit a component's limit, the review keeps the short label and recommends an `aria-label`.
- **`empty-state` and `permission-prompt`** in `data/components.json`, with an "Other components" note in `SKILL.md`. The error decision tree is unchanged.
- **`references/tone.md`,** tone by context for five user states (frustrated, confused, confident, cautious, successful). Loaded only for emotional or high-stakes copy.
- **`references/voice-chart.md`,** a fillable voice chart template with a worked example.
- **`references/figma.md`,** a workflow for reviewing copy from a Figma link.
- **`--target N` flag** for `scripts/ari.mjs`. Optional. Default output is unchanged.
- **Eval cases 09 to 15,** plus an optional `audience` field in `evals/cases.json`.

### Changed

- **Version bump:** `1.5.0` → `1.6.0`
- The Target line in both output formats is now `Target: ARI ≤ N (Grade X, <tier> tier)`. The checklist item for reading level now checks against the audience tier.
- Principle 1's example no longer uses "Click here", which conflicts with `accessible-copy`.
- Case-07 in `evals/cases.json` also flags `accessible-copy` for its "Click here" CTA.
- Removed every em dash from the skill's own text, except the deliberate examples in `no-em-dashes` and the two eval inputs that test it.

---

## [1.5.0] - 2026-09-08

### Added

- **`data/rhetorical-devices.json`**: 9 literary/rhetorical devices (metaphor, simile, personification, epithet, metonymy/synecdoche, anaphora/epistrophe, allusion, paradox, anastrophe) curated for copy that's allowed personality: taglines, feature names, empty states, onboarding. Deliberately excludes idiom, invective, hyperbole, euphemism, pun, foreshadowing, oxymoron, apostrophe, and symploce, which are narrative/fiction devices or too easy to overuse in short-form product copy.
- **Principle 17, `rhetorical-devices`.** Query the new data file for personality-bearing surfaces only; explicitly out of scope for error messages, form fields, and system copy. Max one device per surface.
- **"Rhetorical device" line** added to both the review and new-copy output formats, and a "Personality" section added to the Review Checklist.

### Changed

- **Version bump:** `1.4.0` → `1.5.0`

---

## [1.4.0] - 2026-08-07

### Added

- **Stable `id` on every UX writing principle and every Error Message Guidelines rule** (e.g. `active-voice`, `error-decision-tree`), so a rule can be cited without depending on its position in the numbered list. Numbers shift when principles are added or reordered, ids don't.
- **Principle 16, `no-em-dashes`.** `references/email.md` already assumed a "no em dashes" core principle existed ("Apply all core Righter principles... no em dashes..."); it was never actually defined in `SKILL.md`. It is now.
- **Fallback branch in the error component decision tree**: "None of the above → Inline Alert", for copy that doesn't cleanly match any of the six existing questions.
- **`scripts/ari.mjs`**: deterministic ARI score, grade level, and word/character/sentence count calculator (`node scripts/ari.mjs "<copy>"`, `--before`/`--after` mode, or stdin). `SKILL.md`'s Reading Metrics section now points to it instead of asking for the multi-step formula to be computed by hand, which is error-prone done in-context.
- **`evals/cases.json`**: an 8-case regression corpus (copy paired with the rule ids a correct review should flag, plus expected component picks) for manually verifying that edits to principles, data files, or the decision tree don't silently change what the skill catches. Documented in a new "Maintaining This Skill" section in `SKILL.md`.

### Fixed

- `data/components.json`, `data/weakeners.json`, `data/phonaesthetics.json`: `source` fields corrected. They still pointed at the `references/*.md` files removed in 1.3.0 when this content moved to JSON.
- `data/weakeners.json`: filled in missing `example` pairs for four categories (`empty-intensifiers`, `vague-quantifiers`, `over-cautious-legalese`, `talking-about-talking`) that had none, so the skill has something to surface instead of improvising one.

### Changed

- **Version bump:** `1.3.1` → `1.4.0`

---

## [1.3.1] - 2026-07-23

### Fixed

- **MCP tool name/schema mismatch.** `SKILL.md` referenced `get_microcopy(context, copy_type)`, which doesn't match what's registered on the Vois MCP server. Corrected to `vois_get_microcopy(context, intent, constraints?)`. The real tool requires both `context` and `intent`, has no `copy_type` argument, and `constraints.placement` (optional) is the closest equivalent.

---

## [1.3.0] - 2026-07-23

### Changed

- **Converted prose reference data to structured JSON:** `data/weakeners.json`, `data/phonaesthetics.json`, `data/components.json` (full conversions of the former `references/*.md` files), and `data/email-benchmarks.json` (split off the numeric benchmarks in `references/email.md`). Behavior unchanged. Only how the skill retrieves reference data changes, from reading a file top to bottom to looking up by id/category.
- Removed `references/weakeners.md`, `references/phonaesthetics.md`, `references/components.md`, all fully superseded by their JSON conversions (verified 1:1 sentence coverage before deleting; no code examples or narrative content left behind).

---

## [1.2.0] - 2026-07-21

### Changed

- **Standalone-safe:** `vois_get_microcopy` is now optional. Call it if available in the environment, otherwise apply the skill's principles directly with a documented fallback path. Removed the hard dependency on `vois-router`/`vois-loop`; the skill now reads and runs standalone, with no MCP server required.

---

## [1.1.0] - 2026-05-23

Initial tracked version. Core skill covering the UX writing principles (active voice, reading level, jargon, sentence structure, double negatives, contractions, tense, user-goal framing, interface references, terminology, progressive disclosure, apologies, exclamation marks, prepositions, weakeners), Error Message Guidelines with a component decision tree, Phonaesthetics guidance for labels and CTAs, ARI reading-level scoring, and product transactional email rules (`references/email.md`).
