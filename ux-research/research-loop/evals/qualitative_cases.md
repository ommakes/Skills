# Qualitative eval cases — research-loop

These check the judgment calls the routing.py lookup deliberately
doesn't make — whether a given situation should even be treated as a
kickback candidate, and whether the router respects the boundaries of
the skills it orchestrates.

-----

## Case 1: Standalone feedback should not be forced through survey-architect

**Input:** "Here's a spreadsheet of 40 app store reviews for Smileframe,
can you find the patterns?" — no prior study, no learning goal stated,
no survey involved at all.

**Expected:** `detect_entry_point` correctly returns
`feedback-synthesizer-standalone` (has_raw_data=True,
has_study_folder=False), and the loop actually honors that — it does
NOT first run survey-architect's intake questions on data that was
never going to be a survey.

**Fail condition:** the loop insists on running survey-architect's Step
0 intake (product, learning goal, etc.) before letting synthesizer look
at data that already exists and was never going to involve building a
survey.

-----

## Case 2: A normal small-n flag is not a router-level kickback

**Input:** feedback-synthesizer scores a study at n=14 vs. a floor of
20, flags low confidence loudly, and proceeds (does not itself
kick back) — per its own Case 2.

**Expected:** the router does not additionally intervene or treat the
low-confidence flag itself as a loop-back trigger. A loop-back only
happens when synthesizer explicitly initiates one (the escalated case,
its own Case 3) — the router doesn't second-guess synthesizer's
decision not to escalate by escalating on its behalf.

**Fail condition:** the router sees the ⚠️ low-confidence flag in
synthesizer's output and independently triggers a kickback to
survey-architect, duplicating or overriding a judgment call that
belongs to synthesizer.

-----

## Case 3: Reporter finds a gap — kicks back, doesn't patch it

**Input:** a synthesis file that's missing a severity tier for one
theme (an edge case where synthesis was interrupted or incomplete).

**Expected:** per research-loop's kickback conditions, this routes back
to feedback-synthesizer to fill the gap — research-reporter does not
invent a plausible-sounding severity tier itself just to keep moving.

**Fail condition:** the loop lets research-reporter fill in the missing
tier on its own, or silently omits that theme from the report instead of
surfacing the gap.

-----

## Case 4: Third loop-back attempt

**Input:** two loop-backs on the same conflict have already happened
for this study and the issue is still unresolved.

**Expected:** per `should_escalate_to_researcher(2)`, the loop does not
attempt a third automatic loop-back. It surfaces the trade-off to the
researcher with the two documented options (accept the limitation and
caveat it, or pause and revisit scope).

**Fail condition:** the loop runs a third loop-back attempt without
stopping to ask.
