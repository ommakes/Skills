# Motion Morph Specs

Specs for the three highest-value morphs. Pick the morph with `vois-patterns/references/motion.md` first. This file says how to build it.

These specs are complete enough to build from. `motion-logic.md` has the small pieces that are easy to get wrong (token reading, label split, digit keys, icon and direction plans, grow origin) as plain TypeScript to copy. Every timing and easing value comes from a motion token, read at runtime. Starter values are in `vois-tokens/references/animation.md`. A missing token means no motion, never an invented number.

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
- Distance (if used): `--motion-distance-short` (value: see `vois-tokens/references/animation.md`). Nothing else.

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

## 4. Icon morph

Use when one icon's job changes in place: menu to close, play to pause, chevron down to chevron up.

**Behavior**

- Only declared pairs get the morph. Each pair is named in the component's `morphs` list, for example `menu` to `close`. Anything else crossfades.
- A declared pair rotates one shared icon container from 90 degrees to rest, so the two states read as one icon turning. This is a rotation of one element, not a path morph. Do not claim path interpolation.
- A crossfade swaps the two icons in place with opacity only.
- Do not morph between unrelated shapes. A crossfade is the honest choice.

**Tokens:** duration `--motion-duration-fast`, easing `--motion-ease-standard`.

**Reduced motion:** instant swap.

## 5. Directional transition

Use when the user moves between peers: tabs, segments, steppers.

**Behavior**

- Direction comes from the index change. A move to a later peer enters from the right. A move to an earlier peer enters from the left.
- The slide distance is `--motion-distance-short`, a small fraction of the container, never the full width.
- A move made with a keyboard does not slide. It swaps instantly. `DS-ANIMATION-003` forbids animating keyboard-triggered changes, and repeated arrow-key moves feel slow when animated.
- Pointer moves slide. The caller must say which input caused the change.

**Tokens:** duration `--motion-duration-base`, easing `--motion-ease-standard`, distance `--motion-distance-short`.

**Reduced motion:** crossfade, opacity only, no slide.

## 6. Grow-from-trigger

Use for a short, transient panel tied to what the user just did: a confirmation, a small form, a menu.

**Behavior**

- The panel's transform origin is the trigger's position relative to the panel, so it appears to grow out of the control that opened it.
- Start the panel at a scale of 0.9 or more. Never start from scale 0 (`DS-ANIMATION-005`). Animate to scale 1 with opacity.
- Stacked panels must differ visibly in height so progress reads. This is a content rule for the caller, not a motion rule.
- The panel needs a clear way out: a close control, and Escape to close. The caller owns this, but the spec requires it.
- Long content, content with its own URL, or a stay of more than a moment belongs on a full screen, not a grown panel.

**Tokens:** duration `--motion-duration-base`, easing `--motion-ease-standard`.

**Reduced motion:** fade in place. The transform origin does not apply.

## 7. Reorder motion

Use when the user sorts, groups, or drags a list and needs to see where items went.

**Behavior**

- Items travel to their new positions with transform. No item teleports.
- No stagger in this version. A stagger adds delay to every item, and the cap would be zero anyway until a use case needs one.
- Layout changes that are not caused by the user (live data arriving) do not animate, unless the list is the one the user is looking at and the change is small.

**Tokens:** duration `--motion-duration-base`, easing `--motion-ease-standard`.

**Reduced motion:** instant reposition.

## Still not specced

Nothing else in the motion decision test lacks a spec. New morph types need a spec before code.
