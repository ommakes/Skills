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

- **Mobile-first.** No prefix = mobile baseline. `md:`, `lg:` are progressive enhancements. `[DS-RESPONSIVE-001]`
- Test at `sm` (640px), `md` (768px), `lg` (1024px) before considering a component done. `[DS-RESPONSIVE-002]`
- Use **container queries** for component-level responsiveness. Use **breakpoints** for layout-level responsiveness. `[DS-RESPONSIVE-003]`
- Touch targets, font sizes, and contrast ratios must meet minimums at every breakpoint. `[DS-RESPONSIVE-004]`
- Don't build desktop-first and assume it'll work on mobile. It won't. `[DS-RESPONSIVE-005]`

## Component-Level Layout Rules `[DS-LAYOUT-COMP]`

- No `padding-bottom`/`margin-top` used to space siblings — use `gap` on the parent. `[DS-LAYOUT-COMP-001]`
- No wrapper divs that serve no layout purpose. `[DS-LAYOUT-COMP-002]`
- `min-width: 0` on flex children containing text or overflow-prone content. `[DS-LAYOUT-COMP-003]`
- Don't set `width: 100%` on flex or grid children unless the parent isn't controlling sizing — it fights the layout algorithm and produces unexpected results. `[DS-LAYOUT-COMP-004]`
- Images with set dimensions need `object-fit`. `[DS-LAYOUT-COMP-006]`
- Use `aspect-ratio` instead of the padding-top percentage hack. `[DS-LAYOUT-COMP-005]`
