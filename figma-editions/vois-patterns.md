---
name: vois-patterns
description: Structural decision trees for container types, form states, table layouts, and page-level patterns. Use before vois-tokens. Use when building pages, forms, features, workflows.
version: 1.15.0
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
- Filtering/sorting: buttons anchored top right; active filters shown as dismissible chips; sort indicator shows column + direction.
- Row actions: if a row is deleted/archived, dim it visually and disable its actions.
- States, errors, and interactions: see Table interactions below.

**Table interactions** (how the table behaves):
- **Selection and bulk actions.** A table with bulk actions gets a leading checkbox column: tri-state header, shift-click for a range, selected rows tinted with a checked box (never tint alone). Simple tables have none `[PATH-TABLE-SELECT-CHECKBOX]`. When a full page is selected and more results exist, offer "select all N" and say how many rows an action will touch `[PATH-TABLE-SELECT-ALL-PAGES]`. The bulk bar shows the selected count, 2 to 3 visible actions with the rest in a DropdownMenu, and a clear-selection control; the destructive action is last and distinct `[PATH-TABLE-BULK-BAR]`. A destructive bulk action confirms with the count in a Dialog; if it can be undone, skip the dialog and offer Undo in the toast `[PATH-TABLE-BULK-DESTRUCTIVE]`.
- **Toolbar and view state.** Clicking a sortable header cycles ascending, descending, none, shows direction, carries `aria-sort`, allows one active sort, and resets paging to page 1 `[PATH-TABLE-SORT]`. A simple table has one Filter control that opens a Popover, with applied filters as chips under the toolbar `[PATH-TABLE-FILTER-SIMPLE]`; a complex table uses a filter builder of field, operator, value rows with Add filter, Apply, and Clear filters, and the chips stay visible `[PATH-TABLE-FILTER-BUILDER]`. Complex tables offer show or hide, reorder, pin, and Reset to default for columns; the first column can't be hidden `[PATH-TABLE-COLUMNS]`. Density is Dense, Regular, or Comfortable, remembered per user; simple tables have one `[PATH-TABLE-DENSITY]`. Saved views are tabs or a switcher that store filters, sort, columns, and density, with an unsaved-changes state `[PATH-TABLE-SAVED-VIEWS]`. Search, filters, sort, page, and the open row live in the URL `[PATH-TABLE-URL-STATE]`. Up and Down move row focus, Enter opens, Space toggles selection, Esc closes the drawer, Cmd or Ctrl plus Enter saves `[PATH-TABLE-KEYBOARD]`. The drawer has previous and next controls bound to Up and Down, and stepping past the last row loads the next page `[PATH-TABLE-DRAWER-STEP]`.
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
- [ ] Content density tier picked deliberately (dense / standard / spacious), not defaulted to whatever mid-range spacing produces
- [ ] Page structure sketched (what sections, what's visible, what's hidden by role)
- [ ] Permissions applied (hide/disable rules — see Permissions section above), and personal data masked and kept out of URLs, titles, and analytics
- [ ] All copy written with Righter (or the fallback conventions), not guessed
- [ ] Ready to apply `vois-components` then `vois-tokens` for components, tokens, and spacing
- [ ] Mobile breakpoint behavior defined (action sheets vs. dialogs, sidebar vs. hamburger, etc.)

---

## Relationship to Other Skills

**This skill ↔ vois-components:** after picking a container type here, read `vois-components` to select specific components — it resolves ambiguous pairs like Dialog vs Drawer, Toast vs Banner, Select vs Combobox.

**This skill ↔ vois-tokens:** read this skill first (what to build), then `vois-tokens` (how to code it correctly) for tokens, spacing, components, animation, and accessibility.

**This skill ↔ vois-dataviz:** if the screen is a dashboard, an analytics view, or contains charts, KPI tiles, sparklines or maps, decide the page structure here, then read `vois-dataviz` (full repo) for what goes inside it. It picks chart forms, chart colors, filters and data states; it doesn't decide the page container.

**This skill ↔ Righter:** every word in the UI comes from Righter, or the fallback conventions above if Righter isn't installed. This skill tells you which container type; Righter tells you what words go in it.
