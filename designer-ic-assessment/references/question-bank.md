# Question Bank
**Version:** 0.3
**Updated:** March 2026

The per-competency questions, probes, and the Likert scale now live in
`data/question-bank.json` — 5 categories, 23 competencies, each with designer
and manager question blocks (opening prompt, probes, follow threads, rating
prompt). Query it by competency `number` or `category`; don't read this file
for that content.

This file keeps what doesn't fit a lookup table: interview guidance (how to
run the conversation) and the manager-only breadth/depth assessment sequence.

## Interview guidance

Run the session as a natural conversation. Questions are guideposts, not a checklist. Follow the thread the person is giving you. Move between questions when it feels right, not when a number is checked off. Use follow-up probes when answers are thin. Don't probe more than twice per area before moving on.

---

# MANAGER BREADTH & DEPTH ASSESSMENT

These questions are asked during the manager session only, in two places:

1. **During setup** -- before any competency questions, to establish the manager's independent breadth read
2. **At the end of the session** -- to surface depth vs. surface-level coverage across categories

---

## During setup: Breadth scope

Ask after weights are confirmed, before any competency questions begin.

*Prompt:*
> "Before we dig into specific competencies, I want to get your read on scope. Looking across all five categories -- Knowledge, Craft, Behaviors, Communication and Collaboration, and AI Fluency -- which competency areas do you consider actively in play for this designer right now, this cycle? And which ones are dormant or genuinely outside their current role?"

*Agent guidance:*
Go through each category together. For each one, ask the manager to call out which specific competencies within it are active vs. not in scope. Record this as the manager's breadth read -- it will be compared against the designer's own scope flags in the reveal meeting.

If the manager is unsure about a competency, note it as "unclear" rather than forcing a call.

*Why this matters:*
The manager may see breadth the designer doesn't claim (e.g. the designer undersells their mentoring impact). Or the manager may have a narrower view of scope than the designer does. Either gap is worth surfacing.

---

## End of session: Depth vs. breadth question

Ask this after all competency questions are complete, before generating the summary.

*Prompt:*
> "Stepping back across everything you've shared -- where do you see genuine depth in this designer's work? Places where they've really gone beyond the surface and built real mastery? And where do you think they're covering the ground but haven't gone deep yet?"

*Agent follow-ups if shallow:*
- Can you point to specific competencies or projects where the depth is most visible?
- Is there a category where you feel like they're spread thin -- active across it but not really owning any of it at a high level?

*Level signal:*
Depth at principal level should be visible across multiple categories, not just one. A principal who is deep in Craft but surface-level in Communication and AI Fluency is a different profile from one who has built real depth across all five. The manager's answer here feeds directly into the breadth section of the summary and the conversation starters for the reveal.

---

## Breadth comparison in the reveal meeting

The FigJam board should include a **breadth comparison row** in Zone 1 -- Score Overview. It shows:

| | Designer's active scope | Manager's active scope |
|---|---|---|
| Competencies in active scope | [X] of 23 | [Y] of 23 |
| Scope agreement | [list competencies both called active] | |
| Scope gap | [competencies where views differ] | |

A scope gap -- where the designer claims a competency is active but the manager doesn't, or vice versa -- is one of the most interesting conversation starters in the reveal meeting. It often reveals either visibility gaps on the manager's side, or underselling on the designer's side.
