# Changelog: conversion-patterns

## [1.0.0] - 2026-09-30

**Add** | Initial release. Condition-gated paywall, checkout, retention, referral, monetization-awareness, and CTA/pricing-display patterns drawn from published A/B test case studies (abtest.design / Mobbin). 32 rules in `data/conversion-rules.json` across 6 categories, each with `lever`, `mechanism`, `condition`, `evidence`, `routes_to`, and `contradicts`. Two modes (diagnose a ticket, audit a screen) and a fixed output format that hands structure to `vois-patterns`, copy to `righter`, and instrumentation to `metrics-tagging`. `scripts/check-rule-sync.mjs` checks that rule IDs in `SKILL.md` and the JSON agree.

Every rule is a single case study from one company. This skill makes you name your condition before picking a lever. It proposes experiments, it does not declare winners.
