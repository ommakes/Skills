# Changelog

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
