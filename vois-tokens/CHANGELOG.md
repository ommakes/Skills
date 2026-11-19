# Changelog

All notable changes to the Vois Tokens skill are documented here.

---

## [1.47.0] - 2026-11-19

### Added
- **A CI gate, `scripts/check.mjs`.** The hook only nudges, so an agent could ignore it and the code still merged. `check.mjs` runs the same detectors over files or folders and exits 1 on findings from required rules (`--fail-on recommended` or `preferred` widens it), 2 on bad input. Severity is each rule's own in `data/vois-rules.json`; the lookalike checks and `DS-SLOP-002` count as recommended, and any other finding with no severity counts as required. A baseline (`--baseline FILE`, `--update` to write it) lets a project adopt the gate and fail only on new findings; a finding is its rule, root-relative file and full line text, and duplicates are counted. The shared hook config's waivers apply, validated (a wrong type or an empty glob is an error, not a waiver of everything), with file globs read by the hook's own matcher (so the hook and the gate agree) and values matched against the line, never the message; `config.local.json` and the hook's on/off switch do not apply. A malformed team override file is an error, because skipping it would drop the team's tighter limits. Output as text, GitHub annotations or JSON, and a markdown summary. Generated and vendored folders are skipped and symbolic links are not followed. `detect.mjs` is unchanged and still always exits 0. Tests in `scripts/check.test.mjs`, in CI and the push list. `references/hooks.md`, "CI gate", documents it.
- **A reusable workflow, `.github/workflows/design-check-reusable.yml`**, so another repo can run the gate on its pull requests with `paths`, `fail-on`, `baseline` and a pinned `tools-ref`.
- **A detector for `DS-TOKEN-001`** (`scripts/token-layer-checks.mjs`): a Global palette step used as a value (`var(--blue-9)`, `bg-(--blue-9)`, `bg-[color:var(--gray-a4)]`, a style object string, a CSS declaration). Aliasing a step in a custom property passes, so token files and theme blocks are not flagged. Advisory in the hook; `required` in the gate, because the rule is. The rule's `verification` is now `detector`. The registry's own components and token files have no finding. Known gaps: a product palette with other hue names, and a step laundered through a custom property (a component's own, or a Tailwind `@theme` alias used as `bg-blue-9`).

### Fixed
- `SKILL.md` said the detector runs nine lookalike checks. It runs ten.

Ported from `ommakes/vois-skills` (#108). Here the reusable workflow checks out this public repo, so a caller needs no token.

## [1.46.3] - 2026-11-19

### Fixed
- The hook's `ignoredFiles` setting had no effect when the edited path was absolute, which is what Claude Code, Cursor and Codex send. `isFileIgnored()` in `scripts/hook-lib.mjs` tested the glob against the raw path, so `hook-admin.mjs ignore-file "src/legacy/**"` (the example in `references/hooks.md`) never matched. Globs now match the path relative to the project root (the `cwd` in the payload), with `/` as the separator, in both `hook.mjs` and `hook-before-edit.mjs` (Cursor).
- A file outside the project root never matches a relative glob, not even `**`, and a missing or non-string path never throws. A leading `./` on a glob is dropped, `\` counts as `/` in paths and globs, and on a Windows path the root part compares without case. An absolute glob (`/...`, `C:/...`) still matches the absolute path (without case on a Windows path); one that starts with a single `/` is also read from the root, as team scopes are. Empty or non-string globs match nothing.
- `pathFromRoot()` in `scripts/team-overrides.mjs` is the one place that turns a hook path into a root-relative one. Team scopes use it too, so a team scope now also matches a Windows backslash path. No rule changed.

## [1.46.2] - 2026-11-17

### Changed
- `references/grid.md` points to the registry item `vois-panel-layout` (registry 0.21.0): `PanelLayout` and `usePanelLayout` render `DS-PANEL-002` to `DS-PANEL-006`. `references/elevation.md` lists the docked Panel overlay at Large (`--shadow-large-right`, `--shadow-large-left`). `data/elevation-map.json` has two built rows for it, `panel-overlay-right` and `panel-overlay-left`, checked by `scripts/elevation-map.mjs`. No rule changed.

## [1.46.1] - 2026-11-17

### Changed
- `references/grid.md` points to the registry item `vois-page-grid` (registry 0.20.0): `PageFrame` and `CollectionGrid` render `DS-GRID-003` to `DS-GRID-007`. Docs only. No rule changed.

## [1.46.0] - 2026-11-16

### Added
- `references/glass.md`, "Edge fade", and `DS-GLASS-011` to `DS-GLASS-015`: a blur that tapers off at the edge of a scroll area under sticky chrome. One element holds the blur and an eased nine-stop mask (never the mask on a parent: the blur disappears). Blur is the strong tier, 24 at most, so a generator's `blur(32px)` is still flagged by `DS-GLASS-004`. An optional layered stack of up to 4 sibling layers at 100, 75, 50 and 25% height gives a progressive blur; stacked blurs compound, so the radii add in quadrature and must stay within `--glass-blur-strong` (4, 8, 12 and 18 give 23.4). Gradient fallback and reduced-transparency behaviour. Both example blocks are tested to raise no glass finding.
- Checked in Chromium 153: edge widths behind one layer and behind the stack, compounding of stacked blurs, and the parent mask or opacity removing the blur. Not measured: paint cost (headless, capped at 60 fps), Safari, Firefox.

## [1.45.0] - 2026-11-16

### Added
- `references/accessibility.md`, new "Components" section, and `DS-A11Y-029` to `DS-A11Y-037` in `data/vois-rules.json`: what the code that uses a component must supply. Radix and native elements already handle roles and keys. The rules cover what they cannot guess: tooltip focus and no sole information (029), names for Select, Combobox and Command (030), `aria-describedby` and `aria-invalid` on fields (031), tab names (032), table name and header scope (033), toast announcement and no sole copy (034), switch and checkbox labels (035), Escape and focus return for menus and popovers (036), a text name for loading states (037). All required, advisory, judgment only; no detector yet.

## [1.44.1] - 2026-11-16

### Added
- `references/grid.md`, "In CSS" under Collections (`DS-GRID-006`, `DS-GRID-007`). The reference only had the formula and "a container query on the region". It now has the CSS: `container-type: inline-size` on the region, `repeat(auto-fill, minmax(...))` for the fit, the cap as the second term inside `max()`, and `@container` rules that set `--cap` per region class.
- Checked in Chromium 153 against the formula (`--item-min-card` 200px, gutter 16px): the column count matched at region widths from 150 to 1500px, and a cap of 4 on every width gave 2 columns at 450px and 3 at 700px. `DS-GRID-007` and `DS-GRID-004` stay quiet on the snippet.
- No rule text, rule IDs or detectors changed.

---

## [1.44.0] - 2026-11-16

### Added
- `DS-COLOR-010`, "Write the interpolation space in a gradient" (`references/color.md`, `data/vois-rules.json`). Recommended, advisory, judgment only. A gradient between saturated or brand colors says `in oklch` (or `bg-linear-to-r/oklch` in Tailwind v4) and does not rely on the default. Also covers the hue path, gamut at the 25, 50 and 75% points, and contrast under text.
- `DS-COLOR-011`, "Eased stops". Preferred, advisory, judgment only. Use a color hint for a simple skew. For a smoother curve, sample an easing curve at 5 to 7 even steps and mix the color at the eased amount with `color-mix(in oklch, ...)`.
- The rule text was checked in Chromium 153 before it was written:
  - The default space follows the color syntax. Hex, `rgb()`, `hsl()` and named colors interpolate in sRGB. `oklch()`, `lab()` and `color()` interpolate in Oklab. So "avoid the default because it is sRGB" is not true for Vois tokens written in `oklch()`. The rule says "do not rely on the default" and gives the reason.
  - On a blue to yellow gradient the 50% point has chroma 0.024 in sRGB, 0.046 in Oklab and 0.143 in OKLCH.
  - In a test of four saturated pairs, three had a 50% point outside sRGB when interpolated in OKLCH. Chromium clips each channel. The rendered pixels matched a per-channel clip.
  - Piecewise-linear stops against smoothstep: largest error 9.6% of the range with 3 stops, 3.5% with 5, 1.7% with 7, 1.0% with 9.
- Still judgment-only. No detector reads gradients. A detector for `linear-gradient()` without `in <space>` is possible, but a hex gradient between near hues is fine, so it would need a color-distance test to avoid noise.

---

## [1.43.1] - 2026-11-16

### Changed
- `DS-SHAPE-007` (`references/shape.md`, `data/vois-rules.json`): guidance for `superellipse()`. `squircle` is `superellipse(2)`. A surface may tune the smoothing with `corner-shape: superellipse(n)` where `n` is from 1 to 4. A table says what 1, 1.5, 2 and 3 to 4 look like. `n` below 1 (bevel, scoop) and `infinity` are out. The same support check covers it.
- The note that the border, shadow and focus outline follow `corner-shape` was checked in Chromium 153 with a focus-visible outline on a squircle button. It does follow. An older write-up said it does not, so this is worth a re-check in other browsers when they ship the property.
- Still judgment-only. No detector reads `corner-shape` values.

---

## [1.43.0] - 2026-11-16

### Added
- `DS-MODAL-005` rule text changed: it said "at most two buttons, a third is a link"; it now says two buttons on the right, and a third that is a ghost or link button on the left only when the dialog is wider than 400px. Also in `references/overlays.md` and vois-patterns `dialogs-and-action-sheets.md`.
- Detectors in `scripts/overlay-checks.mjs` for two dialog rules that were judgment-only. Both warn, neither blocks.
  - `DS-MODAL-005`: a `DialogFooter` or `AlertDialogFooter` with more than two buttons that are not ghost or link, or more than three in all (`Button`, `AlertDialogAction`, `AlertDialogCancel`, `DialogClose`). The rule says a primary and a secondary action sit on the right; a third is a ghost or link button on the left, and only when the dialog is wider than 400px. Width and side are layout, so they are not checked. A `<DialogClose asChild>` wrapper is not counted. A conditional that shows one of two buttons counts as two.
  - `DS-MODAL-006`: a `Dialog`, `AlertDialog`, `Sheet` or `Drawer` opened between the open and close tags of another one in the same file. It reports only when the outer root closes in the same file, so a cut-off or mismatched file stays quiet.
  - `data/vois-rules.json`: both rules move from `judgment` to `detector`. Tests cover both directions for every guard, and each guard was removed in a copy to check a test fails.
- Not built: a detector for `DS-ELEVATION-010`. `DS-ELEVATION-007` already flags every inset shadow with blur, and a pattern cannot tell a recessed or pressed element from any other, so a second check would only repeat the first. It stays `judgment`.

## [1.42.0] - 2026-11-15

### Added
- `references/glass.md` with `DS-GLASS-001` to `DS-GLASS-010`, from the frosted-glass standard: glass is opt-in and goes only on chrome and floating layers, including an icon button over media (at most 3 per viewport); three tiers (subtle 8, standard 16, strong 24, with saturate 150 / 160 / 180%); the `-webkit-` twin; blur from the tokens; never animate the blur; no glass inside glass; opaque fallback first and again under reduced transparency; contrast at the worst patch behind; glass shadows and the one scrim; Figma setup. The tints, edges and highlights are a first pass, snapped to the White Alpha palette (light tint 60 / 70 / 80%, rounded up from the standard's 55 / 65 / 75% for legibility; dark 8 / 12 / 20%).
- Tokens from Figma: `--glass-tint-*`, `--glass-stroke-*`, `--glass-highlight-*` (Colors, aliases of `--white-a*`, light and dark), `--glass-blur-*` (8, 16, 24) and `--glass-shadow-*` (from the `Glass/*` and `Glass/Dark/*` effect styles). Export checksum `bcc06a0a` (903 tokens, 12 shadows, 10 dark shadows). `registry/scripts/figma-export.js` exports the glass effect styles' drop shadows.
- Detectors in `scripts/glass-checks.mjs`: `DS-GLASS-003` (a `backdrop-filter` with no `-webkit-` twin in the same rule or style object, or a twin with another value), `DS-GLASS-004` (a literal backdrop blur or a Tailwind `backdrop-blur` size), `DS-GLASS-005` (`backdrop-filter` in a transition, `@keyframes` or a motion prop). All `quality`. Eight tests in `scripts/detect.test.mjs` (191 to 198), plus lines in `__fixtures__/bad.tsx` and `bad.css`. Each guard was removed in a copy and a test failed without it.

### Changed
- `DS-ELEVATION-007`: a glass surface's `--glass-shadow-*` counts as a tier token. `references/elevation.md` points to `glass.md`.
- `references/hooks.md` has rows for the three glass detectors and their gaps. The SKILL reference table, checklist and quick reference name glass.

## [1.41.0] - 2026-11-15

### Added
- `DS-ICON-003` to `DS-ICON-006` in `references/iconography.md`, from the icon-button standard. Sizes follow the Button heights (`icon-sm` 28/16, `icon` 36/20, `icon-lg` 48/24, visual/glyph) and step up one size on a coarse pointer (36/20, 48/24, 56/28). The pointer picks the size, not the screen width, so there is no tablet column. Targets of neighbors touch but never overlap (16px between `icon-sm` buttons on a fine pointer). The accessible name says the action. Placement by role: app bar, toolbar, table row, close, inside a field, bottom nav, primary action, AI chat (message actions are `icon-sm` with no background; there is no 20px or 24px icon button), and a chip's remove control as the one place a smaller visual is allowed.
- `DS-ICON-007`: styles by background. No background (`ghost`, the default) and Soft (`soft`, a light gray resting fill one step above the ghost's hover). New tokens from Figma: `--action-icon-soft-resting`, `-hover`, `-pressed`, `-disabled` (black 8 / 12 / 20 / 4% in light, white in dark).
- `--hit-area-coarse` (48), from Figma (`Semantic/Hit area/hit-area-coarse`). Export checksum `93850e82` (896 tokens, with the Soft tokens).
- A detector for `DS-ICON-005` (`scripts/registry.mjs`): an icon-size `<Button>` with no `aria-label`, no `aria-labelledby` and no text among its children. It reads children with braces and quotes in mind, so a `>` in `=>`, a JSX comment, an object spread inside a value or `aria-label={undefined}` does not hide a missing name. It skips a prop spread, a computed size and an expression child, because it cannot read them. Five tests in `scripts/detect.test.mjs` (186 to 190), plus a line in `__fixtures__/bad.tsx`. Each guard was removed in a copy and a test failed without it.

### Changed
- `DS-A11Y-001`: on a coarse pointer the minimum hit area is `var(--hit-area-coarse)`. `references/accessibility.md` shows the media query.
- `DS-COMPONENT-007`: `icon-lg` on a coarse pointer is 56, the one other control at that size besides the circular action.
- The icon size table in `references/iconography.md`: 20px is the default icon button's glyph and 24px the large one's (it said 24px for every standalone icon button).
- `DS-ICON-002`: the Button sets one more glyph size on its own, 28 for `icon-lg` on a coarse pointer. It is never set by hand, and the detector's sizes are unchanged.
- `references/hooks.md` has a row for `DS-ICON-005`. The SKILL checklist and quick reference name the icon-button rules.

## [1.40.0] - 2026-11-15

### Changed
- `DS-TOKEN-005`: shadcn `popover` maps to `--elevation-surface-popup` instead of `--bg-card`, so a stock shadcn popover, menu or select list gets the dark popup fill (one step above a Dialog). `card` stays on `--bg-card`. The table in `references/figma-variables.md` and the rule text in `vois-rules.json` say the same, and `registry/scripts/check-registry.mjs` fails if they drift. `references/elevation.md` no longer lists this as an open decision.

## [1.39.0] - 2026-11-15

### Added
- `--elevation-surface-popup` (registry 0.13.0): a fourth dark fill step (`--warm-gray-8`), one step lighter than a Dialog's `--elevation-surface-raised`. A menu, select list or hover card opens above a Dialog, so in dark its fill now follows the layer. Light is unchanged.

### Changed
- `DS-ELEVATION-005` names the popup fill. `references/elevation.md` has the token row and replaces the "known gap: a popup opened over a Dialog" paragraph with the decided behavior. The element map dark note for Medium names the popup fill.

## [1.38.0] - 2026-11-15

### Added
- Detectors for `DS-ELEVATION-007` and `DS-ELEVATION-006` (`scripts/elevation-checks.mjs`, with helpers in `scripts/check-utils.mjs`; regex level like the grid checks). `-007` flags a shadow layer with blur that is not a tier token: `box-shadow` (also `-webkit-` and `-moz-`), a `boxShadow` key (also quoted, in a ternary, in a StyleX conditional object, or assigned on `el.style`), `shadow-[...]` and `inset-shadow-[...]`, and Tailwind's `shadow-2xs` to `shadow-2xl` inside `@apply` or a string. Zero-blur rings, tokens, `none`, custom property definitions, selectors, `text-shadow-*` and `drop-shadow-*` pass. `-006` flags a panel fixed to one edge, in one class string, whose resting shadow is the token for another edge or the all-sides Large or XLarge. Base, Small and Medium are not flagged, so a fixed app bar is left alone. Both are `quality`, so they warn and do not block.
- 11 new tests in `scripts/detect.test.mjs` (173 to 184), three of them the per-rule fixture checks: each syntax, and inputs from the other side (a ring, a token, a corner, `inset-0`, a conditional dock or shadow, a different property, an app bar, a comment, a string with `/*` in it, a value that never closes, a very long file). Guards were removed one by one in a copy, and each guard that does anything has a test that fails without it. Several guards turned out to be redundant (another check already covered them) and were removed. The built registry components and the generated token file raise no elevation finding.

### Changed
- `DS-ELEVATION-006` and `-007` now say `verification: detector`. `DS-ELEVATION-007`'s text names the three forms it reads. `references/hooks.md` has a row for each with its known gaps. `references/elevation.md` no longer says there is no detector.

## [1.37.0] - 2026-11-15

### Added
- Docked-panel shadows (registry 0.12.0): `--shadow-large-right`, `-left`, `-bottom`, `-top`, light and dark. `DS-ELEVATION-006` names them. The element map checks that a docked element has a token for its side and tier, in light and in dark, and fails closed without the registry export (23 tests).

### Changed
- `data/elevation-map.json`: the Choice Card is Base at rest, Small on hover and flat when pressed (resting card only). The Sheet rows name their tokens.

## [1.36.0] - 2026-11-15

### Added
- `references/questionnaire-ui.md` with `DS-A11Y-024` to `-028` and `DS-RESPONSIVE-011` to `-013`: required labels, focus per question, reduced motion, sticky bar and keyboard, 56px option rows (an exception to the density specs), poll and quiz results.
- `data/tokens.questionnaire.json`: target sizes, font minimum and result bar timing.

## [1.35.0] - 2026-11-15

### Added
- Dark elevation tokens (registry 0.11.0): `--elevation-surface-small`, `--elevation-surface-raised`, `--elevation-hairline`, `--black-a0`, and dark values for `--shadow-base` to `--shadow-xlarge`. Base and Small draw nothing in dark, Medium and up are blacker.

### Changed
- `DS-ELEVATION-005` now names the tokens and no longer says they are missing. `references/elevation.md` has the token table. `data/elevation-map.json` dark notes name the fills. `DS-ELEVATION-006` (directional shadows) is still waiting on E3.

## [1.34.0] - 2026-11-15

### Added
- `DS-ELEVATION-003` to `-012` (all `judgment`, advisory, no detector yet): state changes (hover up one tier at most, pressed down one or flat, dragged high, disabled flat, focus never changes elevation), resting cards keep a Base or Small shadow, dark never uses shadow alone, the sign rule for docked panels, no raw shadow literal with blur, at most two tiers at rest, Large and XLarge only on overlays, inset only for recessed or pressed, cross-fade instead of animating big shadows, contrast on every elevated fill. A zero-blur ring is exempt from the literal and inset rules.
- `data/elevation-map.json` with its schema, and `scripts/elevation-map.mjs` with 18 tests. The map lists 12 elements: 9 built ones and 3 proposed ones (right and bottom sheet, dragged item). For built ones the check confirms the registry item exists and its source (comments ignored) uses each `--shadow-*` token the map names. It does not check which state uses the token. It fails closed when `registry/registry.json` is missing.

### Changed
- `references/elevation.md` now matches the built components: Card, Choice Card and the Segmented Control indicator rest at Base, Card hover, Switch knob and Hover Card are Small, menus and select lists are Medium, Dialog and Tooltip are Large. XLarge is unused except for a dragged item or a full-screen surface. The old table said card Small, popover Large and modal XLarge. No component changed. `DS-ELEVATION-002` text follows, and now says layers run in role order with an exception for a popup opened from a dialog.
- Pointers added from `DS-SLOP-010` and `DS-SURFACE-007` to the elevation rules.

## [1.33.1] - 2026-11-15

### Changed
- `references/layout-and-responsive.md`: `--width-dialog-sm` is 344 and `--width-dialog-lg` is 560 (proposed). Both are Figma variables (`Semantic/Dialog/width-dialog-sm` and `-lg`, Size collection) and are in the default tokens. `DS-LAYOUT-WIDTH-004` and `PATH-D-SIZE` named the tokens, but no value existed anywhere. No rule changed.

## [1.33.0] - 2026-11-15

### Added
- `references/overlays.md` and twelve rules (all `judgment`, advisory, no detector):
  - `DS-MODAL-004` the body scrolls and the header and footer stay (the registry Dialog does not do this yet), `DS-MODAL-005` two footer buttons at most, `DS-MODAL-006` never nest modals, `DS-MODAL-007` never use a modal for navigation.
  - `DS-RESPONSIVE-008` below `--breakpoint-md` a choice is a bottom sheet (90dvh at most, stacked footer, visible close), `DS-RESPONSIVE-009` a dialog with a text field is a full-screen form, `DS-RESPONSIVE-010` safe-area padding.
  - `DS-A11Y-019` accessible name and an AlertDialog description, `DS-A11Y-020` first focus (Cancel in a destructive AlertDialog), `DS-A11Y-021` return focus, `DS-A11Y-022` Escape closes a dialog, the scrim closes a Dialog but not an AlertDialog, and Escape is blocked only for money, delete or legal, `DS-A11Y-023` every drag has a tap or arrow alternative.

### Changed
- `references/layout-and-responsive.md`: the `dvh` row names bottom sheets and full-screen forms, and the `svh` row says desktop modals.
- "Action sheets" in `DS-ANIMATION-002` are now "bottom sheets".

## [1.32.0] - 2026-11-14

### Added
- `DS-A11Y-018`, "The ring follows the control" (`references/accessibility.md`, `data/vois-rules.json`). The focus indicator is an external ring: `outline` of `--focus-ring-width` (2px) at `--focus-ring-offset` (2px) in `--border-state-focus`. The control keeps its 1px border and its size. Never set `border-radius` on focus: the browser already draws an outline at the control's radius plus the offset. Clipped containers use a negative offset. A focused invalid field keeps its ring.

### Changed
- The focus color is Blue-10 in light (4.9:1 on the page, 5.4:1 on white) and Blue-8 in dark (6.7:1). It was Blue-11 and Blue-5, 8.6:1 and 13.8:1, far above the 3:1 WCAG asks for. `--control-focus` (Checkbox and Radio) was Blue-7, 1.6:1 on the page, and is now the same token.
- The `:focus-within` example in `accessibility.md` draws the ring, not a border color change.

## [1.31.5] - 2026-11-14

### Changed
- `DS-TOKEN-005`: the shadcn `input` variable points at `--input-border`, not `--border-default`. `--input-border` is a new Figma token: Gray-5-5 (#858585) in light and Gray-5 in dark. It is the lightest gray whose edge meets 3:1 (WCAG 1.4.11) on the page and on the resting input fill. `references/figma-variables.md` and `data/vois-rules.json` carry the new mapping. No detector changed.

## [1.31.4] - 2026-11-14

### Changed
- The z-index layers are reordered in Figma and in the default tokens: `--z-modal` 1300, `--z-dropdown` 1400, `--z-overlay` 1500 (they were 1000, 1200 and 1300). A menu, select, hover card or tooltip opened from inside a Dialog used to render behind it. `references/elevation.md` and `references/figma-variables.md` state the order. No rule or detector changed.

## [1.31.3] - 2026-11-14

### Fixed
- `DS-MODAL` no longer flags a file that imports the project's own Dialog. It matched any file with `<Dialog` or a function named `...Dialog` that did not import Radix's dialog, so a `CommandDialog` wrapper around the design system's Dialog was reported as a custom modal. An import of a component whose name starts with `Dialog` from a module named `dialog` (`@/components/ui/dialog`, `./Dialog`, `./dialog/index`, with or without an extension) now counts, because that Dialog does the focus trap and `inert`. A hand-built modal is still flagged, even if the file imports a helper such as `openDialog` from `@/lib/dialog`, or a Dialog from `dialogs-old`.

## [1.31.2] - 2026-11-14

### Added
- `LOOKALIKE-012` (watch tier, advisory): a round `div` or `span` of avatar size (24 to 80px) whose first content is an `<img>` or one or two capital letters, in a file with no Avatar import. A dot, a hero image, an icon, a word and a responsive-only size do not match. Documented in `references/hooks.md`.

### Changed
- The `LOOKALIKE-*` detector rules skip files under `registry/vois/` as well as `components/ui/`. The registry sources install as `components/ui/<item>.tsx`, so a raw `<button>` there is the base element. Windows, `./`, root-relative and absolute paths all match, and `myregistry/vois/` and `registry/voisx/` do not.

## [1.31.1] - 2026-11-13

### Added
- `--breakpoint-expanded`, 840px (`52.5em`), in the breakpoint table of `references/css-architecture.md`, with a pointer in `references/grid.md`. It is the Android expanded window class, named for it on purpose. It is a breakpoint token and not a grid class. The four grid classes do not change.

## [1.31.0] - 2026-11-13

### Added
- `references/shape.md` and rules `DS-SHAPE-001` to `DS-SHAPE-007`: corners are a behavior, not only a number.
  - `DS-SHAPE-001`: choose a shape role before a number. The roles are `--shape-sharp`, `-subtle`, `-rounded`, `-soft`, `-pill`, `-circle`, `-responsive-soft` and `-responsive-elliptical`. Prefer the existing component, then a role, then an adjustment, and a new value last.
  - `DS-SHAPE-002`: controls keep the fixed control radius. Tags, chips, pill tabs, segmented controls and status dots are pills, and avatars are circles.
  - `DS-SHAPE-003`: large visual surfaces that resize use `--shape-responsive-soft`, round corners that grow with the container's width, clamped.
  - `DS-SHAPE-004`: elliptical corners only on purpose.
  - `DS-SHAPE-005`: no one-off radii. Name the missing role instead.
  - `DS-SHAPE-006`: the concentric rule applies between fixed roles only.
  - `DS-SHAPE-007`: continuous (squircle) corners as an enhancement on the soft and responsive roles.
- The registry's `vois-tokens` item ships the roles in `shape-tokens.css`, generated from `registry/source/shape.json`.

### Changed
- `references/surfaces.md`: the concentric rule points to the shape roles.
- The Pre-Submit Checklist has a shape line.

## [1.30.1] - 2026-11-13

### Changed
- `references/figma-variables.md`: a new row for the z-index layers. `--z-dropdown`, `--z-overlay` and `--z-modal` are now Figma variables in the `Values` collection, written as whole numbers with no unit, and paired with the elevation tiers (`DS-ELEVATION-002`).

## [1.30.0] - 2026-11-13

### Added
- `DS-COMPONENT-007` (`references/components.md`): control heights come from the size tokens. Button heights are 28 (`--size-action-medium`), 36 (`--size-action-large`) and 48 (`--size-action-x-large`). 36 is the web default and 48 the native default. The circular action is 56 (`--size-action-circular`), and no other action or control is 56 (an avatar can be). Input and Select use `--size-field-web` (36) on web and `--size-field-native` (48) on native. A Button next to a field matches its height.
- `references/figma-variables.md`: the Size row lists `size-field-*` and `hit-area-min`, and a new Motion row. The tokens decided before they reached Figma are named, with a pointer to `registry/FIGMA-TODO.md`.

### Changed
- `references/components.md`: the `buttonVariants` example uses Vois tokens and the 28, 36 and 48 sizes. `text-` and `border-` colors carry a `color:` type hint, because `tailwind-merge` in shadcn's `cn()` otherwise drops `text-sm` or the color. The example points to the registry `vois-button` item for the full component.
- `references/animation.md`: the registry's `vois-tokens` item ships the starter values as `motion-tokens.css`. New token `--motion-duration-spin` (800ms), one turn of a looping spinner. It times a loop, not a transition, so the 300ms limit doesn't apply.

- `DS-TOKEN-004`: the four font families (`--font-family-brand`, `-system`, `-written`, `-mono`) are brand slots too, so 16 in all. The default brand uses generic system stacks.
- `references/figma-variables.md`: a Typography naming row. Sizes and line heights are `--font-size-*` and `--line-height-*`, not `--text-*`, which Tailwind reads as font sizes. The size, field, hit-area and motion tokens are Figma variables now, not pending.
- `references/typography.md`: the role tokens alias the Figma font families.

### Fixed
- `DS-ANIMATION-004` (detector) counts an arbitrary Tailwind animation (`animate-[spin_1s_linear_infinite]`) as animation. It no longer counts `animate-none` on its own, and it accepts Tailwind's `motion-reduce:` and `motion-safe:` as reduced-motion handling. Before, a spinner written as an arbitrary `animate-[...]` class passed even when it never stopped, and one that stopped through `motion-reduce:` was flagged. `references/hooks.md` says so.
- `--size-action-large` is 36, not 40. That is a pending Figma change: see `registry/FIGMA-TODO.md`.

## [1.29.1] - 2026-11-13

### Fixed
- `SKILL.md`: the marketing reference row says gaps above 128px, matching `DS-MKT-008` and `references/marketing-type-and-spacing.md` (the product scale ends at 128). The `data/vois-rules.json` category list now names grid and panels, data tables, and marketing type and spacing.

## [1.29.0] - 2026-11-13

### Added

- **`references/figma-variables.md`, with `DS-TOKEN-001` to `005`.** The Vois tokens are Figma variables, and each one's CSS name is its Web code syntax in Figma (`System/Surface/Bg-Card` is `--bg-card`). Covers the four layers (Global palettes, Base, System, Component) and which to use, the naming rules, where tokens live (`:root` and `.dark`, not `@theme`, because Tailwind reads `--text-*` there as font sizes), the twelve brand slots a brand theme overrides, and the shadcn/ui variable mapping.

### Changed

- **Status tokens use the Figma names (`DS-COLOR-008`, `DS-COLOR-009`).** Each role has a token per System layer: `--base-{role}`, `--bg-{role}`, `--text-{role}`, `--border-{role}`, `--icon-{role}`. `warning` is now `notice`. `--color-{role}`, `--color-{role}-surface`, `-border` and `-foreground` are retired.
- **Elevation has Figma's five tiers (`DS-ELEVATION-002`).** `--shadow-base`, `-small`, `-medium`, `-large`, `-xlarge`, each with what Figma says it is for. They replace the four tiers `--shadow-flat`, `-raised`, `-overlay`, `-modal`.
- **The modal scrim is a token (`DS-ELEVATION-001`).** `--bg-overlay-dark`, not a literal color.
- **`DS-TAILWIND-001`.** `@theme` is for the names Tailwind makes utilities from. The Vois tokens live in `:root` and `.dark`, exposed through `@theme inline` aliases.
- **Spacing scale matches Figma.** Adds 28, 36, 56, 88, 120 and 128, and drops 96, which Figma doesn't have. All values are still divisible by 4 (`DS-SPACING-001` is unchanged). Adds the semantic spacing tokens (`--space-padding-*`, `--space-v-*`, `--space-h-*`).
- **Examples follow the new names** in `color.md`, `accessibility.md`, `css-architecture.md`, `stylex.md` and `tailwind-v4.md`. The focus ring is `--border-state-focus`.
- **Base sets the brand (`DS-TOKEN-004`).** `--base-brand` is the primary, `--base-accent-solid` and `--base-accent-soft` the accent. Because today's Figma file points the primary action states and the accent System tokens at palettes directly, a brand theme overrides all twelve brand slots.
- **Defaults when the MCP isn't used.** `SKILL.md`, `figma-variables.md` and `grid.md` say the MCP serves live values, and the registry's `vois-tokens` item seeds defaults generated from Figma (generic blue brand).
- **Grid tokens are in Figma.** The Breakpoints collection now has the skill's four classes as modes and every grid and panel token, each with its CSS name as code syntax.
- **File count.** `SKILL.md` said the rules come from 15 reference files; the rules file said 16. With `figma-variables.md` it is 17, and both say so.

- **`DS-MKT-008` and `marketing-type-and-spacing.md`.** The product spacing scale now tops out at 128px, so marketing section gaps are the exception above 128px (up to 240px), not above 96px.
- **`light-dark()` example** sets a token in the token file instead of naming palette steps in component code (`DS-TOKEN-001`).
- **Elevation** no longer points at a z-index scale in `css-architecture.md` that does not exist.
- **The `SKILL.md` checklist** says `notice`, not `warning`.

Detector behavior did not change: no detector reads the renamed tokens. `LOOKALIKE-010`'s fix hint now names the `notice` role.

## [1.28.2] - 2026-11-13

### Changed

- **The grid classes are `narrow`, `sm`, `md` and `lg`.** They replace `narrow`, `snug`, `roomy` and `wide`. The tokens are `--breakpoint-sm` (600), `--breakpoint-md` (768) and `--breakpoint-lg` (1024). `md` and `lg` keep the names and values they always had. `sm` moves from 640 (`40em`) to 600 (`37.5em`). The class ids in the grid logic, the fixture, the page-template `layout` data and the rule text follow. Detector behavior is the same: the checks read class ids from the token data. `data/tokens.json` follows: the `breakpoints` list and the `grid_and_panels` token names and statuses match.
- **The `sm` container width in the table and form rules is now `37.5em`, not `40em`.** This changes `PATH-B-NARROW`, the form column rule, the settings row rule and `DS-TABLE` layout. Tables and forms now stack 40px later in a narrowing container.
- **Breakpoint table in `css-architecture.md`.** `sm` is 37.5em (600px), `md` 48em, `lg` 64em, `xl` 80em.
- **`grid.md`, the fixture and its test call the example values "default", not "proposed".** The numbers are the same. Your token source still holds the real values, and the table is still an example.

---

## [1.28.1] - 2026-11-12

### Fixed

- **`DS-ANIMATION-005` was quadratic on a long one-line input.** Four patterns rescanned the rest of the input from every start: the first-keyframe block (`from { ... }` and `0% { ... }`), the `starting:` variant chain, and the `zoom-in-` variant chain. A file of 40,000 repeats of `starting:` took 36 s. Each now takes under 100 ms. The rule flags the same things as before for every class written normally (a fuzz of 300,000 mixed inputs found no difference), with two limits it did not have: it does not read a keyframe block over 1000 characters, and it does not read a `starting:` class with more than 31 variants between `starting:` and `scale`. A made-up class that runs two `scale-` pieces together, such as `starting:scale-50:scale-30`, now gives a finding for each piece. Both are listed in `references/hooks.md`, and `detect.test.mjs` has a timing test that fails on the old code.

## [1.28.0] - 2026-11-12

### Added

- **Three detectors in `scripts/registry.mjs`** (code in `scripts/grid-checks.mjs`), all advisory, none blocking:
  - `DS-GRID-007` flags a hard-coded column count: Tailwind `grid-cols-3`, `grid-cols-[repeat(3,1fr)]`, and `repeat(3, ...)` in `grid-template-columns` or `gridTemplateColumns`. A count of 1, 4, 8 or 12 is not flagged, because 4, 8 and 12 are the page grid.
  - `DS-GRID-004` flags a raw gutter on a grid container: a Tailwind `gap-[24px]` or `gap-x-[1.5rem]` on a tag that is a grid, an inline or StyleX object that is a grid and sets a literal `gap` or `columnGap`, and `gap`, `column-gap` or `grid-gap` with a plain length in a `.css` or `.scss` rule that is a grid. `var()`, `calc()`, `0` and row gaps are not flagged.
  - `DS-PANEL-008` flags a hard-coded width on a panel or pane: a tag named or classed for a panel, drawer, sheet, flyout, tray, inspector or pane with `w-[420px]`, `w-80`, `style={{ width: 320 }}` or `width={320}`, a panel-named style object, a name such as `PANEL_WIDTH` or `useState(320)` for `panelWidth`, and a `.css` or `.scss` rule with a panel selector and a plain `width`, `min-width`, `max-width` or `flex-basis`. Whole words only, so `Spreadsheet` is not a sheet.
- Block comments are skipped, line numbers stay put across a multi-line comment, and `DS-PANEL-008` reads only the panel itself (`Sheet`, `SheetContent`, `.side-panel`), not parts inside it (`SheetClose`, `PanelLeft`, `.panel .icon`).
- The three rules move from `judgment` to `detector`. A detector catches some violations, not all (see `references/hooks.md`).
- Tests for each: every syntax it reads, the inputs that must stay quiet, the three known gaps, and a stress test on large and hostile input.

### Changed

- `cssBlocks` moved to `scripts/css-blocks.mjs` so two files can share it. `registry.mjs` still exports it.

---

## [1.27.0] - 2026-11-12

### Added

- **`references/grid.md`** with 18 new rules: `DS-GRID-001` to `010` and `DS-PANEL-001` to `008`. They cover four grid classes picked from the region width (`narrow`, `snug`, `roomy`, `wide`), nav by window width, content max, margin and gutter tokens, safe areas, measuring the parent, the card grid column formula, regions, push and overlay panels, overlay width, and two-pane lists. All are `judgment` for now: no detector and no rendered check exists for them yet.
- **`scripts/grid-logic.mjs`** and **`scripts/grid.test.mjs`**: the maths from `grid.md` as code, with a test (29 cases) that also checks the worked example in `grid.md`, the layout data in `vois-patterns` and the token names. `scripts/grid-fixture.json` holds proposed token values so the test runs offline.
- The logic fails closed: a token set that is not the four classes in order, a typo'd shell or tier, a missing cap or a non-number throws, and never returns NaN or falls back to another shell.
- **`prds/grid-token-request.md`**: the tokens the Vois token source needs to add before the rules can be applied for real. Values are not stored in the skill.

### Changed

- **Token request, decisions applied.** Margin and gutter are stored as four plain numbers each (`-min`, `-max`, `-min-at`, `-max-at`), and `--grid-margin` and `--grid-gutter` are generated outputs, so no custom token type is needed. `md` and `lg` are renamed outright to `--breakpoint-roomy` and `--breakpoint-wide`. `--region-aside` is replaced by `--region-right-rail`, `--region-filters`, `--region-company-facts` and `--region-contents`. The six template widths stay as proposed.
- **`DS-RESPONSIVE-002`** now says to test at the start of each grid class: 360, 600, 768 and 1024, not `sm` 640, `md` 768 and `lg` 1024. 600 is new. The old rule named the Tailwind breakpoints, which clash with the Android and Apple meanings.
- **Teams: `test_breakpoints_px`** in `vois-teams/data/ranges.json` has the new base [360, 600, 768, 1024]. A team override that lists 640 as a base value must change it. Extra values (1280, 1536) still work.
- **`DS-SPACING-001`** has one exception: `--grid-margin` and `--grid-gutter` between their end values. The end values stay on the scale.
- `DS-A11Y-001` is unchanged. The decision for this work was a 44 touch target, which is 4px under Material's 48dp. The value lives in the token source.

---

## [1.26.0] - 2026-10-27

### Added

- **Three rules now have a detector** (were `judgment`), so a team can tune their limits and the hook checks them:
  - `DS-CSS-003`: a style rule nested deeper than `max_selector_nesting` (2 by default) in `.css` and `.scss`. Only nested style rules count. `@media`, `@supports` and `@layer` add no level, keyframe stops and SCSS property blocks are skipped, and comments, strings and `#{...}` interpolation are not read as blocks. It does not count descendant combinators (`.a .b .c`).
  - `DS-ICON-001`: an explicit `strokeWidth` on a `lucide-react` icon that is not `stroke_width_px` (1.5 by default). Icons imported by name (including `X as CloseIcon`) or as a namespace (`<L.Check>`) are read; deep imports (`lucide-react/dist/...`) and a computed width are not. An icon with no `strokeWidth` renders at lucide's own default (2), which this does not check, so it does not find mixed weights that come from omitting the prop.
  - `DS-ICON-002`: a `lucide-react` icon whose `size`, `width`, `height` or Tailwind `size-N`/`h-N`/`w-N`/`size-[Npx]` is not in `icon_sizes_px` (16/20/24/32 by default). One finding per icon. Fractions such as `w-1/2` are not sizes.
- **`DS-ANIMATION-005` now also checks the rest of the rule ("start at `0.9` or higher").** It still blocks `scale(0)`. A start below `min_start_scale` (0.9 by default) is a new quality finding, never blocked, in `initial={{ scale }}` and variant `hidden`, a first keyframe (`from`, `0%`), `starting:scale-N` and `zoom-in-N`. A `scale-0` written as a Tailwind class is reported too. The icon-swap recipe is exempt: a start that also has a `blur(` is `DS-SURFACE-014`, which starts at `0.25` on purpose.
- **`DS-ANIMATION-005` rule text** now names the exception: "The one exception is an icon swap, which follows `DS-SURFACE-014`." (`DS-SURFACE-014` has always said to start at `0.25`; the two rules disagreed.)
- A detector may now give one finding a lower severity than its rule (`severity` on the finding). `detect.mjs` and `hook-before-edit.mjs` both read it.

### Changed

- **New findings on existing code.** Any enter animation that starts between 0 and 0.9 (for example `zoom-in-50`, or `initial={{ scale: 0.5 }}`) is now flagged. The fix hint no longer says to start from `scale(0.25)`, which the rule text contradicted. The `good.tsx` fixture started at `0.5` for the same reason and now starts at `0.9`.
- A set limit is compared whole against the base. Before, any set was compared by its smallest value, so a team's `[16, 24]` would have read as "no change". Spacing divisors keep the smallest-value comparison.
- A limit with no tightening direction (`stroke_width_px`) is a choice, so where two teams cover one file the first team file keeps it instead of the larger value winning. Where two teams cover one file with different icon-size sets, only the sizes both allow stay.

### Notes

- Four of the 23 tunable limits were checked before; eight are now. The rest (contrast, text width, type sizes, component thresholds) still have nothing to check in code.
- The Figma edition is not rebuilt for this change.

---

## [1.25.0] - 2026-10-27

### Changed

- **`DS-A11Y-002` and `DS-A11Y-004` are now `verification: "rendered"`** (were `judgment`). Whether a focus indicator shows and whether text meets contrast depend on computed CSS, so a static read of the code cannot settle them. No rule text, severity or enforcement changed. No rendered check ships in this repo, so here they are judgment calls as before, settled with the page open in a browser. Ported from `ommakes/vois-skills`, where an opt-in rendered pass reports them.
- `references/hooks.md` says what `rendered` means and that a rendered check, like a detector, is partial.
- **Version bump:** `1.24.0` → `1.25.0`

### Notes

- The Figma edition is unchanged and is marked as behind in `figma-editions/README.md`.

---

## [1.24.0] - 2026-10-26

### Added

- **`verification` on every rule in `data/vois-rules.json`.** `detector` means a check in `scripts/registry.mjs` catches some or all violations of it (passing is not proof the rule is met), `judgment` means an agent reads the code. The vocabulary also allows `spec` and `rendered`, for rules checked against a chart spec or a rendered page. Rules marked `detector` carry a `detector` field with the registry id, so `DS-MODAL-001` and `DS-MODAL-002` both name `DS-MODAL`.
- **`scripts/check-verification.py` checks the link.** It fails when a rule has no valid `verification`, when a `detector` rule names no detector or one that is not in the registry, when a rule names a detector but is not marked `detector`, and when the registry has a detector no rule claims. `DS-SLOP-002` is exempt because the `DS-SLOP-*` family is not indexed in the JSON. `scripts/check-verification.test.py` breaks each of these inputs in a copy and expects a failure.

### Changed

- `references/hooks.md` says the `detector` field is the source of truth for its coverage table, and `SKILL.md` names `scripts/check-verification.py` next to `scripts/check-rule-sync.mjs`.

### Notes

- No rule text, severity or enforcement changed. The only code change is a `covers` field on the `DS-MODAL` registry entry, which says it also covers `DS-MODAL-001` and `-002`; no finding changes. The Figma edition is unchanged.
- **Version bump:** `1.23.2` → `1.24.0`

---

## [1.23.2] - 2026-10-21

### Fixed

- **The `motionEase` starter in `references/animation.md` was a readonly tuple.** `as const` made each curve `readonly [number, number, number, number]`, and older versions of Motion type `ease` as a mutable tuple. It now declares `Bezier = [number, number, number, number]` and types `motionEase` with it, so it works with every version. (Motion 11.18 accepts the readonly form too, so this only matters for older versions.)
- **The reduced-motion snippet still had a literal `duration: 0.3`.** The 1.23.1 entry said the Motion snippets read tokens only. This one did not. It now imports `motionDistance`, `motionDuration` and `motionEase` and uses them.

### Notes

- No rule or token changed. The Figma edition is unchanged and is marked behind in `figma-editions/README.md`, with its two stale motion lines named.
- **Version bump:** `1.23.1` → `1.23.2`

---

## [1.23.1] - 2026-10-10

### Fixed

- **`surfaces.md` did not read tokens only, as 1.23.0 said.** The card hover still used `ease-out` and the exit example still used `easeIn`, both literal curves against `DS-MOTION-001`. They now use `var(--motion-ease-standard)` and `motionEase.standard`. The Motion snippets also had no import for `motionDuration`, `motionDistance`, `motionEase` or `motionSpring`, so copied code did not compile. Each now imports from `motion-tokens.ts`.
- The enter example's stagger reuses the `instant` duration token as the gap between chunks. The file now says so, and says a different gap belongs in the token file, not in the component.

### Notes

- No rule or token changed.
- **Version bump:** `1.23.0` → `1.23.1`

---

## [1.23.0] - 2026-10-09

### Added

- **Five motion rules** in `references/animation.md` and `data/vois-rules.json`: `DS-MOTION-003` (a morph runs inside one duration token, never out then in), `DS-MOTION-004` (a tray is one container that stays mounted between steps), `DS-MOTION-005` (content a travelling element leaves behind blurs at most the `DS-SURFACE-014` value, and the traveller never blurs), `DS-MOTION-006` (springs at `bounce: 0` with a token, and a retargeted transition continues from its current velocity), `DS-MOTION-007` (delight never gates the task, loops pause under reduced motion, one-off effects play once).
- **A `motion-tokens.ts` starter** with `motionDuration`, `motionEase` and `motionSpring`, so the TypeScript side of the tokens has a named home.
- **Five checklist lines** in `SKILL.md`, one per new rule.

### Changed

- **The spring contradiction is resolved.** `animation.md` said springs are native iOS patterns, not web UI, while `surfaces.md` required a spring for icon swaps. Springs are now allowed on the web at `bounce: 0` with a token duration, and the iOS line is gone.
- **`surfaces.md` no longer holds literal motion values.** The icon transition uses `motionSpring.standard` (its duration is now the base token, 250ms, where it was a literal 0.3s). The card hover, enter and exit snippets and the no-library fallback read tokens too: the 100ms stagger is `motionDuration.instant` and the 12px travel is a new `motionDistance.short` in the TypeScript token starter. They broke `DS-MOTION-001`. Prose that describes a stagger (about 80ms per word) is guidance, not code, and is unchanged.
- `DS-SURFACE-014` points to the icon morph spec for declared pairs (`menu` to `close`, `close` to `back`) and keeps the crossfade for everything else.

### Notes

- No detector change. The new rules are advisory.
- **Version bump:** `1.22.1` → `1.23.0`

---

## [1.22.1] - 2026-10-09

### Added

- **Tailwind v4 notes** in `references/animation.md`. `--ease-*` and `--default-transition-*` are theme variables, but there is no `--duration-*` namespace, so a class such as `duration-fast` generates no CSS and raises no error. Use `duration-[var(--motion-duration-fast)]`, and check the computed `transition-duration` after a build.

### Notes

- No rule or token changed.
- **Version bump:** `1.22.0` → `1.22.1`

---

## [1.22.0] - 2026-10-09

### Added

- **`--motion-distance-short`** is now a named motion token in `references/animation.md`. The morph specs already used it for the label morph's rise and the directional slide, but the token list did not name it and no value was given.
- **A starter token file** in `references/animation.md` with starting values for every motion token (durations 100, 150, 250 and 400ms; the two easings reuse the existing ease-out-quart and ease-out-quint curves; distance 12px, with 8px to 16px as the range). Before, the file gave names only, so a project with no token source had no values to start from.

### Changed

- The "names only" sentence now says values live in the project's token file, and points to the starter file when there is none. No rule text changed.
- **Version bump:** `1.21.1` → `1.22.0`

---

## [1.21.1] - 2026-10-09

### Changed

- **Pointers to the motion guidance.** The `references/animation.md` row in `SKILL.md` now points at `vois-patterns/references/motion.md` (when to morph) and `vois-components/references/motion-morphs.md` (morph specs). No rule or token changed.
- **Version bump:** `1.21.0` → `1.21.1`

---

## [1.21.0] - 2026-10-08

### Added

- **`DS-MOTION-001`: literal timing and curves.** Flags a literal duration, `cubic-bezier(...)` curve, or numeric easing array in code or CSS, in Tailwind (`duration-[150ms]`, `duration-200`), CSS (`transition: opacity 150ms`, `animation-duration`), Motion (`duration: 0.2`, `ease: [...]`), and StyleX (`transitionDuration: "150ms"`) spellings. Zero is allowed for reduced motion. Token references (`var(--motion-duration-fast)`) pass. A file named `motion-tokens.{css,scss,ts,js}` (or a leading-underscore SCSS partial, `_motion-tokens.scss`) may define literal values, but usage there is still checked, and a file with a `transition={{...}}` JSX prop is not exempt. `tokens.css` and `my-motion-tokens.ts` are checked like any other file. Outside that file, any custom property or SCSS variable holding a time or curve is flagged, under any name, along with inline-style and `setProperty` definitions.
- **`DS-MOTION-002`: slow duration for large elements.** The slow duration token is for drawers, sheets, and modals entering only. Judgment only, no detector.
- **Motion Tokens section in `references/animation.md`** with the token names and the token-file rule. The names are listed here; values stay in the project's token source.

### Changed

- **Examples in `references/animation.md` use token references** instead of literal `150ms`, `200ms`, and `duration: 0.2`.
- **Clean fixture `good.tsx`** uses `duration-[var(--motion-duration-base)]` instead of `duration-200`.
- **Version bump:** `1.20.2` → `1.21.0`

### Notes

- `DS-MOTION-001` flags a literal duration even when it is under 300ms. A 150ms literal is a token violation, not a speed violation, so it is flagged. Existing `DS-ANIMATION-001` still catches anything over the ceiling.
- Named easing keywords (`ease-out`, `linear`) are not flagged. The detector checks numbers and `cubic-bezier(...)` only.
- `0.01ms` is allowed. It is the reduced-motion override in `references/animation.md`, not a motion value. Zero is allowed too.
- `duration:` and `delay:` keys count only when the word `transition` appears in the text just before them, so `toast({ duration: 3000 })` passes. `transition-colors` is a class name and does not count.
- Limits: a plain JS object of durations (`motionDuration = { fast: 0.15 }`) outside the token file is not detected, and a basename match exempts `motion-tokens.*` in any directory. Generated files (for example a copy of a framework theme) are flagged; exclude them in your ignore list.

---

## [1.20.2] - 2026-10-07

### Fixed

- **`DS-TABLE-001` was quadratic on a large file with no braces.** Finding CSS-style blocks used a regex that rescanned every brace-free run from each start position, so 165KB of plain text took 43 seconds and could stall the per-edit hook. A one-pass scanner (`cssBlocks`) replaces it. A randomized test checks it finds the same blocks as the old regex, and another checks a large brace-free file stays fast.

### Changed

- **Version bump:** `1.20.1` → `1.20.2`

---

## [1.20.1] - 2026-10-07

### Fixed

A second independent review of 1.20.0 found these.

- **`LOOKALIKE-009` missed bare calls in files written without semicolons.** The "declared in this file" test ran from the first `import` to the first `;`, so a file with no semicolons counted every call as declared. It now reads one import statement. A prop or object key named `confirm` or `alert` no longer counts as a declaration, and a `//` inside a URL is not a comment.
- **Tags with an apostrophe in a comment or a regex were skipped.** `jsx-tags.mjs` now ends a JavaScript string at the end of its line, skips `/* */` and `//` comments inside braces, handles an escaped backslash, and treats JSX attribute strings as having no escapes.
- **A team value that changes nothing is not credited.** `spacing_divisors: [4]` checks the same as the base, so no finding says a team set it, and `hook-admin status` says "no change from the base". A team ceiling for `DS-ANIMATION-002` below the standard one is credited when it applies.
- A scope path of only spaces matches nothing. The scope-glob wording in `hooks.md` and `team-overrides.mjs` no longer says the validator matches globs; it only compares the text before the first wildcard.

### Changed

- **Version bump:** `1.20.0` → `1.20.1`

---

## [1.20.0] - 2026-10-07

### Added

- **The hook reads team overrides.** `hook.mjs` and `detect.mjs --root` read `<project>/.vois/teams/*.json` and check a team's files against the team's tighter limits: `DS-ANIMATION-001` and `DS-ANIMATION-002` (animation ceilings), `DS-ANIMATION-008` (press scale) and `DS-SPACING-001` (spacing divisors). Files are matched by the override file's `scope.paths`. A finding from a team limit says which team set it.
- A value that loosens the base, sits outside its range, or comes from a malformed file is ignored, so the hook never loosens. `hook-admin.mjs status` lists each team override as applied, ignored, or not checked by the hook.
- New `scripts/team-overrides.mjs`. `detect.test.mjs` covers scope matching, ignored values, several teams, the `vois-teams` payments example end to end, and a check that the hook's limits match `vois-teams/data/ranges.json`.
- `hooks.md` has a Team overrides section.
- A scope that is not `{ paths: [strings] }` skips the team file instead of widening it to the repo. Scope globs follow the validator: `{a,b}`, `[abc]`, a leading `./` or `/`, `\`, and a folder name covering its contents. `detect.mjs --root` resolves a relative file path from the current folder.

### Fixed

- **The `components/ui/` skip missed project-relative paths.** The lookalike checks skip shadcn primitives, but the check needed a separator in front of `components/`, so `components/ui/button.tsx` was not skipped when the path had no `src/` or other folder before it. Those files are where raw `<button>` and `animate-spin` belong. The check now also matches at the start of the path.

- **Lookalike detectors read JSX tags properly.** A new `scripts/jsx-tags.mjs` skips braces and quotes, so `{count >= 3}` or `{a > b ? x : y}` no longer ends a tag early. `LOOKALIKE-009` ignores functions the file declares, methods, comments and prose in JSX text. `LOOKALIKE-010` also flags amber, green and the other palette colors, not only red. `LOOKALIKE-011` ignores `data-title`. `LOOKALIKE-007` skips only exact busy-flag names and reads `3_000` and `3 * 1000`. Component imports count from any path.
- **Animation checks.** `duration-[0.6s]` and every seconds spelling are compared against the ceiling, a message no longer credits a team for the base 500ms ceiling, and `active:scale-[0.9]` is checked against the press floor.

### Changed

- **Version bump:** `1.19.0` → `1.20.0`

---

## [1.19.0] - 2026-10-06

### Added

- **Lookalike checks in the hook.** Nine rules, `LOOKALIKE-001`, `002`, `003`, `005`, `007`, `008`, `009`, `010` and `011`, flag markup that does a component's job without the component: a raw `<button>` with its own focus ring, `animate-spin`, `role="radio"`, a clickable `div`, a `setTimeout` that hides a message, a close glyph, `window.confirm`, `alert` or `prompt`, a hand-built alert box and `title=` as a tooltip. The ids are the rows of the lookalike table in `vois-components`. They are advisory only, skip `components/ui/`, and use the same ignore and dedup settings as the other rules. `LOOKALIKE-004` and `006` have no precise regex and stay judgment-only.
- `detect.test.mjs` checks that every `LOOKALIKE-*` id is a row in the table, that `components/ui/` is skipped, and the edge cases for `005`, `007` and `009`.

### Changed

- `hooks.md` no longer lists `div`-onClick-without-role as judgment-only, and has a Lookalike checks section.
- The `good.tsx` fixture uses a link for its focus-ring example, since a raw `<button>` with a focus ring is now a finding.
- **Version bump:** `1.18.1` → `1.19.0`

---

## [1.18.1] - 2026-10-06

### Fixed

- **File counts.** `SKILL.md` said the rules come from 13 files and `data/vois-rules.json` said 14. The rules come from 15: 17 reference files minus `anti-slop.md` and `hooks.md`. `README.md` said version 1.14.0.

### Changed

- **Version bump:** `1.18.0` → `1.18.1`

---

## [1.18.0] - 2026-10-06

### Added

- **Status color roles.** `DS-COLOR-008` fixes four semantic roles (`info`, `positive`, `negative`, `warning`), each with four tokens (base, `-foreground`, `-surface`, `-border`). `DS-COLOR-009` says to pick a role by meaning, and merges `destructive` into `negative`: there is no separate `destructive` token, and a destructive Button reads `--color-negative`. `success` becomes `positive`. New "Status Colors" section in `references/color.md`, a `status_roles` group in `data/tokens.json`, and a line in the Pre-Submit Checklist.
- Names only. The OKLCH values stay per workspace, as before.
- Examples in `components.md` and `stylex.md` now read `--color-negative`. The `destructive` Button variant keeps its name, since that is the shadcn API.

### Why

A lookalike pass found a status-label build that fell back to stock Badge variants because the token set had no success or warning color.

### Changed

- **Version bump:** `1.17.1` → `1.18.0`

---

## [1.17.1] - 2026-10-02

### Changed

- **`DS-SURFACE-002` and `DS-A11Y-013` metadata aligned** with the private `vois-skills` copy. `DS-SURFACE-002` now says when it applies (padding between nested surfaces exceeds 24px) instead of listing that as an exception. `DS-A11Y-013` now also says when it applies (images not in the initial viewport). Rule text and severity are unchanged.

---

## [1.17.0] - 2026-10-02

### Added

- **`references/marketing-type-and-spacing.md`** and `DS-MKT-001` to `008` (new category `DS-MKT`). A type scale and spacing for marketing surfaces only: display face for display and h2, one display per page, `56ch` body, section gaps about 4x the heading-to-content gap, and section gaps above 96px. The ratios are the rules. The pixel values are starting points: they were estimated from one reference site and tuned by eye on one mockup.
- **A "Marketing surfaces" group** in the Pre-Submit Checklist, and a note in `DS-SLOP-003` that three blocks per row is a ceiling, not a target.
- Pointers from `typography.md` and `spacing.md` to the marketing file.

### Changed

- **`DS-SLOP-009` is now a blanket ban on em dashes in shipped copy.** Before, it allowed them in editorial text and flagged only high density. This now matches `righter`'s `no-em-dashes`. The `design-previews` page for this rule was rewritten to match.
- **Version bump:** `1.16.0` → `1.17.0`

---

## [1.16.0] - 2026-10-02

### Added

- **`table_sizes` tokens** in `data/tokens.json`: `--table-header-h` (2.5rem), `--table-row-h-dense` (2rem), `--table-row-h-regular` (2.75rem, matches `--hit-area-min`), `--table-row-h-comfortable` (3.5rem).

### Changed

- **`DS-TABLE-019`** now names only those four as tokens. `--table-offset` and `--app-header-h` were listed as tokens in 1.15.0, but each page sets them, so they are not tokens. The scrollbar thumb uses an existing neutral token instead of a new `--scrollbar-thumb` (`DS-TABLE-010`).
- **`DS-TABLE-006`** replaces the invented `--z-table-*` tokens with local z values (1, 2, 3) inside `isolation: isolate` on the scroll owner, so they cannot outrank an overlay.

### Notes

- `references/elevation.md` still points at a z-index scale in `css-architecture.md` that does not exist. Left as it was, and noted here so it gets fixed on its own.

---

## [1.15.0] - 2026-10-02

### Added

- **`references/data-tables.md`** and `DS-TABLE-001` to `019` (new category `DS-TABLE`, rule count 118 to 137). One scroll owner per table: the page for a simple table, the wrapper for a complex one. Sticky header and first column, scrollbar styling with `scrollbar-width` and `scrollbar-color`, `scrollbar-gutter`, one-axis wheel lock for tables that scroll both ways, container-query layout, scroll-region accessibility, virtualization threshold.
- **Detector rule `DS-TABLE-001`** (advisory). Flags `overflow: auto clip` and `overflow-x: auto` with `overflow-y: clip`, and a scroll wrapper with no bounded block size next to a sticky `thead` or `th` in the same file. Fixtures in `bad.tsx`, `bad.css`, `good.tsx`. Known gap, documented in `adversarial.tsx`: a wrapper and a sticky header in different files.
- Pre-Submit Checklist group "Data tables" and two Common Scenarios rows.

### Notes

- Two claims were checked in Chromium before they went in. `overflow: auto clip` computes to `auto / hidden`, so it does not make a header stick to the page. `border-collapse: collapse` borders do not travel with a sticky header, but `separate` borders do.
- `DS-TABLE-019` assumes tokens that `data/tokens.json` does not have yet: `--scrollbar-thumb`, `--table-offset`, `--table-header-h`, `--app-header-h`, `--z-table-header`, `--z-table-pinned`, `--z-table-corner`, and a row height per density. The rule says to propose them, not hardcode. Adding them is a separate change.

---

## [1.14.0] - 2026-10-01

### Added

- **Width tokens and rules.** `data/tokens.json` gains `widths` (`--width-form-max`, `--width-field-max`, `--width-field-narrow`, `--width-viewport-min`, `--width-dialog-sm`, `--width-dialog-lg`, `--hit-area-min`), all in `rem`. New `DS-LAYOUT-WIDTH-001` to `004` in `references/layout-and-responsive.md` and `data/vois-rules.json`.
- **Auto-growing text fields.** `data/tokens.json` gains `text_field_lines` (`--textarea-min-lines` 3, `--textarea-max-lines` 12, `--chat-input-min-lines` 1, `--chat-input-max-lines` 8). New `DS-LAYOUT-FIELD-001` to `004`: use `field-sizing: content`, always set an explicit `inline-size`, size min and max with the `lh` unit, and wrap in `@supports` with a `rows` fallback. Rule count 110 to 118.

### Changed

- **`DS-A11Y-001`** now uses `--hit-area-min` (2.75rem). It sets the click or tap area only, never the visible size of a control. The `inset: -10px` example in `references/accessibility.md` is replaced with one sized by the token. `touch_target_minimum` in `data/tokens.json` is updated to match.
- **`SKILL.md`** checklists and Quick Reference updated for the above.
- **Version bump:** `1.13.0` → `1.14.0`

### Known gaps

- `scripts/detect.mjs` does not flag raw widths or JavaScript autosizing.
- The autosize CSS was tested in Chromium 141 only. Firefox and Safari are untested, and `resize: none` while autosizing is untested.
- `field-sizing-content` as the Tailwind v4 utility name is not confirmed against this repo's Tailwind version.

---

## [1.13.0] — 2026-09-12

### Added

- **`references/layout-and-responsive.md`** gains a "Judgment Under Constraint" subsection under `[DS-RESPONSIVE]`: `DS-RESPONSIVE-006` (preserve task hierarchy — keep primary content full-size, let secondary content absorb the constraint first) and `DS-RESPONSIVE-007` (reflow, then collapse, then hide, then shrink — in that order, never below the `DS-RESPONSIVE-004` minimums). The existing `[DS-RESPONSIVE]` rules were purely mechanical (breakpoints, touch targets, container queries); nothing addressed what to actually do when content doesn't fit. Matching entries added to `data/vois-rules.json`, and the Pre-Submit Checklist / Quick Reference in `SKILL.md` gain corresponding rows.
- **Version bump:** `1.12.0` → `1.13.0`

---

## [1.12.0] — 2026-08-29

### Added

- **StyleX support alongside Tailwind v4.** This skill now covers two implementation engines for the same design system — a workspace uses one, not both. New `references/stylex.md` (`[DS-STYLEX]`, rules `001`–`006`) covers build-plugin setup, `defineVars`/`createTheme` tokens and theming, the `stylex.create()`/`stylex.props()` variant-composition pattern that replaces `cva`, why an inline `style={{}}` prop is unsafe under StyleX, and `defineConsts` for breakpoints. `data/vois-rules.json` gains a new optional `engines` field (`["tailwind"]` or `["stylex"]`) on the handful of rules that are genuinely engine-specific (all `DS-TAILWIND-*`, `DS-COLOR-002`, the six new `DS-STYLEX-*`) — every other rule has no field and applies under either engine unchanged. `SKILL.md`'s framing, reference table, Pre-Submit Checklist, and Quick Reference are all updated to route to the right engine's reference file; the "12 files" rule-source count is now 13.
- **`scripts/registry.mjs` detects StyleX object-literal syntax alongside the existing Tailwind/CSS-string checks** for `DS-SPACING-001` (arbitrary `padding`/`margin`/`gap` values), `DS-TAILWIND-005` (`transitionProperty: "all"`), `DS-ANIMATION-001` (`transitionDuration: "Nms"`/`"Ns"`), `DS-ANIMATION-008` (a `":active"` scale key), and `DS-ANIMATION-009` (`willChange: "..."`) — these rules were previously silent on StyleX files since their regexes only matched Tailwind/hand-authored-CSS syntax. New fixture `scripts/__fixtures__/bad-stylex.tsx` and five new tests in `detect.test.mjs` cover the added branches. `references/hooks.md`'s coverage table is updated to describe what's now checked per engine.
- **`figma-editions/vois-tokens.md`** gains a condensed StyleX section and topic-index/checklist entries, matching this repo's own StyleX additions.

### Changed

- **`references/components.md`** (`DS-COMPONENT-002`, `DS-COMPONENT-005`) and their `vois-rules.json` entries reworded to name both engines' variant/architecture pattern instead of assuming Tailwind + cva.
- **`references/css-architecture.md`, `color.md`, `spacing.md`, `animation.md`, `surfaces.md`, `layout-and-responsive.md`, `tailwind-v4.md`, `anti-slop.md`** each gain a StyleX-equivalent code sample or cross-reference next to their existing Tailwind-specific example, without changing the underlying rule.
- **Version bump:** `1.11.0` → `1.12.0`

---

## [1.11.0] — 2026-08-09

### Added

- **`severity` (`required`/`recommended`/`preferred`) and `enforcement` (`blocking`/`advisory`) fields on all 102 rules in `data/vois-rules.json`.** Previously this tiering only existed for the 18 rules `scripts/registry.mjs` covers, and only there — every other rule had no machine-readable weight at all. `enforcement: "blocking"` is set on exactly the two rules `references/hooks.md` already documented as blockable in Cursor (`DS-TAILWIND-004`, `DS-ANIMATION-005`) — this codifies current behavior, it doesn't invent new blocking. `severity` follows what each source file already asserts (e.g. all `DS-A11Y-*` — accessibility.md opens "These are not optional" — and all `DS-MODAL-*` are `required`; punctuation/selector-style rules are `preferred`; everything else defaults to `recommended`).
- **`applies_when`/`does_not_apply_when` on 7 rules with a real, already-documented condition**: `DS-MODAL-001/002/003`, `DS-ANIMATION-003`, `DS-ANIMATION-009`, `DS-A11Y-013`, `DS-SURFACE-002`. E.g. the `DS-MODAL-*` condition ("custom, non-Radix implementations only") already existed as logic in `registry.mjs`'s `usesRadix` check but wasn't visible to anyone reading just the rule data. Deliberately selective — most of the 102 rules have no real conditional scope and don't get this field.
- **`scripts/__fixtures__/adversarial.{tsx,css}` + two documenting tests in `detect.test.mjs`** for a known `DS-SLOP-002` gap: the same purple→blue AI gradient spelled with arbitrary hex values (`from-[#7c3aed]`) bypasses the named-hue regex. Documented in `references/hooks.md` as a known limitation rather than fixed — recognizing hue family from raw hex needs color-space math this zero-dependency detector doesn't do.
- **`scripts/check-rule-sync.mjs` (repo root, not skill-scoped)** — a cross-reference integrity checker confirming every `[DS-*]` tag cited in `references/*.md` resolves to a real `vois-rules.json` entry and vice versa. Exists because this exact bug already shipped once (see `[1.9.1]` below, `DS-CSS-008`) with nothing in place to catch a repeat. Wired into new repo-level CI (`.github/workflows/design-system-checks.yml`), which also now runs the existing `detect.test.mjs` regression suite automatically for the first time — it previously only ran by hand.

### Changed

- **Source-of-truth note added to `SKILL.md`**: `data/vois-rules.json` is canonical for rule statements/severity/enforcement; `references/*.md` may restate for readability but the JSON wins on conflict.
- **`scripts/registry.mjs`** gains a comment clarifying that its own `severity` field (`quality`/`slop`, a detector-blocking tier) is a different, narrower vocabulary from `vois-rules.json`'s new `severity`/`enforcement` fields — they answer different questions and aren't accidental duplication. `references/hooks.md` gets the same clarification plus a note on the `DS-SLOP-002` hex-gradient gap.
- **Version bump:** `1.10.0` → `1.11.0`

---

## [1.10.0] — 2026-07-24

### Added

- **`references/anti-slop.md` — `DS-SLOP-010` (card-ifying everything).** Wrapping every static section, list, or grouped field set in its own bordered-and-shadowed card is a default AI reach. Drop shadows are a cue for interactivity and belong on things a user picks up, hovers, or acts on — not on static page sections. Visual alignment and spacing rhythm alone are usually enough to signal grouping.
- **`references/anti-slop.md` — `DS-SLOP-011` (over-styled active/selected states).** A colored left border plus a corner radius on an active sidebar/nav item is a combination that gets uglier the more it's compounded (a border and drop shadow stacked on top makes it worse). Hover, selected, and active navigation states rarely need more than a subtle background- or text-color shift.
- Both rules added to the Pre-Submit Checklist in `SKILL.md` and `references/anti-slop.md`. Judgment-only, like the rest of the `DS-SLOP-*` family — not indexed in `data/vois-rules.json`.

### Changed

- **Version bump:** `1.9.1` → `1.10.0`

---

## [1.9.1] — 2026-07-23

### Fixed

- **`references/iconography.md` — removed a dangling cross-reference.** `DS-ICON-002` cited `[DS-CSS-008]` as "the same tolerance rule as spacing," but no `DS-CSS-008` rule exists (`css-architecture.md` tops out at `DS-CSS-007`), and `spacing.md`'s actual rule (`DS-SPACING-001`) states divisibility by 4/8 with "no exceptions" — not a rounding tolerance. The claim didn't match any real rule, in either the referenced file or the one it meant to point to, so the citation and the unsupported parallel were both removed. `DS-ICON-002`'s own instruction (round to the nearest icon size) is unaffected and stands on its own.

---

## [1.9.0] — 2026-07-23

### Added

- **`data/vois-rules.json`** — every numbered `[DS-XXX-NNN]` rule from 12 of the 14 reference files (102 rules), keyed by `id`/`category`/`source_file`, so a rule can be looked up without reading the whole reference file. Includes `DS-A11Y-*` (accessibility.md, 17 rules) and `DS-LAYOUT-COMP-*` (layout-and-responsive.md, 5 rules), which existed in source but weren't in any prior extraction. `references/anti-slop.md` (`DS-SLOP-*`) and `references/hooks.md` (`DS-HOOKS`) are intentionally excluded — judgment-only content and a tool doc, not rule data — and stay Markdown-only.
- **`data/tokens.json`** — actual token values (spacing scale, type scale, easing curves, elevation shadow tiers, icon sizes, breakpoints, contrast minimums, touch target minimum), kept separate from `vois-rules.json` since rules are constraints and this is values.

### Changed

- `SKILL.md`'s Reference Files section now points to the two structured JSON files for lookups by id/category/token, ahead of the full `references/*.md` files (still there for code examples and rationale). Added missing `references/elevation.md` and `references/iconography.md` rows to the table (their rules are now indexed but the files themselves were never listed).
- **Version bump:** `1.8.0` → `1.9.0`

---

## [1.8.0] — 2026-07-21

### Changed

- **Standalone-safe:** `vois_record_rule_usage` is now optional — call it if that MCP tool is available in your environment, otherwise skip and proceed. The no-silent-changes contract's greenfield/preserve/overhaul classification is now self-contained in this skill instead of pointing to `vois-router`. This skill no longer assumes an MCP server, `vois-router`, or `vois-loop` is present — the taste-dial fallback (mid defaults 5/4/5) already covered the no-router case.
- **Version bump:** `1.7.0` → `1.8.0`

---

## [1.7.0] — 2026-07-12

### Added

- **`references/anti-slop.md` — a `[DS-SLOP]` rule family** targeting generic "AI-looking" defaults that pass every token/a11y rule but still read as slop: centered-everything heroes (`DS-SLOP-001`), the purple/indigo→blue "AI gradient" (`DS-SLOP-002`), three-identical-feature-card grids (`DS-SLOP-003`), eyebrow overuse (`DS-SLOP-004`), emoji-as-iconography (`DS-SLOP-005`), zigzag repetition (`DS-SLOP-006`), spec-sheet marketing tables (`DS-SLOP-007`), and uniform-rhythm pages (`DS-SLOP-008`). Several are gated on the new `VARIANCE` taste dial.
- **`DS-SLOP-009` — a scoped, deliberate stance on the em-dash**: encouraged in typographic/editorial contexts, flagged only as an AI tell when it saturates generated prose. Not a blanket ban; righter owns the final call on copy.
- **`DS-SLOP-002` added to the deterministic detector** (`registry.mjs`), advisory-only, covering the Tailwind `from-*`/`to-*` and CSS `linear-gradient()` forms of the AI gradient, with a distinct-hue guard so monochrome ramps don't false-positive. New fixture violations + auto-generated tests (30 total, all passing).
- **Taste-dial consumption section** in `SKILL.md`: how the `VARIANCE`/`MOTION`/`DENSITY` dials (loaded by vois-router from VOIS.md) bias spacing, animation richness, and layout — always *within* the guardrails, never overriding a safety/a11y/hard-token rule.
- **No-silent-changes contract** in the "Reviewing Existing UI" section: URLs, form field names, analytics event names, and nav labels must never change as an invisible side effect of a restyle.

### Changed

- `SKILL.md` gains an `anti-slop.md` reference row, an Anti-slop checklist block, quick-reference rows, and anti-slop + redesign-safety items in the review checklist.
- `references/hooks.md` coverage table documents `DS-SLOP-002` as auto-checked/advisory and the rest of `DS-SLOP-*` as judgment-only.
- **Version bump:** `1.6.0` → `1.7.0`

---

## [1.6.0] — 2026-06-25

### Added

- **`scripts/` — a deterministic, zero-dependency detector for the mechanically-checkable subset of the Pre-Submit Checklist** (`registry.mjs`, `detect.mjs`), plus a per-edit hook (`hook.mjs` non-blocking for Claude Code/Codex, `hook-before-edit.mjs` blocking-for-slop-only for Cursor, `hook-lib.mjs` shared config/cache/dedup) and an admin CLI (`hook-admin.mjs`) for installing the hook into a consumer project and managing ignore lists. Covers 18 rules across color, accessibility, spacing, Tailwind, animation, layout, typography, CSS, and modal safeguards — see `references/hooks.md` for the full coverage table.
- **New `references/hooks.md`** — setup per harness, the ignore-management workflow, and an explicit mechanically-verified-vs-judgment-only breakdown of the checklist.
- Fixture tests (`scripts/__fixtures__/`, `scripts/detect.test.mjs`, Node's built-in test runner — no new dependency) asserting every covered rule fires on its violation and none false-positive on clean code.

### Changed

- `SKILL.md` reference-file table gets a `hooks.md` row; added an "Automated checks" callout near the top.
- **Version bump:** `1.4.0` → `1.6.0`, correcting drift where the frontmatter had been left at `1.4.0` after the `1.5.0` content (elevation.md/iconography.md) had already shipped.

### Non-goals (by design)

- This detector is strictly additive to the existing GitHub-integrated token-drift app: it never touches token source files, never calls GitHub, and never auto-applies a fix. `DS-COLOR-001`/`DS-COLOR-002` are tiered advisory-only here specifically so this hook never competes with that app's authority over raw-value-to-token reconciliation.
- Rules requiring layout/contrast computation or visual judgment (touch-target sizing, contrast ratios, optical alignment, 60/30/10 distribution, etc.) are intentionally not covered — they stay judgment-only, as documented in `references/hooks.md`.

---

## [1.5.0] — 2026-06-17

### Added

- **Two new reference files:** `references/elevation.md` (shadow/elevation scale, modal scrim guidance, `[DS-ELEVATION]`) and `references/iconography.md` (icon sizing tied to text context, stroke-width consistency, `[DS-ICON]`).
- **Decision frameworks ("When in doubt" subsections)** added to `spacing.md`, `color.md`, `css-architecture.md`, and `layout-and-responsive.md` to disambiguate previously behavior-only rules (smaller-token tie-breaker, 60/30/10 measured by surface area, off-token rounding tolerance, `svh`/`dvh` choice, `contain-intrinsic-size` estimation).
- **New token coverage:** opacity-step scale for disabled/secondary states (`color.md`, `[DS-COLOR-008]`), border-radius scale and named z-index scale (`css-architecture.md`, `[DS-CSS-009]`/`[DS-CSS-010]`), heading-to-body spacing composition table (`typography.md`, `[DS-TYPOGRAPHY-015]`).
- Cross-linked `components.md`'s modal section to the new elevation reference (`[DS-MODAL-004]`).

### Changed

- `SKILL.md` reference-file index and Quick Reference tables updated to list the two new files and the new decision points.
- **Version bump:** `1.4.0` → `1.5.0`

---

## [1.4.0] — 2026-06-17

### Changed

- **Renamed `vois-design-system` → `vois-tokens`.** Folder, `name:` frontmatter, and all cross-references in `vois-patterns`, `vois-components`, `vois-router`, `vois-loop`, and the top-level README updated to the new name. Rule IDs (`[DS-*]`) are unchanged — only the skill name moved.
- **Version bump:** `1.3.0` → `1.4.0`

---

## [1.3.0] — 2026-06-17

### Changed

- **Structural restructure:** `SKILL.md` split from a single 845-line file into a 141-line entry point plus nine `references/` files (`spacing.md`, `tailwind-v4.md`, `color.md`, `layout-and-responsive.md`, `typography.md`, `components.md`, `accessibility.md`, `css-architecture.md`, `animation.md`). No rule content was added, removed, or reworded — every `[DS-*]` rule ID is preserved. The Pre-Submit Checklist and Quick Reference table stay in `SKILL.md` since they're consulted on every job regardless of which reference file applies.
- This enables scoped loading from `vois-router`: on a COMPONENT-ONLY route, the router can now point the skill at just `references/components.md` (and `references/animation.md` for transitions) instead of loading the full skill.
- **Version bump:** `1.2.0` → `1.3.0`

---

## [1.2.0] — 2026-06-02

### Added

**Layout Composition (`[DS-LAYOUT-COMP]`)**

A new subsection under §1 Spacing covering structural layout decisions that AI models consistently get wrong. Six rules with IDs `DS-LAYOUT-COMP-001` through `DS-LAYOUT-COMP-006`:

- Sibling spacing always belongs to the parent container via `gap`, not directional padding on child elements
- No wrapper divs without a layout purpose (flex/grid context, overflow control, stacking context, or semantic grouping)
- `min-width: 0` on flex children containing text or overflow-prone content — prevents the default `min-width: auto` from causing invisible overflow bugs
- No `width: 100%` on flex/grid children when the parent is already controlling sizing
- `aspect-ratio` over the old padding-top percentage hack for ratio-constrained containers
- `object-fit` required on any image with explicit dimensions

**Expanded Semantic HTML (`[DS-A11Y-011]` through `[DS-A11Y-017]`)**

Seven new rules added to the Semantic HTML section under §8 Accessibility:

- `<ul>`/`<ol>` for lists — not stacked `<div>` siblings
- `<br>` only for intentional content line breaks (addresses, poetry) — never for layout spacing
- `loading="lazy"` on below-the-fold images; explicitly excluded from hero and above-the-fold content
- `<time datetime="...">` for all dates and times in content
- Heading elements (`<h1>`–`<h6>`) for document structure only — not for font size control
- `<fieldset>` and `<legend>` for grouped radio and checkbox controls, with before/after examples

**Selectors and Specificity (`[DS-CSS-002]` through `[DS-CSS-006]`)**

New subsection under §10 CSS Architecture:

- No `#id` selectors for styling
- Selectors capped at 2 levels of nesting before a new class is warranted
- `:is()` for grouping selectors without multiplying specificity, with example
- `:where()` for zero-specificity base styles that are easy to override
- Separation of layout concerns (sizing, position) from visual concerns (color, border, font) in hand-authored CSS

**Media Queries (`[DS-CSS-007]`)**

New subsection under §10 CSS Architecture:

- `em` over `px` for breakpoint values in hand-authored `@media` queries — respects user browser font size preferences and scales correctly on zoom
- Reference table of common breakpoints in `em` with `px` equivalents
- Scoped to hand-authored CSS; notes that Tailwind's built-in breakpoints use `px` internally

### Changed

- **Version bump:** `1.1.0` → `1.2.0`
- **Pre-Submit Checklist:** All existing checklist items now include their `[DS-*]` rule IDs. Nine new checklist items added across Accessibility, Layout, and a new CSS section
- **Quick Reference table:** Eight new rows covering the most common situations addressed by the new rules
- **Section headers:** All section headers now include their `[DS-*]` group tag for consistency with inline rules

### Fixed

- `[DS-A11Y]` rule numbering: the Color and Meaning rule was unnumbered in v1.1.0. Assigned `[DS-A11Y-017]`

---

## [1.1.0] — initial tracked version

Core skill covering spacing, typography, color tokens, component architecture (shadcn/ui + CVA), modals, accordions, layout viewport units, Tailwind v4 migration patterns, animation timing and easing, accessibility, responsive behavior, and CSS architecture with `@layer` and `@theme`.
