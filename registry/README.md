# Vois registry

A shadcn-style registry of Vois core components, so an agent can install a real component instead of hand-building a lookalike. It is a reference implementation of the Vois skills on shadcn/ui and Tailwind v4, not a competing component library.

**Status: Phase 1 components.** Six items:

- `vois-tokens`: default values for every Vois token, plus the motion tokens.
- `vois-theme`: shadcn's variables pointed at those tokens.
- `vois-spinner`: the loading arc.
- `vois-input` and `vois-select`: fields at 36 (web), 48 (native) and 32 (compact, inline in tables).
- `vois-checkbox` and `vois-switch`: the Figma Checkbox and the Web and iOS Switch.
- `vois-button`: the first component, with icons and a loading state.

Next come the components blind builds hand-built most (`vois-components` lookalike rows `LOOKALIKE-003` and `004`, plus Avatar): RadioGroup or ToggleGroup, Stepper and Avatar.

This folder is canonical in the private `ommakes/vois-skills` repo. The public `ommakes/Skills` repo carries a byte-for-byte copy, which its mirror check enforces. Nothing in it may call or import the Vois MCP, so the public copy works on its own.

## Install

The built files are not committed. Build them, then add the items from the build output:

```bash
cd registry && npm ci --ignore-scripts && npm run build      # writes public/r/*.json
cd <your app> && npx shadcn@4.23.0 add <path to>/registry/public/r/vois-tokens.json <path to>/registry/public/r/vois-theme.json <path to>/registry/public/r/vois-spinner.json <path to>/registry/public/r/vois-button.json <path to>/registry/public/r/vois-input.json <path to>/registry/public/r/vois-select.json <path to>/registry/public/r/vois-checkbox.json <path to>/registry/public/r/vois-switch.json
```

Where the built registry is hosted (so you can install by URL) is not decided yet.

Then import them right after Tailwind, tokens first:

```css
@import "tailwindcss";
@import "./styles/vois-tokens.css";
@import "./styles/motion-tokens.css";
@import "./styles/vois-theme.css";
```

`vois-button` overwrites `components/ui/button.tsx`. It needs both token files, because it reads the motion tokens and `--hit-area-min`, and it needs `vois-spinner`, which it imports from `components/ui/spinner`. Add them together. `registryDependencies` can't point one local item at another until the registry has a URL.

## Where the values come from

The Vois tokens are Figma variables, and each one's CSS name is its Web code syntax in Figma (`vois-tokens/references/figma-variables.md`, `DS-TOKEN-002`).

- **With the Vois MCP:** it serves your workspace's live values (`vois_get_tokens`). Use those.
- **Without it:** `vois-tokens` seeds a default for every token: palettes, Base, System and Component colors in light and dark, radius, spacing, size, the grid and panel widths, and the five elevation shadows.

The defaults use a **generic blue brand**. The Base layer sets the brand (`DS-TOKEN-004`), and a product's own brand stays in that product.

### `vois-tokens`

`vois/tokens/vois-tokens.css` and `vois/tokens/motion-tokens.css` are generated. Don't edit them by hand.

- Light values go in `:root`, dark values in `.dark`, and only the tokens that differ appear in `.dark` (`DS-TOKEN-003`).
- Colors are OKLCH (`color.md`). Every color is within 1/255 per channel of the Figma value, and a test checks that.
- Dimensions are px, and aliases stay `var()`, so the layers survive: `--bg-card: var(--white)`, `--radius-input: var(--radii-6)`.
- `--grid-margin` and `--grid-gutter` are generated as one `clamp()` each from their four line tokens (`DS-GRID-004`), the same line as `vois-tokens/scripts/grid-logic.mjs`.

It is built from three files in `source/`:

| File | What it is |
|---|---|
| `source/figma-export.json` | Every Figma variable with code syntax, with its values (`#rrggbb[aa]`, a number, or an alias `=--name`, as `[light, dark]` where they differ), plus the elevation shadows. **The seventeen brand slots are `null`:** thirteen colors and four font families. Brand values never leave Figma through the export. |
| `source/brand-default.json` | The seventeen brand slots for the default: primary and accent both blue, white text on a `blue-10` primary fill (white on `blue-9` fails 4.5:1), and generic system font stacks. |
| `source/figma-pending.json` | Tokens decided but not yet in Figma (see below). Empty today. |

**Refreshing from Figma.** Run `scripts/figma-export.js` in the Vois Figma file through the Figma MCP's `use_figma` tool. It is read-only and returns `{ checksum, json }`. Save `json` byte for byte as `source/figma-export.json`, then:

```bash
node registry/scripts/build-tokens.mjs --verify-export <checksum>   # the file is exactly what Figma exported
node registry/scripts/build-tokens.mjs                              # writes vois/tokens/vois-tokens.css
```

**A product's own brand.** Write a brand file with the seventeen slots and build your own copy. It goes to stdout, and nothing in this repo changes. A brand file written for the earlier sixteen slots fails until you add `--action-primary-text`, the color of primary labels and icons. Pick one that meets 4.5:1 on each `--action-primary-*` fill.

```bash
node registry/scripts/build-tokens.mjs --brand path/to/brand-acme.json > src/styles/vois-tokens.css
```

### Tokens decided before Figma has them

When a token is decided while Figma can't be reached, it goes in `source/figma-pending.json`:
- `add` holds new tokens.
- `change` holds `{ from, to }` for a token Figma already has.

`build-tokens.mjs` applies them on top of the export. Each entry is only valid while Figma still lacks it:

- An added token that Figma now exports fails the build.
- A change that Figma now matches fails.
- A change whose `from` no longer matches Figma fails.
- A token name written twice fails.

So the file empties as Figma catches up. The checker fails if a pending token is missing from `FIGMA-TODO.md`.

The file is empty today. The Button's tokens were made this way on 2026-11-13 and moved into Figma the same day.

### Z-index layers

`--z-dropdown` (1000), `--z-overlay` (1200) and `--z-modal` (1300) come from the Figma `Values` collection, written without a unit. The gaps leave room for a sticky layer (1100) and toasts (1400) later. Each layer goes with an elevation tier (vois-tokens `elevation.md`): a menu at `--shadow-medium` on `--z-dropdown`, a popover at `--shadow-large` on `--z-overlay`, a dialog at `--shadow-xlarge` on `--z-modal`.

### Motion tokens (`motion-tokens.css`)

The `--motion-*` tokens go to their own generated file, because the vois-tokens detector allows literal durations and curves only in a file named `motion-tokens.css` (`DS-MOTION-001`).

- **Durations** are written in ms. Every other number is px.
- **Easing** comes from a Figma string variable, exported as `{ "css": "cubic-bezier(...)" }`. The generator accepts that form only on a `--motion-ease-*` token, and only for a `cubic-bezier` with four numbers.
- **Values must match the skill.** The checker requires the values to equal the starter block in `vois-tokens/references/animation.md`. A change to one means a change to both.

### `vois-button`

`vois/button/button.tsx` is shadcn/ui's Button on Vois tokens.

**Names.** It keeps shadcn's variant names (`default`, `destructive`, `secondary`, `outline`, `ghost`, `link`) and size names (`sm`, `default`, `lg`, `icon-sm`, `icon`, `icon-lg`), and adds `circular`, plus the two Figma variants shadcn lacks: `auxiliary` (the black Auxilary button) and `destructive-soft` (Soft Negative). Other shadcn components that call `buttonVariants(...)` keep working.

**Heights** (`DS-COMPONENT-007`):

| Size | Height |
|---|---|
| `sm` | 28 |
| `default` | 36, the web default |
| `lg` | 48, the native default |
| `circular` | 56 |

**Behavior:**
- **Focus:** a 2px ring with a 2px offset (`DS-A11Y-002`) in each variant's Figma focus color: `--action-primary-focus`, `--solid-negative-focus`, `--soft-negative-focus` or `--action-auxiliary-focus`, and `--border-state-focus` for secondary, outline, ghost and link. The fill stays as it is.
- **Hit area:** an `::after` at least `--hit-area-min` (`DS-A11Y-001`).
- **Press:** scales to 0.96 on a pointer press only (`DS-ANIMATION-008`, `003`, `004`).
  - It doesn't scale on a keyboard press or under reduced motion.
  - The motion tokens time it.
  - `static` turns it off.

**Layout**, from the Figma Primary Button:

| | `sm` | `default` | `lg` |
|---|---|---|---|
| Container padding | 8 | 12 | 12 |
| Label frame | 4px each side, centered, 8px gap | same | same |
| Text from the edge | 12 | 16 | 16 |
| Type (`--font-weight-semi-bold`, page font inherited) | `--font-size-xsmall` 14 / `--line-height-xsmall` 20 | `--font-size-small` 16 / 24 | `--font-size-medium` 18 / 26 |
| Icons | 16 | 20 | 20 |

**Icons.**

```tsx
<Button leadingIcon={<Plus />} trailingIcon={<ChevronDown />}>Add</Button>
```

- The Button sizes the icons and marks them `aria-hidden`. They work with `asChild` too.
- An icon passed as a child, shadcn style, still sits beside the text.
- An icon-only Button stays `size="icon"`, with the icon as its child and an `aria-label`.

**Loading.** `loading` shows the Vois spinner on top of the content.
- The label stays in place, transparent, so the width doesn't change and the accessible name stays.
- It sets `aria-busy` and `aria-disabled`.
- Clicks, Enter and form submits are cancelled, including an `asChild` child's own `onClick`, and the click doesn't bubble to parent handlers. A caller's `aria-disabled` gets the same treatment.
- The fill stays at resting, as in Figma.

**Colors.** `text-`, `border-` and `outline-` colors carry a `color:` type hint. Without it, `tailwind-merge` in `cn()` drops `text-sm` or the color.

**Checked against Figma (2026-11-13).** Fills, borders, focus rings and disabled text come from the Figma button sets. Notes:

- **Primary text** is the brand slot `--action-primary-text`: white on the blue default. The Figma file uses the same blue default, so it shows no product brand.
- **`destructive-soft` disabled** uses `--soft-negative-disabled` and `--soft-negative-disabled-text` (Global red alpha), from the Figma Soft Negative Disabled state.

### `vois-input` and `vois-select`

`vois/input/input.tsx` and `vois/select/select.tsx` are shadcn's Input and Select (Radix) on Vois tokens. Both take `size`:

| `size` | Height | Use |
|---|---|---|
| `default` | `--size-field-web` (36) | web |
| `native` | `--size-field-native` (48) | iOS and Android |
| `compact` | `--size-field-compact` (32) | only an inline field nested in a table or a dense row |

**States, from the Figma Input Field and Dropdown Field:**

| State | Fill | Border | Text |
|---|---|---|---|
| Resting | `--input-resting` | `--border-default` | placeholder `--text-state-instruction` |
| Hover | `--input-hover` | `--border-state-hover` | |
| Focus | `--input-focus` | 2px `--border-state-focus` (a 1px border plus a 1px inset ring, so the size never changes) | |
| Error (`aria-invalid`) | `--input-negative` | `--border-negative` | `--text-negative` |
| Disabled | `--input-disabled` | `--border-state-disabled` | `--text-state-disabled` |
| Prefill (`prefill`) | `--input-prefill` | `--border-info` | |

**Read-only** shows the value as plain text, as in Figma.

**When two states apply**, the first in this list wins: disabled, read-only, error, focus (or an open Select), prefill, hover. So a focused field with an error keeps its red border, with a red inner ring, and a disabled field never shows hover. The Select trigger imports the same classes from the Input (`fieldClasses`), so install `vois-input` with `vois-select`.

**The Select list** follows the Figma Dropdown Menu:
- `--bg-card`, a `--border-pretty` border, `--radius-small-container` and `--shadow-medium`.
- Items are 40 tall with 14px text. A long label wraps and the row grows.
- Hover and keyboard highlight use `--select-hover`, on the selected item too, so focus always shows. The selected item uses `--select-soft-active` with `--text-accent` and a check mark, and keeps the accent text and check mark while highlighted.
- A disabled trigger dims its chevron to `--icon-state-disabled`.

**Not covered here:**
- The list sits on the `--z-dropdown` layer (1000).
- Open and close are not animated.
- The field's label, description and helper text are separate: use your form layout.

### `vois-checkbox` and `vois-switch`

`vois/checkbox/checkbox.tsx` and `vois/switch/switch.tsx` are shadcn's Checkbox and Switch (Radix) on Vois tokens, from the Figma Selectors page.

**Which one:** a Switch for a setting that takes effect at once, a Checkbox for a choice that a form submits later (`vois-components` `JOB-BINARY-PREFERENCE`).

| | Checkbox | Switch |
|---|---|---|
| Size | 24 box, 2px inside border | `default` 32 x 20, knob 14; `native` 52 x 32, knob 28 |
| Off | `--control-border` border | `--switch-off` track with a 1px `--switch-outline` edge |
| On | `--control-on`, mark `--icon-on-dark` (also indeterminate) | `--switch-on` track, `--switch-knob` knob |
| Disabled | `--control-disabled`, mark `--icon-state-disabled` | `--switch-disabled`, knob `--icon-state-disabled` |
| Focus | 2px `--control-focus`, 2px out | 2px `--border-state-focus`, 2px out |
| Other | `variant="aux"` for a strong background | The knob slides in `--motion-duration-fast` |

Both have a hit area of at least `--hit-area-min`, and disabled wins over on. Labels are separate, as in shadcn: pair each one with a `<label>`.

**Contrast.** The unchecked checkbox border (`--control-border`) and the off Switch edge (`--switch-outline`) are gray-6, about 4.1:1 on the light page and 4.4:1 on dark, so the control boundary meets the 3:1 of WCAG 1.4.11. The Switch fill alone (`--switch-off`) is about 1.1:1, which is why the edge is there. Inputs and Selects keep `--border-default`.

### `vois-spinner`

`vois/spinner/spinner.tsx` is one open arc turning in a circle: the loading.dev "arc", with its MIT notice kept in the file.

- **Timing.** One turn per `--motion-duration-spin` (800ms).
- **Reduced motion.** `motion-reduce:` stops it, and the arc stays still.
- **Color and size.** It uses `currentColor`. `size` is `sm` 16, `default` 20 or `lg` 24.
- **Accessibility.** On its own it is wrapped in a `role="status"` span with screen-reader text (`label`, default "Loading"). A status region mounted already filled may not be announced, so for a guaranteed announcement keep one mounted and change its text. Inside a Button it is `aria-hidden`, and the Button carries `aria-busy`.
- **Keyframes.** It uses Tailwind's built-in `spin` keyframes. If your theme resets `--animate-*`, keep `--animate-spin`, or the arc won't turn.

Use it instead of a spinning icon (`LOOKALIKE-002`).

### `vois-theme`

`vois/theme/vois-theme.css` points every shadcn variable in `DS-TOKEN-005` at its Vois token. For example, `--background` is `var(--bg-background)`, `--primary` is `var(--action-primary-resting)`, and `--radius` is `var(--radii-8)`, so shadcn's `rounded-md`, `-lg` and `-xl` land on Vois's 6, 8 and 12. It ships no values.

Its selector, `:root:root, .dark.dark`, outranks shadcn's `:root` and `.dark`. So the import sits at the top like any import, and the mapping holds on the whole page and in a dark section of a light page. It does not reach components inside a shadow root.

`chart-*` and `sidebar-*` are not mapped yet. Components with their own tokens read them directly: Switch `--switch-*`, Checkbox and Radio `--control-*`, Input `--input-*`, Select `--select-*`.

### Why plain CSS files and not `cssVars`

Tested with shadcn 4.23.0. For every `cssVars` key the CLI adds a `--color-<key>` alias, so `--color-negative` became `--color-color-negative`. The item `css` property can't hold custom properties at all: the CLI parses the value as a nested rule and fails. A plain file installs unchanged.

An earlier draft mapped shadcn's `@theme inline` keys instead. That only works if the file is imported after shadcn's block, and strict CSS allows `@import` only at the top (`postcss-import` warns about it), so it moved to shadcn's raw variables.

## Adding an item

1. Put its files under `vois/<item-name>/` and add the item to `registry.json`. Build inputs that are not shipped go in `source/`.
   - For a component (`registry:ui`), list its npm packages in `dependencies` and `utils` in `registryDependencies`, and give it a `target` under `components/ui/`.
   - Style it in the `.tsx` itself. Any `.css` file other than the token files is checked as a theme mapping block.
   - Every custom property it reads must be a generated token (or one it defines itself).
2. Every file must be a type the `vois-tokens` detector reads (`.tsx`, `.jsx`, `.ts`, `.js`, `.css`, `.scss`) and pass it with no findings.
3. Run the checks below. They must all pass.
4. Add a line to `CHANGELOG.md`. For a release, add a new `## [x.y.z]` entry and set the same `version` in `package.json`; the check fails if they differ.

## Checks

| Command | Needs install | What it checks |
|---|---|---|
| `node registry/scripts/check-registry.mjs` | No | Item types; unique names, paths and install targets (ignoring case); a target on every `registry:file`; regular files with no symlink on the way; no unlisted files; every `.css` file other than the two token files holds only the mapping block, each shadcn variable pointing at the one token `DS-TOKEN-005` names, with `MAPPINGS` equal to that table and every target a generated token; `vois-tokens.css` and `motion-tokens.css` equal what the generator writes; the motion values equal `animation.md`'s starter block; every pending token is listed in `FIGMA-TODO.md`; every custom property a component file reads is a generated token or defined in that file; every file is a type the detector reads, with no findings; `package.json`'s version is the newest CHANGELOG entry |
| `node registry/scripts/check-registry.test.mjs` | No | The checker's own tests |
| `node registry/scripts/build-tokens.test.mjs` | No | The generator's tests: OKLCH round trip, brand slots null in the export and filled only by the brand file, alias chains end at a value, the grid lines, the default brand is blue, pending tokens stay pending, motion units and the motion file |
| `npm run build` (in `registry/`) | Yes | `shadcn build` validates every item against the registry schema |

CI runs all four on every PR. `node registry/scripts/build-tokens.mjs --check` is the same up-to-date check as `check-registry`'s, for use on its own. The shadcn version is pinned in `package.json`; bump it here first, with a CHANGELOG line.
