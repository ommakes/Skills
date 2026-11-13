# Token request: grid and panels

For whoever owns the Vois token source. The grid and panel rules (`vois-tokens/references/grid.md`, `DS-GRID-*` and `DS-PANEL-*`) and the `layout` field on every page template name the tokens below. Skills hold token names and formulas, not final values, so these must exist in the token source (and be served by `vois_get_tokens`, if that tool is available) before the rules can be applied for real.

Until then, `vois-tokens/scripts/grid-fixture.json` holds the proposed values so `grid.test.mjs` can run offline. `grid.test.mjs` checks that this table and the fixture agree. If you change a value here, change the fixture, run the test, and update the example table in `grid.md`.

## Tokens

Values are plain numbers: one unit is one CSS pixel, one dp, one point (`DS-GRID-010`).

| Token | Proposed value | Status |
|---|---|---|
| `--width-viewport-min` | 360 | existing, confirm |
| `--breakpoint-snug` | 600 | new |
| `--breakpoint-roomy` | 768 | existing as md, renamed |
| `--breakpoint-wide` | 1024 | existing as lg, renamed |
| `--grid-margin-min` | 16 | new |
| `--grid-margin-max` | 32 | new |
| `--grid-margin-min-at` | 360 | new, window width where the margin is at its minimum |
| `--grid-margin-max-at` | 1024 | new, window width where the margin reaches its maximum |
| `--grid-gutter-min` | 16 | new |
| `--grid-gutter-max` | 24 | new |
| `--grid-gutter-min-at` | 600 | new, region width where the gutter is at its minimum |
| `--grid-gutter-max-at` | 768 | new, region width where the gutter reaches its maximum |
| `--grid-margin` | generated | output, built from the four --grid-margin tokens. Not stored. |
| `--grid-gutter` | generated | output, built from the four --grid-gutter tokens. Not stored. |
| `--grid-content-max` | 1200 | new |
| `--nav-rail` | 80 | new |
| `--nav-sidebar` | 240 | new |
| `--panel-push-min` | 280 | new |
| `--panel-push-default` | 320 | new |
| `--panel-push-max` | 400 | new |
| `--main-min` | 480 | new |
| `--panel-overlay-sm` | 360 | new |
| `--panel-overlay-md` | 480 | new |
| `--panel-overlay-lg` | 640 | new |
| `--panel-overlay-min` | 320 | new |
| `--pane-min` | 360 | new |
| `--item-min-icon-tile` | 64 | new |
| `--item-min-logo` | 96 | new |
| `--item-min-card` | 152 | new |
| `--item-min-plan` | 216 | new |
| `--item-min-story` | 264 | new |
| `--region-right-rail` | 320 | new, proposed, not in the template text |
| `--region-filters` | 280 | new, proposed, not in the template text |
| `--region-company-facts` | 320 | new, proposed, not in the template text |
| `--region-contents` | 240 | new, proposed, not in the template text |
| `--region-buy-box` | 380 | new, from the product template text |
| `--region-subnav` | 200 | new, from the settings template text |
| `--measure-feed` | 600 | new, from the feed template text |
| `--measure-settings` | 640 | new, from the settings template text |
| `--measure-article` | 680 | new, from the article and case study text |
| `--measure-onboarding` | 560 | new, from the onboarding template text |

## Notes for the token owner

- **Renames.** `--width-viewport-min` exists. The proposal assumes 360. The existing `md` (768) and `lg` (1024) breakpoint tokens are renamed outright to `--breakpoint-roomy` and `--breakpoint-wide`, with no aliases. Sweep code and Figma for the old names. If Tailwind generates `md:` and `lg:` utilities from these, that sweep covers the utility prefixes too. `--breakpoint-snug` (600) is new.
- **Margin and gutter are lines, stored as four plain numbers each.** Each line has a minimum, a maximum, and the width where each is reached. The value is held flat outside those two widths. `--grid-margin` and `--grid-gutter` are generated outputs, so do not store them. On the web the generator writes one `clamp()`. On native it writes code that computes the same line. No custom token type is needed, and the numbers sync to Figma variables. The end values are on the spacing scale (`DS-SPACING-001`).
- **Side column widths are one token per role.** The page templates use a right rail (feed), a filter sidebar (browse), a company facts column (case study) and a contents column (article), and never gave a width. The four values here are my proposals, not template text. Check them with design.
- **Values marked "from the template text"** come from raw numbers that were in the page template prose (`about 380px`, `at 200px`, `capped near 640px`). Keep them as proposed unless design says otherwise.
- **The raw `300px` for the record properties panel is gone.** That panel now uses `--panel-push-default`, which is 320 in this proposal.
- **`--hit-area-min`.** Not a new token. The decision for this work was 44, which is 4px under Material's 48dp. Set it in the token source. The rule text for `DS-A11Y-001` is unchanged because it names the token and holds no number.

## What breaks if a value changes

Run `node vois-tokens/scripts/grid.test.mjs`. It checks the class edges, the collection column counts at every class edge, that push panels never leave the main area under `--main-min`, and the example table in `grid.md`.
