# Motion: When State Changes Should Move

Read this when a design has any of these:

- A button, label, or icon changes meaning after the user acts
- An element appears on two consecutive screens or states
- A number changes value, or the user types one
- A panel, sheet, or tray opens from something the user just tapped
- A list reorders, groups, or filters
- A chart changes range or filter
- A request says "smooth", "animation", "transition", "delight", or "polish"

Skip motion that does no job. If you cannot say what the user learns from it, leave it out.

Timing and easing values come from motion tokens. See `vois-tokens/references/animation.md` for the token names and the rules that check them. This file decides what moves and why. `vois-components/references/motion-morphs.md` has the specs.

## The one rule

**Never change something statically if the user needs to understand what changed.**

| Situation | Behavior |
|---|---|
| The element exists before and after | It **travels**. It does not vanish and reappear. |
| The element changes meaning | It **morphs**. The parts that stay the same stay, and move to their new places. |
| Neither applies | A short crossfade, or nothing. Fast and static is allowed. |

## Decision test

Run these in order. Stop at the first yes.

1. Does the same element appear in the next state? Use a **shared element transfer**, with its context treatment.
2. Does a button run an action and show its result (idle, working, done)? Use a **status button**. If the committing action replaces its surface, use **collapse to indicator**.
3. Does a label or short title change in a way that raises the stakes or changes the step? Use a **label morph**.
4. Does an icon change to show a new action in place (menu to close, close to back, play to pause)? Use an **icon morph**.
5. Does a number change? Live data uses the **number ticker**. A number the user types uses **typed input**.
6. Does the user move sideways between peers (tabs, segments, steppers)? Use a **directional transition**, at a speed that matches how often it happens.
7. Does a transient surface show a sequence of steps from the bottom of the screen, one job per step, over the screen the user came from? Use a **tray**.
8. Does a single transient panel open from the control that triggered it? Use **grow-from-trigger**.
9. Does a list reorder, regroup, or accept a drag because of the user? Use **reorder and regroup**.
10. Does the user change a chart's range, filter or series? Use a **chart range change**. A refetch or live update is not one.
11. Does a control change availability, a placeholder resolve to a value, or a progress step advance? Use a **small state change**.
12. None of the above: a crossfade at the fast duration, or nothing.

## Morph types

| Type | Use when | Do not use when | Reduced motion |
|---|---|---|---|
| Status button | A button runs an action and shows idle, working and done | The action has no visible result, or the library owns the loading state and you cannot render the states | Fill and icon change at once. The done state still holds. |
| Collapse to indicator | A committing action replaces its surface and the result lives elsewhere | The surface stays, or the indicator has nowhere to go | Swap to the indicator at once |
| Label morph | The new text keeps some letters and changes the step (Save to Saved, Craft to Creative) | Few letters match, it changes more than once a second, or it sits in a dense table | Instant swap |
| Shared element | A card, amount, or avatar exists in both states | The element is different content with the same shape | Crossfade in place, no travel |
| Icon morph | The icon's job changes in place | The two icons are unrelated shapes | Instant swap |
| Number ticker | A value updates from live data | It updates more than about twice a second. Show the final value. | Instant swap |
| Typed input | The user types a number | The value is not typed (use the ticker) | Instant swap |
| Directional | Moving between peers shows direction | The move came from a keyboard | Crossfade |
| Tray | A transient surface walks through steps over the current screen | The content is long, needs its own URL, or the user will stay | Resize at once, crossfade the content |
| Grow-from-trigger | A short, single transient panel tied to what the user just did | The content is long, has several steps, or needs its own URL | Fade in place |
| Reorder and regroup | The user sorts, groups, filters or drags and needs to see where things went | The list is static | Instant reposition |
| Chart range change | The user changes a chart's range, filter or series | A refetch, a poll or a live append | Crossfade the plot |
| Small state change | A control becomes available, a placeholder resolves, a step advances | The change is not visible to the user | Instant change |

## Worked examples

**Label morph: "Save" becomes "Saved".** The strings share the prefix "Save". Keep "Save" in place, animate only the added "d".

**Label morph: "Review order" becomes "Submit order".** The strings share the suffix " order". Keep " order" and animate "Review" out and "Submit" in, all in one move. The step changed, so the label shows it.

**Label morph, shared letters inside: "Craft" becomes "Creative".** C, r, a and t stay and slide to their new places while "e", "i", "v", "e" arrive and "f" leaves.

**Label morph with an icon: "Continue" becomes "Confirm".** "Con" stays and slides to make room for a scan icon that scales in. The step went from reading to committing, and the label shows it.

**Label morph with no overlap: "Continue" becomes "Pay $42".** Nothing is shared, so the label crossfades. Splitting the letters would look like noise.

**Status button: "Book now", a spinner, then a check.** The three states crossfade in the same spot and the button keeps its size. On success the fill blends to the success color as the spinner becomes the check. The check holds half a second at most, then the confirmation screen replaces the form.

**Collapse to indicator: confirming a transaction.** Confirm is the last tap and the screen is about to go. The button narrows to a circle holding a spinner, and the spinner travels to the activity tab where the pending transaction will appear.

**Number ticker: "$1,240.00" becomes "$1,310.00".** Only the digits that changed move. The "$", the comma, the point and ".00" stay put. Screen readers hear the final value once.

**Typed input: an amount field.** Each keypress adds one digit that rises in from below. A comma enters at four digits and glides right as more arrive. The figure shrinks a little to stay in the field. Deleting reverses it.

**Shared element: an avatar in a row opens into the profile header.** One element, one identity, travels from the row to the header. Never leave a copy fading in the header while the row copy fades out.

**Shared element with context: a wallet card opens into its detail.** The card travels to the header while the other cards dim and blur slightly. The detail rows fade in beneath it. Back carries the card home.

**Directional: Overview to Billing.** Billing is to the right, so the content slides left, and back slides right. A keyboard arrow does not slide. A tab bar tapped all day moves in about a tenth of a second. A stepper moves at the base speed.

**Tray: approving a swap.** Continue on the swap screen opens a tray over it that says why approval is needed. Continue again moves to a taller step with the amount and fee, and the same sheet grows to fit. One job per step. The corner icon closes on the first step and goes back on the second.

**Grow-from-trigger: a "Remove seat?" confirmation.** The panel grows out of the Remove button. It is transient, has one job, and has a clear Cancel. A settings section would be a page, not a panel.

**Regroup: grouping wallets.** The user turns groups on. Each card travels to its group, the headers fade in, and nothing teleports.

**Chart range change: 1D to 1W.** The line morphs to the new series, the selected pill slides to 1W, and the price and change figures roll, in about a tenth of a second. A refetch of the same range does none of this.

## Frequency and emphasis

Delight scales inversely with how often something happens.

- Daily, high-frequency actions: small, quick, quiet. A number ticker or a label morph. The tenth use should not feel slower than the first.
- Rare, high-importance moments such as first setup or finishing something significant: room for more expressive motion, still inside the duration caps.

Polish has to be even. A rarely used screen that is static beside a smooth one looks neglected. Use the lightest morph that fits, not zero.

### Delight tiers

Use the tier to decide how far to go. `DS-MOTION-007` sets the rules every tier follows.

| Tier | How often the user meets it | Examples | Rules |
|---|---|---|---|
| T1 detail | Daily | Commas gliding as a number is typed, an arrow flipping as a chart is scrubbed | Duration tokens only, under 300ms. Nothing that repeats on the tenth use |
| T2 moment | Weekly or less | A selection stack dropping into a bin, a shimmer on a hidden balance, a ripple on a QR code | The entrance may use the slow token. A loop is allowed only as an ambient sign of a mode, such as a hidden balance, never as decoration |
| T3 occasion | Rare and important | Confetti on finishing a backup, a long first-run sequence | May run longer than the slow token. Plays once. Can be skipped |

Every tier follows `DS-MOTION-007`: it never gates the task, a still frame carries the same meaning, a loop pauses under reduced motion and while the page is hidden, and an easter egg is absent under reduced motion rather than swapped. Text inside an easter egg goes through `righter`, and humor never appears in an error.

The MOTION dial in `vois-router` caps all of this. At 1 to 3 only crossfades and instant swaps are allowed, so T2 and T3 do not play.

## Accessibility (required for every morph)

1. **Reduced motion.** Respect `prefers-reduced-motion`. Every type above has a fallback. Reduced motion removes movement, never information.
2. **No meaning in motion alone.** The final state must read correctly from a still frame.
3. **Screen readers.** Expose the final state once. Never announce intermediate frames or single letters. Hide the animated layer from assistive tech.
4. **Input is never blocked.** A user can act during any transition. An interruption resolves to the newest state and continues from where the motion was.
5. **Focus stays put.** A morphing button keeps focus. A morph never moves focus or breaks keyboard order. A tray moves focus to the new step after the swap ends, and back to the trigger when it closes.
6. **Duration ceiling.** Nothing user-blocking runs longer than the slow duration token. The slow token is for large elements only (see `DS-MOTION-002`).
7. **No flashing.** Nothing flashes more than three times a second.
8. **Keyboard moves do not slide.** Animating a keyboard-triggered change is what `DS-ANIMATION-003` forbids. Keyboard users repeat actions, and repeated animation feels slow to them.

## Anti-patterns

- **Duplicate during transition.** The same card fades out in one place while a copy fades in elsewhere. Users see two things.
- **Motion for its own sake.** No stated user benefit means cut it.
- **Teleporting persistent elements.** A header or card that jumps to a new position with no travel loses its identity.
- **Slow confirmation.** A morph that adds delay to a payment, a delete, or a submit. The confirmation must feel immediate. The one exception is the status button's done hold, capped at 500ms.
- **Out, then in.** A label or icon that animates the old value away and only then the new one in. It doubles the time and breaks the duration cap `DS-MOTION-003`.
- **Per-letter animation on every label.** Reserve label morphs for moments that matter. Used everywhere, they become noise.
- **Bounce on serious actions.** Use no overshoot on destructive or financial confirmations.
- **Inconsistent timing.** Two similar transitions with different durations. Use the tokens.
- **Rewriting copy to fit a morph.** If the copy needs to change, route it through righter first. Never change the words only so the animation looks better.
- **A tray that remounts.** Each step opens a new sheet instead of one sheet changing `DS-MOTION-004`.
- **Blur on the traveller.** The element that moves is the one thing that stays sharp `DS-MOTION-005`.
- **Replaying a chart on refetch.** A user-chosen range morphs. A background refresh does not move at all.
- **Delight that gates the task.** An animation the user has to wait for before they can continue `DS-MOTION-007`.

## Remove the motion

Take the animation out of a flow and look at what is lost. This is the quickest way to tell a job from decoration.

1. For each transition, remove the motion. Does the user still know what changed, where it went, and what they are about to do?
2. If yes, the motion is decoration. Cut it, or move it down a tier.
3. If no, the motion has a job. Name it: orientation, continuity, confirmation or causality.
4. On a payment, a delete or a send, a missing motion that hides what happened is a finding.

## Quick check

- [ ] The motion answers "what changed?" or "where did it go?"
- [ ] Persistent elements travel. Changing elements morph.
- [ ] Timing and easing come from tokens only
- [ ] A morph runs in one token, not two in a row
- [ ] Reduced-motion fallback defined
- [ ] The final label is exposed once, to assistive tech
- [ ] Focus preserved, input not blocked
- [ ] Label pairs approved by righter
- [ ] Intensity matches how often the feature is used, and the tier is named
- [ ] Remove-the-motion test run on the flow
