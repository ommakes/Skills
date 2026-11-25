<!-- GENERATED from behaviors/separator.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Separator behavior

A horizontal or vertical line that divides groups of content a reader should take as separate. Use it sparingly, mainly in lists and menus.

**Use something else when:**

- Card: The groups are better separated by their own surfaces.
- Spacing: The groups only need air between them.

**Basis:** radix-ui, checked 2026-11-24. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the source on the checked date. The inventory says the docs give no alternative component for this use; the notFor list comes from the Vois marketing rules.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Separator | yes | The single part. Place it between two groups. It has no sub parts. |

## Interaction

- **BHV-SEPARATOR-006** `native` A separator never takes focus, so Tab moves past it.

## State

- **BHV-SEPARATOR-004** `native` The separator can run horizontally or vertically. A bad value falls back to horizontal.
- **BHV-SEPARATOR-005** `supply` A vertical separator takes the height of its row and stretches to the tallest item. Radix draws no line. Give it the size from CSS: for a vertical one, self stretch in a flex row, or an explicit height.
- **BHV-SEPARATOR-007** `supply` The line is drawn with a token color and a 1px thickness. Radix has no styles. vois-separator uses a 1px line in a border token.

## Accessibility

- **BHV-SEPARATOR-001** `native` A screen reader announces a separator between the groups it divides. Horizontal is the default for the role, so aria-orientation is left off.
- **BHV-SEPARATOR-002** `native` A line that adds no information can be marked decorative. It gets no role and no orientation for assistive technology and is skipped. Decorative is off by default in Radix. vois-separator turns it on by default, as shadcn does; set decorative to false when the line alone shows the division.
- **BHV-SEPARATOR-003** `native` A decorative separator keeps its orientation for styling.

## Common mistakes

- **BHV-SEPARATOR-008** `supply` Do not mark a separator decorative unless the surrounding content already conveys the division.
- **BHV-SEPARATOR-009** `supply` Do not use a separator as a spacer. Use spacing tokens.
- **BHV-SEPARATOR-010** `supply` Do not add dividers to marketing pages. The marketing rules say none. vois-patterns marketing rules. The component stays for lists and menus.
