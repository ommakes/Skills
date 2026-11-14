# Changelog

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
