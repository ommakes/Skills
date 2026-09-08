# longform

A Claude skill that applies a consistent persona and voice to long-form writing — essays, blog posts, LinkedIn and newsletter pieces, and the narrative sections of a GTM page — so drafts don't read like generic AI output.

---

## What it does

Built on two fused frameworks:

- **Nancy Duarte's storytelling structure** — the reader is the hero, not the writer. Every piece moves through a "what is" (current, uncomfortable reality) → "what could be" (better state) arc, and the gap between them has to feel real before the piece offers the bridge across it.
- **Wes Kao's operator-voice frameworks** — state the conclusion before the reasoning (BLUF), cut backstory to the minimum needed, name repeatable patterns so they're memorable and reusable, and answer the reader's most obvious objection before they raise it.

A third file, `references/rhetoric-and-rhythm.md`, maps literary devices (metaphor, anaphora, epithet, paradox, etc.) onto the structural beats those frameworks already create — the opening, the contrast beat, framework naming, the closing line — and extends phonaesthetics (sound choice) from single words up to sentence and paragraph rhythm. Restraint is the throughline: most beats get no device at all, and stacking more than one per beat reads as trying too hard.

---

## How it composes with the other writing skills

Three skills, three layers — each one owns a layer, none duplicate the others:

| Layer | Skill | Owns |
|---|---|---|
| Page/asset structure | `gtm-positioning` | Which framework applies to which page, positioning strategy, GTM type |
| Argument/narrative | **longform** | How the argument builds, contrast, framework naming, paragraph flow |
| Sentence mechanics | `righter` | Active voice, reading level, weakeners, em dashes, contractions |

For a standalone essay or post, apply this skill start to finish, then run the finished draft through Righter's `scripts/ari.mjs` and `data/weakeners.json` check before calling it done — no need to hand-check for em dashes or hedge words yourself. For a GTM asset (homepage, landing page), run `gtm-positioning` first for page structure, write the Problem and Benefit sections with this skill's persona and contrast device, then hand the draft to Righter for sentence-level tightening.

---

## How to use it

1. Ask to write, draft, edit, or review an essay, blog post, LinkedIn post, or newsletter piece — or a GTM page's narrative sections
2. The skill reads `references/persona.md` (stance and reader), `references/voice.md` (structural devices), and `references/rhetoric-and-rhythm.md` (device + rhythm layer) before writing or reviewing
3. A review walks the piece against `voice.md`'s 9-item self-check and flags gaps by citing the relevant `id` (`bluf`, `contrast-sparkline`, `framework-naming`, `moo`, `paragraph-rhythm`, plus the rhetoric/rhythm checks), then folds in Righter's mechanical pass
4. A fresh draft is delivered directly — no need to narrate which device was used where unless asked

Every structural device and rhetorical device carries a stable `id` (in backticks) so it can be cited from outside the file without depending on heading text.

---

## Files

- `SKILL.md` — entry point: workflow steps, output formats, how this composes with `gtm-positioning` and `righter`
- `references/persona.md` — who the writer is, what they believe, who they're writing for
- `references/voice.md` — structural devices (BLUF, contrast/sparkline, Most Obvious Objection, framework naming, etc.) and paragraph rhythm rules
- `references/rhetoric-and-rhythm.md` — literary/rhetorical devices mapped to structural beats, plus sentence- and paragraph-level phonaesthetics
- `CHANGELOG.md` — version history
