# Email Writing Rules

Rules for writing product transactional emails in drip campaigns triggered by onboarding, activation, and re-engagement events. These emails are functional, not promotional. Users open them because they expect something useful.

Apply all core Righter principles (active voice, present tense, no weakeners, no em dashes, Grade 5 reading level). This reference covers the email-specific layer on top of those.

---

## A note on open rates

Open rates are no longer a reliable primary metric. Apple Mail Privacy Protection (MPP) pre-loads email content for ~46% of email users, inflating open rate data by up to 18 points. Track click-to-open rate (CTOR) and click-through rate (CTR) instead. These are the truest signals of whether your copy is doing its job.

**2025 benchmarks (product/SaaS context):**
- Transactional emails: 8x higher opens and clicks than marketing emails
- Automated/triggered emails: ~51% open rate vs. ~40% for newsletters
- Click-to-open rate (CTOR): target 8-12% for transactional sequences
- Click-through rate (CTR): target 3-5% for triggered product emails
- Unsubscribe rate: keep below 0.1% (Gmail/Yahoo now flag senders above 0.3%)

---

## Email anatomy

Every product transactional email has five parts. Write each one intentionally.

1. Subject line
2. Preheader
3. Body
4. CTA
5. Footer

---

## 1. Subject line

The subject line's only job is to get the email opened. For transactional emails, it should also reassure the user they're in the right place.

**Length**
- 40-50 characters is the safe zone for desktop and mobile
- The first 25 characters are what most mobile screens guarantee to show
- Put the most important information first, not at the end

**Rules**
- Use sentence case, never title case or ALL CAPS
- No more than 3 punctuation marks total
- No exclamation marks in transactional email subjects
- Never use spam-trigger phrases: "Free", "Urgent", "Act now", "Limited time", "Don't miss"
- Be specific. Vague subjects underperform every time.
- Personalize with first name when the trigger event makes it relevant

**Transactional vs. curiosity framing**
- Transactional emails should inform, not tease. The user triggered this email by doing something. Tell them what it's about.
- Curiosity gaps ("You won't believe what's inside") belong in marketing, not product emails
- Exception: re-engagement emails can use a lighter, more conversational tone

**Examples**
- Onboarding: "You're in. Here's your first step."
- Activation: "Your first experiment is ready to launch"
- Re-engagement: "It's been a while, [First name]"
- Account event: "Your password was just changed"

**Spam filter risks**
- ALL CAPS subject lines lower sender reputation over time
- Multiple exclamation marks can trigger spam filters
- Pressure language ("Act now", "Urgent") gets flagged by increasingly sophisticated inbox algorithms

---

## 2. Preheader

The preheader is the short text that appears next to or below the subject line in the inbox. It's a second subject line. Treat it that way.

**Important 2025 context**
Apple's iOS 18.2 update replaced preheader text in Apple Mail with AI-generated summaries. You can't fully control what Apple Mail shows. Because of this, subject lines now need to carry more weight on their own. Write your subject line so it works without a preheader. Then write the preheader as added value for clients that still show it (Gmail, Outlook, most others).

**Length**
- 40-75 characters is the safe range across devices
- Front-load the important content. It will get cut off on smaller screens.

**Rules**
- Never repeat the subject line. Different content only.
- Add detail, context, or a secondary reason to open
- For transactional emails: inform and reassure, don't sell
- For re-engagement: a secondary hook or value reminder works well
- Personalize when possible (first name, trigger action, plan name)

**Examples**
- Subject: "You're in. Here's your first step." / Preheader: "Create your first persona in under 2 minutes."
- Subject: "Your password was just changed" / Preheader: "If this wasn't you, secure your account now."
- Subject: "It's been a while, [First name]" / Preheader: "Your experiments are still here. Pick up where you left off."

---

## 3. Body

The body delivers on what the subject and preheader promised. It's not a place to pitch. It's a place to give the user exactly what they need to take the next step.

**Structure**
Every product email body follows this order:
1. Hook -- one line. What's the point of this email?
2. Context -- 1-2 sentences. Why is the user getting this? What triggered it?
3. Value or instruction -- what they get or need to do
4. CTA -- see section 4

**Length**
- Keep it under 150 words for most triggered emails
- Re-engagement emails can go slightly longer if they need to rebuild context
- If you need more than 200 words, the email is trying to do too much

**Rules**
- One email, one job. One action per email.
- Short paragraphs. One idea per paragraph.
- No walls of text. If a step needs explanation, break it into numbered steps.
- Lead with the user, not the product. Start sentences with "You" or the action, not "We" or the company name.
- Don't repeat what the user already knows. Skip feature explanations they saw during signup.
- Put reassurance copy where hesitation actually happens. A privacy note in the footer doesn't help a user who's about to connect their Figma account.
- Behavior-based emails should feel like they know what the user did. Reference the trigger where relevant.

**Tone by email type**
- **Onboarding**: Warm, confident, low friction. Make the next step feel small.
- **Activation**: Focused, instructional. One clear action. Show the path forward.
- **Re-engagement**: Honest, human. Don't guilt-trip. Acknowledge the gap and give a reason to come back.

**What to avoid**
- "We're so excited to have you" openers. Get to the point.
- Feature lists. Emails aren't product pages.
- "Feel free to..." -- weak verb phrase. Cut it.
- "Please don't hesitate to reach out" -- throat-clearing. Cut it.
- Generic encouragement with no next step

---

## 4. CTA

The CTA is the most important element in the email. Everything before it exists to earn the click.

**Core rules**
- One primary CTA per email. Always.
- Verb-led. Start with the action.
- 2-4 words max for button copy
- Never use "Click here" or "Learn more" as standalone CTAs. They say nothing.
- The CTA should match what the user is about to do, not what the product wants them to do

**Placement**
- Place the primary CTA above the fold where possible (visible without scrolling)
- For longer emails: repeat the CTA at the bottom. Don't make users scroll back up.
- For short transactional emails (OTPs, password resets): CTA appears right after the key information

**Primary vs. secondary CTAs**
- Primary CTA: the main action. Use a button. High visual contrast.
- Secondary CTA: a fallback or support option. Use a text link, not a second button. Keep it visually smaller.
- Secondary CTAs are for: "Contact support", "View help doc", "Manage billing". Never let them compete with the primary.

**Button copy patterns by email type**
- Onboarding: "Set up your first persona", "Create your experiment", "Go to your dashboard"
- Activation: "Launch your experiment", "Complete your profile", "Connect your account"
- Re-engagement: "Pick up where you left off", "See what's new", "Go to your workspace"
- Account/security: "Reset my password", "Verify my email", "Secure my account"

**What makes a weak CTA**
- "Submit" -- no context, no action framing
- "Get started" -- overused, says nothing specific
- "Find out more" -- sends the user on a search, not an action
- Passive constructions: "Your account can be activated here"

---

## 5. Footer

The footer handles trust, legal, and relationship maintenance. Keep it clean and functional.

**What to include**
- Unsubscribe link (required by law, and now a deliverability requirement from Gmail and Yahoo)
- Company name and mailing address (CAN-SPAM requirement)
- Brief explanation of why they're receiving this email ("You're getting this because you signed up for Personify.")
- Optional: link to manage preferences, view in browser

**Rules**
- Keep footer copy short. Users don't read it; they scan it when they need something specific.
- One-click unsubscribe is now mandatory, not optional. Gmail and Yahoo enforce this for senders above 5,000 emails/day.
- Never hide the unsubscribe link. Users who can't find it hit "Report spam" instead. That's worse.
- Don't use the footer to pitch features or add CTAs. It's not real estate for upsells.

**Tone**
- Neutral and plain. No exclamation marks.
- If you include a reason for receiving the email, make it factual and specific.
- ✓ "You're getting this because you created a Personify account on April 3, 2026."
- ✗ "You're part of our amazing community of product builders!"

---

## Email metrics reference

Use these when reviewing email copy in Righter's output format. Replace ARI score with email-specific metrics.

**For subject lines:**
- Character count: X (target 40-50)
- Word count: X (target 6-9 words)
- Personalization: Yes / No
- Spam risk words present: Yes / No

**For full emails:**
- Word count: X (target under 150)
- ARI score: X.X (target Grade 5, ARI ≤ 6)
- CTA count: X (target 1 primary, max 1 secondary)
- Reading time estimate: ~X seconds (target under 30 seconds)

**Benchmark targets for triggered product emails:**
- CTOR: 8-12%
- CTR: 3-5%
- Unsubscribe rate: below 0.1%

---

## Review checklist for emails

Run through this before finalizing any product email.

**Subject line**
- [ ] 40-50 characters?
- [ ] First 25 characters carry the key message?
- [ ] Sentence case?
- [ ] No ALL CAPS or multiple exclamation marks?
- [ ] No spam-trigger words?
- [ ] Specific, not vague?

**Preheader**
- [ ] Different from the subject line?
- [ ] Adds context or a secondary reason to open?
- [ ] Front-loaded (key info first)?
- [ ] 40-75 characters?

**Body**
- [ ] One job, one action?
- [ ] Under 150 words?
- [ ] Leads with the user, not the company?
- [ ] Short paragraphs, no walls of text?
- [ ] References the trigger event where relevant?
- [ ] No "we're excited" openers?
- [ ] No throat-clearing or weak verb phrases?

**CTA**
- [ ] One primary CTA?
- [ ] Verb-led?
- [ ] 2-4 words?
- [ ] Placed above the fold?
- [ ] No "Click here" or "Learn more" as standalone?
- [ ] Secondary CTA visually smaller and non-competing?

**Footer**
- [ ] Unsubscribe link present and easy to find?
- [ ] Company name and address included?
- [ ] Reason for receiving the email stated clearly?
- [ ] No upsells or feature pitches in the footer?
