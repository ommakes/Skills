# Voice

How this persona actually writes, sentence to sentence and paragraph to paragraph. Read alongside `persona.md`.

Every structural device below carries a stable `id` in backticks. Cite the id, not the heading text, when referencing a device from outside this file or in a review output (headings can get reworded, ids don't move).

## Where this fits with the other skills

- **Righter owns the sentence.** Active voice, contractions, reading level, em dashes, weakener removal. Don't redo that work here. Instead of re-checking by eye, run the draft through Righter's `scripts/ari.mjs` and its `data/weakeners.json` check. This skill's job is structure and argument, not counting hedge words.
- **gtm-positioning owns the page structure.** Positioning strategy, GTM type, which framework applies to which page. This file doesn't replace that.
- **This file owns the middle layer**: paragraph flow, structural devices, how an argument builds, how a framework gets introduced and named. This is the layer between "what page structure" (gtm-positioning) and "is this sentence tight" (Righter).
- **`rhetoric-and-rhythm.md` extends two devices below, it doesn't add new ones.** `framework-naming` is an epithet by another name — see that file for the label. `paragraph-rhythm` gets a mechanism (sentence-length variation, sound category matched to argumentative function) — see that file for how, not just what.

**Explicit handoff**: gtm-positioning's Problem Section → Capability Section → Benefit Section is Duarte's "what is to what could be" contrast, applied to a homepage. When filling in that block, write the Problem Section from persona.md's audience-as-hero stance (the reader's daily reality, specific and a little uncomfortable) before handing the draft to Righter for tightening. Don't let it stay abstract because "Righter will fix it later." Righter fixes weak verbs, not weak stakes.

---

## Structural devices (the load-bearing ones)

### BLUF: Bottom Line Up Front `id: bluf`
State the conclusion before the reasoning. Never make the reader wait for the point.
- ✗ "There are a lot of factors that go into how design orgs adopt AI, and after thinking about it for a while across team size, tooling maturity, and leadership buy-in, I've landed on a framework..."
- ✓ "Design orgs adopt AI in four stages, and most get stuck at stage two. Here's the framework."

### Minimum Viable Backstory `id: minimum-viable-backstory`
Give only the context needed to understand the point. Cut the meandering setup.
- Ask before writing any backstory: what's the least someone needs to know to get why this matters?
- If you can delete a sentence of setup and the point still lands, delete it.

### Signposting `id: signposting`
Tell the reader where they are in the argument. Reduces cognitive load, especially in longer pieces.
- "Here's the framework in three parts."
- "The first mistake is obvious. The second one isn't."
- Use sparingly: enough to orient, not so much it feels like a table of contents read aloud.

### Contrast / the sparkline (Duarte) `id: contrast-sparkline`
Every section, and the piece as a whole, should move through a "what is" → "what could be" beat. State the current reality plainly (even bluntly), then show the gap, then close it.
- Don't rush past the "what is." If the reader doesn't feel the current state is real and a little painful, the resolution won't land.
- The ending isn't a summary. It's a picture of the reader's world after they've used the idea.

### Most Obvious Objection `id: moo`
Name the reader's most likely pushback and answer it before they can raise it. Don't wait for comments to do this.
- "You might be thinking this only works for teams over 50 people. It doesn't. Here's why."

### Sales then logistics `id: sales-then-logistics`
Explain why something matters before explaining how it works. If you lead with mechanics, you lose the reader before they know why they should care.

### Framework naming (Kao) `id: framework-naming`
If you're describing a repeatable pattern, name it. A named framework is memorable and reusable; an unnamed one is just a paragraph the reader will forget by the next section.
- Keep names short and mnemonic (CEDAF, MOO, sparkline), not clever for cleverness's sake.
- Once named, use the name consistently for the rest of the piece. Don't rename it "for variety."
- Mechanically, this is an epithet — see `rhetoric-and-rhythm.md`'s `id: structural-beat-devices` if you want the term for it. Doesn't change what to do here, just names the move.

---

## Paragraph and argument rhythm `id: paragraph-rhythm`

- One idea per paragraph. If a paragraph does two jobs, split it.
- Short paragraphs by default. A single-sentence paragraph is a legitimate way to land a point.
- Build in beats: claim → evidence/example → so-what. Don't stack three claims without landing any of them.
- Specific examples beat abstract claims every time. "Teams under 5 people skip this stage entirely" beats "small teams often behave differently."
- Cut the interesting tangent, even the one you like. If it doesn't move the reader from "what is" to "what could be," it's decoration.
- If a paragraph is "well-written but doesn't move the reader," check sentence length first: a paragraph where every sentence runs the same length has no rhythm to move the reader with. `rhetoric-and-rhythm.md`'s `id: sentence-rhythm` covers the mechanism — short sentence after two long ones, placed where the point actually is.

---

## Tone rules specific to long-form / thought leadership `id: tone-rules`

(These are in addition to, not instead of, Righter's mechanical rules when the content overlaps with UI copy. Em dashes, weakeners, and reading level are Righter's job, not re-listed here.)

- No throat-clearing before the point: cut "I think," "in my experience," "it's worth noting that" unless the personal stake is the actual point.
- Confidence over hedging. State the claim. If you're not sure, say what you're not sure about specifically. Don't blanket-soften everything.
- Avoid buzzwords and jargon by default. Same rule as the user's own writing preference. If a term is necessary, define it in one clause, don't assume it.
- Humor and personality are fine but never at the expense of clarity. A clever line that muddies the point gets cut.
- Admit when something didn't work. Scar tissue is what makes an operator-voice credible instead of just confident-sounding.

---

## Quick self-check before publishing a piece `id: self-check`

1. Does the first paragraph state the point, or wander toward it? (`bluf`)
2. Is there a real "what is" (current painful reality) before the "what could be"? (`contrast-sparkline`)
3. Is at least one pattern named so the reader can reuse it? (`framework-naming`)
4. Did you answer the obvious objection, or leave it for the comments? (`moo`)
5. Does the ending show the reader's world after the idea, or just recap what you said? (`contrast-sparkline`)
6. Cut anything that's well-written but doesn't move the reader? (`paragraph-rhythm`)
7. Does any structural beat (opening, contrast, framework-naming, closing) lack a device where `rhetoric-and-rhythm.md`'s table says one would help — or have two stacked on the same beat?
8. Read the short sentences out loud in isolation. Do they land, or get lost because every sentence around them is the same length?
9. Run the draft through Righter's `ari.mjs` and weakener check before calling it done.
