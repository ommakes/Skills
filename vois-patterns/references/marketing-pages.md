# Marketing Pages [PATH-G]

Reference for `vois-patterns`. Read this when the goal is "show people what a product or business offers before they sign up": a landing page, homepage, or product marketing page.

**These are taste rules for marketing surfaces, not general laws.** They come from one reference site (america.gov) and one mockup (a local gym). They suit a short, focused page. A pricing page (`pricing-pages.md`, `[PATH-F]`), a docs page, or an app screen can break them for good reasons.

**Routing:**
- All words go to `righter`, which owns the slot limits (`righter/references/marketing-copy.md`). `gtm-positioning` decides what to say.
- Type scale and spacing go to `vois-tokens` (`references/marketing-type-and-spacing.md`, `DS-MKT`).
- Component picks go to `vois-components`.
- Pricing sections inside a marketing page follow `[PATH-F]`.

Marketing pages sit in the spacious tier of `content-density.md` (`[PATH-DENSITY-SPACIOUS]`). This file says what spacious means on a marketing page: tight text, loose sections, little content per section.

---

## The pattern `[PATH-G]`

Every feature block is the same stack: image, short title, one or two sentences, one underlined link. Sections are far apart and the text inside them is close together. Left-aligned by default.

Spacing alone does not make a page breathe. Content per section does.

## Rules

### One idea per section `[PATH-G-SECTION]`
One heading, one block of content, one link. If a section needs two headings, it is two sections.

### Three blocks max `[PATH-G-BLOCKS]`
No row or stack has more than three blocks. If there are more, group them. Five programs become three audience tiles, and the detail moves behind a link. Three is a ceiling, not a target. The blocks should still differ in size or emphasis (`DS-SLOP-003` in `vois-tokens`).

### Detail goes behind a link `[PATH-G-DETAIL]`
Full schedules, bios, and long FAQs live on their own pages. The homepage shows a taste: about 5 schedule rows, one coach sentence, 3 questions, each with a link to the rest.

### Image tile first, text second `[PATH-G-TILE]`
Each feature block is a large rounded image tile, then a title, then one or two sentences, then one link. Tiles are at least 300px tall on mobile.

### No dividers `[PATH-G-DIVIDERS]`
Don't use hairlines, boxes, or borders to separate sections. If sections blur together, increase the gap. The ratio is in `DS-MKT-006`.

### Left-align by default `[PATH-G-ALIGN]`
Center only the closing call to action. A centered hero is the default `DS-SLOP-001` warns about.

### One primary button per view `[PATH-G-CTA]`
A secondary button is allowed in the hero only. Repeat the primary call to action at most twice on a page: the hero and the close. Everything else is a plain link. One label for the action across the whole page (`righter`: `mkt-one-name-per-thing`).

### Footer repeats the nav at heading scale `[PATH-G-FOOTER]`
Large links at h2 size plus the wordmark. Small print stays small.

---

## Layout lint

Run before the page ships. Copy items are in `righter/references/marketing-copy.md`.

- [ ] Each section has one heading, one block of content, and one link.
- [ ] No row or stack has more than three blocks.
- [ ] No dividers, hairlines, or boxed sections.
- [ ] Section gaps are at least 4x the heading-to-content gap (`DS-MKT-006`).
- [ ] No more than two primary calls to action on the page.
- [ ] Left-aligned, except the closing call to action.
- [ ] Long lists (schedules, bios, FAQs) show a taste and link out.

## Before and after

A gym site, before and after (same page, different structure):

| Block | Before | After |
|---|---|---|
| Programs | Five text cards in two groups | Three image tiles: kids, adults, women only |
| Schedule | 21 rows across 6 days | 5 upcoming classes plus a link |
| Coaches | Five headshots with names | One group photo, one sentence, one link |
| FAQ | 13 questions | 3 answered, plus a link to all |
| CTAs | Three labels for one action | One label, used at most twice |
