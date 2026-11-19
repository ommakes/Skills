# Changelog

## [0.21.1] - 2026-11-19

- The registry check now also applies `vois-tokens` `DS-TOKEN-001` (vois-tokens 1.47.0): a component that names a Global palette step (`var(--blue-9)`) instead of the token that aliases it fails CI. Every current item passes. A test keeps the detector's hue list equal to the palette families in `source/figma-export.json`, so a new hue in Figma fails until the detector knows it. No item changed.

## [0.21.0] - 2026-11-17

- **`vois-panel-layout`, a new item: the panel rules, built.** `PanelLayout`, `PanelLayoutMain` and `PanelLayoutPanel` place a `vois-panel` by `DS-PANEL-002` to `006`. By window width: from `--breakpoint-md`, a panel **pushes** when the window, minus `--nav-rail`, minus the panel width, still leaves `--main-min`; otherwise it is an **overlay**; below `--breakpoint-md` it is **full screen**. The overlay is not modal: no scrim, no focus trap, the page behind stays usable. It is docked, on the modal layer (`--z-modal`, so a menu opened from inside it stacks above it), with `--shadow-large-right` or `--shadow-large-left` (`DS-ELEVATION-006`) and the raised fill. Its width is the smallest of the tier (`sm`, `md` or `lg`), half the window rounded down to a multiple of 4, never under `--panel-overlay-min`, written in CSS so it follows the window as it changes. An overlay and a full panel take focus when they open, return it when they close, and close on Escape. A full panel makes the main area inert. A push panel leaves focus alone.
- `usePanelLayout` returns `{ mode, navMode, close }`. `navMode` is `bottom`, `rail` or `sidebar`, with the sidebar folding to the rail while a push panel is open and would leave the main area under `--main-min` (`DS-PANEL-004`). The navigation itself is not part of the item.
- The decision is `lib/panel-logic.ts`: the same arithmetic as `vois-tokens` `scripts/grid-logic.mjs`, with every number read from the page's CSS variables. A missing token, or one that is not a plain px length, gives a full-screen panel, never a push panel. `npm run panel:test` (`scripts/panel-logic.test.mjs`) compares it with `grid-logic.mjs` at every window width from 300 to 1600 for all three push widths, and checks the fail-closed cases. It is in CI and in the push list.
- `vois-tokens` `data/elevation-map.json` gets two built rows, `panel-overlay-right` and `panel-overlay-left` (vois-tokens 1.46.2).
- The overlay width uses `round()`, so it needs Chrome 125, Firefox 118 or Safari 15.4 or newer. A browser without it gets no overlay width.
- The item needs React 19 (`PanelLayoutPanel` passes a `ref` to `Panel`, a function component).
- A panel over the page pads its edges by the safe-area insets (`DS-RESPONSIVE-010`): a full panel on both sides, an overlay on its docked edge, and both on the top and bottom. Found by checking with emulated insets: the first version did not.
- Checked in Chromium 153: the mode, the nav mode, the push panel width and side, the overlay width against `grid-logic.mjs` `overlayWidth` (14 window widths per tier, odd ones included so the multiple-of-4 rounding is tested), the docked edge, the shadow token for each side, the fill, `--z-modal`, full screen and inert, for 19 window widths from 320 to 1400 × 3 push widths × 2 sides (822 checks); focus in and back, Escape, push leaving focus alone, no remount or focus loss when a resize moves an open panel from overlay to push, light and dark fill, a bad token failing closed, and the nav mode at the fold points (25 checks); and the safe-area padding with real `env()` values, set through the DevTools `Emulation.setSafeAreaInsetsOverride` (a notch of 47px, a home bar of 21px), for the panel in full and overlay mode and for `PageFrame` in left-to-right and right-to-left (10 checks); and a server render, which draws no panel until the window is measured. Each mutation of the decision, the shadow side, the z-index, the fill, the inert, the focus and the insets fails a check. Not measured: Safari and Firefox, a real nav shell, touch, a physical device.

## [0.20.0] - 2026-11-17

- **`vois-page-grid`, a new item: the page grid, built.** No registry component read `--grid-margin`, `--grid-gutter` or the `--item-min-*` tokens before this. `PageFrame` is the page region: a size container (so the margin and gutter tokens, which are written in `100cqi`, measure the region and not the window, `DS-GRID-006`), the content held at `--grid-content-max` (`DS-GRID-003`), and padding of the larger of `--grid-margin` and the safe-area inset on each side, on the start and end sides so right-to-left pages work (`DS-GRID-004`, `DS-GRID-005`). `fill` opts out of the content max for a dense page. `CollectionGrid` and `CollectionGridItem` are a list of equal items whose column count is the `DS-GRID-007` formula written in CSS: `repeat(auto-fill, minmax(max(min(100%, itemMin), one column of a full cap row), 1fr))`, with `itemMin` one of `icon-tile`, `logo`, `card`, `plan` or `story`, a `cap` per grid class (a class left out takes the one before it, a bad value is read as 1), and the gap from `--grid-gutter`. No JS.
- A container query cannot read a token, so the cap queries repeat `--breakpoint-sm`, `-md` and `-lg` (600, 768, 1024). The grid has to sit inside a `PageFrame` or any `@container`: without one the queries do not match and it keeps its narrow cap.
- Checked in Chromium 153: column count, margin, gutter and grid width against the `grid-logic.mjs` arithmetic for 5 item sizes at 14 region widths from 150 to 1300, content and fill (140 cases); the cap rules; no overflow at a 150 wide region; the safe-area `max()` and the right-to-left swap; the same count for one region width in a 500 and a 1400 wide window. Ten mutations (guard, cap term, safe inset, container, content box, rtl, cap fallback, query, fill, raw gap) all fail the checks.

## [0.19.0] - 2026-11-16

- **`vois-questionnaire`, a new item.** The questionnaire components from the `@vois/questionnaire` React package (1.2.0), as a registry item instead of an npm package: `Question`, `ChoiceGroup`, `LikertScale`, `LikertBattery`, `TapToRank`, `PollResults` and `FieldShell`, plus `types.ts`, `copy.ts`, `poll-rows.ts` and the question engine under `lib/questionnaire/`. It depends on `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` and the `utils` item.
- Changed from the package so the registry detector passes: the 5-point Likert row is a flex row, not `grid-cols-5` (`DS-GRID-007`); the result bars grow from zero on the first frame after mount with `--motion-duration-slow` (400ms) and `--motion-ease-standard` (`DS-MOTION-001`), and appear at full width with reduced motion; the dragged item uses `--shadow-small`, not `shadow-md` (`DS-ELEVATION-007`). Success colors are `--bg-positive`, `--border-positive` and `--text-positive`, so the package's `questionnaire.css` is not needed.
- Fixed in the port, found in review: the rank list's Up and Down buttons at the ends use `aria-disabled` instead of `disabled`, so keyboard focus is not lost when an item reaches the top or bottom; their labels (and the list label) come from `copy`, with new keys `rankUp`, `rankDown`, `rankMoveUp`, `rankMoveDown`, `rankHandle` and `rankListLabel`; the poll result live region mounts empty and is filled after mount so a screen reader announces it; Likert points get `min-w-0` so long labels wrap.
- The engine is `question-engine.js` plus a `.d.ts`, byte for byte `vois-patterns/scripts/question-engine.mjs`. `check-questions.mjs` compares them. (The package copy still named the old `PATH-F-*` ids; this one names `PATH-H-*`.)
- Checked by typechecking the files and running the package's 17 component tests, axe included, against them laid out as a consumer app would (`@/lib/utils`, `@/lib/questionnaire/*`, `@/components/ui/questionnaire/*`).

## [0.18.2] - 2026-11-16

- **The syntax check no longer skips a file by its extension's case or kind.** In 0.18.1 a `Foo.TSX` or a `.mts` file was never found, so it was never parsed. `check-syntax.mjs` now reads `.ts`, `.tsx`, `.mts` and `.cts` in any case. The loader comes from the lower-cased extension (`loaderFor`). Five tests are new (17 in all): the loader lookup, an upper-case and an `.mts` file found and parsed, a leftover merge marker, an angle-bracket cast (valid in `.ts`, an error in `.tsx`), and the CLI's exit code and `FAIL file:line:col` output. Each new guard was removed in a copy and a test failed; the one redundant guard was dropped. These came from #92, a second build of the same check that was closed in favor of #93.

## [0.18.1] - 2026-11-16

- **A syntax check for the components.** `npm run syntax` (`scripts/check-syntax.mjs`, tests in `check-syntax.test.mjs` as `npm run syntax:test`) parses every `.ts` and `.tsx` file under `vois/` with esbuild and fails on a syntax error, naming the file and line. No other check parsed the components: `shadcn build` copies them into JSON without compiling, and the checkers read them with regexes, so a closing bracket dropped while resolving a merge conflict shipped with everything green. It is syntax only and does not type-check, because the components import `@/lib/utils` and `@/components/ui/*`, which resolve only in a consumer app. CI runs it in the `registry-build` job. Replaying the real slip (a dropped `],` in `button.tsx`) fails with `vois/button/button.tsx:106:12: Expected "]" but found ":"`.
- `esbuild` 0.24.0 is a pinned devDependency (the shadcn CLI was the only one). `npm ci --ignore-scripts` still installs its binary, which comes from a platform package, not an install script. `package-lock.json` also records this package's own version, which had stayed at 0.2.0.

## [0.18.0] - 2026-11-15

Opened as 0.16.0. 0.16.0 is the icon-button change (#89) and 0.17.0 the glass change (#91), so this lands after the glass change.

- **Hover and dragging for both sliders.** `Slider`: hover puts a 6px `--bg-hover` halo around the thumb, and dragging (`:active`) turns it `--bg-pressed`. `StepSlider`: hover (anywhere on the track) gives the thumb a 1px `--border-state-hover` edge, as a field's edge does on hover, and dragging a 1px `--border-state-active` edge. Neither shows when disabled, and hover gives way to keyboard focus, so a focused thumb keeps its ring. Chromium: the StepSlider thumb edge reads `--border-default`, then `--border-state-hover`, then `--border-state-active`, and stays 2px `--segment-focus-ring` when focused and hovered; the disabled thumb does not change on hover.
- **`InspectorToggle` fixes, found while drawing every state in Figma.** A disabled toggle that was on still showed the active blue icon on the pressed fill, because `data-[state=on]` beat `disabled:`. The on look is now guarded with `not-disabled` (the Checkbox's rule), and a disabled on toggle keeps a 1px `--border-state-disabled` edge so the setting stays visible (the SegmentedControl's rule). Hover now darkens the icon only: `--input-hover` is white in light, which made a toggle with no edge vanish into the panel.
- **`InspectorSectionTrigger` focus.** The ring drawn inside the row ran over the title, and drawn outside it covered the first control below. The row now reaches 4px past the rows on each side with 4px padding, and the 2px ring sits inside it, so the title stays on the labels' line (checked: both at the same x).
- Figma: every set has a variant for each state the code draws. See `FIGMA-TODO.md`.

## [0.17.0] - 2026-11-15

- **Frosted glass, opt-in.** Figma first: Colors variables `Component/Glass/Tint-*`, `Stroke-*`, `Highlight-*` (aliases of White Alpha, light and dark), Values `Glass/Blur-Subtle`, `-Standard`, `-Strong` (8, 16, 24, scope effect float), and effect styles `Glass/<Tier>` and `Glass/Dark/<Tier>` (background blur bound to the blur variable, a zero-blur top highlight, a drop shadow). Export checksum `bcc06a0a` (903 tokens). `figma-export.js` writes the glass drop shadows as `--glass-shadow-*` in `:root` and `.dark`.
- **New item `vois-glass`** (`lib/glass.ts`): `glass.subtle`, `glass.standard` and `glass.strong`, each one Tailwind class string. Opaque fill and `--border-default` edge first (the layer's elevation fill), the glass edge and tint plus `backdrop-blur` and `backdrop-saturate` inside `supports-[(backdrop-filter:blur(1px))_or_(-webkit-backdrop-filter:blur(1px))]:`, and the opaque fill with no blur under `[@media(prefers-reduced-transparency:reduce)]:`. Tailwind writes the `-webkit-` twin. Saturate (150 / 160 / 180%) has no Figma equivalent and lives here. It is a lib file, not a CSS file, because registry CSS holds variable mappings only.
- `vois-dropdown-menu`: `material="glass"` on `DropdownMenuContent` and `DropdownMenuSubContent` gives the standard tier; a glass submenu renders in a portal, so the parent's backdrop filter does not clip it and it is not glass on glass. `vois-dialog`: `material="glass"` on `DialogContent` gives the strong tier, over the same scrim. `vois-command`: `CommandDialog` passes `material` to its DialogContent. `vois-button`: `variant="glass"` is the subtle tier for an icon button over media (Figma Icon Button Glass): hover steps to the standard tint, pressed to the strong one, and under reduced transparency it stays opaque on hover too. Solid stays the default everywhere. Each carries its own copy of its tier, so none needs `vois-glass`; `check-registry.test.mjs` keeps the copies equal to `glass.ts`.
- Chromium, the glass Button (subtle): fill white 60% at rest, 70% on hover, 80% pressed, `blur(8px) saturate(1.5)`, a 1px white 20% edge; with reduced transparency, opaque white with the gray edge at rest and on hover.
- Chromium, the glass classes compiled by Tailwind 4.1.11 and 4.0.17, standard tier in light: fill `oklch(1 0 0 / 0.698)`, `backdrop-filter: blur(16px) saturate(1.6)`, the inset highlight and the float shadow; with `prefers-reduced-transparency: reduce` emulated, an opaque white fill and `backdrop-filter: none`.

## [0.16.0] - 2026-11-15

- **Icon buttons step up on touch.** Figma first: new `Semantic/Hit area/hit-area-coarse` (48, `--hit-area-coarse`). Export checksum `93850e82` (896 tokens, with the Soft tokens below). `vois-button`: on `any-pointer: coarse` the icon sizes go one step up (`icon-sm` 28 to 36, `icon` 36 to 48, `icon-lg` 48 to 56) with 20 / 24 / 28 glyphs, and every size's hit area is 48 instead of 44. Text sizes keep their height. The classes use the arbitrary `[@media(any-pointer:coarse)]:` variant, so any Tailwind 4 works (vois-tokens `DS-ICON-003`, `DS-A11Y-001`). A `className` that overrides an icon size needs its coarse twin too, because tailwind-merge keeps the coarse class.
- **Soft icon buttons.** Figma first: `Component/Action Icon Soft/Action-Icon-Soft-Resting`, `-Hover`, `-Pressed`, `-Disabled` (light Black-A2 / A3 / A4 / A1, dark White-A2 / A3 / A4 / A1). `vois-button` has `variant="soft"`: that resting fill, the icon in `--icon-primary`, hover and pressed one step above the ghost's (vois-tokens `DS-ICON-007`).
- `vois-input-group`: `InputGroupButton`'s hit area is 48 on a coarse pointer too.
- `vois-dialog`: the close button drops its 40px override and is the plain `icon` size (36, 48 on touch). The header keeps the title clear of it: 48 on the right, 56 on a coarse pointer. The Figma Dialog's close is the Icon Button Reg, now 36.
- **Figma Icon Button set** (`41:399`) now matches code: Sm 28 / glyph 16, Reg 36 / glyph 20, new Lg 48 / glyph 24, bound to `action-medium`, `action-large`, `action-x-large` and the icon size variables. It was Reg 40 / 24, Sm 28 / 20 and X-Sm 20 / 16. X-Sm had no instances and is deleted. Reg's 38 instances are now 4px smaller.

## [0.15.0] - 2026-11-15

- **Three new items for a properties pane**, reverse-engineered from a published theme editor's inspector and rebuilt on Vois tokens. No new tokens: every value is an existing Control, Segment, Input or Surface token.
  - `vois-slider`: `Slider`, a continuous value (4px `--control-off` track, `--control-on` fill, 20 thumb with a `--switch-knob` ring), and `StepSlider`, a value from a short named scale with the Segments geometry (32 `--segment-inactive` track, a 28 `--segment-active` thumb that shows the step's label, 4px stop dots). Both are a native `<input type="range">`, as `JOB-ANSWER-SCALE-OR-RANK` asks, so the keyboard, touch, form submission and the slider role come from the browser. `aria-valuetext` is the label plus the step's description ("S, 12px"). The drawn StepSlider thumb is the width of the longest label, and the native thumb is set to the same width, so a press lands where the thumb is drawn.
  - `vois-inspector`: `InspectorSection` (a `vois-collapsible`, open by default), `InspectorSectionTrigger`, `InspectorSectionContent`, `InspectorRow` (label one part, control two parts), `InspectorLabel`, `InspectorControlGroup` (controls 4 apart, facing corners `--radii-2`) and `InspectorToggle` (a 32 Radix Toggle, so it matches the fields next to it, `DS-COMPONENT-007`). Inspector controls are the compact 32 size: the pane is a dense row.
  - `vois-swatch-picker`: a compact field trigger and a Popover of swatch groups that is one Radix RadioGroup: one tab stop, the arrows move and choose (the popup stays open, so the choice previews), a pointer click or Enter closes. Each swatch is named by its label.
- Checked in Chromium with Tailwind 4.1 and React 19, light and dark: arrows and a click on the track move the StepSlider ("M, 16px"; a click at the end gives the last step), the drawn thumb sits 2px from either end at the first and last step, Enter in the swatch popup closes it and returns focus to the trigger, and every focus ring shows in full. Strict TypeScript passes.
- Found while testing, and fixed in the parts: Tailwind's `shadow-*` builds `box-shadow` from `--tw-*` variables that do not resolve on `::-webkit-slider-thumb`, so the Slider sets `box-shadow` directly; the Collapsible's `overflow: hidden` cut off focus rings at the row edges, so `InspectorSectionContent` gives its clip box 8px of room; Radix `RadioGroupItem` drops an `onKeyDown` passed to it, so Enter is handled on the group.
- Figma: `Slider`, `Step Slider Stop` and `Step Slider` on the Selectors page, the Inspector parts and the Swatch Picker under the Panel set on the Components page, with a light and dark inspector built from instances (see `FIGMA-TODO.md`).
- Not built: a range (two-thumb) slider, a hover tooltip with the step's value, a free color picker.

## [0.14.0] - 2026-11-15

- **shadcn `popover` follows the popup fill.** `vois-theme.css` maps `--popover` to `--elevation-surface-popup` (it was `--bg-card`), so a stock shadcn popover, dropdown or select list (anything that reads `bg-popover`) is one step above a Dialog in dark, like the Vois menus. `card` stays on `--bg-card`. Light is unchanged: both are white. `MAPPINGS.popover` in `check-registry.mjs`, the `DS-TOKEN-005` table in vois-tokens and the rule text moved with it, and the existing table-equals-MAPPINGS test keeps them together.
- `check-registry.test.mjs` pins the mapping (popover on the popup fill, card on the card fill, the token defined in `:root` and `.dark`). Chromium with a shadcn-style `@theme inline` mapping: `bg-popover` is `#ffffff` in light and `#41413c` in dark.
- Needs `@theme inline { --color-popover: var(--popover); }`, as a shadcn project already has. The registry theme file does not declare it.

## [0.13.0] - 2026-11-15

- **A fourth dark fill step, for popups.** Figma first: new `Component/Elevation/Surface-Popup` (light white, dark Warm Gray-8, `--elevation-surface-popup`). Export checksum `c01e04df` (891 tokens). In dark, a menu, select list or hover card opened from inside a Dialog had the Dialog's fill (menu, select) or a darker one (hover card), so only the shadow told them apart. `vois-dropdown-menu`, `vois-select` and `vois-hover-card` (and its arrow) now fill with the Popup step, which is lighter than the Dialog's Raised step. The Dialog and Card are unchanged. Light is unchanged: the new token is the card white.
- `build-tokens.test.mjs`: the dark fills are checked as a ladder of four (each at least 0.02 OKLCH lightness above the one below, popup over a Dialog included), text 4.5:1 and control edges 3:1 on the popup fill, text on item hover over the raised and popup fills, and the three components read the popup fill while the Dialog keeps the raised one. Chromium (dark): menu, select list and hover card `#41413c`, Dialog `#353431`, and a menu opened inside a Dialog differs from it by fill. Light: all white as before.
- Still open: a stock shadcn Popover maps to `--bg-card` (`DS-TOKEN-005`), so it stays darker than the Vois menus.

## [0.12.0] - 2026-11-15

- **Docked-panel shadows.** Figma first: `Elevation/Large/Right`, `Left`, `Bottom`, `Top` and `Elevation/Dark/Large/<Side>`, the Large layers without the ring, moved along one axis by their depth with the spread pulled in by half the blur, rounded down. Export checksum `2a6b12f8` (890 tokens, 9 shadows, 7 dark shadows). The generator writes `--shadow-large-right`, `-left`, `-bottom`, `-top` in `:root` and `.dark`. Nothing uses them yet: there is no Sheet or Drawer.
- **Choice Card states.** Figma first: the Hover variants of Radio Card and Checkbox Card use `Elevation/Small`. `vois-choice-card`: a resting card goes Base to Small on hover and drops its shadow when pressed (edge only), as the Card already did (`DS-ELEVATION-003`). Checked, negative and disabled cards keep Base. In dark the Small shadow draws nothing, so only the edge changes.
- `build-tokens.test.mjs` checks the sign rule on every layer of every docked shadow, in light and in dark (right x negative, left x positive, bottom y negative, top y positive, the other axis 0, a negative spread), that the layers match Large's depths and blurs, and that a centered shadow has x = 0.

## [0.11.0] - 2026-11-15

- **Dark elevation.** Figma first: `Elevation/Dark/Medium`, `Large` and `XLarge` effect styles (black at 16, 20 and 24% per layer, the same layers as the light tier without the 1px ring), a new `Global/Black Alpha/Black-A0` (transparent), and three Colors variables: `Component/Elevation/Surface-Small`, `Surface-Raised` and `Hairline`. Export checksum `7f179f8c` (890 tokens, 3 dark shadows).
- `figma-export.js` writes `darkShadows`. `build-tokens.mjs` puts them in `.dark` and makes `--shadow-base` and `--shadow-small` draw nothing there. It fails closed on a dark style with no light twin, a dark style for Base or Small, a tier left without one, or a block that is not an object. A file with no `darkShadows` builds as before.
- Light output is unchanged: the new light values are the card white and a transparent hairline, and the light shadows are byte for byte the same.
- `vois-hover-card` and the Card hover fill with `--elevation-surface-small`; `vois-dropdown-menu`, `vois-select` and `vois-dialog` fill with `--elevation-surface-raised`; `CommandDialog` makes its Command transparent so the Dialog fill shows. Tooltip and Switch knob keep their own fills: the Tooltip is a dark fill in both themes, and the knob is a light knob on a dark track (its Small shadow draws nothing in dark, which costs nothing).
- `build-tokens.test.mjs` checks the generator and its failures (a dark style must have the light layers minus the 1px ring, in black), that each dark fill is at least 0.02 OKLCH lightness above the one below, text 4.5:1 and control edges 3:1 on every elevated fill, text on a menu item hover over the raised fill, a transparent hairline in light, and that the components read the new fills. Not tested: the decorative `--border-pretty` edge on the raised fill.
- **Known gaps.** In dark, a Select list or menu opened inside a Dialog has the Dialog's fill, and a Hover Card over a Dialog is darker than it, so only the shadow separates them. A stock shadcn Popover still maps to `--bg-card`. `--elevation-hairline` is not used by a built component yet.

## [0.10.0] - 2026-11-15

- **Dialog widths are tokens.** Figma first: `Semantic/Dialog/width-dialog-sm` (344) and `width-dialog-lg` (560) in the Size collection, with Web syntax `--width-dialog-sm` and `--width-dialog-lg`. The Figma Dialog's width is bound to the small one. Export checksum `cbd49db0` (886 tokens).
- `vois-dialog` takes `size`: `"sm"` (default, `--width-dialog-sm`) or `"lg"` (`--width-dialog-lg`). It was a hard-coded 344. The default looks the same. The large value is proposed: no Figma Dialog is drawn at 560 yet, and it needs a check on real screens.
- `build-tokens.test.mjs` checks both width tokens and that the small one equals the width the Figma Dialog is built at.

## [0.9.0] - 2026-11-14

- **Focus ring.** Figma first: `Border-State-Focus` is Blue-10 in light and Blue-8 in dark (was Blue-11 and Blue-5), `Control-Focus` aliases it (it was Blue-7, 1.6:1 on the page), and two new Values variables, `Focus Ring/Width` and `Focus Ring/Offset` (2px each, `--focus-ring-width`, `--focus-ring-offset`). Export checksum `8810c065` (884 tokens).
- **Fields draw an external ring.** `vois-input`, and so the Textarea and the InputGroup box, and the open Select trigger keep their 1px `--input-border` edge on focus and show a 2px `--border-state-focus` ring 2px outside, using the two new tokens. Before, focus swapped the border to blue and added an inset ring. The size and corners never change, and a focused invalid field keeps its red edge and shows the ring. The Figma Input Field Focus states are redrawn the same way (35 field frames, a "Focus Ring" frame behind each).
- Checkbox and Radio rings now read the shared color and pass 3:1. Buttons, Tabs, Badge and the others already used the token, so only the color changed.
- **The token also colors things that are not rings**, so these change too: the completed-step connector in the Stepper (Blue-11 to Blue-10 in light, Blue-5 to Blue-8 in dark), the Choice Card focus edge, the Scroll Area and Panel rings, and the shadcn `--ring` variable (`DS-TOKEN-005`).
- Left alone on purpose: `--segment-focus-ring` (Blue-10 light, Blue-9 dark) was set separately to keep 3:1 on the Segment track and indicator, and the primary Button keeps `--action-primary-focus` (a brand slot). `--switch-focus` and `--segment-focus-active` are Blue-7 in Figma but no component reads them as a ring.
- **Room for the ring.** The ring is an outline 2px out and 2px wide, so a field needs 4px of clear space on every side. A parent with `overflow` other than visible (an `overflow-hidden` Card, a Dialog body flush to its edge) cuts it off. Give such a parent 4px of padding, or draw the ring inside as menu items do.
- In-list items (menus, Command, Scroll Area, Panel) keep their inside ring.
- `build-tokens.test.mjs`: the ring meets 3:1 on every surface in both modes and is at least 4.5:1 on the page, `--control-focus` is the same token, width and offset are 2.

## [0.8.2] - 2026-11-14

- **Field and control edges are the lightest gray that meets 3:1, light mode.** New Figma tokens `--gray-5-5` (#858585) and `--input-border`. `vois-input` (and so the Select trigger, the Textarea and the InputGroup box, which share its field classes) uses `--input-border` for its resting edge. `--control-border` (Checkbox, Radio) and `--switch-outline` (off Switch) use `--gray-5-5` in light, and are unchanged in dark. The shadcn `--input` variable points at `--input-border`. `--border-default` and `--gray-6` are unchanged: cards, dividers, panels and placeholder text keep them. So do the secondary and outline Button edges and the InputGroup segment dividers, which stay at #7e7e7e next to a #858585 field edge (8 of 255 apart, and both pass 3:1). `source/figma-export.json` is re-exported (checksum `35816e03`, 882 tokens).
- The lightest gray was found with the resting fill blended and rounded to whole pixels, as a browser draws it. #868686 looked like it passed at 3.01:1 on paper and measured 2.999:1 once rounded, so the value is #858585 (3.04:1 at worst).
- `build-tokens.test.mjs` now checks the three edges: each meets 3:1 on every surface and on the resting fill, and `--input-border` is exactly the lightest passing gray. A lighter value, a darker one or a changed surface or fill fails it.

## [0.8.1] - 2026-11-14

- **Z-index order fixed.** Figma now has `--z-modal` 1300, `--z-dropdown` 1400 and `--z-overlay` 1500 (they were 1000, 1200 and 1300), so a DropdownMenu, Select, HoverCard or Tooltip opened from inside a Dialog shows above it. `source/figma-export.json` is re-exported (checksum `7e6728b4`, 880 tokens) and `vois-tokens.css` is rebuilt. No component class changed. A Chromium check opens a menu, a select and a tooltip inside a Dialog and tests that each one is on top.

## [0.8.0] - 2026-11-14

Wave 0: the six primitives the AI components need (see `prds/ai-components-wave-1.md`). Each is checked in Chromium in light, dark and reduced motion.

- `vois-button-group`: joined Buttons that work for any number (1px overlap, square inner corners), an inside focus ring as in the Figma Button Group, a vertical orientation, a text segment and a separator.
- `vois-collapsible`: Radix Collapsible with a height animation on the motion tokens that stops under reduced motion.
- `vois-scroll-area`: Radix ScrollArea with the new Figma Scrollbar set (`8086:3446`): a 16 wide track, an 8 wide capsule thumb in `--border-default` (3:1 or more), darker on hover and drag.
- `vois-dropdown-menu`: Radix DropdownMenu from the Figma Dropdown Menu and Menu Item sets, the same list as the Select, with checked and radio items, destructive items, shortcuts, labels, separators and submenus.
- `vois-dialog`: Radix Dialog from the Figma Dialog: a 344 wide card on `--z-modal`, a `--bg-overlay-dark` scrim, a 40 ghost close button and a motion-token fade.
- `vois-command`: cmdk from the Figma Command Menu: a 56 tall search row, 40 tall items with a keyboard ring, and a `CommandDialog`.
- `RUNTIME` in `check-registry` gains the Radix Collapsible (`--radix-collapsible-content-height`) and DropdownMenu (`--radix-dropdown-menu-content-transform-origin` and `-content-available-height`) variables, only the ones the code reads.
- Known gap (fixed in 0.8.1): a DropdownMenu, Select, HoverCard or Tooltip opened from inside a Dialog renders behind it, because the z-index ladder puts the modal (1300) above the dropdown (1000) and overlay (1200) layers. See `registry/FIGMA-TODO.md`.
- Two Radix and cmdk traps are documented in the files: a custom `id` on `CollapsibleContent`, `DialogTitle` or `DialogDescription` breaks the `aria-*` link, and cmdk ignores custom ids.
- No token or export change.

## [0.7.0] - 2026-11-14

Thirteen new items, each checked in Chromium in light and dark.

- `vois-textarea` and `vois-field`: the Vois Input's box with field-sizing growth (3 to 12 lines), and Field with `FieldControl`, which wires the id, `aria-describedby`, `aria-invalid` and `aria-required`.
- `vois-input-group`: shadcn's InputGroup on the Vois Input. Search (pill, clear button), Email and URL (icon or "https://"), Password with show and hide (the name changes, no `aria-pressed`), an input with an inline button, at 36, 48 and 32. The box mirrors the inner input's states with `:has()`.
- `vois-avatar` (five sizes, initials, generic and invite fallbacks), `vois-badge` (Figma Labels and Status Labels: solid, soft and outline across 16 hues and 7 statuses, shadcn names kept) and `vois-tooltip` (Figma Tooltip on `--z-overlay`, kept in the viewport, motion-token fade). `RUNTIME` in `check-registry` gains two Radix Tooltip variables.
- `vois-segmented-control` (Figma Segments on Radix ToggleGroup, always one choice) and `vois-stepper` (a step indicator, horizontal or vertical, with clickable complete steps).
- `vois-choice-list` and `vois-choice-card`: radio and checkbox rows, and cards, from the Figma Select and Card sets.
- `vois-card`, `vois-hover-card` and `vois-panel`, which completes Phase 1. The Card and Panel sets were built in Figma first, from existing tokens only (no export change). `vois-card` has an `interactive` card whose whole surface is one `CardLink` (a stretched `::after` layer, so there is one link named by the title). `vois-hover-card` follows the Figma Popover surface, with a tail, and `RUNTIME` gains two Radix HoverCard variables. `vois-panel` uses the push-panel width tokens (280, 320, 400). The Figma sets use slots (Card and Panel: Action, Content, Footer; Popover: Content) and text properties, so designers can swap content, and each slot's description names its code part. A new Field set (Control slot, Message text) and a Body slot on Radio Card and Checkbox Card follow the same pattern. A new Tabs set has a panel `Content` slot, Labels gets a swappable leading icon (off by default), Status Labels a swappable trailing icon, and the Avatar Generic and Invited variants a `Content` slot.
- **Invited avatar, made in Figma first.** New `--avatar-invite-edge` (Goldie-10, 3.55:1 on the light page and 4.56:1 on the dark page). `--avatar-invite` was the accent background; it is now Goldie-3 in light and Goldie-A3 in dark, so the fill and the edge are one hue. The six Invited avatars bind both. The edge no longer uses `--border-accent`.
- **`--text-subtle` reaches 4.5:1, made in Figma first.** It was gray-7 in light and gray-6 in dark. That passed on the light page (4.53:1) and cards (5.02:1) but not on the input fill (4.15), segment track (4.41), hover fills, soft labels or chips (3.9 to 4.5), and not on the dark page (4.42) or dark cards (4.05). It is now gray-8 in light (6.7:1 or more on those fills) and gray-5 in dark (6.9:1 or more), the same values as `--text-state-resting`. This reaches every text that used it: the underline Tab label, Stepper upcoming labels and descriptions, sidebar and menu text, table rows, chips and the rest of the product. `--text-hint` gets the same fix in dark only: gray-7 (3.57:1 on the dark page) to gray-5 (7:1 or more on every field fill). Light was already gray-8. Re-export checksum `7b3f214f` (880 tokens).
- **Field text, made in Figma first.** The Field description (240 texts) and the "https://" prefix (21) move from `--text-subtle` to `--text-state-resting`. Re-export checksum `ff5f1fc1` (880 tokens).
- The new components use the contrast-fixed tokens from 0.6.1: info and accent solid badges, `--text-secondary` initials, `--icon-subtle` glyphs, `--segment-focus-ring` and `--text-state-resting` on segments, and `--text-state-resting` or `--text-auxiliary` descriptions on choice rows and cards.
- `vois-tokens` 1.31.2 detector: the `LOOKALIKE-*` rules now skip `registry/vois/` sources too, because they install as `components/ui/`. Before, the Stepper's raw step button had to hide its classes in a constant.

## [0.6.1] - 2026-11-14

- **State borders and focus rings meet 3:1** (WCAG 1.4.11), made in Figma first. Each token moves to the nearest step of its own hue that reaches 3:1 on every surface it sits on (backgrounds, cards, input and select fills, the segment track), in both modes:
  - `--border-default`: gray-5 to gray-6 in light, gray-8 to gray-5 in dark (was 1.77:1 and 1.31:1 on the worst surface).
  - `--border-state-hover`: gray-7 in light, gray-4 in dark, one step stronger than default.
  - `--border-state-active`: blue-9 to blue-10 in light.
  - `--border-state-focus`: blue-7 to blue-11 in light (was 1.46:1), one step darker than active so a focused active card still reads as focused. Dark is unchanged.
  - `--border-accent` (a brand slot, so the default brand file changes) and `--border-info`: blue-8 to blue-10 in light.
  - `--border-negative`: tomato-7 to tomato-8 in light.
  - `--control-border`: gray-6 to gray-5 in dark.
  - Disabled edges and `--border-pretty` separators are decorative and unchanged.
- **Also made in Figma:** darker light-mode solid label steps and accent slot (so white badge text meets 4.5:1), the Segments inactive label and a new `--segment-focus-ring`, and the Avatar initials, circles and glyph on the avatar tokens. Re-export checksum `6e99566d` (879 tokens).

## [0.6.0] - 2026-11-13

- **Shape roles** (vois-tokens `DS-SHAPE-001`): the `vois-tokens` item ships a third generated file, `shape-tokens.css`, built from `source/shape.json`. Each role is a behavior:
  - fixed: `--shape-sharp` (0), `--shape-subtle`, `--shape-rounded` and `--shape-soft`, which alias the Figma `--radius-*` roles
  - capsule: `--shape-pill`
  - circle: `--shape-circle`
  - proportional: `--shape-responsive-soft`, `clamp(--radii-16, 4cqi, --radii-40)`. Round corners grow with the container's width.
  - elliptical: `--shape-responsive-elliptical`, `4% / 6%`
- `build-tokens.mjs` checks each role strictly and fails on an unknown type, a missing or extra key, an alias that isn't a radius token, a scale outside 0 to 20cqi, a min not below max, or a percentage outside 0 to 50. `check-registry` fails when `shape-tokens.css` differs from what the generator writes, and counts the roles as known tokens.
- Install: import `shape-tokens.css` after `motion-tokens.css`.
- `vois-tabs` pills use `--shape-pill` and `vois-radio-group` uses `--shape-circle` (`DS-SHAPE-002`), so both need `shape-tokens.css`. Figma's Tab set binds `--radii-24`, which is a capsule at its 28 and 40 heights. The registry uses the role, so a taller tab stays a capsule.
- Shape aliases resolve against the same tokens `vois-tokens.css` is built from, including pending tokens.

## [0.5.0] - 2026-11-13

- **New item `vois-radio-group`** (`vois/radio-group/radio-group.tsx`), shadcn's RadioGroup (Radix) with the same parts, plus `variant` on the item. From the Figma Radio set:
  - A 22 circle. Unselected: a 3px `--control-border` ring. Selected: the ring grows to 8px in `--control-on`, which leaves Figma's 6px hole, in `--motion-duration-fast` (still under reduced motion).
  - Disabled: `--control-disabled`, and disabled wins over selected. `variant="aux"`: `--control-aux`.
  - Focus: a 2px `--border-state-focus` ring 3px out. A 44 hit area. Arrow keys and one tab stop come from Radix.
- **New item `vois-tabs`** (`vois/tabs/tabs.tsx`), shadcn's Tabs (Radix) with the same parts, plus `variant` and `size` on `TabsList`:
  - `pill` (the default), the Figma Tab set: `size="default"` 28 tall with a 1px border, `size="lg"` 40 tall with a 2px border. Resting `--tab-resting`, hover `--tab-hover`, active `--tab-selected` with `--text-auxiliary`, disabled `--tab-disabled`.
  - `underline`, the Figma Tab Nav set: 48 tall with a 32 tall label box. Active: `--text-primary` and a 2px `--border-accent` edge. Hover: a 1px `--border-state-hover` edge.
  - Disabled wins over active. Focus is a 2px `--border-state-focus` ring, on the pill or on the underline label box.
- **New tokens** `--tab-resting`, `--tab-hover`, `--tab-selected` and `--tab-disabled`: the Figma Tab variables, which had no Web code syntax. Re-export checksum `c53f1c05` (767 tokens).
- Both were checked in Chromium (39 checks), in light, dark and under reduced motion.

## [0.4.0] - 2026-11-13

- **New item `vois-checkbox`** (`vois/checkbox/checkbox.tsx`), shadcn's Checkbox (Radix) with the same API plus `variant`. From the Figma Checkbox set:
  - A 24 box with a 2px `--border-default` inside border and `--radii-4`.
  - Checked and indeterminate: `--control-on` with the mark in `--icon-on-dark`.
  - Disabled: `--control-disabled`, mark `--icon-state-disabled`. Disabled wins over checked.
  - Focus: a 2px `--control-focus` ring 2px outside the box.
  - `variant="aux"`: the Figma Aux set, for a checkbox on a strong color.
  - The hit area is at least `--hit-area-min`.
- **New item `vois-switch`** (`vois/switch/switch.tsx`), shadcn's Switch (Radix) with the same API plus `size`. From the Figma Web Switch and iOS Switch sets:
  - `default` (web) 32 x 20 with a 14 knob; `native` 52 x 32 with a 28 knob (the iOS Switch).
  - Off `--switch-off`, on `--switch-on`, knob `--switch-knob`. Disabled: `--switch-disabled` and an `--icon-state-disabled` knob. Disabled wins over on.
  - Focus: a 2px `--border-state-focus` ring 2px outside the track.
  - The knob slides in `--motion-duration-fast` and stays still under reduced motion.
  - The hit area is at least `--hit-area-min`.
- **Contrast for the control edges** (WCAG 1.4.11, 3:1). Two new Figma tokens, both gray-6:
  - `--control-border`: the unchecked Checkbox and Radio outline. Inputs and Selects keep `--border-default`.
  - `--switch-outline`: a 1px edge on the off Switch track, whose fill is about 1.1:1 on white.
- **Z-index layers** from Figma: `--z-dropdown` 1000, `--z-overlay` 1200, `--z-modal` 1300. `build-tokens.mjs` writes `--z-*` as a whole number with no unit (it wrote px before). The Select list moves from shadcn's `z-50` to `--z-dropdown`.
- **The Figma brand slots show the generic blue default**, the same as `brand-default.json`, not a product's colors. The export writes brand slots as null, so the checksum doesn't change for this.
- **Type audit, second round in Figma:** 198 more text layers bound to exact type tokens, and no mixed-style layers left in component sets. The rest are listed in `FIGMA-TODO.md` as design decisions.
- Re-export checksum `954d63b5` (763 tokens).
- Both components were checked in Chromium, in light, dark and under reduced motion.

## [0.3.1] - 2026-11-13

- **The blues are calmer.** Every Global blue step (`--blue-1` to `--blue-12`) has about 15% less chroma, with the same OKLCH lightness and hue, so contrast barely moves. The blue alpha steps (`--blue-a1` to `--blue-a12`) use the new `blue-8` with their old alpha. The change was made in Figma first. Re-export checksum `48eab083` (758 tokens).
  - Everything that aliases a blue follows: the default primary and accent, info text, icons and borders, the focus border, links and the blue labels.
  - White on the default primary (`blue-10`) goes from 5.57:1 to 5.43:1, so it still meets 4.5:1.

## [0.3.0] - 2026-11-13

- **New item `vois-button`** (`vois/button/button.tsx`). It replaces shadcn's `components/ui/button.tsx` and keeps its variant and size names, so `buttonVariants({ variant: "outline" })` in other shadcn components still works.
  - Heights: 28, 36 (the default, for web) and 48 (for native), plus 56 for `circular`.
  - Built in: the `--border-state-focus` ring, a `--hit-area-min` hit area, and disabled tokens.
  - Press: scales to 0.96 on a pointer press only, never on a keyboard press or under reduced motion, timed by the motion tokens. `static` turns it off.
  - Layout as in the Figma Primary Button. Container padding is 8 / 12 / 12. A label frame holds centered text with 4px on each side, so text sits 12 / 16 / 16 from the edge. Type is `font-semibold` at 14 / 16 / 18. Icons are 16 / 20 / 20.
  - `leadingIcon` and `trailingIcon` props. The Button sizes them and marks them `aria-hidden`, and they work with `asChild`. An icon passed as a child, shadcn style, still sits beside the text.
  - `loading`: the Vois spinner over the content. The width stays the same, the accessible name is kept, `aria-busy` and `aria-disabled` are set, and clicks, Enter and form submits are cancelled without bubbling, including an `asChild` child's own `onClick`. A caller's `aria-disabled` is handled the same way.
  - Checked in Chromium in light, dark and a dark section.
- **New items `vois-input` and `vois-select`** (Radix Select). Sizes `default` 36 (web), `native` 48 and `compact` 32 (inline in tables). The states (hover, 2px focus, error, disabled, read-only, prefill) and the Select list come from the Figma Input Field, Dropdown Field, Dropdown Menu and Menu Item.
- **Primary text is a brand slot**, `--action-primary-text`, 17 slots in all. It is white on the blue default and black on Goldie in Figma. `vois-theme` maps `--primary-foreground` to it, and the Button reads it.
  - **Breaking for brand files.** A brand file with the earlier 16 slots now fails `build-tokens.mjs --brand` with "brand slot --action-primary-text has no value". Add `"--action-primary-text"` with the color your primary labels and icons use on `--action-primary-resting`, and check it meets 4.5:1 on every primary fill.
- **The default primary is one step darker:** resting and focus `blue-10`, hover `blue-11`, pressed `blue-12`. White on `blue-9` is about 3.5:1, which fails AA for the 14 and 16px labels. White on `blue-10` was about 5.6:1 (about 5.4:1 after 0.3.1).
- **The checker** allows the five Radix Select runtime properties (`--radix-select-trigger-width` and the others Radix documents) in component files, by exact name, so a misspelled one still fails.
- **New item `vois-spinner`** (`vois/spinner/spinner.tsx`): the loading.dev arc (MIT, credit kept).
  - Timing: one turn per `--motion-duration-spin`.
  - Under reduced motion it stays still.
  - It uses `currentColor` at 16 / 20 / 24.
  - On its own it is wrapped in a `role="status"` span with screen-reader text.
  - It uses Tailwind's built-in `spin` keyframes.
- **Synced with Figma** (2026-11-13).
  - **New variables.** The size, field, hit-area, motion and typography tokens are now Figma variables, and the re-export matched its checksum. `figma-pending.json` is empty.
  - **Typography.** `--font-size-*` and `--line-height-*` are px, `--font-weight-*` are unitless, and the role aliases `--font-heading`, `--font-body` and `--font-mono` are added.
  - **Brand slots.** The four font families are now brand slots, 16 in all. The export writes them as `null`, and the default uses generic system stacks. The written font inherits.
  - **Generator.** It writes weights unitless and accepts font-family lists as `{ css }`, validated.
- **Button follows the Figma button sets.**
  - Focus is a 2px ring in each variant's focus color, with no focus fill.
  - Disabled text is `--text-state-disabled`.
  - Secondary's border goes transparent when pressed.
  - Ghost reads `--text-state-*`, `--bg-hover` and `--action-ghost-pressed`.
  - New variants `auxiliary` and `destructive-soft`. `destructive-soft` has its own disabled tokens: `--soft-negative-disabled` and `--soft-negative-disabled-text`, Global red alpha, new in Figma.
  - The label uses `--font-weight-semi-bold` and `--font-size-*` / `--line-height-*` (14/20, 16/24, 18/26) through `text-[length:…]` and `leading-[…]`, so a caller's `text-sm` still overrides. The font family is inherited from the page.
  - Each variant sets its own focus ring color. The base sets only the width and offset.
- **Tokens not yet in Figma** (the mechanism stays for the next time Figma is unreachable).
  - `source/figma-pending.json` adds `--size-36`, `--size-field-web`, `--size-field-native`, `--hit-area-min` and the motion tokens (with `--motion-duration-spin`), and moves `--size-action-large` from 40 to 36.
  - The build fails once Figma exports an entry, so the file empties as Figma catches up.
  - `FIGMA-TODO.md` lists each one, plus the Button questions to check against the Figma component. The checker fails if a pending token is missing from it.
- **`vois-tokens` ships `motion-tokens.css`.** The vois-tokens detector allows literal durations and curves only in a file with that name, so the generator writes the `--motion-*` tokens there. The checker requires its values to equal the starter block in `vois-tokens/references/animation.md`.
  - Durations are written in ms.
  - An easing curve comes from a Figma string variable as `{ "css": "cubic-bezier(...)" }`, accepted only on a `--motion-ease-*` token.
  - `scripts/figma-export.js` exports string variables that way.
- **The checker** fails a component file that reads a custom property that is neither a generated token nor defined in the file. That covers `var(--x)` and Tailwind's `(--x)`, exact names only, fallbacks and comments included.

## [0.2.0] - 2026-11-13

- **The theme points at the Figma token names.** `--destructive` reads `--base-negative` and `--ring` reads `--border-state-focus`, following `vois-tokens` 1.29.0. If your workspace defined `--color-negative` and `--color-focus-ring`, define the Figma names instead.
- **New item `vois-tokens`:** default values for every Vois token, generated from the Vois Figma variables (`source/figma-export.json`) with a generic blue brand (`source/brand-default.json`). Colors in OKLCH, light in `:root` and dark in `.dark`, aliases kept as `var()`, the grid margin and gutter as `clamp()` lines, five elevation shadows. The export never holds brand values: the twelve brand slots are `null` and the brand file fills them. `scripts/figma-export.js` re-exports from Figma; `scripts/build-tokens.mjs` builds, checks (`--check`), verifies an export's checksum (`--verify-export`) and builds a product's own brand (`--brand`).
- **A dark section re-resolves every alias.** `.dark` declares every alias again, not only tokens whose values differ, because a `var()` resolves where it is declared: `--select-focus` would otherwise keep its light value inside a `.dark` section of a light page.
- **`vois-theme` maps every shadcn variable in `DS-TOKEN-005`** (19), up from two. `--radius` is `--radii-8`, so shadcn's md, lg and xl land on 6, 8 and 12.
- **The checker** compares `vois-tokens.css` with the generator's output, checks that `MAPPINGS` equals the `DS-TOKEN-005` table in both directions and that every target is a generated token, and reports token-build errors instead of skipping.
- **The checker pins the mappings to `DS-TOKEN-005`,** the full shadcn table in `vois-tokens`. A variable not mapped yet is reported as "not in MAPPINGS yet", pointing at the token `DS-TOKEN-005` names for it.
- **README.** The table of shadcn names "Vois does not name" is gone: Vois names them all, in Figma. The full mapping is `DS-TOKEN-005`.

## [0.1.0] - 2026-11-13

- **Scaffold.** `registry.json` with one item, `vois-theme`: a CSS file that points shadcn's `--destructive` at `--color-negative` (`DS-COLOR-009`) and `--ring` at `--color-focus-ring` (`DS-A11Y-002`) in a `:root:root, .dark.dark` block, so it holds on the whole page and in a dark section, wherever it is imported. It ships no color values.
- **Checks.** `scripts/check-registry.mjs` checks item types, names, paths, install targets, symlinks, unlisted files, file types, detector findings, and that each CSS mapping points at the one token its rule names, with no install. `npm run build` runs `shadcn build` for the schema check.
- **Pin.** shadcn 4.23.0, installed with `--ignore-scripts`.
