# PATH-M data/patterns-rules.json change set

Replace the PATH-M treatment outcomes with the following decision-oriented entries.

```json
[
  {
    "id": "PATH-M-TREATMENT-CENTERED",
    "node_type": "sub_decision",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "pattern_name": "Centered hero media",
    "condition": "One primary claim has one dominant focal media state and does not need a side-by-side explanatory relationship.",
    "outcome": "Use one large focal media piece. Reject when three equal claims, multiple materially different states, tall/device-shaped media needing adjacent explanation, or decorative-only media make another treatment a better fit. Phone: media first, then copy."
  },
  {
    "id": "PATH-M-TREATMENT-TRIPTYCH",
    "node_type": "sub_decision",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "pattern_name": "Triptych",
    "condition": "Exactly three parallel claims have equal weight and each has distinct supporting media.",
    "outcome": "Use three equal columns with media, short title, and one or two sentences. Reject when three images merely decorate one claim, are substantially identical, or represent multiple states of one idea. Phone: stack in claim order."
  },
  {
    "id": "PATH-M-TREATMENT-SPLIT",
    "node_type": "sub_decision",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "pattern_name": "Split row",
    "condition": "One feature is explained by one primary media state and the media is tall, narrow, device-shaped, or otherwise benefits from adjacent explanatory copy.",
    "outcome": "Use two columns with media and copy, alternating sides across repeated rows. Reject when three equal claims need parallel treatment, the media crop destroys evidence, or multiple materially different states are needed. Phone: media first, then copy."
  },
  {
    "id": "PATH-M-TREATMENT-BENTO",
    "node_type": "sub_decision",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "pattern_name": "Bento grid",
    "condition": "One idea requires two or three materially different media states with unequal importance.",
    "outcome": "Use two or three intentionally unequal tiles, giving the most important state the most visual weight. Reject identical tile grids, decorative-only bento, or tiles that are actually independent claims. Phone: stack most important/largest state first."
  },
  {
    "id": "PATH-M-EVIDENCE",
    "node_type": "cross_cutting_rule",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "rule_name": "Claim to media evidence",
    "condition": "A marketing section uses media to support its headline.",
    "outcome": "Map claim to expected evidence, media state, crop, and optional callout. If the media does not show the claimed outcome or control, replace the media rather than weakening the claim."
  },
  {
    "id": "PATH-M-STATE-VS-FLOW",
    "node_type": "cross_cutting_rule",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "rule_name": "State versus flow media",
    "condition": "Choosing between static media and motion/video.",
    "outcome": "Use static media for states/outcomes. Use motion/video when a transition, multi-step interaction, or essential movement is the evidence. Do not use video merely for visual novelty."
  },
  {
    "id": "PATH-M-RESPONSIVE",
    "node_type": "cross_cutting_rule",
    "parent": "PATH-M",
    "source_file": "vois-patterns/references/marketing-feature-media.md",
    "rule_name": "Marketing media responsive behavior",
    "condition": "A PATH-M treatment is rendered at a smaller viewport.",
    "outcome": "Preserve the treatment hierarchy while stacking media before copy on phone. Triptych stacks in claim order; bento stacks the most important state first; sticky and parallax are off on phone; never create page-level horizontal scrolling."
  }
]
```

Also update the PATH-M top-level outcome to say that PATH-M chooses one primary treatment and then applies composable media composition and behavior layers.
