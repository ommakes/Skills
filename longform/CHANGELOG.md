# Changelog

All notable changes to the Longform skill are documented here.

---

## [1.2.0] — 2026-09-08

### Added

- **Skill added to this repository for the first time.** It previously existed only as a personal synced skill (`thought-leadership-writer`), never tracked in any git repo — so this entry covers both "added to the repo" and the content changes below.
- **`references/rhetoric-and-rhythm.md`** — literary/rhetorical devices (metaphor, simile, personification, epithet, metonymy/synecdoche, anaphora/epistrophe, allusion, paradox, anastrophe) mapped onto `voice.md`'s existing structural beats (opening, contrast, framework-naming, closing). Also extends phonaesthetics from word-level sound (Righter's `data/phonaesthetics.json`) to sentence- and paragraph-level rhythm — sentence-length variation, sound category matched to argumentative function.
- **Self-check items 7 and 8** in `voice.md` (`id: self-check`), covering structural-beat devices and reading short sentences in isolation. Old item 7 ("run the draft through Righter's `ari.mjs`") moved to item 9.
- **`references/persona.md`** — cited throughout `SKILL.md` and `voice.md` but missing from the initial update package and from this repo's history. Supplied separately and added so the skill is actually complete.

### Changed

- `SKILL.md`'s workflow and review output format now reference `rhetoric-and-rhythm.md` (steps 3–4 of "Writing a new piece," steps 4–5 of "Reviewing an existing draft," and a new "Rhetoric and rhythm" line in the review output).
- `voice.md`'s "Where this fits with the other skills" section and `framework-naming`/`paragraph-rhythm` entries note where `rhetoric-and-rhythm.md` extends them.
- **Skill renamed:** `thought-leadership-writer` → `blog-righter` → `longform`. The middle name collided in spirit with the existing `righter` skill (UI copy) despite doing something unrelated (long-form narrative writing); `longform` describes the format instead of overlapping another skill's name. No other file in the repo referenced any earlier name.
- **Version bump:** `1.1.0` → `1.2.0`

---

## [1.1.0] — date not tracked

Initial version. Not tracked in this or any repository at the time — it existed only as a personal synced skill, so no prior changelog exists and the original creation date is unknown. Reconstructed from that version for this changelog's baseline: core persona (Nancy Duarte's storytelling structure fused with Wes Kao's operator-voice frameworks), structural devices in `voice.md` (`bluf`, `minimum-viable-backstory`, `signposting`, `contrast-sparkline`, `moo`, `sales-then-logistics`, `framework-naming`), paragraph and argument rhythm rules, tone rules for long-form writing, and a 7-item self-check.
