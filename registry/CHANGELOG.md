# Changelog

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
