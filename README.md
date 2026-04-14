# Skills

Claude skills for UX and product design workflows.

## Install

```bash
npx skills add ommakes/Skills
```

---

## Righter

A UX content writing skill that reviews and rewrites UI copy against a defined set of writing principles, error message guidelines, and component-specific rules. Outputs before/after comparisons with ARI reading level metrics.

**Use when:** reviewing button labels, error messages, empty states, onboarding copy, tooltips, or any in-product text.

→ [`righter/`](./righter)

---

## Vois Design System

A skill for AI coding agents (Cursor, Claude Code, v0) that encodes design system rules — spacing, typography, color tokens, component patterns, animation, and accessibility — so agents produce consistent UI without guessing.

**Use when:** building components or pages that should conform to a design system using shadcn/ui, Tailwind v4, and Motion.

→ [`Vois-Design-System/`](./Vois-Design-System)

---

## Metrics Tagging

Analyzes UI mockups or screenshots and generates a complete analytics event taxonomy table for handoff to a tag implementation team. Identifies cascading inputs, high-impact fields, and coverage gaps across screen states.

**Use when:** planning what to track in a flow, creating a tagging spec for handoff, or auditing a screen for analytics coverage.

→ [metrics-tagging/](metrics-tagging/)

---

## Design Ask

Unpacks poorly written Jira or Azure DevOps tickets into design-relevant framing. Identifies what design work is actually being asked for, flags when tickets prescribe a UI solution instead of describing a user need, and produces a ready-to-use list of questions to bring to the PM before starting.

**Use when:** a ticket is unclear, overly prescriptive, missing context, or you need to scope the design work before touching anything.

→ [`design-ask/`](./design-ask)

---

