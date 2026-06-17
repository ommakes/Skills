# Selection and Input

Decision trees and reasoning for Jobs 6, 9, 10.

## Job 6: Let the user choose from a known list `[JOB-CHOOSE-FROM-LIST]`

The user needs to select one or more items from a predefined set.

```
├─ Short list (under 8 items), no search needed, single select
│  └─ Select (dropdown, keyboard navigable)
│
├─ Long list (8+ items) OR user might not know the exact option name
│  └─ Combobox (Select + search input, filters as user types)
│
├─ User needs to search across multiple data types or trigger actions (not just pick a value)
│  └─ Command (palette-style, supports search + sections + keyboard shortcuts)
│
└─ Only 2 options
   └─ Radio buttons or Segmented Control (see Job 5) — don't use Select for binary choices
```

**Why not Combobox for short lists?** Combobox adds a text input that implies searching. For short lists where all options are visible immediately, a Select is simpler and has less friction.

**Why not Command for standard selection?** Command is a power-user tool. It's appropriate for global search, action launchers, and complex filtering. Using it for a straightforward form field pick creates cognitive overhead for a task that doesn't warrant it.

## Job 9: Accept text input from the user `[JOB-ACCEPT-TEXT]`

The user needs to enter text as part of a form or interaction.

```
├─ Single line of text (name, email, search, number, URL)
│  └─ Input
│
├─ Multi-line text without formatting (description, notes, feedback)
│  ├─ 1–3 lines expected      → Textarea (set rows attribute to hint at expected length)
│  └─ 4+ lines expected       → Textarea with auto-resize or fixed height + scroll
│
└─ Formatted text (bold, lists, links — where formatting matters to the user)
   └─ RichTextEditor (workspace-specific — check manifest; typically Tiptap or similar)
```

**Why not Textarea for everything?** Single-line inputs set a clear expectation for the user about what kind of response is expected. "Email address" in a Textarea is confusing — it implies more content is expected than an email address provides. Match the input shape to the expected content.

**Why not RichTextEditor by default?** Rich text editors are heavy, harder to validate, and produce HTML or markdown that your backend needs to handle. Only use them when the formatting itself is meaningful to the user's task — product descriptions, long-form notes, content creation.

## Job 10: Capture a binary preference `[JOB-BINARY-PREFERENCE]`

The user needs to turn something on or off, or agree or disagree.

```
├─ Setting takes effect immediately (no save button required)
│  └─ Switch (or Toggle — same semantic, check your manifest)
│
├─ Setting is part of a form submitted later
│  ├─ One option in a group of related options    → Checkbox
│  └─ Single standalone agree/consent             → Checkbox (not Switch — Switch implies immediate effect)
│
└─ Mutually exclusive choice between two options in a form
   └─ Radio buttons (not Checkbox — Checkbox implies multi-select is possible)
```

**Why not Switch for form fields?** Switch communicates immediate effect — the moment the user flips it, something changes. In a form with a submit button, the user expects nothing to change until they submit. Using a Switch in that context sends a mixed signal.

**Why not Checkbox for toggles in settings?** Checkbox requires submitting a form or clicking a button to apply. For settings that should apply in real time (dark mode, notifications, sidebar collapsed), Switch communicates immediacy correctly.
