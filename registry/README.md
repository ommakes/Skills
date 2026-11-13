# Vois registry

A shadcn-style registry of Vois core components, so an agent can install a real component instead of hand-building a lookalike. It is a reference implementation of the Vois skills on shadcn/ui and Tailwind v4, not a competing component library.

**Status: foundations.** Two items: `vois-tokens` (default values for every Vois token) and `vois-theme` (shadcn's variables pointed at those tokens). Components come next, starting with the ones blind builds hand-built most (`vois-components` lookalike rows `LOOKALIKE-001` to `004`, plus Avatar).

This folder is canonical in the private `ommakes/vois-skills` repo. The public `ommakes/Skills` repo carries a byte-for-byte copy, which its mirror check enforces. Nothing in it may call or import the Vois MCP, so the public copy works on its own.

## Install

The built files are not committed. Build them, then add the items from the build output:

```bash
cd registry && npm ci --ignore-scripts && npm run build      # writes public/r/*.json
cd <your app> && npx shadcn@4.23.0 add <path to>/registry/public/r/vois-tokens.json <path to>/registry/public/r/vois-theme.json
```

Where the built registry is hosted (so you can install by URL) is not decided yet.

Then import both right after Tailwind, tokens first:

```css
@import "tailwindcss";
@import "./styles/vois-tokens.css";
@import "./styles/vois-theme.css";
```

## Where the values come from

The Vois tokens are Figma variables, and each one's CSS name is its Web code syntax in Figma (`vois-tokens/references/figma-variables.md`, `DS-TOKEN-002`).

- **With the Vois MCP:** it serves your workspace's live values (`vois_get_tokens`). Use those.
- **Without it:** `vois-tokens` seeds a default for every token: palettes, Base, System and Component colors in light and dark, radius, spacing, size, the grid and panel widths, and the five elevation shadows.

The defaults use a **generic blue brand**. The Base layer sets the brand (`DS-TOKEN-004`), and a product's own brand stays in that product.

### `vois-tokens`

`vois/tokens/vois-tokens.css` is generated. Don't edit it by hand.

- Light values go in `:root`, dark values in `.dark`, and only the tokens that differ appear in `.dark` (`DS-TOKEN-003`).
- Colors are OKLCH (`color.md`). Every color is within 1/255 per channel of the Figma value, and a test checks that.
- Dimensions are px, and aliases stay `var()`, so the layers survive: `--bg-card: var(--white)`, `--radius-input: var(--radii-6)`.
- `--grid-margin` and `--grid-gutter` are generated as one `clamp()` each from their four line tokens (`DS-GRID-004`), the same line as `vois-tokens/scripts/grid-logic.mjs`.

It is built from two files in `source/`:

| File | What it is |
|---|---|
| `source/figma-export.json` | Every Figma variable with code syntax, with its values (`#rrggbb[aa]`, a number, or an alias `=--name`, as `[light, dark]` where they differ), plus the elevation shadows. **The twelve brand slots are `null`:** brand values never leave Figma through the export. |
| `source/brand-default.json` | The twelve brand slots for the default: primary and accent both blue. |

**Refreshing from Figma.** Run `scripts/figma-export.js` in the Vois Figma file through the Figma MCP's `use_figma` tool. It is read-only and returns `{ checksum, json }`. Save `json` byte for byte as `source/figma-export.json`, then:

```bash
node registry/scripts/build-tokens.mjs --verify-export <checksum>   # the file is exactly what Figma exported
node registry/scripts/build-tokens.mjs                              # writes vois/tokens/vois-tokens.css
```

**A product's own brand.** Write a brand file with the twelve slots and build your own copy. It goes to stdout, and nothing in this repo changes:

```bash
node registry/scripts/build-tokens.mjs --brand path/to/brand-acme.json > src/styles/vois-tokens.css
```

### `vois-theme`

`vois/theme/vois-theme.css` points every shadcn variable in `DS-TOKEN-005` at its Vois token. For example, `--background` is `var(--bg-background)`, `--primary` is `var(--action-primary-resting)`, and `--radius` is `var(--radii-8)`, so shadcn's `rounded-md`, `-lg` and `-xl` land on Vois's 6, 8 and 12. It ships no values.

Its selector, `:root:root, .dark.dark`, outranks shadcn's `:root` and `.dark`. So the import sits at the top like any import, and the mapping holds on the whole page and in a dark section of a light page. It does not reach components inside a shadow root.

`chart-*` and `sidebar-*` are not mapped yet. Components with their own tokens read them directly: Switch `--switch-*`, Checkbox and Radio `--control-*`, Input `--input-*`, Select `--select-*`.

### Why plain CSS files and not `cssVars`

Tested with shadcn 4.23.0. For every `cssVars` key the CLI adds a `--color-<key>` alias, so `--color-negative` became `--color-color-negative`. The item `css` property can't hold custom properties at all: the CLI parses the value as a nested rule and fails. A plain file installs unchanged.

An earlier draft mapped shadcn's `@theme inline` keys instead. That only works if the file is imported after shadcn's block, and strict CSS allows `@import` only at the top (`postcss-import` warns about it), so it moved to shadcn's raw variables.

## Adding an item

1. Put its files under `vois/<item-name>/` and add the item to `registry.json`. Build inputs that are not shipped go in `source/`.
2. Every file must be a type the `vois-tokens` detector reads (`.tsx`, `.jsx`, `.ts`, `.js`, `.css`, `.scss`) and pass it with no findings.
3. Run the checks below. They must all pass.
4. Add a line to `CHANGELOG.md`. For a release, add a new `## [x.y.z]` entry and set the same `version` in `package.json`; the check fails if they differ.

## Checks

| Command | Needs install | What it checks |
|---|---|---|
| `node registry/scripts/check-registry.mjs` | No | Item types; unique names, paths and install targets (ignoring case); a target on every `registry:file`; regular files with no symlink on the way; no unlisted files; theme CSS holds only the mapping block, each shadcn variable pointing at the one token `DS-TOKEN-005` names, with `MAPPINGS` equal to that table and every target a generated token; `vois-tokens.css` equals what the generator writes; every file is a type the detector reads, with no findings; `package.json`'s version is the newest CHANGELOG entry |
| `node registry/scripts/check-registry.test.mjs` | No | The checker's own tests |
| `node registry/scripts/build-tokens.test.mjs` | No | The generator's tests: OKLCH round trip, brand slots null in the export and filled only by the brand file, alias chains end at a value, the grid lines, the default brand is blue |
| `npm run build` (in `registry/`) | Yes | `shadcn build` validates every item against the registry schema |

CI runs all four on every PR. `node registry/scripts/build-tokens.mjs --check` is the same up-to-date check as `check-registry`'s, for use on its own. The shadcn version is pinned in `package.json`; bump it here first, with a CHANGELOG line.
