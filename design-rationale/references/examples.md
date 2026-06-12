# Examples Reference

Real-world precedents organized by moment type. Use these when a well-known
example would strengthen a rationale — not as a default output for every principle.

The test for using an example: would the designer's audience recognize it, and
does it make the principle more concrete rather than just decorating the explanation?

---

## How to use this file

When a principle maps to a well-known product decision, reference the example
after completing the Four-Move Structure. Format it as:

> **Precedent:** [Company / product] [what they did] — [why it's relevant to
> this specific decision, in one sentence].

Don't force examples where they don't fit. "No strong precedent comes to mind
for this specific case" is a fine output.

---

## Onboarding

**Duolingo — Goal-Gradient Effect + Zeigarnik Effect**
Duolingo shows streak counts, XP progress, and lesson completion state persistently.
The incomplete state is always visible, and the streak specifically creates a
Zeigarnik tension that pulls users back daily. The design makes incompletion feel
uncomfortable in a way that motivates without being manipulative — the progress is
real, not manufactured.
Use when: defending persistent progress indicators, streak mechanics, or incomplete
state visibility in onboarding or engagement design.

**Headspace — Flow + Cognitive Load in onboarding**
Headspace's onboarding asks one question at a time, each building on the last,
with the answers shaping the first session recommendation. The cognitive load per
screen is minimal. The sequence feels like a conversation, not a form. Each step
produces a visible consequence (the recommendation changes). This is a good example
of calibrating onboarding challenge to new user state.
Use when: defending single-question-per-screen onboarding, or progressive profile
building rather than upfront form completion.

**Loom — Paradox of the Active User + Mental Model**
Loom's onboarding skips explanation and puts users directly in front of the record
button. The first action teaches the core model (record, share, watch). No tutorial
modal. The product teaches itself through use. This works because the core action is
intuitive enough that trying it is lower cost than reading about it.
Use when: defending reduced onboarding instruction in favor of direct task entry.

**Blinkist — Cognitive Bias (anchoring) in trial paywall**
Blinkist shows the annual price anchored against the monthly equivalent before
showing the monthly plan. The monthly plan is priced to look expensive relative
to the annual option. Anchoring the first number seen (monthly) makes annual feel
like a deal even when the absolute price is higher. This is a documented principle
application that increased trial conversion by 23%.
Use when: defending pricing display order or the decision to show annual pricing first.

**Grammarly — Onboarding survey design**
Grammarly's onboarding survey asks about writing goals and use cases before the
product loads. Each question is single-select with visual icons. The survey creates
a sense of personalization and commitment before the user has done any work. The
questions are short enough that the Paradox of the Active User doesn't kick in —
it feels faster to answer than to skip.
Use when: defending pre-product surveys that collect context before first use.

---

## Navigation

**Spotify — Hick's Law + Serial Position Effect**
Spotify's bottom navigation on mobile has five items: Home, Search, Your Library,
and (historically) two others. The count stays within Miller's range. Home and
Search occupy the first and last positions — highest-use items get primacy and
recency positions. The middle items get less traffic, which is consistent with
serial position predictions.
Use when: defending navigation item count or placement of primary vs. secondary
nav items.

**Apple Settings — Chunking + Cognitive Load**
Apple Settings groups items by category with clear visual separation. Within each
section, items are consistent in visual weight — no item screams for attention
over another. The structure allows scanning rather than reading. Compare to any
third-party settings screen that presents 40 ungrouped toggles.
Use when: defending grouped navigation, settings organization, or reducing visual
hierarchy noise in list views.

**Airbnb — Mental Model + Jakob's Law**
Airbnb's navigation follows web conventions closely even as the product has grown
in complexity. Search is prominent and central. Filters follow established e-commerce
patterns. The reason: their users come from every background, and aligning with
existing mental models reduces the onboarding cost for infrequent users who return
to the app sporadically.
Use when: defending decisions to use conventional navigation patterns over custom ones.

---

## Conversion and Decision Points

**Amazon — Cognitive Bias (social proof, anchoring) + Peak-End Rule**
Amazon's product pages layer social proof at every level: aggregate star rating,
review count, "X bought in last 24 hours," "Frequently bought together." The
anchoring of the original price against the sale price uses the anchoring bias
directly. The post-purchase confirmation is fast and clear, ending the transaction
on a high note.
Use when: defending the placement of social proof elements, price comparison
displays, or the design of confirmation states.

**Tinder — Hick's Law + Flow**
Tinder reduces a complex decision (is this person compatible?) to a binary swipe.
The information on each card is deliberately minimal. The decision interface has
one variable. This violates conventional wisdom about giving users enough
information to decide — but it works because the complexity of the actual judgment
is intrinsic and irreducible. Tinder absorbed the complexity of interface
presentation to let users focus their cognitive resources on the judgment itself.
Use when: defending the removal of information from a decision screen, or arguing
that less context can produce better decisions in certain contexts.

**GoDaddy — Postel's Law + Cognitive Load in checkout**
GoDaddy's checkout flow has been studied for adding friction (upsells, pre-checked
add-ons) — this is a cautionary example rather than a positive one. The pre-checked
boxes rely on status quo bias (users default to leaving things as they are) and
create cognitive overhead for users trying to complete a simple purchase. Useful
for identifying when a design exploits bias rather than accounts for it.
Use when: evaluating whether a checkout or purchase flow is using bias to manipulate
rather than design for genuine user benefit.

**Stripe — Aesthetic-Usability Effect + Trust**
Stripe's checkout and developer documentation consistently outperform competitors
on aesthetic quality. Research has repeatedly shown that users rate Stripe more
trustworthy and easier to use than competitors with functionally equivalent APIs.
The aesthetic quality primes a positive evaluation before users engage with the
product itself — a direct application of the Aesthetic-Usability Effect.
Use when: defending investment in visual quality in trust-sensitive contexts like
payments, data entry, or sign-up.

---

## Empty States

**Slack — Paradox of the Active User + Mental Model**
A new Slack workspace's empty channel state explains what the channel is for and
suggests a first message. It doesn't just say "no messages yet." The example content
models the expected behavior, helping users understand the product's mental model
without requiring them to read documentation.
Use when: defending empty states that include example content or suggested actions.

**Trello — Goal-Gradient Effect + Empty State as teacher**
Trello's empty board state includes example cards pre-populated in a "Getting
Started" list. Users can see the pattern of use immediately and delete the examples
once they understand. The pre-populated content also triggers a mild Zeigarnik
tension — there are things here to complete.
Use when: defending the inclusion of example or template content in empty states.

---

## Error States

**Mailchimp — Postel's Law + Error Recovery**
Mailchimp's form validation accepts multiple email formats and corrects obvious
typos (e.g., "gmal.com" → "gmail.com") rather than rejecting input. When it can't
correct, the error message is specific: "Did you mean gmail.com?" rather than
"Invalid email format." The liberal input acceptance reduces friction; the specific
error message reduces recovery cost.
Use when: defending input tolerance decisions or specific vs. generic error message language.

**Google Forms — Working Memory + Error Placement**
Google Forms surfaces field errors immediately adjacent to the field that triggered
them, and preserves all valid input on submission. Users never have to remember
which field was wrong or re-enter valid data. This directly addresses working memory
load during error recovery.
Use when: defending inline error placement vs. top-of-form error summaries, or
defending input preservation on validation failure.

---

## Notifications

**LinkedIn — Selective Attention + Notification Timing**
LinkedIn tested showing connection request notifications at times when users were
actively browsing rather than mid-task. The result was a 500% increase in opt-in
rates for notifications — not because they changed the permission request copy, but
because they aligned the ask with a moment when the user's attention was available
and the action felt low cost.
Use when: defending notification timing decisions or the sequencing of permission requests.

**Hopper — Goal-Gradient Effect + Permission Request**
Hopper delays its push notification permission request until after it has shown the
user a personalized price prediction for a flight they searched. The request happens
at the moment of maximum user investment — they've seen the value and want to know
when prices drop. The permission rate is significantly higher than apps that request
on first launch.
Use when: defending delayed permission requests or any decision to sequence a request
after demonstrating value.

---

## Offboarding

**Typeform — Peak-End Rule + Ethical Offboarding**
Typeform's cancellation flow is notably clean: it asks one question about reason for
cancellation, acknowledges the feedback, and completes the cancellation without dark
patterns (no "are you sure?" loops, no guilt-trip copy). The end of the experience
is respectful, which shapes the memory of the product positively even as the user leaves.
Use when: defending streamlined cancellation flows against pressure to add friction.

**Adobe — Cognitive Bias (loss aversion) + Offboarding**
Adobe's cancellation flow is a documented cautionary example of exploiting loss
aversion — it emphasizes what users will lose (cloud storage, active projects,
subscription benefits) before offering the cancellation option. Multiple screens
of friction before the user can complete the action. Users who successfully cancel
often report a negative lasting impression. Useful as a counterexample.
Use when: evaluating cancellation flow design and distinguishing motivation from manipulation.

---

## Two-Way Door Decision Examples

These are cases where a decision was treated as irreversible but was actually easy
to test and roll back.

**YouTube — Choice Overload in feed**
YouTube A/B tested showing fewer recommended videos per row to reduce choice overload.
The test was reversible in hours. The framing "we're removing content from the feed"
made it sound like a one-way door; "we're testing a reduced option count" frames it
correctly as a two-way door.

**Spotify — Serial Position in navigation**
Spotify has moved navigation items in and out of its bottom bar multiple times based
on usage data. Each change was treated as a test with clear rollback criteria, not a
permanent architectural decision. The stability of the user mental model didn't suffer
because the changes were measured and incremental.

**Duolingo — Streak mechanic**
Duolingo added, adjusted, and modified its streak mechanic over many iterations.
None of the changes were one-way doors — all were testable against engagement metrics
with defined rollback triggers. The framing "we're removing streaks" would make it
sound permanent; "we're testing a modified streak experience with rollback if DAU drops
more than X%" is the correct framing.

Use these when helping a designer reframe a decision from "we chose X over Y forever"
to "we're testing X with a clear signal for when to revisit."
