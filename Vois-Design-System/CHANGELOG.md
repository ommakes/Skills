# Changelog

## [1.1.0] — 2026-04-27

### Added

Four modern CSS patterns added to the skill. Each replaces a JavaScript-based approach with a native CSS equivalent.

**Text Truncation — `line-clamp`** (Section 2 Typography)
Cap text to a fixed number of lines using the `-webkit-box` pattern. Replaces JS `substring` hacks that break across font sizes, languages, and zoom levels.

**Image Cropping — `object-view-box`** (Section 4 Components)
Crop images to a specific region using `inset()` values directly on the `<img>` element. Replaces `overflow: hidden` wrapper divs and `clip-path` workarounds.

**Auto-growing Textareas — `field-sizing: content`** (Section 4 Components)
Makes `<textarea>` grow to fit its content without JavaScript resize listeners. Includes `min-height`/`max-height` guidance and browser support note (Chrome/Edge 123+).

**Parent Selector — `:has()`** (Section 10 CSS Architecture)
Style a parent or sibling based on its descendants. Replaces the pattern of toggling classes with JavaScript to propagate state up the DOM tree. Includes examples for form validation states, selected cards, floating labels, and sibling targeting.

### Updated

- Pre-Submit Checklist (Section 11): four new checkboxes under Components
- Quick Reference table: four new rows for the patterns above

---

## [1.0.0] — Initial release

Baseline skill covering spacing, typography, color (OKLCH + `light-dark()`), components, layout (viewport units, `content-visibility`), Tailwind v4, animation, accessibility, and responsive behavior.
