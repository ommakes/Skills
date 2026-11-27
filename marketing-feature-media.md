# Marketing Feature Media `[PATH-M]`

Reference for how to compose product UI, screenshots, photos, and illustrations inside marketing feature blocks. Read this when a marketing page (`[PATH-G]`) needs more than a flat image tile: device chrome, split rows, triptychs, bento grids, focal callouts, or scroll behavior.

**These are taste rules for marketing surfaces, not general laws.** A docs page, in-app upsell, or product UI can break them for good reasons.

**Scope:** PATH-M is a media-composition layer inside PATH-G. It does not define the page, section, copy, tokens, or components. It is designed for short, focused marketing pages. Dense SaaS/product pages may need additional treatments.

**Routing:**
- Page structure and section rules stay in `marketing-pages.md` (`[PATH-G]`).
- This file chooses the **primary media treatment** inside a feature block.
- Token values go to `vois-tokens` (`DS-MKT-009` to `DS-MKT-011`, plus `DS-ANIMATION-*` and `DS-MOTION-*`).
- Component picks go to `vois-components`.
- Slop rules go to `vois-tokens/references/anti-slop.md`.
- Accessibility goes to `DS-A11Y`.
- Words go to `righter`.

---

## 1. The PATH-M model

PATH-M has four layers:

1. **Primary treatment** — how the section is laid out.
2. **Media composition** — frame, chrome, blend, focal callout.
3. **Media behavior** — static, entrance, sticky, parallax, video.
4. **Quality checks** — evidence, realism, responsive behavior, accessibility, performance.

**One primary treatment per section does not mean one visual primitive.** A split row can contain a device frame, chrome, blend, and one focal callout.

When `[PATH-G]` applies, its section rules still apply: one idea per section, three blocks max, no dividers, left-align by default. PATH-M changes only how the media inside those blocks is composed.

---

## 2. Choose the primary treatment

Choose from what the section needs to **prove**, not from decoration or the number of assets available.

### Decision table

| Section need | Treatment | Evidence shape |
|---|---|---|
| One claim, one focal state, media benefits from scale | Centered | One dominant state |
| One claim, tall/narrow UI or device-shaped media beside explanatory copy | Split | One primary state |
| Three parallel claims with equal weight and distinct supporting media | Triptych | Three distinct states |
| One idea that requires two or three materially different states | Bento | Multiple related states |

**Claim-density rule:** one claim should not become a triptych merely because three screenshots exist. Three images are not three claims.

**Media-density rule:** if the section contains more than three independent claims, split the section rather than adding a denser treatment.

### Treatment selection pseudo-logic

```text
IF claims = 3
AND claims_are_parallel = true
AND each_claim_has_distinct_media = true
→ TRIPTYCH

ELSE IF claims = 1
AND required_media_states >= 2
AND states_are_materially_different = true
→ BENTO

ELSE IF claims = 1
AND media_is_tall_or_device_shaped = true
→ SPLIT

ELSE IF claims = 1
AND focal_media = true
→ CENTERED

ELSE
→ split the content into sections or return to PATH-G
```

The first matching rule wins only when its evidence requirements are satisfied. Do not force a treatment because an asset exists.

---

## 3. Centered hero media `[PATH-M-TREATMENT-CENTERED]`

Use one large focal media piece when the media itself is the proof.

**Best when**
- one primary claim;
- one dominant screenshot, illustration, or UI state;
- media benefits from large scale;
- no side-by-side explanatory relationship is needed.

**Do not use when**
- three claims have equal weight;
- the media is tall/device-shaped and copy needs to explain it beside the device;
- multiple materially different states are required;
- the media is decorative rather than evidentiary.

Desktop may place copy above or below the media. On phone, place media first, then copy.

---

## 4. Split row `[PATH-M-TREATMENT-SPLIT]`

Two columns: media on one side, explanatory copy on the other.

**Best when**
- one feature is being explained;
- the media is tall, narrow, or device-shaped;
- the media and copy form one explanatory pair.

Alternate media sides across repeated split rows on desktop.

**Do not use when**
- three independent claims need equal weight;
- the media is so wide that the split crop destroys the evidence;
- two or more materially different states are needed to explain one idea.

Phone: media first, then copy.

---

## 5. Triptych `[PATH-M-TREATMENT-TRIPTYCH]`

Three equal columns. Each column contains media, a short title, and one or two sentences.

**Best when**
- exactly three parallel claims;
- equal visual weight is appropriate;
- each claim has distinct supporting media.

**Do not use when**
- three images are decorative variations of one claim;
- the screenshots are effectively duplicates;
- the section is one idea with several UI states.

The three media treatments should differ in crop, emphasis, or content (`DS-SLOP-003`).

Phone: stack in claim order.

---

## 6. Bento grid `[PATH-M-TREATMENT-BENTO]`

Two or three tiles in one section with intentionally unequal visual weight.

**Best when**
- one idea requires multiple UI states;
- the states are materially different;
- one state is more important and should receive more space.

**Do not use when**
- all tiles are the same size and treatment;
- bento is being used only to make a generic card grid look more designed;
- each tile is actually an independent claim.

Phone: stack the most important/largest state first.

---

## 7. Media composition

These are composable inside any primary treatment.

### Frame `[PATH-M-FRAME]`

Use a rounded marketing frame for screenshots and photos. Use the marketing radius token from `vois-tokens`. Photo tiles remain at least 300px tall on mobile when PATH-G-TILE applies.

### Chrome `[PATH-M-CHROME]`

When product UI is shown as marketing media, use a simplified browser, window, or device frame when it adds useful context. Crop to the job. Never ship a full OS desktop merely to make the screenshot look complete.

Chrome is decoration around the screenshot, not another screenshot.

### Blend `[PATH-M-BLEND]`

Use one soft shape or gradient behind media when it helps the frame meet the page background. Keep one visual color family per section. Do not stack competing blobs.

### Focal callout `[PATH-M-FOCAL]`

When one control or region needs emphasis, use one static ring, magnifier, or label. One focal point per frame. Do not add a second full screenshot to show the same control.

Interactive callouts must be keyboard reachable. Static callouts must meet contrast requirements from `DS-A11Y`.

---

## 8. Choose static media vs. motion

Use the evidence type to decide behavior:

| Claim depends on | Media |
|---|---|
| A state or outcome | Static screenshot/photo/illustration |
| A reveal or small transition | Optional entrance motion |
| A multi-step interaction | Video/demo |
| Something moving or changing continuously | Video/demo when motion is essential to comprehension |

Do not use video merely because a still screenshot looks less exciting.

### Entrance `[PATH-M-MOTION]`

Marketing media may reveal once as it enters the viewport. Use canonical motion tokens. One entrance behavior per section. No looping decoration.

### Sticky

Use sticky media only when keeping the evidence visible materially improves comprehension while related copy scrolls past. One sticky media element per section. Disable sticky on phone.

### Parallax

If used, keep it subtle. Never apply parallax to text. Media should drift with the page, not race it.

### Video `[PATH-M-VIDEO]`

Use a poster frame that works without playback.

Video requirements:
- muted;
- `playsinline`;
- no sound autoplay;
- do not begin playback before the media enters view;
- captions/transcript when speech is present;
- reduced motion shows the poster frame and does not autoplay.

Ambient loops should remain short. If the sequence needs substantial duration or controls, treat it as a demo rather than ambient decoration.

---

## 9. Evidence: claim → media

The media must prove the section's headline.

Use this chain:

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

### Content rules

- Outcome claim → show the outcome state.
- Dashboard/data claim → show populated data.
- Setup/getting-started claim → an empty/setup state may be appropriate.
- One screenshot → one primary claim.
- Use realistic fictional data.
- Never ship real customer names, emails, financial figures, or other sensitive data.
- Crop to the control or result named by the copy.

If the screenshot does not show the thing the copy claims, change the screenshot rather than weakening the copy.

---

## 10. Responsive behavior

Shared defaults:

- Desktop preserves the intended primary treatment.
- Tablet reduces density before sacrificing evidence.
- Phone stacks media before copy.
- Triptych stacks in claim order.
- Bento stacks the most important/largest state first.
- Sticky and parallax are off on phone.
- Never create page-level horizontal scrolling.

Do not repeat these defaults in every treatment unless a treatment has an exception.

---

## 11. Accessibility and reduced motion

- Informative media alt text describes what the media proves, not merely what it is.
- Decorative frames, chrome, and backdrop shapes use empty alt / `aria-hidden`.
- Interactive callouts are keyboard reachable.
- Callout labels meet contrast requirements from `DS-A11Y`.
- With `prefers-reduced-motion`, show the final state with no entrance motion, scroll motion, or looping decoration.
- Focal callouts remain static.
- Video uses its poster frame.

Canonical accessibility and motion values remain in their owning skills.

---

## 12. Performance

Performance is an implementation constraint, not a treatment-selection rule.

- Prefer AVIF/WebP where appropriate.
- Serve close to rendered dimensions, up to 2x for retina.
- Lazy-load below-fold media.
- Hero/LCP media should load eagerly with high priority when appropriate.
- Compress to the smallest size that preserves visual fidelity.

A 200 KB target is a preferred optimization target for ordinary static media, not a hard PATH-M limit.

---

## 13. Anti-slop

Avoid:
- three identical image cards presented as a triptych;
- generic centered screenshot + generic copy as the default;
- bento used solely for visual novelty;
- multiple gradients/blobs behind one media block;
- duplicate screenshots used as "proof";
- full application desktops when a focused crop would communicate better;
- decorative motion that does not clarify the product.

Canonical `DS-SLOP-*` definitions live in `vois-tokens/references/anti-slop.md`.

---

## 14. Layout lint

- [ ] Primary treatment matches the section's claim/media structure.
- [ ] Treatment has passed its rejection criteria.
- [ ] Only one primary treatment is used per section.
- [ ] Supporting media treatments are composable rather than treated as separate layout blocks.
- [ ] PATH-G still controls section count, content density, alignment, and CTA rules.
- [ ] Media proves the headline claim.
- [ ] One screenshot does not carry multiple unrelated claims.
- [ ] Product UI uses appropriate chrome when it represents the product.
- [ ] Frames use marketing radius from `DS-MKT-009`.
- [ ] No duplicate/identical tiles masquerade as a triptych or bento.
- [ ] Mobile places media before copy.
- [ ] Motion is optional, non-looping, and token-driven.
- [ ] Reduced motion shows the final state.
- [ ] Informative media has meaningful alt text.
- [ ] Decorative media is hidden from assistive technology.
- [ ] Below-fold media is optimized and lazy-loaded.

## 15. Routing

PATH-M is the media layer inside PATH-G:

```text
PATH-G
  ↓
marketing-pages.md
  ↓
PATH-M
  ↓
choose primary treatment
  ↓
compose media
  ↓
choose behavior
  ↓
read vois-components + vois-tokens
```

Do not move token values, component implementation, slop definitions, accessibility standards, or copy rules into this file.
