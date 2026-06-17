# Feedback and Confirmation

Decision trees and reasoning for Jobs 1, 2, 13, 14.

## Job 1: Confirm a destructive or consequential action `[JOB-CONFIRM-DESTRUCTIVE]`

The user is about to do something that's hard or impossible to undo.

```
├─ Action affects only current user, and undo is available (e.g. archive, move)
│  └─ Toast with undo action
│
├─ Action is not reversible, affects only current user (delete, disconnect)
│  └─ AlertDialog
│
├─ Action affects other users (revoke access, cancel shared resource)
│  └─ AlertDialog + post-action notification to affected users
│
└─ Action has external consequences (publish, send email, charge)
   └─ AlertDialog with explicit consequence text in body
```

**Why not Dialog?** Dialog is for any modal interaction. AlertDialog enforces `role="alertdialog"`, which screen readers announce with higher urgency. Any time consequences exist, use AlertDialog — it's not just convention, it's an ARIA distinction.

**Why not Toast for irreversible actions?** Toasts auto-dismiss. If the user looked away or the connection dropped, they miss confirmation. Reserve Toast-with-undo for genuinely reversible actions where the undo window is at least 5 seconds.

## Job 2: Show transient feedback after a user action `[JOB-TRANSIENT-FEEDBACK]`

The user did something and the UI needs to acknowledge it.

```
├─ Pure acknowledgment, no action required (saved, copied, sent)
│  └─ Toast
│
├─ User needs to act on the message before continuing
│  └─ Alert (inline, persistent until dismissed)
│
├─ Error tied to a specific input, field, or section
│  └─ Alert inline (positioned adjacent to the source — proximity = relationship)
│
└─ System-wide announcement (maintenance, outage, account issue)
   └─ Alert (sticky to top of page, not dismissible until resolved)
```

**Why not Toast for actionable messages?** If the toast disappears before the user reads or acts, the message is lost. Anything requiring action needs a persistent surface.

**Why not Toast for errors on inputs?** Toast places feedback far from the source. Users have to read the toast, track back to the form, and figure out which field the error belongs to. Inline Alert eliminates that mapping step.

## Job 13: Communicate loading state `[JOB-LOADING-STATE]`

Something is being fetched or processed and the user needs to know.

```
├─ Fetching content that will fill a known layout (page load, list load, card content)
│  └─ Skeleton (placeholder that matches the shape of the content coming in)
│
├─ Short action in progress, result will appear in place (button submitting, search running)
│  └─ Spinner inside or replacing the trigger element (disable the trigger while loading)
│
└─ Long operation with measurable progress (file upload, multi-step processing)
   └─ Progress bar (with percentage or step count if deterministic)
```

**Why not Spinner for page loads?** A full-page spinner with no structure gives the user no prediction about what's coming. A skeleton shows the layout shape, which reduces perceived load time and prevents layout shift when content arrives.

**Why not Skeleton for action feedback?** Skeleton is for content that will fill a known area. For a button that's waiting on a response, a Skeleton would appear in the wrong place. A Spinner inside the button keeps the feedback local and immediate.

**Why not Progress for unknown-duration operations?** An indeterminate progress bar (animated fill with no percentage) is just a spinner in a different shape. If you don't know the duration, use a Spinner. Progress is for when you have a real percentage to show.

## Job 14: Handle missing or empty content `[JOB-EMPTY-CONTENT]`

A list, table, or view has no data to show.

```
├─ User has never created anything in this section (true zero state)
│  ├─ User can create from this screen    → EmptyState with primary CTA
│  └─ User can't create from here         → EmptyState with explanation (no CTA)
│
├─ Filters or search removed all results (filtered empty, not true zero)
│  └─ Inline message + "clear filters" action (not a full EmptyState component — too heavy)
│
└─ Feature hasn't been set up or unlocked yet (empty by design, not by absence of data)
   └─ EmptyState with onboarding copy explaining what this section will do (no CTA if action is elsewhere)
```

**Why not skip the empty state?** A blank area with no explanation looks broken. Users don't know if the data is loading, filtered away, or genuinely absent. Always acknowledge empty content.

**Why not a full EmptyState for filtered results?** EmptyState is a significant visual element. Using it every time a search returns zero results is disproportionate and feels like an error. A simple inline message with a "clear filters" link is appropriate and keeps the interaction lightweight.
