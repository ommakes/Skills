# PRD: Marketing Feature Media Guidance — Agent-Optimized Revision

**Status:** Proposed for implementation
**Target skill:** `vois-patterns`
**Reference:** `vois-patterns/references/marketing-feature-media.md`
**Related:** `vois-patterns/references/marketing-pages.md`, `vois-patterns/data/patterns-rules.json`, `vois-patterns/SKILL.md`, `vois-tokens`, `vois-components`, `righter`

## 1. Summary

Revise Marketing Feature Media (`[PATH-M]`) from a human-oriented visual reference into an explicit decision system that Vois can retrieve and apply.

The existing guidance correctly identifies four useful marketing-media treatments:

- centered hero
- split row
- triptych
- bento

The revision keeps those treatments but separates four layers of reasoning:

1. **Primary layout treatment:** how the section is composed.
2. **Media composition:** frame, chrome, blend, focal callout.
3. **Media behavior:** static, entrance reveal, sticky, parallax, video.
4. **Quality constraints:** evidence, realism, responsive behavior, accessibility, performance.

The key change is that Vois should choose a treatment from the section's **claim structure and evidence needs**, not from the number or shape of available images.

## 2. Problem

The current reference is strong taste guidance but has several weaknesses for agent use:

- Treatment selection is described primarily in prose rather than explicit decision criteria.
- "One treatment per section" can be interpreted as prohibiting composable media treatments such as chrome or a focal callout.
- Several rules mix layout selection, implementation details, accessibility, performance, and motion.
- The current rules tell an agent when a pattern fits but provide little guidance for rejecting a tempting but incorrect pattern.
- Mobile behavior is repeated inside individual treatments instead of being expressed as a shared responsive policy.
- The evidence relationship between marketing copy and screenshot content is stated, but not modeled as a decision sequence.
- Hard-looking numbers such as 200 KB, 16px, 300ms, and 10 seconds are not all appropriate as pattern-level rules.
- The JSON routing layer needs to expose the stronger decision logic so retrieval can work without loading the entire reference.

## 3. Goals

### Primary goals

1. Make treatment selection deterministic enough for an agent to reason about.
2. Preserve human-readable design guidance.
3. Make layout, composition, behavior, and quality rules independently retrievable.
4. Establish explicit rejection criteria for each treatment.
5. Make screenshot/media selection evidence-driven: claim → evidence → media state → crop → optional callout.
6. Preserve PATH-G ownership of page structure while making PATH-M the media-composition layer.
7. Keep token values and component choices owned by their canonical skills.

### Non-goals

- Creating new marketing layouts beyond centered, split, triptych, and bento.
- Moving token values into `vois-patterns`.
- Replacing `vois-components` or `vois-tokens`.
- Turning marketing-media guidance into universal UI rules.
- Requiring production examples before the reference can be merged.
- Adding a new standalone page type.

## 4. Design principles

### 4.1 Claim density drives media density

Use the smallest media composition that adequately proves the section's claim.

- 1 claim + 1 focal state → centered or split.
- 3 parallel claims + 3 distinct states → triptych.
- 1 idea + 2–3 materially different states → bento.
- More than 3 independent claims → split the content into sections rather than inventing a denser media treatment.

### 4.2 One primary treatment, composable media treatments

"One treatment per section" means one **primary layout treatment**, not one visual primitive.

Example:

```text
PRIMARY TREATMENT
→ Split

MEDIA COMPOSITION
→ Device frame
→ Chrome
→ Blend

BEHAVIOR
→ Entrance reveal

CALLOUT
→ One focal point
```

### 4.3 Evidence follows the claim

Marketing media should prove the headline.

Use:

```text
CLAIM
↓
EXPECTED EVIDENCE
↓
MEDIA STATE
↓
CROP
↓
OPTIONAL CALLOUT
```

If the media cannot prove the claim, change the media rather than weakening the claim to fit the screenshot.

### 4.4 State vs. flow

- A **state** is best shown with static media.
- A **transition or sequence** may justify motion.
- A repeated or multi-step interaction may justify video/demo media.

## 5. Proposed decision system

### 5.1 Centered

**Best when**

- one focal media state carries the section;
- the media benefits from large scale;
- there is no strong reason to split media and copy;
- the section has one primary claim.

**Reject when**

- there are three equal claims;
- the media is tall/device-shaped and benefits from explanatory copy beside it;
- the section needs multiple unlike states;
- the media is decorative rather than evidentiary.

**Responsive**

Desktop may place copy above or below the focal media. Mobile uses media first, then copy.

### 5.2 Split

**Best when**

- one feature is being explained;
- media is tall, narrow, or device-shaped;
- the copy and media form one explanatory pair.

**Reject when**

- multiple independent claims need equal weight;
- the media is too wide to survive the column;
- two or more materially different states are needed to explain one idea.

**Responsive**

Media first, then copy on mobile. Alternate media side on desktop when multiple split rows occur.

### 5.3 Triptych

**Best when**

- there are exactly three parallel claims;
- claims have equal weight;
- each claim has distinct supporting media.

**Reject when**

- three images merely decorate one claim;
- the three media states are substantially identical;
- the section really contains one idea with several views.

In those cases, prefer centered, split, or bento.

### 5.4 Bento

**Best when**

- one idea requires two or three unlike UI states;
- states have different importance;
- one state should receive more visual weight.

**Reject when**

- tiles are identical in size and treatment;
- the only reason for bento is to make the section look "more designed";
- each tile is actually an independent claim that deserves its own section.

## 6. Media composition rules

### Frame

Use the marketing radius token from `vois-tokens`. Do not hardcode token values in PATH-M.

### Chrome

When product UI represents the product itself, use a simplified browser, window, or device frame when it adds useful product context. Crop to the job. Never show an entire OS desktop merely to make the screenshot look more complete.

### Blend

A backdrop may visually connect media to the page. Use one visual family per section. Do not layer multiple competing blobs or gradients.

### Focal callout

Use one focal point per frame. A callout may be a ring, magnifier, or static label. Do not duplicate the entire screenshot to highlight a control.

## 7. Media behavior

### Static

Use static media for a state or outcome.

### Entrance

A marketing media block may reveal once when it enters the viewport. Use canonical motion tokens. Do not create new timing values in PATH-M.

### Sticky

Use only when keeping the media visible materially improves comprehension while related copy progresses. One sticky media element per section. Disable sticky on phone.

### Parallax

Optional and subtle. Never apply parallax to text. It must not race the document scroll.

### Video

Use video when the claim depends on a sequence or moving interaction.

Requirements:

- muted;
- `playsinline`;
- poster frame works independently;
- captions/transcript when speech is present;
- no sound autoplay;
- no autoplay before the media enters view;
- reduced motion uses the poster frame.

Ambient loops should be short. If a sequence needs substantial duration or user control, treat it as a demo rather than ambient decoration.

## 8. Responsive policy

Shared defaults:

- preserve the primary desktop hierarchy;
- stack rather than shrink into illegibility;
- media precedes copy on phone;
- triptych stacks in claim order;
- bento stacks largest/most important state first;
- sticky and parallax are disabled on phone unless a specific product requirement justifies otherwise;
- never create page-level horizontal scrolling.

Individual treatment references should only document exceptions.

## 9. Evidence and screenshot quality

Every screenshot should answer: **what does this prove?**

Rules:

- show outcome state for outcome claims;
- show populated data for dashboard/data claims;
- use realistic fictional data;
- never expose real customer PII or financial data;
- crop to the control/result named by the copy;
- use one primary claim per screenshot;
- if the media does not support the claim, replace the media.

Avoid empty states unless the claim itself is about setup/getting started.

## 10. Accessibility

- informative media gets alt text describing what it proves;
- decorative chrome and blend shapes are hidden from assistive technology;
- static callouts remain accessible and readable;
- interactive callouts must be keyboard reachable;
- reduced motion shows the final state with no entrance, scroll, or looping behavior.

Canonical accessibility rules remain in `DS-A11Y`.

## 11. Performance

Performance guidance should remain implementation-aware without pretending asset size is a universal design rule.

Use:

- AVIF/WebP where appropriate;
- rendered dimensions with up to 2x pixel density;
- lazy loading below the fold;
- eager/high-priority loading for hero media when it is a critical LCP asset;
- compression appropriate to the asset type.

Treat 200 KB as a preferred optimization target for ordinary static media, not a hard PATH-M requirement.

## 12. Ownership and routing

| Concern | Owner |
|---|---|
| Marketing page structure | `marketing-pages.md` `[PATH-G]` |
| Media layout treatment | `marketing-feature-media.md` `[PATH-M]` |
| Pattern lookup / condition | `data/patterns-rules.json` |
| Token values | `vois-tokens` |
| Device/chrome components | `vois-components` |
| Accessibility | `DS-A11Y` |
| Motion values | `DS-ANIMATION-*`, `DS-MOTION-*`, `DS-MKT-011` |
| Slop rules | `vois-tokens/references/anti-slop.md` |
| Marketing copy | `righter` |

PATH-M should reference canonical owners rather than duplicate their rules.

## 13. Data model changes

Update PATH-M entries in `data/patterns-rules.json` so each treatment exposes:

- condition;
- outcome;
- best-fit criteria;
- rejection criteria;
- builds-on relationship;
- evidence/basis.

Do not duplicate every prose rule into JSON. The JSON should be a compact routing/decision index; the Markdown remains the detailed reference.

Add or revise cross-cutting rule entries for:

- claim-to-evidence;
- responsive media ordering;
- state-vs-flow media choice;
- primary treatment vs. composable media treatments.

## 14. SKILL.md changes

Update the marketing branch of the main decision tree to make the sequence explicit:

```text
PATH G
→ marketing-pages.md

IF feature block needs non-flat media
→ PATH M
→ choose primary treatment from claim/media state
→ apply media composition rules
→ apply behavior rules
→ read vois-tokens / vois-components
```

Update the version because the decision behavior changes.

## 15. Validation

A revision is successful if Vois can correctly answer these cases:

### Case A
"One product claim, one tall phone screenshot."

Expected: split.

### Case B
"One product claim, one wide dashboard screenshot."

Expected: centered.

### Case C
"Three equal audience benefits, each with a different photo."

Expected: triptych.

### Case D
"One automation feature explained through dashboard state + detail state."

Expected: bento.

### Case E
"Three screenshots of the same UI state placed in equal cards."

Expected: reject triptych/bento as decorative repetition.

### Case F
"Headline says bookings increased, screenshot is an empty dashboard."

Expected: reject screenshot and request an evidence-bearing populated state.

### Case G
"Mobile version of a split row."

Expected: media first, then copy.

### Case H
"Marketing media with a focal callout under reduced motion."

Expected: callout remains static; no pulse/reveal.

## 16. Acceptance criteria

- [ ] PATH-M has explicit treatment selection criteria.
- [ ] Each treatment has rejection criteria.
- [ ] Primary layout treatment is distinct from composable media treatments.
- [ ] Claim → evidence → media state → crop is explicit.
- [ ] State vs. flow determines static vs. video guidance.
- [ ] Shared responsive policy is established.
- [ ] Token values remain owned by `vois-tokens`.
- [ ] Slop rules remain owned by `anti-slop.md`.
- [ ] PATH-M JSON entries remain concise and retrievable.
- [ ] PATH-M is still clearly scoped to marketing feature media, not general product UI.
- [ ] The main skill routes into PATH-M without ambiguity.
- [ ] No new marketing treatment is introduced without evidence.

## 17. Rollout

1. Add this PRD to `prds/`.
2. Revise `marketing-feature-media.md`.
3. Update PATH-M entries in `data/patterns-rules.json`.
4. Update the marketing branch and version in `SKILL.md`.
5. Update `skills.json` version.
6. Run rule-sync validation and existing Vois evals.
7. Add production examples later as evidence, without blocking the rule revision.
