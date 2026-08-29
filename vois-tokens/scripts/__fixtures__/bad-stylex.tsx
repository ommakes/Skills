// Fixture: one deliberate violation per StyleX-syntax detection branch added
// alongside the Tailwind-syntax checks in registry.mjs. bad.tsx already covers
// the Tailwind/CSS forms of these same rules — this fixture exists so the
// StyleX object-literal regex paths have their own regression coverage.
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  card: {
    padding: 11, // DS-SPACING-001 (StyleX form)
    transitionProperty: "all", // DS-TAILWIND-005 (StyleX form)
    transitionDuration: "700ms", // DS-ANIMATION-001 (StyleX form)
    willChange: "left", // DS-ANIMATION-009 (StyleX form)
    ":active": {
      scale: 0.8, // DS-ANIMATION-008 (StyleX form)
    },
  },
});

export function BadStylexCard() {
  return <div {...stylex.props(styles.card)}>content</div>;
}
