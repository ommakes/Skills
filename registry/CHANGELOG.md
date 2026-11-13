# Changelog

## [0.1.0] - 2026-11-13

- **Scaffold.** `registry.json` with one item, `vois-theme`: a CSS file that points shadcn's `--destructive` at `--color-negative` (`DS-COLOR-009`) and `--ring` at `--color-focus-ring` (`DS-A11Y-002`) in a `:root:root, .dark.dark` block, so it holds on the whole page and in a dark section, wherever it is imported. It ships no color values.
- **Checks.** `scripts/check-registry.mjs` checks item types, names, paths, install targets, symlinks, unlisted files, file types, detector findings, and that each CSS mapping points at the one token its rule names, with no install. `npm run build` runs `shadcn build` for the schema check.
- **Pin.** shadcn 4.23.0.
