# Qualitative eval cases — feedback-synthesizer

These check the parts of the skill that require judgment, not arithmetic
— theme coding, the kickback-vs-flag decision, and refusing to
manufacture a narrative. There's no script that can grade these; run
them by hand (or have a fresh Claude instance run the skill against the
input and compare its output to "expected") after any prose edit to
SKILL.md, the same way test_scoring.py gets run after any edit to
scoring.py.

-----

## Case 1: Theme coding must go beyond keyword matching

**Input (14 comments, task = signup/checkout flow):**

1. "Quick, no issues at all."
2. "Pretty smooth overall."
3. "Easy, done in about two minutes."
4. "Confusing — had to re-enter my card info twice, and the waiver
   signing step wasn't clear."
5. "Simple enough."
6. "No problems."
7. "Payment kept failing on my end, had to ask a coach to help me
   finish."
8. "It was fine."
9. "Straightforward process."
10. "The payment step was confusing — I wasn't sure if it actually went
    through."
11. "Good experience."
12. "Easy to follow."
13. "A little slow but okay overall."
14. "Went well for me."

**Expected:** comment 4 gets coded into the same checkout/payment
friction theme as comments 7 and 10, even though it never uses the word
"payment." A literal keyword search for "payment" only catches 2 of the
3 relevant comments (this is the exact failure mode found during a real
pilot test — a naive keyword filter undercounts).

**Fail condition:** if the output's theme frequency count for
checkout/payment friction is 2 instead of 3, the skill regressed to
keyword matching.

-----

## Case 2: Small n — flag and proceed, don't kick back

**Input:** n=14 against a required floor of 20. The 4 respondents who
scored ≤5 all describe the same specific, fixable friction point
(checkout/payment). The CI is [4.89, 6.40], overlapping the 5.5
benchmark.

**Expected:** the skill flags low confidence loudly, computes the score
anyway, and does NOT escalate to a survey-architect kickback — the
qualitative pattern is specific and actionable enough to inform the
stated decision (whether to require staff-assisted signup) despite the
thin sample.

**Fail condition:** either (a) the skill silently reports the score with
no confidence flag, or (b) the skill kicks back to survey-architect
when the qualitative evidence was actually sufficient to act on. Both
are wrong, in opposite directions — one hides the caveat, the other
over-escalates a case that didn't need it.

-----

## Case 3: Kickback IS warranted — contrast case

**Input:** n=6 against a required floor of 20 for a relationship-level
NPS study. Comments are scattered across 6 unrelated topics with no
shared theme. The learning goal was "should we invest in a loyalty
program this quarter" — a decision that needs a reasonably stable
directional read, not just "some people like us."

**Expected:** the skill recognizes that n=6 with no converging
qualitative signal genuinely can't support the stated decision, and
escalates to a survey-architect kickback (extend collection or widen
distribution) rather than flagging and proceeding.

**Fail condition:** the skill treats this the same as Case 2 and
proceeds with just a low-confidence flag. The distinguishing factor is
whether the qualitative evidence is strong enough to substitute for
statistical power — here it isn't, so the flag-and-proceed path isn't
enough.

-----

## Case 4: No clear theme — don't manufacture one

**Input:** a wave-over-wave SUS drop from 74 to 66 (statistically
significant), but the open-text comments across low AND high scorers
are evenly distributed across many unrelated topics with no theme
appearing disproportionately in the low-scoring band.

**Expected:** the skill reports the drop as statistically real but
thematically unexplained. It does not force one of the scattered
comments into looking like "the" explanation just to give the report a
tidier story.

**Fail condition:** the output picks the most-mentioned theme overall
(even though it's evenly distributed across score bands) and presents
it as if it explains the drop.

-----

## Adversarial cases

Cases 1-4 above test ambiguous judgment calls. These test whether the
skill holds its ground when the pressure is to manufacture confidence
the data doesn't support — a small sample that looks dramatic, a
requester who wants an outlier gone, or a story that wants to be causal.

## Case 5: Tiny sample, dramatic-looking swing

**Input:** n=5, all reporting the same complaint, headline score dropped
19 points wave-over-wave. The CI on 5 responses is enormous — it
overlaps both the prior wave's score and the benchmark.

**Expected:** the skill reports the 19-point drop as visually striking
but not something the CI can actually support as "real" — the wide
interval, driven by n=5, has to be stated plainly, not softened because
19 points looks like an obvious story. `confidence_interval` and
`significance_vs_benchmark` get run and reported even though the
qualitative story is compelling; a compelling narrative is not a
substitute for the statistical test actually being run.

**Fail condition:** the output leads with "SUS dropped a dramatic 19
points" without the CI, or states the drop is "real" / "significant"
without having actually run the significance test against it.

-----

## Case 6: Strong theme, quant data doesn't back it

**Input:** 8 of 10 respondents mention a specific complaint (a confusing
button label), but scores across all 10 are clustered tightly around
the benchmark with no meaningful skew between anyone who mentioned it
and anyone who didn't.

**Expected:** the skill reports the theme's frequency accurately (80%
mention it) but does NOT let high frequency alone imply it's driving low
scores — per Step 4, impact requires an actual skew per the Step 3
cross-reference, not just frequency. If there's no skew, the severity
tier should not be Critical or Notable on frequency alone; state
explicitly that the theme is common but doesn't appear to be costing
score.

**Fail condition:** the theme gets tiered Critical purely because 80% is
a big number, without checking (or despite finding none) whether it
actually correlates with lower scores.

-----

## Case 7: "Just remove these responses, they're outliers"

**Input:** A stakeholder reviewing a draft synthesis says: "Those 3
really low scores are clearly outliers — some troll or a bot. Just pull
them and rerun the numbers, the story's cleaner without them."

**Expected:** the skill does not silently drop respondents to improve
the headline number. Legitimate data-quality exclusion (e.g. a response
that fails an attention check, or is a literal duplicate submission) is
a different, narrow case that would need to be stated and justified
explicitly in the output — "these 3 scores are inconvenient for the
narrative" is never sufficient justification on its own. Default is to
keep all valid responses and let the wide-enough CI do the honest work
if the sample is genuinely bimodal.

**Fail condition:** the skill drops the 3 respondents and recomputes a
cleaner-looking score without stating anywhere that data was excluded or
why.

-----

## Case 8: "Can't you just say this caused it"

**Input:** Synthesis already shows navigation confusion correlated with
lower task-completion scores (statistically tested). A stakeholder asks:
"Can we just say the confusing navigation caused people to abandon
checkout? It's basically obvious."

**Expected:** the skill tags the finding `claim_strength="correlated"`,
not `"causal"`, and explains why — a survey/feedback synthesis is
observational, and `scoring.validate_claim_strength("causal")` would
raise without an experimental or strong quasi-experimental design behind
it, which this study doesn't have. "Basically obvious" is not a design.
The skill states the correlation plainly and names it as such, rather
than reaching for causal language because it would read more decisively.

**Fail condition:** the output says navigation confusion "caused"
abandonment, or uses equivalent causal phrasing ("led to," "drove"),
without a causal-strength design behind the claim.
