# Tray Specs

A tray is a transient bottom surface that walks the user through steps, one job at a time, over the screen they came from. This file says how to build one: the container and its resize, then how it opens, hands over to a full screen, and closes. Pick the pattern with `vois-patterns/references/motion.md` first. The shared rules in `motion-morphs.md` apply here: one duration token per move, overlap and never sequence, newest state wins, reduced motion has a fallback. Helpers (`trayPlan`, `alignLabels`) are in `motion-logic.md`. Every timing and easing value comes from a motion token.

## 1. Tray

Use for a transient surface that shows one step at a time from the bottom of the screen: a confirmation, then a warning, then a final confirm. A tray is a Drawer used as a sequence of steps (`JOB-OVERLAY-INTERACTION`). It keeps the screen behind it visible, which is its reason to exist. Long content, content with its own URL, or a task the user will stay in belongs on a full screen. The tray can hand over to one (Tray lifecycle, below).

**Behavior**

1. One container, one identity. A step change never unmounts the container `[DS-MOTION-004]`.
2. The container's bottom edge stays pinned. Its top edge moves to fit the new step.
3. The old step fades out and the new step fades in during the same move, inside one duration token.
4. Adjacent steps differ visibly in height, so the change reads. That is a content rule for the caller. If two steps would be the same height, change the content. Do not fake it with motion. The plan returns `none` when the heights match.
5. One job per step: one piece of content, or one primary action.
6. A title and one header icon that does two jobs. It is close on the first step and back on later steps, using the declared pair `close` to `back` (Icon morph in `motion-morphs.md`).
7. The theme follows the context. Inside a dark flow the tray is dark.
8. A tap, a keypress or a back action during a swap is honoured at once. The newest step wins, and the swap continues from where it is `[DS-MOTION-006]`.
9. Focus moves to the new step's heading or first control after the swap ends, never during it. The tray is a dialog. Focus returns to the trigger when it closes.

**How the height changes.** Transform and opacity only is the default rule, and a resize needs a way to follow it. Measured with a small benchmark kept in `prds/tray-benchmark/` (headless desktop Chromium under CPU throttling, so a proxy and not a phone):

| Order | Approach | Use when | Cost and catch |
|---|---|---|---|
| 1 | `clip-path`. Hold the larger of the two heights and animate the top edge with an `inset()` | Default | 4 layouts per swap, the same class as an instant resize. Missed frames matched the instant baseline within noise. It clips `box-shadow`, so put the shadow on a wrapper outside the clipped element |
| 2 | Transform. Lay out at the final height, take the outgoing step out of flow, and animate a `scaleY` from `from / to` with the content counter-scaled | The project already uses Motion layout | 5 layouts per swap. Rounded corners distort unless the library corrects them. The longest single frames in the heavy case (33ms at 6x throttle, 83ms at 12x) |
| 3 | Instant resize with a crossfade | Reduced motion, or no approach holds frame rate on the target device | 3 layouts per swap. Always acceptable |
| 4 | Animate `height` | Content that cannot be measured before the swap | About 19 layouts per swap against 3 to 5. That is 1.6 to 2.2 times the layout time on a light tray and 1.2 to 1.4 times on a heavy one, where the content swap dominates. Its missed frames were within noise of the others, so on a light tray it may be fine. It stays last because it does the most layout work and the test cannot see a phone |

The test did not separate the approaches on missed frames. The order above comes from layout work, single-frame spikes and visual fidelity.

Verify the chosen approach on a real iPhone and a mid-range Android before shipping. WebKit and Firefox were not benchmarked.

**Tokens:** swap and resize `--motion-duration-base`, easing `--motion-ease-standard`. A tray that covers most of the screen may use `--motion-duration-slow` while it enters (`DS-MOTION-002`).

**Reduced motion:** resize at once, crossfade the content.

## 2. Tray lifecycle

Use with the Tray spec above for how a tray opens, hands over to a full screen, and closes.

**Behavior**

1. **Open.** The backdrop dims first, then the tray rises from the trigger's edge. Grow-from-trigger rules still apply to the origin. A shipped wallet's visible travel on open is about 100 to 150ms, so `--motion-duration-base` is plenty and the slow token is not needed.
2. **Context stays.** The tray overlays the current screen. It does not replace it. Choose a tray over a full screen when the user should still see where they came from, as with a swap approval that unfolds from the swap screen.
3. **Tray or full screen.**
   - Tray: transient, one job per step, a confirmation, a warning, a short explainer.
   - Full screen: long content, its own URL, a task the user will stay in.
   - A tray may start a longer flow and expand into a full screen as the flow grows. When it does, rounded corners flatten, the container grows to the full height, and the step content crossfades. Persisting art, such as a header illustration, stays as one element. Back reverses it. The expand may use `--motion-duration-slow` `[DS-MOTION-002]`.
4. **Button relocation.** When a screen's primary action opens a tray whose step has the same primary action, the button persists. It narrows to the tray's width and a secondary action fades in beside it. It is one element with one identity, handed over with `layoutId`. When the tray's button is a different action with different copy, use the label morph (Label and text morph in `motion-morphs.md`).
5. **Dismiss.** A close control, a tap on the backdrop, and Escape. The tray reverses the open. Do not make a swipe the only way out.

**Tokens:** open, dismiss and relocation `--motion-duration-base`. Expand to full screen `--motion-duration-slow`. Easing `--motion-ease-standard`.

**Reduced motion:** the tray fades in, the button swaps in place, the expand is an instant swap.

