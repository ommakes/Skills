# Permissions, Visibility, and Conditional Logic

Cross-cutting behavior rules that apply across container types — not tied to one template.

## Permissions & Visibility Rules

### Rule 1: Hide Page Elements by Role `[PATH-PERM-HIDE-BY-ROLE]`

Hide page elements entirely if user role doesn't have permission to see them.

**Examples:**

- Hide "Members" section if user is not admin
- Hide "Billing" section if user is not workspace owner
- Hide "Delete account" button if not permitted

This is deletion, not disabling—elements never appear in DOM.

→ **Implementation note:** Check role at render time; don't render the element at all.

### Rule 2: Disable Controls by Permission or Condition `[PATH-PERM-DISABLE-BY-CONDITION]`

For content user cannot update due to org admin settings OR cascading choice conditions:

- Keep element visible
- Disable the control
- Show in view-only or disabled state
- Let user visually map cause/effect relationships

**Examples:**

- User hasn't selected a parent item → child options disabled (with explanation)
- Workspace admin disabled this setting → field disabled with note
- Record is archived → all fields disabled but visible

→ **For disabled state explanations (tooltips, helper text), use righter skill**

Example (righter):

```
Label: "Payment method"
Select: [Disabled, shows current value]
Helper text (righter): "Edit your billing plan to change payment method"
```

## Personal Data (PII)

Rules for showing personal data on screen. For the words around it (errors, toasts, subjects), use righter (`no-pii-in-copy`).

### Mask by default `[PATH-PERM-PII-MASK]`

When a list, table, card, or header shows personal data (email, phone, street address, date of birth, government ID, payment number) to someone whose task doesn't need the full value:

- Show a masked value: `j***@acme.com`, `•••• 4821`, last four digits only.
- A person's name stays visible on a screen whose job is that person (a people list, a profile).
- Show the full value only to roles that need it, and only through the reveal control (`[PATH-PERM-PII-REVEAL]`) or on a detail view. A role that never needs it never receives it.
- Mask on the server, so the full value never reaches the page for roles that can't see it. CSS blur or hiding is not masking. This is `[PATH-PERM-HIDE-BY-ROLE]` applied to a value instead of an element.
- Keep the column width the same for masked and full values so the layout doesn't jump.

### Reveal on request `[PATH-PERM-PII-REVEAL]`

When a role that is allowed to see a masked value needs the full one:

- Put the reveal control on that one field, not on the whole page, and wherever the masked value appears (a list row, a card, a header, or a detail view): an icon Button labelled "Show email" (→ **tooltip and label copy: righter**).
- Re-mask when the user leaves the view or after a timeout.
- Log reveals of high-risk fields (government ID, payment, health data) on the server.
- Copy to clipboard copies the full value only for roles that may reveal it.

### Keep it out of URLs, titles, file names, and analytics `[PATH-PERM-PII-KEEP-OUT]`

When building a URL, query string, page title, breadcrumb, browser history entry, export file name, or analytics event for a screen that involves a person:

- Use opaque IDs: `/customers/c_8f2a`, not `/customers/jane.doe@acme.com`.
- A title or breadcrumb may show a name only on a screen whose job is that person. Never an email, phone number, address, or ID.
- Name exports by content and date: `customers-2026-10-06.csv`.
- Analytics properties carry IDs, never values (→ **`metrics-tagging`**).
- Error, toast, and notification copy: righter `no-pii-in-copy`.

## Conditional Logic Rules

### Parent/Child Input Dependencies `[PATH-COND-PARENT-CHILD]`

In a group of related inputs, if there is a conditional relationship:

- Disable the child inputs affected until the parent input is updated/selected with a valid value
- Show them disabled but visible (so user understands the relationship)
- → **For disabled state explanations, use righter skill** (tooltip or helper text: "Select a payment method first", etc.)

### Primary Button State `[PATH-COND-PRIMARY-BUTTON]`

The primary button on a form should be disabled until all required fields have been filled with valid responses.

Example (from righter):

```
Button state: disabled
Hover state: show tooltip (righter): "Fill in all required fields to continue"
```

### Cascading Accordion/Expansion `[PATH-COND-ACCORDION-EXCLUSIVE]`

If there are multiple expandable forms in a layout:

- Only one form can remain expanded at a time
- Auto-collapse the previous one when user opens a new one
- → **For section titles and expand/collapse labels, use righter skill**

## Accordion/Expandable Item Rules

If a form element has accordion properties (expand/collapse):

**Collapsed state:**

- Show edit/remove icon buttons anchored right of form header
- Icons only (no text)
- → **For icon button tooltips, use righter skill** (tooltip on hover: "Edit", "Delete")

**Expanded state:**

- Icon buttons show leading icon + text
- Greater fidelity of detail on what buttons will do
- → **For button labels when expanded, use righter skill** (e.g., "Edit section", "Remove item")

## Simple Calculation Tables `[PATH-COND-CALC-TABLE-ROWS]`

Use simple table layouts with inline input fields and dropdowns for calculations that dynamically update a final value.

Example:

- First input: user enters quantity
- Second input: dropdown of product selections (outputs price based on selection)
- Final output: dynamically calculated total

**Rules:**

- Header row acts as field label
- Inline inputs and dropdowns
- Never stack more than 4 rows
- → **For header labels and column titles, use righter skill**
