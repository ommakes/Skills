# Marketing Feature Media [PATH-M]

Reference for composing product UI, screenshots, photos, and illustrations inside marketing feature blocks. PATH-M is the media-composition layer inside PATH-G.

**Scope:** Choose the primary media treatment, then apply composable media treatments, behavior, evidence, responsive, accessibility, and performance rules. These are taste rules for marketing surfaces, not universal UI laws.

**Routing**
- Page structure: marketing-pages.md [PATH-G]
- Media treatment: this file [PATH-M]
- Tokens and motion values: vois-tokens
- Component picks: vois-components
- Accessibility: DS-A11Y
- Slop rules: anti-slop.md
- Words: righter

## 1. PATH-M model

PATH-M has four layers:

1. Primary treatment: how the section is laid out.
2. Media composition: frame, chrome, blend, focal callout.
3. Media behavior: static, entrance, sticky, parallax, video.
4. Quality checks: evidence, realism, responsive behavior, accessibility, performance.

**One primary treatment per section does not mean one visual primitive.** A split row can contain a device frame, chrome, blend, and one focal callout.

PATH-G still owns page structure: one idea per section, three blocks max, no dividers, left-align by default.

## 2. Choose the primary treatment

Choose from what the section needs to prove, not from decoration or the number of assets available.

| Section need | Treatment |
|---|---|
| One claim, one focal state, media benefits from scale | Centered |
| One claim, tall/narrow or device-shaped media beside explanatory copy | Split |
| Three parallel claims with equal weight and distinct supporting media | Triptych |
| One idea requiring two or three materially different states | Bento |

**Claim-density rule:** one claim does not become a triptych because three screenshots exist. Three images are not three claims.

**Media-density rule:** more than three independent claims means split the content into sections rather than inventing a denser treatment.

Selection logic:

- Exactly three parallel claims + distinct media → TRIPTYCH.
- One idea + two or three materially different states + unequal importance → BENTO.
- One claim + tall/narrow/device-shaped media beside explanatory copy → SPLIT.
- One claim + one dominant focal state → CENTERED.
- If none fits cleanly, split the content or return to PATH-G. Do not force a treatment because an asset exists.

## 3. Centered hero media [PATH-M-TREATMENT-CENTERED]

Use one large focal media piece when the media itself is the proof.

**Best when**
- one primary claim;
- one dominant screenshot, illustration, or UI state;
- media benefits from scale;
- no side-by-side explanatory relationship is needed.

**Reject when**
- three claims have equal weight;
- media is tall/device-shaped and copy needs to explain it beside the device;
- multiple materially different states are required;
- media is decorative rather than evidentiary.

Desktop may place copy above or below. Phone: media first, then copy.

## 4. Split row [PATH-M-TREATMENT-SPLIT]

Two columns: media on one side, explanatory copy on the other.

**Best when**
- one feature is being explained;
- media is tall, narrow, or device-shaped;
- media and copy form one explanatory pair.

Alternate media sides across repeated split rows on desktop.

**Reject when**
- three independent claims need equal weight;
- media is too wide for the crop;
- two or more materially different states are needed to explain one idea.

Phone: media first, then copy.

## 5. Triptych [PATH-M-TREATMENT-TRIPTYCH]

Three equal columns. Each column contains media, a short title, and one or two sentences.

**Best when**
- exactly three parallel claims;
- equal visual weight is appropriate;
- each claim has distinct supporting media.

**Reject when**
- three images merely decorate one claim;
- screenshots substantially repeat the same state;
- the section is one idea with several UI states.

The three media treatments should differ in crop, emphasis, or content.

Phone: stack in claim order.

## 6. Bento grid [PATH-M-TREATMENT-BENTO]

Two or three tiles with intentionally unequal visual weight.

**Best when**
- one idea requires multiple UI states;
- states are materially different;
- one state is more important and should receive more space.

**Reject when**
- all tiles are the same size and treatment;
- bento exists only to make a generic card grid look more designed;
- each tile is actually an independent claim.

Phone: stack the most important/largest state first.

## 7. Composable media treatments

These can be used inside any primary treatment.

### Frame [PATH-M-FRAME]
Use a rounded marketing frame for screenshots and photos. Use the marketing radius token from vois-tokens. Photo tiles remain at least 300px tall on mobile when PATH-G-TILE applies.

### Chrome [PATH-M-CHROME]
Use a simplified browser, window, or device frame when it adds useful product context. Crop to the job. Never ship a full OS desktop merely to make the screenshot look complete.

Chrome is decoration around the screenshot, not another screenshot.

### Blend [PATH-M-BLEND]
Use one soft shape or gradient behind media when it helps the frame meet the page background. Keep one visual color family per section. Do not stack competing blobs.

### Focal callout [PATH-M-FOCAL]
When one control or region needs emphasis, use one static ring, magnifier, or label. One focal point per frame. Do not add a second full screenshot to show the same control.

Interactive callouts must be keyboard reachable. Static callouts must meet DS-A11Y contrast requirements.

## 8. Choose static media vs motion

| Claim depends on | Media |
|---|---|
| A state or outcome | Static screenshot/photo/illustration |
| A reveal or small transition | Optional entrance motion |
| A multi-step interaction | Video/demo |
| Something moving continuously | Video/demo when motion is essential to comprehension |

Do not use video merely because a still screenshot looks less exciting.

### Entrance [PATH-M-MOTION]
Marketing media may reveal once as it enters the viewport. Use canonical motion tokens. One entrance behavior per section. No looping decoration.

### Sticky
Use only when keeping evidence visible materially improves comprehension while related copy scrolls past. One sticky media element per section. Disable sticky on phone.

### Parallax
Keep it subtle. Never apply parallax to text. Media should drift with the page, not race it.

### Video [PATH-M-VIDEO]
Use a poster frame that works without playback. Video should be muted, playsinline, have captions/transcript when speech is present, and never autoplay with sound. Do not begin playback before the media enters view. Reduced motion shows the poster and does not autoplay.

Ambient loops should remain short. If a sequence needs substantial duration or user control, treat it as a demo rather than ambient decoration.

## 9. Evidence: claim → media

The media must prove the section headline.

CLAIM → EXPECTED EVIDENCE → MEDIA STATE → CROP → OPTIONAL CALLOUT

- Outcome claim → show the outcome state.
- Dashboard/data claim → show populated data.
- Setup/getting-started claim → an empty/setup state may be appropriate.
- One screenshot → one primary claim.
- Use realistic fictional data.
- Never ship real customer names, emails, financial figures, or other sensitive data.
- Crop to the control or result named by the copy.

If the screenshot does not show the thing the copy claims, change the screenshot rather than weakening the copy.

## 10. Responsive behavior

Shared defaults:
- desktop preserves the intended primary treatment;
- tablet reduces density before sacrificing evidence;
- phone stacks media before copy;
- triptych stacks in claim order;
- bento stacks the most important/largest state first;
- sticky and parallax are off on phone;
- never create page-level horizontal scrolling.

Do not repeat these defaults in every treatment unless there is an exception.

## 11. Accessibility and reduced motion

- Informative media alt text describes what the media proves, not merely what it is.
- Decorative frames, chrome, and backdrop shapes are hidden from assistive technology.
- Interactive callouts are keyboard reachable.
- Callout labels meet DS-A11Y contrast requirements.
- Reduced motion shows the final state with no entrance, scroll, or looping behavior.

Canonical accessibility rules remain in DS-A11Y.

## 12. Performance

Use implementation-aware guidance:
- AVIF/WebP where appropriate;
- rendered dimensions with up to 2x pixel density;
- lazy loading below the fold;
- eager/high-priority loading for hero media when it is a critical LCP asset;
- compression appropriate to asset type.

Treat **200 KB as a preferred optimization target for ordinary static media, not a hard PATH-M requirement.**

## 13. Layout lint

- [ ] Treatment matches claim/media structure.
- [ ] One primary treatment per section.
- [ ] At most three blocks when PATH-G applies.
- [ ] Media proves the section claim.
- [ ] Frames use marketing radius tokens.
- [ ] Product UI uses appropriate chrome when context helps.
- [ ] No decorative blob stack or generic card-grid treatment.
- [ ] Reduced motion shows the final state.
- [ ] Sticky/parallax are disabled on phone unless explicitly justified.
- [ ] Motion values come from canonical token owners.

## 14. Ownership and routing

| Concern | Owner |
|---|---|
| Marketing page structure | marketing-pages.md [PATH-G] |
| Media layout treatment | marketing-feature-media.md [PATH-M] |
| Pattern lookup / condition | data/patterns-rules.json |
| Token values | vois-tokens |
| Device/chrome components | vois-components |
| Accessibility | DS-A11Y |
| Motion values | DS-ANIMATION-*, DS-MOTION-*, DS-MKT-011 |
| Slop rules | vois-tokens/references/anti-slop.md |
| Marketing copy | righter |

PATH-M should reference canonical owners rather than duplicate their rules.
