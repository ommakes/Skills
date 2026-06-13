# vois-patterns

Structural decision trees and UI patterns for building consistent interfaces with Vois design tokens and components.

## What This Is

`vois-patterns` is a skill that tells you **which container type to build** and **how to structure it** before you implement it with tokens and components.

It's the architectural layer above `vois-design-system` (implementation) and `righter` (microcopy).

## When to Use This

Use `vois-patterns` when you're:
- Building a new page or feature
- Adding a form, table, modal, or dialog
- Designing a settings or details view
- Structuring multi-step workflows
- Figuring out how to handle form states (view/edit)
- Deciding between sidebar vs modal for details

Load it *before* reading `vois-design-system` or `righter`.

## Quick Start

1. **Identify what the user is doing**
   - Managing settings? → Settings Page Template
   - Viewing a list of items? → Table/List with Details Template
   - Creating or editing something? → Form Template
   - Quick confirmation or selection? → Dialog/Action Sheet Template
   - Viewing a single item? → Detail Page Template

2. **Read the template rules for that type**
   - Check macro decisions (depth, complexity, layout)
   - Check permissions/visibility rules
   - Check state rules (view/edit, loading, empty, etc.)

3. **Route to `righter` skill for all copy**
   - Every word in UI comes from righter
   - Button labels, error messages, field descriptions, status labels, etc.

4. **Read `vois-design-system` for implementation**
   - Apply tokens for spacing, typography, color
   - Use components from the design system
   - Handle animations and responsive behavior

## File Structure

```
vois-patterns/
├── README.md (this file)
├── SKILL.md (the full skill with all templates and decision trees)
└── CHANGELOG.md (versioning and updates)
```

## Templates Included

- **Settings Page** - For profile, workspace, billing, notifications, members pages
- **Table/List with Details** - For browsing, filtering, and acting on multiple items
- **Form (Create/Edit)** - For creating new items or editing existing ones
- **Dialog/Action Sheet** - For quick inputs, confirmations, selections
- **Detail Page** - For viewing single records in read-only mode

Each template includes:
- When to use it
- Macro decisions (how deep is this? how complex?)
- Structure rules (what goes where)
- State rules (view/edit/loading/empty)
- Mobile/breakpoint behavior
- Permissions and visibility rules
- Microcopy routing to `righter`

## Core Principles

1. **Decision trees come first, implementation comes second**
   - Determine structure with vois-patterns
   - Then implement with vois-design-system
   - Then get copy from righter

2. **Every word in UI is routed to righter**
   - No guessing at button labels
   - No "OK" or "Confirm" — use righter's language
   - Applies to: labels, errors, status, confirmations, tooltips, helpers, everything

3. **Permissions are explicit, not implicit**
   - Hide elements user can't see (role-based)
   - Disable (but show) elements user can't edit (condition-based)
   - Always show why something is disabled

4. **Forms have two states: VIEW and EDIT**
   - VIEW is the default (read-only, data visible)
   - EDIT is explicit (user clicks to edit)
   - Confirmation needed if user has unsaved data

5. **Structural decisions are version-controlled**
   - Rules improve over time based on usage data
   - Each version documents why it changed
   - Agents can load specific versions

## Relationship to Other Skills

### vois-patterns ↔ vois-design-system
- Read **vois-patterns** first → determines structure and layout
- Then read **vois-design-system** → implements with tokens, components, spacing
- Design-system: how to code it correctly
- vois-patterns: what to build

### vois-patterns ↔ righter
- Read **vois-patterns** → determines container type and structure
- Then read **righter** → determines exact wording for every UI element
- righter is the source of truth for all copy
- vois-patterns tells you *where* copy goes

### vois-patterns ↔ vois-router
- **vois-router** calls this skill as Step 1 of a FULL-CHAIN run, packaging the user task and constraints in the framing this skill expects
- Use vois-router as the entry point instead of loading this skill directly

### vois-patterns ↔ vois-loop
- **vois-loop** is the top-level iterative orchestrator that calls vois-router (and therefore this skill) inside a loop
- If a downstream conflict traces back to a structural decision made here, vois-loop will route back to this skill with new context
- The recommended entry point for feature builds starting from a ticket or brief

## How Patterns Improve

This skill is designed to improve through agentic use:

1. **Agent builds with pattern** → logs decision, any deviations
2. **QA validates against rules** → logs pass/fail
3. **Data feeds to PostHog** → weekly analysis
4. **Claude analyzes patterns** → suggests rule improvements
5. **Rules updated** → next agent build uses improved version

See `CHANGELOG.md` for update history and rationale.

## Examples

### Example 1: Simple Form (Create Invoice)
```
1. User is creating something → Form Template
2. Count fields: 6 (invoice number auto-filled, date, customer, amount, tax, notes)
3. Macro decision: Simple form (1-6 fields) → single column, no grouping
4. Route to righter: 
   - Label: "Customer" (righter)
   - Helper: "Select from your saved customers" (righter)
   - Button: "Create invoice" (righter)
5. Implement: vois-design-system spacing, tokens, components
```

### Example 2: Settings Page (Billing)
```
1. User is managing settings → Settings Page Template
2. Count sections: 5 (subscription, payment method, invoices, billing address, billing history)
3. Macro decision: Deep (4+ sections) → sidebar navigation
4. Permissions: Some fields hidden if user not billing admin
5. Route to righter: Section headers, button labels, all copy
6. Implement: vois-design-system for layout, tabs, spacing
```

### Example 3: Table with Inline Editing
```
1. User is browsing and filtering items → Table/List with Details Template
2. Macro decision: Quick edits needed → right sidebar (not modal)
3. Table structure: 25 per page, first column pinned, quick action buttons on hover
4. Sidebar form: 4 input fields (within sidebar limit)
5. Route to righter: Column headers, button labels, action menu items
6. Implement: vois-design-system for table density, spacing, component patterns
```

## Microcopy Routing Checklist

Before you build, make sure you route these to `righter`:

- [ ] Form labels ("Email address", "Company name")
- [ ] Helper text and placeholders
- [ ] Error messages and validation copy
- [ ] Button labels ("Save changes", "Delete invoice", "Next")
- [ ] Status labels and badges ("Pending", "Active", "Archived")
- [ ] Section headers and tab names
- [ ] Descriptions and explanations
- [ ] Confirmation dialog copy
- [ ] Toast/banner messages
- [ ] Empty states
- [ ] Tooltips and popovers
- [ ] Disabled state explanations
- [ ] Table column headers
- [ ] Filter/sort labels
- [ ] Breadcrumb labels
- [ ] Action menu items
- [ ] Quick action button tooltips

## Contributing & Improving Patterns

### Reporting a Pattern Issue

If you notice a rule that doesn't work or a pattern that's unclear:

1. **Document the scenario**
   - What were you building?
   - Which template/rule did you follow?
   - What went wrong or was unclear?

2. **Log the data**
   - Save your build logs
   - Note any QA failures related to this rule
   - Screenshot or link to the result

3. **Propose a fix**
   - What should the rule say instead?
   - Why would this work better?

4. **Submit** → Create an issue or discussion in the vois repo

### Suggesting a New Pattern

If you notice a recurring structure that's not covered:

1. **Document the pattern**
   - Give 2-3 examples where you've seen it
   - Describe the macro decision (what determines this pattern?)
   - Describe the structure (what goes where?)

2. **Propose the rules**
   - When to use it
   - How it differs from existing templates
   - State rules, permission rules, mobile behavior

3. **Submit** → Create an issue or discussion in the vois repo

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | Initial release with 5 core templates |
| (future) | TBD | Improvements based on usage data |

See `CHANGELOG.md` for detailed rationale on each update.

## Skills This Integrates With

- **righter** — UX content writing principles for all UI copy
- **vois-design-system** — Implementation details (tokens, spacing, components)
- **PostHog** — Analytics on pattern usage and effectiveness
- **Claude Code** — Primary consumer of these patterns

## FAQ

### Q: Do I have to follow every rule exactly?
A: No, but deviations should be intentional. If a rule doesn't work for your case, document the deviation and why. That data helps improve the rules.

### Q: What if a pattern doesn't fit my use case?
A: That's valuable feedback. Document it and propose a new pattern or rule modification. If 2-3 use cases fit better than existing rules, we should update them.

### Q: How do I know which template to use?
A: Start with the decision tree at the top of SKILL.md. Ask "What is the user doing?" and follow the path. If you're still unsure, that means the decision tree needs to be clearer—file an issue.

### Q: When should I deviate from these patterns?
A: Rarely. The patterns are designed to handle 95% of cases. Deviations should be:
- Intentional and documented
- Supported by research or user feedback
- Not contradicting a core principle
- Worth a rule improvement or new pattern

### Q: How do these relate to design tokens?
A: Patterns tell you *when and where* to use tokens. Design tokens tell you *how much* spacing, *which* color, *what* size. They're complementary.

Example:
- vois-patterns: "Primary button on right, secondary on left, 20px between them"
- vois-design-system: "Use spacing-xs (20px) token, color-interactive-primary for button, typography-button-small for label"

## Contact & Questions

If you have questions about a pattern or need clarification:
- Check the SKILL.md file for detailed explanations
- Look at the examples section above
- File an issue in the vois repo with your use case

---

**Last updated:** 2026-05-12  
**Skill version:** 1.0.0  
**Status:** Active and improving through agentic feedback loops
