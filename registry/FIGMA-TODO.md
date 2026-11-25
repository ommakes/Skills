# Figma to-do

What the Vois Figma file (`Aou007Vh0uQPohJonhdadk`) still needs. Tokens that code needs before Figma has them go in `source/figma-pending.json`. The checker fails if one is missing from this list, so the list can't silently go stale.

## To do in Figma (toggle group, registry 0.25.0)

The four variables below are in the Figma file (`Component/Toggle Group/...`, bound in the Toggle Group Button set `3488:2898`), but the export does not have them yet. Re-export, then remove them from `source/figma-pending.json` (the build fails once they match).

- **`--toggle-group-unselected`**: Light `White`, Dark transparent (`#ffffff00`, as `--select-resting`). Figma shows `#ffffff` in light only.
- **`--toggle-group-hover`**: Light `Black-A1` (`#0000000a`, matches Figma), Dark `White-A2` (first pass).
- **`--toggle-group-selected`**: Light `Black-A2` (`#00000014`, matches Figma), Dark `White-A4` (first pass, one step above hover).
- **`--toggle-group-disabled`**: Light `Gray-2` (`#f0f0f0`, matches Figma), Dark `White-A1` (first pass).
- Figma has no Dark mode value for these four. Set the dark side in the variable collection, then re-export.
- Open: the Toggle Group example (`3488:2870`) draws the right button's edge with `System/Border/Border-Opaque` (`#e2e2e2`), while the standalone Selected button uses `Border-Default`. The code uses `Border-Default`. Rebind one of them.

## Open (registry 0.22.3, Button label inset)

The code Button now uses an 8px label inset at default and lg (4px at sm), with 8px container padding at every size. The Figma Primary Button set still has a 4px label frame inset and 12px container padding at Reg and Lg. To match: in the Primary Button set, Reg and Lg, set the label frame's horizontal padding to `Space/Padding/X-Small` (8) and the container's horizontal padding to `Space/Padding/X-Small` (8). Sm stays as it is. Text-only buttons keep their width; buttons with an icon keep theirs too (icon side 8, gap 8).

## Done on 2026-11-20 (contrast, registry 0.22.1)

The five variables below were changed in the Vois Figma file (variable aliases only, both modes), and their entries are out of `source/figma-pending.json`. Found by the rendered accessibility check (`harness/README.md`): each was under the 4.5:1 minimum for normal text. `source/figma-export.json` carries the five new values.

- **Drift fixed, same day.** A re-export did not match the committed file for three variables, and Figma was the side that had moved. Figma now holds the file's values: `--border-default` is `Gray-6` light and `Gray-5` dark, `--border-state-focus` is `Blue-10` light and `Blue-8` dark, and `--input-border` is `Gray-5-5` light and `Gray-5` dark. A fresh export matches the committed file (checksum `bd32c4fe`, 908 tokens). Visible in the Figma file: dividers and field edges bound to `Border-Default` are darker in light mode. A new test in `build-tokens.test.mjs` keeps the ring blue and every edge token neutral, so an edge cannot compete with the focus ring.

- **`--text-state-instruction`** (placeholder text; Select, Input, Textarea, Input group. The Dropdown menu and Command use `--text-hint` instead, so they are unaffected): was `Gray-6` in both modes. Measured in Chromium against the fill the placeholder sits on: 3.46:1 on the light field (`#eaeaea`), 3.84:1 on the light error fill, 4.07:1 on the dark field and 3.70:1 on the dark error fill. Now `Gray-8` in light (6.1:1 on the field, 7.4:1 on the error fill) and `Gray-5` in dark (7.6:1, 7.0:1). `Gray-7` was tried first and gives 4.17:1 on the light field, so it still fails. Both new values are the step `--text-state-resting` already uses in that mode. `--text-state-disabled` is also `Gray-6` and stays as it is: disabled text is exempt.
- **`--solid-negative-resting`** (the solid destructive Button, white label): was `Tomato-8`, 4.16:1. Now `Tomato-9` (5.42:1), in both modes.
- **`--solid-negative-focus`**: was `Tomato-8`. Now `Tomato-9`, in both modes.
- **`--solid-negative-hover`**: was `Tomato-9`. Now `Tomato-10` (8.15:1), in both modes.
- **`--solid-negative-pressed`**: was `Tomato-10`. Now `Tomato-11` (11.68:1), in both modes.
- The Figma Primary Button set's destructive variants (Resting, Hover, Focus, Pressed) are bound to these variables, so rebinding the four variables is enough. Check that the `Solid/Negative` swatches on the Colors page still read as one ladder.

## Done on 2026-11-15 (every state, and the old draft slider rebuilt, registry 0.18.0)

- **A variant for each state the code draws**, every value bound to an existing variable (no new variables, export checksum unchanged):
  - `Slider` (`8166:3469`): Resting, Hover (6px `Bg-Hover` halo), Dragging (`Bg-Pressed` halo), Focus, Disabled. Track and fill corners now bound to `Radii-2`.
  - `Step Slider Stop` (`8166:3480`): the selected stop has Resting, Hover (1px `Border-State-Hover`), Dragging (1px `Border-State-Active`), Focus, Disabled. `Step Slider` (`8166:3533`): Steps 4 or 8 by those five states.
  - `Inspector Toggle` (`8167:794`): Pressed Off or On by Resting, Hover, Focus, Disabled. `Inspector Section Header` (`8167:801`): Open by Resting, Hover, Focus. `Swatch Picker Trigger` (`8167:839`): Resting, Hover, Focus, Open, Disabled.
  - Every Focus Ring's stroke width is bound to `Focus Ring/Width`.
- **The old draft slider is rebuilt on variables** as `Slider Field` (`8176:3615`, the original `7720:3355` is its Resting variant, so its instances still work) with `Slider Field Handle` (`8176:3522`, from `7722:14238`): Resting, Hover, Dragging, Focus, Disabled. The field fill is `Bg-Hover` and the handle `Bg-Pressed` (the draft used `Bg-Overlay-Aux` and `Black-A2` at a reduced paint opacity, which vanished in dark). `Frame 1` (`7722:14274`) is renamed `Slider Field Example`, without its separate handle, which the field now contains.
  - Open: `Slider Field` has no registry part. It is Figma only until one is built.
- Left unbound on purpose: the Step Slider's 2px inset (`(32 - 28) / 2`, as in the Segments set; there is no 2px spacing variable), focus and selected ring radii of 10 and 14 (control radius + 4 or + 8, no variable), and icon geometry (the toggle icon, the None icon).

## Done on 2026-11-15 (frosted glass, registry 0.17.0)

- **Colors:** `Component/Glass/Tint-Subtle`, `-Standard`, `-Strong` (light White-A8 / A9 / A10, dark A2 / A3 / A4; scope frame and shape fill), `Stroke-*` (light A4 / A5 / A5, dark A3 / A3 / A4; scope stroke), `Highlight-*` (light A4 / A5 / A6, dark A2 / A3 / A4; scope effect color). Web syntax `--glass-tint-*`, `--glass-stroke-*`, `--glass-highlight-*`.
- **Values:** `Glass/Blur-Subtle`, `-Standard`, `-Strong` (8, 16, 24; scope effect float; `--glass-blur-*`).
- **Effect styles:** `Glass/Subtle`, `Glass/Standard`, `Glass/Strong` and `Glass/Dark/<Tier>`: background blur bound to `Glass/Blur-<Tier>`, an inner shadow 0 1 0 0 in white (the highlight; 20 / 30 / 40% light, 8 / 12 / 20% dark), a drop shadow 0 2 8, 0 8 32, 0 16 48 in black (8 / 12 / 18% light, 16 / 20 / 24% dark). Export checksum `bcc06a0a` (903 tokens, 12 shadows, 10 dark shadows). The full Figma export also holds `--hit-area-coarse` and the Soft icon-button variables from the icon-button change; with them the checksum is `f6a8af7b`, and that matched byte for byte.
- **Specimen:** "Glass (registry)" on the Elevation page (`8178:20`): each tier over a busy gradient and over plain UI, in Light and Dark.
  - Open: in Dark, the subtle tier's small text over the white shapes of the busy stage is hard to read. That is the worst case `DS-GLASS-008` asks you to check: use a stronger tier or a dimming layer there. The dark tints are a first pass.
  - **Icon Button Glass** (`8183:1935`, Actions): a clone of Icon Button. Fills bound to `Component/Glass/Tint-Subtle` (resting, focus, disabled), `Tint-Standard` (hover), `Tint-Strong` (pressed); Selected keeps `Action-Icon-Selected`. A 1px inside stroke `Stroke-Subtle` (Focus keeps its 2px focus stroke) and the `Glass/Subtle` effect style. The set frame has a gradient fill so the glass shows. In a Dark frame, swap the effect to `Glass/Dark/Subtle` by hand.
  - Open: the Menu and Dialog components in Figma do not use the glass styles. The code applies them through `material="glass"`.
  - Blur parity: the busy stage rebuilt in Chromium looked close to the canvas at 8 / 16 / 24 and sharper at 4 / 8 / 12. One visual check, not a measurement.

## Done on 2026-11-15 (icon buttons, registry 0.16.0)

- **`Semantic/Hit area/hit-area-coarse`** (`--hit-area-coarse`, 48, scope width and height): the tap area on a coarse pointer. Export checksum `93850e82` (896 tokens, with the Soft variables). The full Figma export also holds the glass variables from the glass change; with them the checksum is `f6a8af7b`, and that matched byte for byte. The touch visual sizes are not variables: code steps up to the next action size (`action-large`, `action-x-large`, `size-56`) under `any-pointer: coarse`. A Fine/Coarse mode on the Size collection was not used, because the export takes one value per token outside Light and Dark (`figma-export.js`).
- **Icon Button** (`41:399`, Actions): Sm 28 / glyph 16, Reg 36 / glyph 20, new Lg 48 / glyph 24, width and height bound to `action-medium`, `action-large`, `action-x-large`, glyphs to `icon-small`, `size-20`, `icon-medium`. X-Sm (20, no instances) deleted. Rows ordered Sm, Reg, Lg. The set's description states the code sizes and the touch step-up. The 38 Reg instances (Dialog close among them) are now 36.
- **Icon Button Soft** (`8183:1888`), a clone of Icon Button with fills bound to the new `Component/Action Icon Soft/Action-Icon-Soft-*` (light Black-A2 / A3 / A4 / A1 for resting, hover, pressed, disabled; dark White-A*). Selected keeps `Action-Icon-Selected`, Focus keeps the 2px focus stroke. The row labels next to all the sets now read Sm 28 / Reg 36 / Lg 48.
- **Close Button** (`4381:3151`): its description marks it deprecated for closing a surface. The two Action Sheet header closes (`7380:19168`, `7380:19148`, were XLarge 32) are now Icon Button Reg (36).
  - Open: the 15 Status Label remove controls still use Close Button Medium (16 in a 24px chip). `DS-ICON-006` allows that inside a chip under 28px when code gives it a 24px target with spacing. Check the Status Label code when it exists.
  - Open: the Circular Action set (`4151:3785`) is 28 / 40 / 48, not code's 56 `circular`. It is a different control (round, with a shadow) and was left as it is.

## Done on 2026-11-15 (slider, inspector, swatch picker, registry 0.15.0)

- **Selectors page**, frame "Sliders (registry)" (`8166:3534`): `Slider` (`8166:3469`, State Resting, Focus, Disabled), `Step Slider Stop` (`8166:3480`, Selected No or Yes by state, with a Label text property) and `Step Slider` (`8166:3533`, Steps 4 or 8 by Resting or Disabled). Every fill, stroke, radius and size is bound to an existing variable; no new variables, so the export checksum is unchanged.
- **Components page**, frame "Inspector and Swatch Picker (registry)" (`8167:867`) under the Panel set: `Inspector Toggle` (`8167:794`), `Inspector Section Header` (`8167:801`, Open Yes or No, Title property), `Inspector Row` (`8167:802`, Label property and a Control instance swap), `Swatch` (`8167:825`), `Swatch Picker Trigger` (`8167:839`), `Swatch Picker Popup` (`8167:840`), and a light and dark inspector built from instances (`8167:873`).
  - Done in 0.16.0: the older draft `Slider` (`7720:3355`) and its handle are rebuilt on variables as `Slider Field`.
  - Open: in Figma the Step Slider's dot slots share the free width, so on an 8-step slider the dots sit within a few px of where code puts them, not exactly. Code spreads stop centers evenly over the thumb's travel.
  - Open: the Slider and Step Slider thumbs use `Elevation/Small` and `Elevation/Base`, which have no `Dark/` twin, so a Dark-mode frame keeps the light shadow (as for the other components).

## Done on 2026-11-15 (popup fill, registry 0.13.0)

- **`Component/Elevation/Surface-Popup`** (`--elevation-surface-popup`): Light Gray/White, Dark Warm Gray-8, scopes frame fill, shape fill and effect color. Export checksum `c01e04df` (891 tokens).
- **Bound** (surface fill, from `System/Surface/Bg-Card`; the popups to `Surface-Popup`): the four `Position=` variants of the Popover set (`5938:11483`, the Union shape that carries the arrow), the four variants of the Dropdown Menu set (`6609:8499`, which the code's Select list follows) and the Context Menu (`5188:14808`). The Dialog (`3613:6593`, Molecules) is bound the same way to `Surface-Raised`. In Dark mode a Figma popup is now one step lighter than the Dialog, as in code. Light is the same white. The export is unchanged (checksum `c01e04df`), because a binding is not a token.
  - Not bound: the Menubar bar (`5188:14596`, always visible, not a popup) and the Team Dropdown Menu and Profile Edit Dropdown, which have no surface fill of their own.

## Done on 2026-11-15 (docked shadows and Choice Card hover, registry 0.12.0)

- **Docked shadows.** New effect styles `Elevation/Large/Right`, `Left`, `Bottom`, `Top` (black at 5% per layer) and `Elevation/Dark/Large/<Side>` (20%). Five layers each, at depths 1, 2, 4, 8 and 16 along the axis away from the dock edge, spread 0, -1, -2, -4, -8. Checked on a specimen: right and bottom fall away from their edge, as do left and top. Export checksum `2a6b12f8`.
- **Radio Card and Checkbox Card, State=Hover** (`5839:5173`, `5839:5190`) now use `Elevation/Small`.
  - Open: the Radio Card's resting variants use a different effect style (six layers) from Checkbox Card's `Elevation/Base`. They look alike, but it is not the Base style the code names.

## Done on 2026-11-15 (dark elevation, registry 0.11.0)

- **Dark elevation.** New `Global/Black Alpha/Black-A0` (`--black-a0`, transparent, same scopes as its siblings). New Colors variables `Component/Elevation/Surface-Small` (Light white, Dark Warm Gray-10), `Surface-Raised` (Light white, Dark Warm Gray-9) and `Hairline` (Light Black-A0, Dark White-A3), Web syntax `--elevation-surface-small`, `--elevation-surface-raised`, `--elevation-hairline`. New effect styles `Elevation/Dark/Medium`, `Large`, `XLarge` (black at 16, 20 and 24%). Export checksum `7f179f8c` (890 tokens).
  - Open: no Figma component uses the dark styles yet. They are applied by code through `.dark`. Effect styles cannot switch by variable mode, so a Figma frame in Dark mode keeps the light shadow until someone applies the `Dark/` style by hand.
  - Open: the three dark shadow strengths (16, 20 and 24%) are a first pass, checked on a specimen only. Check on a real dark screen.

## Done on 2026-11-15

- **Dialog widths** (registry 0.10.0). New Size variables `Semantic/Dialog/width-dialog-sm` (344) and `width-dialog-lg` (560), scope width and height, Web syntax `--width-dialog-sm` and `--width-dialog-lg`. The Molecules Dialog (`3613:6593`) width is bound to the small one. Export checksum `cbd49db0` (886 tokens).
  - Open: no Figma Dialog is drawn at the large width. The 560 is proposed and needs a check on real screens, with a Dialog variant for a textarea or a short list.

## Done on 2026-11-14

- **Focus ring** (registry 0.9.0). `System/Border/Border-State-Focus`: Light Blue-10, Dark Blue-8. `Component/Control/Control-Focus` aliases it in both modes. New `Values/Focus Ring/Width` and `Focus Ring/Offset` (2, scopes empty, `--focus-ring-width`, `--focus-ring-offset`). Export checksum `8810c065` (884 tokens).
  - 35 Focus-state field frames on the Inputs page (Input Field, Dropdown Field, Search, Email, Mobile, Password, Date of Birth, URL, Stepper, Format, Input Field with Button, Text Box) now have a 1px `Input-Border` edge and a locked "Focus Ring" frame behind: 2px stroke bound to `Border-State-Focus`, 2px out, corner radius field radius + 4. The ring frame is sized to the default width.
  - Not changed: the Card Info field (mixed strokes), the Inline Range Input, and the Select/Dropdown open state in dropdown menus. The primary Button ring still uses `Action-Primary-Focus` (Blue-10, brand slot).
- **Gray-5-5 swatch** on the Color page (both Gray frames), under the Black Alpha row, labelled "Gray edge", bound to `Global/Gray/Gray-5-5`.

- **Z-index order** (registry 0.8.1): `Z-index/dropdown` 1000 to 1400 and `Z-index/overlay` 1200 to 1500, with `Z-index/modal` kept at 1300, so a menu, select, hover card or tooltip opened from inside a Dialog shows above it. Export checksum `7e6728b4` (880 tokens).
- **Field and control edges, light mode** (registry 0.8.2): the lightest gray that still meets 3:1 (WCAG 1.4.11). Export checksum `35816e03` (882 tokens).
  - New `Global/Gray/Gray-5-5` (`--gray-5-5`, #858585 in both modes), between Gray-5 and Gray-6. It is the lightest gray that meets 3:1 on the #f3f3f3 page and on the resting input fill over it (3.04:1 at worst). One step lighter fails.
  - New `Component/Input/Input-Border` (`--input-border`): Gray-5-5 in light, Gray-5 in dark (as Border-Default). 35 resting-edge strokes on the Inputs page moved from Border-Default to it (the Text Field Background frames, Start and End Input, Text Box, the Pin Code cell, the Card Info fields and Field box), plus the Inline Input Field and Inline Dropdown on the Components page. Instances follow their components.
  - `Component/Control/Control-Border` (Checkbox, Radio) and `Component/Switch/Switch-Outline` now use Gray-5-5 in light. Dark is unchanged (Gray-5 and Gray-6).
  - Left on Border-Default on purpose: the dividers inside the Inline Stepper and Format segments, the Inline Input Button edge, Filter Chip, Dropdown Menu and Payment icons. They are not field edges, and the join with the field is 8 of 255 apart. In code the same goes for the InputGroup segment dividers and the secondary and outline Button edges. If you want a Button and a field side by side to share one gray, point those at Input-Border too.
  - `Gray-6` is unchanged. It still colors placeholder text (`--text-state-instruction`), disabled text and the subtle icon, so lightening it would lower their contrast.

## Done on 2026-11-13

- **Variables.**
  - New `Size/Foundation/size-36`. `Semantic/Buttons/action-large` moved from 40 to 36: no node bound it, so nothing on canvas moved.
  - New `Semantic/Field/field-web` (36), `field-native` (48) and `Semantic/Hit area/hit-area-min` (44).
  - A new Motion collection: durations instant to spin, two easing curves as string variables, and distance short.
  - Typography got Web code syntax (`--font-size-*`, `--line-height-*`, `--font-weight-*`, `--font-family-*`) and the role aliases `--font-heading`, `--font-body` and `--font-mono`.
  - The re-export matched its checksum (`cd733c49`, 754 tokens), and `figma-pending.json` is empty. The export logic was run in Figma for the checksum, with the changed token groups merged into the committed file as a delta. That logic is `scripts/figma-export.js` as committed, so a full re-run reproduces the file.
- **Buttons** (`🧱 Actions`): Primary, both Secondary sets, Auxilary, Solid Negative and Soft Negative.
  - Heights are bound to `action-x-large` / `action-large` / `action-medium` (48 / 36 / 28). Ghost is bound to 36 / 28.
  - Icons are bound to `size-20` (was 18) and `size-icon-small` (was 12).
  - Primary Loading keeps the Active width: the content stays at 0% opacity, and the spinner sits centered on top.
  - Hardcoded values are now bound:
    - Primary disabled fill → `--action-primary-disabled`
    - Secondary Sm hover text → `--text-primary`
    - Secondary Sm focus ring → `--border-state-focus`
    - Solid Negative Reg and Small → `--solid-negative-*`
    - Ghost hover → `--bg-hover`. It was bound to an orphaned `Surface-State-Hover` variable, which isn't in the file's local variables.

- **Follow-up, same day:**
  - The duplicate Secondary set `7838:1636` is deleted. It had 0 instances on all 17 pages, and `1022:1967` has 97. A file outside this one that used the duplicate's library copy can't be seen from here.
  - Soft Negative has a Disabled state (Large, Reg, Small). It uses two new tokens:
    - `--soft-negative-disabled`: fill, `tomato-a1` in light and `tomato-a2` in dark.
    - `--soft-negative-disabled-text`: text and icons, `tomato-a7` in light and `tomato-a6` in dark.
  - Re-export checksum `1fd51363` (756 tokens).

- **Second pass, same day:**
  - **Fields.** 282 field boxes on 11 Inputs sets now bind `--size-field-web` (36, Default), `--size-field-native` (48, Native) and a new `--size-field-compact` (32, Compact, inline in tables). The inner content frames fill the box. Read-only variants have no box, so they were left as they are.
  - **Primary text.** New `--action-primary-text`, a brand slot (black on Goldie). The Primary set's label and icons bind it.
  - **Type audit.** Text in component sets with a bound font size went from 1,942 to 2,085 of 2,097, with 419 exact-match bindings and no forced values:

    | Page | Before | After | Total |
    |---|---|---|---|
    | Inputs | 774 | 819 | 820 |
    | Molecules | 572 | 633 | 636 |
    | Selectors | 244 | 254 | 255 |
    | Components | 83 | 110 | 112 |
    | Actions | 99 | 99 | 104 |
    | Indicators | 132 | 132 | 132 |
    | Messaging | 38 | 38 | 38 |

  - **Rebinds.** The Primary Loading spinners bind `--action-primary-text`. 9 field borders bound to the orphaned `Surface-State-Disabled` now bind `--border-state-disabled`.
  - Re-export checksum `cf84c244` (758 tokens).

- **Calmer blues, same day:** every Global blue step has about 15% less OKLCH chroma, with the same lightness and hue, in both modes. The 12 blue alpha steps use the new `blue-8` with their old alpha. 48 values in all. Re-export checksum `48eab083` (758 tokens).

- **Controls, z-index and type, same day:**
  - New `--switch-outline` (gray-6): a 1px inside edge on the off Web Switch and iOS Switch tracks. The Android Switch is unchanged.
  - New `--control-border` (gray-6): the unselected Checkbox and Radio outlines (Enabled and Focus). The Aux variants keep `--border-aux`. The 49 Checkbox and 49 Radio instances on Selectors pick it up.
  - New `Values/Z-index/` group: `--z-dropdown` 1000, `--z-overlay` 1200, `--z-modal` 1300 (scopes empty, since a layer can't bind z-index).
  - The 13 color brand slots now point at the generic blue default (the same as `brand-default.json`). No variable aliases the Lipstick or Goldie palettes any more, and no layer on the six component pages (Components, Inputs, Actions, Selectors, Indicators, Messaging) has a raw fill or stroke from them. The Color page still shows both palettes as swatches, on purpose.
  - Type: 198 more text layers bound to exact tokens (Actions 1, Inputs 4, Selectors 2, Components 5, Molecules 186), with no value changed. No mixed-style layers are left in component sets. This count includes instance sublayers, so it differs from the earlier table:

    | Page | Before | After | Total |
    |---|---|---|---|
    | Inputs | 1231 | 1235 | 1242 |
    | Molecules | 1008 | 1209 | 1209 |
    | Selectors | 372 | 374 | 374 |
    | Components | 141 | 145 | 145 |
    | Actions | 99 | 100 | 104 |

  - Re-export checksum `954d63b5` (763 tokens).

- **Type decisions, same day:**
  - Selectors: the 10px text on a 14px line height now binds Line height/Micro (12): 9 main layers in Date Picker, Native Horizontal Tabs and Bottom Nav, and the 109 layers that use them.
  - Calendar Picker: the weekday labels are 10px (Size/Micro, line height 12) and two letters (Su Mo Tu We Th Fr Sa), so they fit the 19px day columns. At 10px, three letters overlapped.
  - Components: the Hero CTA label binds Line height/Medium (26). The button stays 48 tall and the label stays centered.
  - Text bindings are not exported variables, so the checksum is unchanged.

- **Tabs, same day:** the four `Component/Tab/Tab-*` variables got Web code syntax (`--tab-resting`, `--tab-hover`, `--tab-selected`, `--tab-disabled`), so the export carries them. Re-export checksum `c53f1c05` (767 tokens).

- **Contrast pass, 2026-11-14.** Everything below was made in Figma, with each contrast checked in both modes before the write, and exported as `6e99566d` (879 tokens).
  - **Solid labels:** ten hues moved to a darker light-mode step (white text now 5.34:1 to 8.51:1), and the light accent slot to blue-10.
  - **Segments:** the inactive and inactive-focus labels use `--text-state-resting` (7.08:1 light, 6.88:1 dark). New `--segment-focus-ring` (blue-10 light, blue-9 dark) on the two focus variants.
  - **Avatar:** initials use `--text-secondary` (8.55:1 and 9.78:1). All six sizes now bind the avatar tokens (five were raw `gray-3`, `gray-2` and `gray-4`). The generic glyph uses `--icon-subtle` (3.79:1 light, 3.12:1 dark).
  - **State borders and focus rings:** `--border-default`, `-state-hover`, `-state-active`, `-state-focus`, `--border-accent`, `--border-info`, `--border-negative` and `--control-border` now reach 3:1 on every real surface (see the 0.6.1 changelog entry for the steps).

## Still open

1. **Type that needs a design decision.** Each of these changes the layout, so none was forced:
   - Components: one page-layout text at 12/15. Line height/Tiny is 16.
   - Molecules: the Story "Ambivalent" emoji is 24px on line height 40 (bound to 3XL, the pair for 32px). 24/32 may be meant.
   - Leave as is: the CVC card drawing (5.03 and 7.54px, a scaled illustration), the Apple and Facebook SSO buttons (their own type), and the Google Sans layers (mock-ups of Google's location dialogs, not SSO buttons).
2. **`size-40` outside fields.** Menu items (218 on Selectors), Icon Buttons (237 on Molecules) and example layouts (345 on Inputs) still bind raw `size-40`. That's fine as a size, but menu items might want a semantic token such as `--size-menu-item`.
3. **Pre-existing overlap.** In Dropdown Field, the Disabled and Read-only variants overlap, at Default and Native.
4. **Switch details.** The knob's drop shadow is unbound (the registry uses `--shadow-small`). The Web Switch focus ring binds `--border-state-focus`, and `--switch-focus` is unused. The Android Switch off track has no outline.
5. **Values with no token, used by Radio and Tabs.** The Radio circle is 22 (no `--size-22`), and its focus ring sits 3px out. The Regular Tab pill has 10px sides (unbound); the registry uses `--space-padding-small` (12).
6. **Found building the second batch of components (2026-11-14).** The code used the nearest token each time. Each is a Figma fix:
   - **No Web code syntax:** `Border-Opaque` (URL field and Input with Button strokes, Stepper Line), `Surface-State-Disabled`, `Base-Light` and `Label-Moderate` (the "Good" status label and its dot, so the registry leaves that status out). There is also a duplicate `Select-Aux` variable.
   - **Unbound values:** the Inline Input Button focus stroke (raw `#C3E0FF`), the Tooltip corner (4px, the code uses `--shape-subtle`), its shadow and its max width (214, the code uses 216), the neutral status dot (`--gray-4`) and the status radius (40).
   - **Sizes that differ from tokens:** Avatar sets use 20/24/32/40/48/56 where `--size-avatar-*` is 24/28/40/56/72 (the code follows the tokens), and only size 56 binds the `--avatar-*` tokens. The Figma Input with Button is 40 tall inside a 36 box.
   - **Colors that differ from the code:** the Avatar ring `--border-on-dark` is white in both themes (the code uses `--border-overlap`). Prefill icons differ between Email (`--icon-info`) and Search (`--icon-primary`), and the password eye stays `--icon-primary` on error (the code turns it `--icon-negative`).
   - **Stepper:** the Check Dot is drawn at 24 and the other markers at 32 (the code draws all at 32), and the Inactive dot is `--icon-state-disabled` with a white number, under 3:1 (the code uses a `--control-border` ring).
   - **Tokens code would like:** `--textarea-min-lines`, `--textarea-max-lines` and a form max width (`--width-form-max`). Today the line counts are defined in `textarea.tsx`.
   - **Unused in Figma:** `--label-focus`, `--label-pressed` and `--label-disabled` (Badge), `--switch-focus`, and `--segment-focus-active`.
   - **Card, Panel and HoverCard (2026-11-14).** The Card (`8080:2089`) and Panel (`8080:2138`) sets were added on the Components page from existing tokens. They have slots: Card has `Action` (header), `Content` and `Footer`, Panel has `Action` (header), `Content` and `Footer`, and the Popover has `Content`. Title and Description are text properties on Card and Panel. Each slot's description names its code part. Only the first variant of each set has real slot nodes. The others are frames bound to the same slot property, because `createSlot` makes a new property per variant, so check that a designer can drop content into every variant. `Action` is absolutely positioned at the header's top right, so an empty one takes no space. The Popover's surface is a fixed vector, so it does not grow with long slot content. The Card has no `Selected` state. The HoverCard follows the existing Popover set (`5938:11483`), which binds `Semantic/small-container` (12), but its tail vector binds raw variable ids from another file, so it will not follow a theme change. There is no Sheet or Sidebar set to build `vois-panel`'s neighbors from.
   - **Slots added 2026-11-14 (second pass):** a new Field set (Inputs page, `8083:12252`): Input Label, a `Control` slot and a `Message` text property, with Default and Error. The existing Input Field sets keep their controls, because their variants are the control's states. Radio Card and Checkbox Card gained a `Body` slot under the label row, hidden by default behind a new `Show content` boolean (the existing `Show body` boolean actually toggles the Description, so it is misnamed). Their row is now wrapped in a `Row` frame, and all 16 instances kept their text and sizes. The Field's default control is a detached copy of the Input Field's box, because hiding the label inside a nested Input Field instance failed.
   - **Slots and swaps added 2026-11-14 (third pass):** a new Tabs set (Selectors page, `8084:6370`, Underline and Pill, three tab instances and a panel `Content` slot). Labels gets `Show leading icon` and a `Leading icon` swap, off by default, cloned from the trailing icon so its colors carry over (48 variants, 120 instances unchanged). Status Labels gets a `Trailing icon` swap on its Close Button (15 variants). The Avatar Generic and Invited variants get a `Content` slot centered over the circle, hidden when empty. The Avatar variants are not auto-layout, so the slot is a centered frame, not an absolute one. The Tabs set uses the same first-variant-real, others-bound pattern. All slot work is now done.
   - **Not designed:** status solids for Badge (the code builds them from `--base-<status>`), a Radio and Checkbox Select focus row, and a Field "optional" marker.
7. **Text roles share values.** `--text-subtle` and `--text-hint` were darkened on 2026-11-14 to reach 4.5:1 (subtle: gray-8 light, gray-5 dark; hint: gray-5 in dark, gray-8 light already). With `--text-state-resting`, all three now share one light value (gray-8) and one dark value (gray-5), so they no longer differ. If a three-step hierarchy is wanted, the fix is a stronger `--text-secondary` and `--text-primary` step above them, not a lighter subtle.
8. **Wave 0 findings (2026-11-14).**
   - **New Figma set:** Scrollbar (Selectors page, `8086:3446`: Vertical and Horizontal, Resting and Hover), built from existing tokens. The track is 16 and the thumb 8, because a 12 track left a 2px gap that is off the 4px grid and has no token.
   - **Text-State-Instruction is under 4.5:1.** It is gray-6 in both modes. The Dropdown Menu shortcut and section header, the Command section header and the Input placeholder use it (about 4.06:1 on a card in light). The code uses `--text-hint` instead. The same fix as for subtle and hint (gray-8 light, gray-5 dark) would clear it.
   - **Button Group:** the resting edge binds `Border-Opaque` and the focus fill `Surface-Foreground-Primary`, neither with Web code syntax (the code uses `--border-default` and the Button's own fill). Text is 16/24 medium `Text-State-Resting` and height 28, where the Vois Button is 14/20 or 16/24 semibold in `--text-primary`. The code keeps the Button's text.
   - **Dropdown Menu:** the Solid Active and Aux item states have no code (nothing in a menu uses them yet). The divider is inset 24 with 12 above and below, which is airy for a web menu. Figma has no checked or radio item: the code uses Soft Active and a mark.
   - **Dialog:** Figma binds the 12 radius (`--shape-rounded`), where `DS-SHAPE-002` suggests the 24 `--shape-soft` for dialogs. The code follows Figma. The title has no size token in the Figma header, so the code uses 20/28 semibold.
   - **Command:** the item heights are 36 and 40 (the code uses 40). Figma's Active state (current choice) is not built because a command list has none. The search row has a trailing icon in Figma that the code does not draw.
   - **No Figma design:** Collapsible. It has no visual of its own, so there is nothing to build.
   - **The z-index ladder put overlays under the modal. Fixed in 0.8.1.** Figma now has `--z-modal` 1300, `--z-dropdown` 1400 and `--z-overlay` 1500 (export checksum `7e6728b4`, 880 tokens), so a menu, select, hover card or tooltip opened from inside a Dialog shows above it. It was 1000, 1200 and 1300 before.
9. **Batch 2 findings (2026-11-24).**
   - **Pagination:** the active page is `--select-solid-active` with `--text-on-dark`. Dark theme: white on `--blue-9` is about 3.5:1 (light is 5.4:1). Pick a darker fill or a different text token.
   - **Calendar:** Figma cells are 19 by 24 with 10/12 text, which fails `DS-A11Y-001`. Om chose to size up the code, so the Figma set should be redrawn: 44 by 44 cells with no gap (a 36 square fill inside), 14/20 text, 44 nav buttons with 16 chevrons, and a 332 wide card.
   - **Off the 4px grid:** some batch 2 Figma frames use 2px and 5px gaps. The code uses 4 (a spacing token). Fix the frames or add the tokens.
   - **Toast:** there is no `--z-toast` token. The viewport uses `--z-overlay`.
   - **Alert dialog:** no Figma frame was read. The code copies the Dialog (see 0.27.0).
10. **Dialog frames (2026-11-24).** The frames at `8305:27515` are 360 and 480 wide (min 360, max 480) and hardcode them. The Size variables are `--width-dialog-sm` 344 and `--width-dialog-lg` 560. The rule is that a modal may be 340 to 560 wide, so both are fine and the code keeps the variables. The frames have no separate alert dialog: the Confirmation frame has a close button, the Required frame does not, and the code follows Required.

## To do in Figma (contrast, registry 0.32.1)

Two variables changed in code only (`source/figma-pending.json`, `change`). Change them in the Vois Figma file, re-export, then remove the entries. Found by the rendered accessibility check on `main`.

- **`--select-soft-active`**: Light `Bg-Accent` (as now). Dark `Blue-A3`, was `Bg-Accent` (`Blue-A5`). The checked Menubar item had accent text at 3.8:1 on `#495e73`, and its shortcut at 3.1:1.
- **`--text-negative`**: Light `Tomato-9` (as now). Dark `Tomato-6`, was `Tomato-7`. A destructive menu item was 4.3:1 on the popup surface.
