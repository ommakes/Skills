# Settings Interactions `[PATH-A]` extension

Extends `settings-pages.md`. That file says which sections a settings page has. This file adds only what Vois did not already say about how view, edit, add, and remove behave inside them, plus the email-change flow with one-time-code verification.

**Basis tags.** `observed` means seen in several shipped products on Mobbin (links given). `decision` means set by Om. `judgment` means Claude's call, so challenge it. Where a Mobbin pattern conflicts with an existing Vois rule, the Vois rule wins and the entry says so.

**Builds on.** Every rule lists the existing Vois or righter rules it relies on, by ID. Those rules are not restated here. Copy, error components, and toasts always come from righter.

---

## Persistence

### `[PATH-SET-SAVE-INSTANT]` Instant save for single values
**When:** The user changes a Switch, Select, or Radio that stands alone on a settings page.
**Do:** Persist on change and confirm with a toast. If the save fails, revert the control and surface the failure with whichever component righter's decision tree picks. No Save button.
**Builds on:** JOB-BINARY-PREFERENCE, JOB-TRANSIENT-FEEDBACK, error-decision-tree
**Basis:** observed. Seen: [Linear preferences](https://mobbin.com/screens/8720abc2-c855-44ee-911d-bc15fc1707eb), [fal](https://mobbin.com/screens/dc1fcc97-dfb4-4c6d-8d6d-2c085da7c0c7).

### `[PATH-SET-SAVE-EXPLICIT]` Explicit save for text and multi-field blocks
**When:** A settings block has text inputs or more than one related field.
**Do:** Save stays disabled until a value has changed and every required value is valid. Cancel restores the last saved values. Both sit in the block, not in a footer.
**Builds on:** PATH-COND-PRIMARY-BUTTON (covers "valid"; this adds "changed")
**Basis:** observed. Seen: [StackAI](https://mobbin.com/screens/b82f1e2f-4e92-41fa-bec4-5471da0e0416), [Buffer](https://mobbin.com/screens/c2405be5-c890-4439-91bc-a5452e229e65), [Air account](https://mobbin.com/screens/6f4b1a5c-2f74-42de-8b62-5a31d37ee699), [Airtable](https://mobbin.com/screens/441e5316-76a4-4e6b-80a3-88f2bf318839).

### `[PATH-SET-VIEW-EDIT-BLOCK]` Where the view state still applies
**When:** A settings block holds details that are mostly read and rarely changed, such as legal name, business address, or billing details.
**Do:** Use the view state by default and enter the edit state on an explicit Edit action, as `settings-pages.md` describes. Preference blocks are always editable and skip the view state.
**Builds on:** PATH-A
**Basis:** decision. Confirmed by Om. Reconciles the existing view-then-edit model with the always-editable pages most products ship.

## Layout

### `[PATH-SET-ROW-LAYOUT]` Preference rows
**When:** Laying out preference rows, each with a label and one control.
**Do:** Label and optional helper text (Description style) on the left, control on the right, centered vertically. Group header above the rows. Rows separated by dividers. No container card or shadow around a group. Cap the content column at `--width-form-max` and space groups with `gap-10`. When the container is narrower than the `sm` value (`40em`), stack the control under its label.
**Builds on:** DS-SLOP-010, DS-SURFACE-008, DS-RESPONSIVE-003
**Basis:** observed layout. Linear wraps its rows in a bordered container, but DS-SLOP-010 discourages card-ifying static groups, so the container is dropped. Column cap and stacking are judgment. Seen: [Linear preferences](https://mobbin.com/screens/8720abc2-c855-44ee-911d-bc15fc1707eb), [Linear profile](https://mobbin.com/screens/a4e7fb71-dd94-4c1d-a5af-f032e03a10a9).

## Notifications

### `[PATH-SET-NOTIF-MATRIX]` Events by channel
**When:** There are two or more channels and three or more event types.
**Do:** Events are rows and channels are columns, grouped under category headers. Each cell is a Switch when changes save instantly, or a Checkbox only when the page has an explicit Save. With one channel, use a plain list of Switches. Below the `sm` container width, each event stacks with its channels listed beneath it.
**Builds on:** JOB-BINARY-PREFERENCE, PATH-SET-SAVE-INSTANT, PATH-SET-SAVE-EXPLICIT
**Basis:** observed matrix. Most products pair checkboxes with instant save, which JOB-BINARY-PREFERENCE does not allow, so the component follows Vois. Mobile collapse is judgment. Seen: [Air notifications](https://mobbin.com/screens/e6f97962-c24c-478b-b416-08830dc5b062), [Attio](https://mobbin.com/screens/6a123e37-85b7-4fb7-a9fb-6aa003704ae5), [Amplitude](https://mobbin.com/screens/c8733bc0-e45f-49a9-a113-74770231103b), [Apollo notifications](https://mobbin.com/screens/0ea0a7b7-bb81-490f-b3d0-55e2323e9c43), [fal](https://mobbin.com/screens/dc1fcc97-dfb4-4c6d-8d6d-2c085da7c0c7), [Frame](https://mobbin.com/screens/9cf46a76-5078-402b-a585-0fb85ecd4f31).

### `[PATH-SET-NOTIF-CHANNEL-OFF]` Channel not connected
**When:** A channel column exists but the channel is not connected, for example Slack.
**Do:** Keep the column visible and disabled, with a link to connect it.
**Builds on:** PATH-PERM-DISABLE-BY-CONDITION
**Basis:** observed. Seen: [AirOps](https://mobbin.com/screens/fcb3eaa8-fc70-41b9-be36-43a9a0bcb176), [fal](https://mobbin.com/screens/dc1fcc97-dfb4-4c6d-8d6d-2c085da7c0c7).

### `[PATH-SET-NOTIF-DIGEST]` Digest
**When:** The product sends a digest email.
**Do:** Put its Switch above the matrix as its own row, separate from the per-event preferences.
**Builds on:** JOB-BINARY-PREFERENCE
**Basis:** observed. Seen: [Air notifications](https://mobbin.com/screens/e6f97962-c24c-478b-b416-08830dc5b062), [Attio](https://mobbin.com/screens/6a123e37-85b7-4fb7-a9fb-6aa003704ae5).

## Members

### `[PATH-SET-MEMBERS-LIST]` Member list
**When:** Listing members of a workspace or team.
**Do:** Columns are member (name and email), role, and status. Row actions follow `[PATH-B-ROW-ACTIONS]`, so Remove and other secondary actions sit in the DropdownMenu. The Invite primary button sits at the top right of the table. Narrow layout follows `[PATH-B-NARROW]`.
**Builds on:** PATH-B, PATH-B-ROW-ACTIONS, PATH-B-NARROW, JOB-DISPLAY-DATA, JOB-EXPOSE-ACTIONS
**Basis:** observed. Seen: [Bonsai](https://mobbin.com/screens/f9b9a1b8-369b-4d3e-8ecb-92133d82c74c), [Time2book](https://mobbin.com/screens/6395b9d6-04f9-4381-8f38-432456539c2e), [Sprig](https://mobbin.com/screens/039ad393-b295-403a-8a08-d8fc8c7015af).

### `[PATH-SET-MEMBERS-INVITE]` Adding a member
**When:** The user adds a member.
**Do:** The Invite button opens a Dialog with email and role. Use an inline email field with an Invite button only when inviting is the main job of the page. The toast names the invited address.
**Builds on:** JOB-OVERLAY-INTERACTION, PATH-D-SIZE, JOB-TRANSIENT-FEEDBACK
**Basis:** observed for both forms. The choice between them is judgment. Seen: [Juicebox](https://mobbin.com/screens/3de7ed7e-4b6c-4254-a43a-a4ca51f3038d), [Maze team](https://mobbin.com/screens/48a8e1d5-3fbe-43fa-a6f8-ff2367e41dec), [Time2book](https://mobbin.com/screens/6395b9d6-04f9-4381-8f38-432456539c2e).

### `[PATH-SET-MEMBERS-STATES]` Pending and active rows
**When:** A member row is pending or active.
**Do:** Pending rows get a Pending badge and the menu actions Resend invite and Remove. Active rows get Edit role and Remove. When the role list is short, role can be an inline Select that saves instantly.
**Builds on:** JOB-LABEL-CONTENT, PATH-SET-SAVE-INSTANT
**Basis:** observed. Inline versus menu is judgment. Seen: [Bonsai](https://mobbin.com/screens/f9b9a1b8-369b-4d3e-8ecb-92133d82c74c), [Sprig](https://mobbin.com/screens/039ad393-b295-403a-8a08-d8fc8c7015af), [Sentry](https://mobbin.com/screens/6b778223-e7d5-42b1-82c9-ccd8d191ca0f), [Exa](https://mobbin.com/screens/653250ae-1b2d-42d8-9898-2f41c943dfb3).

### `[PATH-SET-MEMBERS-SELF]` Current user and owner rows
**When:** A member row is the current user or the owner.
**Do:** Label the current user's row "You". The owner row has no Remove. The current user's action is Leave, not Remove. Removing someone else uses an AlertDialog and notifies the removed member afterward.
**Builds on:** PATH-PERM-DISABLE-BY-CONDITION, JOB-CONFIRM-DESTRUCTIVE
**Basis:** observed. Seen: [Sentry](https://mobbin.com/screens/6b778223-e7d5-42b1-82c9-ccd8d191ca0f), [Maze team](https://mobbin.com/screens/48a8e1d5-3fbe-43fa-a6f8-ff2367e41dec), [Exa](https://mobbin.com/screens/653250ae-1b2d-42d8-9898-2f41c943dfb3).

## Integrations

### `[PATH-SET-INTEG-GROUPS]` Connected before available
**When:** Listing integrations.
**Do:** Show Connected above Available, each with a count. Rows are a list by default. Use a card grid only when browsing a large catalog, and add search and a category filter there.
**Builds on:** JOB-DISPLAY-DATA
**Basis:** observed. Seen: [Apollo integrations](https://mobbin.com/screens/4d8f6c81-5562-4a49-ae10-49f830806ee7), [Mintlify](https://mobbin.com/screens/e700ca68-4482-467d-abe8-c66cbbd663fa), [Charma](https://mobbin.com/screens/b8829590-0ca1-47ff-a6b1-1f9536ac5154).

### `[PATH-SET-INTEG-ACTIONS]` Connect, configure, disconnect
**When:** Choosing row actions for an integration.
**Do:** Not connected: Connect. Connected: Configure when there are settings, plus a quiet Disconnect. Disconnect is never the primary button and is red only if it deletes data. A Connect that leaves the app shows an external-link icon.
**Builds on:** JOB-CONFIRM-DESTRUCTIVE (Disconnect confirms with an AlertDialog)
**Basis:** observed. Seen: [Apollo integrations](https://mobbin.com/screens/4d8f6c81-5562-4a49-ae10-49f830806ee7), [User Interviews](https://mobbin.com/screens/a663fa43-1fbe-4f01-a1cc-3525a6b75e70), [Mintlify](https://mobbin.com/screens/e700ca68-4482-467d-abe8-c66cbbd663fa).

### `[PATH-SET-INTEG-LOCKED]` Plan-gated integrations
**When:** An integration needs a higher plan.
**Do:** Show it disabled with the plan requirement stated. Do not hide it. This differs from role-denied items, which are hidden.
**Builds on:** PATH-PERM-HIDE-BY-ROLE, PATH-PERM-DISABLE-BY-CONDITION
**Basis:** observed. The hide-versus-show distinction is judgment. Seen: [Qatalog](https://mobbin.com/screens/bf24e755-2a66-4aa1-b64b-ad156bbd0641).

## Removing things

Standard removal confirmation is already covered by `[PATH-D]` and JOB-CONFIRM-DESTRUCTIVE, so it is not repeated here. These two rules cover what Vois does not.

### `[PATH-SET-REMOVE-TYPED]` Typed confirmation
**When:** The deletion is irreversible or high-impact, such as a workspace, team, or account.
**Do:** The user types the object's name before the destructive button enables. The body lists what will be lost with counts and states any recovery window. It always uses a full modal, never an action sheet. Dialog width follows `[PATH-D-SIZE]`, which is the small tier.
**Builds on:** PATH-D, PATH-D-SIZE, JOB-CONFIRM-DESTRUCTIVE, alert-dialog
**Basis:** observed. Seen: [Resend](https://mobbin.com/screens/52df18d7-8f15-470f-a302-5c407d781091), [Cloudflare](https://mobbin.com/screens/aa928ac1-4a1d-4b8c-9ccb-be35211cdca8), [Linear team delete](https://mobbin.com/screens/b1d9a761-cf3b-4070-afd5-c8063ad60c3e). [Deputy](https://mobbin.com/screens/a88043ed-bb51-4cf5-9c5f-ee050577cc3a) uses an acknowledgement checkbox instead.

### `[PATH-SET-DANGER-ZONE]` Danger zone
**When:** A page has account-, workspace-, or team-level destructive actions.
**Do:** Group them at the bottom under a Danger zone heading. Each row has a label and helper text on the left and a destructive button on the right. Leave and delete are separate rows.
**Builds on:** PATH-A, PATH-SET-REMOVE-TYPED
**Basis:** observed. Seen: [Linear workspace](https://mobbin.com/screens/60dd3590-48ba-4a6b-933a-7f8ef3ab8b6d), [StackAI](https://mobbin.com/screens/b82f1e2f-4e92-41fa-bec4-5471da0e0416), [Buffer](https://mobbin.com/screens/c2405be5-c890-4439-91bc-a5452e229e65).

## Changing an email with a one-time code

Researched from 18 verification screens and 4 email-change flows: [Discord flow](https://mobbin.com/flows/b0483890-8548-40c7-9511-05e386db741e), [Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37), [AWS flow](https://mobbin.com/flows/58f8774d-1368-4ef1-84e8-37ae83c95aa0), [Adobe flow](https://mobbin.com/flows/74900d17-e21c-435a-a848-4c0ea23c8aa6).

### `[PATH-SET-IDENTITY-FIELD]` Email in account settings
**When:** Showing a sign-in identifier such as email.
**Do:** Show it read-only with an explicit Edit control and a Verified badge when verified. Edit starts `[PATH-SET-EMAIL-CHANGE]`. Never a plain input with a Save button.
**Builds on:** PATH-A, JOB-LABEL-CONTENT
**Basis:** observed. Seen: [Linear profile](https://mobbin.com/screens/a4e7fb71-dd94-4c1d-a5af-f032e03a10a9), [Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37), [Adobe flow](https://mobbin.com/flows/74900d17-e21c-435a-a848-4c0ea23c8aa6), [Airtable](https://mobbin.com/screens/441e5316-76a4-4e6b-80a3-88f2bf318839).

### `[PATH-SET-EMAIL-CHANGE]` Flow container and steps
**When:** The user chooses to change their email.
**Do:** A full page at its own route, not a dialog. Two steps shown with a Stepper. Step 1 is the new address, plus the current password when the session is not recent. Step 2 is the code. Follow `JOB-NAVIGATION-POSITION` for the Breadcrumb or Back link, and cap the form container at `--width-form-max`. Step 1 buttons are Cancel (returns to settings, address unchanged) and Next. Step 2 buttons are Back (returns to step 1 with the typed address kept) and Verify. Each step validates before the next. No retype-to-confirm field, since the code already proves the address works.
**Builds on:** JOB-MULTISTEP-GUIDE, PATH-C, JOB-NAVIGATION-POSITION, error-other-rules
**Basis:** decision. Om chose a full page so the flow can use a Stepper, which `JOB-MULTISTEP-GUIDE` requires for 2 to 5 steps. Most products reviewed use a dialog ([Discord flow](https://mobbin.com/flows/b0483890-8548-40c7-9511-05e386db741e), [Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37), [Adobe flow](https://mobbin.com/flows/74900d17-e21c-435a-a848-4c0ea23c8aa6)), and [AWS flow](https://mobbin.com/flows/58f8774d-1368-4ef1-84e8-37ae83c95aa0) uses a full page. Re-auth is seen in Discord and AWS, and the session-recency condition is judgment.

### `[PATH-SET-OTP-DELIVERY]` Where the code goes
**When:** Step 2 of the email change.
**Do:** Send the code to the new address. The current address stays active until the code verifies. The body names the exact address and offers a way back to correct it. State the code length, and state the expiry when the code expires. After a successful change, notify the previous address.
**Builds on:** PATH-SET-EMAIL-CHANGE
**Basis:** observed for sending to the new address ([AWS flow](https://mobbin.com/flows/58f8774d-1368-4ef1-84e8-37ae83c95aa0)), naming it, offering to change it ([Posh](https://mobbin.com/screens/6561161d-a2f6-491d-ba69-e132d6d082e8), [Eventbrite](https://mobbin.com/screens/837ae066-4bea-4ddf-b920-6b390e4411e7), [Walmart](https://mobbin.com/screens/a1d550f9-c27f-4da1-89f6-96aae5ae74df), [ManyChat](https://mobbin.com/screens/6ab3c8ac-4b3e-4647-96c4-d6db2f9de48a), [Pipedrive](https://mobbin.com/screens/4c42d71b-ed52-46d9-a638-1cefa769e83c)), stating length ([Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37), [Pipedrive](https://mobbin.com/screens/4c42d71b-ed52-46d9-a638-1cefa769e83c)), and stating expiry ([Hulu](https://mobbin.com/screens/ac1b7563-5a19-47bc-86af-1c7f48e507bc), [GoFundMe](https://mobbin.com/screens/a5d396fa-4222-4e5f-9b62-dff45b9a0e03)). Notifying the old address is judgment.

### `[PATH-SET-OTP-SUBMIT]` Verify button
**When:** The user enters the code.
**Do:** A primary Verify button in the step footer, replacing Next, disabled until every cell is filled. Back is the secondary. While verifying, show an inline Spinner in the button. Do not submit automatically on the last digit.
**Builds on:** PATH-COND-PRIMARY-BUTTON, JOB-LOADING-STATE, PATH-C
**Basis:** observed button pattern ([Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37), [Clerk](https://mobbin.com/screens/44a93746-df1c-4854-9f37-f9f0cbe73798), [Wix](https://mobbin.com/screens/685d877e-6337-4ab5-a8c6-79e0920c66e5), [Hulu](https://mobbin.com/screens/ac1b7563-5a19-47bc-86af-1c7f48e507bc)). No auto-submit is judgment.

### `[PATH-SET-OTP-RESEND]` Resend
**When:** The user did not receive the code.
**Do:** A text link under the field. After each send, disable it and show the remaining wait in or beside it. Do not hide it. The wait length is a product setting, not a Vois value. A resend clears the cells, because the old code stops working, and confirms with a toast.
**Builds on:** JOB-TRANSIENT-FEEDBACK, toast
**Basis:** observed. Seen: [Databricks](https://mobbin.com/screens/64cebb0a-3add-4a5d-9cea-3f7cd0029b26), [Copy.ai](https://mobbin.com/screens/fc081ca5-8e4b-4e9f-ac19-e679d12dcddf), [Clerk](https://mobbin.com/screens/44a93746-df1c-4854-9f37-f9f0cbe73798), [Posh](https://mobbin.com/screens/6561161d-a2f6-491d-ba69-e132d6d082e8), [Uvodo code](https://mobbin.com/screens/2e5e1693-71e4-4490-b49a-6215adb88b03), [ManyChat](https://mobbin.com/screens/6ab3c8ac-4b3e-4647-96c4-d6db2f9de48a). Clearing the cells is judgment.

### `[PATH-SET-OTP-ERROR]` Wrong or expired code
**When:** The code is wrong or has expired.
**Do:** Show the error inline directly under the field with righter's Helper Text, using an icon plus text, and put every cell in the error state. Keep the digits, selected so typing replaces them. Never a toast for this. An expired code also brings the Resend link into focus. Copy and component choice come from righter.
**Builds on:** error-decision-tree, helper-text, error-other-rules, DS-A11Y-017, JOB-TRANSIENT-FEEDBACK
**Basis:** observed inline ([Databricks](https://mobbin.com/screens/64cebb0a-3add-4a5d-9cea-3f7cd0029b26), [Copy.ai](https://mobbin.com/screens/fc081ca5-8e4b-4e9f-ac19-e679d12dcddf), [Clerk](https://mobbin.com/screens/44a93746-df1c-4854-9f37-f9f0cbe73798), [GoFundMe](https://mobbin.com/screens/a5d396fa-4222-4e5f-9b62-dff45b9a0e03), [Walmart](https://mobbin.com/screens/a1d550f9-c27f-4da1-89f6-96aae5ae74df)). Toast errors ([Uvodo code](https://mobbin.com/screens/2e5e1693-71e4-4490-b49a-6215adb88b03), [Posh](https://mobbin.com/screens/6561161d-a2f6-491d-ba69-e132d6d082e8)) lose to JOB-TRANSIENT-FEEDBACK. Selecting the kept digits is judgment.

### `[PATH-SET-EMAIL-CHANGE-DONE]` Success
**When:** The code verifies.
**Do:** Return to the settings page, show the new address in the row with the Verified badge, and confirm with a toast. Until then the row keeps showing the old address.
**Builds on:** PATH-SET-IDENTITY-FIELD, JOB-TRANSIENT-FEEDBACK
**Basis:** observed. Seen: [Adobe flow](https://mobbin.com/flows/74900d17-e21c-435a-a848-4c0ea23c8aa6), [Monarch flow](https://mobbin.com/flows/4075b4c5-07ec-4a8f-bf7e-ec810b669f37).

---

## Copy to get from righter

Do not write these. Request each from righter with the context shown.

| Slot | Context |
|---|---|
| Page title and the two Stepper step labels | Email change page |
| Body: code sent to address, with length and expiry | Step 2, address shown in bold |
| Link: change address | Returns to step 1 |
| Link: resend, active and cooling down | Cooldown shows remaining time |
| Helper text: incorrect code, expired code | Error variant under the cells |
| Toast: code resent, email updated | Success confirmations |
| Notice to previous address | Transactional email, see `righter/references/email.md` |

## Still not researched

- Lockout after repeated wrong codes
- Account recovery when the user has lost access to the old address
- Secondary or backup email lists
- Mobile web and iOS
