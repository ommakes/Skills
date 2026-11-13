# Vois registry

A shadcn-style registry of Vois core components, so an agent can install a real component instead of hand-building a lookalike. It is a reference implementation of the Vois skills on shadcn/ui and Tailwind v4, not a competing component library.

**Status: scaffold.** It holds one item, `vois-theme`. Components come next, starting with the ones blind builds hand-built most (`vois-components` lookalike rows `LOOKALIKE-001` to `004`, plus Avatar).

This folder is canonical in the private `ommakes/vois-skills` repo. The public `ommakes/Skills` repo carries a byte-for-byte copy, which its mirror check enforces. Nothing in it may call or import the Vois MCP, so the public copy works on its own.

## Install

The built files are not committed. Build them, then add an item from the build output:

```bash
cd registry && npm ci && npm run build      # writes public/r/*.json
cd <your app> && npx shadcn@4.23.0 add <path to>/registry/public/r/vois-theme.json
```

Where the built registry is hosted (so you can install by URL) is not decided yet.

## The theme

`vois-theme` copies `vois-theme.css` into your app's styles folder (the item's `target` in `registry.json`). Import it right after Tailwind:

```css
@import "tailwindcss";
@import "./styles/vois-theme.css";

/* ...shadcn's :root, .dark and @theme inline blocks... */

@theme {
  /* your workspace's Vois token values (light) */
}
.dark {
  /* the same Vois tokens, dark values (vois-tokens DS-COLOR-006) */
}
```

Vois fixes token names, not values (`vois-tokens/references/color.md`). The theme ships no colors.

- **Different names, and a Vois rule says which token:** `vois-theme.css` points shadcn's own variable at the Vois token: `--destructive` at `--color-negative` (`DS-COLOR-009`) and `--ring` at `--color-focus-ring` (`DS-A11Y-002`). Its selector, `:root:root, .dark.dark`, outranks shadcn's `:root` and `.dark`, so the import can sit at the top like any import, and the mapping holds on the whole page and in a dark section of a light page. It does not reach components inside a shadow root.
- **Same name in both systems** (`--color-background`, `--color-primary`, `--color-primary-foreground`, `--color-border`, `--color-muted-foreground`): put your Vois `@theme` after shadcn's `@theme inline` block, in your own CSS. The later block wins. No mapping is needed.
- **Status roles** (`info`, `positive`, `negative`, `warning`, each with `-foreground`, `-surface`, `-border`): Tailwind makes the classes once you define the tokens. No mapping is needed.

Checked with shadcn 4.23.0 and Tailwind 4.1.11, through both `@tailwindcss/postcss` alone and `postcss-import` first, in Chromium: `bg-destructive` and `ring-ring` take the Vois values with `.dark` on the page, on a section, and with no dark class, with no warnings.

Each mapping is pinned in `scripts/check-registry.mjs` (`MAPPINGS`) to one token and the rule that names it. The check fails if that rule stops naming the token, so a rename in `vois-tokens` can't leave the theme pointing at nothing.

### shadcn names Vois does not name yet

These have no Vois token, so the theme leaves them alone and they keep whatever value your shadcn setup gives them. Giving them Vois names is a `vois-tokens` change, made there first, not here.

| shadcn name | Closest Vois idea, not yet a rule |
|---|---|
| `foreground` | `--color-heading` covers headings only |
| `card`, `card-foreground`, `popover`, `popover-foreground` | `--color-surface` |
| `input` | `--color-border`, `--color-border-focus` |
| `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `muted` | the 30% and 10% roles in `DS-COLOR-004` |
| `chart-1` to `chart-5` | `vois-dataviz` palette rules |
| `sidebar-*` | none |
| `radius` | `--radius-md` is the only radius named |

### Why a CSS file and not `cssVars`

Tested with shadcn 4.23.0. For every `cssVars` key the CLI adds a `--color-<key>` alias, so Vois's `--color-negative` became `--color-color-negative`. The item `css` property can't hold custom properties at all: the CLI parses the value as a nested rule and fails. A plain file installs unchanged.

An earlier draft mapped shadcn's `@theme inline` keys instead. That only works if the file is imported after shadcn's block, and strict CSS allows `@import` only at the top (`postcss-import` warns about it), so it moved to shadcn's raw variables.

## Adding an item

1. Put its files under `vois/<item-name>/` and add the item to `registry.json`.
2. Every file must be a type the `vois-tokens` detector reads (`.tsx`, `.jsx`, `.ts`, `.js`, `.css`, `.scss`) and pass it with no findings.
3. Run the checks below. Both must pass.
4. Add a line to `CHANGELOG.md`.

## Checks

| Command | Needs install | What it checks |
|---|---|---|
| `node registry/scripts/check-registry.mjs` | No | Item types; unique names, paths and install targets (ignoring case); a target on every `registry:file`; regular files with no symlink on the way; no unlisted files; CSS holds only the mapping block, with each shadcn variable pointing at the one token its rule names; every file is a type the detector reads, with no findings |
| `node registry/scripts/check-registry.test.mjs` | No | The checker's own tests |
| `npm run build` (in `registry/`) | Yes | `shadcn build` validates every item against the registry schema |

CI runs all three on every PR. The shadcn version is pinned in `package.json`; bump it here first, with a CHANGELOG line.
