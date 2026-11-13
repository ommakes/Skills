# Grid and Panels `[DS-GRID]` `[DS-PANEL]`

How a page is split into columns, how a grid of cards decides how many it holds, and how side panels behave. It works the same on web (React), Flutter and native iOS and Android.

Token values live in your token source. This skill stores token names and formulas. The proposed values are in `data/tokens.json` under `grid_and_panels`. If a `vois_get_tokens` tool is available, it serves the real values. Every size below is a token name. Never write a raw value. The maths is in `scripts/grid-logic.mjs`, and `scripts/grid.test.mjs` runs it with a fixture. If a rule here and that file disagree, fix the file or the rule, never only one.

## Two widths

A page has two widths. People mix them up, so keep them apart.

- **Window width** is the width of the screen or the app window. It picks the navigation and the most columns a collection may have.
- **Region width** is the width left for the page after the side navigation. It picks the grid class.

On the site shell there is no side navigation, so the two are the same.

## Grid classes `[DS-GRID-001]`

Pick the grid class from the region width. Four classes. The names mean nothing on other platforms on purpose, so they never get mixed up with Tailwind's `sm` or Android's `medium`.

| Class | Starts at | Columns |
|---|---|---|
| `narrow` | `--width-viewport-min` | 4 |
| `snug` | `--breakpoint-snug` | 8 |
| `roomy` | `--breakpoint-roomy` | 8 |
| `wide` | `--breakpoint-wide` | 12 |

`roomy` and `wide` start where the tablet and desktop tiers in `vois-patterns` start. `snug` splits the phone tier in two. Columns flex. Margins and gutters do not come from the class, see `[DS-GRID-004]`.

## Navigation shell `[DS-GRID-002]`

Window width picks the navigation, for the app shell:

- Below `--breakpoint-roomy`: a bottom bar.
- From `--breakpoint-roomy` up to below `--breakpoint-wide`: a rail, `--nav-rail` wide.
- From `--breakpoint-wide`: a sidebar, `--nav-sidebar` wide.

The site shell has a top bar and no side navigation. Region width is the window width minus the navigation width.

## Content max `[DS-GRID-003]`

Content stops growing at `--grid-content-max` and centers. A page whose template says `"frame": "fill"` is dense (dashboard, data grid, report, split view). It opts out and fills the region.

## Margin and gutter `[DS-GRID-004]`

Margin and gutter come from the tokens `--grid-margin` and `--grid-gutter`. Never a raw value. Each is a line between two anchor points on region width, held flat outside them. The token source stores four plain numbers for each line: `--grid-margin-min`, `--grid-margin-max`, `--grid-margin-min-at` and `--grid-margin-max-at`, and the same four for the gutter with `--grid-gutter` as the prefix. `--grid-margin` and `--grid-gutter` are generated from them and are not stored. On the web the output is one `clamp()`. On native it is the same line computed in code. The two end values sit on the spacing scale. The values between them do not, so `DS-SPACING-001` does not apply to these two tokens. It still applies to everything else.

## Safe areas and direction `[DS-GRID-005]`

The real margin is the larger of `--grid-margin` and the safe-area inset on that side. Use start and end sides (`padding-inline`, `EdgeInsetsDirectional`, leading and trailing), never left and right.

## Measure the parent `[DS-GRID-006]`

A component measures the space it is given, not the screen. On the web, use a container query on the region. On native, use the layout-constraints API: `LayoutBuilder` (Flutter), `BoxWithConstraints` (Compose) or `GeometryReader` (SwiftUI). Never branch on device type, device model or orientation. An iPad in a split window is narrow, a phone in landscape is wide, and neither check can tell.

## Collections `[DS-GRID-007]`

A collection is a grid of equal cards, tiles or logos. Its column count is:

```
count = max(1, min(cap[windowClass], floor((inner + gutter) / (itemMin + gutter))))
```

- `cap` is the most columns for the window class. It comes from the `collections` entry in the page template.
- `inner` is the region width minus both margins, held at `--grid-content-max`. A `fill` page has no hold. For a container narrower than the region (a card area beside a sidebar), `inner` is the container's own width and the page margins do not apply.
- `gutter` is `--grid-gutter` at the region width.
- `itemMin` is the item token named in the template: `--item-min-icon-tile`, `--item-min-logo`, `--item-min-card`, `--item-min-plan` or `--item-min-story`.

The cap sets how the page looks at each class. The fit stops cards from getting too small in a narrow region. A tile never drops below `itemMin` unless the count is already 1.

## Text size `[DS-GRID-008]`

Larger text makes items need more room. It raises `itemMin`, so the count drops. It never changes the grid, the margins or the gutters.

## Regions `[DS-GRID-009]`

A region is a track: `fluid`, a fraction such as `2fr`, `auto`, or a token name. Splits must fit the columns of the current class. An 8 column class splits 4 and 4, or 5 and 3, never 6 and 6. A region that is not side by side at a class stacks or folds, as the template's responsive text says.

## Units `[DS-GRID-010]`

One token unit is one CSS pixel, one dp on Android and one point on iOS. Tokens are plain numbers that every platform reads the same way.

## Panels

A panel is a surface that opens at the side of a page.

### Push or overlay `[DS-PANEL-001]`

- **Push** sits inline and moves the main content over. Use it when people need to look at the page and the panel together: a preview, a properties list.
- **Overlay** floats over the page. Use it for a task that ends: an edit form, a filter set, a notification list.

### Phones `[DS-PANEL-002]`

Below `--breakpoint-roomy` every panel is full screen. No push, no half-width overlay.

### When a push panel fits `[DS-PANEL-003]`

From `--breakpoint-roomy`, a panel pushes only if the window width, minus `--nav-rail`, minus the panel width leaves at least `--main-min`. The rail is assumed so the answer never flips back when the window grows. If it does not fit, the panel is an overlay.

### The sidebar gives way first `[DS-PANEL-004]`

While a push panel is open, the app shell keeps the full sidebar only if the window width, minus `--nav-sidebar`, minus the panel width still leaves `--main-min`. If not, the sidebar shows as the rail until the panel closes. Do this before turning the panel into an overlay.

### Push panel width `[DS-PANEL-005]`

A push panel is `--panel-push-default` wide. If people can resize it, keep it between `--panel-push-min` and `--panel-push-max`. The main content never goes below `--main-min`.

### Overlay width `[DS-PANEL-006]`

An overlay has a size tier: `--panel-overlay-sm`, `--panel-overlay-md` or `--panel-overlay-lg`. Its width is the smallest of the tier, half the window width rounded down to a multiple of 4, and never under `--panel-overlay-min`. Part of the page always stays visible behind it.

### Two panes `[DS-PANEL-007]`

A list with a detail pane shows both side by side only if each pane gets at least `--pane-min`. Otherwise it behaves like a phone: the list alone, and the detail opens as its own screen with a back control.

### Tokens only `[DS-PANEL-008]`

Panel and pane widths are token names. Never a raw number in code, in a template or in a design spec.

## Example with the default values

These numbers come from the default token values in `prds/grid-token-request.md`. They are an example, not a source. Your token source holds the real values. If the token source changes, run `scripts/grid.test.mjs` and update this table.

| Rule | Result |
|---|---|
| `[DS-PANEL-003]` with a 320 panel | Pushes from a window of 880 |
| `[DS-PANEL-003]` with a 400 panel | Pushes from a window of 960 |
| `[DS-PANEL-004]` with a 320 panel | Sidebar shows as the rail from 1024 to 1039, full sidebar from 1040 |
| `[DS-PANEL-006]` at a window of 768 | `md` and `lg` overlays are both 384 |
| `[DS-PANEL-006]` | `md` overlay reaches its full width at 960, `lg` at 1280 |
| `[DS-PANEL-007]` | Two panes from a window of 800 |

## On each platform

| Platform | Measure the parent | Safe area |
|---|---|---|
| Web | Container query on the region | `env(safe-area-inset-*)` |
| Flutter | `LayoutBuilder`, or `MediaQuery.sizeOf` for the window | `MediaQuery` padding |
| SwiftUI | `GeometryReader` | Safe area insets |
| Compose | `BoxWithConstraints` | Window insets |

For tokens, generate the CSS, Dart, Swift and Kotlin constants from one source. Do not copy numbers by hand into any of them.
