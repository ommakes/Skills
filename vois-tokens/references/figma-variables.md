# Token layers and names `[DS-TOKEN]`

The Vois tokens are Figma variables. Figma is the reference for their names, their layers and their values. Each variable's CSS name is its **Web code syntax** in Figma, so Dev Mode shows the same name you write in code: `System/Surface/Bg-Card` is `var(--bg-card)`.

## Layers `[DS-TOKEN-001]`

| Layer | What it holds | Examples |
|---|---|---|
| Global | Raw palettes: 12 steps per hue, 12 alpha steps per hue | `--gray-1` to `--gray-12`, `--blue-9`, `--black-a4`, `--white`, `--black` |
| Base | The few roles everything else points at | `--base-brand`, `--base-accent-solid`, `--base-negative`, `--base-notice` |
| System | Surfaces, text, icons and borders by purpose and state | `--bg-card`, `--text-secondary`, `--icon-subtle`, `--border-state-focus` |
| Component | One component's states | `--input-resting`, `--select-focus`, `--switch-on`, `--action-primary-hover` |

Use the most specific layer that fits. A component reads its Component tokens if it has them, then System tokens. Component code never names a Global palette step directly. Palettes are reached through the layers that alias them.

## Names `[DS-TOKEN-002]`

A token's CSS name is its Web code syntax in Figma. Don't invent a name, and don't derive one by hand from the Figma path. If a variable has no code syntax, flag it.

The names follow these rules, so you can predict them:

| Figma | CSS | Example |
|---|---|---|
| Global, System, Component colors | the leaf name in kebab case | `System/Text/Text-Primary` → `--text-primary` |
| Base | `base-` + leaf | `Base/Accent Solid` → `--base-accent-solid` |
| Radius | `radii-{px}` for the scale, `radius-` + name for the roles | `--radii-6`, `--radius-input` |
| Spacing | `space-{px}`, `space-padding-*`, `space-v-*` (vertical), `space-h-*` (horizontal) | `--space-16`, `--space-v-between-inputs` |
| Size | `size-{px}`, `size-avatar-*`, `size-icon-*`, `size-action-*`, `size-field-web` and `size-field-native` (`[DS-COMPONENT-007]`), and `hit-area-min` (`[DS-A11Y-001]`) | `--size-icon-small`, `--size-field-web` |
| Values (Z-index group) | `z-*` (unitless whole numbers): `--z-dropdown`, `--z-overlay`, `--z-modal`, paired with the elevation tiers (`[DS-ELEVATION-002]`). The order is modal (1300), then dropdown (1400), then overlay (1500), so a popup opened from inside a dialog shows above it | `--z-dropdown` |
| Motion | `motion-duration-*` (ms), `motion-ease-*` (a string variable holding a `cubic-bezier`), `motion-distance-*` | `--motion-duration-fast` |
| Typography | `font-size-*` and `line-height-*` (px), `font-weight-*` (unitless), `font-family-*` (brand slots), and the roles `font-heading`, `font-body`, `font-mono`. Leaf in kebab case: `Font/Size/XSmall` → `--font-size-xsmall`, `Font/Weight/Semi Bold` → `--font-weight-semi-bold`. Not `--text-*`, which Tailwind reads as font sizes and Vois uses for text colors | `--font-size-small` |
| Elevation (effect styles, which have no code syntax) | `shadow-` + tier | `--shadow-medium` |

Two Figma spellings are corrected in CSS: `Golide-10` to `-12` are `--goldie-10` to `--goldie-12`, and `Auxilary` is `auxiliary` (`--text-auxiliary`).

## Where the values come from

The Vois MCP serves a workspace's live values (`vois_get_tokens`). When a project doesn't use the MCP, the registry's `vois-tokens` item seeds a default for every token, generated from the Figma variables with a generic blue brand. Use the MCP values when you have them; the defaults are the fallback.

The item ships three files: `vois-tokens.css`, `motion-tokens.css`, because the motion tokens may hold literal durations and curves only in a file with that name (`[DS-MOTION-001]`), and `shape-tokens.css`, the shape roles (`references/shape.md`). The shape roles live in code, not Figma, because Figma radius variables hold only numbers; the fixed roles alias the Figma `--radius-*` roles. The tokens decided while Figma was unreachable (`--size-36`, the field heights, `--hit-area-min`, the motion tokens, and `--size-action-large` at 36) are now Figma variables. `registry/FIGMA-TODO.md` lists what Figma still needs.

## Where they live `[DS-TOKEN-003]`

Define the tokens in `:root` (light values) and `.dark` (dark values), **not in `@theme`**. Tailwind v4 reads `--text-*` in `@theme` as font sizes, so `--text-primary` there would create a font-size utility. Expose the names Tailwind or a component library needs through `@theme inline` aliases (see `[DS-TAILWIND-001]`).

```css
:root { --bg-card: var(--white); --text-primary: var(--gray-12); }
.dark { --bg-card: var(--warm-gray-11); --text-primary: var(--white); }
@theme inline { --color-card: var(--bg-card); }
```

## Brand slots `[DS-TOKEN-004]`

The Base layer sets the brand: `--base-brand` is the primary color, and `--base-accent-solid` and `--base-accent-soft` are the accent. Everything else is shared structure.

In the current Figma file, the primary action states and the accent System tokens point at palette steps directly rather than at Base. So a brand theme overrides these thirteen color tokens, plus the four font families, and nothing else:

- Colors: `--base-brand`, `--base-accent-solid`, `--base-accent-soft`, `--action-primary-resting`, `--action-primary-hover`, `--action-primary-focus`, `--action-primary-pressed`, `--action-primary-disabled`, `--action-primary-text` (text and icons on a primary button, which depends on the brand: black on a light brand, white on a dark one), `--bg-accent`, `--text-accent`, `--icon-accent`, `--border-accent`.
- Fonts: `--font-family-brand`, `--font-family-system`, `--font-family-written`, `--font-family-mono`. The role tokens `--font-heading`, `--font-body` and `--font-mono` alias them, so they follow.

Checked controls, switches and solid selected options alias `--base-accent-solid`, so they follow the brand on their own. The generic default makes the primary and the accent both blue, and uses generic system font stacks. A product's own brand (its colors, palette choices and fonts) stays in that product, not in this skill.

## shadcn/ui variables `[DS-TOKEN-005]`

When a project uses shadcn/ui, point each shadcn variable at the Vois token below. Any theme that wires shadcn to Vois, such as the registry's `vois-theme`, follows this table.

| shadcn | Vois token |
|---|---|
| `background` | `--bg-background` |
| `foreground` | `--text-primary` |
| `card` | `--bg-card` |
| `card-foreground` | `--text-primary` |
| `popover` | `--bg-card` |
| `popover-foreground` | `--text-primary` |
| `primary` | `--action-primary-resting` |
| `primary-foreground` | `--action-primary-text` |
| `secondary` | `--action-secondary-resting` |
| `secondary-foreground` | `--text-primary` |
| `muted` | `--bg-subtle` |
| `muted-foreground` | `--text-secondary` |
| `accent` | `--bg-hover` |
| `accent-foreground` | `--text-primary` |
| `destructive` | `--base-negative` |
| `border` | `--border-pretty` |
| `input` | `--input-border` |
| `ring` | `--border-state-focus` |
| `radius` | `--radii-8` |

shadcn derives its radius steps from `radius` (`sm` is 4px less, `md` 2px less, `lg` equal, `xl` 4px more). With `--radii-8` they land on the Vois roles: `rounded-md` is 6 (`--radius-buttons-and-controls`, `--radius-input`), `rounded-lg` is 8 (`--radius-selectors`), `rounded-xl` is 12 (`--radius-small-container`).

`chart-1` to `chart-5` come from `vois-dataviz`, and `sidebar-*` has no Vois token yet. Components with their own tokens read them directly instead of shadcn's shared variables: Switch reads `--switch-*`, Checkbox and Radio read `--control-*`, Input reads `--input-*` and Select reads `--select-*`.
