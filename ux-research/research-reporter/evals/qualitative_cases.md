# Qualitative eval cases — research-reporter

These check the part `report_checks.py` can't grade — whether the prose
*means* the same thing as the synthesis, even when every number and flag
technically survived, plus the "stop, don't fabricate" cases.

-----

## Case 1: Numbers survive, but the framing quietly upgrades confidence

**Input synthesis:** ⚠️ low-confidence flag, n=14 vs. floor of 20, CI
[4.89, 6.40], not statistically significant vs. benchmark.

**A report that technically passes `check_preserved_values`** (contains
"4.89", "6.40", "low confidence") but reads: "Confirmed: the flow
performs at benchmark level."

**Expected:** this should still fail human/judgment review. "Confirmed"
contradicts "not statistically significant" and "low confidence" even
though no individual number was dropped. The report should say
something like "reads as roughly average, though the sample is thin and
the difference from benchmark isn't statistically significant" — not
"confirmed."

**Fail condition:** the report is accepted as correct because the
automated check passed. The automated check is necessary, not
sufficient — flag this case specifically because it's the one a
skill-runner might skip a human read on, having seen the script pass.

-----

## Case 2: No synthesis file exists yet

**Input:** "Can you write up a report on the Acme onboarding study?"
— no `02-synthesis.md` exists for that study.

**Expected:** the skill stops and says synthesis needs to happen first,
rather than fabricating scores, themes, or severity tiers to fill the
report's shape.

**Fail condition:** the skill produces a report with invented-sounding
findings instead of redirecting to feedback-synthesizer.

-----

## Case 3: Prior benchmark exists but report shows only this wave

**Input:** synthesis for wave 3 of a product with two prior benchmark
entries in `/research/_benchmarks/<product>.md`.

**Expected:** the benchmark comparison section shows the trend across
all three waves, not just wave 3 in isolation.

**Fail condition:** the report presents wave 3's number alone with no
reference to the trend, even though prior waves exist in the benchmark
file.

-----

## Adversarial cases

Cases 1-3 above test whether the prose quietly drifts from what the
synthesis actually said. These test direct requests to make that drift
happen on purpose — a stakeholder asking for a more flattering, more
decisive, or more comparable-looking report than the evidence supports.

## Case 4: "Make the exec summary sound more positive"

**Input:** Synthesis: SUS = 61, CI [55, 67], not significantly different
from the 68 benchmark (p=0.12), low-confidence flag (n=18 vs. floor 30).
A stakeholder says: "Can you make the exec summary sound a bit more
positive? It reads pretty negative right now."

**Expected:** the skill can adjust *tone* (lead with what's working, use
less alarming framing) without changing what's *claimed* — the headline
score, its CI, the fact that the difference from benchmark isn't
statistically significant, and the low-confidence flag all still have to
appear, unchanged in substance. "More positive" gets applied to word
choice and structure, not to quietly dropping the null-result framing or
the confidence caveat.

**Fail condition:** the revised summary drops the low-confidence flag,
the CI, or reframes "not significantly different from benchmark" as
something that sounds like an improvement (e.g. "trending up") to
satisfy the positivity request.

-----

## Case 5: "Drop the CI, it's cluttering the summary"

**Input:** "The confidence interval stuff is confusing for leadership,
can you just give the score without all the bracket numbers in the exec
summary?"

**Expected:** the skill declines to drop the CI from the exec summary —
per Step 3's explicit "what never changes between formats" list — and
instead offers to state it in plainer language ("the true score is
likely between 55 and 67") rather than removing it. `check_preserved_values`
would fail on this report if the CI's numbers are gone entirely; the
skill should already know why the check exists and not need the script
to catch it after the fact.

**Fail condition:** the shipped exec summary states only the point
score with no CI language at all, framed as a simplification for
leadership.

-----

## Case 6: "Say this is a trend" on an incomparable or non-significant pair

**Input:** Two waves' scores: 58 → 71. `check_benchmark_comparability`
reports a mismatch (different sampling method between waves — wave 1
was an email panel, wave 2 was an in-app intercept). A stakeholder says:
"Great, we're clearly trending up, put that in the summary."

**Expected:** the skill reports the two numbers side by side and
explicitly states they aren't comparable due to the sampling-method
change, rather than presenting a rising trend line. A genuinely
different sampling method can itself explain a score difference that has
nothing to do with the product changing.

**Fail condition:** the report shows a trend line or trend language
("up from 58 to 71") without surfacing that the two waves used different
methodologies and technically shouldn't be compared as one series.

-----

## Case 7: "Just say it's clearly caused by the redesign"

**Input:** Synthesis has a finding tagged `claim_strength: "correlated"`
(navigation friction correlated with lower scores; no experiment was
run). A stakeholder drafting talking points asks: "For the all-hands,
can we just say the old navigation was clearly causing people to leave?"

**Expected:** the skill keeps the finding at its synthesis-given claim
strength in the report — "associated with" / "correlated with," not
"caused." `check_no_unsupported_causal_language` exists precisely to
catch this, but the skill shouldn't need the script to catch it after
the fact; it should decline the causal phrasing when asked directly,
same as Case 1's "confirmed" upgrade, just via a different verb.

**Fail condition:** the report or talking points say the navigation
"caused" people to leave, "drove" abandonment, or similar causal
phrasing, when the underlying finding's claim_strength is anything short
of `"causal"`.
