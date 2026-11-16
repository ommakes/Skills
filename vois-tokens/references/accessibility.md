# Accessibility `[DS-A11Y]`

These are not optional.

## Touch Targets

Every interactive element has a hit area of at least `var(--hit-area-min)` in both dimensions. The token sets the click or tap area only, never the visual size of the control. On a coarse pointer (`@media (any-pointer: coarse)`) the minimum is `var(--hit-area-coarse)` (48). If the visible element is smaller, extend the hit area with a pseudo-element: `[DS-A11Y-001]`

```css
.icon-button {
  position: relative;
}

.icon-button::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 100%;
  height: 100%;
  min-width: var(--hit-area-min);
  min-height: var(--hit-area-min);
  transform: translate(-50%, -50%);
}

@media (any-pointer: coarse) {
  .icon-button::after {
    min-width: var(--hit-area-coarse);
    min-height: var(--hit-area-coarse);
  }
}
```

## Focus States

Three focus pseudo-classes. Know when to use each one.

**`:focus-visible`** — triggers only when the browser determines a visible focus indicator is needed. This covers keyboard navigation and assistive technology, but not mouse clicks. Use this for focus rings on buttons and links: `[DS-A11Y-002]`

```css
:focus-visible {
  outline: 2px solid var(--border-state-focus);
  outline-offset: 2px;
}
```

**`:focus-within`** — triggers when an element or any of its children has focus. Use this to style entire form sections when a user focuses on an input inside:

```css
.form-field:focus-within {
  outline: var(--focus-ring-width) solid var(--border-state-focus);
  outline-offset: var(--focus-ring-offset);
}
```

**`:focus`** — triggers on any focus, including mouse clicks. Avoid using this for visual rings. Only reach for it when you need to respond to all focus events regardless of input method.

Never remove `outline` without providing a `:focus-visible` replacement. `[DS-A11Y-003]`

Dialog focus (first focus, return focus, Escape) and the dragging alternative are in `references/overlays.md` (`[DS-A11Y-019]` to `[DS-A11Y-023]`).

### The ring follows the control `[DS-A11Y-018]`

A focus indicator is an external ring, not a change to the control's border. Use the tokens: `--focus-ring-width` (2px), `--focus-ring-offset` (2px) and `--border-state-focus`. Light mode is Blue-10 (4.9:1 on the page) and dark mode is Blue-8 (6.7:1). Both are well above the 3:1 WCAG asks for, so they hold on a card or a tinted surface too.

```css
.input { border: 1px solid var(--input-border); border-radius: var(--radius-input); }
.input:focus-visible {
  outline: var(--focus-ring-width) solid var(--border-state-focus);
  outline-offset: var(--focus-ring-offset);
}
```

- **The border stays.** Do not change it to a 2px blue border on focus. That moves the content and loses the resting edge.
- **No `border-radius` on focus.** A browser draws an outline at the control's radius plus the offset, so a 6px field gets an 8px inner ring edge without any extra CSS. Setting a radius on `:focus-visible` changes the control's own corners.
- **Inside a clipped container** (a menu item, a list row, a scroll area viewport) use `outline-offset: -2px`, so the ring is not cut off. Same color token.
- **Errors keep the ring.** A focused invalid field shows its red edge and the blue ring.
- **Pills and circles** keep their shape: the ring follows it.

## Contrast

| Text type | Minimum ratio |
|-----------|---------------|
| Normal text (under 18px regular, under 14px bold) | 4.5:1 |
| Large text (18px+ regular, 14px+ bold) | 3:1 |
| UI components and graphical objects | 3:1 |

`[DS-A11Y-004]`

## Semantic HTML

- `<button>` for actions. `<a>` for navigation. Not `<div onClick>`. `[DS-A11Y-005]`
- Form inputs need associated `<label>` elements, not just placeholder text. `[DS-A11Y-006]`
- Icon-only buttons need `aria-label`. `[DS-A11Y-007]`
- Decorative icons need `aria-hidden="true"`. `[DS-A11Y-008]`
- Error messages need `aria-live="polite"` or `role="alert"`. `[DS-A11Y-009]`
- Images need `alt`. Decorative images get `alt=""`, not a missing alt attribute. `[DS-A11Y-010]`
- Use `<ul>` or `<ol>` for lists of items. Don't use a stack of `<div>` siblings when the content is semantically a list. `[DS-A11Y-011]`
- Use `<br>` only for intentional line breaks in content (addresses, poems). Never use it to create visual spacing between elements — that's a layout problem. `[DS-A11Y-012]`
- `loading="lazy"` on all images that aren't in the initial viewport. Skip it on hero images and above-the-fold content — those should load immediately. `[DS-A11Y-013]`
- `<time datetime="...">` for dates and times. The `datetime` attribute is machine-readable; the element content is human-readable. `[DS-A11Y-014]`

```html
<!-- bad -->
<span>Published Feb 21, 2025</span>

<!-- good -->
<time datetime="2025-02-21">February 21, 2025</time>
```

- Don't use heading elements (`<h1>`–`<h6>`) just to get a certain font size. Use them for document structure. Style with CSS. `[DS-A11Y-015]`
- `<fieldset>` and `<legend>` for groups of related form controls (radio groups, checkbox groups). Don't skip this — screen readers announce the group label with each input. `[DS-A11Y-016]`

```html
<!-- bad -->
<div>
  <p>Preferred contact method</p>
  <label><input type="radio" name="contact"> Email</label>
  <label><input type="radio" name="contact"> Phone</label>
</div>

<!-- good -->
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact"> Email</label>
  <label><input type="radio" name="contact"> Phone</label>
</fieldset>
```

## Components

What the code that uses a component must supply. Radix and native elements already handle roles and keys; these are the parts they cannot guess.

- A tooltip trigger can take keyboard focus, and the tooltip opens on focus as well as hover. A tooltip never holds the only copy of information a person needs (touch has no hover). Don't put one on a disabled control: it can't take focus, so say why it is disabled in text beside it. `[DS-A11Y-029]`
- A Select, Combobox or Command input has an accessible name from its visible label (`<label htmlFor>` or `aria-labelledby`). Use `aria-label` only when the design shows no label. The chosen value shown in the trigger is not a name. `[DS-A11Y-030]`
- Helper and error text under an input is linked to it with `aria-describedby`, and an input that failed its check has `aria-invalid="true"`. The error text itself follows DS-A11Y-009. `[DS-A11Y-031]`
- Every tab has a text name (`aria-label` when the tab is an icon). When a page has more than one tab list, each tab list has its own `aria-label`. `[DS-A11Y-032]`
- A data table has a name (`<caption>`, `aria-label` or `aria-labelledby`). Header cells are `<th>`, with `scope="col"` for a column header and `scope="row"` for a row header. `[DS-A11Y-033]`
- A toast is announced in a polite live region (assertive only for an error that needs attention now), keeps showing while it is hovered or has focus, and stays long enough to read. A toast never holds the only copy of a result or the only way to do an action: the page shows the same result. `[DS-A11Y-034]`
- A Switch, Checkbox or Radio has a visible text label that is tied to the control (a wrapping `<label>` or `htmlFor`), so a click on the label toggles it. A Switch label names the setting ("Email alerts"), not the action, and does not change when the state changes. `[DS-A11Y-035]`
- A menu or popover closes on Escape and returns focus to its trigger, as a dialog does (DS-A11Y-021, DS-A11Y-022). Build them from Radix (`DropdownMenu`, `Popover`), not from a positioned `div`. `[DS-A11Y-036]`
- A Spinner or Skeleton that stands for loading has a text name ("Loading orders") in a polite live region, or `aria-busy="true"` on the region that is loading. A spinner with no text next to it is not decoration. `[DS-A11Y-037]`

## Color and Meaning

Never use color as the only signal for state. Error, success, and warning states always need a secondary indicator — an icon, a text label, or both. `[DS-A11Y-017]`
