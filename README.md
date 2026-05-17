# Skills

Claude skills for UX and product design workflows.

## Install

```bash
npx skills add ommakes/Skills
```

---

## Righter

UX writing skill. Reviews existing UI copy or writes new copy from scratch applying a defined set of principles. Covers UI components, error messages, microcopy, and transactional product emails.

**Use when:** any request to write, review, or improve UI copy, error messages, button labels, tooltips, empty states, onboarding copy, form text, or product emails.

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

## Designer IC Assessment

Runs a structured behavioral interview to assess an IC designer across five categories and 19 competency areas, including AI fluency. Produces a competency-by-competency narrative, a scores-at-a-glance table, and a CSV export for Notion / FigJam handoff. Supports both designer self-assessment and manager assessment as independent sessions.

**Use when:** running a designer self-assessment, a manager assessment, or preparing for an IC level calibration conversation.

→ [`designer-ic-assessment/`](./designer-ic-assessment)

---

## Vois Patterns

Structural decision trees and UI patterns that tell agents *what to build* before implementing it. Covers container types (forms, tables, dialogs, settings pages), state management (view/edit), and routing to righter skill for all microcopy. Read before vois-design-system.

**Use when:** building a new page, form, table, modal, or feature. Need to determine structure and container type before implementing.

→ [`Vois-Patterns/`](./Vois-Patterns)

---
