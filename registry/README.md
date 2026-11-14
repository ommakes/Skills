# Vois registry

A shadcn-style registry of Vois core components, so an agent can install a real component instead of hand-building a lookalike. It is a reference implementation of the Vois skills on shadcn/ui and Tailwind v4, not a competing component library.

**Status: Phase 1 components, complete.** Twenty-three items:

- `vois-tokens`: default values for every Vois token, plus the motion tokens.
- `vois-theme`: shadcn's variables pointed at those tokens.
- `vois-spinner`: the loading arc.
- `vois-input` and `vois-select`: fields at 36 (web), 48 (native) and 32 (compact, inline in tables).
- `vois-checkbox` and `vois-switch`: the Figma Checkbox and the Web and iOS Switch.
- `vois-radio-group` and `vois-tabs`: the Figma Radio, and the Tab (pill) and Tab Nav (underline) sets.
- `vois-button`: the first component, with icons and a loading state.
- `vois-textarea` and `vois-field`: the multi-line field that grows as you type, and the label, description, error and wiring around any control.
- `vois-input-group`: an input with icons, a prefix, a clear or show-password button, or an inline button.
- `vois-avatar`, `vois-badge` and `vois-tooltip`: the Figma Avatar, Labels and Status Labels, and Tooltip.
- `vois-segmented-control` and `vois-stepper`: the Figma Segments set, and a step indicator for a flow of 2 to 5 steps.
- `vois-choice-list` and `vois-choice-card`: full-width radio or checkbox rows, and radio or checkbox cards.
- `vois-card`, `vois-hover-card` and `vois-panel`: the container with a whole-card link, the hover preview, and the persistent secondary pane.

Phase 1 is complete. Next are the AI components, in waves.

This folder is canonical in the private `ommakes/vois-skills` repo. The public `ommakes/Skills` repo carries a byte-for-byte copy, which its mirror check enforces. Nothing in it may call or import the Vois MCP, so the public copy works on its own.

## Install

The built files are not committed. Build them, then add the items from the build output:

```bash
cd registry && npm ci --ignore-scripts && npm run build      # writes public/r/*.json
cd <your app> && npx shadcn@4.23.0 add <path to>/registry/public/r/vois-tokens.json <path to>/registry/public/r/vois-theme.json <path to>/registry/public/r/vois-spinner.json <path to>/registry/public/r/vois-button.json <path to>/registry/public/r/vois-input.json <path to>/registry/public/r/vois-select.json <path to>/registry/public/r/vois-checkbox.json <path to>/registry/public/r/vois-switch.json <path to>/registry/public/r/vois-radio-group.json <path to>/registry/public/r/vois-tabs.json <path to>/registry/public/r/vois-textarea.json <path to>/registry/public/r/vois-field.json <path to>/registry/public/r/vois-input-group.json <path to>/registry/public/r/vois-avatar.json <path to>/registry/public/r/vois-badge.json <path to>/registry/public/r/vois-tooltip.json <path to>/registry/public/r/vois-segmented-control.json <path to>/registry/public/r/vois-stepper.json <path to>/registry/public/r/vois-choice-list.json <path to>/registry/public/r/vois-choice-card.json <path to>/registry/public/r/vois-card.json <path to>/registry/public/r/vois-hover-card.json <path to>/registry/public/r/vois-panel.json
```

Where the built registry is hosted (so you can install by URL) is not decided yet.

Then import them right after Tailwind, tokens first:

```css
@import "tailwindcss";
@import "./styles/vois-tokens.css";
@import "./styles/motion-tokens.css";
@import "./styles/shape-tokens.css";
@import "./styles/vois-theme.css";
```

`vois-button` overwrites `components/ui/button.tsx`. It needs both token files, because it reads the motion tokens and `--hit-area-min`, and it needs `vois-spinner`, which it imports from `components/ui/spinner`. Add them together. `registryDependencies` can't point one local item at another until the registry has a URL. The same goes for these pairs: `vois-textarea` and `vois-input-group` import the Input's field classes (add `vois-input`), and `vois-choice-card` imports from `vois-choice-list`, which composes `vois-radio-group` and `vois-checkbox`.

## Where the values come from

The Vois tokens are Figma variables, and each one's CSS name is its Web code syntax in Figma (`vois-tokens/references/figma-variables.md`, `DS-TOKEN-002`).

- **With the Vois MCP:** it serves your workspace's live values (`vois_get_tokens`). Use those.
- **Without it:** `vois-tokens` seeds a default for every token: palettes, Base, System and Component colors in light and dark, radius, spacing, size, the grid and panel widths, and the five elevation shadows.

The defaults use a **generic blue brand**. The Base layer sets the brand (`DS-TOKEN-004`), and a product's own brand stays in that product.

### `vois-tokens`

`vois/tokens/vois-tokens.css`, `vois/tokens/motion-tokens.css` and `vois/tokens/shape-tokens.css` are generated. Don't edit them by hand.

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

### Shape roles (`shape-tokens.css`)

Corners are a behavior, not only a number (vois-tokens `DS-SHAPE-001`). `source/shape.json` holds each role as a structured definition, and the generator writes `shape-tokens.css`. These live in code because Figma radius variables can only hold numbers. The fixed roles point at the Figma radius roles, so they still follow Figma.

| Role | Type | Value | For |
|---|---|---|---|
| `--shape-sharp` | fixed | `0` | full-bleed media, table cells |
| `--shape-subtle` | fixed | `--radius-buttons-and-controls` (6) | buttons, inputs, selects |
| `--shape-rounded` | fixed | `--radius-small-container` (12) | menus, popovers, small cards |
| `--shape-soft` | fixed | `--radius-large-container` (24) | dialogs, sheets, large cards |
| `--shape-pill` | capsule | `9999px` | tags, chips, pill tabs, segmented controls, status dots |
| `--shape-circle` | circle | `50%` | avatars, round icon buttons |
| `--shape-responsive-soft` | proportional | `clamp(--radii-16, 4cqi, --radii-40)` | hero media, large image-led and editorial tiles |
| `--shape-responsive-elliptical` | elliptical | `4% / 6%` | a distinctive media surface, where elliptical corners are wanted |

- `--shape-responsive-soft` stays round and grows with the width of the nearest container. Give the surface's wrapper `container-type: inline-size`. With no container, `cqi` falls back to the small viewport.
- `--shape-responsive-elliptical` is round on a 3:2 box and elliptical on any other shape, because each percentage applies to its own axis.
- Continuous (squircle) corners are an enhancement on the soft and responsive roles: `supports-[corner-shape:squircle]:[corner-shape:squircle]`. Browsers without `corner-shape` keep the round corner.
- The generator fails on an unknown type, a missing or extra key, an alias that isn't a radius token, a scale outside 0 to 20cqi, a min not below max, or a percentage outside 0 to 50.

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

**Contrast.** The unchecked checkbox and radio border (`--control-border`) is gray-6 in light and gray-5 in dark, and the off Switch edge (`--switch-outline`) is gray-6. All three are at least 3.35:1 on every surface they sit on, so the control boundary meets the 3:1 of WCAG 1.4.11. The Switch fill alone (`--switch-off`) is about 1.1:1, which is why the edge is there. `--border-default`, which Inputs and Selects use, now meets 3:1 too.

### `vois-radio-group`

`vois/radio-group/radio-group.tsx` is shadcn's RadioGroup (Radix) on Vois tokens, from the Figma Radio set. Use it for one choice among a few options in a form, never buttons with `role="radio"` (`vois-components` `LOOKALIKE-003`).

| State | Look |
|---|---|
| Unselected | a 22 circle with a 3px `--control-border` ring |
| Selected | the ring grows to 8px in `--control-on`, leaving a 6px hole |
| Disabled | `--control-disabled`, as a ring or a disc. Disabled wins over selected |
| Focus | a 2px `--border-state-focus` ring, 3px out |
| `variant="aux"` | `--control-aux`, for a strong background |

The group spaces items by `--space-v-between-items`. Pair each item with a `<label>`.

### `vois-tabs`

`vois/tabs/tabs.tsx` is shadcn's Tabs (Radix) on Vois tokens. `TabsList` takes `variant` and `size`, and each trigger follows the list.

| | `pill` (default) | `underline` |
|---|---|---|
| From Figma | the Tab set | the Tab Nav set |
| Height | `size="default"` 28, `size="lg"` 40 | 48, with a 32 tall label box |
| Resting | `--tab-resting`, `--border-default` border | `--text-subtle` |
| Hover | `--tab-hover`, `--border-state-hover` | `--text-primary`, a 1px `--border-state-hover` edge |
| Active | `--tab-selected`, `--text-auxiliary` | `--text-primary`, a 2px `--border-accent` edge |
| Disabled | `--tab-disabled`, `--text-state-disabled` | `--text-state-disabled`, a 1px `--border-state-disabled` edge |
| Focus | 2px `--border-state-focus`, 2px out | 2px `--border-state-focus` around the label box |

Disabled wins over active. In Figma, the Tabs set (Selectors page, `8084:6370`) has Underline and Pill variants with a panel `Content` slot (code: `TabsContent`). Keep tabs visible all at once: for more than 5 or 6, use a Select (`vois-components` Job 5).

### `vois-textarea` and `vois-field`

`vois/textarea/textarea.tsx` is shadcn's Textarea on the Vois Input's box (`fieldClasses`), so the two can't drift. Same state order as the Input: disabled, read-only, error, focus, prefill, hover. Text is 16/24. `size="default"` pads like the Input (12 across, 8 down) so text lines up in one form, and `size="native"` pads 16 on every side, as in the Figma Text Box.

It grows with the text (`DS-LAYOUT-FIELD-001` to `004`): `field-sizing: content` inside `@supports`, with a minimum of 3 lines and a maximum of 12, then it scrolls inside. Change the limits with a class such as `[--textarea-max-lines:8]`. Browsers without `field-sizing` get `rows` (3 unless given) and a vertical resize handle.

`vois/field/field.tsx` carries shadcn's Field parts (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldContent`, `FieldTitle`) and one addition, `FieldControl`.

- **Wiring.** `FieldControl` sets the id, `aria-describedby` (descriptions first, then the error), `aria-invalid` and `aria-required` on its one child. `useFieldControl()` gives the same values to a control that can't take props through a child.
- **Type.** Label 14/20 medium `--text-secondary`, description right under it in `--text-state-resting` (4.5:1 or more), helper text 12/16 `--text-hint`, error 12/16 `--text-negative`.
- **Required.** The Figma asterisk, hidden from screen readers, who get `aria-required`. There is no "optional" marker, because Figma has none.
- **Error.** `role="alert"`, rendered only while there is something to say, so it is read once when it appears.
- **Figma.** The Field set (Inputs page, `8083:12252`) has `Status` (Default, Error), a `Control` slot (default: a field box) and a `Message` text property, around the Input Label. Drop an Input, Select or Textarea into `Control`. In code, that child goes inside `FieldControl`.

### `vois-input-group`

`vois/input-group/input-group.tsx` is shadcn's InputGroup (`InputGroup`, `InputGroupAddon`, `InputGroupInput`, `InputGroupButton`, `InputGroupText`) on the Vois Input, from the Figma Search, Email, Password, URL and Input Field with Button sets. It imports `fieldClasses`, so install `vois-input` with it. `size` gives 36, 48 or 32, as the Input does.

The states sit on the inner input, so the box reads them with `:has()`: disabled, then error, then focus, then prefill, then hover. A focused button inside draws its own 2px ring and the box does not light up.

| Part | Use |
|---|---|
| `InputGroupAddon align="inline-start"` or `"inline-end"` | 20px icons, text or buttons. Icons are `--icon-state-resting`, `--icon-primary` on hover, focus and prefill, `--icon-negative` on error |
| `InputGroupButton` | `size="icon-xs"`, `"icon-sm"` or `"xs"` for clear and copy; `size="segment"` is the Figma Inline Input Button, full height with a 1px divider |
| `InputGroupText segment` | the "https://" prefix in `--text-state-resting`, with a divider on its right |
| `InputGroupPasswordToggle` | a real button; its name flips between "Show password" and "Hide password" (no `aria-pressed`, so a screen reader does not read both) |
| `InputGroup shape="pill"` | the Search Field, `--shape-pill` |

Icon-only buttons need an `aria-label`. Inside a `vois-field`, `FieldControl` would label the group's `div`, not the input: put `useFieldControl()` on `InputGroupInput` instead. Not covered: read-only, shadcn's block aligns and `InputGroupTextarea`. A click on an addon does not focus the input (`LOOKALIKE-005`).

### `vois-avatar`

`vois/avatar/avatar.tsx` is shadcn's Avatar (Radix) with `Avatar`, `AvatarImage` and `AvatarFallback`, from the Figma Avatar set.

| `size` | Box | Initials |
|---|---|---|
| `xs` | `--size-avatar-x-small` (24) | 12/16 medium |
| `sm` | `--size-avatar-small` (28) | 14/20 semibold |
| `md` (default) | `--size-avatar-medium` (40) | 16/24 semibold |
| `lg` | `--size-avatar-large` (56) | 20/28 semibold |
| `xl` | `--size-avatar-x-large` (72) | 24/32 semibold |

`--shape-circle`, with a 2px `--border-overlap` ring outside the box so stacked avatars stay apart. `AvatarFallback` takes `variant`: `initials` (`--avatar-initials` fill, `--text-secondary`, 4.5:1 or more), `generic` (`--avatar-generic` fill and a person glyph in `--icon-subtle`, 3:1 or more) and `invite` (`--avatar-invite` fill, Goldie-3 in light and a Goldie tint in dark, with a 1px `--avatar-invite-edge` inside edge, Goldie-10, 3:1 or more on the page). The fallback shows while the image loads and stays if it fails. `AvatarImage` needs `alt`. In Figma the Generic and Invited variants have a `Content` slot (code: the children of `AvatarFallback`). Not covered: groups, presence dots and pairs.

### `vois-badge`

`vois/badge/badge.tsx` is shadcn's Badge on the Figma Labels and Status Labels. It keeps `variant` and `asChild`, and adds `color` and `size`.

| | `solid` | `soft` | `outline` |
|---|---|---|---|
| 16 hues | `--label-solid-<hue>` with Figma's on-solid text | `--label-soft-<hue>`, `--label-text-<hue>` | a 1px `--label-outline-<hue>` edge |
| statuses | `--base-<status>`, `--label-solid-blue` for info, `--base-accent-solid` for accent | `--label-<status>`, `--text-<status>` | a 1px `--border-<status>` edge |

`color` is one of 16 hues, or `info`, `positive`, `warning`, `negative`, `neutral`, `accent` or `aux`. shadcn's names still work: `default` is solid accent, `secondary` is soft gray, `destructive` is soft negative, `outline` is outline gray. `size="default"` is 20 tall (12/16 medium) and `size="lg"` is 24 tall (14/20 semibold). `--shape-pill`. As a link or button (`asChild`) it gets hover, pressed, focus and disabled looks, with a hit area of at least `--hit-area-min`. All 23 solid colors reach 4.5:1 in both modes. The Figma "Good" status is left out: its label token has no code syntax. In Figma, Labels has a swappable leading icon (off by default) and Status Labels a swappable trailing icon.

### `vois-tooltip`

`vois/tooltip/tooltip.tsx` is shadcn's Tooltip (Radix) with `TooltipProvider`, `Tooltip`, `TooltipTrigger` and `TooltipContent`, from the Figma Tooltip. `--bg-always-dark` with a 1px `--border-on-light` edge, 8 by 12 padding, 12/16 medium `--text-on-dark`, `--shape-subtle`, `--shadow-large`, `--z-overlay`, at most 216 wide, no arrow. Each `Tooltip` wraps itself in a `TooltipProvider` with no delay, as shadcn's does, so an outer provider's delay settings do not apply. It opens on hover and keyboard focus and closes on Escape, blur or leave. Radix keeps it inside the viewport. The fade uses `--motion-duration-fast` in and `--motion-duration-instant` out, and stops under reduced motion. The keyframes ship as a React 19 `<style href precedence>`. Use it only for short, passive text (`JOB-CONTEXTUAL-INFO`), never for something a user must read, and never `title=` (`LOOKALIKE-011`).

### `vois-segmented-control`

`vois/segmented-control/segmented-control.tsx` is shadcn's ToggleGroup fixed to one choice (no `type` prop, always `single`), from the Figma Segments set. It exports `ToggleGroup` and `ToggleGroupItem`, and the same parts as `SegmentedControl` and `SegmentedControlItem`, the names `vois-components` uses.

A 32 tall track (`--segment-inactive`, `--shape-subtle`). The active segment is a 28 tall indicator (`--segment-active`, 1px `--border-default`, `--shadow-base`). Inactive labels use `--text-state-resting`, active labels `--text-on-light`. Focus is a 2px `--segment-focus-ring`, on the indicator when active and inside the cell (over `--segment-focus-inactive`) when not. Every item uses the active padding, so the control does not change width when the choice moves. One tab stop, arrow keys move, and the chosen item cannot be cleared. Use it for 2 to 5 short views or modes (`vois-components` Job 5).

### `vois-stepper`

`vois/stepper/stepper.tsx` is the step indicator `vois-components` `references/stepper.md` specifies, for `JOB-MULTISTEP-GUIDE`: a `nav` with an ordered list, for 2 to 5 steps. It shows where the user is. Back and Next buttons in the form move between steps. Exports `Stepper`, `StepperItem` and `StepStatus`.

| Step | Marker (32) |
|---|---|
| current | `--base-positive` fill, the number, `aria-current="step"` |
| complete | `--base-positive` fill and a check |
| upcoming | no fill, a 2px `--control-border` ring, the number |
| error | a 2px `--icon-negative` ring and an alert mark |

Marks use `--label-on-solid-text-on-dark`, because Figma's white is under 3:1 on dark mode's light green. Connectors are 2px, `--border-state-focus` after a complete step and `--border-default` otherwise. Each state also has hidden text ("Completed", "Needs attention"). `orientation` is horizontal or vertical. Below the `sm` breakpoint the horizontal labels hide (screen readers still read them) and one line reads "Step N of M: Name". A complete step with `onSelect` is a button that goes back to that step. Put the `StepperItem` elements directly inside `Stepper`: a Fragment or wrapper component hides them from the step count. A step has one status, so an error step is not also `current` and carries no `aria-current`.

### `vois-choice-list` and `vois-choice-card`

`vois/choice-list/choice-list.tsx` is a list of full-width rows, each a radio or a checkbox with a label, from the Figma Radio Select and Checkbox Select sets. It composes `vois-radio-group` and `vois-checkbox`. Exports `ChoiceRadioGroup`, `ChoiceCheckboxGroup` and `ChoiceListItem`. Rows are at least 56 tall (`--radius-buttons-and-controls`), and the whole row is the click target, because it is a `<label>`.

| State | Row |
|---|---|
| resting | `--select-resting`, label `--text-state-resting` |
| hover and pressed | `--select-hover` and `--select-pressed`, label `--text-state-hover` |
| checked | `--select-soft-active` with a 2px `--border-accent` edge |
| `invalid` on the group | `--select-negative`, label `--text-negative`, control edge `--border-negative` |
| disabled | no fill, `--text-state-disabled` |
| `variant="aux"` | hover and checked fill `--select-aux`, text `--text-auxiliary`, control `--control-oncolor` |

Descriptions are 12/16 `--text-state-resting` (`--text-auxiliary` on aux rows), 4.5:1 or more. Disabled wins over negative, then checked, pressed, hover and resting.

`vois/choice-card/choice-card.tsx` exports `ChoiceCardItem`, a card with a label, a description and a radio or checkbox on the right, from the Figma Radio Card and Checkbox Card sets. It uses the groups from `vois-choice-list`, so install the two together. `--bg-card` with `--shadow-base`, `--radius-selectors`, a 1px `--border-default` edge, 1px `--border-state-hover` on hover, 2px `--border-state-active` when checked, and 2px `--border-state-focus` when the control has keyboard focus. Label 16/24 semibold, description 14/20 `--text-state-resting`. Children show under the label row and must not be interactive. In Figma, the Radio Card and Checkbox Card sets have a `Body` slot there, off by default (turn on `Show content` in an instance).

### `vois-card`

`vois/card/card.tsx` is shadcn's Card with `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`, from the Figma Card set. It adds `interactive` and `disabled` on `Card`, and `CardLink`.

The surface is `--bg-card`, `--shape-rounded` corners, 16 padding and 16 between sections, a 1px `--border-default` edge drawn inside, and `--shadow-base`. The title is 16/24 semibold `--text-primary`. The description, content and footer are 14/20 regular `--text-secondary` (4.5:1 or more).

| State (`interactive`) | Look |
|---|---|
| resting | the surface above, with a pointer cursor |
| hover | `--border-state-hover` edge and `--shadow-small` |
| pressed | `--border-state-hover` edge, no shadow |
| focus (the `CardLink` has keyboard focus) | a 2px `--border-state-focus` edge inside, with `--shadow-base` |
| `disabled` | `--border-state-disabled` edge, no shadow, `--text-state-disabled` text, the link is `aria-disabled` and out of the tab order |

A static card (no `interactive`) does nothing on hover. Disabled wins over focus, then pressed, hover and resting.

For a card that is itself the action (`vois-components` `JOB-CONTAIN-CONTENT`), put one `CardLink` in it, usually around the title. Its `::after` layer covers the whole card, so a screen reader reads one link named by the title, not a link around a block of text. `asChild` wraps a router `Link` or a `<button>`. `CardAction` sits above that layer, so a menu or button in it works on its own. In Figma, the Card's `Action`, `Content` and `Footer` are slots and `Title` and `Description` are text properties, which map to `CardAction`, `CardContent`, `CardFooter`, `CardTitle` and `CardDescription`. Anything else clickable inside the card needs `relative z-10`. The card draws the focus ring (even without `interactive`, because the link hides its own outline), so the ring is the card's edge. On a disabled card the link loses its `href` (so "open in a new tab" does nothing), and with `asChild` the child gets the real `disabled` attribute.

### `vois-hover-card`

`vois/hover-card/hover-card.tsx` is shadcn's HoverCard (Radix) with `HoverCard`, `HoverCardTrigger` and `HoverCardContent`, from the Figma Popover set (the same surface). `--bg-card` with a 1px `--border-default` edge, `--shape-rounded` corners, `--shadow-small`, 16 padding, 320 wide, `--z-overlay`. A 20 by 10 tail points at the trigger (`arrow={false}` removes it). Its fill covers the card's edge at the join and only the two slanted sides are stroked, so the join has no line.

It opens when the pointer rests on the trigger (700ms) or the trigger gets keyboard focus, and closes after the pointer leaves (300ms), on blur, or on Escape. Radix keeps it 8px inside the viewport and never wider than the space left. The fade uses `--motion-duration-fast` in and `--motion-duration-instant` out, and stops under reduced motion. The keyframes ship as a React 19 `<style href precedence>`. In Figma the Popover's `Content` is a slot (code: `HoverCardContent`). Body text is 14/20 `--text-secondary`; put a 16/24 semibold `--text-primary` title first if there is one. Use it for a passive preview of a linked thing (`JOB-CONTEXTUAL-INFO`). Touch devices never see it, so everything in it must also be on the page the trigger leads to. For content the user must read or act on, use a Popover, which opens on click.

### `vois-panel`

`vois/panel/panel.tsx` is the persistent secondary pane that `vois-components` `JOB-SECONDARY-CONTENT` picks (an inspector, a properties pane), from the Figma Panel set. shadcn has no Panel. Parts: `Panel`, `PanelHeader`, `PanelTitle`, `PanelDescription`, `PanelContent`, `PanelFooter`.

- **Panel.** An `<aside>` (a complementary landmark, so give it an `aria-label`), `--bg-card`, full height, with one 1px `--border-default` edge on the side that faces the main area. `side="right"` (default) puts the edge on its left and `side="left"` on its right. `width` is `"min"` (`--panel-push-min`, 280), `"default"` (`--panel-push-default`, 320) or `"max"` (`--panel-push-max`, 400), and it does not shrink in a flex row.
- **Header and footer.** 16 padding, with a 1px `--border-pretty` line under the header and above the footer. The footer aligns its actions to the end, spaced by `--space-h-between-actions`.
- **Type.** `PanelTitle` is an `h2`, 16/24 semibold `--text-primary`. `PanelDescription` and the content are 14/20 regular `--text-secondary`.
- **Content.** 16 padding, takes the free height and scrolls inside. A scroll area needs a way in for a keyboard: if the content has no focusable item, pass `tabIndex={0}`, and it shows a 2px inset `--border-state-focus` ring.

In Figma the Panel's `Action` (header), `Content` and `Footer` are slots, and `Title` and `Description` are text properties. A pane the user opens with a click is a Sheet, and one that holds app navigation is a Sidebar. Neither is in the registry yet.

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
| `node registry/scripts/check-registry.mjs` | No | Item types; unique names, paths and install targets (ignoring case); a target on every `registry:file`; regular files with no symlink on the way; no unlisted files; every `.css` file other than the two token files holds only the mapping block, each shadcn variable pointing at the one token `DS-TOKEN-005` names, with `MAPPINGS` equal to that table and every target a generated token; `vois-tokens.css`, `motion-tokens.css` and `shape-tokens.css` equal what the generator writes (and `shape.json` builds); the motion values equal `animation.md`'s starter block; every pending token is listed in `FIGMA-TODO.md`; every custom property a component file reads is a generated token or defined in that file; every file is a type the detector reads, with no findings; `package.json`'s version is the newest CHANGELOG entry |
| `node registry/scripts/check-registry.test.mjs` | No | The checker's own tests |
| `node registry/scripts/build-tokens.test.mjs` | No | The generator's tests: OKLCH round trip, brand slots null in the export and filled only by the brand file, alias chains end at a value, the grid lines, the default brand is blue, pending tokens stay pending, motion units and the motion file |
| `npm run build` (in `registry/`) | Yes | `shadcn build` validates every item against the registry schema |

CI runs all four on every PR. `node registry/scripts/build-tokens.mjs --check` is the same up-to-date check as `check-registry`'s, for use on its own. The shadcn version is pinned in `package.json`; bump it here first, with a CHANGELOG line.
