# Permissions, Visibility, and Conditional Logic

Cross-cutting behavior rules that apply across container types — not tied to one template.

## Permissions & Visibility Rules

### Rule 1: Hide Page Elements by Role

Hide page elements entirely if user role doesn't have permission to see them.

**Examples:**

- Hide "Members" section if user is not admin
- Hide "Billing" section if user is not workspace owner
- Hide "Delete account" button if not permitted

This is deletion, not disabling—elements never appear in DOM.

→ **Implementation note:** Check role at render time; don't render the element at all.

### Rule 2: Disable Controls by Permission or Condition

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

## Conditional Logic Rules

### Parent/Child Input Dependencies

In a group of related inputs, if there is a conditional relationship:

- Disable the child inputs affected until the parent input is updated/selected with a valid value
- Show them disabled but visible (so user understands the relationship)
- → **For disabled state explanations, use righter skill** (tooltip or helper text: "Select a payment method first", etc.)

### Primary Button State

The primary button on a form should be disabled until all required fields have been filled with valid responses.

Example (from righter):

```
Button state: disabled
Hover state: show tooltip (righter): "Fill in all required fields to continue"
```

### Cascading Accordion/Expansion

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

## Simple Calculation Tables

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
