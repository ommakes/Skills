# Motion Morph Specs

Specs for the core motion patterns: label and text morph, shared element transfer, number ticker and typed input, icon morph, directional transition, grow-from-trigger, reorder and regroup, status button. Pick the pattern with `vois-patterns/references/motion.md` first. This file says how to build it.

Two more files hold the rest, so each loads only when its pattern is chosen: `motion-tray.md` (a tray and how it opens, expands and closes) and `motion-context.md` (what surrounds a travelling element, chart range change, collapse to indicator, small state changes).

These specs are complete enough to build from. `motion-logic.md` has the small pieces that are easy to get wrong (token reading, label alignment, digit keys, typed input, fit to width, series morphing, input source, icon and direction plans, grow origin, tray plan) as plain TypeScript to copy. Every timing and easing value comes from a motion token, read at runtime. Starter values are in `vois-tokens/references/animation.md`. A missing token means no motion, never an invented number.

All the specs share these rules:

- Transform and opacity first. Do not animate width, height, top, or left. The exceptions are named in the spec that needs them: `filter` blur for the content a travelling element leaves behind (`motion-context.md`), `clip-path` for a tray's height, and one last-resort height fallback (`motion-tray.md`).
- A morph runs inside one duration token. Old and new overlap. Never run out for one token and then in for another `[DS-MOTION-003]`.
- Reduced motion gives an instant swap, or a crossfade where the morph carries information.
- A new value during a morph wins. The component shows the newest state with no stuck or half-finished frame. A transition retargeted mid-flight continues from where it is `[DS-MOTION-006]`.
- The user can keep typing, tapping, and navigating while the morph runs.

## 1. Label and text morph

Use when a label changes and keeps some of its text: Save to Saved, Review order to Submit order, Craft to Creative, Confirm to Confirm Slippage. Also use for a page title or a one-line empty-state sentence when most of it stays (Manual Backup to Confirm Backup).

**Behavior**

1. Split the old and new text into grapheme clusters, not UTF-16 code units. Use `Intl.Segmenter` so emoji and combining marks stay whole.
2. Align the two with `alignLabels` in `motion-logic.md`. It finds the longest common subsequence of graphemes. Each grapheme is `stay` (in both), `leave` (old only) or `enter` (new only). Shared letters can sit anywhere in the word. A shared prefix and suffix are the simple case of the same alignment.
3. Crossfade the whole text instead of morphing when `alignLabels` says `morphs: false`. It says so when fewer than half of the shorter text's graphemes stay, when no two stays are adjacent in both texts, or when either text is longer than 48 graphemes. Splitting letters in those cases reads as noise (`Continue` to `Pay $42`, `Cancel` to `Confirm`).
4. Otherwise run one move. Stay graphemes travel to their new positions with transform. They are not frozen, because the text re-centres or an icon takes space, so they have to move. Leave graphemes fade out and rise by `--motion-distance-short`. Enter graphemes fade in from the same distance below. All of it runs together inside `--motion-duration-base`.
5. Leaving graphemes may finish fading slightly after the move ends, through the opacity curve and never a second duration. On a shipped iOS wallet the move takes about 170ms and the last leaving letters trail by about 100ms.
6. An icon that appears or disappears with the label scales from 0.9 and fades over the same token. It takes its space with the text, so the stay graphemes slide to make room. Never from scale 0 `[DS-ANIMATION-005]`.
7. A label with a number (`Add 1 Wallet`, `Add 2 Wallets`) splits into words and number. The words go through `alignLabels`. The number goes through the digit keys from section 3, so only the digit that changed rolls.
8. Cap a title or sentence at about six words. Above that, crossfade.
9. Right-to-left text: the same alignment works because the segments are logical, not visual. Test with an Arabic or Hebrew string.

**Accessibility**

- Expose the final text once, in a visually hidden element. Set the visual layer `aria-hidden`.
- Never expose the leaving or entering segments on their own.

**Tokens**

- The whole morph: `--motion-duration-base`.
- Easing: `--motion-ease-standard`.
- Distance: `--motion-distance-short`. Nothing else.

**Web note.** Stay graphemes need one element each, keyed by their index in the new text. Motion's `layout` does the travel. Without a library, measure each before and after and animate the difference (FLIP).

**Reduced motion:** swap instantly.

## 2. Shared element transfer

Use when the same element exists in two states: an avatar moving from a list row into a profile header, an amount moving from a card to a summary. `motion-context.md` covers what happens around the element (Shared element context).

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

## 3. Number ticker and typed input

Two cases. They look alike and behave differently.

### Live data (the ticker)

Use when a value updates from live data: a usage meter, a running count, a balance that refreshes.

**Behavior**

- Format with `Intl.NumberFormat.formatToParts` so the separators, decimal, and currency symbol come from the locale.
- Key each digit by its place value counted from the decimal point (`keyedNumberChars`). Unchanged places keep their key and do not animate.
- Animate only the digits that changed, using a short vertical roll.
- Rate limit: if updates arrive faster than about two per second, skip the roll and show the final value. A roll that never finishes is worse than none.
- Announce the final value once, in a polite live region, after updates settle. Do not announce each digit.

**Tokens:** roll duration `--motion-duration-fast`, easing `--motion-ease-standard`.

### Typed input

Use when the user types a number into a field: an amount, a quantity, a PIN length. Each keypress is the user's own action and should show what it did.

**Behavior**

1. Key the digits by the order they were typed, counted from the left (`keyedTypedChars`). Appending a digit adds one new key. It does not change the keys of the digits before it. Keying by place from the decimal, as the ticker does, would make every digit roll on every keypress.
2. Only the entering digit animates. It enters from below behind a mask, over `--motion-duration-fast`. A deleted digit exits downward behind the same mask. A digit replaced at the same key swaps the same way. No rate limit: the user sets the pace.
3. Separators are elements. A thousands separator has its own key by group, counted from the right. When it appears it enters like a digit. When it already exists it glides to its new position as the digits around it move. The decimal point works the same way.
4. The whole figure re-centres as it grows or shrinks. The characters that stay glide to their new positions with transform, as in section 1.
5. Fit to width. As the number gets longer the type scales down to stay inside its container. Use `fitScale` from `motion-logic.md`. The scale is continuous, not stepped, and never goes below the minimum the caller sets.
6. A secondary figure under the main one (a converted amount) updates with the ticker, because it is data derived from the input.
7. An invalid value (over a balance) changes the helper line and eases the action to its disabled look (see `motion-context.md`). The digits' motion never replaces the message, and the message is never a joke.
8. Accessible output: use a real input, or `role="spinbutton"` with `aria-valuenow`. The visual digit layer is `aria-hidden`. A polite live region announces the value after the user pauses, not each digit. Never hide the keypad behind the animation.

### Scrub (a chart or slider the finger drags)

- The header values follow the finger and the digits roll as in the ticker. On release they return to the resting figures with the same roll.
- A change of sign flips the arrow (a 180 degree rotation) and eases the colour in the same move. The sign also stays in the text, never resting on colour or the arrow alone.

**Reduced motion:** instant swap. The live region still announces the final value.

## 4. Icon morph

Use when one icon's job changes in place: menu to close, play to pause, chevron down to chevron up, close to back.

**Behavior**

- Only declared pairs get the morph. Each pair is named in the component's `morphs` list, for example `menu` to `close`, or `close` to `back` for a tray header that closes on its first step and goes back on the later ones. Anything else crossfades.
- A declared pair rotates one shared icon container from 90 degrees to rest, so the two states read as one icon turning. This is a rotation of one element, not a path morph. Do not claim path interpolation.
- A crossfade swaps the two icons in place with opacity, scale and a small blur. The exact values are in `vois-tokens/references/surfaces.md` (`DS-SURFACE-014`). Use that for every pair that is not declared here.
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
- Speed follows how often the move happens. A tab bar or segmented control uses `--motion-duration-fast`, or `--motion-duration-instant` for a very busy one (a shipped wallet's tab switch is about 100 to 150ms). A stepper, used once in a flow, uses `--motion-duration-base`.

**Tokens:** duration by frequency as above, easing `--motion-ease-standard`, distance `--motion-distance-short`.

**Reduced motion:** crossfade, opacity only, no slide.

## 6. Grow-from-trigger

Use for a short, transient panel tied to what the user just did: a confirmation, a small form, a menu. This is one panel. For a surface with several steps, use the tray in `motion-tray.md`.

**Behavior**

- The panel's transform origin is the trigger's position relative to the panel, so it appears to grow out of the control that opened it.
- Start the panel at a scale of 0.9 or more. Never start from scale 0 (`DS-ANIMATION-005`). Animate to scale 1 with opacity.
- Stacked panels must differ visibly in height so progress reads. This is a content rule for the caller, not a motion rule.
- The panel needs a clear way out: a close control, and Escape to close. The caller owns this, but the spec requires it.
- Long content, content with its own URL, or a stay of more than a moment belongs on a full screen, not a grown panel.

**Tokens:** duration `--motion-duration-base`, easing `--motion-ease-standard`.

**Reduced motion:** fade in place. The transform origin does not apply.

## 7. Reorder and regroup

Use when the user sorts, groups, filters, or drags a list and needs to see where items went.

**Behavior**

- Items travel to their new positions with transform. No item teleports.
- **Regroup.** When the user groups or filters, the items that stay travel to their new positions, new group headers fade in, and items that leave the set fade out. Show the move: it is what explains the new structure.
- **Multi-select drag.** When a drag starts with several rows selected, the selected rows gather into one stack under the pointer. On drop the stack fans out into the new positions. The action bar for the selection rises when the first row is selected and leaves when the last is cleared.
- **No stagger.** A stagger adds a delay to every item. Items that land at slightly different times because they travel different distances are fine. That is distance, not delay.
- Layout changes that are not caused by the user (live data arriving) do not animate, unless the list is the one the user is looking at and the change is small.

**Tokens:** duration `--motion-duration-base`, easing `--motion-ease-standard`.

**Reduced motion:** instant reposition. The action bar appears without a slide.

## 8. Status button

Use when a button shows the result of its own action: idle, working, done. A save, a submit, a booking. If the button's surface is about to be replaced, see Collapse to indicator in `motion-context.md`.

**Behavior**

- Three states: the label, a working indicator, a done mark. Each change crossfades in place. A label, a spinner and a check are not related shapes, so none of them morphs into another.
- Stack the states in one grid cell. The button keeps its size while they fade, and its width does not change.
- The change from working to done also moves the fill. The button's color blends to the success color over the same duration while the check fades in where the indicator was. This is one motion, not two.
- The done mark scales from 0.9 to 1 with opacity. Never from 0 (`DS-ANIMATION-005`).
- Transition the background color on the button itself. If the button library reads its fill from a CSS variable, switch that variable on a wrapper element.
- The button is never disabled while it works or shows done. A disabled button loses focus. Ignore clicks in those states instead.
- Hold the done state for 500ms at most before the next screen replaces the button, so the mark can be read. This is the one exception to the slow confirmation anti-pattern in `vois-patterns/references/motion.md`: the action has already succeeded and the mark is the confirmation. Skip the hold for high-frequency actions.
- A failure returns to the label state at once. Do not play the done mark, and do not use the success color.
- If the button library hides its content while loading, or sets its own busy and disabled attributes, render the three states yourself and use a status line.

**Accessibility**

- The button's accessible name follows the state: for example `Book now`, `Booking…`, `Booked`. The visual layer is `aria-hidden`.
- Announce each change once, in a polite live region next to the button, not inside it.
- Focus stays on the button. The animation never moves focus.
- Do not rely on color alone. The check carries the meaning.

**Tokens**

- Crossfade, fill blend and the check's scale: `--motion-duration-base`, easing `--motion-ease-standard`.
- Success color: the project's success color token, never a literal.
- The hold is not a motion token. Name it as a constant in the component.

**Reduced motion:** the fill and the icon change at once. The done state still holds for the same time, because it carries information.

## Still not specced

Nothing else in the motion decision test lacks a spec. Delight (easter eggs, loops, confetti) has tiers and rules in `vois-patterns/references/motion.md` and `[DS-MOTION-007]`, and no build spec, because each one is a one-off. New morph types need a spec before code.
