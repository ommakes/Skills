# Form Field Groups `[PATH-C]` extension

Extends `forms.md`. That file already covers form complexity, states, labels, grouping, validation placement, and confirmation. This file adds field widths, columns, and the common field groups (name, address, phone, email, one-time code).

**Basis tags.** `observed` means seen in several shipped products on Mobbin (links given). `decision` means set by Om. `judgment` means Claude's call, so challenge it. Where a Mobbin pattern conflicts with an existing Vois rule, the Vois rule wins and the entry says so.

**Builds on.** Every rule lists the existing Vois or righter rules it relies on, by ID. Those rules are not restated here. Copy, error components, and toasts always come from righter.

All spacing uses vois-tokens scale steps. Widths use the `widths` tokens in `vois-tokens/data/tokens.json`: `--width-form-max`, `--width-field-max`, `--width-field-narrow`, `--width-viewport-min`.

---

## Width, columns, spacing

### `[PATH-FIELD-CONTAINER]` Form container
**When:** Building any form.
**Do:** Cap the form container at `--width-form-max`. The layout holds down to `--width-viewport-min` with no horizontal scroll.
**Builds on:** DS-LAYOUT-WIDTH-001, DS-LAYOUT-WIDTH-003
**Basis:** decision.

### `[PATH-FIELD-WIDTH]` Field width tiers
**When:** Sizing a field.
**Do:** Single-line inputs and selects fill their column up to `--width-field-max`. Short fixed-format values (postal code, state or province code, expiry, security code) cap at `--width-field-narrow` and never stretch. Multi-line textareas may fill up to `--width-form-max` and grow in height per `[PATH-FIELD-TEXTAREA-AUTOSIZE]`. Single-line fields never exceed `--width-field-max`.
**Builds on:** DS-LAYOUT-WIDTH-002, JOB-ACCEPT-TEXT, PATH-FIELD-TEXTAREA-AUTOSIZE
**Basis:** decision.

### `[PATH-FIELD-COLUMNS]` Two columns at most
**When:** Placing fields side by side.
**Do:** Use at most two columns. Pair only related fields of similar length, such as first and last name, or state and postal code. Address line 1, email, phone, and textareas always sit alone. Dialogs are always one column (`[PATH-D-SIZE]`). Visual order equals tab order.
**Builds on:** PATH-C-MEDIUM, PATH-D-SIZE
**Basis:** decision for the limit and for no columns in dialogs. The pairings are observed. Seen: [Jira](https://mobbin.com/screens/5e5d49e5-b251-4c72-bb73-fdfeab10d247), [Base](https://mobbin.com/screens/bc74aa14-d12a-400f-927f-bcb79c731a03), [Kajabi](https://mobbin.com/screens/93fb63fa-2205-4b1c-a8b6-cc13af685212), [Maze account](https://mobbin.com/screens/5ee2420f-5953-4681-9002-621d8b83e537).

### `[PATH-FIELD-WRAP]` Wrapping
**When:** The form's container gets narrow.
**Do:** Two columns become one when the form's container is narrower than the `sm` breakpoint value (`40em`). Use a container query so forms inside drawers and side panels wrap correctly. Source order is preserved. The phone control and the one-time-code group never split.
**Builds on:** DS-RESPONSIVE-003
**Basis:** decision for the wrap. The container-query choice follows the existing Vois rule.

### `[PATH-FIELD-COLUMN-GAP]` Column gap
**When:** Two columns sit side by side.
**Do:** `gap-6` by default and `gap-10` when the DENSITY dial is 3 or lower. Vertical gaps between fields and sections are already set in `forms.md` (`gap-6` and `gap-10`).
**Builds on:** DS-SPACING-001, DS-SPACING-002, PATH-C-MEDIUM
**Basis:** decision. The 24 to 40 range and the link to the DENSITY dial are both confirmed by Om.

### `[PATH-FIELD-LABEL]` Optional marking
**When:** Marking which fields are required.
**Do:** If most fields are required, mark the optional ones "(optional)" instead of marking every required one. Label placement and style are already covered.
**Builds on:** DS-A11Y-006, DS-TYPOGRAPHY-001
**Basis:** observed. Seen: [Upwork](https://mobbin.com/screens/f41b3d1f-9920-4c5f-a90c-c67b08f9d065), [Employment Hero](https://mobbin.com/screens/a96eca03-e399-424e-b59d-aa849df1e231), [Base](https://mobbin.com/screens/bc74aa14-d12a-400f-927f-bcb79c731a03). The either-way choice is judgment.

## Field groups

### `[PATH-FIELD-NAME]` Name
**When:** Collecting a person's name.
**Do:** First name and last name as a pair. Use one full-name field only when the product treats the name as a single string.
**Builds on:** PATH-FIELD-COLUMNS
**Basis:** observed. Seen: [Air account](https://mobbin.com/screens/6f4b1a5c-2f74-42de-8b62-5a31d37ee699), [Maze account](https://mobbin.com/screens/5ee2420f-5953-4681-9002-621d8b83e537), [Employment Hero](https://mobbin.com/screens/a96eca03-e399-424e-b59d-aa849df1e231), [Linear profile](https://mobbin.com/screens/a4e7fb71-dd94-4c1d-a5af-f032e03a10a9).

### `[PATH-FIELD-ADDRESS-ORDER]` Address order
**When:** Building an address form.
**Do:** Country, address line 1, address line 2, city, then state or province and postal code as a pair. Country goes first because it decides which fields appear and how they are labelled. Changing country re-labels and re-validates without clearing typed values. In settings, line 2 is a visible optional field. In short flows it may collapse behind an "Add apartment, suite" link.
**Builds on:** PATH-C (Field Grouping, address example)
**Basis:** observed. Seen: [Jira](https://mobbin.com/screens/5e5d49e5-b251-4c72-bb73-fdfeab10d247), [Upwork](https://mobbin.com/screens/f41b3d1f-9920-4c5f-a90c-c67b08f9d065). Counter-examples with country late: [Kajabi](https://mobbin.com/screens/93fb63fa-2205-4b1c-a8b6-cc13af685212), [Employment Hero](https://mobbin.com/screens/a96eca03-e399-424e-b59d-aa849df1e231). Re-labelling behavior is judgment.

### `[PATH-FIELD-ADDRESS-PAIRS]` Address pairs and autofill
**When:** Placing the lower address fields.
**Do:** State or province at default width pairs with postal code at `--width-field-narrow`. City sits alone. Never put three fields in one row. Set `autocomplete` on every field (address-line1, address-line2, address-level2, address-level1, postal-code, country).
**Builds on:** PATH-FIELD-COLUMNS, PATH-FIELD-WIDTH
**Basis:** observed for the pairs. Autocomplete values are judgment. Seen: [Jira](https://mobbin.com/screens/5e5d49e5-b251-4c72-bb73-fdfeab10d247), [Base](https://mobbin.com/screens/bc74aa14-d12a-400f-927f-bcb79c731a03), [Kajabi](https://mobbin.com/screens/93fb63fa-2205-4b1c-a8b6-cc13af685212), [Fresha](https://mobbin.com/screens/2f742116-0cc9-4aed-946b-e5c3265ae5a1).

### `[PATH-FIELD-PHONE-CONTROL]` Phone as one control
**When:** Collecting a phone number.
**Do:** One joined control with a country selector and a number input on a single row sharing one label. The selector is a Combobox with a fixed width of `w-24` and the number input takes the rest. The row stays on one line at `--width-viewport-min`. The whole control caps at `--width-field-max`. Closed, the selector shows the flag and dial code, and the open list shows country name and dial code with frequently used countries pinned first. The default follows the user's locale.
**Builds on:** JOB-CHOOSE-FROM-LIST, PATH-FIELD-WIDTH, PATH-FIELD-WRAP
**Basis:** observed. Seen: [Revolut phone](https://mobbin.com/screens/4b141508-40d8-4cd6-84b2-233ef0bed04f), [Coinbase phone](https://mobbin.com/screens/1317f11b-3b55-4145-8835-a41a61236f72), [Calendly](https://mobbin.com/screens/1348f031-6be2-40f2-8aee-96f5f0c76b04), [Uvodo phone](https://mobbin.com/screens/f040b404-54c5-464e-b291-4b0aaac1783d), [Stripe](https://mobbin.com/screens/4a05abed-e696-47b6-a3d9-deefc07fa85b), [Klook](https://mobbin.com/screens/c47e7eff-fa06-4647-8ff4-fc9884c99d84). Selector width and locale default are judgment.

### `[PATH-FIELD-PHONE-INPUT]` Number entry
**When:** The user types a phone number.
**Do:** Format as they type using the selected country's pattern, show a telephone keypad on mobile, and store in international format.
**Builds on:** PATH-FIELD-PHONE-CONTROL
**Basis:** observed for live formatting ([Coinbase phone](https://mobbin.com/screens/1317f11b-3b55-4145-8835-a41a61236f72)). Keypad and storage format are judgment.

### `[PATH-FIELD-EMAIL]` Email
**When:** An email field appears in a regular form.
**Do:** Default width, email keypad and `autocomplete="email"` on mobile. In account settings it follows `[PATH-SET-IDENTITY-FIELD]` instead.
**Builds on:** PATH-FIELD-WIDTH, PATH-SET-IDENTITY-FIELD
**Basis:** judgment.

### `[PATH-FIELD-TEXTAREA-AUTOSIZE]` Auto-growing text areas
**When:** A multi-line text field, such as notes, a description, or feedback.
**Do:** It grows with its content using CSS `field-sizing: content`, never JavaScript. It starts at `--textarea-min-lines`, stops growing at `--textarea-max-lines`, and scrolls inside after that. The CSS pattern, the required width setting, and the fallback are in `DS-LAYOUT-FIELD-001` to `DS-LAYOUT-FIELD-004`.
**Builds on:** DS-LAYOUT-FIELD-001, DS-LAYOUT-FIELD-002, DS-LAYOUT-FIELD-003, DS-LAYOUT-FIELD-004, JOB-ACCEPT-TEXT
**Basis:** decision. Om specified `field-sizing: content`. Om confirmed the line counts: form textarea 3 to 12, chat input 1 to 8.

### `[PATH-FIELD-CHAT-INPUT]` AI chat input
**When:** The user types a message into an AI or chat thread.
**Do:** One textarea using the same auto-growing pattern. It starts at `--chat-input-min-lines`, grows to `--chat-input-max-lines`, then scrolls inside. The composer is anchored to the bottom of the thread, so growth pushes upward and the send control stays aligned to the composer's bottom edge. It fills its container and is not capped by `--width-field-max` or `--width-form-max`, because the thread column sets its width. The chat container uses `dvh` so it tracks the mobile keyboard. Keep an accessible name even when there is no visible label.
**Builds on:** PATH-FIELD-TEXTAREA-AUTOSIZE, DS-LAYOUT-001, DS-LAYOUT-FIELD-003, DS-A11Y-006
**Basis:** decision for the autosizing. Judgment for the bottom anchoring, the send-control alignment, and the width exemption. Chat input patterns beyond sizing were not researched.

### `[PATH-FIELD-OTP-INPUT]` One-time code
**When:** The user enters a fixed-length code, such as an email or SMS verification code.
**Do:** Use InputOTP with one cell per character, behaving as one field: one tab stop, paste fills every cell, backspace moves back, `autocomplete="one-time-code"`, and a numeric keypad when the code is digits only. Keep a visible label. Cells share the row equally with `gap-2`, cap at `size-12`, and shrink to fit down to `--width-viewport-min`. The group caps at `--width-field-max`. The group is one hit area of at least `--hit-area-min` tall, and a tap on any cell focuses the first empty one, so cells can shrink visually without losing the target. The error state puts an icon and text under the group and puts every cell in the error style.
**Builds on:** JOB-ACCEPT-TEXT (proposed InputOTP branch), DS-A11Y-006, DS-A11Y-017, DS-A11Y-001 (hit area token), helper-text
**Basis:** observed. 14 of the 18 verification screens reviewed use segmented cells. The rest use one plain field ([Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37), [Wix](https://mobbin.com/screens/685d877e-6337-4ab5-a8c6-79e0920c66e5), [Eventbrite](https://mobbin.com/screens/837ae066-4bea-4ddf-b920-6b390e4411e7), [Discord flow](https://mobbin.com/flows/b0483890-8548-40c7-9511-05e386db741e)). Segmented seen in [Pipedrive](https://mobbin.com/screens/4c42d71b-ed52-46d9-a638-1cefa769e83c), [Coinbase code](https://mobbin.com/screens/fcebcfd2-be97-4300-ac8a-ee6b5949fbc5), [Hulu](https://mobbin.com/screens/ac1b7563-5a19-47bc-86af-1c7f48e507bc), [Shopify](https://mobbin.com/screens/59d54fdb-5696-4cee-8267-34ddbb1f3cff), [Apple Music](https://mobbin.com/screens/6aa4a9d7-6cc9-4320-b237-5db6293b95de), [Databricks](https://mobbin.com/screens/64cebb0a-3add-4a5d-9cea-3f7cd0029b26), [Clerk](https://mobbin.com/screens/44a93746-df1c-4854-9f37-f9f0cbe73798). Behavior details and the group-as-one-hit-area approach are judgment.

---

## Still not researched

- Country-specific address formats beyond the common field set
- Secondary or backup email lists
