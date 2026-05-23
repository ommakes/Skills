---
name: vois-patterns
description: Structural decision trees for container types, form states, table layouts, and page-level patterns. Use before vois-design-system. Routes to righter skill for all microcopy (labels, errors, buttons, helpers). Use when building pages, forms, features, workflows.
version: 1.1.0
---

# Vois Patterns Skill

You are building the *structure* of pages and containers for a design system. This skill defines the architectural decisions that come *before* implementation (tokens, components, styling).

**Read this skill first.** After you determine structure here, read `vois-design-system` for implementation details (spacing, typography, components, tokens).

This skill routes to `righter` skill for all microcopy (button labels, error messages, field descriptions, helper text). Don't guess at words—follow the righter skill.

---

## Before You Write Anything

1. **What is the user trying to accomplish?** (Dashboard overview? Edit a record? Confirm an action?)
2. **Pick the container type** from the decision tree below.
3. **Apply the template rules** for that type.
4. **Call `record_pattern_decision`** once you have picked a path. Do this before writing any code.

   ```
   Tool: record_pattern_decision
   Arguments:
     pathId: <one of the path IDs listed in the decision tree below>
     confidence: <0.0–1.0 — how clearly the UI fits this path>
     reasoning: <one sentence on why you chose this path>
   ```

   If no path fits well (confidence below 0.6), call `report_pattern_gap` instead of forcing a match:

   ```
   Tool: report_pattern_gap
   Arguments:
     description: <what the UI needs to do>
     closestPathId: <the closest match even if it doesn't fit>
     gapDescription: <what the templates don't cover>
   ```

5. **For every word that appears in UI**, check `righter` skill.
6. Then read `vois-design-system` for implementation (tokens, spacing, components).

---

## Decision Tree: What Container Type Should I Build?

```
START: What is the user trying to accomplish?

├─ PATH A: Manage settings or account preferences
│  ├─ IF: 2–3 sections only
│  │  └─ → USE: Settings Page Template (horizontal tabs)  [PATH-A-DEPTH-SHALLOW]
│  └─ IF: 4+ sections
│     └─ → USE: Settings Page Template (sidebar nav)      [PATH-A-DEPTH-DEEP]
│
├─ PATH B: View, filter, and act on a list of items
│  └─ → USE: Table/List with Details Template             [PATH-B]
│
├─ PATH C: Create a new item OR edit an existing item
│  ├─ IF: 1–6 fields
│  │  └─ → USE: Form Template (simple)                   [PATH-C-SIMPLE]
│  ├─ IF: 7–15 fields
│  │  └─ → USE: Form Template (medium)                   [PATH-C-MEDIUM]
│  └─ IF: 15+ fields OR complex relationships
│     └─ → USE: Form Template (complex)                  [PATH-C-COMPLEX]
│
├─ PATH D: Quick input, confirmation, or selection
│  └─ → USE: Dialog/Action Sheet Template                 [PATH-D]
│
└─ PATH E: View details of a single item (read-only or view state)
   └─ → USE: Detail Page Template                         [PATH-E]
```

---

# TEMPLATE 1: Settings Page

## When to use:

- User is managing profile, workspace, team, billing, notifications, members
- Multiple related sections that don't need to be edited simultaneously
- Changes persist immediately or on explicit save

## Macro Decision: Settings Depth

**IF: 2-3 sections only** `[PATH-A-DEPTH-SHALLOW]`
→ Use: Horizontal tabs pinned to top (single page)
→ Structure: Page title + tabs + tab content area

**IF: 4+ sections** `[PATH-A-DEPTH-DEEP]`
→ Use: Sidebar navigation + sub-pages
→ Structure: Sidebar (pinned on desktop, hamburger on mobile) + main content area

## Mobile Adaptation:

- Sidebar becomes hamburger menu that slides out and overlaps content

## Standard Sections (with righter routing):

### Profile Section

Contains: first/last name, email, phone, home address, role, profile picture, delete account

**Microcopy to write with righter:**

- Label: "First name"
- Label: "Last name"
- Label: "Email address"
- Helper text: guidance on email format if relevant
- Button: "Upload photo" or "Change photo"
- Danger button: "Delete account" (see righter for confirmation copy)

### Workspace/Organization Section

Contains: company name, EIN, logo, brand color, phone, business address, delete workspace

**Microcopy to write with righter:**

- Label: "Company name"
- Label: "Business address"
- Helper text: "This is your official headquarters address"
- Danger button: "Delete workspace" (see righter for confirmation copy)

### Billing Section

Contains: payment methods, invoices, subscription

**Microcopy to write with righter:**

- Section title: "Billing & Subscription"
- Button: "Add payment method"
- Button: "Download invoice"
- Status label: "Active subscription" or "Trial ending" or "Past due"

### Notifications Section

Contains: email preferences, notification types

**Microcopy to write with righter:**

- Checkboxes: "Email me when…"
- Toggle: "Receive desktop notifications"
- Helper text: explanations of each notification type

### Members Section

Contains: list with role-based access (member, admin, etc.)

**Microcopy to write with righter:**

- Column headers: "Name", "Email", "Role", "Status"
- Button: "Invite member"
- Status badge: "Pending", "Active"
- Action menu: "Edit role", "Remove member"

## Form Handling Within Settings:

Each section = mini form with own view/edit state

**VIEW STATE** (default)

- Label + data value stacked vertically or side-by-side
- Full-width border delineates each item
- No edit possible

**EDIT STATE** (explicit user action)

- Input fields editable
- Buttons appear: Save + Cancel
- → **For button copy, use righter skill** ("Save changes", "Cancel", etc.)

**Permissions Rules:**

- Hide entire sections user can't access based on role
- Disable fields user can't edit, but show them in view-only state
- → **For disabled state explanations, use righter skill** (tooltip or helper text explaining why)

**Save & Confirmation:**

- On save: trigger toast confirmation
- → **For toast copy, use righter skill** ("Profile updated", "Changes saved", etc.)

---

# TEMPLATE 2: Table/List with Details `[PATH-B]`

## When to use:

- User needs to browse, search, filter, and act on multiple items
- User occasionally dives into single item details
- Bulk actions might be needed

## Macro Decision: Details Container Type

**IF: Quick edit needed** (checkboxes, sliders, dropdowns, handful of fields)
→ Use: Right sidebar (edit-focused)
→ Show form inputs, conditional logic applies
→ Close button on sidebar top right

**IF: Viewing details first** (default view state, user might want to edit after)
→ Use: Modal (view-focused)
→ If user clicks "edit" in modal, navigate to dedicated form page
→ Modal has close button, optional "Edit" action

## Table Display Rules:

**Structure:**

- First column: bold text, pinned on horizontal scroll
- Header row: pinned on vertical scroll
- Row hover state → click opens sidebar or modal
- Quick action buttons: max 3, visible on hover, right-aligned, float above content

**Pagination:**

- 25 entries per page
- → **For pagination copy, use righter skill** ("Loading more…", "Next page", etc.)

**Filtering & Sorting:**

- Buttons anchored top right of table
- Active filters shown as dismissible chips
- Sort indicator shows which column + direction
- → **For filter/sort labels and chip copy, use righter skill**

**Columns:**

- Use date pickers for date-entry columns
- Bold the text in first column (table entry name)
- → **For column headers, use righter skill** (keep them short, clear)

**Row Actions:**

- If row is deleted/archived: dim the row visually and disable actions
- → **For action button labels ("Edit", "Delete", "Archive"), use righter skill**

## If User Edits from Modal:

Navigate to dedicated form page with:

- Breadcrumb above title (Home > Items > [Item Name] > Edit)
  - → **For breadcrumb labels, use righter skill**
- OR ghost close button top right
- Returns to table on close

---

# TEMPLATE 3: Form (Create/Edit)

## When to use:

- User is creating a new item
- User is editing an existing item
- User is completing a workflow or multi-step process

## Macro Decision: Form Complexity

### IF: 1-6 fields (simple form) `[PATH-C-SIMPLE]`

→ Layout: Single column, stack vertically
→ No grouping needed
→ Space between fields: 24px (spacing-md in design-system)

### IF: 7-15 fields (medium form) `[PATH-C-MEDIUM]`

→ Layout: Single column OR 2 columns
→ Group related inputs with section headers
→ Example: Address group (street address, city, state, zip)
→ Space within section: 24px between fields, 40px between sections

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

**Form labels follow typography rules from vois-design-system:**

- Use H5 (14px, medium weight) for input labels
- Use Description style (14px normal) for helper text
- → **Content of labels and helpers: use righter skill**

**Example field structure (righter routing):**

```
H5 label (righter): "Email address"
Description helper text (righter): "We'll send a confirmation link here"
Input field (max 400px wide)
Error message on validation failure (righter): "Please enter a valid email"
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

**Helper text placement:**

- Account for helper text space so form doesn't shift when error appears
- Helper text appears below input in resting state

**Error messages:**

- Inline alerts grouped with associated input fields
- Proximity = relationship clarity
- → **For error message copy, use righter skill** (what went wrong + what to do next)

Example (from righter):

```
❌ "Password must be at least 8 characters"
(not just "Invalid password")

✓ "Email already in use. Try another or sign in to your account"
(not just "Email taken")
```

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

Example (from righter):

```
Heading: "Discard changes?"
Body: "You have unsaved changes. If you leave now, they'll be lost."
Button: "Discard" (destructive), "Keep editing" (default)
```

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
- Max 400px width on input/dropdown fields
- Dropdowns → action sheets on mobile (see Dialog/Action Sheet template)

---

# TEMPLATE 4: Dialog / Action Sheet `[PATH-D]`

## When to use:

- Single quick input needed (amount, selection, confirmation)
- Simple confirmation (yes/no, approve/reject)
- Dropdown selection (especially on mobile)

## Macro Decision: Breakpoint Behavior

### ON DESKTOP:

- Single input or confirmation → Modal dialog
- Centered on screen
- Backdrop dims content behind

### ON MOBILE:

- Single input or confirmation → Action sheet (one-hand operation)
- Slides up from bottom
- Multi-step needed → Action sheet covers 80-90% screen height

**NEVER use action sheet if text input/keyboard required.** Text input requires full modal. Action sheets are for:

- Number input (spinner, stepper)
- Slider
- Dropdown selection
- Binary confirmation (yes/no, approve/reject)

## Dialog Content Structure:

**Header:**

- H2 title (modal/action sheet heading)
- Optional description below title
- Close button top right (desktop) OR top center (mobile)
- → **For title and description, use righter skill**

**Body:**

- Single input field OR simple content
- Max width: depends on desktop or mobile (see vois-design-system)

**Footer:**

- Sticky positioned at bottom
- Button group: right-aligned on desktop, stacked on mobile
- Primary button (right side): default action
- Secondary button (left of primary, 20px gap): cancel/alternative
- Optional tertiary button (left side): learn more, help link
- → **For button labels, use righter skill** (specific action words, not just "Confirm")

## Button Placement Rules:

- Primary button: right side
- Secondary button: right side, 20px left of primary
- Optional tertiary (ghost/link): left side
- All vertically centered in sticky footer
- Anchored to bottom of dialog/action sheet

## Confirmation Dialogs:

Example structure (righter routing):

```
Modal/Action sheet
├─ Title (righter): "Delete invoice?"
├─ Description (righter): "This can't be undone. All associated records will be removed."
├─ [Body: empty or small supporting text]
└─ Footer
   ├─ Secondary button (righter): "Cancel"
   └─ Primary destructive button (righter): "Delete invoice"
```

→ **For all copy (title, description, button labels), use righter skill**

## Selection Dialogs:

Example (righter routing):

```
Modal/Action sheet
├─ Title (righter): "Select payment source"
├─ [Dropdown or list of options]
└─ Footer
   ├─ Secondary button (righter): "Cancel"
   └─ Primary button (righter): "Continue"
```

→ **For all copy and option labels, use righter skill**

## Mobile-Specific Copy:

Action sheets on mobile might have slightly different button placement or labels than desktop modals.
→ **For mobile-specific button copy, verify with righter skill** (especially if space is tight)

---

# TEMPLATE 5: Detail Page (Read-Only / View State) `[PATH-E]`

## When to use:

- User is viewing a single record in read-only mode
- No editing at this level (editing happens on a dedicated form page)
- User might click through to edit on a separate page

## Structure:

**Header:**

- Breadcrumb above title (Home > Items > [Item Name])
  - → **For breadcrumb labels, use righter skill**
- H1 page title (the item name or type)
- Close button or back button top right (if in modal)

**Body:**

- Groups of related data, stacked vertically
- Each data group: label + value
- Status indicators/badges if relevant
- → **For all labels and status badges, use righter skill**

**Actions:**

- View-only state: no primary action
- If editing available: link or button "Edit" that navigates to form page
- If archiving/deleting available: secondary/destructive buttons
- → **For button labels and action copy, use righter skill**

**Mobile:**

- Stacked single column
- No horizontal grouping

---

# Permissions & Visibility Rules

## Rule 1: Hide Page Elements by Role

Hide page elements entirely if user role doesn't have permission to see them.

**Examples:**

- Hide "Members" section if user is not admin
- Hide "Billing" section if user is not workspace owner
- Hide "Delete account" button if not permitted

This is deletion, not disabling—elements never appear in DOM.

→ **Implementation note:** Check role at render time; don't render the element at all.

## Rule 2: Disable Controls by Permission or Condition

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

---

# Microcopy Routing to Righter Skill

**This is critical.** Every piece of text that appears in UI should be reviewed with righter skill.

Use righter skill for:

- **Form labels:** "Email address", "Company name", "Payment method"
- **Helper text:** explanations below inputs, guidance on format
- **Placeholder text:** inside empty inputs (actually: use color token text-instruction for color, but righter for words)
- **Error messages:** validation failures, explanations of what went wrong + how to fix
- **Button labels:** "Save changes", "Delete invoice", "Confirm", "Next"
- **Status labels & badges:** "Pending review", "Active", "Archived"
- **Section headers:** group titles, tab names
- **Descriptions:** explanations of form sections, modal content, empty states
- **Confirmation dialogs:** titles, body text, button labels
- **Toast/banner messages:** success, error, warning copy
- **Empty states:** what to do when no data exists
- **Tooltips & popovers:** explanations of features, buttons, settings
- **Inline alerts:** error states, warnings, info messages grouped with fields
- **Column headers:** table column labels (keep short)
- **Filter/sort labels:** dropdown options, chip text for active filters
- **Pagination controls:** "Previous page", "Next page", page numbers
- **Breadcrumb labels:** navigation hierarchy labels
- **Table action menus:** "Edit row", "Delete row", "Archive"
- **Quick action tooltips:** icon button explanations ("Edit", "Share", "Delete")

**Do NOT guess at button labels.** Example of wrong → right:

❌ "Confirm"
✓ "Delete invoice" (from righter)

❌ "OK"
✓ "Save changes" (from righter)

❌ "Yes"
✓ "Send invitation" (from righter)

**Integration pattern:**

```
1. You determine structure with this skill (page-templates)
2. Call record_pattern_decision with the path ID
3. For every word, check righter skill
4. Get the exact copy from righter
5. Then implement with vois-design-system rules (tokens, spacing, components)
```

---

# Spacing Rules (Quick Reference)

These are implemented via design-system; listed here for context.

- 24px vertical: heading ↔ body text
- 24px horizontal: between two input fields
- 40px vertical: body content ↔ primary action button
- 20px horizontal: between primary/secondary buttons (bottom right anchored)
- Use gap tokens on container div instead of margin-bottom on elements

For exact Tailwind class names and token values, see vois-design-system.

---

# Conditional Logic Rules

## Parent/Child Input Dependencies

In a group of related inputs, if there is a conditional relationship:

- Disable the child inputs affected until the parent input is updated/selected with a valid value
- Show them disabled but visible (so user understands the relationship)
- → **For disabled state explanations, use righter skill** (tooltip or helper text: "Select a payment method first", etc.)

## Primary Button State

The primary button on a form should be disabled until all required fields have been filled with valid responses.

Example (from righter):

```
Button state: disabled
Hover state: show tooltip (righter): "Fill in all required fields to continue"
```

## Cascading Accordion/Expansion

If there are multiple expandable forms in a layout:

- Only one form can remain expanded at a time
- Auto-collapse the previous one when user opens a new one
- → **For section titles and expand/collapse labels, use righter skill**

---

# Accordion/Expandable Item Rules

If a form element has accordion properties (expand/collapse):

**Collapsed state:**

- Show edit/remove icon buttons anchored right of form header
- Icons only (no text)
- → **For icon button tooltips, use righter skill** (tooltip on hover: "Edit", "Delete")

**Expanded state:**

- Icon buttons show leading icon + text
- Greater fidelity of detail on what buttons will do
- → **For button labels when expanded, use righter skill** (e.g., "Edit section", "Remove item")

---

# Simple Calculation Tables

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

---

# Quick Checklist Before Implementation

- [ ] Container type selected (settings / table / form / dialog / detail)
- [ ] `record_pattern_decision` called with pathId and confidence
- [ ] Page structure sketched (what sections, what's visible, what's hidden by role)
- [ ] Permissions applied (hide/disable rules)
- [ ] All copy routed to righter skill and reviewed
- [ ] Ready to read vois-design-system for tokens, spacing, components
- [ ] Mobile breakpoint behavior defined (action sheets vs dialogs, sidebar vs hamburger, etc.)

---

# Relationship to Other Skills

**This skill ↔ vois-design-system:**

- Read this first (what to build)
- Then read design-system (how to code it correctly)
- Design-system handles tokens, spacing, components, animation, accessibility
- This skill handles structural decisions and microcopy routing

**This skill ↔ vois-components:**

- After picking a container type here, read vois-components to select specific components
- vois-components resolves ambiguous pairs — Dialog vs Drawer, Toast vs Banner, Select vs Combobox
- Always call `record_component_choice` after selecting; do not skip it

**This skill ↔ righter skill:**

- Every word in UI comes from righter
- This skill tells you which container type
- Righter skill tells you what words go in that container
- Always check righter for: button labels, error messages, field descriptions, status copy, confirmations

---
