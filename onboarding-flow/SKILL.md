---
name: onboarding-flow
version: 1.1.1
author: Personify Labs
description: >
  Design new onboarding flows or evaluate/critique existing ones — signup sequences, setup
  checklists, first-run wizards, personalization quizzes, permission priming, paywalls — for
  SaaS/web products or consumer/mobile apps. Use this whenever someone asks to design, build,
  spec, improve, review, audit, or critique onboarding, a first-run experience, a getting-started
  flow, a signup sequence, an account setup wizard, or "the first thing users see," whether
  starting from scratch or from screenshots/a description of an existing flow.
  Pulls current visual reference from Mobbin, routes all UI copy to righter, and routes all
  structure/styling to the vois skills (vois-patterns → vois-components → vois-tokens).
tags:
  - design
  - ux
  - onboarding
  - product
  - mobbin
---

# Onboarding Flow

A skill for designing onboarding for two very different contexts. SaaS/web onboarding and
consumer/mobile onboarding fail for opposite reasons if you cross the patterns: block a SaaS
user behind a linear wizard and they bounce before seeing the product; let a consumer app skip
the personalization quiz and you lose the sign-up's whole reason for existing. Pick the right
one before you design or evaluate anything.

This skill defines the *sequence and screen types*. It is not a copywriting or styling skill:

- **Every word that appears on screen** (headlines, button labels, quiz questions, permission
  copy, checklist item text) routes to the **righter** skill. Don't guess at wording here.
- **Every structural/visual decision** (spacing, components, tokens, animation, accessibility)
  routes to **vois-patterns → vois-components → vois-tokens**, in that order.
- This skill sits *above* both: it tells you which screens exist and in what order (or should);
  righter tells you what words go on them; vois tells you how they're built.

---

## Two Modes

### Mode 1: Evaluate an Existing Flow
1. **Get the flow in front of you.** Screenshots, a Figma/Mobbin link, or a plain description of
   the screen-by-screen sequence. If it's incomplete, say what's missing rather than guessing at
   unseen screens.
2. **Determine the shape** using the decision tree below — SaaS companion checklist or consumer
   linear sequence. An existing flow that uses the wrong shape for its product type is itself a
   finding, not something to route around.
3. **Read the matching reference file** and walk the flow screen by screen against every rule
   `id` in `data/onboarding-rules.json` for that shape, plus the five `UNIV-*` rules.
4. **Output in the Review format below.** Don't rewrite copy or restyle components yourself —
   flag copy issues for righter and structural issues for vois-patterns, cite what should be
   checked there, and stop.

### Mode 2: Generate a New Flow
1. **What kind of product is this?** Walk the decision tree below — it determines the whole
   shape of the flow, not just the visual style.
2. **Pull current reference, don't rely on memory.** If the `mcp__Mobbin__search_flows` or
   `mcp__Mobbin__search_screens` tools are available, use them to pull 3–5 real examples for the
   *specific* product category (e.g. "fintech app onboarding," "B2B analytics tool setup guide")
   before finalizing screens — patterns date fast, and a competitor-specific pull beats the
   general patterns catalogued here. If Mobbin isn't available, use `references/` as the
   fallback baseline.
3. **Read the matching reference file** for the full screen-by-screen breakdown.
4. **Route copy to righter and structure to vois** as you build each screen — don't batch this
   at the end.
5. **Output in the New Flow format below.**

---

## Decision Tree: Which Onboarding Shape?

```
START: What is the user signing up for?

├─ SaaS / web product — used repeatedly at a desk, ongoing account, often paid seat-by-seat
│  └─ → read references/saas-onboarding.md                                  [SHAPE-SAAS]
│     Pattern: drop into the real product immediately, companion checklist alongside it.
│     Never a full-screen linear wizard that blocks the product.
│
└─ Consumer / mobile app — short sessions, one person, often a subscription decision up front
   └─ → read references/consumer-onboarding.md                             [SHAPE-CONSUMER]
      Pattern: linear full-screen sequence (value prop → personalize → permissions →
      account → paywall → confirmation → home). The wizard IS the experience before home.
```

If a product genuinely straddles both (e.g. a mobile companion app for a web SaaS product),
default to the shape of the surface you're designing or evaluating *this* flow for — a mobile
app onboarding still follows the consumer shape even if the parent product is B2B SaaS.

---

## Reference Files

| File | Covers | Shape ID |
|---|---|---|
| `references/saas-onboarding.md` | Setup guides, onboarding checklists, empty states, in-product companion patterns | `[SHAPE-SAAS]` |
| `references/consumer-onboarding.md` | Value prop screens, personalization quizzes, permission priming, paywalls, confirmation | `[SHAPE-CONSUMER]` |

Read only the one file that matches your shape. Each is self-contained.

---

## Output Formats

### Review format (Mode 1)
Use this for each screen or moment reviewed. Group by screen in flow order.

---
**Screen:** [name/position, e.g. "Screen 3 of 6 — interest picker"]

**Shape:** [SaaS companion checklist | Consumer linear sequence] — flag here if the flow is
using the wrong shape for its product type.

**Rules checked:** [list every rule `id` from `data/onboarding-rules.json` that applies to this
screen type, whether it passed or failed]

**Violations found:**
- `[rule id]`: [what's wrong] → [what to do instead, in one sentence]. If none, write "None found."

**Route to righter:** [any copy on this screen worth a pass — labels, headlines, error states —
or "Nothing flagged."]

**Route to vois:** [any structural/spacing/component concern worth a vois-patterns/vois-components
pass, or "Nothing flagged."]
---

After all screens: one summary line — total violations, and the single highest-leverage fix
(usually a `CONSUMER-004`/personalization-payoff or `SAAS-001`/blocking-wizard issue if either
is present).

### New Flow format (Mode 2)
Use the screen sequence itself as the deliverable — a numbered list of screens in order, each
with: screen purpose, primary action, what's collected or shown, and which rule `id`s it
satisfies. Follow with the Checklist Before Handing Off below, completed, not just shown blank.

---

## Universal Rules (apply regardless of shape or mode)

These held across every real flow pulled for this skill, SaaS and consumer alike. Every rule
below carries a stable `id` in backticks — cite the id, not the bullet position, when referencing
a rule from outside this file.

- **One primary action per screen** `id: UNIV-001`. For a screen presenting a single decision,
  give it exactly one primary action — if a screen has two competing CTAs for the same decision,
  one is winning by accident. Make the secondary action visually and verbally subordinate (text
  link, not a second button of equal weight). This doesn't apply to a checklist's per-item CTAs
  (`SAAS-003` — each item is its own independent action, not competitors) or a legally required
  consent screen's equal-weight buttons (`CONSUMER-007`).
- **Progress must be honest and visible** `id: UNIV-002`. A progress bar, step count ("Step 3 of
  4"), or fraction ("3/8 completed") should reflect real remaining effort, not motivate through
  vagueness. Never show progress that doesn't move.
- **Never trap the user** `id: UNIV-003`. Every screen needs a way out — back arrow, X, or skip
  — except the single final confirmation screen. A flow with no exit reads as coercive, not
  confident.
- **Ask before you tell** `id: UNIV-004`. If you collect a preference (goal, interest, role), the
  payoff must visibly appear within one or two screens after that answer. If it won't, cut the
  question — asking without using it just adds friction for nothing.
- **Route every word to righter, every layout decision to vois-patterns** `id: UNIV-005`. Don't
  write filler copy "for now" and don't eyeball spacing. It compounds into rework.

**Structured lookup:** `data/onboarding-rules.json` holds every tagged rule from this file and
both reference files as `{ id, condition, outcome, source_file }` — useful for a quick
condition/outcome check by `id` without opening the full file it lives in. This is also what
Mode 1 walks screen-by-screen against.

**Source of truth:** `data/onboarding-rules.json` is canonical for a rule's `condition`/`outcome`.
The `.md` files restate rules for readability and carry the worked examples (real app names,
screen-by-screen breakdowns) the JSON doesn't — but if the two ever disagree, the JSON wins.
`scripts/check-rule-sync.mjs` checks that every tagged id cited in the `.md` files resolves to a
real entry in the JSON and vice versa; run it after editing rules in either place.

---

## Checklist Before Handing Off (Mode 2)

- [ ] Shape selected (SaaS companion checklist vs. consumer linear sequence) and justified
- [ ] Pulled current Mobbin reference for this product's specific category, if the tool is available
- [ ] Screen sequence drafted, one primary action per screen
- [ ] Progress indicator defined and honest
- [ ] Every screen has an exit except the final confirmation
- [ ] Personalization inputs (if any) visibly reflected later in the flow
- [ ] All copy drafted through righter (not placeholder text)
- [ ] All structure/spacing/components resolved through vois-patterns → vois-components → vois-tokens

---

## Maintaining This Skill

`data/onboarding-rules.json` is the canonical rule set (18 rules: 5 universal, 6 SaaS, 7
consumer). When you add, remove, or reword a rule, update it in both the `.md` file and the
JSON, then run:

```
node scripts/check-rule-sync.mjs
```

It fails loudly if an id is tagged in markdown but missing from the JSON, listed in the JSON but
never cited in markdown, or tagged in a file that doesn't match the JSON's `source_file`. Run it
before publishing any edit to a rule.
