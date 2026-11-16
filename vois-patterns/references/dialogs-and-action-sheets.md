# Dialog / Bottom Sheet `[PATH-D]`

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

- Single input or confirmation → Bottom sheet (one-hand operation)
- Slides up from bottom, at most 90dvh, stacked footer with the primary button on top, a visible way to close (`[DS-RESPONSIVE-008]`, built in vois-tokens `references/overlays.md`)
- A short list of choices ending in a separate Cancel is an action sheet: the same bottom sheet, one row per choice
- More than one step is not a sheet: see `[PATH-D-5]`

**NEVER use a bottom sheet if text input/keyboard required.** Text input is a full-screen form (`[DS-RESPONSIVE-009]`). Bottom sheets are for:

- Number input (spinner, quantity control)
- Slider
- Dropdown selection
- Binary confirmation (yes/no, approve/reject)

## Dialog Width `[PATH-D-SIZE]`

Applies to desktop dialogs. Both widths are maximums, set by tokens. Every dialog is a single column.

- **Small, `--width-dialog-sm`:** confirmations, AlertDialogs, typed confirmation, and dialogs with one or a few stacked fields
- **Large, `--width-dialog-lg`:** dialogs whose content needs the extra width, such as a textarea or a short list

Pick the tier by what the content needs, not by whether the dialog contains an input. One field in a large dialog leaves it capped at `--width-field-max` with empty space around it.

Two-column layouts go on pages, not in dialogs (see `[PATH-FIELD-COLUMNS]`). A flow that needs steps or more room becomes a page, not a bigger dialog.

On mobile, dialogs that take text input are full modals at the viewport width, so these tiers do not apply (see above).

## Which container: the ladder

Walk these in order. Take the first one that fits.

1. **Confirm.** `[PATH-D-1]` One yes or no, a destructive or consequential confirmation, or one pick, and the user needs nothing else from the page. An AlertDialog if the action is destructive or has consequences, otherwise a small Dialog. On phone, a bottom sheet.
2. **Form dialog.** `[PATH-D-2]` One task, one to four stacked fields, no need for the page behind it. A small Dialog. On phone, a full-screen form.
3. **Large dialog.** `[PATH-D-3]` One task whose content needs the width: a textarea or a short list, still one column. A large Dialog. On phone, a full-screen form.
4. **Side peek.** `[PATH-D-4]` Five to eight fields, or the user needs the page behind it (to compare, copy or pick rows). A right-anchored Sheet. As a peek it has no scrim and no inert background, so the page stays usable. On phone, full screen.
5. **Page.** `[PATH-D-5]` More than eight fields, tabs, a timeline, related records, a long form, or more than one step. A full page, opened from an Open action in the overlay.

Never stack dialogs: a second step replaces the content of the same dialog (a pushed view with a Back control), or becomes a page. Never use a dialog for navigation. Both rules are in vois-tokens `references/overlays.md` (`[DS-MODAL-006]`, `[DS-MODAL-007]`). The field counts follow vois-components `JOB-OVERLAY-INTERACTION`.

## Dialog Content Structure:

**Header:**

- H2 title (dialog or bottom sheet heading)
- Optional description below title
- Close button top right (desktop) OR top center (mobile)
- → **For title and description, use righter skill**

**Body:**

- Single input field OR simple content
- Max width: see `[PATH-D-SIZE]` below

**Footer:**

- Sticky positioned at bottom
- Button group: right-aligned on desktop, stacked on mobile
- Primary button (right side): default action
- Secondary button (left of primary, `gap-5`): cancel/alternative
- Optional tertiary button (left side): learn more, help link
- → **For button labels, use righter skill** (specific action words, not just "Confirm")

## Button Placement Rules:

- Primary button: right side
- Secondary button: right side, `gap-5` left of primary
- Optional tertiary (ghost or link): left side, only when the dialog is wider than 400px
- All vertically centered in sticky footer
- Anchored to bottom of the dialog or bottom sheet. Typically two buttons, three only in a dialog wider than 400px (`[DS-MODAL-005]`)

## Confirmation Dialogs:

Which component to use for a destructive action: vois-components `JOB-CONFIRM-DESTRUCTIVE`. For deleting a workspace, team, or account, add typed confirmation per `[PATH-SET-REMOVE-TYPED]`.

Example structure (righter routing):

```
Modal/Bottom sheet
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
Modal/Bottom sheet
├─ Title (righter): "Select payment source"
├─ [Dropdown or list of options]
└─ Footer
   ├─ Secondary button (righter): "Cancel"
   └─ Primary button (righter): "Continue"
```

→ **For all copy and option labels, use righter skill**

## Mobile-Specific Copy:

Bottom sheets on mobile might have slightly different button placement or labels than desktop modals.
→ **For mobile-specific button copy, verify with righter skill** (especially if space is tight)
