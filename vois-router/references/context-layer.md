# Context Layer Reference

Supporting content for Step 0 of the vois-router. Read this file when running
the VOIS.md setup interview or when loading sub-rule defaults by product type.

---

## Setup interview questions

### Round 1 — Product shape

Tell the designer:

> "Before we start, I need to understand what you're building. Eight quick
> questions — takes about three minutes. This creates VOIS.md, which means you
> won't have to explain this again."

Ask:

> "1. What type of product is this?
>    - B2B SaaS (business users, professional workflows)
>    - B2C app (consumer-facing, broad audience)
>    - Internal tool (ops, admin, internal teams)
>    - Marketplace or platform (multiple user types)
>
> 2. How is it structured?
>    - Single-vendor (one company's product, one set of users)
>    - Multitenant (organizations/workspaces with permission layers)
>    - Two-sided marketplace (buyers + sellers, or two distinct user roles)
>    - API-first or developer platform
>
> 3. Who's the primary user?
>    - Professional buyer (evaluates, approves, manages)
>    - Domain expert (uses it to do skilled work — designer, underwriter, analyst)
>    - Power user (heavy daily use, learns shortcuts)
>    - Casual user (occasional use, low context)"

### Round 2 — Design posture

> "4. Density preference?
>    - Compact (maximum information per screen, assumes expertise)
>    - Balanced (moderate density, mix of new and experienced users)
>    - Spacious (generous whitespace, prioritizes clarity over density)
>
> 5. How does this product build trust?
>    - Brand trust (trust in the company/product name)
>    - Peer trust (social proof, ratings, community)
>    - Algorithmic trust (data, accuracy, precision signals)
>    - Credential trust (certifications, compliance, institutional authority)
>
> 6. How do people use it together?
>    - Solo (primarily individual use)
>    - Team synchronous (real-time collaboration)
>    - Team async (shared context, not real-time)
>    - Open participation (public or semi-public contribution)"

### Round 3 — Taste dials

Two dials the coarse questions above don't capture (density is already covered
by Q4). Ask for a rough number; a range word is fine and maps to the midpoint.

> "7. How much motion should the product have? (1-10)
>    - 1-3: near-static — only essential feedback (most data/ops tools)
>    - 4-7: fluid — transitions and micro-interactions (most product UI)
>    - 8-10: choreographed — motion is part of the identity (marketing, showcase)
>
> 8. How much should layouts vary from a strict grid? (1-10)
>    - 1-3: strict, symmetric, predictable grids
>    - 4-7: deliberate asymmetry where it earns attention
>    - 8-10: editorial / masonry — asymmetry is the point"

Motion and density stay inside the hard guardrails regardless of the number —
the dials tune within the rules, never around them.

After all rounds, write VOIS.md using `references/VOIS.md.template` (fill the
DENSITY dial from the Q4 answer per the mapping in "Sub-rule sets" below).
Confirm with the designer before writing.

### PRODUCT.md interview (optional, offered after VOIS.md)

> "VOIS.md written. Want to also capture your product's strategic intent
> (purpose, brand personality, what to avoid)? That feeds into copy rules
> and component tone. Two more minutes."

If yes:

> "1. Who uses this, and what's their context when they open it?
> 2. What job are they trying to get done?
> 3. How would you describe the product's personality in 3 words?
> 4. Any references — products or brands that capture the right feel?
> 5. Anti-references — what should this explicitly NOT look like?"

Write PRODUCT.md using `references/PRODUCT.md.template`.

### DESIGN.md offer (optional, offered after PRODUCT.md)

> "Want me to scan your codebase for existing tokens and generate DESIGN.md?
> Or if nothing's built yet, I can seed a minimal one from a few questions."

If code exists: scan CSS custom properties, Tailwind config, token files,
component files. Extract token values, ask for descriptive names and the
Creative North Star, write DESIGN.md.

If nothing exists yet: ask five questions (color strategy, type direction,
motion energy, three references, one anti-reference) and write a seed
DESIGN.md marked `<!-- SEED: re-run once code exists. -->`.

---

## Sub-rule sets by product type

These are starting point defaults. Any specific decision tree step can override.

**Default taste dials by product type** (used to seed VOIS.md when the designer
doesn't give explicit numbers; the `density-profile` categorical maps to the
DENSITY dial as spacious≈2, balanced≈5, compact≈9):

| Product type | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| b2b-saas | 3 | 3 | 9 (compact) |
| b2c-app | 6 | 6 | 3 (spacious) |
| internal-tool | 2 | 2 | 9 (compact) |
| marketplace | 5 | 4 | 6 (balanced) |
| platform (api-first) | 3 | 2 | 7 |

### b2b-saas (single-vendor)
- Density: compact unless VOIS.md overrides
- Trust signals: credential and algorithmic preferred
- Navigation: top nav or left sidebar, task-oriented labels
- Righter: professional register, avoid consumer-marketing tone
- Components: data-dense tables, filter panels, status indicators

### b2b-saas (multitenant)
All single-vendor defaults, plus:
- Workspace chrome required — visual isolation between tenants
- Permission indicators (role badges, access states) are first-class components
- Righter: scope indicators in copy ("Your workspace", "All members")

### b2c-app
- Density: spacious unless VOIS.md overrides
- Trust signals: peer and brand preferred
- Onboarding: progressive disclosure, assume zero context on first run
- Righter: conversational register, lower reading level, warmer tone
- Components: cards over tables, empty states with strong CTA

### internal-tool
- Density: compact by default
- Trust signals: credential (role, access level)
- Navigation: utility-first, no marketing chrome
- Righter: direct and functional, no marketing language
- Components: bulk actions, keyboard shortcuts, power-user patterns

### marketplace (two-sided)
- Two parallel navigation models — buyer and seller have different primary tasks
- Righter: copy must work for both sides without alienating either
- Trust signals: peer (ratings, reviews) primary for both sides
- Components: dual-perspective status flows, transaction confirmation patterns

### platform (api-first)
- Documentation-adjacent: code blocks, technical precision required
- Trust signals: algorithmic — accuracy and reliability over warmth
- Righter: developer register, precise language, no hand-waving
- Components: code viewers, API response displays, status/error codes
