# Vois Fields

**Version 1.0.0** · For use with Claude Code, Claude.ai, and any Claude-powered agentic coding tool. Part of the Vois design system skills. Works without the Vois MCP server.

Rules for specialized input fields. It answers: what keyboard, autofill, stored format, check timing and privacy handling does this field need?

## Why it exists

The other Vois skills say which component to use and how to style it. None said anything about input type, mobile keyboard, autofill, paste, formatting, VINs, phone numbers, postal codes, money or sensitive data. Commercial auto work needs all of these.

## What is in it

| Part | File | Who reads it |
|---|---|---|
| Field type table (12 rows) | `data/field-types.json` | Agents, and people who want the answer for one field |
| Its schema | `data/field-types.schema.json` | CI (`scripts/check-fields.mjs`) |
| Prefilled answer schema | `data/prefill-answer.schema.json` | Agents, CI (tests) |
| Rules (23, tagged `FIELD-*`) | `data/fields-rules.json` | Agents, CI |
| Core rules, when to check, sensitive data | `references/core-rules.md` | Agents and people |
| Prefilled values | `references/prefill.md` | Agents and people |
| Type-ahead | `references/type-ahead.md` | Agents and people |
| Explainer | `docs/field-explainer.html` | People |

## Where it sits in the chain

`vois-patterns` then `vois-components` then **`vois-fields`** then `vois-tokens`, with `righter` throughout. It runs only when the screen has a specialized field. The repo [README](../README.md) gives the reading order.

## Where the rules came from, and how sure we are

The rules come from field-spec and survey research and from common practice (HTML input attributes, one-time code autofill, the way browsers handle `type="number"`). All rules are `proposed` in 1.0.0. The table marks each row `standard`, `convention` or `proposed`. Items to test before they are called settled: the VIN check-digit warning, the masking pattern for SSN and driver's license with password managers, the date input on real phones, and whether shadcn Command auto-picks the first result.

## Version history

See [CHANGELOG.md](./CHANGELOG.md).
