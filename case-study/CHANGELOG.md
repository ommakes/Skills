# Changelog

All notable changes to the Case Study skill are documented here.

---

## [1.0.0] - 2026-10-18

### Added

- **Skill added to this repository.**
- **Write mode** (`id: write-flow`): guided multiple choice questions, one at a time with a recommended option first, that build a portfolio case study teaser in a headline format with no generic section labels (`id: teaser-format`). The recommended length is 100 to 150 words and is advisory (`id: length-advisory`).
- **Review mode** (`id: review-flow`): critiques a teaser or full case study and returns edits with the principle applied, plus a list of claims it cannot verify.
- **Evidence checks** (`id: evidence-checks`): baselines on every percentage, results that prove the stated goal, and an arithmetic check on stated gains.
- **Source files** (`id: source-files`): looks for persona.md, voice.md and rhetoric-and-rhythm.md (the `longform` skill has all three), and offers a five-question quick setup when none exist (`id: quick-setup`).
- **Righter pass** (`id: righter-pass`): routes the final draft to `righter` for sentence mechanics only (`data/weakeners.json`, `scripts/ari.mjs`). The Grade 5 UI copy target does not apply to portfolio pieces.
