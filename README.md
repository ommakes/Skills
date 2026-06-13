# Skills
Claude skills for UX and product design workflows.

## Install
```bash
npx skills add ommakes/Skills
```

---

## Chain Orchestrator

### Vois Router
Single entry point for the Vois design system skill chain. Reads your input, classifies the work (FULL-CHAIN, PICK-UP, COMPONENT-ONLY, COPY-ONLY, RATIONALE-ONLY, or AUDIT), sequences the right skills in the right order, and carries context forward between them so each skill starts with what it needs. Supports gated (confirm-at-each-handoff) and fast (run-and-summarize) modes, inline righter invocation with batching, opt-in design-rationale at two points in the chain, session state for recovery, and gap surfacing.

**Use when:** starting any UI work against the Vois design system without knowing which skill to call first. Paste a ticket, brief, or question and the router handles the rest.

→ [`vois-router/`](./vois-router)

---

## Design System Skills (Read in Order)

These four skills work together as a stack. Read them in this order when building UI, or use **vois-router** above to run the chain automatically.

### Vois Patterns
Structural decision trees and UI patterns that tell agents *what to build* before implementing it. Covers container types (forms, tables, dialogs, settings pages), state management (view/edit), and routing to righter skill for all microcopy. 

**Read first** to determine the structure and architecture of what you're building.

**Use when:** building a new page, form, table, modal, or feature and need to decide on the container type and layout pattern before writing code.

→ [`vois-patterns/`](./vois-patterns)

---

### Vois Components
Component selection rubrics organized by job-to-be-done. Covers 20 high-ambiguity component pairs (Dialog vs Drawer, Toast vs Banner, Select vs Combobox, etc.) with decision trees and "why not X" reasoning.

**Read second** (after vois-patterns determines structure) to pick the right specific component for each job.

**Use when:** you need to decide between similar components — which one actually fits what you're building? Always call `record_component_choice` after selecting.

→ [`vois-components/`](./vois-components)

---

### Vois Design System
A skill for AI coding agents (Cursor, Claude Code, v0) that encodes design system rules — spacing, typography, color tokens, component patterns, animation, and accessibility — so agents produce consistent UI without guessing.

**Read third** (after patterns and components are locked in) to implement with the correct tokens, spacing, and styling rules.

**Use when:** building components or pages that should conform to a design system using shadcn/ui, Tailwind v4, and Motion.

→ [`vois-design-system/`](./vois-design-system)

---

### Righter
UX writing skill. Reviews existing UI copy or writes new copy from scratch applying a defined set of principles. Covers UI components, error messages, microcopy, and transactional product emails. Always calls `get_microcopy` MCP tool first to check workspace-specific overrides before writing.

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
3. vois-design-system
   ↓ (implements → tokens, spacing, accessibility)
4. righter (consulted throughout for all UI copy)
```

Read them in order. Each skill assumes you've read the previous one and points forward to the next.

- **Patterns** answers "what structure am I building?"
- **Components** answers "which component for this job?"
- **Design System** answers "how do I implement this correctly?"
- **Righter** answers "what words go here?" (consulted at every step)

---

## Quick Links

- **Contributing:** See CONTRIBUTING.md (in progress)
- **Issues & Feedback:** [GitHub Issues](https://github.com/ommakes/Skills/issues)
- **Vois platform:** [vois.app](https://vois.app)

---

**Maintained by:** Om Suthar  
**Last updated:** 2026-06-13
