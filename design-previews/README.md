# Vois design previews

A rendered, static HTML/CSS companion to the `vois-tokens`, `vois-components`, and `vois-patterns` skills — built for **Claude Design** (claude.ai/design), not for coding agents.

## Why this exists

The Vois skills in this repo (`SKILL.md` + `references/` + `data/`) are instructions an AI coding agent reads before writing UI code. They don't render anything themselves. Claude Design is a different consumer: a visual design-system browser that's populated by pushing real, rendered component previews via the `DesignSync` tool (paired with a `/design-sync` skill). This folder is that rendered artifact — 25 self-contained `.html` files demonstrating the foundations, the highest-confusion component pairs, and the page-level patterns the skills describe.

**This is not a skill.** It has no `SKILL.md`, isn't listed in `skills.json`, and isn't installed via `npx skills add`. It's a visual reference, kept in this repo because it's derived directly from the Vois skill content and versioned alongside it.

## What's sourced vs. invented

Every value in `_shared/tokens.css` is commented as either:
- **SOURCED** — quoted directly from a `vois-tokens` reference doc (spacing scale, type scale, elevation tiers, icon sizes, easing curves, durations, the one `--color-primary` pair, the `--radius-md` example)
- **INVENTED** — originated for this kit to fill a gap the skill hasn't defined yet (the rest of the OKLCH color palette, the rest of the radius scale)

Treat the invented values as illustrative placeholders, not canonical spec. If `vois-tokens` later ships a real palette or radius scale, update `tokens.css` to match rather than the other way around.

## Structure

```
_shared/tokens.css     design tokens as CSS custom properties (light + .dark)
_shared/base.css       reset + shared component primitives (button, input, dialog, etc.)
foundations/           color, typography, spacing, elevation, radius, iconography, motion
components/            10 highest-confusion component-pair comparisons, sourced from
                        vois-components/data/components-rules.json's "why not X" reasoning
patterns/               5 full-page layouts from vois-patterns' container types
anti-patterns/          3 DS-SLOP-* anti-tells from vois-tokens, wrong vs. right
index.html              local nav for browsing the kit in a browser (not synced)
scripts/validate-previews.sh   checks every preview's @dsCard marker + no external URLs
```

Every preview file:
- starts with a `<!-- @dsCard group="..." -->` comment as its literal first line, so Claude Design's pane can index it
- is self-contained aside from the two shared, local `_shared/*.css` files — no CDN scripts, no external fonts or images
- includes a light/dark toggle, since dark mode is a first-class rule in `vois-tokens`
- uses native HTML where it can (`<dialog>`, the Popover API, `:checked`/`:hover` CSS) instead of a framework, since these need to render in a sandboxed preview pane with no build step

## Syncing to a live Claude Design project

This kit is built and committed here, but pushing it into an actual `claude.ai/design` project is a separate, interactive step — it needs your live project choice and an approved write plan, so it isn't automated:

1. `DesignSync.list_projects` — see which design-system projects you can write to (or `create_project` if starting fresh)
2. `DesignSync.finalize_plan` — writes: `design-previews/**/*.html`, `design-previews/**/*.css` (skip `index.html`, it's dev-only)
3. `DesignSync.write_files` — push the approved plan

`register_assets` isn't needed — the pane builds its card index from each file's `@dsCard` marker automatically.
