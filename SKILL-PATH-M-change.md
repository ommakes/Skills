# SKILL.md change set

Update the marketing branch to make PATH-M selection explicit:

```text
└─ PATH G: Show what a product or business offers to people not yet using it (landing page, homepage)
   └─ → read references/marketing-pages.md                   [PATH-G]
      └─ IF: feature block needs screenshot, chrome, motion, or non-flat media
         → read references/marketing-feature-media.md         [PATH-M]
         → choose one primary media treatment from claim/media structure
         → apply composable media treatment(s)
         → choose static/motion behavior
         → read vois-components and vois-tokens for implementation
```

Retain the standalone PATH-M branch.

Update the PATH-M description in the reference table to:
"Marketing feature media: primary treatment selection plus composable frame/chrome/blend/callout, behavior, evidence, responsive, accessibility and performance guidance."

Increment `vois-patterns` from `1.23.8` to `1.23.9` because the decision behavior is materially changed.
