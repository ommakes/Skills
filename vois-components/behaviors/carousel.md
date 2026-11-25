<!-- GENERATED from behaviors/carousel.json by scripts/behaviors.mjs. Edit the JSON, then run `node vois-components/scripts/behaviors.mjs --write`. Do not edit by hand. -->

# Carousel behavior

A row or column of slides that the person moves through one at a time, with Previous and Next buttons, the arrow keys, and a drag or swipe.

**Use something else when:**

- Tabs: The views are peers a person picks between by name, and each one should stay reachable at once.
- Accordion: The sections are text that a person reads in order and may want open together.
- Pagination: The pages are a long list or a table, and the person needs to know the page count and jump to a page.
- Stepper: The steps gate a flow, and the person must finish one before the next.

**Basis:** embla-carousel-react, checked 2026-11-25. Behaviors come from the vois-carousel source and its browser test (registry/scripts/carousel.test.mjs). The Notion UI SDK inventory page for Carousel was not read for this card. The support tag on each row was checked against Embla 8.6.0 on the checked date, and the rows marked unchecked were not.

**Support tags**

- `native`: The library does this. Do not undo it.
- `differs`: The library does something else. Read the note.
- `supply`: The library does not do this. You build it.
- `decide`: This needs a product or design decision.
- `unchecked`: Not checked against the library yet.

## Anatomy

| Part | Required | Note |
|---|---|---|
| Carousel (root) | yes | The region. It owns the Embla instance, the keys and the end state. Pass aria-label. |
| CarouselContent | yes | The viewport and the track that holds the slides. |
| CarouselItem | yes | One slide, a group with the slide role description. Pass aria-label such as 1 of 5. |
| CarouselPrevious | no | A Vois outline icon button named Previous slide. |
| CarouselNext | no | A Vois outline icon button named Next slide. |

## Interaction

- **BHV-CAROUSEL-001** `supply` The Previous and Next buttons move one slide, and a press at the end of the run does nothing. Embla has no buttons. vois-carousel's buttons call scrollPrev and scrollNext.
- **BHV-CAROUSEL-002** `native` Dragging or swiping moves the slides, and they settle on a slide.

## Keyboard

- **BHV-CAROUSEL-003** `supply` Left and Right (Up and Down when vertical) move between slides while focus is inside the carousel. They do nothing in a text field, a select or an editable area, with a modifier held, or when another handler took the key. Embla has no keyboard control. vois-carousel listens on the region in the capture phase and skips an element that owns arrow keys. The browser test checks each skip.

## Focus

- **BHV-CAROUSEL-004** `native` A slide that takes focus is scrolled into view.
- **BHV-CAROUSEL-005** `differs` A button at the end of the run stays focusable, so a keyboard user who pressed it to the end is not dropped to the top of the page. shadcn disables the button, which removes it from the tab order and drops focus. Here it reads as disabled and keeps focus.

## State

- **BHV-CAROUSEL-006** `native` Scrolling is by position and a duration in Embla's own units, not by a CSS duration. There is no CSS duration to bind to a motion token. (DS-MOTION-001)
- **BHV-CAROUSEL-007** `supply` Under reduced motion a button or a key press jumps to the slide at once. scrollPrev and scrollNext take a jump argument. vois-carousel passes the reduced motion setting. A drag still settles with Embla's friction. (DS-MOTION-007)
- **BHV-CAROUSEL-008** `native` The carousel can run horizontally or vertically. A vertical one needs a height on its content.
- **BHV-CAROUSEL-009** `unchecked` With loop on, the buttons never reach an end. Embla has a loop option. vois-carousel passes it through and the end state was not tested with it.
- **BHV-CAROUSEL-010** `unchecked` Right to left content reverses the direction of the slides and of the keys. Embla has a direction option. The arrow keys in vois-carousel are not mirrored.

## Accessibility

- **BHV-CAROUSEL-011** `supply` The root is a region with the carousel role description and each slide is a group with the slide role description. Embla sets no roles. vois-carousel sets them. A region is a landmark only with a name, so the caller passes aria-label.
- **BHV-CAROUSEL-012** `supply` A screen reader hears which slide it is on, such as 1 of 5. Pass aria-label on each CarouselItem. Nothing announces a change of slide on its own.
- **BHV-CAROUSEL-013** `supply` The buttons are named and reach 36 px, 48 on a coarse pointer. The names come from the visually hidden text in each button. (DS-ICON-003, DS-A11Y-007)

## Common mistakes

- **BHV-CAROUSEL-014** `supply` Do not put essential content on a slide a person may never reach. Anything they must read goes on the page.
- **BHV-CAROUSEL-015** `supply` Do not start a carousel moving on its own. An autoplay plugin needs a visible pause control. (DS-MOTION-007)
- **BHV-CAROUSEL-016** `supply` Do not leave the region without a name or the slides without a position. Nothing warns you.
