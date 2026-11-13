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

## Still open

1. **Loose type that matches no token.**
   - 33 mixed-style text layers. They need splitting or a decision.
   - Off-scale values: 8px (Selectors), 5.03px (Inputs), line heights 14 (×9, Selectors), 15 and 7.54, and 3 auto line heights (Components).
   - 3 Google Sans layers in Molecules, probably the SSO buttons. That font can't load in the export session, so they weren't touched.
2. **`size-40` outside fields.** Menu items (218 on Selectors), Icon Buttons (237 on Molecules) and example layouts (345 on Inputs) still bind raw `size-40`. That's fine as a size, but menu items might want a semantic token such as `--size-menu-item`.
3. **Pre-existing overlap.** In Dropdown Field, the Disabled and Read-only variants overlap, at Default and Native.
4. **No z-index variables.** The skill names z-layers (`--z-dropdown`, `--z-modal`), but Figma has none, so the registry Select uses shadcn's `z-50`.
