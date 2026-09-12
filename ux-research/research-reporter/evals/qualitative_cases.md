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

**Input:** "Can you write up a report on the Unsoku onboarding study?"
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
