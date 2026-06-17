# Accessibility `[DS-A11Y]`

These are not optional.

## Touch Targets

Minimum touch target: **44x44px**. If the visual element is smaller, expand the hit area with a pseudo-element: `[DS-A11Y-001]`

```css
.icon-button {
  position: relative;
}

.icon-button::after {
  content: '';
  position: absolute;
  inset: -10px;
}
```

## Focus States

Three focus pseudo-classes. Know when to use each one.

**`:focus-visible`** — triggers only when the browser determines a visible focus indicator is needed. This covers keyboard navigation and assistive technology, but not mouse clicks. Use this for focus rings on buttons and links: `[DS-A11Y-002]`

```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

**`:focus-within`** — triggers when an element or any of its children has focus. Use this to style entire form sections when a user focuses on an input inside:

```css
.form-field:focus-within {
  border-color: var(--color-border-focus);
}
```

**`:focus`** — triggers on any focus, including mouse clicks. Avoid using this for visual rings. Only reach for it when you need to respond to all focus events regardless of input method.

Never remove `outline` without providing a `:focus-visible` replacement. `[DS-A11Y-003]`

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

## Color and Meaning

Never use color as the only signal for state. Error, success, and warning states always need a secondary indicator — an icon, a text label, or both. `[DS-A11Y-017]`
