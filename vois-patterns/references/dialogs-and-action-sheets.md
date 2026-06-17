# Dialog / Action Sheet `[PATH-D]`

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
- Max width: depends on desktop or mobile (see vois-tokens)

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
