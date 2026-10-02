# Marketing Type and Spacing `[DS-MKT]`

Type scale and spacing for marketing surfaces: landing pages, product marketing, public site pages. Product UI keeps `[DS-TYPOGRAPHY]` and `[DS-SPACING]` as written.

Structure rules for these pages (one idea per section, three blocks max, no dividers) are in `vois-patterns/references/marketing-pages.md`. Word limits are in `righter/references/marketing-copy.md`.

**These are taste rules for marketing surfaces, not general laws.** A pricing comparison, a docs page, or an app screen can break them for good reasons.

## Scope `[DS-MKT-001]`

Apply this file only to marketing surfaces. Everywhere else, the product type scale and the 4 to 96px spacing scale win.

## Where the numbers come from

The scale is modeled on america.gov and was estimated from a downscaled mobile screenshot. Mobile ratios are estimates and desktop values are extrapolated. The section gaps (144 mobile, 240 desktop) are deliberately larger than the roughly 80 to 90px gaps measured on that site. They were chosen by eye on one mockup, a local gym site.

So the **ratios** below are the rules. The **pixel values** are starting points. Adjust them per site and keep the ratios.

## Type

Two roles, set by the brand. Both can be the same family at different weights.

| Role | Token | Carries |
|---|---|---|
| Display face | `--font-heading` | Display and h2 only |
| Text face | `--font-body` | Everything else |

Two voices `[DS-MKT-002]`: the display face is for display and h2 only, never below 28px. The text face carries h3, lead, body, and small.

One display and one h2 `[DS-MKT-003]`: one display headline per page, one h2 per section.

Muted text colors hold 4.5:1 against their background (see `accessibility.md`).

Starting scale `[DS-MKT-004]`:

| Style | Face | Mobile (size/line) | Desktop (size/line) | Weight | Use |
|---|---|---|---|---|---|
| display | display face | 40/44 | 72/76 | 400 | Hero headline only. Tracking -2%. |
| h2 | display face | 28/34 | 44/50 | 400 | Section heads, closing block |
| h3 | text face | 20/26 | 24/30 | 500 | Card and feature titles |
| lead | text face | 18/26 | 20/30 | 400 | Hero sub, section intros |
| body | text face | 16/24 | 17/26 | 400 | Descriptions, FAQ answers |
| small | text face | 14/20 | 15/22 | 400 to 600 | Links, meta, footer |

17px and 15px are not on the product type scale. They are allowed here only. Define them as properties in your own theme, not as raw values in components (`[DS-TYPOGRAPHY-005]`). Headings keep `text-wrap: balance` (`[DS-TYPOGRAPHY-006]`).

Body width `[DS-MKT-005]`: cap body text at `56ch`. This replaces `65ch` from `[DS-TYPOGRAPHY-008]` on marketing surfaces. Headings may run narrower.

## Spacing (8px base)

Starting values:

| Gap | Mobile | Desktop |
|---|---|---|
| Section to section | 144 | 240 |
| Section heading to its content | 32 | 64 |
| Tile to tile (stacked or in a row) | 64 | 32 |
| Heading to body | 12 | 16 |
| Body to link | 16 | 16 |
| Image to text | 24 | 24 |
| Button to button | 12 | 16 |

Section gap ratio `[DS-MKT-006]`: the gap between sections is about 4x the gap between a section heading and its content, and 12 to 15x the gap between a heading and its body text. If a page feels cramped, widen the section gap first, then cut content. Do not add dividers to compensate.

Tight text, loose sections `[DS-MKT-007]`: the gap inside a block is smaller than the gap between blocks. If they match, the page reads as one pile.

Above the product ceiling `[DS-MKT-008]`: on marketing surfaces, section-to-section gaps may go above 96px, up to 240px, in steps of 8. This is an exception to the allowed-values list in `spacing.md`. The divisible-by-4-or-8 rule in `[DS-SPACING-001]` still holds. Use a spacing token, not a bare number (`[DS-SPACING-003]`).

## Pre-submit (marketing surfaces only)

- [ ] Display face used only for display and h2, never below 28px `[DS-MKT-002]`
- [ ] One display headline per page, one h2 per section `[DS-MKT-003]`
- [ ] Body text capped at `56ch` `[DS-MKT-005]`
- [ ] Section gap at least 4x the heading-to-content gap `[DS-MKT-006]`
- [ ] Gaps inside a block smaller than gaps between blocks `[DS-MKT-007]`
