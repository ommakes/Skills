# Rhetoric and Rhythm

Two things long-form prose needs that microcopy mostly doesn't: a device that makes a point *stick*, and a rhythm that makes a paragraph *readable out loud*. This file couples both, because they're solving the same problem from two directions — the device gives the sentence a shape, the sound makes that shape easy to read.

This is Righter's `data/phonaesthetics.json` scaled up: that file picks sounds for a single word (a label, a CTA). Here, the same sound logic applies across a sentence or a paragraph — same categories (plosives, liquids/nasals, sibilants), bigger unit.

**Restraint is the whole game.** A piece with a device in every paragraph reads like it's trying to win a debate tournament, not make a point. One device per structural beat, max — and most beats get none. If you're not sure whether a device earns its place, cut it.

---

## Where devices belong: structural beats, not sentences

Don't scatter devices through the body. Reach for one at the moments the piece is already built around — the ones named in `voice.md`:

| Beat (from `voice.md`) | Device that fits | Why |
|---|---|---|
| Opening (`id: bluf`) | Paradox, or a single sharp metaphor | The first line has to be quotable. One compressed idea beats three explained ones. |
| The "what is" (`id: contrast-sparkline`) | Metonymy/synecdoche | Naming the old world through one concrete, associated detail makes it feel real instead of abstract — exactly what `contrast-sparkline` already asks for. |
| Naming a pattern (`id: framework-naming`) | Epithet | A framework needs a name that's actually memorable enough to get repeated later. That's an epithet by another name — treat it as one. |
| Body / transitions | Anaphora or epistrophe, sparingly | Three short parallel lines to build momentum into a section pivot. Needs 3 lines minimum or it doesn't read as a pattern — see caution below. |
| Closing line | Anastrophe, or epistrophe echoing the opening | The line most likely to get quoted on its own. Worth the highest-visibility device, exactly once. |

Anything not on this list — allusion, personification, simile — is fair game if it genuinely serves a specific sentence, but it isn't tied to a beat the way the ones above are. Use judgment, and default to leaving it out.

`id: rhetoric-restraint` — no more than one device per beat above, no device introduced outside a beat, no piece with more than 3–4 total.

---

## Device notes (prose-scale, not microcopy-scale)

`id: structural-beat-devices`

- **Metaphor** — in long-form, a metaphor can run the length of a paragraph or even the whole piece (the "space between us" framing is an extended metaphor, not a one-liner). Commit to it once you start it; don't mix a second metaphor into the same passage.
- **Simile** — lighter commitment than metaphor. Use where you want the comparison without carrying it forward.
- **Metonymy / synecdoche** — the fastest way to make an abstraction concrete. "The handoff meeting" standing in for the entire waterfall process is synecdoche doing real work.
- **Epithet** — this is `framework-naming` from `voice.md`. Don't treat it as a separate step; when you name a pattern, you're already doing this.
- **Anaphora / epistrophe** — repetition at the start or end of 3+ consecutive short clauses. Reads as a device only at 3 or more; 2 just looks like coincidence, 5+ gets sing-song.
- **Allusion** — only when you're certain the specific audience shares the reference. Riskier in long-form than microcopy because a wrong allusion doesn't just fall flat, it signals you misjudged the reader.
- **Paradox** — one per piece, and it's usually the opening or closing line, not a body sentence.
- **Personification** — useful for describing systemic forces (the market, the org, AI itself) as having agency, without literally claiming they do. Good for the "what could be" side of a contrast beat.
- **Anastrophe** — reserve for exactly one closing line, if any. It's the highest-visibility device on this list; using it twice in one piece cancels the effect of both.

Deliberately left off this list (same reasoning as Righter's cheat-down): idiom, invective, hyperbole, euphemism, pun, oxymoron, foreshadowing, apostrophe. Mostly narrative-fiction tools, or they read as trying too hard in expository prose. Irony and symbolism aren't devices you insert — they're properties of a well-told contrast, already covered by `contrast-sparkline`.

---

## Sentence and paragraph rhythm

`id: sentence-rhythm`

Phonaesthetics for a sentence isn't about one word's sound, it's about variation across the sentence — the prose equivalent of trochaic stress in a product name.

- **Vary sentence length on purpose.** A short sentence after two long ones lands like a stress beat. This is the actual mechanism behind `paragraph-rhythm` in `voice.md` — if a paragraph isn't "moving the reader," check whether every sentence in it is roughly the same length first.
- **Put the short sentence where the point is.** Long sentences build the case; a short one delivers the verdict. Don't bury the short sentence in the middle of a long paragraph.
- **Read the closing line of any beat out loud.** If it trips going into it, the rhythm is off before the words are.
- **Alliteration and assonance are for exactly one line** — usually the same line carrying the beat's device (see table above). Scattered through a paragraph, they read as unintentional; concentrated in one line, they read as a choice.

### Mapping sound to argumentative function

Same categories as `phonaesthetics.json`, applied to what a passage is *doing* rather than what a label is *naming*:

- **Plosives (p, b, t, d, k, g), front-loaded in a sentence** → punch, verdict, the "what could be" side of a contrast. Good for closing lines.
- **Liquids and nasals (l, m, n, r, w, y), sustained across a sentence** → reflective, diagnostic, the "what is" side of a contrast. Good for setting up the problem before the turn.
- **Sibilants (s, sh, z)** → use sparingly in analytical prose; they soften a line, which is rarely what a thought-leadership argument wants at its turning points.

`id: sound-symbolism-prose` — if a beat's device already dictates a mood (paradox = punch, contrast-sparkline's "what is" = reflective), let the sound category reinforce it instead of fighting it. A punchy paradox wrapped in liquid, drawn-out consonants undercuts itself.

---

## Self-check

Items 7 and 8 of `voice.md`'s `id: self-check` cover this file directly — no separate checklist to run. If you're reviewing a draft, that numbered list is the one to walk.
