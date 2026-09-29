# Accessible copy

Rules for copy that still works when the visuals are gone. This covers words only. It isn't a WCAG guide. Layout, contrast, focus order, and keyboard support belong to the design system.

Applies to principle `accessible-copy`. Every rule in `SKILL.md` still applies on top of it.

## Why it matters

Screen reader users often pull up a list of all links or all buttons on a page. Each item is read alone, with no surrounding text and no layout. A label that only makes sense next to the thing it sits beside fails in that list.

## Labels, buttons, and links

Name the object, so the label makes sense on its own.

| ✗ Before | ✓ After | Why |
|---|---|---|
| Submit (one of three submit actions) | Submit application | Says what gets submitted |
| Read more | Read the privacy policy | The list of links now has a meaning |
| Learn more | Learn about billing plans | Same |
| Edit | Edit shipping address | Repeated Edit links can share a page |
| Download | Download invoice | Names the file |

Never use "click here" as link text. It says nothing, and it names an input method. Not every user clicks.

- ✗ "Click here to see your invoices."
- ✓ "See your invoices."

Don't add interface words to make a label specific. `no-interface-references` still applies.

- ✗ "Submit button"
- ✓ "Submit application"

## Status and color

Don't let color carry the meaning alone. Pair every status color with words.

- ✗ Red text: "Email"
- ✓ "Error: Email is required"
- ✗ "Fields in red need your attention."
- ✓ "2 fields need your attention: Email and Phone number."

## Errors and fields

Error text should name the field it belongs to. It gets announced along with the field label, so it has to read right in that order.

- ✗ "Required"
- ✓ "Email is required"
- ✗ "Invalid"
- ✓ "Enter an email like name@example.com"

A placeholder never replaces a visible label. Placeholders disappear when someone types, and screen readers can skip them.

- ✗ Field with only the placeholder "Email"
- ✓ Visible label "Email" and the placeholder "name@example.com"

## Icons with no visible text

An icon button with no text needs a text alternative. Give the recommended `aria-label` copy in the review.

- ✗ A trash icon with no name
- ✓ `aria-label="Delete invoice"`

The `aria-label` follows the same rules as any label. Name the action and the object. Don't include the word "button" or "icon".

## The brevity trade-off

Screen reader users need the object noun. Components have character limits. When they collide, use this order:

1. If the noun fits inside the component's limit, add it.
2. If the limit forbids it, keep the short visible label and recommend an `aria-label` that carries the full meaning. Say so in the review.

Worked cases:

| Component | Visible label | Result |
|---|---|---|
| Button with room for 2 to 3 words | "Submit application" | The noun fits. Use it. |
| Tooltip trigger with a tight limit | "Edit" | Keep "Edit". Recommend `aria-label="Edit shipping address"`. |
| Icon-only button | (none) | Recommend `aria-label="Delete invoice"`. |

If a component's limit keeps forcing `aria-label` advice, revisit the limit. Say so in the review.

## Review notes

Put accessibility notes under "Principles applied" in the standard output. Don't add a new section. Cite the id `accessible-copy`.
