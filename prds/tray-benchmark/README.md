# Tray resize benchmark

Phase 3 of `prds/vois-fluid-motion-gaps-prd.md`. It answers one question: when a tray changes height between steps, which way of animating the container is cheapest on the main thread while still looking right?

## What it compares

All four crossfade the old and new step content the same way. Only the container resize differs.

| Approach | How the container changes |
|---|---|
| A, transform | Container laid out once at its final height. A `scaleY` from the old ratio animates it. The content is counter-scaled so text does not stretch. This is what a layout animation in Motion does. |
| B, clip | Container holds the larger of the two heights. A `clip-path` inset animates the top edge from the old height to the new one. |
| C, height | The `height` property animates. Layout runs on every frame. |
| D, instant | Height changes at once. Only the crossfade animates. This is the baseline and the reduced-motion fallback. |

## How to run

```
node prds/tray-benchmark/bench.mjs <runs> <rows> <throttles>
node prds/tray-benchmark/bench.mjs 20 3,8,5 1,4,6
```

`rows` sets the number of content rows in each of three steps, so the step heights differ. Open `tray.html` in a browser to watch an approach. Set `window.DUR` before load to slow it down. Saved output is in `results.txt`.

## Findings

Light content (3, 8 and 5 rows, close to a real tray):

- All four approaches miss almost no frames up to 6x CPU throttle. The differences are inside the noise.
- C animates layout on every frame: about 19 layouts per swap against 3 to 5 for the others, and 1.6 to 2.2 times the layout time of the instant baseline.

Heavy content (60, 140 and 90 rows, a stress case):

- Missed frames do not separate B, C and the baseline D. In the second pass C had the fewest at 6x. At 12x all four degrade to between 1.3 and 1.8 missed frames per swap.
- A has the longest single frames: 33 ms at 6x and 83 ms at 12x, against 17 and 67 ms for B.

So frame counts alone do not pick a winner here. Layout work, single-frame spikes and visual fidelity do:

- B and D do 3 to 4 layouts per swap. C does about 19. On the heavy tray its layout time is only 1.2 to 1.4 times the baseline, because the content swap dominates, so the gap is widest on a light tray.
- A produces the longest frames in the heavy case.
- B clips the tray's `box-shadow`, because `clip-path` cuts everything outside the inset. The shadow has to live on a wrapper outside the clipped element.
- A distorts the tray's rounded corners while it scales. Motion's layout animation corrects for that. A hand-rolled version has to as well.

I also found two harness bugs by looking at screenshots at 40% of the transition, and fixed both. The first version of C clipped the bottom of the content instead of the top, because the content was not pinned to the bottom edge. The first version of A left the outgoing step in layout, so a shrinking tray snapped at the end. The numbers in `results.txt` are from the fixed harness.

## Limits

- Headless desktop Chromium with CPU throttling is a proxy for a phone, not a phone. A mid-range Android and an iPhone still need a check before this ships.
- WebKit and Firefox were not run. Clip-path animation cost in iOS Safari is untested.
- The harness measures the swap. It does not measure scroll inside a tray or the keyboard opening.
- Medians over 12 to 20 runs per cell. Two passes of the same cell differed by up to 0.3 missed frames per swap, so treat gaps smaller than that as noise.

## Result used in the spec

Order of preference in `vois-components/references/motion-tray.md` (the Tray spec): B, then A when the project already uses Motion layout, then D. C is for content that cannot be measured before the swap. The order rests on layout work and fidelity, not on a frame-count gap, and the spec says so.
