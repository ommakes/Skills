# Context and State Specs

Four patterns that surround or follow the core morphs: what happens around an element that travels, a chart that changes range, a button that collapses to an indicator, and the small state changes that should not snap. Pick the pattern with `vois-patterns/references/motion.md` first. The shared rules in `motion-morphs.md` apply here. Helpers (`morphSeries`, `keyedNumberChars`) are in `motion-logic.md`. Every timing and easing value comes from a motion token.

## 1. Shared element context

Use with Shared element transfer in `motion-morphs.md` when an element travels between full views, so the eye follows it and the rest of the screen gets out of its way.

**Behavior**

1. **Context treatment.** The content the traveller leaves behind and the content that is covered dim, and may blur up to the `DS-SURFACE-014` value. Never blur the travelling element. Blur is the costliest of the properties the spec allows on low-end devices, so dim alone is acceptable `[DS-MOTION-005]`.
2. **Container expansion.** A row or card can become the page header. The traveller moves, its siblings dim and fade, and the new page's content fades in under the settled element.
3. **Shrink into depth.** When the next step is a deeper layer and not a sibling, the persistent element scales down (to 0.9 or more, never from 0) and fades behind the new step. Back reverses it.
4. **Symmetric.** Back carries the element home along the same path. If the home slot no longer exists, crossfade.
5. **Indicator hand-off.** A pending state that goes on after its surface closes (a spinner, a progress mark) travels to where the user can find it next: a nav item, or the original card. It keeps one identity across the hand-off. If the destination is off screen, skip the travel and show the indicator at the destination.
6. **One at a time.** One shared element travels on a screen. Two only when they are a pair, such as an amount and its unit.

**Tokens:** the travel `--motion-duration-slow` for a large element such as a card (`DS-MOTION-002`), and `--motion-duration-base` for a small one such as a spinner. The dim and blur ramp `--motion-duration-base`. Easing `--motion-ease-standard`.

**Reduced motion:** crossfade in place. No blur. The dim ramp is no longer than a fade.

## 2. Chart range change

Use when the user changes what a chart shows: a range (1D, 1W, 1M, 1Y), a filter, a series. The user asked for the change, so the chart shows it. This is not a refetch. Refetch, polling and live appends stay as `DV-A11Y-008` says.

**Behavior**

1. The line morphs from the old series to the new one inside the plot. Resample both series to the same number of points and interpolate between real points (`morphSeries` in `motion-logic.md`). Interpolation never overshoots the data. Never draw a spline between points. If either series has fewer than two points, crossfade.
2. The selected range pill slides to its new segment.
3. Digits in the header (price, delta) roll with the ticker in `motion-morphs.md`. The delta colour eases between its states, and the sign stays in the text.
4. Axis labels fade. They do not slide.
5. The whole move runs in `--motion-duration-fast`. A shipped wallet's range change measures about 100 to 150ms.
6. The chart is still readable with the motion off: the new series, the new labels and the new header values are correct on the first frame of the end state.

**Reduced motion:** crossfade the plot, swap the header at once.

## 3. Collapse to indicator

Use only when a committing action replaces its surface: confirming a transaction, then the screen goes away and the result lives somewhere else. Everywhere else, use the status button in `motion-morphs.md`.

**Behavior**

1. The button eases to its disabled look, narrows to a pill, then to a circle that holds a spinner, all in one move. This takes about 100 to 150ms on a shipped wallet.
2. The indicator then travels to the place the result will appear (Shared element context, indicator hand-off). That is a second, separate move. It starts when the surface closes and runs over the screen the user returns to, so the user never waits for it. The wait is the collapse alone. It keeps one identity.
3. The button is still never disabled in the DOM while it works. Ignore taps instead, so focus is not lost. The accessible name follows the state (`Confirm`, `Confirming…`).
4. A failure returns the surface to its normal button at once. No success colour.
5. If the surface will not be replaced, or the indicator has nowhere to go, do not collapse. Use the status button.

**Tokens:** `--motion-duration-fast` for the collapse, easing `--motion-ease-standard`. The hand-off uses the shared element tokens (a spinner is small, so `--motion-duration-base`). Each of the two moves runs inside one token `[DS-MOTION-003]`.

**Reduced motion:** the button swaps to the indicator at once.

## 4. Small state changes

Use for the small changes around a component, so none of them snaps.

**Behavior**

- **Disabled to enabled.** A control that becomes available eases its tint over `--motion-duration-fast`. It stays focusable under the status button rules.
- **Progress segments.** A segmented step indicator slides its active fill to the next segment, and back. Duration `--motion-duration-fast`.
- **Placeholder to value.** A skeleton, or a `$0.00` placeholder, resolves to the real value with a crossfade of `--motion-duration-fast`. Reserve the space first so nothing moves.
- **Toast.** A short confirmation that drops in after a surface closes. It holds long enough to read, leaves on its own, and never covers an action. Easing `ease` (`vois-tokens/references/animation.md`).

**Reduced motion:** every one of these becomes an instant change.

