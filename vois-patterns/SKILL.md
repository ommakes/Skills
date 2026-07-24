---
name: vois-patterns
description: Structural decision trees for container types, form states, table layouts, and page-level patterns. Use before vois-tokens. Routes to righter skill for all microcopy (labels, errors, buttons, helpers). Use when building pages, forms, features, workflows.
version: 1.5.1
---

# Vois Patterns Skill

You are building the *structure* of pages and containers for a design system. This skill defines the architectural decisions that come *before* implementation (tokens, components, styling).

**Read this skill first.** After you determine structure here, read `vois-tokens` for implementation details (spacing, typography, components, tokens).

This skill routes to `righter` skill for all microcopy (button labels, error messages, field descriptions, helper text). Don't guess at words—follow the righter skill.

---

## Before You Write Anything

1. **What is the user trying to accomplish?** (Dashboard overview? Edit a record? Confirm an action?)
2. **Pick the container type** from the decision tree below.
3. **Read the matching reference file** for full template rules.
4. **If a `vois_record_pattern_choice` tool is available in your environment**, call it once you have picked a path, before writing any code. If it isn't available, this step is optional telemetry, not a gate — proceed to the next step.

   ```
   Tool: vois_record_pattern_choice
   Arguments:
     skillVersion: <this skill's version, from SKILL.md frontmatter>
     pathId: <one of the path IDs listed in the decision tree below, e.g. "PATH-A" or "PATH-C-MEDIUM">
     userGoal: <plain-English description of the user goal this path addresses>
     thresholdInputs: <key decision inputs used to walk the tree, e.g. { "sectionCount": 3, "reversible": false }>
     microcopyUsed: <optional array of contextKeys for any righter microcopy consulted while applying this pattern>
   ```

   There is no `confidence` argument on the real tool — decide fit using the thresholds in the decision tree itself. If no path fits well and a `vois_report_pattern_gap` tool is available, call it instead of forcing a match:

   ```
   Tool: vois_report_pattern_gap
   Arguments:
     skillVersion: <this skill's version, from SKILL.md frontmatter>
     userGoal: <plain-English description of the goal that didn't fit>
     attemptedFallback: <closest path ID used as a fallback, even though it doesn't fit>
     reasoning: <why the available decision tree didn't fit this goal>
   ```

   If neither tool is available, just proceed with your best-fit path and note the low confidence in your own output.

5. **For every word that appears in UI**, check `righter` skill. See `references/microcopy-routing.md` for the full list of what counts as copy.
6. Then read `vois-tokens` for implementation (tokens, spacing, components).

---

## Decision Tree: What Container Type Should I Build?

```
START: What is the user trying to accomplish?

├─ PATH A: Manage settings or account preferences
│  └─ → read references/settings-pages.md
│     ├─ IF: 2–3 sections only      → [PATH-A-DEPTH-SHALLOW]
│     └─ IF: 4+ sections            → [PATH-A-DEPTH-DEEP]
│
├─ PATH B: View, filter, and act on a list of items
│  └─ → read references/table-list.md                       [PATH-B]
│
├─ PATH C: Create a new item OR edit an existing item
│  └─ → read references/forms.md
│     ├─ IF: 1–6 fields             → [PATH-C-SIMPLE]
│     ├─ IF: 7–15 fields            → [PATH-C-MEDIUM]
│     └─ IF: 15+ fields / complex   → [PATH-C-COMPLEX]
│
├─ PATH D: Quick input, confirmation, or selection
│  └─ → read references/dialogs-and-action-sheets.md         [PATH-D]
│
└─ PATH E: View details of a single item (read-only or view state)
   └─ → read references/detail-pages.md                      [PATH-E]
```

Read only the one reference file that matches the path you picked. Each template file is self-contained.

**Structured lookup:** `data/patterns-rules.json` holds every tagged `[PATH-X]`/`[PATH-X-Y]` node from the tree above as `{ id, condition, outcome, source_file }` — useful for a quick condition/outcome check by `pathId` without reading a whole file. It doesn't replace the reference files: worked examples, righter-routing call-outs, and untagged conditional branches (e.g. table-list.md's sidebar-vs-modal choice) only exist in the `.md` files.

---

## Reference Files

| File | Covers | Path ID(s) |
|---|---|---|
| `references/settings-pages.md` | Profile, workspace, billing, notifications, members sections; view/edit state | `[PATH-A]` |
| `references/table-list.md` | Browse/filter/act on lists, sidebar vs modal detail view, pagination | `[PATH-B]` |
| `references/forms.md` | Create/edit forms by complexity tier, validation, save behavior | `[PATH-C]` |
| `references/dialogs-and-action-sheets.md` | Modal vs action sheet by breakpoint, confirmation/selection dialogs | `[PATH-D]` |
| `references/detail-pages.md` | Read-only single-record views | `[PATH-E]` |
| `references/permissions-and-conditional-logic.md` | Hide vs disable by role, parent/child input dependencies, accordions | — (cross-cutting) |
| `references/microcopy-routing.md` | Full list of what counts as UI copy and must route to righter | — (cross-cutting) |

---

# Spacing Rules (Quick Reference)

These are implemented via vois-tokens; listed here for context.

- 24px vertical: heading ↔ body text
- 24px horizontal: between two input fields
- 40px vertical: body content ↔ primary action button
- 20px horizontal: between primary/secondary buttons (bottom right anchored)
- Use gap tokens on container div instead of margin-bottom on elements

For exact Tailwind class names and token values, see vois-tokens.

---

# Quick Checklist Before Implementation

- [ ] Container type selected (settings / table / form / dialog / detail)
- [ ] `vois_record_pattern_choice` called with `skillVersion`, `pathId`, `userGoal`, and `thresholdInputs`, if that tool is available
- [ ] Page structure sketched (what sections, what's visible, what's hidden by role)
- [ ] Permissions applied (hide/disable rules — see `references/permissions-and-conditional-logic.md`)
- [ ] All copy routed to righter skill and reviewed
- [ ] Ready to read vois-tokens for tokens, spacing, components
- [ ] Mobile breakpoint behavior defined (action sheets vs dialogs, sidebar vs hamburger, etc.)

---

# Relationship to Other Skills

**This skill ↔ vois-tokens:**

- Read this first (what to build)
- Then read vois-tokens (how to code it correctly)
- vois-tokens handles tokens, spacing, components, animation, accessibility
- This skill handles structural decisions and microcopy routing

**This skill ↔ vois-components:**

- After picking a container type here, read vois-components to select specific components
- vois-components resolves ambiguous pairs — Dialog vs Drawer, Toast vs Banner, Select vs Combobox
- If a `vois_record_component_choice` tool is available, call it after selecting; if not, this step is optional telemetry

**This skill ↔ righter skill:**

- Every word in UI comes from righter
- This skill tells you which container type
- Righter skill tells you what words go in that container
- Always check righter for: button labels, error messages, field descriptions, status copy, confirmations
