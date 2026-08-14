# Figma Community Editions

Flattened, single-file `.md` builds of select skills for upload to Figma's custom skills feature (single-file only — no `scripts/`, `references/`, `assets/`, or `data/` folders).

**GitHub stays the source of truth.** These are build outputs. If the source skill changes, regenerate the file here — don't hand-edit it separately.

**Design Rationale is out of scope** — it depends on `data/principles.json` and doesn't fit Figma's single-file format without permanent, un-synced curation.

## Community listing taglines

Frontmatter `description` fields are written to trigger correctly for an agent. These taglines are for the Figma Community listing itself — what a person scrolling Community actually reads before installing.

**GTM Positioning**
> Position your product, choose a GTM strategy, and write website copy that converts — based on Anthony Pierri's Fletch framework.

**Design Ask**
> A skill for designers who are tired of spending half a sprint figuring out what a ticket is actually asking for.
(Pulled from `design-ask/README.md` — reads better than the frontmatter description.)

**Metrics Tagging**
> Turn any screen or mockup into a ready-to-build analytics tagging plan — event names, IDs, and the business KPI each one maps to.

## Source files

| Flattened file | Source | Lines | Dependencies found |
|---|---|---|---|
| `gtm-positioning.md` | `gtm-positioning/SKILL.md` | 220 (source) | None |
| `design-ask.md` | `design-ask/SKILL.md` | 155 (source) | None (`README.md` alongside it is human-facing only, not uploaded) |
| `metrics-tagging.md` | `metrics-tagging/SKILL.md` | 209 (source) | None (`README` alongside it is human-facing only, not uploaded) |

All three were self-contained with zero `scripts/`, `references/`, `data/`, or environment-specific MCP tool calls, so each was a direct port — no content cuts needed.

## Validation checklist (per file)

- [x] Under ~500 lines
- [x] No references to `references/`, `data/`, or `scripts/` paths anywhere in the body
- [x] No MCP tool calls that a random Figma user won't have
- [x] Frontmatter description kept (agent-trigger language); human tagline drafted above for the Community listing
- [x] One line near the top pointing back to the GitHub repo for the full version
