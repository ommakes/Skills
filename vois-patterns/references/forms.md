# Form (Create/Edit) `[PATH-C]`

Field widths, columns, and the name, address, phone, email, and one-time-code groups: see `form-field-groups.md`.

## When to use:

- User is creating a new item
- User is editing an existing item
- User is completing a workflow or multi-step process

## Macro Decision: Form Complexity

### IF: 1-6 fields (simple form) `[PATH-C-SIMPLE]`

→ Layout: Single column, stack vertically
→ No grouping needed
→ Space between fields: `gap-6`

### IF: 7-15 fields (medium form) `[PATH-C-MEDIUM]`

→ Layout: Single column OR up to 2 columns (see `[PATH-FIELD-COLUMNS]` and `[PATH-FIELD-WRAP]` in `form-field-groups.md`)
→ Group related inputs with section headers
→ Example: Address group (street address, city, state, zip)
→ Space within section: `gap-6` between fields, `gap-10` between sections

### IF: 15+ fields OR complex relationships `[PATH-C-COMPLEX]`

→ Layout: Tabs OR 2 columns with sections
→ Group related fields under section headers
→ Example: Event creation (left: basic info, right: advanced settings)

### IF: Long form with independent sections

→ Allow per-section editing rather than whole form
→ Each section can enter edit state independently

## Form States:

### VIEW STATE (default)

- Label + data value stacked vertically or side-by-side
- Full-width border delineates each item
- No edit possible
- Read-only appearance
- Shows status label: "Completed", "Needs review", "Pending review", "Updated"

### EDIT STATE (explicit user action)

- Input fields editable
- Primary button enabled when all required fields valid
- Conditional logic: parent input must be valid before child inputs enabled
- Accordion items expanded: show leading icon + text on action buttons
- → **For all field labels, helper text, button labels, use righter skill**

## Field Labeling:

**Form labels follow typography rules from vois-tokens:**

- Use H5 for input labels
- Use Description style for helper text
- → **Content of labels and helpers: use righter skill**

**Example field structure (righter routing):**

```
H5 label (righter): "Email address"
Description helper text (righter): "We'll send a confirmation link here"
Input field (up to `--width-field-max`)
Error message on validation failure (righter, `helper-text` component)
```

## Field Grouping:

Group related inputs with a section header and optional description.

Example:

```
H4 section header (righter): "Billing address"
Description helper text (righter): "Where invoices should be sent"
├─ Input: Street address (righter)
├─ Input: City (righter)
├─ Input: State (righter)
└─ Input: ZIP code (righter)
```

→ **All copy for labels, headers, helper text: use righter skill**

## Validation & Error Messages:

→ Which component to use and how to write the message: righter `error-decision-tree`, `error-structure`, and the `helper-text` component. This section covers placement only.

**Helper text placement:**

- Account for helper text space so form doesn't shift when error appears
- Helper text appears below input in resting state

**Error messages:**

- Field-level errors use righter's Helper Text, attached to the field. Inline Alerts are for page sections, not single fields.
- Proximity = relationship clarity
- → **For error message copy, use righter skill** (what went wrong + what to do next)

→ Error copy examples live in righter (`error-structure`, `error-no-blame`, `error-field-vs-system`, and the `helper-text` component). They are not repeated here.

## Binary Choices:

**IF: Only 2 dropdown options available**
→ Use: Radio select instead
→ Stacked inline/horizontally when possible
→ Examples: yes/no, accept/decline, male/female

→ **For radio labels, use righter skill**

## Confirmation & Cancellation Logic:

### IF: Form in EDIT state with NO user data

→ Cancel/Delete: do it immediately, no confirmation needed

### IF: Form in EDIT state WITH user data (entered or autofilled)

→ Cancel/Delete: show double confirmation modal
→ Modal warns user will lose all saved data
→ → **For confirmation modal copy, use righter skill** (clear consequence language)

→ Confirmation copy (title, description, button labels) comes from righter's `alert-dialog` component. The component is an AlertDialog per vois-components `JOB-CONFIRM-DESTRUCTIVE`. Examples are not repeated here.

## Save Behavior:

**Create form:**

- Save creates record
- Show toast/banner confirmation
- Optionally redirect or stay with success message
- → **For success message, use righter skill** ("Invoice created", "Team member added", etc.)

**Edit form:**

- Save updates record
- Refreshes form with updated values
- Shows success toast
- → **For success message, use righter skill**

**Multi-step form:**

- Each step validates before allowing next
- Buttons: "Next" + "Back" (maybe "Save for progress")
- Show step indicator: "Step 2 of 5"
- → **For button labels and step indicator copy, use righter skill**

## Status Labels:

Indicate form state with label:

- "Needs review"
- "Pending review"
- "Updated"
- "Completed"

Place near form title or in header area.
→ **For status label copy, use righter skill**

## Mobile Behavior:

- Active input field always visible while keyboard present
- `--width-field-max` on input/dropdown fields
- Dropdowns → action sheets on mobile (see dialogs-and-action-sheets.md)
