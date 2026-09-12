# UX Research

Four skills that work together as a research team — programming surveys,
synthesizing quant + qual feedback, and writing stakeholder reports —
plus a router that orchestrates the loop between them. Each skill also
works standalone.

## Install

```
npx skills add ommakes/Skills/ux-research/survey-architect
npx skills add ommakes/Skills/ux-research/feedback-synthesizer
npx skills add ommakes/Skills/ux-research/research-reporter
npx skills add ommakes/Skills/ux-research/research-loop
```

## Instruction priority

Every skill's `## Rules` section tags its bullets with one of five
keywords, in this precedence order — a lower one never overrides a
higher one, it's simply inapplicable when a higher rule already applies:

| Keyword | Meaning |
|---|---|
| **STOP** | End processing immediately, before taking the action that triggered it. |
| **MUST NOT** | Prohibited behavior. |
| **MUST** | Mandatory behavior. |
| **SHOULD** | The default, unless a documented exception applies. |
| **MAY** | Optional. |

This legend lives here once rather than being restated in all four
SKILL.md files — each skill's Rules section links back to this section
instead of repeating it.

## Configuration

`config/product-context.yaml` is the one place organization-specific
facts live — which products exist (survey-architect's intake reads this
rather than a hardcoded list), and the root paths for study folders and
the benchmark directory (`research_root`, `benchmarks_root`, read by
research-loop's `study_dir()`/`benchmark_path()`). Retargeting this
skill family at a different organization means editing this one file,
not any SKILL.md prose.

## The loop

```
research-loop (orchestrator — entry detection, explicit per-study state,
                file structure, benchmark comparability, kickbacks)
    │
    ├─ survey-architect     → intake → instrument selection → sample size → deploy-ready spec
    │                          (SEQ, SUS, UMUX-Lite, SUPR-Q, NPS, CSAT, CES, PSSUQ, or custom)
    │
    ├─ feedback-synthesizer → scores + CIs + significance testing + qualitative theme
    │                          coding + severity tiers (with named overrides) + evidence
    │                          confidence + claim-strength ladder, cross-referenced
    │
    └─ research-reporter    → audience-formatted report (internal markdown/Notion,
                               formal docx), never re-deriving or upgrading synthesizer's
                               numbers, tiers, or claim-strength levels
```

Unlike a one-way pipeline, the loop can push back on itself:
feedback-synthesizer can kick back to survey-architect when a sample is
too thin or the wrong instrument was used for the stated goal, and
research-reporter kicks back to feedback-synthesizer rather than
inventing a missing confidence interval or severity tier. Max 2
loop-backs per study before it surfaces the trade-off to you instead of
spinning. research-loop tracks this explicitly in a per-study
`00-state.json` against a fixed transition graph, rather than
re-inferring progress from file existence on every turn.

### Survey Architect

Turns "I need to know something about users" into a specific, validated,
platform-deploy-ready survey. Opens with an intake (product, decision,
where it sits in the user's experience) before ever picking an
instrument — the wrong instrument answers a question nobody asked.

**Use when:** starting a new research question, before any data exists.

Bundles `scripts/selection.py` for the deterministic instrument lookup,
sample-size floor, and intake/output-spec validation, plus `evals/` for
regression testing. Reads `../config/product-context.yaml` for the
product list instead of a hardcoded one.

→ [`survey-architect/`](./survey-architect)

### Feedback Synthesizer

Turns raw scores + open-text comments into one connected finding, not
two separate reports that happen to share a doc. Runs real confidence
intervals and significance testing (never eyeballed) via a centralized
statistical policy, codes qualitative themes through a multi-pass
protocol (initial codes → consistency review → disconfirming-case search
→ quantify only once stable) rather than a single keyword pass, and owns
severity/priority scoring — including named override reasons (safety,
accessibility, legal/compliance) that can outrank the frequency-based
tier. Rates evidence confidence separately from any confidence interval,
and tags every finding with a claim-strength level (observed → associated
→ correlated → causal), refusing a causal label without an experimental
design to back it.

**Use when:** raw survey results or a pile of feedback exists and needs
turning into findings. Works standalone — doesn't require
survey-architect to have run first.

Bundles `scripts/scoring.py` for every instrument's scoring formula, CI,
significance test, severity tiering (with overrides), claim-strength
validation, and synthesis-artifact validation, plus `evals/` — including
a regression test that locks in a real bug found during testing
(severity tiering diluted by whole-sample frequency instead of frequency
within the affected score band).

→ [`feedback-synthesizer/`](./feedback-synthesizer)

### Research Reporter

Turns a synthesis into something a stakeholder actually reads and acts
on — audience-formatted, but never re-scoring, re-testing, or
softening a caveat feedback-synthesizer already established.

**Use when:** synthesis is done and needs turning into something
shareable.

Bundles `scripts/report_checks.py` for audience-format lookup, section
completeness, verbatim-preservation, and causal-language checks —
flagged explicitly in the skill itself: these checks can prove a number
wasn't dropped and that no causal verb appears without a causal-strength
finding behind it, but can't catch a report that keeps every number and
still reframes "directional" as "confirmed," or "correlated" as "clearly
caused by" without ever using the word "caused." That still needs a
human read.

→ [`research-reporter/`](./research-reporter)

### Research Loop

The orchestrator. Detects which skill an input should enter at (cold
start, via file sniffing) or reads the explicit `00-state.json` (once a
study is underway), manages the per-study file structure and the
per-product longitudinal benchmark, checks benchmark comparability
before implying a trend, and enforces the loop-back ceiling.

**Use when:** starting any UX research task — this is the entry point,
not the three skills directly, unless you already know exactly which
one you need.

Bundles `scripts/routing.py` for deterministic entry detection, state
transitions against a fixed graph, the loop-back ceiling, and benchmark
validation/comparability, plus `evals/`.

→ [`research-loop/`](./research-loop)

## File structure this system maintains

```
/research/<study-name>/
  00-intake.md            — product, learning goal, instrument decision
  00-intake.json            — same facts, canonical/machine-readable
  00-state.json             — explicit state, loopback count, artifact validation
  01-survey-spec.json     — deploy-ready spec: items, scoring, n, triggers
  02-synthesis.md          — scores, CIs, significance, themes, severity,
                             evidence confidence, claim strength, uncertainty
  02-synthesis.json          — same facts, canonical/machine-readable
  03-report-internal.md    — internal-audience report
  03-report.json             — same facts, canonical/machine-readable
  03-report-formal.docx    — formal-audience report, if requested

/research/_benchmarks/<product>.md
  — running log: date, instrument, score, CI, n, measurement conditions, per wave
  — running qualitative theme taxonomy for the product
```

For every `.md`/`.json` pair, the `.json` is canonical — the next skill
in the loop reads it, not the markdown. The `.md` is the human-readable
copy of the same facts.

## Testing

Each skill's `evals/test_*.py` is a dependency-free (beyond `scipy` for
feedback-synthesizer's stats) `unittest` suite covering the
deterministic parts — instrument lookups, scoring formulas, confidence
intervals, severity tiering, entry-point routing. Run after touching the
matching `scripts/*.py`:

```
cd ux-research/<skill-name>
python3 -m unittest discover -s evals -v
```

Each skill's `evals/qualitative_cases.md` covers the judgment calls a
fixed assertion can't grade (theme coding without keyword shortcuts,
when a thin sample should kick back vs. just get flagged, refusing to
manufacture a narrative for an unexplained score movement, adversarial
asks like "just call this significant" or "make the summary more
positive"). These need a human or a fresh model run to check, not a test
runner — see each skill's file for the specific cases and their fail
conditions.

CI (`.github/workflows/ux-research-checks.yml`) runs all four skills'
`evals/test_*.py` suites plus SKILL.md frontmatter validation on every
push/PR touching `ux-research/**` or `skills.json` — the qualitative
cases still need a human or fresh model run, CI only covers the
deterministic half. See [`CHANGELOG.md`](./CHANGELOG.md) for version
history across all four skills.
