# Qualitative eval cases — survey-architect

These check the judgment survey-architect has to exercise before
`selection.py`'s deterministic lookup ever runs — classifying a
requester's actual situation into the right decision_type, and knowing
when to push back on what they asked for by name.

-----

## Case 1: Requester names the wrong instrument by name

**Input:** "I need an NPS survey for our new onboarding flow — want to
know if people like it."

**Expected:** the skill notices the mismatch between what's named (NPS,
a relationship-level metric) and what's actually being asked (a specific
flow, sounds task/session-level) and says so explicitly before
proceeding — asks whether this is really about the ongoing relationship
with the product, or about whether this one flow is easy to use. Doesn't
silently build the NPS survey just because that's the word the
requester used.

**Fail condition:** the skill goes straight to building an NPS survey
without surfacing the mismatch.

-----

## Case 2: Intake answers don't line up with each other

**Input:** Product = Unsoku. Learning goal = "is the onboarding flow
easy to complete." Where it sits (Q3 answer) = "the ongoing relationship
with the product."

**Expected:** per Step 0's explicit instruction, the skill flags that
answers 2 and 3 don't line up (a task-level goal paired with a
relationship-level answer) before proceeding to instrument selection —
doesn't silently pick one interpretation and run with it.

**Fail condition:** the skill proceeds straight to SUPR-Q or NPS (a
relationship-level pick) or straight to SEQ (a task-level pick) without
ever surfacing that the two answers pointed in different directions.

-----

## Case 3: Existing benchmark series should constrain the choice

**Input:** Product = Unsoku, which already has one prior wave in
`/research/_benchmarks/unsoku.md` using SEQ for the signup flow. New
request: "let's measure the signup flow again, but this time let's try
NPS instead, I think it'll look better for the board deck."

**Expected:** the skill flags that switching instruments breaks
comparability with the existing wave, and that NPS measures something
different (relationship loyalty, not task ease) — it's not simply a
different way to ask the same question. It should not silently comply
just because a stakeholder-facing reason was given.

**Fail condition:** the skill swaps to NPS without flagging the broken
comparability or the fact that NPS doesn't actually answer the same
question as the original SEQ study.

-----

## Case 4: Nothing in the table fits — custom set, no benchmark

**Input:** "I want to know if people understand what our new AI feature
actually does, before they've tried it." (Not a usability question, not
a loyalty question, not post-launch adoption — more like a
comprehension/messaging check pre-launch.)

**Expected:** the skill recognizes this doesn't cleanly map to any row
in the decision table, builds a small custom item set, and explicitly
states it has no external benchmark — rather than forcing it into TAM
(adoption) or SEQ (task ease) just because those are the closest
existing options.

**Fail condition:** the skill forces the request into an existing
instrument without flagging that the fit is poor and there's no
benchmark for the resulting number.
