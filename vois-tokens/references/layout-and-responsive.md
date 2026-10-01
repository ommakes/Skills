# Layout, Viewport, and Responsive Behavior `[DS-LAYOUT]` `[DS-RESPONSIVE]`

## Viewport Height Units

Stop using `vh`. It breaks on mobile because browser chrome changes the available height as you scroll. Use the right unit for the context: `[DS-LAYOUT-001]`

| Unit | What it means | Use for |
|------|--------------|---------|
| `svh` | Small viewport height — assumes maximum browser chrome visible | Hero sections, modals, anything that must fit on first load |
| `lvh` | Large viewport height — assumes minimum browser chrome | Full-screen backgrounds, decorative elements that can extend under chrome |
| `dvh` | Dynamic viewport height — updates as chrome appears/disappears | Interfaces that should resize as mobile keyboard or nav appears |

```css
/* Hero that fits even with address bar showing */
.hero { min-height: 100svh; }

/* Background that fills generously */
.bg-cover { height: 100lvh; }

/* Chat interface that resizes as mobile keyboard appears */
.chat-container { height: 100dvh; }
```

Default to `svh` for anything that needs to fit on screen. Only reach for `dvh` when you specifically need the layout to respond to browser chrome changes.

## Performance on Long Pages

For pages with significant vertical scroll, use `content-visibility: auto` on sections that are far below the fold to skip rendering them until they approach the viewport: `[DS-LAYOUT-002]`

```css
.page-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* estimated height prevents scroll jump */
}
```

Don't apply this to sections visible on initial load.

## Responsive Behavior `[DS-RESPONSIVE]`

- **Mobile-first.** The unprefixed/base style is the mobile baseline; breakpoint-scoped styles layer on as progressive enhancements — Tailwind's `md:`/`lg:` prefixes, or a `stylex.defineConsts()` breakpoint used as a conditional key in `stylex.create()` (see `[DS-STYLEX-006]`). `[DS-RESPONSIVE-001]`
- Test at `sm` (640px), `md` (768px), `lg` (1024px) before considering a component done. `[DS-RESPONSIVE-002]`
- Use **container queries** for component-level responsiveness. Use **breakpoints** for layout-level responsiveness. `[DS-RESPONSIVE-003]`
- Touch targets, font sizes, and contrast ratios must meet minimums at every breakpoint. `[DS-RESPONSIVE-004]`
- Don't build desktop-first and assume it'll work on mobile. It won't. `[DS-RESPONSIVE-005]`

### Judgment Under Constraint

The rules above are mechanical — they tell you *how* to test responsiveness.
They don't tell you what to do when content genuinely doesn't fit at a
breakpoint. That's a judgment call, and the default AI move (scale
everything down proportionally until it fits) is usually the wrong one:

- **Preserve task hierarchy before shrinking type.** Identify what the user
  is actually on the screen to do — the primary task or piece of content —
  and keep it at a comfortable, legible size at every breakpoint. Let
  secondary and tertiary content (metadata, supporting stats, decorative
  elements) absorb the constraint first. A dashboard card losing its
  helper caption on mobile is fine; its headline metric shrinking below
  `--text-h2` so the caption can keep its size is backwards. `[DS-RESPONSIVE-006]`
- **Reflow, then collapse, then hide, then shrink — in that order.** When
  something doesn't fit: first try reflowing it (grid to single column,
  row to stack); then collapsing it (a filter bar into a "Filters" button
  with a sheet, a toolbar into an overflow menu); then hiding it if it's
  truly secondary (a column, a badge, a hint that only matters at a glance
  on larger screens). Shrinking text or spacing to cram the same layout
  into less room is the last resort, not the first move — and it never
  overrides the type-scale, touch-target, or contrast minimums in
  `[DS-RESPONSIVE-004]`. `[DS-RESPONSIVE-007]`

## Component-Level Layout Rules `[DS-LAYOUT-COMP]`

- No `padding-bottom`/`margin-top` used to space siblings — use `gap` on the parent. `[DS-LAYOUT-COMP-001]`
- No wrapper divs that serve no layout purpose. `[DS-LAYOUT-COMP-002]`
- `min-width: 0` on flex children containing text or overflow-prone content. `[DS-LAYOUT-COMP-003]`
- Images with set dimensions need `object-fit`. `[DS-LAYOUT-COMP-006]`
- Use `aspect-ratio` instead of the padding-top percentage hack. `[DS-LAYOUT-COMP-005]`

## Form, Field, and Dialog Widths `[DS-LAYOUT-WIDTH]`

Widths come from tokens in `data/tokens.json` (`widths`). Never a raw value.

Form containers use `max-width: var(--width-form-max)`. `[DS-LAYOUT-WIDTH-001]`

Single-line fields use `max-width: var(--width-field-max)` by default. Short fixed-format values (postal code, state code, expiry, security code) use `var(--width-field-narrow)`. Only textareas may extend to `var(--width-form-max)`. `[DS-LAYOUT-WIDTH-002]`

Layouts hold at `var(--width-viewport-min)` with no horizontal scroll. `[DS-LAYOUT-WIDTH-003]`

Desktop dialogs use `max-width: var(--width-dialog-sm)` or `var(--width-dialog-lg)`. Which tier applies is decided in vois-patterns `[PATH-D-SIZE]`. `[DS-LAYOUT-WIDTH-004]`

## Auto-growing Text Fields `[DS-LAYOUT-FIELD]`

Text areas grow with what the user types. Use the CSS property, not JavaScript. `field-sizing: content` is Baseline newly available as of June 2026 (Chrome 123, Safari 26.2, Firefox 152), so browsers older than those still need the fallback.

Use `field-sizing: content` (Tailwind v4: `field-sizing-content`). No `scrollHeight` measuring, no `ResizeObserver`, no autosize libraries. `[DS-LAYOUT-FIELD-001]`

Always set an explicit `inline-size`. Content sizing also shrinks the width, and without one the field collapses to a sliver. `[DS-LAYOUT-FIELD-002]`

Set the minimum and maximum height in text lines with the `lh` unit, plus the field's block padding. Do not rely on the `rows` attribute for the minimum, because browsers ignore `rows` under `field-sizing: content`. At the maximum, the field scrolls inside itself. `[DS-LAYOUT-FIELD-003]`

Wrap the styles in `@supports`. Keep the `rows` attribute and `resize: vertical` as the fallback for browsers without support. `[DS-LAYOUT-FIELD-004]`

```css
/* Form textarea */
@supports (field-sizing: content) {
  .textarea-auto {
    --pad: calc(var(--spacing) * 2);          /* spacing step 2 */
    field-sizing: content;
    inline-size: 100%;
    max-inline-size: var(--width-form-max);
    padding-block: var(--pad);
    min-block-size: calc(var(--textarea-min-lines) * 1lh + var(--pad) * 2);
    max-block-size: calc(var(--textarea-max-lines) * 1lh + var(--pad) * 2);
    overflow-y: auto;
    resize: none;
  }
}

/* AI chat input: same pattern, one line to start, no width cap */
@supports (field-sizing: content) {
  .chat-auto {
    --pad: calc(var(--spacing) * 2);
    field-sizing: content;
    inline-size: 100%;
    padding-block: var(--pad);
    min-block-size: calc(var(--chat-input-min-lines) * 1lh + var(--pad) * 2);
    max-block-size: calc(var(--chat-input-max-lines) * 1lh + var(--pad) * 2);
    overflow-y: auto;
    resize: none;
  }
}
```

The line-count tokens are `--textarea-min-lines`, `--textarea-max-lines`, `--chat-input-min-lines`, and `--chat-input-max-lines`. The height math is exact when the field's outline is a shadow border (`[DS-SURFACE-007]`) or has no border. A real border adds its width to the height.

Where this applies: `[PATH-FIELD-TEXTAREA-AUTOSIZE]` and `[PATH-FIELD-CHAT-INPUT]` in vois-patterns.
