# Vois Tokens Skill

**Version 1.10.0** · For use with Claude Code, Claude.ai, and any Claude-powered agentic coding tool. Works standalone — no MCP server or orchestrator required.

A Claude skill that enforces consistent, production-quality UI output when building with **shadcn/ui**, **Tailwind v4**, and **Motion**. Drop it into your Claude skill directory and every code generation session follows the same spacing scale, token system, component patterns, accessibility requirements, and layout rules — without having to re-explain them each time.

A deterministic detector (`scripts/detect.mjs`) mechanically checks the subset of the Pre-Submit Checklist that doesn't require visual judgment, and can run as a per-edit hook in Claude Code, Cursor, or Codex. See [`references/hooks.md`](./references/hooks.md) for setup.

---

## What it covers

| Section | What it enforces |
|---------|-----------------|
| **Spacing** | 4/8 grid, `gap`-first layout, no sibling padding hacks, `min-width: 0` on flex children |
| **Typography** | Type scale, fluid type with `clamp()`, `text-wrap`, readable line length, punctuation rules |
| **Color** | OKLCH tokens, dark mode with `light-dark()`, 60/30/10 distribution, no hardcoded hex |
| **Components** | shadcn/ui New-York style, CVA for variants, `data-slot` for internals, modal patterns |
| **Layout** | `svh`/`lvh`/`dvh` viewport units, `content-visibility`, `aspect-ratio`, `object-fit` |
| **Tailwind v4** | `@theme` over `@layer base`, `@import`, container queries, no `transition: all` |
| **Animation** | Timing, easing curves, `prefers-reduced-motion`, `transform-origin`, no `scale(0)` |
| **Accessibility** | WCAG AA contrast, focus states, touch targets, semantic HTML, ARIA, `<fieldset>`, `<time>` |
| **Responsive** | Mobile-first, container queries vs. breakpoints, `em`-based media queries |
| **CSS Architecture** | `@layer` structure, no ID selectors, `:is()`/`:where()`, specificity hygiene |

---

## Installation

Copy `SKILL.md` into your Claude skill directory. The exact path depends on your setup:

- **Claude Code:** `~/.claude/skills/vois-tokens/SKILL.md`
- **Custom path:** wherever your `CLAUDE.md` or system prompt references skills from

The skill fires automatically based on its description when you're building UI components, pages, or anything that should conform to this design system.

---

## How it works

Every rule has a unique ID like `[DS-SPACING-001]` or `[DS-A11Y-005]`. If a `vois_record_rule_usage` tool is available in your environment, Claude calls it after completing any UI task with the IDs of the rules it applied — this creates a feedback loop for tracking which rules fire frequently, which get violated, and which need clarification. If the tool isn't available, this step is optional and the skill's rules still apply in full.

---

## Rule ID reference

| Prefix | Section |
|--------|---------|
| `DS-SPACING` | Spacing scale and layout composition |
| `DS-LAYOUT-COMP` | Flex/grid structure, sibling spacing, `aspect-ratio`, `object-fit` |
| `DS-TYPOGRAPHY` | Type scale, fonts, text wrapping, copy rules |
| `DS-COLOR` | Tokens, OKLCH, dark mode, contrast |
| `DS-COMPONENT` | shadcn/ui components, CVA, variants |
| `DS-MODAL` | Modal focus trapping, scroll bleed, layout shift |
| `DS-LAYOUT` | Viewport units, `content-visibility` |
| `DS-TAILWIND` | Tailwind v4 migration patterns, utility rules |
| `DS-ANIMATION` | Timing, easing, reduced motion, scale/origin |
| `DS-A11Y` | Accessibility — touch targets, focus, contrast, semantic HTML |
| `DS-RESPONSIVE` | Mobile-first, breakpoints, container queries |
| `DS-CSS` | Architecture, specificity, selectors, media queries |

---

## Files

```
vois-tokens/
├── SKILL.md         ← the skill entry point
├── README.md        ← this file
├── CHANGELOG.md     ← version history
├── references/      ← per-topic rule files (spacing, color, components, hooks, etc.)
└── scripts/         ← detect.mjs detector + hook.mjs/hook-before-edit.mjs/hook-admin.mjs
```

---

## Version history

See [CHANGELOG.md](./CHANGELOG.md) for full details.

- **1.10.0** — Two new `references/anti-slop.md` rules: `DS-SLOP-010` (card-ifying every static section; drop shadows reserved for interactive elements) and `DS-SLOP-011` (left-border + corner-radius combo on active nav/sidebar items; prefer a subtle color shift).
- **1.9.1** — Removed a dangling cross-reference in `references/iconography.md` (`DS-ICON-002` cited a nonexistent `DS-CSS-008`).
- **1.9.0** — `data/vois-rules.json` (structured lookup for all 102 numbered `DS-*` rules) and `data/tokens.json` (actual token values), for lookup without reading full reference files.
- **1.8.0** — MCP telemetry (`vois_record_rule_usage`) is now optional; the no-silent-changes contract's redesign classification is self-contained instead of pointing to `vois-router`. Works fully standalone.
- **1.7.0** — `references/anti-slop.md` DS-SLOP-* rule family, taste-dial consumption, no-silent-changes contract.
- **1.6.0** — Deterministic `scripts/detect.mjs` detector for the mechanically-checkable subset of the Pre-Submit Checklist, plus a per-edit hook (Claude Code, Cursor, Codex) and `hook-admin.mjs` CLI. New `references/hooks.md`.
- **1.5.0** — Elevation and iconography reference files; decision frameworks for previously behavior-only rules
- **1.4.0** — Renamed from `vois-design-system` to `vois-tokens`
- **1.3.0** — Split `SKILL.md` into a slim entry point plus per-topic `references/` files
- **1.2.0** — Layout composition rules, expanded semantic HTML, CSS specificity and media query guidelines, rule IDs on all checklist items
- **1.1.0** — Initial tracked release

---

## License

Part of the [Personify Labs Skills repository](https://github.com/ommakes/Skills). See root LICENSE for terms.
Always reference the token in components, not the font name directly:

```css
/* Do this */
font-family: var(--font-heading);

/* Not this */
font-family: "Some Font Name";
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

## Relationship to Other Skills

| Skill | Role |
|---|---|
| **vois-components** | Read before this skill. Selects the specific components this skill implements with tokens and spacing. |
| **vois-patterns** | Read before vois-components. Determines the container type and structural path. |
| **righter** | Invoked inline during implementation — not after. All UI copy (labels, errors, helper text, empty states) is written by righter as components are built. |

---

## Contributing

Found a rule that's missing or wrong? Open an issue or PR at [github.com/ommakes/Skills](https://github.com/ommakes/Skills).

---

## License

MIT — see `LICENSE` for details.
