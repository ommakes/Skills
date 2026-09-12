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
