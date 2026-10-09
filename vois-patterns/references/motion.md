# Motion: When State Changes Should Move

Read this when a design has any of these:

- A button, label, or icon changes meaning after the user acts
- An element appears on two consecutive screens or states
- A number changes value
- A panel, sheet, or tray opens from something the user just tapped
- A list reorders, groups, or filters
- A request says "smooth", "animation", "transition", or "polish"

Skip motion that does no job. If you cannot say what the user learns from it, leave it out.

Timing and easing values come from motion tokens. See `vois-tokens/references/animation.md` for the token names and the rules that check them. This file decides what moves and why. `vois-components/references/motion-morphs.md` has the component specs.

## The one rule

**Never change something statically if the user needs to understand what changed.**

| Situation | Behavior |
|---|---|
| The element exists before and after | It **travels**. It does not vanish and reappear. |
| The element changes meaning | It **morphs**. The parts that stay the same stay put. |
| Neither applies | A short crossfade, or nothing. Fast and static is allowed. |

## Decision test

Run these in order. Stop at the first yes.

1. Does the same element appear in the next state? Use a **shared element transfer**.
2. Does a label change in a way that raises the stakes or changes the step? Use a **label morph**.
3. Does an icon change to show a new action in place (menu to close, play to pause)? Use an **icon morph**.
4. Does a number change? Use a **number ticker**.
5. Does the user move sideways between peers (tabs, segments, steppers)? Use a **directional transition**.
6. Does a transient panel open from the control that triggered it? Use **grow-from-trigger**.
7. Does a list reorder or regroup because of the user? Use **reorder motion**.
8. None of the above: a crossfade at the fast duration, or nothing.

## Morph types

| Type | Use when | Do not use when | Reduced motion |
|---|---|---|---|
| Label morph | The new label keeps some letters and changes the step (Save to Saved) | The strings share nothing, it changes more than once a second, or it sits in a dense table | Instant swap |
| Shared element | A card, amount, or avatar exists in both states | The element is different content with the same shape | Crossfade in place, no travel |
| Icon morph | The icon's job changes in place | The two icons are unrelated shapes | Instant swap |
| Number ticker | A value updates from input or live data | It updates more than about twice a second. Show the final value. | Instant swap |
| Directional | Moving between peers shows direction | The move came from a keyboard | Crossfade |
| Grow-from-trigger | A short, transient panel tied to what the user just did | The content is long, needs its own URL, or the user will stay | Fade in place |
| Reorder | The user sorts, groups, or drags and needs to see where things went | The list is static | Instant reposition |

## Worked examples

**Label morph: "Save" becomes "Saved".** The strings share the prefix "Save". Keep "Save" still, animate only the added "d". Nothing else moves.

**Label morph: "Review order" becomes "Submit order".** The strings share the suffix " order". Keep " order" still and animate "Review" out and "Submit" in. The step changed, so the label should show it.

**Label morph with no overlap: "Continue" becomes "Pay $42".** Nothing is shared, so the label crossfades. Splitting the letters here would look like noise.

**Number ticker: "$1,240.00" becomes "$1,310.00".** Only the digits that changed move. The "$", the comma, the decimal point, and the ".00" stay still. Screen readers hear the final value once, after updates settle.

**Shared element: an avatar in a row opens into the profile header.** One element, one identity, travels from the row to the header. Never leave a copy fading in the header while the row copy fades out. That is the duplicate anti-pattern.

**Directional: Overview to Billing.** Billing is to the right, so the content slides left. Going back slides right. A keyboard arrow move does not slide. See the accessibility rules below.

**Grow-from-trigger: a "Remove seat?" confirmation.** The panel grows out of the Remove button. It is transient, has one job, and has a clear Cancel. A full settings section would be a page, not a panel.

## Frequency and emphasis

Delight scales inversely with how often something happens.

- Daily, high-frequency actions: small, quick, quiet. A number ticker or a label morph. The tenth use should not feel slower than the first.
- Rare, high-importance moments such as first setup or finishing something significant: room for more expressive motion, still inside the duration caps.

Polish has to be even. A rarely used screen that is static beside a smooth one looks neglected. Use the lightest morph that fits, not zero.

## Accessibility (required for every morph)

1. **Reduced motion.** Respect `prefers-reduced-motion`. Every type above has a fallback. Reduced motion removes movement, never information.
2. **No meaning in motion alone.** The final state must read correctly from a still frame.
3. **Screen readers.** Expose the final state once. Never announce intermediate frames or single letters. Hide the animated layer from assistive tech.
4. **Input is never blocked.** A user can act during any transition. An interruption resolves to the newest state.
5. **Focus stays put.** A morphing button keeps focus. A morph never moves focus or breaks keyboard order.
6. **Duration ceiling.** Nothing user-blocking runs longer than the slow duration token. The slow token is for large elements only (see `DS-MOTION-002`).
7. **No flashing.** Nothing flashes more than three times a second.
8. **Keyboard moves do not slide.** Animating a keyboard-triggered change is what `DS-ANIMATION-003` forbids. Keyboard users repeat actions, and repeated animation feels slow to them.

## Anti-patterns

- **Duplicate during transition.** The same card fades out in one place while a copy fades in elsewhere. Users see two things.
- **Motion for its own sake.** No stated user benefit means cut it.
- **Teleporting persistent elements.** A header or card that jumps to a new position with no travel loses its identity.
- **Slow confirmation.** A morph that adds delay to a payment, a delete, or a submit. The confirmation must feel immediate.
- **Per-letter animation on every label.** Reserve label morphs for moments that matter. Used everywhere, they become noise.
- **Bounce on serious actions.** Use no overshoot on destructive or financial confirmations.
- **Inconsistent timing.** Two similar transitions with different durations. Use the tokens.
- **Rewriting copy to fit a morph.** If the copy needs to change, route it through righter first. Never change the words only so the animation looks better.

## Quick check

- [ ] The motion answers "what changed?" or "where did it go?"
- [ ] Persistent elements travel. Changing elements morph.
- [ ] Timing and easing come from tokens only
- [ ] Reduced-motion fallback defined
- [ ] The final label is exposed once, to assistive tech
- [ ] Focus preserved, input not blocked
- [ ] Label pairs approved by righter
- [ ] Intensity matches how often the feature is used
