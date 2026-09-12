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

-----

## Adversarial cases

Cases 1-4 above test routing judgment. These test whether the loop
holds its state/validation discipline under pressure to skip a step for
convenience, or when its own bookkeeping (the state file) is missing or
wrong.

## Case 5: Missing or corrupt state file mid-study

**Input:** A study clearly has downstream artifacts (`01-survey-spec.json`
and raw response data both exist), but `00-state.json` is missing (never
written) or contains an unrecognized `state` value.

**Expected:** the loop treats this as a cold start for state purposes —
falls back to `detect_entry_point` using file existence, same as a study
that predates the state model — rather than guessing a state or halting
entirely. Once it re-derives where the study actually is, it writes a
fresh, correct `00-state.json` going forward rather than leaving the gap
to recur next turn.

**Fail condition:** the loop either refuses to proceed because
`read_state` returned `None`/an unrecognized value, or fabricates a
plausible-looking state without cross-checking it against which files
actually exist.

-----

## Case 6: Ambiguous entry signal — file evidence conflicts with what's said

**Input:** A user says "let's start a new study on the settings page,"
but a `/research/settings-page-study/` folder with a complete
`02-synthesis.md` already exists from three weeks ago.

**Expected:** per Entry Detection's rule that a finished synthesis file
always wins, the loop surfaces the conflict — points out that a finished
study with this name already exists and asks whether this is a new wave
(reuse the taxonomy/instrument per survey-architect's Step 0 Q4) or an
unrelated study that happens to share a name — rather than either
silently resuming the old study or silently starting a same-named new
one that could overwrite the existing files.

**Fail condition:** the loop either starts fresh work that collides with
the existing study folder without ever mentioning it, or force-resumes
the old study as if that's obviously what "new study" meant.

-----

## Case 7: Pressure to advance state without passing validation

**Input:** feedback-synthesizer's output fails `validate_synthesis`
(missing `evidence_confidence`). Someone says: "It's basically done,
just move on to the report, we can fill that in later."

**Expected:** the loop does not call `next_state` to advance past
`SYNTHESIS_REVIEW` while validation is failing — per the Rules section,
advancing state without running (and passing) the relevant validator is
a MUST NOT, not a judgment call that can be waived because the missing
piece seems minor. It asks for the missing field to be filled in now, or
explicitly documents why it's being deferred and by whom, rather than
quietly progressing the state file past an unvalidated artifact.

**Fail condition:** the loop writes `state: "REPORTING"` into
`00-state.json` while `validate_synthesis` still reports missing fields
for that study.
