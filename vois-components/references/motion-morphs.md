# Motion Morph Specs

Specs for the three highest-value morphs. Pick the morph with `vois-patterns/references/motion.md` first. This file says how to build it.

Reference implementations live in the Vois app repo (`src/components/motion/` and `src/lib/motion/`) and are tested there. Copy the behavior, not the file paths. Every timing and easing value comes from a motion token, read at runtime. A missing token means no motion, never an invented number.

All three specs share these rules:

- Transform and opacity only. Do not animate width, height, top, or left.
- Reduced motion gives an instant swap, or a crossfade where the morph carries information.
- A new value during a morph wins. The component shows the newest state with no stuck or half-finished frame.
- The user can keep typing, tapping, and navigating while the morph runs.

## 1. Label morph

Use when a label changes and keeps some of its text: Save to Saved, Review order to Submit order.

**Behavior**

1. Split the old and new label into grapheme clusters, not UTF-16 code units. Use `Intl.Segmenter` so emoji and combining marks stay whole.
2. Find the longest shared prefix and the longest shared suffix. The two may not overlap in the same string.
3. If the shared prefix plus suffix is empty, crossfade the whole label. Do not split it.
4. Otherwise, keep prefix and suffix still. Animate only the differing middle out (old), then in (new). Out runs for the duration token, then in runs for the same token.
5. Right-to-left text: the same split works because the segments are logical, not visual. Test with an Arabic or Hebrew string.

**Accessibility**

- Expose the final label once, in a visually hidden element. Set the visual layer `aria-hidden`.
- Never expose the middle segments on their own.

**Tokens**

- Out and in durations: `--motion-duration-base`.
- Easing: `--motion-ease-standard`.
- Distance (if used): `--motion-distance-short`. Nothing else.

**Reduced motion:** swap instantly.

## 2. Shared element transfer

Use when the same element exists in two states: an avatar moving from a list row into a profile header, an amount moving from a card to a summary.

**Behavior**

- Give the element one shared identity across both states (a `layoutId` in Motion, or the equivalent in other libraries).
- Render exactly one instance of that identity in any frame. Two instances with the same identity is the duplicate anti-pattern.
- Move with transform. The library's layout animation uses transform for size and position changes, which is allowed.
- If the target does not exist in the next state, fall back to a crossfade. Never animate to a point that is not rendered.
- Account for scroll position and containers with overflow. If the element sits in a scrolling list, measure the target after the scroll settles.

**Tokens**

- Duration: `--motion-duration-slow` (large elements only, see `DS-MOTION-002`).
- Easing: `--motion-ease-standard`, read as a cubic-bezier and handed to the library.

**Reduced motion:** crossfade in place, no travel.

## 3. Number ticker

Use when a value updates from user input or live data: a cart total, a usage meter, a running count.

**Behavior**

- Format with `Intl.NumberFormat.formatToParts` so the separators, decimal, and currency symbol come from the locale.
- Key each digit by its place value counted from the decimal point. Unchanged places keep their key and do not animate.
- Animate only the digits that changed, using a short vertical roll.
- Rate limit: if updates arrive faster than about two per second, skip the roll and show the final value. A roll that never finishes is worse than none.
- Announce the final value once, in a polite live region, after updates settle. Do not announce each digit.

**Tokens**

- Roll duration: `--motion-duration-fast`.
- Easing: `--motion-ease-standard`.

**Reduced motion:** instant swap. The live region still announces the final value.

## Next

The P1 morphs (icon morph, directional transition, grow-from-trigger, reorder) are not specced yet. Do not improvise them from this file. Use the decision rules in `vois-patterns/references/motion.md` and ask for a spec.
