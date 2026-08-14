---
name: vois-patterns
description: Structural decision trees for container types, form states, table layouts, and page-level patterns. Use before vois-tokens. Use when building pages, forms, features, workflows.
version: 1.6.0
---

# Vois Patterns Skill

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-patterns/SKILL.md

You are building the *structure* of pages and containers for a design system. This skill defines the architectural decisions that come *before* implementation (tokens, components, styling).

**Read this skill first.** After you determine structure here, use `vois-components` to pick specific components, then `vois-tokens` for implementation details (spacing, typography, animation, accessibility).

## Microcopy: route to Righter, with a fallback

Every piece of UI text — labels, helper text, error messages, button labels, status badges, section headers, toast copy, tooltips, breadcrumbs — should be written using the **Righter skill** if it's available in your environment. Don't guess at words; get the exact copy from Righter.

**If Righter isn't available**, apply these fallback conventions directly instead of guessing: active voice, no jargon, sentence case, shortest phrasing that's still clear, no unnecessary punctuation, specific action words instead of generic ones ("Delete invoice" not "Confirm", "Save changes" not "OK"). Note in your output that Righter wasn't available and these fallback conventions were used instead.

---

## Before You Write Anything

1. **What is the user trying to accomplish?** (Dashboard overview? Edit a record? Confirm an action?)
2. **Pick the container type** from the decision tree below.
3. **Read the matching Container Type Details section** for full template rules.
4. **Write all UI copy with Righter** (or the fallback conventions above).
5. Then apply `vois-components` and `vois-tokens` for implementation.

---

## Decision Tree: What Container Type Should I Build?

```
START: What is the user trying to accomplish?

├─ PATH A: Manage settings or account preferences
│  ├─ IF: 2–3 sections only      → [PATH-A-DEPTH-SHALLOW]
│  └─ IF: 4+ sections            → [PATH-A-DEPTH-DEEP]
│
├─ PATH B: View, filter, and act on a list of items      [PATH-B]
│
├─ PATH C: Create a new item OR edit an existing item
│  ├─ IF: 1–6 fields             → [PATH-C-SIMPLE]
│  ├─ IF: 7–15 fields            → [PATH-C-MEDIUM]
│  └─ IF: 15+ fields / complex   → [PATH-C-COMPLEX]
│
├─ PATH D: Quick input, confirmation, or selection        [PATH-D]
│
└─ PATH E: View details of a single item (read-only)      [PATH-E]
```

---

## Container Type Details

### PATH A — Settings Page

**When to use:** managing profile, workspace, team, billing, notifications, members. Multiple related sections that don't need simultaneous editing. Changes persist immediately or on explicit save.

**Depth:** 2–3 sections → horizontal tabs pinned to top, single page (title + tabs + tab content). 4+ sections → sidebar navigation + sub-pages (sidebar pinned on desktop, becomes a hamburger menu that slides out and overlaps content on mobile).

**Standard sections and what they contain:**
- **Profile** — first/last name, email, phone, home address, role, profile picture, delete account
- **Workspace/Organization** — company name, EIN, logo, brand color, phone, business address, delete workspace
- **Billing** — payment methods, invoices, subscription status
- **Notifications** — email preferences, notification types
- **Members** — list with role-based access; columns for name, email, role, status; invite/edit-role/remove actions

**Form handling within settings:** each section is a mini form with its own view/edit state.
- View state (default): label + data value stacked or side-by-side, full-width border per item, no editing.
- Edit state (explicit user action): input fields editable, Save + Cancel buttons appear.
- Permissions: hide entire sections the user's role can't access; disable fields they can't edit but still show them in view-only state.
- On save: trigger a toast confirmation.

### PATH B — Table/List with Details

**When to use:** browsing, searching, filtering, and acting on multiple items, with occasional dives into single-item detail. Bulk actions might be needed.

**Details container:** quick edit needed (checkboxes, sliders, dropdowns, a handful of fields) → right sidebar, edit-focused, form inputs with conditional logic, close button top right. Viewing details first (user might edit after) → modal, view-focused; clicking "Edit" navigates to a dedicated form page.

**Table display:**
- First column bold, pinned on horizontal scroll. Header row pinned on vertical scroll.
- Row hover → click opens sidebar or modal. Quick action buttons: max 3, visible on hover, right-aligned, floating above content.
- Pagination: 25 entries per page.
- Filtering/sorting: buttons anchored top right; active filters shown as dismissible chips; sort indicator shows column + direction.
- Row actions: if a row is deleted/archived, dim it visually and disable its actions.
- Editing from a modal navigates to a dedicated form page with a breadcrumb above the title (Home > Items > [Item Name] > Edit), or a ghost close button top right that returns to the table.

### PATH C — Form (Create/Edit)

**When to use:** creating a new item, editing an existing one, or completing a multi-step workflow.

**Complexity tiers:**
- 1–6 fields (simple): single column, stack vertically, no grouping, 24px between fields.
- 7–15 fields (medium): single column or 2 columns, group related inputs under section headers (e.g. an address group), 24px between fields within a section, 40px between sections.
- 15+ fields or complex relationships: tabs, or 2 columns with sections (e.g. event creation: basic info left, advanced settings right).
- Long forms with independent sections: allow per-section editing rather than one whole-form edit state.

**Form states:** view (default) shows label + value stacked or side-by-side, full-width border per item, read-only, with a status label ("Completed", "Needs review", "Pending review", "Updated"). Edit (explicit action) makes inputs editable; primary button enables only when all required fields are valid; conditional logic disables child inputs until their parent input is valid; expanded accordion items show a leading icon + text on action buttons.

**Field labeling:** input labels use H5 (14px, medium weight); helper text uses the Description style (14px normal). Example structure: H5 label ("Email address") + Description helper text ("We'll send a confirmation link here") + input (max 400px wide) + validation error ("Please enter a valid email").

**Field grouping:** section header (H4, e.g. "Billing address") + optional description ("Where invoices should be sent") + the grouped inputs underneath.

**Validation and errors:** reserve space for helper text so the form doesn't shift when an error appears; helper text sits below the input at rest. Error messages are inline alerts grouped with their field (proximity = relationship) and state what went wrong plus what to do next — not just "Invalid password," but "Password must be at least 8 characters."

**Binary choices:** only 2 dropdown options available → use radio buttons instead (stacked or inline), e.g. yes/no, accept/decline.

**Confirmation and cancellation:** cancel/delete on a form with no user data happens immediately, no confirmation needed. Cancel/delete on a form with entered or autofilled data shows a double-confirmation modal warning that unsaved data will be lost (e.g. "Discard changes?" / "You have unsaved changes. If you leave now, they'll be lost." / Discard [destructive] / Keep editing [default]).

**Save behavior:** create → save creates the record, show a toast/banner confirmation, optionally redirect or stay with a success message. Edit → save updates the record, refreshes the form with updated values, shows a success toast. Multi-step → each step validates before advancing; buttons are "Next" + "Back" (optionally "Save for later"); show a step indicator ("Step 2 of 5").

**Mobile:** active input field stays visible while the keyboard is present; max 400px width on inputs/dropdowns; dropdowns become action sheets (see PATH D).

### PATH D — Dialog / Action Sheet

**When to use:** a single quick input (amount, selection, confirmation), a simple yes/no confirmation, or a dropdown selection — especially on mobile.

**Breakpoint behavior:** desktop → centered modal dialog with a dimming backdrop. Mobile → action sheet that slides up from the bottom (one-hand operation); multi-step content covers 80–90% of screen height.

**Never use an action sheet if text input/keyboard is required** — that needs a full modal. Action sheets are for number input (spinner/stepper), sliders, dropdown selection, and binary confirmation only.

**Structure:** header (H2 title, optional description, close button top right on desktop / top center on mobile) → body (single input field or simple content, max width per breakpoint) → sticky footer (button group, right-aligned on desktop / stacked on mobile: primary on the right, secondary 20px to its left, optional tertiary/ghost link on the far left).

**Confirmation dialog example:** Title "Delete invoice?" / Description "This can't be undone. All associated records will be removed." / Secondary button "Cancel" / Primary destructive button "Delete invoice."

**Selection dialog example:** Title "Select payment source" / dropdown or list of options / Secondary "Cancel" / Primary "Continue."

### PATH E — Detail Page (Read-Only / View State)

**When to use:** viewing a single record read-only, with no editing at this level — editing happens on a dedicated form page the user clicks through to.

**Structure:** breadcrumb above the title (Home > Items > [Item Name]) → H1 page title → close/back button top right if in a modal → body of grouped data stacked vertically (label + value per group, with status badges where relevant) → actions (view-only has no primary action; an "Edit" link/button navigates to the form page; archive/delete appear as secondary/destructive buttons).

**Mobile:** stacked single column, no horizontal grouping.

---

## Permissions, Visibility, and Conditional Logic

Cross-cutting rules that apply across every container type above.

**Hide by role** `[PATH-PERM-HIDE-BY-ROLE]` — remove page elements entirely (not just disable) if the user's role can't see them: e.g. hide "Members" if not admin, hide "Billing" if not workspace owner. Check role at render time; don't render the element at all.

**Disable by permission or condition** `[PATH-PERM-DISABLE-BY-CONDITION]` — for content the user can't update due to org settings or cascading choices, keep the element visible but disabled, so the user can visually map cause and effect. E.g. a disabled payment-method select with helper text "Edit your billing plan to change payment method."

**Parent/child input dependencies** `[PATH-COND-PARENT-CHILD]` — disable child inputs until the parent input has a valid value; show them disabled but visible, with a helper explaining why (e.g. "Select a payment method first").

**Primary button state** `[PATH-COND-PRIMARY-BUTTON]` — disable the primary button until all required fields are valid; on hover, show a tooltip like "Fill in all required fields to continue."

**Cascading accordion/expansion** `[PATH-COND-ACCORDION-EXCLUSIVE]` — only one expandable form in a layout stays open at a time; opening a new one auto-collapses the previous.

**Accordion/expandable items** — collapsed state shows icon-only edit/remove buttons anchored right of the header, with tooltips on hover ("Edit", "Delete"). Expanded state shows those same buttons with a leading icon plus text for greater clarity ("Edit section", "Remove item").

**Simple calculation tables** `[PATH-COND-CALC-TABLE-ROWS]` — inline inputs and dropdowns in a table that dynamically updates a total (e.g. quantity input + product dropdown → calculated line total). Header row acts as the field label. Never stack more than 4 rows.

---

## Spacing Quick Reference

Implemented via `vois-tokens`; listed here for context.

- 24px vertical: heading ↔ body text
- 24px horizontal: between two input fields
- 40px vertical: body content ↔ primary action button
- 20px horizontal: between primary/secondary buttons (bottom-right anchored)
- Use gap tokens on the container div instead of margin-bottom on elements

For exact class names and token values, see `vois-tokens`.

---

## Quick Checklist Before Implementation

- [ ] Container type selected (settings / table / form / dialog / detail)
- [ ] Page structure sketched (what sections, what's visible, what's hidden by role)
- [ ] Permissions applied (hide/disable rules — see Permissions section above)
- [ ] All copy written with Righter (or the fallback conventions), not guessed
- [ ] Ready to apply `vois-components` then `vois-tokens` for components, tokens, and spacing
- [ ] Mobile breakpoint behavior defined (action sheets vs. dialogs, sidebar vs. hamburger, etc.)

---

## Relationship to Other Skills

**This skill ↔ vois-components:** after picking a container type here, read `vois-components` to select specific components — it resolves ambiguous pairs like Dialog vs Drawer, Toast vs Banner, Select vs Combobox.

**This skill ↔ vois-tokens:** read this skill first (what to build), then `vois-tokens` (how to code it correctly) for tokens, spacing, components, animation, and accessibility.

**This skill ↔ Righter:** every word in the UI comes from Righter, or the fallback conventions above if Righter isn't installed. This skill tells you which container type; Righter tells you what words go in it.
