# Typography `[DS-TYPOGRAPHY]`

## Rules

- Use **no more than 3 text styles** in any single component or section. `[DS-TYPOGRAPHY-001]`
- Never skip heading levels. `h1` then `h2` then `h3`. Never `h1` directly to `h3`. `[DS-TYPOGRAPHY-002]`
- Use the **monospace variant** for all numeric data — prices, counts, measurements, timestamps. Add `font-variant-numeric: tabular-nums` when numbers appear in columns or need to align. `[DS-TYPOGRAPHY-003]`
- Font size communicates hierarchy. If two things feel equally important, one of them should be deprioritized. `[DS-TYPOGRAPHY-004]`

## Type Scale

| Level | Class | Size | Line Height | Weight | Use |
|-------|-------|------|-------------|--------|-----|
| Page Heading | H0 | 52px desktop / 40px mobile | 64px / 56px | bold | Page title. Once per screen only. |
| Section Heading | H1 | 36px desktop / 32px mobile | 44px / 40px | semibold | Page sections |
| Feature Heading | H2 | 24px | 32px | semibold | Named items, modal titles, core actions |
| Item Heading | H3 | 18px | 26px | semibold | Key data points, navigation labels |
| Body Heading | H4 | 16px | 24px | semibold | Highlighted inline text, button labels |
| Label Heading | H5 | 14px | 20px | medium | Input labels, short descriptions (max 2 lines) |
| Caption | H6 | 12px | 16px | medium | Fine print, secondary metadata |
| Body | Body | 16px | 24px | normal | Long-form content, input field content |
| Description | Description | 14px | 20px | normal | Short descriptions in toasts, alerts, dialogs, popovers |

## Fonts

Font choice is workspace-specific, defined via typography tokens. Check the token reference for the actual values before assuming a particular font applies.

| Role | Token |
|------|-------|
| Headings and display | `--font-heading` |
| Body and labels | `--font-body` |
| Numeric and monospace | `--font-mono` |

Always reference the token (`font-[var(--font-heading)]`) rather than a font name directly. If the workspace swaps the font, components update automatically without code changes. `[DS-TYPOGRAPHY-005]`

## Fluid Type

For headings that need to scale across viewport widths — hero headings, marketing copy, page titles — use `clamp()` instead of fixed sizes with breakpoint overrides:

```css
/* Scales smoothly from 1rem minimum to 2rem maximum */
font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
```

Use this for H0 and H1 in hero sections or anywhere text needs to adapt to screen size. Don't use it for body text in application UI — fixed sizes with responsive breakpoints are more predictable there.

## Text Wrapping

```css
/* Headings: prevents uneven line breaks and short last lines */
text-wrap: balance;

/* Body text in articles and long-form content: prevents orphaned single words */
text-wrap: pretty;
```

Apply `text-wrap: balance` to all headings (H0 through H3) by default. `[DS-TYPOGRAPHY-006]`
Apply `text-wrap: pretty` to body copy in articles, descriptions, and anywhere text wraps across multiple lines. `[DS-TYPOGRAPHY-007]`

## Readable Line Length

Cap text containers at `65ch`. The `ch` unit is relative to the current font's character width, so this stays readable at any font size: `[DS-TYPOGRAPHY-008]`

```css
.prose,
.description,
.body-text {
  max-width: 65ch;
}
```

Do not use `max-width: 600px` or similar fixed widths for text containers — they break at different font sizes.

## Copy and Punctuation

These details matter. Agents get them wrong by default.

- Use `…` (the ellipsis character), not `...` (three periods) `[DS-TYPOGRAPHY-009]`
- Use curly quotes `"` `"` not straight `"` `[DS-TYPOGRAPHY-010]`
- Use non-breaking spaces for units and brand names: `10&nbsp;MB`, `5&nbsp;GB`, `⌘&nbsp;K`
- Loading states end with ellipsis character: `"Loading…"` not `"Loading..."` `[DS-TYPOGRAPHY-011]`
- Active voice: "Save changes" not "Changes will be saved" `[DS-TYPOGRAPHY-012]`
- Specific button labels: "Delete project" not "Confirm" or "OK" `[DS-TYPOGRAPHY-013]`
- Error messages tell the user what to do next, not just what went wrong `[DS-TYPOGRAPHY-014]`
