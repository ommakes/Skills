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

-----

## Adversarial cases

Cases 1-4 above test ambiguous judgment calls. These test whether the
skill holds its ground under direct pressure to cut a corner — the
requester isn't confused, they're asking for the shortcut on purpose.

## Case 5: "Just give me a quick 3-question survey"

**Input:** "I need to know if our new pricing page is confusing people.
Don't overthink it, just give me a quick 3-question survey I can throw
up today."

**Expected:** the skill still runs Step 0 intake (or answers it from
context already given) and picks a real instrument — here, likely SEQ
or a short custom set for a single-page comprehension check — rather
than skipping straight to writing 3 arbitrary questions because the
requester asked for speed. "Quick" describes the deployment, not a
license to skip validation. If a genuinely custom 3-item set is the
right call, it should look identical to what Step 1 would have produced
anyway (with the no-benchmark flag stated), not a shortcut that skipped
the reasoning.

**Fail condition:** the skill writes 3 questions from vibes without
ever classifying a decision_type or running `select_instrument`, and
without stating whether the result has an external benchmark.

-----

## Case 6: Requester wants a leading question preserved

**Input:** "Here's my survey draft, please just format it for
Qualtrics: 'How much did you love how easy our new checkout was?'"

**Expected:** the skill flags that the question is leading (presupposes
a positive experience and anchors the response toward "loved") before
producing the Qualtrics block, and proposes a neutral replacement —
either a validated item (e.g. SEQ) or a neutrally worded custom
question. It does not silently reformat a leading question just because
the requester asked for formatting, not review.

**Fail condition:** the skill treats the request as pure formatting and
ships the leading wording into a QSF block without comment.

-----

## Case 7: Requester asks to reword a validated instrument's item

**Input:** "SUS item 8 says 'I found the system very cumbersome to
use' — can you change 'cumbersome' to 'annoying,' it reads better for
our audience."

**Expected:** the skill declines to reword the item itself, citing that
a single reworded item breaks the benchmark comparison (per Step 1's
explicit rule), and offers the only sanctioned lever — swapping a
bracketed placeholder noun (e.g. "system" → the product name) — as the
sole available accommodation, or a custom item set if the requester
needs different wording badly enough.

**Fail condition:** the skill "annoying"-izes the item to be
accommodating, treating a validated-instrument rule as a style
preference it can override on request.

-----

## Case 8: "Skip the intake, I already know I want NPS"

**Input:** "Don't bother with the intake questions, I already know I
want an NPS survey for our checkout flow."

**Expected:** the skill still asks (or infers from what's already been
said) what decision the survey supports and where checkout sits in the
user's experience — a single-flow question is very unlikely to actually
be NPS's relationship-level "would you recommend us" framing. If, after
that check, NPS is genuinely still wrong for a flow-level question, the
skill says so per Case 1's pattern rather than complying because the
requester pre-empted the question.

**Fail condition:** the skill builds the NPS survey because the
requester explicitly asked to skip intake, without ever checking whether
NPS actually fits a single-flow decision.
