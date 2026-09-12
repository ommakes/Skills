---
name: research-reporter
version: 1.1.0
author: Personify Labs
description: >
  Turns a feedback-synthesizer output into a stakeholder-ready report —
  exec summary, methodology, benchmark comparison, and prioritized
  recommendations — formatted for the audience reading it. Internal/quick
  audiences get a markdown or Notion-ready doc; formal/external stakeholders
  get a Word document. Routes UI-facing or public-facing copy through
  righter or thought-leadership-writer where relevant. Never re-derives
  scores, themes, or severity — those come from feedback-synthesizer as
  given. Trigger when someone has synthesis output ready and wants it
  turned into something shareable, says "write this up," "make me a
  report," or "turn these findings into something I can send to
  leadership." Entry point 3 of the research loop (see research-loop).
  Bundles scripts/report_checks.py for audience-format lookup, section
  completeness, and verbatim-preservation checks (run it before
  finalizing, but note it can't catch a subtly reframed caveat — that
  still needs a human read) and evals/ for regression testing.
tags:
  - user-research
  - ux-research
  - reporting
  - stakeholder-communication
license: CC-BY 4.0
---

# Research Reporter

Turns a synthesis file into something a stakeholder actually reads and
acts on. Does not re-analyze anything — feedback-synthesizer already did
the scoring, testing, and theming. This skill's job is presentation and
prioritization for a specific audience, not new analysis.

-----

## Step 0: Who's reading this?

Ask (or infer from context if it's obvious) before drafting:

1. **Audience:** internal team/PM (fast, working doc) vs. leadership or
   external stakeholder (formal, polished). Run
   `scripts/report_checks.py`'s `select_format(audience)` once you know
   which — `"internal"`, `"leadership"`, or `"external"` — rather than
   picking the format by feel.
2. **Format:** confirmed by the lookup above, or ask if the audience
   itself is genuinely unclear
3. **What decision is this report supporting?** Pull this from the
   original learning goal in `00-intake.md` if it exists — the report
   should visibly answer that question, not just summarize everything
   that was measured

If there's no synthesis file to point to and someone asks for a report
from scratch, stop and say synthesis needs to happen first — don't
fabricate scores or themes to fill a report shape.

-----

## Step 1: Structure

Every report gets these sections, scaled by audience (internal = terse,
formal = fuller prose):

### Executive summary
2–4 sentences. Leads with the answer to the stated learning goal, not a
recap of the method. State the headline score with its CI in plain
language ("SUS came in at 74, meaningfully above our 68 benchmark — not
just noise, the confidence interval doesn't overlap").

### Methodology
Instrument used, n, collection window, and the low-confidence flag if
feedback-synthesizer raised one — carry that flag forward, never drop it
during formatting. Keep this section short for internal docs, fuller for
formal ones (formal audiences need to trust the number before acting on
it).

### Benchmark comparison
Pull the product's history from `/research/_benchmarks/<product>.md` and
show the trend, not just this wave's number in isolation. A single score
with no trend line is a weak report.

### Findings
Present the synthesis's qual-quant cross-references as-is — don't
soften a stated "no clear theme explains this" into a manufactured
narrative. If synthesis said a movement was unexplained, report it as
unexplained.

### Prioritized recommendations
Derived directly from feedback-synthesizer's severity tiers (Critical /
Notable / Minor) — this skill doesn't re-rank them, it translates tiers
into recommended actions and rough effort/impact framing for the
stakeholder. Critical tier findings go first, always.

-----

## Step 2: Audience-specific formatting

**Internal / markdown / Notion:**
- Terse, scannable, bullet-heavy
- Assume the reader already has product context — skip background
  explanation of what the product is
- Fine to reference raw synthesis file for anyone who wants to dig in

**Formal / docx:**
- Fuller prose, more framing/context for readers without daily product
  exposure
- Route section copy (headers, section framing, any narrative
  transitions) through **thought-leadership-writer** if the doc is going
  to leadership or an external audience and needs a stronger narrative
  voice; route any UI-facing copy referenced in findings through
  **righter** for consistency with product copy standards
- Use the docx skill for actual file generation and formatting

-----

## Step 3: What never changes between formats

Regardless of audience, these must survive unchanged from the synthesis
file:

- The headline score and its confidence interval
- Whether a difference was statistically significant
- The low-confidence flag, if one was raised
- Severity tier assignments
- Any "no clear theme found" statements

Reformatting for readability is fine. Softening a caveat, dropping a CI
because it "clutters" the exec summary, or upgrading "directional" to
"confirmed" is not.

**Before finalizing, run two checks from `scripts/report_checks.py`:**
`validate_report_structure(report_text)` to confirm all five required
sections are present, and `check_preserved_values(synthesis, report_text)`
to confirm the CI, low-confidence flag, and severity tiers survived
into the text unchanged. Both are structural/textual checks — they
catch a dropped number or missing section, but **they cannot catch a
report that keeps every number yet quietly reframes "directional" as
"confirmed" in prose.** That specific failure mode needs an actual
read-through; don't treat a clean script pass as proof the report is
honest, only as proof it isn't missing pieces.

-----

## What this skill never does

- Re-scores, re-tests, or re-themes anything — that's synthesizer's job
- Drops a confidence interval or low-confidence flag to make the report
  cleaner
- Builds a report with no synthesis file behind it
- Re-orders severity tiers based on its own judgment
- Presents a single wave's score without the benchmark trend, when
  prior waves exist
- Writes UI or public-facing copy without routing through righter or
  thought-leadership-writer as appropriate
- Manufactures a narrative explanation for a score movement synthesis
  explicitly said was unexplained

-----

## Quick reference

| Audience | Format | Tone |
|---|---|---|
| Internal team / PM | Markdown / Notion | Terse, bullet-heavy, assumes context |
| Leadership / external | Word doc (docx) | Fuller prose, more framing |
| Report going external/public | Docx + thought-leadership-writer pass | Narrative voice |
| Findings reference UI copy | Route through righter | Copy standard consistency |
| No synthesis file exists | Stop, redirect to feedback-synthesizer | — |
