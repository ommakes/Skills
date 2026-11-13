---
name: vois-patterns
description: Structural decision trees for container types, form states, table layouts, and page-level patterns. Use before vois-tokens. Use when building pages, forms, features, workflows.
version: 1.20.0
---

# Vois Patterns Skill

> Full version & updates: https://github.com/ommakes/Skills/blob/main/vois-patterns/SKILL.md. The full version adds the machine-readable page templates (`data/page-templates.json`, with Mobbin references) and the long motion references. This edition condenses the page templates and the motion decision rules into sections below.

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
├─ PATH E: View details of a single item (read-only)      [PATH-E]
│
├─ PATH F: Show what it costs and help someone choose a plan
│  ├─ IF: flat, one plan                       → [PATH-F-FLAT-1]
│  ├─ IF: seat-based, 1 / 2-3 / 4 plans        → [PATH-F-SEAT-1] / [PATH-F-SEAT-3] / [PATH-F-SEAT-4]
│  ├─ IF: usage-based, 1 plan / tiered / PAYG  → [PATH-F-USAGE-1] / [PATH-F-USAGE-TIERED] / [PATH-F-USAGE-PAYG]
│  ├─ IF: seat fee + included usage            → [PATH-F-HYBRID]
│  └─ IF: consumer subscription                → [PATH-F-CONSUMER-WEB] / [PATH-F-CONSUMER-PAYWALL]
│
└─ PATH G: Show what a product or business offers to people not yet using it (landing page, homepage)   [PATH-G]

PAGE: The task is a whole page or screen layout, not one container (regions, order, behavior at each width)
   └─ → see Page Templates below   [PATH-PAGE]
      Use it together with the path the template routes to. The routed path wins on content.

MOTION: A state change should move (button, label, icon, number, panel, list, chart)
   └─ → see Motion below
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

**Settings interactions** (how view, edit, add, and remove behave inside the sections):
- **Persistence.** A Switch, Select, or Radio that stands alone saves on change and confirms with a toast; if the save fails, revert the control and surface the failure with the component the error tree picks. No Save button `[PATH-SET-SAVE-INSTANT]`. A block with text inputs or more than one related field uses explicit save: Save stays disabled until a value changed and every required value is valid, Cancel restores the last saved values, and both sit in the block `[PATH-SET-SAVE-EXPLICIT]`. The view state still applies to blocks that are mostly read and rarely changed (legal name, business address, billing); preference blocks are always editable `[PATH-SET-VIEW-EDIT-BLOCK]`.
- **Preference rows** `[PATH-SET-ROW-LAYOUT]`: label and optional helper on the left, control on the right, centered vertically. Group header above the rows, rows separated by dividers, no card or shadow around a group. Cap the column at `--width-form-max` and space groups with `gap-10`. Below the `sm` container width (`40em`) the control stacks under its label.
- **Notifications.** Two or more channels and three or more event types: a matrix with events as rows and channels as columns, grouped under category headers. Each cell is a Switch when changes save instantly, a Checkbox only when the page has an explicit Save. One channel: a plain list of Switches. Narrow: each event stacks with its channels beneath `[PATH-SET-NOTIF-MATRIX]`. A channel that isn't connected keeps its column visible and disabled, with a link to connect it `[PATH-SET-NOTIF-CHANNEL-OFF]`. A digest email gets its own Switch row above the matrix `[PATH-SET-NOTIF-DIGEST]`.
- **Members.** Columns are member (name and email), role, and status. Row actions sit in the DropdownMenu, and the Invite primary button sits top right of the table `[PATH-SET-MEMBERS-LIST]`. Invite opens a Dialog with email and role (use an inline email field only when inviting is the main job of the page); the toast names the invited address `[PATH-SET-MEMBERS-INVITE]`. Pending rows get a Pending badge with Resend invite and Remove; active rows get Edit role and Remove; a short role list can be an inline Select that saves instantly `[PATH-SET-MEMBERS-STATES]`. The current user's row says "You" and offers Leave, not Remove; the owner row has no Remove; removing someone else uses an AlertDialog and notifies them afterward `[PATH-SET-MEMBERS-SELF]`.
- **Integrations.** Connected above Available, each with a count. A list by default, a card grid only for a large catalog (add search and a category filter) `[PATH-SET-INTEG-GROUPS]`. Not connected: Connect. Connected: Configure when there are settings, plus a quiet Disconnect that is never the primary button, is red only if it deletes data, and confirms with an AlertDialog. A Connect that leaves the app shows an external-link icon `[PATH-SET-INTEG-ACTIONS]`. A plan-gated integration is shown disabled with the plan requirement stated; role-denied items are hidden `[PATH-SET-INTEG-LOCKED]`.
- **Removing things.** An irreversible or high-impact deletion (workspace, team, account) needs typed confirmation: the user types the object's name before the destructive button enables, the body lists what will be lost with counts and any recovery window, and it is always a full modal at the small dialog width `[PATH-SET-REMOVE-TYPED]`. Account-, workspace-, and team-level destructive actions sit at the bottom under a "Danger zone" heading, each row with a label and helper on the left and a destructive button on the right; leave and delete are separate rows `[PATH-SET-DANGER-ZONE]`.
- **Changing an email with a one-time code.** Show the email read-only with an Edit control and a Verified badge, never a plain input with Save `[PATH-SET-IDENTITY-FIELD]`. Edit opens a full page at its own route, not a dialog, with two steps shown in a Stepper: step 1 is the new address (plus the current password when the session isn't recent), step 2 is the code. Buttons are Cancel and Next, then Back (keeps the typed address) and Verify. Each step validates before the next; no retype field `[PATH-SET-EMAIL-CHANGE]`. The code goes to the new address, the current address stays active until it verifies, the body names the address and offers a way back, states the code length and expiry, and the previous address is notified after success `[PATH-SET-OTP-DELIVERY]`. Verify is the primary button in the step footer, disabled until every cell is filled, with an inline Spinner while verifying and no auto-submit on the last digit `[PATH-SET-OTP-SUBMIT]`. Resend is a text link under the field, disabled with the remaining wait after each send; a resend clears the cells and confirms with a toast `[PATH-SET-OTP-RESEND]`. A wrong or expired code shows inline under the field as Helper Text with every cell in the error state, digits kept and selected, never a toast; an expired code focuses Resend `[PATH-SET-OTP-ERROR]`. On success return to settings with the new address and Verified badge, and a toast `[PATH-SET-EMAIL-CHANGE-DONE]`.

### PATH B — Table/List with Details

**When to use:** browsing, searching, filtering, and acting on multiple items, with occasional dives into single-item detail. Bulk actions might be needed.

**Simple or complex:** a simple table has 6 columns or fewer, is mostly read, and has no bulk actions or inline edit. It scrolls vertically only, with the header sticking to the page. A complex table has more columns, bulk actions, inline edit, or many filters. It owns its own scroll on both axes at a bounded height, pins the header and first column, and offers Dense, Regular, and Comfortable densities.

**Row open:** a drawer (right-side sheet, table stays visible) for a record with 8 or fewer fields and no related records. A full page, reached from an Open action in the drawer, for a record with tabs, a timeline, related records, or a long form. A dialog only for confirmations. The open row goes in the URL.

**Where editing happens:** one low-risk value → in the cell. Several fields → the drawer form. The same change on many rows → a bulk action bar. Irreversible → the drawer form plus a confirmation.

**Table display:**
- First column bold, pinned on horizontal scroll. Header row pinned.
- Row hover → click opens the drawer. The first column is the real link, so keyboard and middle-click work. Quick action buttons `[PATH-B-ROW-ACTIONS]`: 2 visible is preferred and 3 is the maximum; everything beyond that, including secondary and destructive actions, goes in a DropdownMenu. Right-aligned, floating above content. Reveal on hover only where the device supports hover; on touch they are always visible `[PATH-B-ROW-ACTIONS-REVEAL]`.
- Pagination: 25 entries per page (complex tables let the user pick 25, 50, or 100), with the range and total in the footer ("1-25 of 240").
- Numbers are right-aligned, text left-aligned, headers align with their data.
- Filtering/sorting: Filter and Sort are pinned top right of the table, on the same row as the search field (`[PATH-PAGE-SORT-FILTER]`); active filters shown as dismissible chips; sort indicator shows column + direction.
- Row actions: if a row is deleted/archived, dim it visually and disable its actions.
- States, errors, and interactions: see Table interactions below.

**Table interactions** (how the table behaves):
- **Selection and bulk actions.** A table with bulk actions gets a leading checkbox column: tri-state header, shift-click for a range, selected rows tinted with a checked box (never tint alone). Simple tables have none `[PATH-TABLE-SELECT-CHECKBOX]`. When a full page is selected and more results exist, offer "select all N" and say how many rows an action will touch `[PATH-TABLE-SELECT-ALL-PAGES]`. The bulk bar shows the selected count, 2 to 3 visible actions with the rest in a DropdownMenu, and a clear-selection control; the destructive action is last and distinct `[PATH-TABLE-BULK-BAR]`. A destructive bulk action confirms with the count in a Dialog; if it can be undone, skip the dialog and offer Undo in the toast `[PATH-TABLE-BULK-DESTRUCTIVE]`.
- **Toolbar and view state.** Clicking a sortable header cycles ascending, descending, none, shows direction, carries `aria-sort`, allows one active sort, and resets paging to page 1 `[PATH-TABLE-SORT]`. A simple table has one Filter control that opens a Popover, with applied filters as chips under the toolbar, search on the left and Filter pinned top right `[PATH-TABLE-FILTER-SIMPLE]`; a complex table uses a filter builder of field, operator, value rows with Add filter, Apply, and Clear filters, and the chips stay visible `[PATH-TABLE-FILTER-BUILDER]`. Complex tables offer show or hide, reorder, pin, and Reset to default for columns; the first column can't be hidden `[PATH-TABLE-COLUMNS]`. Density is Dense, Regular, or Comfortable, remembered per user; simple tables have one `[PATH-TABLE-DENSITY]`. Saved views are tabs or a switcher that store filters, sort, columns, and density, with an unsaved-changes state `[PATH-TABLE-SAVED-VIEWS]`. Search, filters, sort, page, and the open row live in the URL `[PATH-TABLE-URL-STATE]`. Up and Down move row focus, Enter opens, Space toggles selection, Esc closes the drawer, Cmd or Ctrl plus Enter saves `[PATH-TABLE-KEYBOARD]`. The drawer has previous and next controls bound to Up and Down, and stepping past the last row loads the next page `[PATH-TABLE-DRAWER-STEP]`.
- **Editing and saving.** One low-risk value in a cell saves on commit (Enter or blur) with a toast that offers Undo; on failure revert the cell, mark the row, and keep the typed value for retry `[PATH-TABLE-COMMIT-INSTANT]`. Several cells or rows, or a value whose validity depends on another, are held locally behind an unsaved-changes bar with Save and Discard: edited cells are marked, Save is blocked while any edit is invalid with a summary of what to fix, valid edits are never dropped, and leaving asks first `[PATH-TABLE-COMMIT-BATCH]`. A click or Enter on a focused cell enters edit mode, Esc cancels and restores, Enter commits, and the edit state has a visible border; use `role="grid"` only with arrow-key cell navigation `[PATH-TABLE-INLINE-EDIT]`.
- **Loading, empty, and error states.** First load: real column headers and skeleton rows matching the loaded widths, never a full-area spinner `[PATH-TABLE-STATE-LOADING]`. Refetch: keep the stale rows with a small busy indicator `[PATH-TABLE-STATE-REFETCH]`. Empty, first use: an EmptyState with the create action, headers stay. Empty, filtered: an inline message with Clear filters, not a full EmptyState. Empty by nature (no live calls, no open issues): say so plainly, no call to action. Empty by permission: say access is the reason and who can grant it, no create action. Results limited by plan: a notice above the table with the upgrade action `[PATH-TABLE-STATE-TRUNCATED]`. Load failure: an inline panel in the table area with the cause and Retry while toolbar and headers stay, never a modal `[PATH-TABLE-STATE-LOAD-ERROR]`. Rows support default, hover, focus-visible, selected, active (drawer open), editing, saving, error, just-added, and disabled or archived states, none relying on color alone `[PATH-TABLE-ROW-STATES]`.
- **Errors.** A failed row action rolls back an optimistic update, marks the row, offers Retry, and anchors the failure to the row `[PATH-TABLE-ERROR-ROW-ACTION]`. An invalid cell shows its message next to the field (under it in a drawer form, in a tooltip or popover for a cell), validates on commit or blur, tints the cell with an icon, and keeps what the user typed `[PATH-TABLE-ERROR-CELL]`. A partly failed bulk or import operation shows an Inline Alert above the table with counts (not an Alert Banner), marks failed rows in the gutter, offers a "show only rows with errors" toggle and the choice to continue with the ready rows, and exports failed rows when they can't be fixed in place `[PATH-TABLE-ERROR-BULK-PARTIAL]`. On any failure move focus to the first error, announce through an `aria-live="polite"` region, and never clear the user's data `[PATH-TABLE-ERROR-FOCUS]`.
- **Narrow screens** (below the `sm` container width, `40em`) `[PATH-B-NARROW]`. With 4 or fewer columns, rows stack: the first column is the title, up to three more values sit under or beside it, status is a Badge, and the whole row is the tap target `[PATH-TABLE-NARROW-ROW]`. With more than 4 columns the table scrolls horizontally with the first column and header pinned. A row opens a full-width drawer with a back control instead of a close control, and big records still escalate to a full page `[PATH-TABLE-NARROW-OPEN]`. Selection is a mode: an explicit Select action shows the checkbox column, the header shows "N selected" with Select all and Cancel, the bulk bar sits at the bottom with 2 to 4 actions (destructive last), and a destructive action confirms with the count `[PATH-TABLE-NARROW-SELECT]`.
- **Structure.** Use a real table element with `th` and scope, never divs; the sortable header is a button inside the `th` `[PATH-TABLE-SEMANTICS]`. The first-column value is the real link or button, the row click is an enhancement, and clicks on checkboxes, menus, and links inside the row don't open the drawer `[PATH-TABLE-ROW-CLICK]`. Expandable rows use a leading chevron button with `aria-expanded`; if the detail is a full record, use the drawer `[PATH-TABLE-EXPAND-ROWS]`.

### PATH C — Form (Create/Edit)

**When to use:** creating a new item, editing an existing one, or completing a multi-step workflow.

**Complexity tiers:**
- 1–6 fields (simple): single column, stack vertically, no grouping, `gap-6` (24px) between fields.
- 7–15 fields (medium): single column or up to 2 columns (see Field groups below), group related inputs under section headers (e.g. an address group), `gap-6` between fields within a section, `gap-10` (40px) between sections.
- 15+ fields or complex relationships: tabs, or 2 columns with sections (e.g. event creation: basic info left, advanced settings right).
- Long forms with independent sections: allow per-section editing rather than one whole-form edit state.

**Form states:** view (default) shows label + value stacked or side-by-side, full-width border per item, read-only, with a status label ("Completed", "Needs review", "Pending review", "Updated"). Edit (explicit action) makes inputs editable; primary button enables only when all required fields are valid; conditional logic disables child inputs until their parent input is valid; expanded accordion items show a leading icon + text on action buttons.

**Field labeling:** input labels use H5; helper text uses the Description style. Example structure: H5 label ("Email address") + Description helper text ("We'll send a confirmation link here") + input (up to `--width-field-max`) + validation error ("Please enter a valid email").

**Field grouping:** section header (H4, e.g. "Billing address") + optional description ("Where invoices should be sent") + the grouped inputs underneath.

**Validation and errors:** reserve space for helper text so the form doesn't shift when an error appears; helper text sits below the input at rest. Field-level errors use Helper Text attached to the field (Inline Alerts are for page sections, not single fields) and state what went wrong plus what to do next — not just "Invalid password," but "Password must be at least 8 characters."

**Binary choices:** only 2 dropdown options available → use radio buttons instead (stacked or inline), e.g. yes/no, accept/decline.

**Confirmation and cancellation:** cancel/delete on a form with no user data happens immediately, no confirmation needed. Cancel/delete on a form with entered or autofilled data shows a double-confirmation modal warning that unsaved data will be lost (e.g. "Discard changes?" / "You have unsaved changes. If you leave now, they'll be lost." / Discard [destructive] / Keep editing [default]).

**Save behavior:** create → save creates the record, show a toast/banner confirmation, optionally redirect or stay with a success message. Edit → save updates the record, refreshes the form with updated values, shows a success toast. Multi-step → each step validates before advancing; buttons are "Next" + "Back" (optionally "Save for later"); show a step indicator ("Step 2 of 5").

**Field groups** (widths, columns, and common groups):
- **Widths and columns.** Cap the form container at `--width-form-max`; the layout holds down to `--width-viewport-min` with no horizontal scroll `[PATH-FIELD-CONTAINER]`. Single-line inputs and selects fill their column up to `--width-field-max`; short fixed-format values (postal code, state code, expiry, security code) cap at `--width-field-narrow` and never stretch; textareas may fill up to `--width-form-max` `[PATH-FIELD-WIDTH]`. At most two columns, pairing only related fields of similar length (first and last name, state and postal code); address line 1, email, phone, and textareas sit alone; dialogs are always one column; visual order equals tab order `[PATH-FIELD-COLUMNS]`. Two columns become one when the form's container is narrower than the `sm` value (`40em`), by container query so forms in drawers wrap correctly `[PATH-FIELD-WRAP]`. Column gap is `gap-6`, or `gap-10` when the DENSITY dial is 3 or lower `[PATH-FIELD-COLUMN-GAP]`. If most fields are required, mark the optional ones "(optional)" `[PATH-FIELD-LABEL]`.
- **Name and address.** First and last name as a pair, or one full-name field only when the product treats the name as one string `[PATH-FIELD-NAME]`. Address order is country, line 1, line 2, city, then state or province paired with postal code; country goes first because it decides which fields appear, and changing it re-labels and re-validates without clearing typed values; in settings line 2 is a visible optional field, in short flows it may collapse behind "Add apartment, suite" `[PATH-FIELD-ADDRESS-ORDER]`. Never three fields in one row, and set `autocomplete` on every address field `[PATH-FIELD-ADDRESS-PAIRS]`.
- **Phone and email.** Phone is one joined control on one row sharing one label: a country Combobox at `w-24` plus the number input, capped at `--width-field-max`, formatting as the user types, with a telephone keypad and international storage `[PATH-FIELD-PHONE-CONTROL]` `[PATH-FIELD-PHONE-INPUT]`. Email uses the default width, an email keypad, and `autocomplete="email"`; in account settings it follows the identity-field rule `[PATH-FIELD-EMAIL]`.
- **Text areas and chat.** A multi-line field grows with its content using CSS `field-sizing: content`, never JavaScript; it starts at `--textarea-min-lines`, stops at `--textarea-max-lines`, and scrolls inside after that `[PATH-FIELD-TEXTAREA-AUTOSIZE]`. An AI chat input uses the same pattern with the chat line tokens, is anchored to the bottom of the thread so growth pushes upward, fills its container, and the chat container uses `dvh` `[PATH-FIELD-CHAT-INPUT]`.
- **One-time code.** InputOTP with one cell per character that behaves as one field: one tab stop, paste fills every cell, backspace moves back, `autocomplete="one-time-code"`, a numeric keypad for digit codes, and a visible label. Cells share the row with `gap-2`, cap at `size-12`, and the group caps at `--width-field-max` and is one hit area of at least `--hit-area-min` `[PATH-FIELD-OTP-INPUT]`.

**Mobile:** active input field stays visible while the keyboard is present; `--width-field-max` on inputs/dropdowns; dropdowns become action sheets (see PATH D).

### PATH D — Dialog / Action Sheet

**When to use:** a single quick input (amount, selection, confirmation), a simple yes/no confirmation, or a dropdown selection — especially on mobile.

**Breakpoint behavior:** desktop → centered modal dialog with a dimming backdrop. Mobile → action sheet that slides up from the bottom (one-hand operation); multi-step content covers 80–90% of screen height.

**Never use an action sheet if text input/keyboard is required** — that needs a full modal. Action sheets are for number input (spinner/quantity control), sliders, dropdown selection, and binary confirmation only.

**Structure:** header (H2 title, optional description, close button top right on desktop / top center on mobile) → body (single input field or simple content, max width per breakpoint) → sticky footer (button group, right-aligned on desktop / stacked on mobile: primary on the right, secondary `gap-5` (20px) to its left, optional tertiary/ghost link on the far left).

**Dialog width** `[PATH-D-SIZE]` (desktop; both widths are maximums set by tokens, and every dialog is one column): small, `--width-dialog-sm`, for confirmations, AlertDialogs, typed confirmation, and dialogs with one or a few stacked fields; large, `--width-dialog-lg`, for content that needs the extra width, such as a textarea or a short list. Pick by what the content needs, not by whether it contains an input. Two-column layouts go on pages, not in dialogs, and a flow that needs steps or more room becomes a page. On mobile, dialogs that take text input are full modals at the viewport width. Destructive confirmations follow `JOB-CONFIRM-DESTRUCTIVE`; deleting a workspace, team, or account adds typed confirmation (see Settings interactions).

**Confirmation dialog example:** Title "Delete invoice?" / Description "This can't be undone. All associated records will be removed." / Secondary button "Cancel" / Primary destructive button "Delete invoice."

**Selection dialog example:** Title "Select payment source" / dropdown or list of options / Secondary "Cancel" / Primary "Continue."

### PATH E — Detail Page (Read-Only / View State)

**When to use:** viewing a single record read-only, with no editing at this level — editing happens on a dedicated form page the user clicks through to.

**Structure:** breadcrumb above the title (Home > Items > [Item Name]) → H1 page title → close/back button top right if in a modal → body of grouped data stacked vertically (label + value per group, with status badges where relevant) → actions (view-only has no primary action; an "Edit" link/button navigates to the form page; archive/delete appear as secondary/destructive buttons).

**Mobile:** stacked single column, no horizontal grouping.

---

### PATH F: Pricing Page

**When to use:** showing what a product costs and helping a buyer pick a plan. Answer four questions first: what is the billing unit (seat, usage, seat + usage, flat), how many tiers are real, who is buying (one person, a team lead, procurement), and is there a sales-led tier. If there is one, it gets "Custom" in the price slot. If there isn't, don't fake it.

**Layout by billing model:**
- **Flat** `[PATH-F-FLAT-1]`: one centered card with price, unit, period, 4 to 8 numeric features, one CTA, and a small secondary path for big buyers.
- **Seat-based** `[PATH-F-SEAT-1]` `[PATH-F-SEAT-3]` `[PATH-F-SEAT-4]`: price per seat with the period, included seats, and caps disclosed. Add a seat quantity control (minus and plus around a number) on the card when count changes the price. With four plans, add a comparison table below the cards.
- **Usage-based** `[PATH-F-USAGE-1]` `[PATH-F-USAGE-TIERED]` `[PATH-F-USAGE-PAYG]`: never show only a per-unit rate. Add an estimator in the buyer's unit (slider plus number input, rate table, itemized total labeled "estimated") that defaults to a realistic value, not zero.
- **Hybrid** `[PATH-F-HYBRID]`: cards show base price and allowance; a calculator (plan, seats, usage, add-ons, total) shows the real bill with monthly and annual totals.
- **Consumer** `[PATH-F-CONSUMER-WEB]` `[PATH-F-CONSUMER-PAYWALL]`: selectable plan cards with one Continue button, monthly equivalent next to the real charge, and a trial timeline. On iOS, always show Restore Purchases, Terms, and Privacy.

**Tier count:** 1 tier is a single centered card. 2 tiers works best as "me vs us" or "free vs paid", highlighting the paid one. 3 tiers is the default, highlighting the middle. 4 tiers only if the fourth is a real sales-led tier. 5+ only for consumer products with distinct benefit stories, using tabs or a carousel, never a wide row.

**Rules that apply to every pricing page** (`[PATH-PRICE-U1]` to `[PATH-PRICE-U14]`):
- Show price, unit, and billing period together as one lockup.
- The annual toggle states its savings, and every number on the page changes when it flips.
- One highlighted tier, never two, and only that tier gets the primary button.
- CTA text matches the friction ("Start free", "Start free trial", "Talk to sales"), not "Get started" everywhere.
- Use "Everything in X, plus:" on every tier above the first, and write limits as numbers, not adjectives.
- Define any term that changes the bill (for example standard users vs end users).
- Below the cards: comparison table (3+ tiers), FAQ, reassurance line. On mobile, stack the recommended tier first.

**Evidence and routing:** based on pattern review of about 45 screens, with no conversion data. Paywall timing, placement, and trial-vs-no-trial are outside this section and belong to a conversion-focused skill. The full rule set (`[PATH-PRICE-*]`, don'ts, checklist, reference screens) lives in `references/pricing-pages.md` in the full version.

### PATH G — Marketing Page (landing page, homepage) `[PATH-G]`

**When to use:** showing people what a product or business offers before they sign up. These are taste rules for marketing surfaces, from one reference site and one mockup; they suit a short, focused page. A pricing page (PATH F), a docs page, or an app screen can break them for good reasons. Marketing pages sit in the spacious density tier. Words go to Righter (which owns the slot limits), type scale and spacing to `vois-tokens` (`DS-MKT`), component picks to `vois-components`.

**The pattern:** every feature block is the same stack: image tile, short title, one or two sentences, one underlined link. Sections are far apart and the text inside them is close together. Spacing alone doesn't make a page breathe; less content per section does.

**Rules:**
- **One idea per section** `[PATH-G-SECTION]`: one heading, one block of content, one link. Two headings means two sections.
- **Three blocks max** `[PATH-G-BLOCKS]`: no row or stack has more than three blocks. Group extras (five programs become three audience tiles) and move detail behind a link. Three is a ceiling, and the blocks should still differ in size or emphasis.
- **Detail goes behind a link** `[PATH-G-DETAIL]`: full schedules, bios, and long FAQs get their own pages. The homepage shows a taste: about 5 schedule rows, one coach sentence, 3 questions, each linking to the rest.
- **Image tile first** `[PATH-G-TILE]`: a large rounded tile (at least 300px tall on mobile), then the title, then one or two sentences, then one link.
- **No dividers** `[PATH-G-DIVIDERS]`: no hairlines, boxes, or borders between sections. If they blur together, increase the gap.
- **Left-align by default** `[PATH-G-ALIGN]`: center only the closing call to action.
- **One primary button per view** `[PATH-G-CTA]`: a secondary button only in the hero, the primary call to action at most twice (hero and close), everything else a plain link, one label for the action across the page.
- **Footer** `[PATH-G-FOOTER]`: repeat the nav at heading scale (large h2 links plus the wordmark); small print stays small.

**Before shipping:** each section has one heading, one block, and one link; no row has more than three blocks; no dividers; section gaps are at least 4x the heading-to-content gap; no more than two primary calls to action; left-aligned except the closing call to action; long lists show a taste and link out.

---

## Permissions, Visibility, and Conditional Logic

Cross-cutting rules that apply across every container type above.

**Hide by role** `[PATH-PERM-HIDE-BY-ROLE]` — remove page elements entirely (not just disable) if the user's role can't see them: e.g. hide "Members" if not admin, hide "Billing" if not workspace owner. Check role at render time; don't render the element at all.

**Disable by permission or condition** `[PATH-PERM-DISABLE-BY-CONDITION]` — for content the user can't update due to org settings or cascading choices, keep the element visible but disabled, so the user can visually map cause and effect. E.g. a disabled payment-method select with helper text "Edit your billing plan to change payment method."

**Parent/child input dependencies** `[PATH-COND-PARENT-CHILD]` — disable child inputs until the parent input has a valid value; show them disabled but visible, with a helper explaining why (e.g. "Select a payment method first").

**Primary button state** `[PATH-COND-PRIMARY-BUTTON]` — disable the primary button until all required fields are valid; on hover, show a tooltip like "Fill in all required fields to continue."

**Personal data (PII)** — mask by default: when a list, table, card, or header shows personal data (email, phone, street address, date of birth, government ID, payment number) to someone whose task doesn't need the full value, show a masked value (`j***@acme.com`, `•••• 4821`). A name stays visible on a screen whose job is that person. Show the full value only on a detail view, only to roles that need it, and mask on the server so the full value never reaches the page for roles that can't see it; CSS blur is not masking `[PATH-PERM-PII-MASK]`. Reveal on request: put a reveal control on that one field (an icon button labelled "Show email"), re-mask when the user leaves the view or after a timeout, log reveals of high-risk fields (government ID, payment, health data) on the server, and let copy to clipboard copy the full value only for roles that may reveal it `[PATH-PERM-PII-REVEAL]`. Keep it out of URLs, titles, file names, and analytics: use opaque IDs (`/customers/c_8f2a`, not an email), show a name in a title or breadcrumb only on a screen whose job is that person, name exports by content and date, and give analytics IDs, never values `[PATH-PERM-PII-KEEP-OUT]`. Copy rules are in Righter (`no-pii-in-copy`).

**Cascading accordion/expansion** `[PATH-COND-ACCORDION-EXCLUSIVE]` — only one expandable form in a layout stays open at a time; opening a new one auto-collapses the previous.

**Accordion/expandable items** — collapsed state shows icon-only edit/remove buttons anchored right of the header, with tooltips on hover ("Edit", "Delete"). Expanded state shows those same buttons with a leading icon plus text for greater clarity ("Edit section", "Remove item").

**Simple calculation tables** `[PATH-COND-CALC-TABLE-ROWS]` — inline inputs and dropdowns in a table that dynamically updates a total (e.g. quantity input + product dropdown → calculated line total). Header row acts as the field label. Never stack more than 4 rows.

---

## Composing Existing Primitives

Before designing new structure for a brief that names its own feature ("approval queue," "impersonate a user," "bulk edit") instead of one of the container types above:

1. **Check for a direct fit first.** Translate the brief into a plain job-to-be-done and re-check it against the decision tree — most briefs that sound novel because of their product-specific name are a direct fit once translated (an "approval queue" is PATH-B: browse/filter/act on a list).
2. **Combine two existing patterns before inventing a third.** A brief needing more than one container type's job at once should compose the existing ones: an approval queue is PATH-B (browse) + PATH-D (approve/reject dialog from a row); a multi-step form with a review step is PATH-C (input steps) + PATH-E (a read-only review step); bulk edit from a list is PATH-B (selection) + PATH-C-SIMPLE (shared-field form) + PATH-D (dialog). If you can't name which existing pattern is doing each part of the job, that's the signal for step 3.
3. **Invent new structure only as a last resort, and say so.** Name which existing patterns were considered and why they didn't fit. A pattern invented this way is a one-off for the brief in front of you, not automatically a new entry in this skill.

## Content Density: Dense, Standard, Spacious

How much breathing room a screen should have is a decision, not a default — pick a tier deliberately rather than letting every screen land on the same mid-range spacing.

- **Dense** — power users/admins doing this repeatedly, scanning or comparing many rows at once, screen real estate at a premium (admin data grids, analytics tables, dashboards, log views). Lean toward the tighter end of the spacing scale, more columns/metrics visible, smaller non-body type sizes where typography rules still allow it.
- **Standard** — the default for most product surfaces: forms, settings pages, typical list/detail views. Mid spacing scale (24px between fields, 40px between sections) — this is correct absent a specific reason to reach for dense or spacious.
- **Spacious** — low-frequency, high-stakes, or attention-focusing moments: onboarding/first-run, empty states, a destructive-confirmation dialog, marketing/landing surfaces (see PATH G). Looser spacing, fewer things visible at once, more whitespace around the one thing that matters — optimizing for focus, not efficiency.

This is a different decision from the card-ification anti-pattern (wrapping every static section in an unearned bordered card, see `vois-tokens`) — density is about spacing and information-per-screen, independent of which container is used.

---

## Page Templates `[PATH-PAGE]`

Whole-page skeletons for consumer and SaaS web products, in five levels. This is the layer above the container patterns: `PATH-A` to `PATH-G` say how one container behaves, a page template says which containers a page holds, in what order, and what happens to them at each width. A template is a skeleton. It decides regions, order and responsive behavior, not content, words or token values. Where a template and the path it routes to disagree, the routed path wins. Words go to Righter. Sizes are token names from `vois-tokens`, never pixel values.

**Using it:** decide the level and product type, read that template's entry below, follow its routed paths for content and the cross-cutting rules for width, navigation, density, overlays and buttons, then check the page at phone, tablet and desktop.

**Levels** `[PATH-PAGE-LEVELS]`: 0 Entry (front door, gets a signup), 1 Hub (where people land after signing in, or a page that sells one thing), 2 Index (a list of things in one section), 3 Detail (one thing in full), 4 Utility (visited rarely: settings, team, invoices, contact). Each page knows its parent. Back goes up exactly one level. Desktop shows the trail (Dashboard, Section, Item). Phone shows a back control to the parent and the page title.

### Cross-cutting rules

- **Page widths** `[PATH-PAGE-BREAKPOINTS]`: phone is below roomy (768px), tablet is roomy up to wide (768px to 1023px), desktop is wide and up (1024px). Check every template at all three. For grids, phone splits in two at 600px (the `snug` grid class), so check phone at 360px and at 600px too. Grid and panel rules are in `vois-tokens` (`DS-GRID-*`, `DS-PANEL-*`).
- **App shell navigation** `[PATH-PAGE-NAV]`: desktop has a labeled sidebar, tablet an icon rail, phone a bottom tab bar with at most five slots, the last being More. The settings section menu is separate and follows PATH-A. A marketing top bar shows its links at the wide class and up and folds them into one menu control below that. The signup button stays visible at every width.
- **Density by page** `[PATH-PAGE-DENSITY-MAP]`: marketing and landing pages are Spacious, always looser than the product itself. Pricing, contact, consumer app screens, forms, settings and everyday lists are Standard. Dashboards, analytics tables, data grids and inboxes are Dense on desktop.
- **Dense is for pointers only** `[PATH-PAGE-DENSITY-TOUCH]`: on touch widths rows go back to regular height, targets reach `--hit-area-min`, and gaps between blocks go up one step. Fewer rows fit and that is accepted. A SaaS screen is tighter on desktop than on a phone, never the other way round.
- **Which overlay opens** `[PATH-PAGE-OVERLAY]`: a yes or no, or a pick, is a modal on desktop and an action sheet on phone. Any text field is a modal on desktop and full screen on phone, never an action sheet. Editing or previewing a row, or filters, is a right panel on tablet and desktop and full screen on phone. Notifications are a right panel. Always keep a visible way back. Escape or the scrim closes it on desktop.
- **Button order** `[PATH-PAGE-BUTTON-ORDER]`: primary is rightmost, secondary to its left, then tertiary or ghost. When buttons stack on phone, primary is on top. One primary per group. In a step flow, Back sits alone at the far left of the footer and the buttons on the right follow the same order (Skip, then primary). Buttons in a footer or sticky bar are right-aligned with the 20px gap step between them (16 to 24px allowed), never spread to the two edges or stretched to fill the bar.
- **View to edit on the same page** `[PATH-PAGE-VIEW-EDIT]`: open in view state. Edit is an explicit action that swaps the same fields to inputs in place, and Save and Cancel replace Edit. Leaving with unsaved changes opens a Discard confirmation (action sheet on phone). On phone Save sits in a sticky bar.
- **Tables at narrow widths** `[PATH-PAGE-TABLE-WIDTH]`: do not hide columns. Follow PATH-B-NARROW: four columns or fewer stack as list rows, more scroll sideways inside the table with the first column and header pinned. The page itself never scrolls sideways.
- **Sort and filter position** `[PATH-PAGE-SORT-FILTER]`: pin Filter and Sort to the top right of the table, list or card grid, on the same row as the search field, which sits on the left. Filter is left of Sort, so Sort is the rightmost control. The position is the same at phone, tablet and desktop. On phone they stay on that top row as two compact buttons, not in a bottom bar. Other toolbar controls (Columns, row height, view toggles, Export) sit to the left of Filter. Filter opens a right panel on tablet and desktop and a full screen panel on phone. Where a layout has a persistent filter sidebar, Filter still sits top right and shows or hides the sidebar. The Sort button must always exist, because stacked rows and card grids have no column headers (a sortable header may also sort, `[PATH-TABLE-SORT]`). A table that cannot be sorted or filtered, such as a short summary table that links to the full list, has neither control.

**Density at each width.** Dense: rows `--table-row-h-dense` and tight gaps on desktop, regular rows, `--hit-area-min` targets and gaps up one step on phone and tablet. Standard: regular rows and mid gaps everywhere, the side gutter drops to the phone gutter. Spacious: far apart sections and large type on desktop, gaps one notch smaller on phone and tablet but still looser than Standard, targets `--hit-area-min`.

### The layout field

Each template below ends with its layout. `shell` is `app` (bottom bar, then rail, then sidebar) or `site` (no side nav). `frame` is `contained` (the content max applies) or `fill` (a dense page that fills the region). `regions` sit side by side from the named window class (`narrow` 360, `snug` 600, `roomy` 768, `wide` 1024) and stack below it. `grids` are equal-track grids with the most columns per class, as narrow/snug/roomy/wide. `panels` have a mode (push, overlay or two-pane), a size token, the class they start at, and what happens below it (fullscreen, detail-page, inline-row or push-screen). Caps at narrow and snug refine the phone text: phone text describes narrow, and snug may hold more columns. Overlay panel size tiers and the marketing logo caps above the phone are proposals, not findings from the references. A two-pane panel starts by `DS-PANEL-007`, not by its `from` class.

### Template index


**`[PATH-PAGE-MARKETING-HOME]` Marketing home** (level 0 Entry, both, Spacious; routes to `PATH-G`)
- The front door. One job: explain the product and get a signup. Navigation: Top bar with four links, a log in link, and one signup button. Under 1024px the links fold into a menu button. The signup button stays visible at every width.
- Phone: Single column. Buttons stack to full width. Logos wrap to three per row. Plans stack, so put the recommended plan first. Footer links sit in two columns. Tablet: Hero stays stacked with the product shot under the text. Feature cards go two across. Pricing keeps three plans side by side. Desktop: Two column hero. Features three across. Split sections put image and text side by side. Five column footer.
- Layout: shell site, frame contained; regions hero-text 1fr from wide, hero-media 1fr from wide; grids features --item-min-story up to 1/2/2/3, logos --item-min-logo up to 3/4/6/8, plans --item-min-plan up to 1/1/3/3.
- The hero heading is the biggest type on any page here, and sections sit far apart on desktop.

**`[PATH-PAGE-FEED]` Feed home** (level 1 Hub, consumer, Standard)
- The home screen of a consumer app. It scrolls without end and mixes posts, media, and suggestions. Navigation: Labeled left nav on desktop, an icon rail on tablet, and a bottom tab bar on phones. Create moves to a floating button on phones.
- Phone: Top bar plus a bottom tab bar with five items. The feed fills the width. The right rail goes away, so move trending and suggestions into a Search tab. Tablet: Icon rail on the left with the feed centered at about 600px. The right rail is hidden. Desktop: Three columns: labeled nav, feed, and a right rail with search, trending, and people to follow.
- Layout: shell app, frame contained; regions feed --measure-feed from roomy, right-rail --region-right-rail from wide.
- Standard, not Spacious: people scroll fast and want several posts in view.

**`[PATH-PAGE-DASHBOARD]` Dashboard** (level 1 Hub, saas, Dense)
- The landing page inside a SaaS product. It answers what changed and what needs attention. Navigation: Left sidebar with labels on desktop, an icon rail on tablet, a bottom tab bar on phones. Search and account sit in the top bar.
- Phone: Sidebar becomes a bottom bar with four tabs and More. Metrics go two across. Chart and activity stack. The table turns into stacked rows: name as the title, with status and the other values under it. Nothing is dropped. Tablet: Icon rail. Metrics two across. Chart takes the full width with activity underneath. The table keeps all its columns. Desktop: Full sidebar. Four metrics in a row. Chart takes two thirds with activity beside it. Full table.
- Layout: shell app, frame fill; regions chart 2fr from wide, activity 1fr from wide; grids metrics --item-min-card up to 2/2/2/4; panels notifications overlay --panel-overlay-sm from roomy, below it fullscreen.
- View all goes to the Records section, then a row goes to the record. A table row on the dashboard skips the section and jumps straight to the record. That shortcut is fine, but the breadcrumb on the record should still show where it lives. The bell opens a side panel and Create opens a modal. Dense on desktop for scanning many metrics. On touch widths the same screen gets regular rows and more space between blocks.

**`[PATH-PAGE-COLLECTION]` Collection table** (level 2 Index, saas, Standard; routes to `PATH-B`, `PATH-B-SIMPLE`, `PATH-B-NARROW`, `PATH-B-ROW-OPEN`)
- A list of records people scan, filter, and act on in bulk. Navigation: Same sidebar shell. Search sits left in the toolbar above the table. Filter and Sort are pinned top right. A row opens a preview panel on desktop and a full detail page on smaller screens.
- Phone: Rows turn into stacked cards with the name, status, and one line of detail. Filter and Sort stay pinned top right. Filter opens a full screen panel because filters include text fields. New record becomes a floating button and opens full screen, since it has text inputs. Tablet: Table has four columns on every width, so nothing is hidden. Filter and Sort stay pinned top right, with applied filters as chips under the toolbar. No preview panel, so rows open the detail page. Desktop: Full table with checkboxes. Applied filters show as chips under the toolbar. Preview panel on the right.
- Layout: shell app, frame contained; panels preview push --panel-push-default from wide, below it detail-page, quick-edit overlay --panel-overlay-md from roomy, below it fullscreen, filter overlay --panel-overlay-sm from roomy, below it fullscreen.
- Three ways into one record. Click a row for the full page, click the end icon for a quick edit in a side panel, or use New record for a modal. Pick by size of the task: a few fields is a modal, an edit that needs the list for context is a panel, anything long or linkable is a page. Standard by default. A power-user version of this list can switch to Dense.

**`[PATH-PAGE-BROWSE]` Browse grid** (level 2 Index, consumer, Standard)
- A browsable grid of items. People narrow it down, then pick one. Navigation: Top bar with category links on desktop. Links fold into a menu and search drops to its own row on phones. Filters live in a sidebar on desktop and in a drawer below that. Filter and Sort are pinned top right of the grid at every width, and on desktop Filter shows or hides the sidebar.
- Phone: Two cards per row. Filter and Sort stay pinned top right above the grid. Filter opens a full height sheet. The apply button shows the result count. Tablet: Three cards per row. Applied filters show as chips above the grid. Filter opens a right drawer. Desktop: Filter sidebar on the left with four groups. Four cards per row.
- Layout: shell site, frame contained; regions filters --region-filters from wide; grids products --item-min-card up to 2/3/3/4; panels filter-drawer overlay --panel-overlay-sm from roomy until wide, below it fullscreen. The product cards sit beside the filters region on wide windows, so measure the card area and pass its width as containerW (DS-GRID-006, DS-GRID-007).
- Filter opens a right drawer on tablet and a full height sheet on a phone. On desktop the sidebar is open by default and Filter shows or hides it, so there is no drawer. Standard: shoppers compare several items at once.

**`[PATH-PAGE-PRODUCT]` Product detail** (level 3 Detail, consumer, Standard)
- One item, with everything needed to decide and buy. Navigation: Same top bar as the browse grid. A breadcrumb sits above the gallery on tablet and desktop. Add to bag stays reachable: in the buy box on desktop, in a sticky bar on phones.
- Phone: Gallery swipes with dots. Details sit in accordions. Price and Add to bag live in a sticky bar at the bottom. Tablet: Gallery and buy box side by side, thumbnails under the main image. Details switch to tabs. Desktop: Thumbnails run down the left of the main image. The buy box is about 380px wide on the right.
- Layout: shell site, frame contained; regions gallery fluid from roomy, buy-box --region-buy-box from roomy.
- Standard, with a roomier buy box because this is the moment of decision.

**`[PATH-PAGE-RECORD]` Record detail** (level 3 Detail, saas, Standard; routes to `PATH-E`, `PATH-SET-VIEW-EDIT-BLOCK`)
- One record in a SaaS product, such as a customer, a job, or a service. It shows status and lets people act. Navigation: Breadcrumb back to the list. Tabs split the record into views. Properties sit in a side panel on desktop and fold into a row elsewhere.
- Phone: A back link replaces the breadcrumb. The primary action sits under the title and the rest go in an overflow menu. Tabs scroll sideways. Properties fold into one row. Tablet: Primary action and overflow in the header. Properties fold above the content. Facts go two across. Desktop: Three actions in the header. Properties panel on the right, at the default push panel width. Facts go three across.
- Layout: shell app, frame contained; regions content fluid from wide; panels properties push --panel-push-default from wide, below it inline-row. Facts go two across on tablet and three on desktop. Not listed in collections because no item token is set for them yet.
- Two ways to edit. Inline edit changes one field in place, with no mode change. Edit mode flips the whole page to inputs. Pick inline when the change is small and safe. Pick the mode when people edit several fields together and need one Save. Cancel with changes always asks before throwing them away.

**`[PATH-PAGE-SETTINGS]` Settings** (level 4 Utility, both, Standard; routes to `PATH-A`, `PATH-A-DEPTH-DEEP`, `PATH-SET-VIEW-EDIT-BLOCK`)
- Where people change how the product works for them or their team. Navigation: Settings has its own sub navigation. It is a vertical list on desktop, tabs on tablet, and a list screen that drills into each section on phones.
- Phone: The section list moves behind a hamburger at the top of the page, and the page shows one section at a time (PATH-A). Fields are one column. Cancel and Save sit in a sticky bar, right-aligned with 20px between them and Save rightmost. Tablet: Sub navigation becomes tabs across the top. Fields go two across. Desktop: Sub navigation list on the left at 200px. Content is capped near 640px so lines stay readable. Save buttons sit at the end of the form.
- Layout: shell app, frame contained; regions subnav --region-subnav from wide, content --measure-settings from wide.

**`[PATH-PAGE-PRICING]` Pricing** (level 1 Hub, marketing, Standard; routes to `PATH-F`)
- Helps a visitor pick a plan and commit. It also answers the objections that stop a signup. Navigation: Same marketing header. The plan cards carry the main actions, and the closing band repeats them. Under 1024px the header links fold into a menu button.
- Phone: Plans stack one per card. Put the recommended plan first. The comparison table shows one plan at a time, chosen with a row of plan buttons above it. Tablet: Plans go two across. The comparison table shows all four plans in narrow columns. Desktop: Four plan cards in a row with the recommended one outlined heavier. Full comparison table with grouped rows.
- Layout: shell site, frame contained; grids plans --item-min-plan up to 1/1/2/4.
- Pricing is a landing page that has to be compared, so it sits at Standard, not Spacious.

**`[PATH-PAGE-FEATURE]` Feature page** (level 1 Hub, marketing, Spacious; routes to `PATH-G`)
- Explains one part of the product in depth. It sits between the home page and the signup. Navigation: Same marketing header. The page is one long scroll. Each section ends in a soft link, and the closing band holds the main action.
- Phone: Everything stacks. Each feature row shows its screenshot first, then the text. Integrations show four across. Tablet: Feature rows stay stacked. Benefits go three across and integrations six across. Desktop: Feature rows alternate screenshot and text side by side. Integrations eight across.
- Layout: shell site, frame contained; regions feature-text 1fr from wide, feature-media 1fr from wide; grids integrations --item-min-icon-tile up to 4/6/6/8. Benefits go three across on tablet. Not listed in collections because no item token is set for them yet.

**`[PATH-PAGE-CUSTOMERS]` Customer stories** (level 2 Index, marketing, Spacious; routes to `PATH-G`)
- The proof page. It collects testimonials and case studies so visitors can find one that looks like them. Navigation: Same marketing header. Industry chips sit on the left and Filter and Sort are pinned top right of the story grid. Each card links to a full case study.
- Phone: Hero stats sit under the heading. Chips scroll sideways. Story cards and quotes run one per row. Tablet: Story cards and quotes go two across. The featured story keeps the image above the text. Desktop: Hero text beside a stat list. Featured story split into image and text. Story grid three across. Quote wall two across.
- Layout: shell site, frame contained; regions hero-text 1fr from wide, hero-stats 1fr from wide; grids stories --item-min-story up to 1/2/2/3, quotes --item-min-story up to 1/2/2/2.

**`[PATH-PAGE-BLOG-INDEX]` Blog index** (level 2 Index, marketing, Spacious; routes to `PATH-G`)
- Lists articles and helps readers find the ones they care about. Also grows the newsletter. Navigation: Same marketing header. Category chips sit on the left and Filter and Sort are pinned top right of the post grid. Search sits beside the title on tablet and desktop and moves into the menu on phones.
- Phone: Featured post on top, then the New list, then one post per row. Chips scroll sideways. Newsletter signup stacks. Tablet: Posts go two across. The New list sits under the featured post. Desktop: Featured post takes two thirds with the New list beside it. Posts three across.
- Layout: shell site, frame contained; regions featured 2fr from wide, new-list 1fr from wide; grids posts --item-min-story up to 1/2/2/3.

**`[PATH-PAGE-CASE-STUDY]` Case study** (level 3 Detail, marketing, Spacious; routes to `PATH-G`)
- One customer story told as a problem, a fix, and a result. Numbers go first. Navigation: Breadcrumb back to Customer stories. Company facts sit on the left on desktop. The closing band and more stories keep the visitor moving.
- Phone: Breadcrumb hides. Stats stack one per row. Company facts fold into a two by two block above the story. Tablet: Stats three across. Company facts fold into a four across row above the story. Desktop: Header text beside a photo. Three stats in a row. Company facts in a left column and the story capped near 680px.
- Layout: shell site, frame contained; regions company-facts --region-company-facts from wide, story --measure-article from wide. The three stats go three across on tablet and desktop. Not listed in collections because no item token is set for them yet.

**`[PATH-PAGE-ARTICLE]` Blog post** (level 3 Detail, marketing, Spacious; routes to `PATH-G`)
- One long read. Built for comfortable reading, then a next step. Navigation: Same marketing header. A contents list helps readers jump around. Related posts and the closing band follow the article.
- Phone: Header and hero image full width. Contents fold into one row at the top. Share icons move under the article. Tablet: Same as phone with a wider reading column. Contents stay folded. Desktop: Share icons on the left, article in the middle at about 680px, contents and tags on the right.
- Layout: shell site, frame contained; regions share auto from wide, article --measure-article from wide, contents --region-contents from wide.
- Reading pages get the widest margins and the most line space.

**`[PATH-PAGE-CONTACT]` Contact sales** (level 4 Utility, marketing, Standard; routes to `PATH-G`, `PATH-C-SIMPLE`)
- A short form for people ready to talk to a person. It should feel safe and quick. Navigation: Same marketing header and footer. No competing links in the body. The form is the only action.
- Phone: Heading, then the form, then the reasons to trust you. Fields are one column. Tablet: Heading and form side by side. Name and company fields go two across. Desktop: Heading, benefits, and trust badges on the left. Form card on the right.
- Layout: shell site, frame contained; regions intro 1fr from roomy, form 1fr from roomy.

**`[PATH-PAGE-DATAGRID]` Data grid** (level 2 Index, saas, Dense; routes to `PATH-B-COMPLEX`, `PATH-B-NARROW`, `PATH-TABLE-DENSITY`)
- A dense, spreadsheet-like table for people who live in it all day. Sorting, column control, and bulk edits matter more than looks. Navigation: Same app shell. View tabs sit above the toolbar. Selecting rows swaps in a bulk action bar. Rows open a detail page, not a panel, because the grid already uses the width.
- Phone: The grid keeps every column and scrolls sideways inside its card, with the selection box and name pinned on the left. Never hide columns on a table (PATH-B-NARROW). Filter and Sort stay pinned top right as two buttons. Selecting rows shows a bar above the list with one Actions button. Tablet: All columns stay and the grid scrolls sideways with the name pinned. Toolbar keeps search on the left with Filter and Sort pinned top right, under one view tab row. Desktop: All columns, a Columns menu, row height control, export, and a bulk action bar above the header when rows are checked. Scrolls sideways when columns outrun the width, with the name column pinned.
- Layout: shell app, frame fill; panels filter overlay --panel-overlay-sm from roomy, below it fullscreen.
- Checking rows swaps in the bulk bar. Delete asks for confirmation in a modal that names the count. Filter opens a side panel and keeps the grid on screen. A row click leaves the grid for the record page. The densest template here. Desktop rows use the dense height. On touch widths rows return to regular height.

**`[PATH-PAGE-TEAM]` Members table** (level 4 Utility, saas, Standard; routes to `PATH-B-SIMPLE`, `PATH-B-NARROW`, `PATH-D`)
- A short table inside settings. People are here to invite someone, change a role, or remove someone. Navigation: Settings has its own sub-nav: a column on desktop, tabs on tablet, and a drill-in list on phones where tapping Members opens this page with a back arrow.
- Phone: Each person is a stacked row: avatar and name as the title, with email, role, and status under it. Tapping the row opens the edit panel. Invite stays at the top. Tablet: Sub-nav becomes tabs across the top. Role shows as a dropdown in the row. Status stays in the row. Desktop: Sub-nav column on the left. Table with Role dropdown, Joined date, and Status. Active and Invited are grouped under small headers.
- Layout: shell app, frame contained; regions subnav --region-subnav from wide, members fluid from wide; panels edit-member overlay --panel-overlay-md from roomy, below it fullscreen.
- Invite is a modal. Editing a member is a side panel, because people want to see the list behind it. Remove is a confirmation on top of that panel, and Cancel returns to the panel. On a phone the panel is a full screen and the back arrow closes it.

**`[PATH-PAGE-INVOICES]` Invoices and billing** (level 4 Utility, saas, Standard; routes to `PATH-B-SIMPLE`, `PATH-B-NARROW`)
- A read-mostly table. People come here to find one invoice, download it, or check what they owe. Navigation: Lives under Settings or Billing. Summary cards sit above the table. Payment method sits under it.
- Phone: Summary cards go two across. Each invoice is a stacked row: number as the title, with date, amount, and a status badge under it. Download moves into the row menu. Tablet: Table keeps all its columns. Desktop: Four summary cards, then the full table with a PDF button per row and a Download all button.
- Layout: shell app, frame contained; grids summary --item-min-card up to 2/2/2/4.
- A row opens a read-only preview in a modal. Nothing here is editable, so a full page would be overkill. Keep a direct PDF button in the row for people who already know which invoice they want.

**`[PATH-PAGE-SPLIT]` List with detail pane** (level 3 Detail, saas, Dense; routes to `PATH-B-ROW-OPEN`)
- For triage work like an inbox, tickets, or tasks. People move down a list and need the detail without losing their place. Navigation: Same app shell. The selected row stays highlighted. On phones, opening a row is a new screen with a back arrow, and the list keeps its scroll position.
- Phone: List only. Tapping a row pushes the detail as its own screen. Compose or Add becomes a floating button. Tablet: From an 800px window, list and detail split about half and half. Checkboxes and extra row text go away to make room. Below 800px it works like the phone: list only, and the detail opens as its own screen. Desktop: List on the left, a wider detail pane on the right, with tabs for overview, activity, and notes.
- Layout: shell app, frame fill; regions list 1fr from wide, detail 2fr from wide; panels detail two-pane --pane-min from roomy, below it push-screen. Two panes need --pane-min each (DS-PANEL-007), which starts at an 800px window. Between 768px and 799px it behaves like the phone.
- Selecting a row opens its detail. On a phone that is a push to a new screen with a back link, and the list keeps its scroll position. On tablet and desktop nothing navigates: the detail pane updates in place.

**`[PATH-PAGE-REPORT]` Report table** (level 3 Detail, saas, Dense; routes to `PATH-B-NARROW`, `PATH-TABLE-DENSITY`)
- A table that summarizes numbers: a date range, a chart, and rows with a totals line. Mostly read, then exported. Navigation: Reports usually have their own sub-list in the sidebar, like Sales summary, Item sales, and Team sales. Date range and grouping sit on the left in a row above the chart. Filter and Sort are pinned top right of it.
- Phone: Controls collapse into a date chip and an Options button. The chart shrinks. The table keeps every column, scrolls sideways inside its card, and pins the first column. The page itself never scrolls sideways. Tablet: Chart on top, table below. All columns stay and the table scrolls sideways with the first column pinned. Numbers right-aligned so they line up. Desktop: All columns, a bold totals row at the bottom, and Export in the header.
- Layout: shell app, frame fill.

**`[PATH-PAGE-ONBOARDING]` Onboarding steps** (level 4 Utility, both, Spacious; routes to `PATH-C-SIMPLE`, `PATH-COND-PRIMARY-BUTTON`)
- A short, focused setup of 2 to 5 steps with a 1-2-3 stepper, shown before or just after the first visit. One question group per step, then into the product. Navigation: No product navigation. A minimal header with the logo and Save and exit, so people stay in the flow. Back goes one step, Next goes forward, and the last step ends in the product. For SaaS, keep this to what the account needs to work, then drop people on the dashboard with a setup checklist.
- Phone: Stepper keeps its three markers but drops the labels and adds one line, Step 2 of 3: Goals. Content is one column. Back and Next sit in a sticky bottom bar with Next filling the width, and Skip is a text link above it. Tablet: Stepper shows markers with labels. Content is centered in a column capped near 560px. Back sits at the far left of the footer and Skip then Next at the far right. Desktop: Same as tablet with more air around the column. Choice cards go two across. The footer stays under the content, not pinned to the window.
- Layout: shell site, frame contained; regions step --measure-onboarding from roomy.
- Next validates the step, then moves on. Back keeps what was typed. Skip moves on without saving that step. Finish lands on a short done screen, then the dashboard. Save and exit leaves and lets people resume at the same step. Primary is always the rightmost button, with Skip to its left, and Back sits alone at the far left. First-run screens get the loosest spacing: one idea per step, a narrow centered column, big gaps around the stepper.

---

## Motion: When State Changes Should Move

Read this when a button, label or icon changes meaning after the user acts, an element appears in two consecutive states, a number changes or is typed, a panel or tray opens from something the user just tapped, a list reorders, a chart changes range, or a request says "smooth", "animation", "delight" or "polish". Skip motion that does no job. If you cannot say what the user learns from it, leave it out. Timing and easing come from motion tokens (`vois-tokens`, animation rules). This section decides what moves and why. The exact specs for each morph are in the full version (`vois-components/references/motion-morphs.md`, `motion-tray.md`, `motion-context.md`).

**The one rule:** never change something statically if the user needs to understand what changed. An element that exists before and after **travels** (it does not vanish and reappear). An element that changes meaning **morphs** (the parts that stay the same stay, and move to their new places). If neither applies, use a short crossfade, or nothing. Fast and static is allowed.

**Decision test.** Run in order and stop at the first yes.

1. The same element appears in the next state: **shared element transfer**, with its context treatment.
2. A button runs an action and shows its result (idle, working, done): **status button**. If the committing action replaces its surface, use **collapse to indicator**.
3. A label or short title changes in a way that raises the stakes or changes the step: **label morph**.
4. An icon changes to show a new action in place (menu to close, close to back, play to pause): **icon morph**.
5. A number changes: live data uses the **number ticker**, a number the user types uses **typed input**.
6. The user moves sideways between peers (tabs, segments, steppers): **directional transition**, at a speed that matches how often it happens (tab bars about a tenth of a second, steppers at the base speed).
7. A transient surface shows a sequence of steps from the bottom of the screen, one job per step, over the screen the user came from: **tray** (see the Tray Spec in `vois-components`).
8. A single transient panel opens from the control that triggered it: **grow-from-trigger**.
9. A list reorders, regroups or accepts a drag because of the user: **reorder and regroup**.
10. The user changes a chart's range, filter or series: **chart range change**. A refetch or live update is not one.
11. A control changes availability, a placeholder resolves to a value, or a progress step advances: **small state change**.
12. None of the above: a crossfade at the fast duration, or nothing.

**When not to use each.** Status button: the action has no visible result, or the library owns the loading state and you cannot render the states. Collapse to indicator: the surface stays, or the indicator has nowhere to go. Label morph: few letters match, it changes more than once a second, or it sits in a dense table (no shared text means a crossfade: "Continue" to "Pay $42"). Shared element: it is different content with the same shape. Icon morph: the two icons are unrelated shapes. Number ticker: it updates more than about twice a second (show the final value). Directional: the move came from a keyboard. Tray: the content is long, needs its own URL, or the user will stay. Grow-from-trigger: the content is long, has several steps, or needs its own URL. Reorder: the list is static. Chart range change: a refetch, a poll or a live append (a background refresh does not move at all).

**Reduced motion fallbacks.** Label, icon, number, typed input, reorder, collapse to indicator and small state changes swap instantly. Shared element and grow-from-trigger fade in place with no travel. Directional and chart range change crossfade. Tray resizes at once and crossfades the content. Status button changes fill and icon at once and the done state still holds. Reduced motion removes movement, never information.

**Examples.** "Save" to "Saved": keep "Save" in place, animate only the added "d". "Review order" to "Submit order": keep " order" and animate the first word, in one move. "Craft" to "Creative": shared letters slide to their new places while the others arrive and leave. Status button: "Book now", a spinner, then a check crossfade in the same spot, the button keeps its size, and the check holds half a second at most. Number ticker: only the digits that changed move, and screen readers hear the final value once. Chart "1D" to "1W": the line morphs, the selected pill slides, and the figures roll in about a tenth of a second.

**Frequency and emphasis.** Delight scales inversely with how often something happens. Daily actions are small, quick and quiet. Rare, important moments get more room, still inside the duration caps. Polish has to be even: a rarely used screen that is static beside a smooth one looks neglected. Use the lightest morph that fits, not zero.

| Tier | Met | Examples | Rules |
|---|---|---|---|
| T1 detail | Daily | Commas gliding as a number is typed | Duration tokens only, under 300ms. Nothing that repeats on the tenth use |
| T2 moment | Weekly or less | A selection stack dropping into a bin, a shimmer on a hidden balance | The entrance may use the slow token. A loop only as an ambient sign of a mode, never decoration |
| T3 occasion | Rare and important | Confetti on finishing a backup | May run longer than the slow token. Plays once. Can be skipped |

Every tier never gates the task, carries the same meaning in a still frame, pauses loops under reduced motion and while the page is hidden, and is absent (not swapped) under reduced motion if it is an easter egg (`DS-MOTION-007`). Text inside an easter egg goes through Righter, and humor never appears in an error. If your workspace uses a MOTION dial, a low setting (1 to 3) allows only crossfades and instant swaps.

**Accessibility, required for every morph.** Respect `prefers-reduced-motion`. No meaning in motion alone: the final state must read from a still frame. Screen readers get the final state once, never intermediate frames. Input is never blocked: an interruption resolves to the newest state and continues from where the motion was. Focus stays put: a morphing button keeps focus, and a tray moves focus to the new step after the swap ends and back to the trigger when it closes. Nothing user-blocking runs longer than the slow duration token. Nothing flashes more than three times a second. A keyboard-triggered change does not slide (`DS-ANIMATION-003`).

**Anti-patterns.** Duplicating an element during a transition (one fades out while a copy fades in). Motion for its own sake. Teleporting persistent elements. Slow confirmation: a morph that delays a payment, a delete or a submit (the one exception is the status button's done hold, capped at 500ms). Out, then in: animating the old value away and only then the new one in, which breaks the duration cap (`DS-MOTION-003`). Per-letter animation on every label. Bounce on destructive or financial actions. Inconsistent timing between similar transitions. Rewriting copy only so an animation looks better. A tray that remounts on each step (`DS-MOTION-004`). Blur on the traveller (`DS-MOTION-005`). Replaying a chart on refetch. Delight the user has to wait for (`DS-MOTION-007`).

**Label pairs.** Righter approves each label pair before a component builds a morph (see Label Pairs for Motion Morphs in the Righter edition). An unapproved pair crossfades or swaps instantly.

**Remove the motion.** Take the animation out of a flow and see what is lost. If the user still knows what changed, where it went and what to do next, the motion is decoration: cut it or move it down a tier. If not, name its job: orientation, continuity, confirmation or causality. On a payment, delete or send, a missing motion that hides what happened is a finding.

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

- [ ] Container type selected (settings / table / form / dialog / detail / pricing / marketing) — or, if the brief didn't map directly, checked the Composing Existing Primitives section for a fit or combination first
- [ ] If the task is a whole page: template picked from Page Templates, checked at phone, tablet and desktop (`[PATH-PAGE-BREAKPOINTS]`)
- [ ] Content density tier picked deliberately (dense / standard / spacious), not defaulted to whatever mid-range spacing produces
- [ ] Page structure sketched (what sections, what's visible, what's hidden by role)
- [ ] Permissions applied (hide/disable rules — see Permissions section above), and personal data masked and kept out of URLs, titles, and analytics
- [ ] All copy written with Righter (or the fallback conventions), not guessed
- [ ] Ready to apply `vois-components` then `vois-tokens` for components, tokens, and spacing
- [ ] Mobile breakpoint behavior defined (action sheets vs. dialogs, sidebar vs. hamburger, etc.)
- [ ] If a state change moves: the decision test run, a reduced-motion fallback defined, and the remove-the-motion check done

---

## Relationship to Other Skills

**This skill ↔ vois-components:** after picking a container type here, read `vois-components` to select specific components — it resolves ambiguous pairs like Dialog vs Drawer, Toast vs Banner, Select vs Combobox.

**This skill ↔ vois-tokens:** read this skill first (what to build), then `vois-tokens` (how to code it correctly) for tokens, spacing, components, animation, and accessibility.

**This skill ↔ vois-dataviz:** if the screen is a dashboard, an analytics view, or contains charts, KPI tiles, sparklines or maps, decide the page structure here, then read `vois-dataviz` (full repo) for what goes inside it. It picks chart forms, chart colors, filters and data states; it doesn't decide the page container.

**This skill ↔ Righter:** every word in the UI comes from Righter, or the fallback conventions above if Righter isn't installed. This skill tells you which container type; Righter tells you what words go in it.
