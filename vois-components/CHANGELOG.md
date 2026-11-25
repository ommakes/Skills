# Changelog

All notable changes to the `vois-components` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.40.0] - 2026-11-25

### Added
- **`JOB-CHOOSE-FROM-LIST`: a toggle chip branch.** Held-out task HELD-04 ("during onboarding, let the user quickly select all the topics they are interested in") was answered with a CheckboxCard grid by all 3 samples with skills, while the author and the no-skills control chose toggle chips. The tree had no branch for picking many from short labels outside a questionnaire. The new branch recommends ToggleChip: a pill that toggles on and off, in a wrapping row, with a check beside the fill when selected. Questionnaires and options with a description keep CheckboxCard. `ToggleChip` is listed in `component-names.json` with status `build`: the registry has no such item, and `vois-toggle-group` is a joined bar for formatting or view options.

### Changed
- **`DateInput` is a composed component.** It was `defer`, so the model named a DatePicker for HELD-09. It now has status `compose` from Input, Popover and Calendar, the same recipe as DatePicker, with the value rules in the `date` field type of `vois-fields`.

---

## [1.39.0] - 2026-11-25

### Changed
- **`JOB-TRANSIENT-FEEDBACK`: a field error is Helper Text.** The branch "Error tied to a specific input, field, or section" recommended an inline Alert, while vois-patterns and righter put a field error in Helper Text under the field. Phase 0 (Sonnet 5.5, 3 samples) followed vois-patterns every time on EVAL-005. The branch is now two: one field gets Helper Text under it (copy from righter); several errors in a section, or an error about the section, get an inline Alert at the top of the section plus Helper Text under each field with an error.
- **`JOB-OVERLAY-INTERACTION`: the phone filter Drawer is full screen.** The branch said "slides from the bottom", which reads as a half-height bottom sheet, and vois-patterns said "a full screen panel". Phase 0 answered "a full screen Sheet" on EVAL-043 and EVAL-055. The branch now says the Drawer is full screen on phone, slides up from the bottom, and is never a half-height bottom sheet because filters take text (`DS-RESPONSIVE-009`). The behavior is unchanged (`DS-PANEL-002`: every panel is full screen below `--breakpoint-md`); only the component name is now the same in both skills.

## [1.38.0] - 2026-11-25

### Added
- **Behavior cards: Drawer, Carousel, Resizable.** They come from the library source (Vaul 1.1.2, Embla 8.6.0, react-resizable-panels 4.24.2) and from browser tests, not from the Notion inventory pages. Each card says so in its basis note. Rows that were not checked are tagged `unchecked`: Vaul snap points and `dismissible`, Embla `loop` and right to left, and resizable collapse, Enter, F6, double click and saved layouts.
- **Registry items for all three** (registry 0.32.0): `vois-drawer`, `vois-carousel`, `vois-resizable`. Drawer, Carousel and Resizable are now `have` in `component-names.json` with their `card` field, and the retrieval index is regenerated.

### Changed
- The `registry.json` count in the `component-names.json` note said 37 items. It is 52.
- **The `shadcn` and `registry` fields of the ten names added in 1.37.1 are filled in.** Checked against shadcn-ui/ui at 055aa6b and `registry/registry.json`. Spinner, Badge, Card and Form ship in shadcn. Spinner, Stepper, Badge, Card and Panel have registry items (`vois-spinner`, `vois-stepper`, `vois-badge`, `vois-card`, `vois-panel`), which 1.37.1 left off, so their packets said "registry none". Stepper, Wizard, List, Panel and RichTextEditor ship no shadcn file of that name. AvatarGroup is exported from shadcn's `avatar` file, which is Avatar's name here, so its field stays null.
- **`JOB-SHOW-POLL-RESULTS` now names PollResults.** The job named no component, so the index could not send an agent to it. `PollResults` is in the `vois-questionnaire` registry item and is now in `component-names.json`. The two recommendations that show results (quiz and poll) end with "(PollResults in the vois-questionnaire registry item)". The wording before the bracket is unchanged, so no eval scenario changes.
- `retrieval.test.mjs` used Carousel as its example of a component with no card and no registry item. It uses Meter now, since Carousel has both.

## [1.37.1] - 2026-11-25

### Fixed
- **Ten names that jobs recommend can now be looked up.** Spinner, Stepper, Wizard, Badge, AvatarGroup, List, Form, Panel, RichTextEditor and Card were answers in `components-rules.json` jobs but missing from `component-names.json`, so `query.mjs <name>` said "not a component in the index". They are now in `outsideInventory` and link to their jobs. Their `shadcn` field is null because it was not checked against shadcn-ui/ui. The retrieval index is regenerated. Found by the Phase 0 baseline: all 55 `vois-eval` scenarios now name a component the index can resolve.

## [1.37.0] - 2026-11-25

### Added
- **Behavior cards: Progress, Separator, InputOTP.** Progress and Separator were checked against `radix-ui/primitives@eb3a2b7`; InputOTP against `guilhermerodz/input-otp@3daad8f` (1.5.0).
- What the cards found that differs from the Notion inventory:
  - **Progress:** Radix does not clamp. A value outside 0 to max turns the bar indeterminate and logs `console.error`. There is no `min` prop. The sweep and the still fill for reduced motion are yours to draw.
  - **InputOTP:** the completion event fires only when the code goes from partial to full, not when a full code is replaced by another full code. A pasted code with a space or a dash is rejected whole unless a paste transformer cleans it first (`vois-input-otp` does). The library has no accessible name, `aria-invalid` or `aria-describedby`.
- `component-names.json`: InputOTP, Progress and Separator are now `have` (registry 0.31.0), and their `card` fields put the three cards in the retrieval index (15 cards).

---

## [1.36.0] - 2026-11-25

### Added
- **Retrieval pilot (Phase 1 of `prds/jit-retrieval.md`).** `scripts/query.mjs` returns one small packet: for a component, its rules, behavior card summary, jobs, lookalikes, registry item and what is missing; for one or more jobs, their decision trees merged, with each named component listed once. Packets run 6 to 25 lines, against about 7,000 words for this skill and vois-tokens' `SKILL.md`. `SKILL.md` text is unchanged while the pilot is measured.
- `scripts/retrieval.mjs` builds `data/retrieval-index.json` and checks it. It fails when the index is stale, a `card` names no file, two components claim one card, a card has no component, a `ruleScopes` category or component does not exist, a scope is not a list (it never widens to every component), a `registry` value names a missing item, a cited rule does not exist, or an id or inventory name belongs to two components (a shared shadcn or registry name is allowed and resolves to the registry item, else comes back ambiguous). Malformed sources (a null card, rows that are not a list, a rule list given as a string) are reported, not crashes. `scripts/retrieval.test.mjs` tries to get past each check. 
- `component-names.json`: a `card` field on the 12 components with a behavior card, and `ruleScopes` (`DS-MODAL`: Dialog, AlertDialog, Drawer, Sheet; `DS-PANEL`: Sheet, Drawer; `DS-TABLE`: Table). 64 of the 247 vois-tokens rules link to a component; the other 183 are cross-cutting.
- What `--audit` shows today: `JOB-LABEL-CONTENT` and `JOB-SHOW-POLL-RESULTS` name no known component (Badge and the poll rows are not in `component-names.json`), and 26 components are named by no job, among them `Menubar` and `NavigationMenu`, which have cards (the decision trees say "Navigation", not the component names).

---

## [1.34.0] - 2026-11-25

### Added
- **Icons in labeled buttons.** A new "Icons in Labeled Buttons" section in `SKILL.md` extends Job 8 (`JOB-TRIGGER-ACTION`): default is no icon, a trailing icon for a button that opens a menu or navigates away, a leading icon only for the approved symbols, and rules for groups, one icon per button, the ellipsis, loading, destructive buttons, accessibility and RTL. Three Quick Reference rows for it. `JOB-TRIGGER-ACTION` in `data/components-rules.json` gains a decision branch and three rationale entries.

---

## [1.33.0] - 2026-11-24

### Added
- **Behavior cards: Menubar, Pagination, Toast, Navigation menu, Calendar** (`behaviors/<id>.json` with the generated `.md`), for the five registry 0.28.0 items. Menubar, Toast and Navigation menu were checked against `radix-ui/primitives@eb3a2b7`. Calendar was checked against `react-day-picker@10.0.2`. Pagination is plain shadcn markup, so its evidence is the Vois item file.
- What the cards found that differs from the Notion inventory:
  - **Menubar:** Radix has no safe triangle, does not open on Arrow Up, and blocks Tab inside an open menu. `vois-menubar` now adds all three (registry 0.30.0). A disabled trigger still leaves the tab order, and an outside click still passes through.
  - **Toast:** Radix `type` is urgency only, so success and error looks come from the Vois `variant`. Swipe direction is one per provider. The timer pauses on window blur, not on a hidden tab.
  - **Navigation menu:** hover is always on, only Cmd keeps a panel open on link click, arrow keys do not wrap, and panels have no collision flip.
  - **Calendar:** disabled days are not focusable, the caption is a status span and not a heading, today has no `aria-current` in the library (`vois-calendar` adds it in registry 0.30.0), and single mode deselects unless `required` is set.
  - **Pagination:** the shadcn `ul` has no `role="list"`. `vois-pagination` now adds it (registry 0.30.0).
- Stacking, promise toasts, range preview, read only mode and page-count math are tagged `supply`.
- `component-names.json`: Menubar, Pagination, Toast, NavigationMenu and Calendar are now `have`. The Toast note says the item is built on Radix Toast, not Sonner.

---

## [1.32.0] - 2026-11-23

### Added
- **Behavior card: Alert dialog** (`behaviors/alert-dialog.json`, with the generated `.md`), for the new `vois-alert-dialog` item (`registry` 0.27.0). Checked against `radix-ui/primitives@eb3a2b7` (alert-dialog, dialog, dismissable-layer).
- What the card found that differs from the Notion inventory:
  - **Focus on open:** Radix focuses `AlertDialogCancel`, not the first answer in the footer. If you pass your own `onOpenAutoFocus` and call `preventDefault`, the Cancel focus is skipped.
  - **Tab trap:** the page behind is hidden with `aria-hidden`, not `inert`. The card does not cite `DS-MODAL-001` for the same reason as the Popover card.
  - **Motion:** the Vois item fades and scales, as `vois-dialog` does. It does not slide up.
  - **Nested dialogs:** only Escape handling is native. Radix does not mark the dialog underneath.
  - **Missing description:** this Radix version does not warn about it.
- Pending state, shortcut and the confirm helper are tagged `supply`.
- `component-names.json`: AlertDialog is now `have` (`vois-alert-dialog`).

## [1.31.0] - 2026-11-23

### Added
- **Three more behavior cards: Popover, Accordion and Toggle group** (`behaviors/popover.json`, `accordion.json`, `toggle-group.json`, with the generated `.md`). They cover the three registry items built in `registry` 0.23.0 to 0.25.0. The tags were checked against the Radix source (`radix-ui/primitives@eb3a2b7`, packages popover, accordion, collapsible, toggle-group, toggle, roving-focus, popper, dismissable-layer and focus-scope).
- Things the cards found that differ from the Notion inventory, each marked `differs` with a note:
  - **Popover:** Radix has two modal modes, not three, and the modal mode uses `aria-hidden`, not `inert`. Every trigger under one root shows as open.
  - **Accordion:** Radix has no default `type`, a single accordion needs `collapsible` to close by pressing again, Arrow, Home and End move focus (the inventory says they do nothing), a disabled heading leaves the tab order, and the heading is always an `h3`.
  - **Toggle group:** Arrow keys skip disabled toggles, and Radix gives a single group radio roles and a multiple group the toolbar role.
- The Popover card does not cite `DS-MODAL-001`: that rule is for custom, non-Radix dialogs and asks for `inert`, which Radix Popover does not use.
- The Toggle group card leaves out the Notion lines about a single Toggle, because there is no `vois-toggle` item.

### Fixed
- `scripts/behaviors.mjs`, found by a fresh review (a reviewer that had not seen the work):
  - A leftover `.md` with no card, and a card file named like `Tabs.JSON` (never read as a card), now fail.
  - A field of only spaces counts as empty (`text`, `evidence`, `note` and the other required strings). Before, `evidence: "   "` passed a `native` row.
  - A behavior id must be the card prefix plus exactly three digits. Before, a `tabs` card could use `BHV-TABS-TWO-001`, which belongs to a `tabs-two` card.
  - `basis.checkedAt` must be a real date. Before, `9999-99-99` passed.
  - Only `native` and `differs` rows can carry evidence. Before, only `unchecked` was blocked.
  - Schema shapes the checker skips are now errors: an object `additionalProperties`, keywords next to `$ref`, and a list `type`. An invalid `pattern` is reported, not thrown.
  - The generated `.md` keeps free text on one line, so a newline in a card cannot start a heading.
  - The schema text named `scripts/check-behaviors.mjs`. The file is `scripts/behaviors.mjs`.
  - 22 tests (was 14). Each new guard was removed in a copy, and a test failed every time.

## [1.30.0] - 2026-11-23

### Added
- **Component behavior cards (pilot).** `behaviors/<id>.json` holds, for one component, how it must behave: interaction, keyboard, focus, state and accessibility. Each line has a stable ID (`BHV-TABS-004`) and a support tag: `native`, `differs`, `supply`, `decide` or `unchecked`. The tag says what the library gives you and what you must build. The first three cards are Tabs, Dialog and Combobox. The `.md` next to each card is generated from the JSON. The behaviors come from the Notion UI SDK inventory (2026-11-21). The `native` and `differs` tags for Tabs and Dialog were checked against the Radix source (`radix-ui/primitives@eb3a2b7`). Every `native` or `differs` line carries its evidence.
- `data/behavior-card.schema.json` and `scripts/behaviors.mjs` check the cards. They fail on a `native` line without evidence, an `unchecked` line with evidence, a wrong or repeated ID, a rule link that is not in `vois-rules.json`, and a stale `.md`. Tests are in `scripts/behaviors.test.mjs`.
- `data/component-names.json` maps the 55 components in the Notion inventory to one name, with the shadcn/ui file, the Vois registry item and a status (`have`, `covered`, `build`, `compose`, `defer`, `skip`).

### Notes
- Combobox has 23 of 33 lines tagged `unchecked`. shadcn's Combobox is built on Base UI, not Radix, and that source has not been read yet.
- The Dialog card keeps nested dialogs as `decide`: the inventory describes a dialog stack, and `DS-MODAL-006` says never nest modals.
- The Tabs card has three `differs` lines where Radix does not match the inventory: no default selected tab, disabled tabs skipped by arrow keys, and every panel is a tab stop.
- The Notion Combobox page cited `DS-MODAL-001` for "the page stays usable while the list is open". That rule is about custom modal dialogs, so the card does not link it.

## [1.29.0] - 2026-11-19

### Added
- **IconButton for icon-only actions.** `JOB-TRIGGER-ACTION` now picks `IconButton` (the registry's new `vois-icon-button`, registry 0.22.0) for a single icon-only action: its `label` is required, so the accessible name cannot be left out, and it is also the tooltip. Button with an icon size and an `aria-label` stays the fallback where IconButton cannot be added. A new rationale says why: Button keeps its loose types so shadcn's own components keep compiling. The lookalike row for a raw icon `<button>` points to IconButton, or to InputGroupButton inside a field (vois-tokens `DS-ICON-006`). The "What You Must Supply" row for icon buttons says IconButton requires the name.
- **When to use the three registry items the skill did not name:**
  - `ButtonGroup` (`vois-button-group`) in `JOB-TRIGGER-ACTION`: a few related actions that read as one control (formatting actions, a split button). Not for choosing a view: `JOB-SWITCH-VIEWS` gains a rationale saying why that is a SegmentedControl or Tabs. Icon actions grouped as one control are outline IconButtons in a ButtonGroup.
  - `SwatchPicker` (`vois-swatch-picker`) in `JOB-CHOOSE-FROM-LIST`: one color from a fixed set, with the reason a Select with colored dots or a free color picker is wrong.
  - `ScrollArea` (`vois-scroll-area`) in `JOB-CONTAIN-CONTENT`: content taller than a fixed region inside the page, not the page itself, with the reason a plain `overflow: auto` box falls short there.
- Quick Reference rows for all four.

### Fixed
- The Job Index said the JSON holds "all 21 jobs". It holds 24.

## [1.28.0] - 2026-11-16

### Added
- "What You Must Supply" table in `SKILL.md`: for ten components, the name, label, description or live region the caller must provide, each pointing at `DS-A11Y-029` to `DS-A11Y-037` (and `007`, `019`). The rules are in vois-tokens 1.45.0.

## [1.27.0] - 2026-11-15

### Changed
- `JOB-TRIGGER-ACTION`: an icon-only action is a Button with an icon size (`icon-sm` 28, `icon` 36, `icon-lg` 48, one step up on a coarse pointer) and an `aria-label` that names the action. It names the two styles (`ghost`, and `soft` for a light gray resting fill) and points to vois-tokens `DS-ICON-003` to `DS-ICON-007` for size, spacing, placement and style. The hit-area answer names `--hit-area-coarse`.

## [1.26.0] - 2026-11-15

### Added
- `JOB-ANSWER-CHOICE-QUESTION`, `JOB-ANSWER-SCALE-OR-RANK` and `JOB-SHOW-POLL-RESULTS` (jobs 22 to 24). The job count is now 24.

## [1.25.0] - 2026-11-15

### Changed
- `JOB-OVERLAY-INTERACTION`: the Sheet branch for "the user wants to see the page behind it" now covers the side peek: when the user must keep working in the page (compare, copy, pick rows), use the Sheet with no scrim, no inert background and no focus trap. The modal rules do not apply to a peek. "Action sheet pattern" is now "the bottom sheet pattern".
- `JOB-CONFIRM-DESTRUCTIVE`: a rationale entry says focus starts on Cancel in an AlertDialog, never on the destructive button (`DS-A11Y-020`).

## [1.24.0] - 2026-11-14

### Changed
- A "`vois-fields` for specialized inputs" paragraph in `SKILL.md` (Relationship to Other Skills) points to the new `vois-fields` skill for specialized values, and says the one-time code input must take a pasted or autofilled code. No rule data changed, no new job, no change to which component is chosen. The note is premium wording: the public mirror has no `vois-fields`.

## [1.23.0] - 2026-11-14

### Changed
- Pointers to three more registry items for a project that has none: `vois-dropdown-menu` (`JOB-TRIGGER-ACTION`, `JOB-EXPOSE-ACTIONS`), `vois-command` (`JOB-EXPOSE-ACTIONS`, `JOB-CHOOSE-FROM-LIST`) and `vois-dialog` (`JOB-OVERLAY-INTERACTION`). `vois-button-group`, `vois-collapsible` and `vois-scroll-area` have no job yet; they are in the registry README.

## [1.22.0] - 2026-11-14

### Added
- Lookalike row `LOOKALIKE-012` (watch tier): a round `div` or `span` with an image or initials as a person's picture, instead of Avatar (`JOB-REPRESENT-USER`; the registry's `vois-avatar` if the project has none). It has a detector in `vois-tokens` 1.31.2.

### Changed
- Pointers to thirteen new registry items, for a project that has none: `vois-tooltip` (`JOB-CONTEXTUAL-INFO`, `LOOKALIKE-011`), `vois-badge` (`JOB-LABEL-CONTENT`), `vois-avatar` (`JOB-REPRESENT-USER`), `vois-stepper` (`JOB-MULTISTEP-GUIDE`, `LOOKALIKE-004`), `vois-segmented-control` (`JOB-SWITCH-VIEWS`, `LOOKALIKE-003`), `vois-input-group`, `vois-field` and `vois-textarea` (`JOB-ACCEPT-TEXT`), `vois-choice-list` and `vois-choice-card` (`JOB-CHOOSE-FROM-LIST`, `JOB-BINARY-PREFERENCE`), `vois-card` (`JOB-CONTAIN-CONTENT`, including the whole-card link), `vois-panel` (`JOB-SECONDARY-CONTENT`) and `vois-hover-card` (`JOB-CONTEXTUAL-INFO`).
- `references/stepper.md` matches the Figma Stepper: current and complete markers are `--base-positive`, and connectors are 2px.

## [1.21.0] - 2026-11-13

### Changed
- Switch views (`JOB-SWITCH-VIEWS`) points to the registry's `vois-tabs`: pill by default, underline with `variant="underline"`. The "Tabs styled as pills" branch says the item is pill by default.
- Choose from a list (`JOB-CHOOSE-FROM-LIST`, only 2 options), Capture a binary preference (`JOB-BINARY-PREFERENCE`, mutually exclusive) and `LOOKALIKE-003` point to the registry's `vois-radio-group` when a project has no RadioGroup.

## [1.20.0] - 2026-11-13

### Changed
- Capture a binary preference (`JOB-BINARY-PREFERENCE`) points to the registry's `vois-switch` (32 x 20 on web, 52 x 32 native) and `vois-checkbox` when a project has neither.

## [1.19.0] - 2026-11-13

### Changed
- `LOOKALIKE-001` and Job 8 (`JOB-TRIGGER-ACTION`) point to the registry's `vois-button` item when a project has no Button yet. Job 8 states the 36px web and 48px native default (`vois-tokens` `DS-COMPONENT-007`).
- The Lookalikes section says to check the registry for a Vois version before reaching for stock shadcn.
- Choose from a list (`JOB-CHOOSE-FROM-LIST`) and Accept text (`JOB-ACCEPT-TEXT`) point to the registry's `vois-select` and `vois-input` and their heights.
- `LOOKALIKE-002` and the loading job (`JOB-LOADING-STATE`) point to the registry's `vois-spinner`. Inside a Button, they point to its `loading` prop.

## [1.18.1] - 2026-11-13

### Changed

- `LOOKALIKE-010` says to use Alert with the `notice` role, not `warning`, following `vois-tokens` 1.29.0, where the status token names come from Figma.

## [1.18.0] - 2026-11-12

### Added

- **`panel_roles`** on `JOB-OVERLAY-INTERACTION` and `JOB-SECONDARY-CONTENT` in `data/components-rules.json`. It tags Sheet and Drawer as `overlay-panel` and Panel as `push-panel`, with the `DS-PANEL-*` rule that sets their width. This is the first step of the role vocabulary suggested in the private framework-neutrality audit. Decision text is unchanged.

---

## [1.17.0] - 2026-10-26

### Changed

- **Filters or sort controls for a list or table on a mobile layout go in a Drawer, not a Sheet.** `JOB-OVERLAY-INTERACTION` had a Sheet branch for a task where the user wants to see the page behind it, and `JOB-SECONDARY-CONTENT` sent "filters on mobile" to a Drawer. A filter task on a list fits both descriptions, and agents given a prompt about mobile filters chose Sheet. The overlay job now has a last branch that says Drawer and that it takes precedence over the Sheet branches, with a rationale entry for why and a line in its at-a-glance list. The branch is last so existing `tree_path` indexes do not move.

### Notes

- No other branch changed. `vois-patterns/references/table-list.md` still calls the right-anchored Sheet a "Drawer" in its own wording for opening a record from a row; that naming clash is not touched here.
- `vois-eval` has a scenario for the new branch (EVAL-055, `tree_path` `[6]`), not yet run blind. The design task DT-04 notes now say the conflict is settled.
- **Version bump:** `1.16.0` → `1.17.0`

---

## [1.16.0] - 2026-10-26

### Added

- **`verification` and `detector` on the lookalike table.** The nine rows that `vois-tokens` checks (`LOOKALIKE-001`, `002`, `003`, `005`, `007`, `008`, `009`, `010`, `011`) are marked `detector` and name the check. `LOOKALIKE-004` and `LOOKALIKE-006` are `judgment`. `scripts/check-verification.py` fails if a row and the registry disagree.

### Notes

- No job, decision tree or lookalike wording changed. Decision-tree jobs have no `verification` field, because none of them has a check yet.
- **Version bump:** `1.15.2` → `1.16.0`

---

## [1.15.2] - 2026-10-21

### Fixed

Review findings on `references/motion-logic.md` and its test. Each has a test in `scripts/motion-logic.test.mjs`, and the new ones fail against the 1.15.1 doc.

- **`alignLabels` could pick a scattered alignment when a contiguous one was as long.** The walk broke ties greedily, so `ab` to `aXab` kept `a(0,0)` and `b(1,3)`, which are not neighbours, and crossfaded. It now scores every alignment by stays first and runs second (a run is two stays that are neighbours in both texts), so it keeps `a(0,2)` and `b(1,3)` and morphs. The result is still a longest common subsequence. Labels that already morphed or crossfaded give the same answer, apart from ties like this one.
- **The identical-text shortcut did not hold "at any length".** It sat after the 48-grapheme guard, so a long label compared with itself returned no ops. It now sits above the guard. The 1.15.1 entry and the "Check your port" line were right about the intent and wrong about the code.
- **`trayPlan`'s `to: null` had no caller.** The type is `number | null`, and a port that wrote `plan.to + "px"` produced `nullpx`. The doc now ships `heightFor(to)`, which gives `auto` for `null`, and the check line names it.

### Changed

- **Migration note for `withinRateLimit` (changed in 1.15.1).** `times` must hold earlier updates only, and the check is "fewer than `max` of them in the last second". A caller that passes an array which already includes the current update now hits the limit one update early (a `max` of 2 allows one). Drop the current update from the array, or pass `max + 1`.
- **Wording matches the private repo.** `motion-logic.md` is the same file as in `ommakes/vois-skills`, where a size cap on motion references forced shorter comments and two shorter sentences. The code is unchanged. No behavior changed, so there is no version bump.
- The test now strips each code block on its own, so a syntax slip names its block. It checks that no two blocks declare the same name and that every exported helper in the doc reaches the module, instead of relying on a hard-coded name list alone. It stops with a clear message when `module.stripTypeScriptTypes` is missing (Node older than 22.13). The reduced-motion test no longer leaves `window.matchMedia` behind as `undefined`. A seeded fuzz test checks that `alignLabels` rebuilds both texts, keeps a longest common subsequence, and finds a run whenever one exists at that length.
- **Version bump:** `1.15.1` → `1.15.2`

---

## [1.15.1] - 2026-10-10

### Fixed

Review findings on the helpers in `references/motion-logic.md`. Each has a test in `scripts/motion-logic.test.mjs`.

- **`parseCubicBezier` accepted malformed curves.** An empty segment (`cubic-bezier(1,,3,4)`) read as 0, and an x value outside 0 to 1 (`cubic-bezier(2,0,0,1)`) was kept. Both now return `null`, which means no motion. y values may still leave 0 to 1, as in CSS.
- **`parseCssTimeToMs` accepted a negative duration** (`-250ms` gave -250). A leading sign is now unreadable and gives `null`.
- **`trayPlan` handed back an untrusted height.** A bad target (`NaN`, zero or negative) returned `{ approach: "instant", to: <the bad value> }`. It now returns `to: null`, meaning set `height: auto`. A bad start height with a good target still returns the target.
- **`withinRateLimit` disagreed with its own comment.** The comment said the count includes this update. The code counted only earlier ones and allowed one more than the limit. It now allows an update while fewer than `max` earlier ones fell in the last second, so a `max` of 2 allows two per second, not three. `times` holds earlier updates only.
- **`alignLabels` answered differently for identical text.** `Save` to `Save` morphed and `A` to `A` did not. Identical text now returns all stays and `morphs: false` at any length.

### Changed

- The test no longer uses a wall-clock assertion for the 48-grapheme cap. It checks that 48 graphemes align and 49 do not. It now runs the reduced-motion and bad-token paths of `readMotionMs`, `readMotionEase` and `prefersReducedMotion` against a stubbed `window` and `document`.
- **Version bump:** `1.15.0` → `1.15.1`

---

## [1.15.0] - 2026-10-09

### Fixed

- **The label morph broke the duration cap.** `motion-morphs.md` ran the old text out for one token and then the new text in for another. At `--motion-duration-base` that is 500ms, over `DS-ANIMATION-001`. Old and new now overlap inside one token (`DS-MOTION-003`).

### Added

- **`references/motion-tray.md`**: a tray (one container, steps swap inside it, bottom edge pinned) and its lifecycle (open, expand to a full screen, button relocation, dismiss). Resize approaches are ranked from a benchmark kept next to the PRD, with the limits stated.
- **`references/motion-context.md`**: shared element context (dim and blur around a traveller, container expansion, shrink into depth, indicator hand-off), chart range change, collapse to indicator, and small state changes (disabled to enabled, progress segments, placeholder to value, toast).
- **Label and text morph v2** in `motion-morphs.md`: shared letters can sit anywhere in the word (Craft to Creative), stay letters travel to their new places, an icon can enter or leave with the label, counters use the digit keys, titles and one-line sentences qualify, and a noise rule sends scattered matches to a crossfade.
- **Typed input and scrub** in the number section: digits keyed by typing order, separators as elements, fit to width, and a scrub that rolls with the finger.
- **Regroup and multi-select drag** in the reorder section. Stagger stays banned.
- **Helpers in `motion-logic.md`**: `alignLabels`, `keyedTypedChars`, `enterLeaveKeys`, `fitScale`, `resampleSeries`, `morphSeries`, `trayPlan`. Each has a "Check your port" line.
- **`scripts/motion-logic.test.mjs`** runs every code block in `motion-logic.md` and checks every "Check your port" line, the existing ones included. Each new guard was broken on purpose in a scratch copy and the suite failed. It needs Node 22.13 or newer.
- **`JOB-OVERLAY-INTERACTION`** has a tray branch, added last so existing `tree_path` indexes do not move.

### Changed

- The motion specs are split across three files so each loads only when its pattern is chosen. Cross-references to the moved specs name the file and heading, not a section number. Section numbers still exist inside `motion-morphs.md` and `motion-logic.md`.
- Icon morph names `close` to `back` as a declared pair and points to `DS-SURFACE-014` for the crossfade.
- Directional transition speed follows frequency: fast or instant for tab bars, base for steppers.
- **Version bump:** `1.14.0` → `1.15.0`

---

## [1.14.0] - 2026-10-09

### Added

- **Status button spec** (`references/motion-morphs.md`, section 8). A button that shows idle, working and done: the three states crossfade in one grid cell, the fill blends to the success color as the indicator becomes a check, the check scales from 0.9, and the done state holds for 500ms at most. The button is never disabled, the accessible name follows the state, and a polite status line next to the button announces each change.
- **Input source helper** (`references/motion-logic.md`, section 4). A small tracker for whether the last input was a keyboard or a pointer, for `directionFor`. It installs when the module loads, so the first keypress is counted.

### Changed

- The `motion-logic.md` plans section is now section 5.
- `SKILL.md` counts eight morphs and names the status button.
- **Version bump:** `1.13.0` → `1.14.0`

---

## [1.13.0] - 2026-10-09

### Added

- **`references/motion-logic.md`**: the pieces of the morph specs that are easy to get wrong, as plain TypeScript with no dependencies. Token reading, label split, digit keys, icon and direction plans, and the grow origin. Each section lists expected outputs to check a port against.

### Changed

- **`references/motion-morphs.md` no longer points at the Vois app repo.** It said the reference implementations live there, which readers of this skill cannot see. The specs now stand alone, with `motion-logic.md` for the logic and `vois-tokens/references/animation.md` for token values.
- The label morph's distance line points at where the value comes from.
- **Version bump:** `1.12.0` → `1.13.0`

## [1.12.0] - 2026-10-09

### Added

- **Specs for the four P1 morphs** in `references/motion-morphs.md`: icon morph (declared pairs rotate one shared icon, everything else crossfades), directional transition (slide from the index change, keyboard moves do not slide, reduced motion crossfades), grow-from-trigger (transform origin from the trigger, start at scale 0.9 or more, fade in place under reduced motion), and reorder motion (transform travel, no stagger, instant under reduced motion).
- The "Still not specced" note now says the seven morphs are the complete set. New morph types need a spec before code.

### Changed

- **Version bump:** `1.11.0` → `1.12.0`

---

## [1.11.0] - 2026-10-09

### Added

- **`references/motion-morphs.md`**: specs for three morphs, the P0 set. Label morph (grapheme-aware prefix and suffix split, crossfade when nothing is shared, final label exposed once), shared element transfer (one identity, transform only, crossfade fallback when the target is missing), and number ticker (locale-aware parts, place-value keys, rate limit, one polite announcement). Each lists its tokens and its reduced-motion fallback. The P1 morphs are not specced yet.

### Changed

- The "Component specs" paragraph in `SKILL.md` points at the new reference.
- **Version bump:** `1.10.3` → `1.11.0`

---

## [1.10.3] - 2026-10-07

### Fixed

- **Lookalike `signal` text now matches what the checks do.** An independent review ran the `vois-tokens` detectors against each row. `LOOKALIKE-008` said a plain `>x<` inside a button, but the check only matches `×`, `✕`, `✖` and `&times;`. `001` needs the ring in the same tag and also matches `focus-visible:outline`. `003` is also skipped by a `toggle-group` import. `005` covers `li` and `p` and skips a handler that calls `stopPropagation`. `007` needs a delay of 1.5s or more, also matches `""`, and skips loading and saving setters. `009` ignores a function the file declares, `010` covers any status palette color, and `011` lists the elements checked. Each row's `signal` now says exactly that.

### Changed

- **Version bump:** `1.10.2` → `1.10.3`

---

## [1.10.2] - 2026-10-06

### Fixed

- **`JOB-SWITCH-VIEWS` and `PATH-A` disagreed.** The job said Tabs for a settings page (Profile, Billing, Members), while `PATH-A-DEPTH-DEEP` in `vois-patterns` says 4 or more sections use a sidebar with sub-pages. A blind build of a four-section settings screen followed the pattern and missed the job's answer (EVAL-034). The Tabs branch now says a settings page with 4 or more sections uses sidebar navigation instead.

- **Breadcrumb or back link, decided.** `PATH-E` puts a breadcrumb above the title of a record page, while `JOB-NAVIGATION-POSITION` gave a back link for one level deep, so a detail page reached from its list could go either way (EVAL-038). The job now counts Home as the first level: 3 or more levels gets a Breadcrumb, and 2 levels (Home > Page) gets a back link. A record page opened from its list is 3 levels and gets a Breadcrumb. The tree, rationale and Quick Reference all say this now. A back link is labeled with the parent page name, or just "Back" when the parent is Home.

### Changed

- **Version bump:** `1.10.1` → `1.10.2`

---

## [1.10.1] - 2026-10-06

### Fixed

- **`references/stepper.md` forced the last step to be a result.** It said the last step is a result such as "Done" with no Next. That contradicted `PATH-SET-EMAIL-CHANGE`, whose last step is code entry with Verify, and it pushed five-step flows to six. It now says the last step ends the flow with its own primary button (Verify, Create, Finish), a closing "Done" step is optional, and a Done step counts toward the 5-step limit.

### Changed

- **Version bump:** `1.10.0` → `1.10.1`

---

## [1.10.0] - 2026-10-06

### Added

- **Lookalikes.** A table of shortcuts agents take when they build something that looks like a component but isn't one, each with the component to use instead. `data/components-rules.json` has the rows (`lookalikes`): 4 `observed` in 40 blind builds and 7 `watch` rows that an existing rule already forbids but were not seen. `SKILL.md` has a short two-table version.
- A line on prompts that describe a look: pick the component by its job, then style it.

### Fixed

- `data/components-rules.json` `source` pointed at `vois-components/references/*.md` for the job trees, which live in `SKILL.md`. It now names both.

### Changed

- **Version bump:** `1.9.0` → `1.10.0`

---

## [1.9.0] - 2026-10-06

### Added

- **`references/stepper.md`,** the Stepper spec: what it is and isn't, anatomy, the four states, behavior, layout, motion, and accessibility. shadcn/ui ships no Stepper, so agents were hand-building one with no spec. Marked `judgment`.
- **Two "why not" entries and one naming entry** on `JOB-MULTISTEP-GUIDE`: why not Tabs for steps, why the limit is 5 and 6, and that a plus and minus control is a quantity control, not a Stepper.

### Fixed

- **Stepper and Wizard overlapped at exactly 5 steps.** The tree said 2 to 5 for a Stepper and 5 or more for a Wizard. It now says 2 to 5 steps that fit a page container for a Stepper, and 6 or more, or any step that needs its own full page, for a Wizard.

### Changed

- **Version bump:** `1.8.1` → `1.9.0`

---

## [1.8.1] - 2026-10-02

### Fixed

- **`source_file` in `data/components-rules.json`** pointed 20 jobs at seven reference files (`references/overlays-and-containers.md` and others) that no longer exist. They now point to `SKILL.md`, where each `JOB-*` ID is tagged. `SKILL.md` now says the JSON is the only source for decision-tree content.

---

## [1.8.0] - 2026-10-02

### Changed

- **`JOB-OVERLAY-INTERACTION`** gains a branch for opening a record from a table row: Sheet for 8 or fewer fields and no related records, full page for big records, Dialog only for confirmations. Matches `PATH-B-ROW-OPEN` in vois-patterns 1.11.0.
- **`JOB-DISPLAY-DATA`** gains paging (pagination, virtualization only for thousands of rows) and in-table editing branches.
- **`JOB-LOADING-STATE`** gains a table branch: skeleton rows under real headers on first load, stale rows kept on refetch.
- **`JOB-EMPTY-CONTENT`** gains empty-by-nature, empty-by-permission, and plan-limit cases.
- Quick Reference gains two rows.

---

## [1.7.0] - 2026-10-01

### Added

- **`JOB-VISUALIZE-DATA`** (job 21): charts, KPI tiles, sparklines and dashboards. A single value is a stat tile in a Card; everything else hands the form choice to the new `vois-dataviz` skill; dashboard containers are Card, Tabs, one filter row, Skeleton and per-state empty and error handling. `SKILL.md` Quick Reference, Job Index and Relationship section updated; `data/components-rules.json` gains the entry.

---

## [1.6.0] - 2026-10-01

### Added

- **`JOB-ACCEPT-TEXT` gains an InputOTP branch** for a fixed-length one-time code (email or SMS verification, authenticator), with a "Why not a plain Input?" rationale. Check the exact component name against the workspace manifest. `SKILL.md`'s Quick Reference and `README.md` updated.

### Changed

- **`JOB-ACCEPT-TEXT`** textarea guidance now points to `field-sizing: content` (`DS-LAYOUT-FIELD-001`) and the line-count tokens instead of "set rows" and "auto-resize".
- **`JOB-EXPOSE-ACTIONS`** now says two visible actions is the target and three is the ceiling.
- **`JOB-TRIGGER-ACTION` rationale** no longer states 44×44px; it points to `var(--hit-area-min)`.

---

## [1.5.0] — 2026-09-12

### Added

- **`JOB-OVERLAY-INTERACTION` gains an explicit Popover branch** for editing exactly one field/value anchored to the specific row/item that triggered it (e.g. changing one row's status inline from a table). Previously, a single-field edit that also "related to an item in a list" satisfied both the Dialog branch's condition (1-4 fields, self-contained) and the Sheet branch's condition (relates to a list item) with nothing to disambiguate them — confirmed as a real gap by running `vois-eval`'s scenario set blind against a fresh agent, which reasoned its way to a defensible third answer (Popover, via `JOB-CONTEXTUAL-INFO` + `JOB-DATA-ENTRY`) that the decision tree never explicitly ruled in or out. Sheet's condition is now scoped to "a handful of fields or more" so the two branches no longer overlap. Two new rationale Q&As explain the Popover/Sheet boundary in both directions. `SKILL.md`'s Quick Reference table, `README.md`'s job-pairs table, and the Figma edition all updated to match.

---

## [1.4.2] — 2026-07-23

### Fixed

- **Tool name correction** — every reference to `record_component_choice` and `report_pattern_gap` updated to the real registered MCP tool names, `vois_record_component_choice` and `vois_report_pattern_gap`. The "optional if available" framing (added in the standalone rework) is unchanged — only the name was wrong, not the optionality. `vois_report_pattern_gap`'s example call also gains its real required arguments (`skillVersion`, `userGoal`, `attemptedFallback`, `reasoning` — not `description`/`closestPathId`/`gapDescription`).

---

## [1.4.1] — 2026-07-23

### Removed

- The seven `references/*.md` files (`feedback-and-confirmation.md`, `overlays-and-containers.md`, `navigation-and-switching.md`, `selection-and-input.md`, `contextual-info-and-actions.md`, `display-and-identity.md`, `forms-and-process.md`) are deleted — confirmed fully redundant with `data/components-rules.json` (every decision tree node and "why not X" rationale traced back 1:1) now that the JSON has been verified in use. `SKILL.md`'s Job Index no longer lists file paths; it maps Job ID → job name directly.
- **Version bump:** `1.4.0` → `1.4.1`

---

## [1.4.0] — 2026-07-23

### Added

- **`data/components-rules.json`** — all 20 `[JOB-...]` decision trees as structured `condition → recommendation` nodes (including nested sub-branches), with every "Why not X?" explanation preserved as a `rationale` entry — the reasoning is what makes a recommendation defensible, so it isn't dropped in the conversion.

### Changed

- `SKILL.md`'s Job Index now points to `data/components-rules.json` for programmatic lookup by `id`/`number`, alongside the existing per-file table for prose reading.
- **Version bump:** `1.3.0` → `1.4.0`

---

## [1.3.0] — 2026-07-21

### Changed

- **Standalone-safe:** `record_component_choice` and `report_pattern_gap` are now optional — call them if that MCP tool is available in your environment, otherwise proceed with your selection. Frontmatter `description` no longer states the MCP call as a requirement. This skill no longer assumes an MCP server, `vois-router`, or `vois-loop` is present.
- **Version bump:** `1.2.1` → `1.3.0`

---

## [1.2.1] — 2026-06-17

### Changed

- Updated cross-references from `vois-design-system` to its new name, `vois-tokens`.

---

## [1.2.0] — 2026-06-17

### Changed

- **Structural restructure:** `SKILL.md` split from a single 543-line file into a 107-line entry point plus seven `references/` files (`forms-and-process.md`, `navigation-and-switching.md`, `display-and-identity.md`, `selection-and-input.md`, `contextual-info-and-actions.md`, `overlays-and-containers.md`, `feedback-and-confirmation.md`), grouped by job. Only the Quick Reference table and job index remain in `SKILL.md`. No job content was added, removed, or reworded — every `[JOB-*]` ID is preserved.
- **Version bump:** `1.1.0` → `1.2.0`

---

## [1.0.0] — 2026-05-23

### Added

**Initial release of component selection skill.**

- 20 job-to-be-done rubrics covering the most ambiguous shadcn/ui component pairs
  - Dialog vs Drawer vs Sheet (overlay interactions)
  - Toast vs Banner vs Alert (transient feedback)
  - Select vs Combobox vs Command (selection surfaces)
  - Tooltip vs Popover vs HoverCard (contextual info)
  - Button vs IconButton vs LinkButton (actions)
  - And 15 more decision trees

- Decision tree format with max depth 3 for clarity
- "Why not X" explanations for each rubric to surface reasoning
- `record_component_choice` MCP tool integration — every selection is recorded
- Quick reference table mapping all 20 jobs at a glance
- Cross-references to `vois-patterns` (read before) and `vois-tokens` (read after)
- Workspace manifest guidance — handles custom or renamed components gracefully

### Architecture

- Job-first organization (not component-first)
- Semantic decision trees covering context and constraints
- Accessibility considerations surfaced where relevant (e.g., AlertDialog vs Dialog ARIA roles, Tooltip keyboard access)
- No tokens, spacing, or styling — pure selection logic
- Designed for quarterly review and refinement based on agent selection data

### Instrumentation

- Agents call `record_component_choice` after each selection
- Emits `COMPONENT_SELECTED` events to Prisma and PostHog
- Feeds the self-improving design system reconciler
- Powers quarterly rubric calibration cycles

### Related Work

- Part of the Vois self-improving design system (see [PRD 4](../self-improving-design-system/04-component-selection-layer-prd.md) for full context)
- Sits between `vois-patterns` (structure) and `vois-tokens` (implementation)
- Works alongside `righter` skill for all UI copy

### Known Limitations

- Covers shadcn/ui components in v1.0.0. Workspace extensions (custom components, renamed components) require mapping via manifest.
- No coverage of non-shadcn third-party components (future enhancement).
- Performance & Load Time bug type enum exists but has no corresponding rubric (detector planned for future release).

### Next Steps

- Quarterly review cycle starting 2026-08-23
  - Check component selection data for rubric accuracy
  - Identify unused jobs (candidates for removal)
  - Identify over-used alternatives (signal for rubric clarity improvement)
- Monitor `report_pattern_gap` submissions for component gaps not covered by the 20 jobs
- Workspace-specific overrides for component availability (if workspace has removed a shadcn component)

---

## Release Notes

### 1.0.0 Release (2026-05-23)

This is the first public release of the component selection skill. It focuses on the 20 most ambiguous shadcn/ui decisions and provides clear rubrics backed by job-based reasoning.

**What's working well:**
- Decision trees are clear and help agents make intentional choices
- "Why not X" reasoning prevents rubber-stamp decisions
- Instrumentation hook (`record_component_choice`) is seamlessly integrated

**What to watch:**
- Quarterly reviews will calibrate confidence in the rubrics based on real agent behavior
- Workspace manifests may differ from the base shadcn/ui names — readme covers this clearly, but we'll refine guidance as we see how workspaces extend

**Feedback and issues:** Submit `report_pattern_gap` events if a component decision doesn't fit any rubric, or open an issue on the [Skills repo](https://github.com/ommakes/Skills/issues).

---

## Future Versions (Planned)

### v1.1.0 (Planned: 2026-08-23)

- Quarterly calibration based on Q2 agent selection data
- Refinements to rubrics based on `report_pattern_gap` feedback
- Possible new jobs if gaps are identified

### v2.0.0 (Planned: 2027-Q1)

- Workspace-specific component overrides (if workspace has renamed or removed components)
- Integration with component deprecation workflow
- Extended coverage beyond shadcn/ui base components

---

## How to Report Issues

Found a rubric that's unclear or incomplete? Here are three ways to surface it:

1. **Call `report_pattern_gap`** while building — this is the primary feedback mechanism. The MCP tool logs it so reconcilers can aggregate the data.

2. **Open an issue** on the [Skills repo](https://github.com/ommakes/Skills/issues) with the label `skill/vois-components`.

3. **Share in Slack or email** — for qualitative feedback about the rubrics' clarity or relevance.

---

**Maintained by:** Om Suthar and the Vois team  
**Repository:** [github.com/ommakes/Skills](https://github.com/ommakes/Skills)  
**Last updated:** 2026-05-23
