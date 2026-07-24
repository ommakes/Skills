# Anti-Slop / AI-Tell Rules `[DS-SLOP]`

The rest of this skill checks whether UI is *correct* — tokens, spacing,
accessibility. These rules check whether UI is *generic* — the layout and
styling defaults that make AI-generated work instantly recognizable regardless
of whether it passes every other rule.

A screen can pass the entire Pre-Submit Checklist and still read as slop: a
centered hero over a purple-to-blue gradient, three identical feature cards, an
uppercase eyebrow above every section. None of that violates a spacing or color
token. It violates *taste*.

**These interact with the taste dials.** Several rules only fire above a
`VARIANCE` threshold — a deliberately symmetric, low-variance product UI is not
slop, but a symmetric marketing page that *defaults* to centered-everything is.
Read the dial before flagging. If no dials were passed in, assume the mid
defaults (V/M/D = 5/4/5).

Most of these are judgment-only — a regex can't tell a purposeful centered hero
from a lazy one. `scripts/detect.mjs` mechanically flags only `DS-SLOP-002`
(the AI gradient), advisory-only. Everything else you grade by reading the code.

---

## The rules

### `[DS-SLOP-001]` Centered-everything as a default
When `VARIANCE > 4`, a full-width centered hero (centered headline + centered
subtext + centered single CTA, everything stacked mid-column) is the single most
common AI layout default. Reach for split-screen, asymmetric, offset, or
scroll-pinned structures instead. Centered is a *choice* you make for a reason
(a focused auth screen, a genuine single-action moment), not the thing you land
on because nothing pushed you off it.

### `[DS-SLOP-002]` The AI gradient *(mechanically detected, advisory)*
Purple/violet/indigo → blue/indigo/cyan gradients — as backgrounds, as
`bg-clip-text` gradient headline text, or as CSS `linear-gradient()` between two
of those hues — are the visual signature of template output. The detector flags
the common Tailwind and CSS forms. A brand that genuinely owns this gradient can
waive it (`ignore-rule DS-SLOP-002` or an inline disable), but it is never a
default reach. If color needs to do work, use the workspace's own accent tokens.

### `[DS-SLOP-003]` Three equal feature cards
The three-identical-cards-in-a-row grid (`grid-cols-3`, same icon slot, same
title length, same body, same everything) is a tell. Real feature sets are
uneven — vary card sizes, promote the primary one, use a bento/asymmetric grid,
or drop the grid entirely if there are only three things to say.

### `[DS-SLOP-004]` Eyebrow overuse
The uppercase, letter-spaced "eyebrow" label above a heading is fine once. It
becomes a tell when it sits above *every* section. Cap it at roughly **one per
three sections**. If every section has one, they've stopped meaning anything.

### `[DS-SLOP-005]` Emoji as UI iconography
Emoji standing in for real icons — as feature-card glyphs, list bullets, or
button affordances — reads as placeholder work. Use the icon set (see
`references/iconography.md`). Emoji in *content the user authored* is fine; emoji
the interface ships as its own chrome is not.

### `[DS-SLOP-006]` Zigzag repetition
Alternating image-left / image-right / image-left "zigzag" content sections are
fine up to **two in a row**. A third consecutive one must break the pattern —
change the layout family, go full-bleed, or cluster differently. Endless zigzag
is what an agent produces when it has one layout idea and N sections to fill.

### `[DS-SLOP-007]` Spec-sheet tables for marketing
A multi-row `divide-y` table with a label column and a value column, used to
present features or plans on a marketing surface, is boilerplate. Use grouped
2-column cards, scroll-snap pills, or clustered stats instead. (This does not
apply to genuine data tables in product UI — those are governed by
`vois-patterns` table/list patterns.)

### `[DS-SLOP-008]` Symmetry as the only rhythm
Every section the same width, same padding, same alignment, same vertical
rhythm, top to bottom. Even at low `VARIANCE`, a page needs *some* change in
pace — a full-bleed break, a tighter cluster, a wider gutter. Uniformity from
top to bottom is a tell even when each individual section is fine.

### `[DS-SLOP-009]` Em-dash as an AI tell — *scoped, judgment-only*
This is a deliberate, scoped stance, not a blanket ban (some other skills ban the
em-dash outright; Vois does not).

- **In typographic UI and editorial/prose content** where punctuation is being
  set with care — em-dashes are correct and encouraged. `—` is a real
  typographic mark; using it well is craft, not slop. This is consistent with
  the rest of `references/typography.md` (curly quotes, real ellipsis).
- **In generated marketing/body copy** — a high density of em-dashes (multiple
  per paragraph, em-dash as the default connector for every clause) is a
  recognizable generated-text signature. When it reads that way, restructure:
  a period, a colon, or a rewrite is usually stronger than a third em-dash.

Judgment-only by design — the mechanical detector cannot tell a well-set
editorial dash from a slop one, so it does not try. Route any copy this rule
touches through **righter**, which owns the final call on prose.

### `[DS-SLOP-010]` Card-ifying everything
Wrapping every section, list, or grouped set of fields in its own
bordered-and-shadowed "card" container is a default reach for structure that
hasn't been earned. A drop shadow is a cue for *interactivity* — it belongs on
things a user picks up, hovers, or acts on (buttons, draggable items,
popovers, dropdown menus), not on static page sections used purely to group
content. Visual alignment and a consistent spacing rhythm are usually enough
to signal "these belong together" on their own. Reach for a card only when the
content genuinely needs to look liftable or separable from the page (a
dashboard widget, a draggable item) — not as the default container for every
group.

### `[DS-SLOP-011]` Over-styled active/selected states
A colored left border plus a corner radius on an active sidebar or nav item is
a combination that gets uglier the more it's compounded — stacking a border
and a drop shadow on top of it makes it worse, not more polished. Hover,
selected, and active navigation states rarely need more than a subtle
background-color or text-color shift to read clearly. Reserve borders and
shadows for cases that need a stronger, more literal separation; don't reach
for them as the default way to mark "this one is active."

---

## Pre-submit additions

Fold these into the build's Pre-Submit pass alongside the main checklist:

- [ ] No centered-everything default above `VARIANCE 4` `[DS-SLOP-001]`
- [ ] No purple/indigo→blue "AI gradient" as a default `[DS-SLOP-002]`
- [ ] Feature groups aren't three identical cards in a row `[DS-SLOP-003]`
- [ ] Eyebrows capped at ~1 per 3 sections `[DS-SLOP-004]`
- [ ] No emoji standing in for real icons `[DS-SLOP-005]`
- [ ] No more than 2 consecutive zigzag sections `[DS-SLOP-006]`
- [ ] No spec-sheet table on a marketing surface `[DS-SLOP-007]`
- [ ] Page has some change in pace, not uniform top to bottom `[DS-SLOP-008]`
- [ ] Em-dash density appropriate to context (righter owns prose) `[DS-SLOP-009]`
- [ ] No default card-ifying of static sections; drop shadow reserved for interactive elements `[DS-SLOP-010]`
- [ ] No left-border + corner-radius combo (especially with a shadow) on active nav/sidebar items; use a subtle color shift instead `[DS-SLOP-011]`
