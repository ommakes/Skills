# Evidence

Where the evidence behind the design system rules lives. This file is for people who maintain the skills. An agent building a screen does not need to read it.

A rule should say what it is based on. Specs do this with a **Basis:** line near the top (see `vois-components/references/stepper.md`). When you add or change a rule, add or update its basis, and link the source from here if it is new.

## Product research

| Source | What it holds |
|---|---|
| [`vois-dataviz/data/evidence.json`](./vois-dataviz/data/evidence.json) | Mobbin screens, each tagged adopt or watch-out with the rule IDs it supports. Rendered as [`vois-dataviz/references/evidence.md`](./vois-dataviz/references/evidence.md) (generated, do not edit by hand) |
| **Basis:** lines in `vois-components/references/` and `vois-patterns/references/` | What each spec was drafted from, and what was not checked |

## Eval runs

| Source | What it holds |
|---|---|
| [`vois-eval/results/`](./vois-eval/results) | Full and smoke runs: each sample's pass or fail, lookalike hits, cost and turns, skills on and off. `check-results.mjs` checks them in CI |
| [`vois-eval/README.md`](./vois-eval/README.md) | What each run showed, its limits, and the gaps the run agents reported |
| [`vois-eval/scenarios.json`](./vois-eval/scenarios.json) | Decision scenarios tied to the job and path trees, word for word |

## Known failures

| Source | What it holds |
|---|---|
| [`vois-eval/lookalike-pass/FINDINGS.md`](./vois-eval/lookalike-pass/FINDINGS.md) | What agents hand-built instead of using the real component, skills on and off |
| `lookalikes` in [`vois-components/data/components-rules.json`](./vois-components/data/components-rules.json) | The lookalike rows that came out of those findings, with their tier (`observed` or `watch`) |
| [`vois-tokens/references/anti-slop.md`](./vois-tokens/references/anti-slop.md) | Generic AI layout defaults and when each one is a problem |

## Not kept here

- **Screenshots.** They are binary files. Keep them in eval run output, not in skill folders.
- **Usage telemetry.** It comes from the Vois MCP, so it stays in the private repo.
