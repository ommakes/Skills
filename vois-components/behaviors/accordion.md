<!-- GENERATED from behaviors/accordion.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Accordion behavior

Show and hide sections of content from their headings.

**Basis:** radix-ui, checked 2026-11-23. Behaviors come from the Notion UI SDK inventory (2026-11-21). The support tag on each one was checked against the Radix source on the checked date.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Accordion (root) | yes | Holds the items and the open values. Pass type. |
| AccordionItem | yes | One section. Give it a unique value. |
| AccordionHeader | yes | Radix renders an h3. In vois-accordion the trigger wraps it for you. |
| AccordionTrigger | yes | The button inside the heading. |
| AccordionContent | yes | The panel. Radix calls it Content. Notion calls it AccordionPanel. |

## Interaction

- **BHV-ACCORDION-001** `differs` Pressing a heading opens its panel. Pressing the same heading again closes it. Pass collapsible with type=single. Without it, the open item cannot be closed by pressing it again.
- **BHV-ACCORDION-002** `differs` By default only one section stays open at a time, so opening a new section closes the one that was open. Radix has no default. Always pass type. Use single for one section at a time.
- **BHV-ACCORDION-003** `native` Several sections can stay open at once, and each one closes on its own.
- **BHV-ACCORDION-004** `native` A section can be set so its panel stays open until another heading is chosen instead. This is the default for type=single.
- **BHV-ACCORDION-005** `native` Opening or closing a panel animates its height. A panel that starts open appears at once without animation. You still write the keyframes. vois-accordion does (vois-accordion-down and vois-accordion-up).
- **BHV-ACCORDION-006** `supply` An open-all control opens every section that is allowed to open. A close-all control closes every section that is allowed to close. Radix has none. Control the value array of a type=multiple accordion yourself.
- **BHV-ACCORDION-007** `unchecked` A section nested inside another section's panel works on its own, without closing the outer section. Each Accordion is its own root, so this is likely. Arrow keys from a nested trigger were not checked.
- **BHV-ACCORDION-008** `supply` Searching within a page can open a closed panel that contains a match, without animation. A link to something inside a closed panel opens that panel and moves to the linked content. Radix does not use hidden=until-found. Open the panel yourself from a hash or a find handler.
- **BHV-ACCORDION-009** `supply` Filtering questions through a search field can open the matching answers while leaving their headings usable. Control the value array and set it from your filter.

## Keyboard

- **BHV-ACCORDION-010** `native` Tab moves between the section headings.
- **BHV-ACCORDION-011** `native` Enter or Space opens and closes the focused section's panel.
- **BHV-ACCORDION-012** `differs` Arrow keys, Home and End do nothing here, because screen-reader heading navigation already reaches each heading. Radix adds the WAI-ARIA accordion keys. They do no harm, so keeping them is fine. Remove them only if your spec says so.

## Focus

- **BHV-ACCORDION-013** `differs` A disabled heading stays in the tab order so people can still find it, but pressing it leaves its panel closed. A disabled heading leaves the tab order. Decide if that is acceptable. If not, use aria-disabled and block the press yourself.
- **BHV-ACCORDION-014** `native` Disabling the whole set disables every section in it. A disabled fieldset around it disables it too.

## State

- **BHV-ACCORDION-015** `differs` A change to which sections are open can be refused, for example after a confirmation is cancelled. Refusing one part of a change cancels the whole change. Use a controlled value and do not update it. There is no cancel call on the event.
- **BHV-ACCORDION-016** `native` A closed panel normally disappears from the page, but it can be kept hidden in place so local state inside it, such as a draft message, is preserved. The prop is forceMount on AccordionContent.
- **BHV-ACCORDION-017** `supply` Each open or closed change carries a reason, such as a press or a find-in-page match. Radix reports the new value only.

## Accessibility

- **BHV-ACCORDION-018** `native` Each panel is a region labelled by its heading, so screen readers can list open panels as landmarks.
- **BHV-ACCORDION-019** `native` A heading that cannot close its panel because the panel must stay open reports itself as disabled to assistive technology.
- **BHV-ACCORDION-020** `differs` The heading level fits the surrounding document. Radix always renders h3 unless you use asChild. vois-accordion wraps the trigger in the header and gives no way to change the level yet.

## Common mistakes

- **BHV-ACCORDION-021** `supply` Do not scroll in the open change callback. Scroll only after the panel has its full height. Radix has no completion event. Wait for onAnimationEnd on the content.
- **BHV-ACCORDION-022** `supply` Do not trust a controlled value on its own. Check it against your items first, because the accordion can hold a value that no item renders.
- **BHV-ACCORDION-023** `supply` Do not let many open panels pile up. With several panels open at once, keep the number of items modest so the list of open regions that screen readers can reach stays short.
