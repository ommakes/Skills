# Vois Design System Skill

A structured skill file for AI coding agents (Cursor, Claude Code, v0) that teaches them your design system rules — spacing, typography, color tokens, component patterns, animation, and accessibility — so they produce consistent UI without guessing.

---

## What this is

`SKILL.md` is a plain markdown file that AI coding tools read as project-level context. When an agent builds UI with this skill loaded, it knows:

- Your spacing scale and grid system
- Your typography hierarchy and font tokens
- How to use CSS variables instead of hardcoded values
- Which components exist and when to use them
- Correct animation timing and easing
- Accessibility requirements
- Modern CSS patterns (`svh`/`dvh`, `light-dark()`, `interpolate-size`, etc.)

It's the difference between an agent that invents values and one that follows your system.

---

## Installation

### Option 1: Live URL (recommended)

If you use Vois, reference your workspace's live skill URL directly in your project rules. The skill stays current with your tokens automatically — font changes, new tokens, and updated annotations reflect immediately.

Add to `.cursorrules` in your project root:

```
Use the design system skill at https://vois.design/api/skill/[your-workspace-id]
before writing any UI code.
```

### Option 2: Static file

Download `SKILL.md` and add it to your project:

```
your-project/
  skills/
    vois-design-system/
      SKILL.md
```

Then reference it in `.cursorrules`:

```
Use the design system skill at skills/vois-design-system/SKILL.md
before writing any UI code.
```

**Note:** The static file is a snapshot. It won't update when your tokens change. Use the live URL if you want your skill to stay in sync with your Vois workspace.

---

## Customizing the skill

### Fonts

The skill ships with default fonts (Host Grotesk, Inter Tight, Geist Mono). To use your own:

1. Open `SKILL.md`
2. Find the **Fonts** section under Typography
3. Update the font names in the table
4. Make sure your `@theme` block defines the corresponding tokens:

```css
@theme {
  --font-heading: "Your Heading Font", sans-serif;
  --font-body: "Your Body Font", sans-serif;
  --font-mono: "Your Mono Font", monospace;
}
```

Always reference the token in components, not the font name directly:

```css
/* Do this */
font-family: var(--font-heading);

/* Not this */
font-family: "Host Grotesk";
```

### Tokens

The base skill contains universal rules. To add your workspace's actual token values, either:

- Use the live Vois skill URL (tokens are included automatically), or
- Add a token reference table after section 3 (Color) in the static file

### Spacing scale

If your project uses a different spacing scale, update section 1. The 4/8pt grid rule is a strong default but the specific allowed values can be adjusted.

---

## Stack

This skill is written for:

- **shadcn/ui** (New-York style)
- **Tailwind v4** (`@theme` directive, OKLCH colors, built-in container queries)
- **Motion** (formerly Framer Motion) for React animations
- **Radix UI** primitives for component structure

If your stack differs, some sections may not apply directly.

---

## What's in the skill

| Section | What it covers |
|---------|---------------|
| 1. Spacing | 4/8pt grid, allowed values, gap vs margin |
| 2. Typography | Type scale, fluid type, text wrapping, readable line length, copy rules |
| 3. Color | Token usage, OKLCH, dark mode, `light-dark()` function |
| 4. Components | cva patterns, modal patterns, accordion animation |
| 5. Layout | `svh`/`lvh`/`dvh` viewport units, `content-visibility` |
| 6. Tailwind v4 | `@theme` directive, key v4 changes, rules |
| 7. Animation | Timing, easing curves, reduced motion, scale/origin rules |
| 8. Accessibility | Touch targets, focus states, contrast, semantic HTML |
| 9. Responsive | Mobile-first, container queries vs breakpoints |
| 10. CSS Architecture | Import order, token structure, dark mode setup |
| 11. Pre-submit checklist | Agent-friendly checklist before marking work done |

---

## Contributing

Found a rule that's missing or wrong? Open an issue or PR at [github.com/ommakes/Skills](https://github.com/ommakes/Skills).

---

## License

MIT — see `LICENSE` for details.
