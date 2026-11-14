# Figma to-do

What the Vois Figma file (`Aou007Vh0uQPohJonhdadk`) still needs. Tokens that code needs before Figma has them go in `source/figma-pending.json`. The checker fails if one is missing from this list, so the list can't silently go stale. There are none today.

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
