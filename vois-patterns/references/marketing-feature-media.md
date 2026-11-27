# Marketing Feature Media `[PATH-M]`

Reference for how to show product UI, screenshots, photos, and illustrations inside marketing feature blocks. Read this when a marketing page (`[PATH-G]`) needs more than a flat image tile: device chrome, split rows, triptychs, bento grids, focal callouts, or scroll motion.

**These are taste rules for marketing surfaces, not general laws.** A docs page, in-app upsell, or product UI can break them for good reasons.

**Routing:**
- Page structure and section rules stay in `marketing-pages.md` (`[PATH-G]`). This file picks the media treatment inside those sections.
- Frame radius, chrome padding, backdrop shapes, and marketing-media motion go to `vois-tokens` (`DS-MKT-009` to `DS-MKT-011`, plus `DS-ANIMATION-*` and `DS-MOTION-*`).
- Component picks (device frame shells, motion primitives) go to `vois-components`.
- Words go to `righter`.

---

## The pattern `[PATH-M]`

One treatment per section. Pick from what the section must show, not from decoration alone. A split row for one screenshot, a triptych for three parallel claims, a bento when one section must show two unlike UI states.

## Builds on marketing pages `[PATH-M-BUILDS-G]`

When the page follows `[PATH-G]`, section rules still apply: one idea per section, three blocks max, no dividers, left-align. This file only changes how the media inside a feature block is composed. Do not add a fourth block just to show chrome or a backdrop.

## Pick a treatment

### Centered hero media `[PATH-M-TREATMENT-CENTERED]`

One large media piece centered in the section with copy above or below. Use when the section has a single focal screenshot, illustration, or UI chrome block and no side-by-side row. Phone: stack copy then media. Do not use for three equal claims; use triptych or bento.

### Triptych `[PATH-M-TREATMENT-TRIPTYCH]`

Three equal columns. Each column is media, then a short title, then one or two sentences. Respects the three-block ceiling in `[PATH-G-BLOCKS]`. The three columns should still differ in crop, emphasis, or content (`DS-SLOP-003`). Phone: stack the three.

### Split row `[PATH-M-TREATMENT-SPLIT]`

Two columns: media on one side, copy on the other. Alternate sides down the page on desktop. Phone: media first, then copy (same order as `PATH-PAGE-FEATURE`). Use for one feature per row with a tall screenshot or device mockup.

### Bento grid `[PATH-M-TREATMENT-BENTO]`

Two or three tiles in one section with unlike sizes (one large, one or two smaller). Use when the section must show more than one UI state but still counts as one idea. Never three identical tiles (`DS-SLOP-003`). Phone: stack with the largest tile first.

## Frame `[PATH-M-FRAME]`

Put screenshots and photos in a rounded frame. Marketing feature media uses a larger radius than everyday product cards. Photo tiles stay at least 300px tall on mobile (`PATH-G-TILE`). See `[DS-MKT-009]`.

## Chrome `[PATH-M-CHROME]`

Product UI shown as marketing media gets a simplified browser, window, or device frame. Crop to the job; do not ship a full OS desktop. The frame is decoration around the screenshot, not a second screenshot. See `[DS-MKT-010]`.

## Blend `[PATH-M-BLEND]`

A soft shape or gradient behind the frame so the media meets the page background without a hard rectangle. One backdrop color family per section. Do not stack competing blobs behind one frame.

## Motion `[PATH-M-MOTION]`

Marketing media may enter once on scroll (fade or short rise). One motion per section, under `[DS-ANIMATION-001]`. Motion must not loop. Use motion to reveal a focal callout, not to autoplay video.

## Reduced motion `[PATH-M-REDUCED-MOTION]`

When `prefers-reduced-motion` is set, show the final frame with no entrance motion and no looping decoration. Focal callouts stay static. See `[DS-MKT-011]`.

## Focal callout `[PATH-M-FOCAL]`

When a screenshot needs one control highlighted, add a static callout (ring, magnifier, or label), not a second full screenshot. One focal point per frame. Under reduced motion, the callout does not pulse.

---

## Layout lint

- [ ] Treatment matches what the section must show (centered / triptych / split / bento)
- [ ] Still at most three blocks when `[PATH-G]` applies (`PATH-M-BUILDS-G`)
- [ ] Frames use marketing radius (`DS-MKT-009`)
- [ ] Product UI in marketing media uses chrome when it represents the product (`DS-MKT-010`)
- [ ] Reduced motion shows the final state (`DS-MKT-011`)