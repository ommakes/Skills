# Pricing Pages [PATH-F]

Reference for `vois-patterns`. Read this when the goal is "show people what it costs and help them pick a plan."

**Evidence note:** Everything here comes from pattern observation across roughly 45 Mobbin screens (SaaS web, consumer web, iOS paywalls). No conversion data. Where a rule is my design judgment and not something seen in the wild, it says so. For paywall timing, placement, and test-backed claims, route to `conversion-patterns`. This file is about layout and structure only.

**Routing:**
- All words (tier names, badges, CTAs, footnotes, trial terms) go to `righter`.
- Component picks (toggle vs segmented control, slider vs stepper, table vs cards) go to `vois-components`.
- Tokens, spacing, dark/light handling go to `vois-tokens`.

---

## Step 1: Answer four questions before drawing anything

1. **What is the billing unit?** Seat, usage, seat + usage, or flat.
2. **How many tiers are real?** Count only tiers that differ in what the buyer gets, not in name.
3. **Who is buying?** One person (consumer or solo pro), a team lead, or a procurement team.
4. **Is there a sales-led tier?** If yes, it gets "Custom" in the price slot. If no, do not fake one.

---

## Decision Tree

```
START: What do you charge for?

├─ FLAT (one price, no meter, no seats)
│  ├─ One plan                        → [PATH-F-FLAT-1]
│  └─ 2 to 4 plans                    → go to TIER COUNT below
│
├─ SEAT-BASED (price scales with people)
│  ├─ One plan                        → [PATH-F-SEAT-1]
│  ├─ 2 to 3 plans                    → [PATH-F-SEAT-3]
│  └─ 4 plans                         → [PATH-F-SEAT-4]
│
├─ USAGE-BASED (price scales with volume)
│  ├─ One plan, one rate              → [PATH-F-USAGE-1]
│  ├─ 2 to 4 plans, each with allowance + overage → [PATH-F-USAGE-TIERED]
│  └─ Pure pay-as-you-go, no plans    → [PATH-F-USAGE-PAYG]
│
├─ HYBRID (seat fee + included usage + overage)
│  └─ Any tier count                  → [PATH-F-HYBRID]
│
└─ CONSUMER SUBSCRIPTION (individual, family, student)
   ├─ Web pricing page                → [PATH-F-CONSUMER-WEB]
   └─ iOS or in-app paywall           → [PATH-F-CONSUMER-PAYWALL]


TIER COUNT (applies to flat, seat, and usage-tiered):

  1 tier   → single card, centered. No highlight badge needed.
  2 tiers  → "me vs us" or "free vs paid". Highlight the paid one.
  3 tiers  → the default. Highlight the middle. Enterprise can be the third.
  4 tiers  → only if Free + Pro + Team + Enterprise are all real.
             Add a comparison table below the cards.
  5+ tiers → don't, unless consumer with distinct benefit stories.
             Use tabs or a carousel, not a wide row.
```

---

## Universal Rules (every pricing page)

**[PATH-PRICE-U1] One lockup for price.** Show price, unit, and billing period together: "$24 per person / month, billed annually." Seen on Descript, Height, Plain. Never split the unit into a footnote.

**[PATH-PRICE-U2] Annual toggle states its savings.** "Save 25%," "2 months free," "-20%." Put it next to the toggle, not in a tooltip. Every price on the page must change when the toggle flips. Default to annual only if annual is what you want to sell.

**[PATH-PRICE-U3] Show the annual total when annual is on.** Copy.ai and Kit both show "$36/mo, billed $432/year." Buyers do the math anyway. Do it for them.

**[PATH-PRICE-U4] One highlighted tier, never two.** Use a border or elevation plus a short badge ("Most popular," "Recommended"). Do not rely on color alone.

**[PATH-PRICE-U5] Only the highlighted tier gets the primary button.** Others get secondary style. Descript and Plain do this well. Teachable colors one and blacks the others, which is close but inconsistent when the highlight and the button color disagree.

**[PATH-PRICE-U6] CTA matches the friction.** Free: "Start free." Paid with trial: "Start free trial." Top tier: "Talk to sales." Do not put "Get started" on every card.

**[PATH-PRICE-U7] Use "Everything in X, plus:"** on every tier above the first. Dub, Height, Windsurf, Circle all do it. It cuts repeated bullets and shows the ladder.

**[PATH-PRICE-U8] Limits are numbers, not adjectives.** "30 transcription hours / month" beats "generous limits." Keep to about 6 to 8 bullets per card. If a card runs longer, the extra goes in the comparison table.

**[PATH-PRICE-U9] "No credit card required" near the free or trial CTA, only when true.** Seen on Dub, Clay, Lyssna.

**[PATH-PRICE-U10] Enterprise says "Custom" in the price slot.** List what sales unlocks (SSO, audit logs, dedicated support). Don't invent a starting price you won't honor.

**[PATH-PRICE-U11] Define any term that changes the bill.** Retool footnotes "standard users" vs "end users." If two things look like seats but bill differently, define both below the cards.

**[PATH-PRICE-U12] State tax and currency.** Mistral says "excluding taxes" and has a currency switch. Do this if you sell across regions.

**[PATH-PRICE-U13] Below the cards, in this order:** comparison table (3+ tiers), FAQ, reassurance line (cancel anytime, money-back). *Design judgment, not one observed order.*

**[PATH-PRICE-U14] Mobile stacks cards with the recommended tier first.** *Design judgment.* Users won't scroll past three tall cards to find the one you want them to see.

---

## Tier Count Rules

**[PATH-PRICE-T1] One tier.** One card, centered, price, 4 to 8 features, one CTA. Reflect ("One plan one price") and Skillshare do this. If price varies by a size variable, put the control inside the card (Kit's subscriber dropdown). Add a small secondary path for big buyers ("Request a demo").

**[PATH-PRICE-T2] Two tiers.** Works best when the split is "me vs us" (Personal / Team) or "free vs paid." Highlight the paid one.

**[PATH-PRICE-T3] Three tiers.** The default. Name tiers by audience or stage, not Good/Better/Best. Seen: Hobbyist / Creator / Business (Descript), Launch / Grow / Scale (Plain), Starter / Pro / Enterprise (Current).

**[PATH-PRICE-T4] Four tiers.** Windsurf, Mistral, Retool, and Firecrawl show four. Only do it when the fourth is a real sales-led tier. Keep card bullets short and put depth in a comparison table. Airtable and Lyssna both use a sticky-header table with grouped sections.

**[PATH-PRICE-T5] Five or more.** Only for consumer products with distinct benefit stories. Revolut uses five cards with short descriptions and arrows. Klarna uses tabs plus cards. Never a five-column row of feature bullets.

---

## Seat-Based Rules

**[PATH-PRICE-S1] Price per seat per month, with the period.** Plain: "$39 / user / month." Say who counts as a seat.

**[PATH-PRICE-S2] Show included seats.** Copy.ai: "5 user seats included." Lyssna shows both "included seats" and "maximum seats" per tier.

**[PATH-PRICE-S3] Add a stepper on the card when seat count changes the price.** Mistral puts "$50/mo, 2 users" with +/- on the Team card. GitBook uses a number input and shows a running total. Show monthly and annual totals.

**[PATH-PRICE-S4] Separate seat types and say so.** Lyssna has viewer seats. Retool has standard users and end users with different prices. If you have free viewers or cheaper light users, show that as a feature, not fine print.

**[PATH-PRICE-S5] Disclose caps.** "Up to 50 members" (Height), "max 15 seats" (Lyssna). Buyers hit these walls later and feel tricked if you hid them.

**[PATH-PRICE-S6] Volume discounts live on the Enterprise card.** Windsurf: "Volume based annual discounts (>200 seats)."

**[PATH-PRICE-S7] If the free tier has unlimited seats, say it loudly.** Height and Current lead with "unlimited members." It's a differentiator.

---

## Usage-Based Rules

**[PATH-PRICE-X1] Never show only a per-unit rate.** A rate like "1.8 cents per charge" is meaningless without a sample bill. Add an estimator (Stripe, Vercel, Cofounder).

**[PATH-PRICE-X2] Ask in the customer's unit.** Kit asks "How many email subscribers do you have?" Teak asks "Avg. daily active players." Cartesia converts credits to minutes of audio. If your billing unit is abstract (tokens, credits, blocks), translate it. Mailchimp's "blocks of 25,000 emails" is the version to avoid.

**[PATH-PRICE-X3] Slider plus number input.** Vercel and Grok pair them. The slider is for exploring, the input is for exactness. Label the tick marks.

**[PATH-PRICE-X4] Show the rate table next to the calculator.** Stripe highlights the active tier under the slider track. Mailchimp shows the full block-rate table. Buyers want to verify your math.

**[PATH-PRICE-X5] Big estimated total, plus an itemized breakdown.** Cofounder lists token, compute, and database costs above a large total. Vercel does the same and adds a comparison. Always label it "estimated."

**[PATH-PRICE-X6] Default to a realistic value, not zero.** Cartesia starts at 45 min. Mailchimp's empty state shows $0.00, which tells the buyer nothing. *My read, not tested.*

**[PATH-PRICE-X7] Show included allowance and overage separately.** Cofounder: "$20 included." Windsurf: "Add-on credits at $10 / 250 credits." Say what happens when they run out.

**[PATH-PRICE-X8] Recommend a plan from the input.** Cartesia shows a "Recommended plan" card after you pick volume. Kit disables tiers that can't cover your count ("Max subscribers reached").

**[PATH-PRICE-X9] Say what one unit buys.** If you sell credits, give an example ("1 credit = about 2 pages scraped"). ClassPass explains credits in its own page and notes rollover. Rollover is worth stating.

**[PATH-PRICE-X10] Offer a reset on multi-input calculators.** Grok has one.

**[PATH-PRICE-X11] Predictability is a feature.** If you don't meter something, show it as $0. Agentcard lists "$0 per issued card" and "$0 per order" under a flat monthly fee. If you have a spending cap or pause, say so.

**[PATH-PRICE-X12] Outcome pricing needs a definition.** Intercom prices Fin at "$0.99 per outcome." Any outcome-based price must define what counts as one, on the same screen.

---

## Hybrid Rules (seats + usage)

**[PATH-PRICE-H1] Show usage per seat.** Windsurf: "500 prompt credits / user / month." Buyers multiply by team size. Put the multiplication in the calculator.

**[PATH-PRICE-H2] Calculator order follows how buyers think.** Plan, then seats, then usage, then add-ons, then total. GitBook: plan, site count, users, total per month and per year. Teak adds an add-on toggle.

**[PATH-PRICE-H3] Two totals.** Monthly and annual, always.

**[PATH-PRICE-H4] Keep the cards simple, put the math in the calculator.** Cards show the base price and allowance. The calculator shows the real bill. Don't cram both into one card.

---

## Consumer Rules

**[PATH-PRICE-C1] Plan choice is radio cards with one Continue button.** MasterClass and Quizlet show cards with a clear selected state and one button below. Do not hide prices behind a tap.

**[PATH-PRICE-C2] Show both the monthly equivalent and the real charge.** Blue Apron: "$8.33/mo" plus "$99.99/yr." Lifesum shows per-month next to the billing period. Yubo's "$0.60/day" is fine only if the actual charge is also visible.

**[PATH-PRICE-C3] Explain the trial as a timeline.** Quizlet: today (access), reminder date, trial ends, billing starts. Jomo says "We'll notify you 24h before your trial ends." This is the single clearest trust builder in the set.

**[PATH-PRICE-C4] The CTA and the small print agree.** "Start free trial" with "7-day free, then $29.98/year" right under it (Halide). Blue Apron adds a terms checkbox before enabling the button.

**[PATH-PRICE-C5] iOS: always show Restore Purchases, Terms, Privacy.** Jomo, Lifesum, Notion all do.

**[PATH-PRICE-C6] Name family plans by who's in them.** Deezer: "1 account / 2 accounts / 6 accounts." MasterClass: "1 account, 6 devices."

**[PATH-PRICE-C7] Free vs Pro list when free is real.** Tide Guide shows a checklist with two columns. It makes the upgrade feel concrete.

**[PATH-PRICE-C8] Sticky CTAs must not cover a plan.** Tide Guide's button sits over the annual plan card in the screen I saw. Test with the smallest supported device.

**[PATH-PRICE-C9] Strikethrough anchors only for real prior prices.** Lifesum and Deezer use them. If the higher price was never charged, don't show it. *Ethical rule, not observed.*

**[PATH-PRICE-C10] One line on why it costs money.** Halide has a "Why is Halide not free?" block. For indie or small-team apps it earns trust.

**[PATH-PRICE-C11] Placement, timing, and trial-vs-no-trial go to `conversion-patterns`.**

---

## Don'ts

- Don't show two "Most popular" badges or highlight two cards.
- Don't put "Contact us" on a tier where you actually have a price.
- Don't hide the billing period. "$29" with no "per month" or "per year" is a bug.
- Don't make the annual toggle change only the headline price. Card totals, footnotes, and the calculator must follow.
- Don't use a per-unit rate as the only number on a usage page.
- Don't write feature bullets as adjectives ("Powerful analytics").
- Don't repeat the full feature list on every tier. Use "Everything in X, plus."
- Don't let the free tier look like a broken version of paid. Say what it's for.
- Don't put a feature in the comparison table that isn't in the plan.
- Don't cover the last plan with a sticky button on small screens.
- Don't invent an Enterprise price to look "complete."

---

## Checklist Before Implementation

- [ ] Billing unit named (seat, usage, hybrid, flat)
- [ ] Real tier count decided; highlighted tier picked (max one)
- [ ] Price lockup includes unit and period
- [ ] Annual toggle wired to every number on the page, savings stated
- [ ] CTA text per tier matches friction, routed through `righter`
- [ ] Any term that changes the bill is defined on the page
- [ ] Usage: estimator exists, defaults to a realistic value, shows a breakdown, labeled "estimated"
- [ ] Seats: included seats, caps, and seat types disclosed
- [ ] Consumer: trial timeline, post-trial price, restore/terms/privacy
- [ ] Mobile: recommended tier first, sticky CTA doesn't cover content
- [ ] Comparison table added if 3+ tiers or feature-heavy

---

## Reference Screens (Mobbin)

Three-tier SaaS: [Plain](https://mobbin.com/sites/sections/7e0fc745-3555-4bdf-8792-6aa8b35522ca), [Descript](https://mobbin.com/sites/sections/297accf4-78bc-4786-b3ac-d371ceddf9aa), [Dub](https://mobbin.com/sites/sections/0d2d583d-2925-4080-a99e-001e46f0437f), [Copy.ai](https://mobbin.com/sites/sections/2b4ce5a9-1e9c-4069-b0bb-70358ab3a5b9), [Circle](https://mobbin.com/sites/sections/75daae46-73f0-457a-ba76-04fd57ce0a91)

Four-tier and comparison: [Retool](https://mobbin.com/sites/sections/b09ff1a9-1dbf-4d67-8d8b-55771ca3c3cd), [Windsurf](https://mobbin.com/sites/sections/95d4742f-87e6-4f79-b4b6-ce713220435e), [Mistral](https://mobbin.com/sites/sections/acdc5a30-423b-482f-bbf0-220feb1f6ed1), [Airtable](https://mobbin.com/sites/sections/d1e2db93-cbb8-41ab-a415-7f8241a23880), [Lyssna](https://mobbin.com/sites/sections/09e4e7cc-84a2-4918-9d60-9299621d48ae)

Single plan: [Reflect](https://mobbin.com/sites/sections/e42c8789-8709-4d25-8778-8f18b6cb3719), [Kit creator plan](https://mobbin.com/sites/sections/5ad68c3d-aa0a-4d64-9d27-a0125dc091f5), [Agentcard](https://mobbin.com/sites/sections/bc4c8057-62e6-48d0-9ad7-e0930c58ce74), [Skillshare](https://mobbin.com/sites/sections/1402b3eb-5585-4634-8884-807faa1bd563)

Usage calculators: [Stripe](https://mobbin.com/sites/sections/088a670f-2b5e-4b7a-ad9b-680405acd8fb), [Vercel](https://mobbin.com/sites/sections/770b030a-8e99-4fc4-97a2-30e9a8a9a7b0), [Cofounder](https://mobbin.com/sites/sections/7567c411-413a-46d1-9f30-701a78b29c2b), [Grok](https://mobbin.com/sites/sections/81db7590-2786-489b-af2d-ef506c7388b5), [Teak](https://mobbin.com/sites/sections/58c2e515-2f0f-4696-8cc2-d9d0ad4993c7), [Cartesia](https://mobbin.com/sites/sections/f7fe4c69-1b50-448b-92f8-96f3bbae2568), [Mailchimp](https://mobbin.com/sites/sections/c5322cc0-b6f2-4b4f-bc71-3673800f6f33), [GitBook](https://mobbin.com/sites/sections/8545954a-6e11-46c1-bbb1-d3f5f5487618), [Kit slider](https://mobbin.com/sites/sections/bf75ef36-3544-4f1b-b71e-3e91b8456224)

Consumer web: [MasterClass](https://mobbin.com/sites/sections/04be53c0-c109-4e4d-b398-64246fe4cbf9), [Deezer](https://mobbin.com/sites/sections/eb3d24f0-46c2-42a9-bdee-65d31cbca1ea), [ClassPass](https://mobbin.com/sites/sections/c41db823-bf68-4d39-b24a-d456245a468b), [Revolut](https://mobbin.com/sites/sections/cac16ee8-d037-4b22-8de1-5eedc7457b1a), [Klarna](https://mobbin.com/sites/sections/dbe5e6cb-d402-4bb6-8e6b-b1cba7e712e0)

iOS paywalls: [Quizlet](https://mobbin.com/screens/1c14274b-c9e0-4c46-bdb5-018567fa5f49), [Blue Apron](https://mobbin.com/screens/ee9a2a00-4327-47c5-9ebe-20bc5a6bcb76), [Jomo](https://mobbin.com/screens/355c903b-4580-4f82-bd8f-0c46195fa434), [Lifesum](https://mobbin.com/screens/8b62f92e-5ada-4dc4-89f1-70a82820887e), [Halide](https://mobbin.com/screens/699b087c-8c67-4fe6-8b91-360a080edace), [Tide Guide](https://mobbin.com/screens/5b34dc0f-7bf4-4ba1-ac0f-1780eb282738)
