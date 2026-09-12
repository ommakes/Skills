# Composing Existing Primitives

Cross-cutting judgment rule that applies before any container type is chosen — not tied to one template.

## Why this exists

The decision tree in `SKILL.md` picks a container type for a job that already
maps cleanly onto one of the five (settings, table/list, form, dialog, detail).
Real feature briefs are messier than that: "build an approval queue," "add a
review step before submit," "let admins impersonate a user." None of those
phrases names a container type. The failure mode is inventing new,
bespoke structure to match the brief's own words instead of noticing it's
already a combination of container types this skill defines.

## Rule 1: Check for a direct fit first `[PATH-COMPOSITION-CHECK-FIRST]`

Before designing anything, walk the `SKILL.md` decision tree as if the brief
were phrased as a job-to-be-done, not as its own feature name. "Approval
queue" is "view, filter, and act on a list of items" — that's `[PATH-B]`.
"Impersonate a user" is a quick, reversible action against one row — that's
closer to `[PATH-D]` than a new page. Most briefs that sound novel because of
their product-specific name turn out to be a plain job once translated.

## Rule 2: Combine two existing patterns before inventing a third `[PATH-COMPOSITION-COMBINE]`

When a brief genuinely needs more than one container type's job done at once,
compose the existing ones — don't design a new hybrid container to cover both
at the same time.

**Worked examples:**

- **Approval queue.** "Browse pending items, open one, approve or reject it."
  This is `[PATH-B]` (Table/List with Details) for the browse/filter surface,
  composed with `[PATH-D]` (Dialog/Action Sheet) for the approve/reject
  confirmation triggered from a row — not a bespoke "queue" component that
  reimplements table filtering and confirmation inline.
- **Multi-step form with a review step.** The input steps are `[PATH-C]`
  (Form), tiered by field count per step. The final "review before submit"
  step is `[PATH-E]` (Detail Page) rendered read-only inside the same flow —
  the same label+value stacked layout a detail page already uses, not a new
  "review summary" layout invented for this one flow.
- **Bulk edit from a list.** Selecting multiple rows in `[PATH-B]` and
  editing a shared field across all of them opens a `[PATH-C-SIMPLE]` form
  (1-6 fields: just the shared fields) inside a `[PATH-D]` dialog — composing
  three existing patterns, not building a dedicated bulk-edit surface.

The tell that composition is the right call: you can name which existing
pattern is doing each part of the job. If you can't, you may have a genuine
gap — see Rule 3.

**Component-level version of this rule:** this page is about composing
*page-level* patterns. The same instinct applies one level down, to whether a
group of content needs its own container at all — see
`vois-components`' `JOB-CONTAIN-CONTENT` decision ("why not wrap everything in
a Card?"): a named section of a page is semantic HTML + a heading, not
automatically a new container, even an existing one.

## Rule 3: Invent new structure only when composition doesn't cover it, and say so `[PATH-COMPOSITION-INVENT-LAST]`

If you've checked Rule 1 and tried composing under Rule 2 and the job still
doesn't fit — genuinely novel interaction, not just an unfamiliar name for a
familiar job — build new structure. But don't do it silently:

- Name which existing patterns you considered and why they didn't fit, the
  same way `vois_report_pattern_gap` (see `SKILL.md`) asks for a
  `reasoning` field when no path fits well. If that tool is available, call
  it. If not, say so in your own output anyway — the point is making the gap
  visible, not just filling it quietly.
- A new pattern invented this way is a one-off for the brief in front of you,
  not a new entry in this skill. Don't retroactively promote it to a sixth
  container type without it being reviewed and added to `SKILL.md` and
  `data/patterns-rules.json` deliberately — the same bar every existing path
  already cleared.

## Anti-pattern: composition as an excuse to skip structure

Composing existing patterns is not the same as loosely gluing components
together with no page-level pattern governing any of it. If a screen doesn't
map to `[PATH-B]` or `[PATH-C]` or any combination of the five, that's the
signal to apply Rule 3 deliberately — not to skip picking a pattern at all
and let the screen's structure fall out of whichever components got added
first.
