# PRD: Marketing Feature Media Guidance

**Status:** Proposed for implementation  
**Target:** vois-patterns  
**Reference:** vois-patterns/references/marketing-feature-media.md  
**Related:** vois-patterns/references/marketing-pages.md, vois-patterns/data/patterns-rules.json, vois-patterns/SKILL.md, vois-tokens, vois-components, righter

## Summary

Revise PATH-M from a human-oriented visual reference into an explicit decision system that Vois can retrieve and apply.

The change separates four concerns:

1. primary layout treatment;
2. composable media treatment;
3. media behavior;
4. quality and evidence checks.

The result should let Vois reason about why centered, split, triptych, or bento is appropriate instead of matching a treatment to the number of assets.

## Problem

The current PATH-M lists useful treatments but leaves important decisions implicit. It does not clearly define:
- how a task maps to a treatment;
- when a treatment should be rejected;
- the difference between a primary layout treatment and composable media primitives;
- when static media, motion, or video is justified;
- how the screenshot itself must prove the marketing claim;
- which responsive rules are shared versus treatment-specific.

That makes the guidance easier for a human to read than for an agent to retrieve and apply consistently.

## Goals

- Make treatment selection explicit and condition-driven.
- Add rejection criteria so Vois can avoid false-positive pattern matches.
- Separate layout selection from frame, chrome, blend, callout, and behavior.
- Make media evidence-driven: claim → expected evidence → media state → crop → optional callout.
- Establish a shared responsive policy.
- Route token values, components, accessibility, motion, and slop rules to their canonical owners.
- Keep PATH-M scoped to marketing feature media.

## Non-goals

- Redesigning PATH-G marketing page structure.
- Replacing vois-components or vois-tokens.
- Turning marketing media rules into universal product UI rules.
- Adding production examples as a merge blocker.
- Hardcoding token values or motion timings in PATH-M.

## Decision model

| Input | Treatment |
|---|---|
| One claim, one focal state, media benefits from scale | Centered |
| One claim, tall/narrow/device-shaped media beside explanatory copy | Split |
| Three parallel claims with equal weight and distinct media | Triptych |
| One idea with two or three materially different states and unequal importance | Bento |
| More than three independent claims | Split into sections |

The number of assets must never be the primary selection signal.

### Rejection criteria

Each treatment gets explicit reject conditions. This prevents three screenshots from automatically becoming a triptych or several screenshots of one state from becoming a bento grid.

## Media composition

The primary treatment may contain:
- frame;
- simplified chrome;
- backdrop blend;
- one focal callout.

“One treatment per section” means one primary layout treatment, not one visual primitive.

## Behavior

Use static media for states and outcomes. Use entrance motion only for a one-time reveal. Use video/demo when comprehension depends on a sequence, transition, or continuous motion.

Sticky media is justified only when keeping evidence visible improves comprehension. Parallax remains subtle and is never applied to text. Sticky and parallax are disabled on phone.

Reduced motion shows the final state or poster without entrance, scroll, pulse, or looping behavior.

## Evidence model

Every marketing media block follows:

CLAIM → EXPECTED EVIDENCE → MEDIA STATE → CROP → OPTIONAL CALLOUT

Rules:
- outcome claims show outcome states;
- data claims show populated data;
- setup claims may show setup/empty states;
- screenshots use realistic fictional data;
- real customer PII and financial information are never shipped;
- if the media cannot prove the claim, replace the media rather than weakening the copy.

## Responsive policy

Shared defaults:
- preserve desktop hierarchy;
- reduce density before sacrificing evidence at tablet;
- media before copy on phone;
- triptych stacks in claim order;
- bento puts the most important state first;
- sticky/parallax are off on phone;
- no page-level horizontal scrolling.

Treatment-specific references should document exceptions only.

## Performance

Keep guidance implementation-aware. Optimize ordinary static media toward 200 KB, but do not make 200 KB a hard PATH-M rule. Use modern image formats, appropriate rendered dimensions, lazy loading below the fold, and high-priority loading for critical hero/LCP media.

## Data model

Update PATH-M entries in patterns-rules.json so the lookup layer contains:
- primary PATH-M node;
- centered, split, triptych, and bento sub-decisions;
- claim-to-evidence rule;
- state-vs-flow rule;
- responsive media-ordering rule.

JSON remains a compact routing/decision index. Detailed prose stays in marketing-feature-media.md.

## SKILL routing

The marketing branch should explicitly route:

PATH-G → marketing-pages.md → non-flat feature media → PATH-M → choose primary treatment → apply composable media treatments → choose static/motion behavior → read vois-components and vois-tokens.

## Validation cases

1. One product claim + tall phone screenshot → split.
2. One product claim + wide dashboard screenshot → centered.
3. Three equal benefits + three distinct photos → triptych.
4. One automation feature + dashboard state + detail state → bento.
5. Three repeated screenshots of one state → reject triptych/bento.
6. Claim says bookings increased + empty dashboard screenshot → reject media and request evidence-bearing state.
7. Mobile split row → media first, then copy.
8. Reduced-motion focal callout → static callout, no pulse/reveal.

## Acceptance criteria

- [ ] Explicit treatment selection criteria exist.
- [ ] Each treatment has rejection criteria.
- [ ] Primary treatment is distinct from composable media treatments.
- [ ] Claim → evidence → media state → crop is explicit.
- [ ] State-vs-flow determines static vs video guidance.
- [ ] Shared responsive policy exists.
- [ ] Token and component ownership remains canonical.
- [ ] PATH-M JSON remains concise and retrievable.
- [ ] Main SKILL routes into PATH-M without ambiguity.
- [ ] No new treatment is introduced without evidence.

## Rollout

1. Add this PRD to prds/.
2. Revise marketing-feature-media.md.
3. Update PATH-M entries in patterns-rules.json.
4. Update SKILL.md and version.
5. Update skills.json.
6. Run rule-sync and existing Vois evals.
7. Add production examples later as evidence.
