# Content Density: Dense, Standard, Spacious

Cross-cutting judgment rule that applies across container types — not tied to one template.

## Why this exists

`forms.md` sets field-count thresholds per form tier and `table-list.md` sets
a fixed pagination count, but neither gives a general answer to "how much
breathing room should this screen have." Left undefined, the default lands on
whatever the mid-range spacing tokens produce everywhere — a settings page,
an admin data grid, and an onboarding empty state all end up with the same
amount of air around their content, when the right amount is a function of
who's looking at the screen and how often, not which container type it is.

**This is not the same problem `DS-SLOP-010` solves.** Card-ification (see
`vois-tokens/references/anti-slop.md`) is about a specific wrong *container*
choice — wrapping static sections in bordered cards they didn't earn. Density
is about spacing and information-per-screen, independent of what container
is used. A dense screen can still misuse cards; a spacious one can still
avoid them. Pick density with the rules below, then apply `DS-SLOP-010`'s
card judgment on top, not instead.

## The three tiers

### Dense `[PATH-DENSITY-DENSE]`

**Use when:** the audience is a power user or admin doing this repeatedly,
the task is scanning or comparing many rows at once, and screen real estate
is at a premium relative to how much needs to be visible simultaneously —
admin data grids, financial/analytics tables, dashboards summarizing many
metrics at a glance, log/audit views.

**Lean toward:** the tighter end of the spacing scale (`--space-4`/`-8`/`-12`
between related items, e.g. table cell padding and row height), more columns
or metrics visible without scrolling, smaller non-body type sizes where
`[DS-TYPOGRAPHY]` still allows it. The goal is more signal per screen for
someone who already knows how to read this layout.

### Standard `[PATH-DENSITY-STANDARD]`

**Use when:** nothing below or above applies. This is the default for most
product surfaces — forms, settings pages, typical list/detail views, the
bulk of everyday product work per `[PATH-A]`/`[PATH-C]`/`[PATH-E]`.

**Lean toward:** the mid spacing scale (`--space-16`/`-24`), the values
`forms.md` and `settings-pages.md` already specify. If you're not sure which
tier applies, this is the correct default — don't reach for dense or
spacious without a specific reason from the lists above/below.

### Spacious `[PATH-DENSITY-SPACIOUS]`

**Use when:** the moment is low-frequency, high-stakes, or meant to slow the
user down and focus attention on one thing — onboarding and first-run flows,
empty states, a destructive-confirmation dialog (`JOB-CONFIRM-DESTRUCTIVE` in
`vois-components`), marketing/landing surfaces, a single critical
decision point the user will see rarely.

**Lean toward:** the looser end of the spacing scale (`--space-32`/`-48` and
up), fewer things visible at once, more whitespace around the one thing that
matters. The goal here isn't efficiency — it's making one decision or one
piece of content unmistakably the point of the screen.

## Relationship to the DENSITY taste dial

`vois-tokens`' `SKILL.md` defines a `DENSITY` taste dial (1-10) that "biases
spacing scale and default paddings/gaps." That dial tunes *within* whichever
tier applies here — a dense admin table at `DENSITY 8` sits tighter than the
same table at `DENSITY 3`, but it's still the dense tier's spacing range, not
standard or spacious. Pick the tier from the job first, using the rules
above; let the dial (if one was passed in) adjust within it. Don't use the
dial as a substitute for picking the right tier.

## Anti-pattern: uniform density regardless of context

The tell that density wasn't actually decided is a whole product using one
spacing rhythm everywhere — the same padding on a data table row as on an
onboarding empty-state message. If every screen in a build has identical
information density, that's a sign the tiers above weren't consulted, not
evidence of consistency.
