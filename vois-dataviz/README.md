# vois-dataviz

Data visualization and dashboard guidance for the Vois design system, written so an agent can both **build** new charts and **review** existing ones against the same rules.

Standalone: no orchestrator or MCP server required. It can optionally call `vois_record_component_choice`, `vois_record_rule_usage`, `vois_report_pattern_gap` and `vois_get_tokens` when those tools exist; otherwise it skips them.

## What's in it

| | |
|---|---|
| **14 principles**, each with do and don't lists | Purpose, form, honesty, clarity, color, consistency, context, accessibility, interaction, filters, states, layout, sustainability, implementation |
| **114 rules** (64 required, 50 recommended) | Each has severity, how it's enforced (`auto`, `spec` or `judgment`), a do, a don't, a check, sources and evidence |
| **A decision tree** | 12 viewer jobs to 49 result nodes to a form, with six gates every result clears |
| **A chart catalog** | 48 forms, including all 23 families from the UX Magazine playbook, each tagged core, situational or rare for dashboards |
| **Dashboard patterns** | Six page templates and eight reusable pieces with the shadcn components to build them |
| **57 pieces of evidence** | Real dashboards from Mobbin, each marked adopt or watch-out |
| **Agent tooling** | A chart spec schema, a spec checker, a code detector, a review protocol and an output schema |

## Use it

```bash
# Before coding: check a chart spec against the rules and the decision tree
node vois-dataviz/scripts/check-spec.mjs spec.json
node vois-dataviz/scripts/check-spec.mjs --tree time      # forms reachable for a job

# After coding: find the auto-checkable rules in chart code
node vois-dataviz/scripts/detect.mjs src/components/charts/*.tsx

# After editing data/*.json: regenerate the references (CI runs --check)
node vois-dataviz/scripts/build-reference.mjs

# Everything
node vois-dataviz/scripts/dataviz.test.mjs
```

Start with `SKILL.md`. Read it after `vois-patterns` has decided that the screen is a dashboard or contains charts, and before `vois-components`.

## Layout

```
vois-dataviz/
  SKILL.md                     entry point: BUILD and REVIEW procedures, tree at a glance, quick reference
  data/                        canonical, machine-readable (JSON wins on conflict)
    dataviz-rules.json         principles + rules
    decision-tree.json         chart selection as a graph
    chart-catalog.json         forms
    dashboard-patterns.json    templates and pieces
    evidence.json              Mobbin observations
    review-checklist.json      review steps, fix playbook, loop checklist
    chart-spec.schema.json     what to fill in before coding
    review-output.schema.json  what a review looks like
  references/                  generated from data/ (do not edit): principles, decision-tree, chart-catalog, dashboard-patterns, evidence
                               hand-written: implementation, review-protocol, sources
  scripts/                     check-spec, detect, build-reference, tests, fixtures
```

## Keeping it in sync

`data/*.json` is canonical. Five of the reference files are generated from it, so edit the JSON and run `build-reference.mjs`. `scripts/dataviz.test.mjs` checks that every `DV-*`, `FORM-*`, `CHART-*`, `DASH-*` and `MOB-*` id cited in prose exists in its JSON and the reverse.

## Known gaps

- Material Design and USWDS weren't readable in the session that wrote this (blocked by the network proxy). Their rules are drawn from search summaries and are tagged `material` and `uswds`. See `references/sources.md`.
- The Vois MCP server may not accept `DV-*` ids in `vois_record_rule_usage` yet. The call is optional and non-blocking.
- Chart token roles (`chart-1` to `chart-8`, sequential, diverging, status, furniture) are specified in `references/implementation.md`. Their values live in the workspace tokens, which aren't in this repo.

---

**Maintained by:** Personify Labs
**License:** CC-BY 4.0. See root `LICENSE`.
