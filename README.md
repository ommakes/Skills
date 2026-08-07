# Skills
Claude skills for UX and product design workflows.

## Install
```bash
npx skills add ommakes/Skills
```

---

## Design System Skills (Read in Order)

These four skills work together as a stack, and each one works standalone — no orchestrator or MCP server required. Read them in this order when building UI: vois-patterns → vois-components → vois-tokens, with righter consulted throughout for copy. Any telemetry tool call a skill mentions (`vois_record_pattern_choice`, `vois_record_component_choice`, `vois_record_rule_usage`, `vois_get_microcopy`) is optional — if the tool isn't available in your environment, the skill degrades gracefully and the instruction is simply skipped.

### Vois Patterns
Structural decision trees and UI patterns that tell agents *what to build* before implementing it. Covers container types (forms, tables, dialogs, settings pages), state management (view/edit), and routing to righter skill for all microcopy. 

**Read first** to determine the structure and architecture of what you're building.

**Use when:** building a new page, form, table, modal, or feature and need to decide on the container type and layout pattern before writing code.

Ships as `SKILL.md` plus a `references/` folder split by pattern (detail pages, forms, dialogs, settings pages, etc.) — `SKILL.md` is the decision tree and index, references hold the full path detail.

→ [`vois-patterns/`](./vois-patterns)

---

### Vois Components
Component selection rubrics organized by job-to-be-done. Covers 20 high-ambiguity component pairs (Dialog vs Drawer, Toast vs Banner, Select vs Combobox, etc.) with decision trees and "why not X" reasoning.

**Read second** (after vois-patterns determines structure) to pick the right specific component for each job.

**Use when:** you need to decide between similar components — which one actually fits what you're building? Optionally calls `vois_record_component_choice` after selecting, if that tool is available.

Ships as `SKILL.md` plus a `references/` folder grouped by job (forms, navigation, display, selection, overlays, feedback) — `SKILL.md` holds the quick-reference table and job index, references hold the full decision trees.

→ [`vois-components/`](./vois-components)

---

### Vois Tokens
A skill for AI coding agents (Cursor, Claude Code, v0) that encodes design system rules — spacing, typography, color tokens, component patterns, animation, and accessibility — so agents produce consistent UI without guessing.

**Read third** (after patterns and components are locked in) to implement with the correct tokens, spacing, and styling rules.

**Use when:** building components or pages that should conform to a design system using shadcn/ui, Tailwind v4, and Motion.

Tunes within the design system's guardrails using taste dials (VARIANCE/MOTION/DENSITY, 1–10, defaulting to 5/4/5 if none are supplied) — dials adjust degree, never override safety, accessibility, or hard token rules. Flags DS-SLOP-* anti-tells (centered-hero, AI-gradient backgrounds, uniform three-card grids, eyebrow overuse, zigzag sections, spec-sheet tables) as advisory warnings, and enforces the redesign no-silent-changes contract when working on existing UI.

Ships as `SKILL.md` plus a `references/` folder split by topic (spacing, color, typography, components, accessibility, animation, CSS architecture, anti-slop, etc.) — read only the reference file(s) relevant to what you're building instead of the whole skill. Also ships a zero-dependency `scripts/` detector that mechanically checks the regex-verifiable subset of the rules (including DS-SLOP-002) and can run as a per-edit hook in Claude Code, Cursor, or Codex — complementary to, not a replacement for, the GitHub-integrated token-drift app.

→ [`vois-tokens/`](./vois-tokens)

---

### Righter
UX writing skill. Reviews existing UI copy or writes new copy from scratch applying a defined set of principles. Covers UI components, error messages, microcopy, and transactional product emails. If a `vois_get_microcopy` MCP tool is available, calls it first to check workspace-specific overrides before writing — otherwise applies the skill's principles directly.

Every principle and error-message rule carries a stable `id` for cross-referencing from other skills. Ships with `scripts/ari.mjs` (deterministic ARI/reading-level scoring, in place of computing the formula by hand) and `evals/cases.json` (a fixed regression corpus for checking that edits to principles or data files don't silently change what the skill flags). See [`righter/CHANGELOG.md`](./righter/CHANGELOG.md) for version history.

**Read throughout.** Vois Patterns and Vois Components route to this skill for all copy — button labels, error messages, field descriptions, helper text, status labels, empty states, toasts, confirmations.

**Use when:** writing, reviewing, or improving any UI copy, error messages, button labels, tooltips, empty states, onboarding copy, form text, or product emails.

→ [`righter/`](./righter)

---

## Auxiliary Skills

### Metrics Tagging
Analyzes UI mockups or screenshots and generates a complete analytics event taxonomy table for handoff to a tag implementation team. Identifies cascading inputs, high-impact fields, and coverage gaps across screen states.

**Use when:** planning what to track in a flow, creating a tagging spec for handoff, or auditing a screen for analytics coverage.

→ [`metrics-tagging/`](./metrics-tagging/)

---

### Design Ask
Unpacks poorly written Jira or Azure DevOps tickets into design-relevant framing. Identifies what design work is actually being asked for, flags when tickets prescribe a UI solution instead of describing a user need, and produces a ready-to-use list of questions to bring to the PM before starting.

**Use when:** a ticket is unclear, overly prescriptive, missing context, or you need to scope the design work before touching anything.

→ [`design-ask/`](./design-ask)

---

### Designer IC Assessment
Runs a structured behavioral interview to assess an IC designer across five categories and 19 competency areas, including AI fluency. Produces a competency-by-competency narrative, a scores-at-a-glance table, and a CSV export for Notion / FigJam handoff. Supports both designer self-assessment and manager assessment as independent sessions.

**Use when:** running a designer self-assessment, a manager assessment, or preparing for an IC level calibration conversation.

→ [`designer-ic-assessment/`](./designer-ic-assessment)

---

### GTM Positioning
Framework for B2B product positioning, GTM strategy selection, and website messaging. Covers three positioning strategies (mature category, emerging category, new category), five GTM types (Vertical through Platform), page-by-page website messaging guide, persona-based messaging matrix, marketing assets by awareness stage, and value prop variations by awareness stage. Based on the Fletch framework by Anthony Pierri.

**Use when:** positioning a product, choosing a GTM motion, writing homepage or website copy, crafting messaging for different buyer personas, planning content by awareness stage, or writing ads and landing page copy.

→ [`gtm-positioning/`](./gtm-positioning)

---

### Changelog Writer
Writes external-facing changelog and release note entries in a pithy, tastefully sassy, occasionally clever voice that makes software updates fun to read without burying what actually shipped. Modeled on what Slack, Basecamp, Linear, Raycast, and Tumblr do well. Ships with `check-all.mjs` and friends — scripts that check every draft for structure, sass budget, voice, length, and cadence before it's published.

**This skill is for external/end-user changelogs** — if the audience is internal engineering or the changelog needs to double as a searchable technical record, skip this skill and use a precise, Stripe-style format instead.

**Use when:** writing, drafting, or reviewing a changelog entry, release notes, "what's new" post, or product update announcement for end users, or turning a raw list of shipped features/fixes into public-facing copy.

→ [`changelog-writer/`](./changelog-writer)

---

### Design Rationale
Help designers articulate their design decisions using cognitive science, behavioral psychology, and platform standards as the language — not intuition or preference. Includes a comprehensive library of 28+ named principles across three tiers (cognitive/behavioral laws, platform standards, applied patterns) and 15+ real-world product precedents organized by moment type (onboarding, navigation, conversion, errors, empty states, offboarding).

**Use when:** explaining a design decision in a critique or design review, preparing to defend a design choice against pushback, auditing a screen for principle alignment, or evaluating whether a decision is truly irreversible.

→ [`design-rationale/`](./design-rationale)

---

## The Design System Stack

The four design system skills form a complete pipeline:

```
1. vois-patterns
   ↓ (structures → container types)
2. vois-components
   ↓ (selects → specific components for each job)
3. vois-tokens
   ↓ (implements → tokens, spacing, accessibility)
4. righter (consulted throughout for all UI copy)
```

Read them in order. Each skill assumes you've read the previous one and points forward to the next. No orchestrator or MCP server is required — each skill works standalone.

- **Patterns** answers "what structure am I building?"
- **Components** answers "which component for this job?"
- **Tokens** answers "how do I implement this correctly?"
- **Righter** answers "what words go here?" (consulted at every step)

---

## Design Previews (for Claude Design)

[`design-previews/`](./design-previews) is a rendered, static HTML/CSS companion to the four design system skills — 25 self-contained preview files (foundations, highest-confusion component pairs, page-level patterns, and anti-pattern demonstrations) built for **Claude Design** (claude.ai/design), a visual design-system browser, not a coding agent.

**This is not a skill.** It has no `SKILL.md` and isn't listed in `skills.json` or installed via `npx skills add` — it's a rendered artifact derived from the skill content above, kept in this repo because it's versioned alongside it. See [`design-previews/README.md`](./design-previews/README.md) for what's sourced directly from the skills vs. invented to fill a documented gap, and how to sync it into a live Claude Design project.

---

## Quick Links

- **Contributing:** See CONTRIBUTING.md (in progress)
- **Issues & Feedback:** [GitHub Issues](https://github.com/ommakes/Skills/issues)
- **Vois platform:** [vois.app](https://vois.app)

---

**Maintained by:** Om Suthar  
**Last updated:** 2026-08-07
