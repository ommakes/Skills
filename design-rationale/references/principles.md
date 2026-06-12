# Principles Reference

Three tiers of principles. Read the relevant tier based on the decision context.
Most decisions will touch Tier 1. Platform-specific decisions may also require Tier 2.
Tier 3 is for pattern-level decisions (onboarding, conversion, retention) where
applied product examples are more useful than named laws.

---

## Tier 1: Cognitive and Behavioral Principles

These come from cognitive science and behavioral psychology. They apply across
platforms, contexts, and product types.

---

### Aesthetic-Usability Effect
**What it says:** Users perceive aesthetically pleasing interfaces as more usable,
even when functional parity exists with a less polished alternative.

**Mechanism:** Visual polish activates the affective system before the analytical
system. When something looks well-made, users approach it with a more charitable,
patient attitude — they're more likely to persist through friction and attribute
errors to themselves rather than the product.

**When it applies:** First impressions, onboarding, trust-sensitive moments (payments,
sign-up, sensitive data). Also relevant when defending investment in visual quality
against "just ship it" pressure.

**When it doesn't:** When the polish creates false affordances or when aesthetics
obscures function. A beautiful button that doesn't look tappable fails clarity even
if it looks great.

---

### Choice Overload (Paradox of Choice)
**What it says:** Too many options overwhelms users, leading to decision avoidance,
lower satisfaction with the choice made, and sometimes no choice at all.

**Mechanism:** Each option requires evaluation and comparison. Beyond a threshold,
the cognitive cost of evaluating options exceeds the perceived value of choosing,
and users disengage or defer. Satisfaction also decreases post-choice because more
alternatives means more regret potential.

**When it applies:** Navigation menus, filter sets, onboarding option screens,
pricing pages, settings panels with many toggles.

**When it doesn't:** Power user contexts where the full option set is expected and
valued. Expert users with domain knowledge have lower evaluation costs per option.

---

### Chunking
**What it says:** Information is easier to process and remember when grouped into
meaningful units rather than presented as a flat undifferentiated list.

**Mechanism:** Working memory has limited capacity (see Miller's Law). Grouping
reduces the number of discrete items the brain needs to track by treating a cluster
as a single unit. The grouping also creates implicit relationships that aid recall.

**When it applies:** Form design, settings screens, navigation, data tables,
any screen with more than a few items to scan.

**When it doesn't:** When the groupings are arbitrary or misleading — bad chunking
is worse than no chunking because it creates false relationships.

---

### Cognitive Bias
**What it says:** Human judgment is systematically skewed by mental shortcuts
(heuristics) that work well most of the time but produce predictable errors.

**Mechanism:** The brain uses pattern-matching and shortcuts to make fast decisions
without full information. These shortcuts were adaptive in most contexts but can be
exploited — intentionally or not — by interface design.

**Common biases relevant to design:**
- Anchoring: first number seen affects all subsequent judgments (pricing displays)
- Confirmation bias: users seek information that confirms what they already believe
- Status quo bias: people prefer the current state, even when change would benefit them
- Sunk cost: users continue with something because of past investment, not future value
- Social proof: behavior of others is used as evidence of correct behavior

**When it applies:** Pricing pages, onboarding defaults, notification permission
requests, cancellation flows, upgrade prompts.

**When it doesn't:** When using bias awareness to justify dark patterns. The skill
flags when a design exploits bias rather than accounts for it.

---

### Cognitive Load
**What it says:** Every interface element, decision, and piece of unfamiliar
information consumes mental resources. When the total load exceeds capacity,
performance degrades and errors increase.

**Mechanism:** Working memory has limited capacity and short duration. Interfaces
that require users to hold too much in mind simultaneously, learn unfamiliar patterns,
or make too many decisions push users into cognitive overload. This is especially
acute for new users and in high-stakes moments.

**Three types:**
- Intrinsic: complexity inherent to the task itself (can't always be reduced)
- Extraneous: complexity added by the interface (always reduceable)
- Germane: cognitive effort that builds understanding (worth investing in)

**When it applies:** Onboarding, complex multi-step workflows, forms, data-heavy screens.

**When it doesn't:** When "reducing cognitive load" is used to justify dumbing down
features that expert users need. Reducing extraneous load is always good. Reducing
intrinsic load sometimes means reducing capability.

---

### Doherty Threshold
**What it says:** Productivity and engagement increase significantly when a system
responds in under 400ms. Above that threshold, users disengage from the feedback loop.

**Mechanism:** Under 400ms, the system response feels like a direct consequence of
the user's action — the interaction feels physical and immediate. Above 400ms, the
connection between action and result weakens, users lose the sense of direct control,
and attention drifts.

**When it applies:** Any interaction with a perceptible response time — search,
form submission, navigation transitions, loading states, auto-save.

**When it doesn't:** When the delay is inherent to the operation (file processing,
API calls). In those cases, the principle informs how to handle the wait, not how
to eliminate it. Progress indicators, skeleton screens, and optimistic UI are the
design responses.

---

### Fitts's Law
**What it says:** The time to move to and click a target is a function of the
distance to the target and the size of the target. Closer and bigger is faster.

**Mechanism:** Motor movement to a target requires more time and precision as
distance increases and target size decreases. The relationship is logarithmic —
doubling the size of a small target has more impact than doubling a large one.

**When it applies:** Button placement (especially primary actions), touch target
sizing on mobile, cursor-based interactions on desktop, placement of actions
relative to where the user's attention just was.

**When it doesn't:** When target size increases create layout problems or visual
hierarchy issues. Fitts's Law is one input into button sizing, not the only one.

---

### Flow
**What it says:** Users enter a state of deep engagement when the challenge of a
task is appropriately matched to their skill level, feedback is immediate, and
goals are clear.

**Mechanism:** Flow requires three conditions: clear goals (user knows what success
looks like), immediate feedback (the interface responds to their actions), and
a balance between challenge and skill. Too easy → boredom. Too hard → anxiety.
Either disrupts flow.

**When it applies:** Onboarding (calibrating challenge to new user skill), creative
tools, games, any workflow where sustained engagement matters.

**When it doesn't:** Transactional interfaces where speed matters more than engagement.
A checkout flow shouldn't aim for flow — it should aim for completion.

---

### Goal-Gradient Effect
**What it says:** Motivation and pace increase as users get closer to completing a goal.

**Mechanism:** Proximity to completion activates a sense of investment — people
have a psychological drive to finish things they've started. The closer they are
to done, the stronger the pull to finish.

**When it applies:** Progress indicators, multi-step flows, onboarding, streaks,
reward systems. Also relevant to how you structure a long form — showing progress
increases completion rates.

**When it doesn't:** When artificial progress (the classic "we've pre-completed
step 1 for you!") is obviously fake. Users recognize manufactured momentum and it
backfires.

---

### Hick's Law
**What it says:** The time it takes to make a decision increases with the number
and complexity of choices.

**Mechanism:** Each option in a set requires evaluation and comparison before it
can be accepted or rejected. This is not a linear cost — complexity of options
matters as much as count. A choice between three radically different options is
harder than a choice between seven similar ones.

**When it applies:** Navigation, filter sets, pricing pages, settings, option
selection at any decision point.

**When it doesn't:** When the full option set is necessary for the task. Eliminating
choices that users actually need creates a different problem. Hick's Law justifies
reducing options to what users actually use — not to what the designer prefers.

---

### Jakob's Law
**What it says:** Users spend most of their time on other products. They bring
expectations built from everywhere else they've ever used software.

**Mechanism:** Mental models are formed through repeated exposure. When an interface
matches an existing mental model, the user can transfer knowledge without learning.
When it violates the model, the user must rebuild understanding from scratch —
which takes time and creates errors.

**When it applies:** Navigation patterns, icon choices, form layouts, modal behavior,
any pattern that has an established convention.

**When it doesn't:** When the convention is genuinely broken or the product is
establishing a new interaction paradigm intentionally. In those cases, the violation
should be deliberate and well-supported by other design decisions.

---

### Law of Common Region
**What it says:** Elements perceived within a shared boundary or background are
understood as belonging together.

**Mechanism:** The brain uses enclosure as a grouping cue. A border, background
color, card container, or whitespace boundary signals "these things are related."
Without explicit enclosure, proximity and similarity do the work — but enclosure
is the strongest grouping signal.

**When it applies:** Card layouts, form groupings, sidebar panels, modals, anything
where you need to make a group relationship explicit.

**When it doesn't:** When overuse creates visual noise. Every region has a cost —
too many containers fragment the layout and compete for attention.

---

### Law of Proximity
**What it says:** Elements that are close together are perceived as related.

**Mechanism:** Spatial proximity is one of the oldest grouping heuristics in human
perception. The brain assumes that things near each other share a relationship —
whether they do or not. This means proximity can create false relationships just
as easily as it communicates real ones.

**When it applies:** Form labels and their fields, error messages and the element
that triggered them, actions and the content they affect, metadata and the item
it describes.

**When it doesn't:** When proximity conflicts with hierarchy. Sometimes the most
important action needs to be spatially separated from the content to give it
appropriate visual weight.

---

### Law of Prägnanz (Good Form)
**What it says:** People interpret ambiguous or complex visuals as the simplest
possible form — the one that requires least cognitive effort to understand.

**Mechanism:** The brain actively seeks the simplest stable interpretation of
visual input. When something is ambiguous, perception defaults to the reading
that requires the fewest assumptions.

**When it applies:** Icon design, illustration, data visualization, any visual
element that needs to communicate without text support.

**When it doesn't:** When simplification removes necessary distinction. Some
complexity is intrinsic to the information — oversimplifying it creates
misunderstanding, not clarity.

---

### Law of Similarity
**What it says:** Elements that look alike are perceived as belonging together,
even when they're spatially separated.

**Mechanism:** Visual similarity (color, shape, size, orientation) creates a
perceptual group that overrides proximity in some cases. The brain treats similar
things as members of the same category.

**When it applies:** Consistent button styles to signal affordance, icon families,
color coding by category, typography hierarchy.

**When it doesn't:** When similarity creates false equivalence between elements
that have different functions. Same-colored buttons that do different things
violate similarity expectations.

---

### Law of Uniform Connectedness
**What it says:** Elements connected by a line, path, or visual bridge are perceived
as more related than elements that are merely close together.

**Mechanism:** Explicit visual connection is the strongest relationship signal —
stronger than proximity or similarity. A line between two elements means "these
are linked" in a way that whitespace and color can't match.

**When it applies:** Relationship diagrams, breadcrumbs, process flows, form
field connections, any time you need to show that two things are causally or
sequentially linked.

**When it doesn't:** When the visual connection is decorative rather than semantic.
Lines that don't mean anything train users to ignore them — and then they ignore
the ones that do mean something.

---

### Mental Model
**What it says:** Users understand a system through a compressed internal model
of how they believe it works — not how it actually works.

**Mechanism:** Users don't learn systems by reading documentation. They build
a mental model through use, analogy, and inference. This model is usually
incomplete and sometimes wrong — but it's the model they act from. When the
product's behavior contradicts the user's mental model, errors and confusion follow.

**When it applies:** Any non-standard interaction pattern, terminology decisions,
information architecture, onboarding design (you're teaching the mental model).

**When it doesn't:** When the correct mental model can be taught quickly and the
resulting understanding unlocks genuine value. Not all model-building is bad friction.

---

### Miller's Law
**What it says:** The average person can hold 7 (plus or minus 2) items in
working memory at one time.

**Mechanism:** Working memory is a temporary holding space for information being
actively processed. It has limited capacity and items decay quickly without
rehearsal. Overloading it causes errors, forgotten steps, and frustration.

**Important nuance:** The commonly cited "7 items" applies to chunks, not
individual pieces of information. Chunking can extend effective capacity — but
working memory is still finite.

**When it applies:** Navigation item counts, form length, the number of steps
shown at once, anything that asks the user to keep multiple things in mind
simultaneously.

**When it doesn't:** When "7 items" is used as a blanket rule without considering
what the items are or how complex each one is. Context matters more than count.

---

### Occam's Razor
**What it says:** Among competing designs that achieve the same goal, the simpler
one should be preferred.

**Mechanism:** Complexity has costs: more to learn, more to break, more cognitive
overhead, more maintenance burden. Simplicity isn't just aesthetic — it's a
functional advantage.

**When it applies:** Choosing between implementation approaches, evaluating
feature additions, simplifying flows, responding to "can we also add..."

**When it doesn't:** When the simpler solution is only simpler on the surface.
Sometimes apparent simplicity in the UI creates complexity elsewhere (in the
user's mental model, in edge case handling, in the backend).

---

### Paradox of the Active User
**What it says:** Users start using software immediately without reading
instructions or understanding how it works.

**Mechanism:** Reading a manual has a certain cost (time, effort, context-switching).
Using the software has a certain cost (learning by trial and error). For most users,
in most contexts, the trial-and-error cost is lower than the manual cost — so they
skip the manual. This is rational behavior, not laziness.

**When it applies:** Onboarding design, empty states, tooltip and hint placement,
error message design. The implication is that your interface has to teach itself —
you can't assume users will read anything.

**When it doesn't:** Expert-domain products where users genuinely have the motivation
and background to read documentation. Even then, in-product discovery is usually
more effective than external docs.

---

### Pareto Principle
**What it says:** Roughly 80% of outcomes come from 20% of causes. Applied to
design: 80% of user actions typically come from 20% of features.

**Mechanism:** Usage distributions are almost never uniform. A small set of
features, paths, or actions accounts for the vast majority of value delivered.
Optimizing for the long tail at the expense of the common case is a common design error.

**When it applies:** Prioritizing what to surface in navigation, deciding what
belongs in a "more" overflow, progressive disclosure decisions, mobile layouts
where space is constrained.

**When it doesn't:** When the 20% assumption hasn't been validated. Apply Pareto
as a hypothesis to test, not a fact to assume. Usage data should confirm the
distribution before it drives major layout decisions.

---

### Peak-End Rule
**What it says:** People judge an experience primarily by how they felt at its
most intense moment (peak) and at its end — not by the average across the entire
experience.

**Mechanism:** Memory of an experience is not a faithful recording. It's
constructed from emotionally significant moments, heavily weighted to the peak
and the end. A painful experience with a great ending is remembered better than
a mediocre experience that ends neutrally.

**When it applies:** Onboarding completion moments, success states, error recovery,
cancellation flows, checkout confirmation. The end of every significant flow is
an opportunity to shape how it's remembered.

**When it doesn't:** When optimizing the peak and end masks genuinely broken
middle-of-flow experiences. A good ending doesn't fix a terrible process —
it just slightly improves its memory trace.

---

### Postel's Law
**What it says:** Be liberal in what you accept from users, conservative in
what you output to them.

**Mechanism:** Users make input errors constantly — typos, format variations,
unexpected approaches. A system that accepts "07/04/2024", "July 4 2024", and
"7-4-24" as equivalent reduces friction without sacrificing correctness. But
what the system outputs should be precise, consistent, and unambiguous.

**When it applies:** Form validation, search input, date and phone number fields,
anything where users might enter the same information in multiple valid formats.

**When it doesn't:** When liberal input acceptance creates security or data
integrity risks. Postel's Law is about user experience tolerance, not input
sanitization shortcuts.

---

### Selective Attention
**What it says:** People focus on a subset of available stimuli — usually those
related to their current goal — and filter out everything else.

**Mechanism:** The brain can't process all available information in parallel.
Attention is a limited resource directed by task goals and salience cues. Users
on a focused task will miss visual elements that aren't on their attention path —
even obvious ones. This is why "did you miss our new feature?" banners often
go unseen during active task flows.

**When it applies:** Feature discoverability, notification placement, error message
positioning, onboarding hints timed to task context.

**When it doesn't:** When assuming that making something visible guarantees it
will be seen. Visibility is necessary but not sufficient — the element also needs
to be on the user's attention path at the moment they need it.

---

### Serial Position Effect
**What it says:** Users remember items at the beginning (primacy effect) and
end (recency effect) of a list better than items in the middle.

**Mechanism:** Items at the start of a list get more processing time and are
more likely to be transferred to long-term memory (primacy). Items at the end
are still in working memory when recall happens (recency). Middle items get neither
advantage.

**When it applies:** Navigation item ordering, feature lists, option sets,
onboarding step sequences, any list where some items need to be more memorable
than others.

**When it doesn't:** When all items in the list are equally important. In that
case, the serial position effect is a bias to account for, not a tool to use.

---

### Tesler's Law (Law of Conservation of Complexity)
**What it says:** Every system has a fixed amount of inherent complexity. That
complexity can't be eliminated — only moved. Either the product absorbs it or
the user does.

**Mechanism:** The complexity of a task is largely set by the nature of the task
itself, not by the interface. When a designer "simplifies" by hiding options or
removing steps, the complexity usually moves — to a later point in the flow,
to a support call, to an error recovery path, or to the user's mental model.

**When it applies:** Simplification decisions, progressive disclosure choices,
wizard vs. form decisions, onboarding that "does things for the user" vs.
teaches them how.

**When it doesn't:** When the complexity being absorbed is genuinely extraneous —
interface complexity that doesn't reflect task complexity. That's always worth
eliminating. Tesler's Law is specifically about intrinsic complexity.

---

### Von Restorff Effect (Isolation Effect)
**What it says:** When multiple similar items are present, the one that stands
out visually is most likely to be remembered and noticed.

**Mechanism:** Contrast draws attention. The brain is tuned to detect anomalies
in patterns — it's a survival mechanism. Anything that breaks a visual pattern
gets more attentional weight than items that conform to it.

**When it applies:** Primary CTA placement (make it visually distinct from
secondary actions), highlighting a recommended pricing tier, callout elements,
badges, any time you want one item to receive disproportionate attention.

**When it doesn't:** When everything is made visually distinct. The Von Restorff
Effect requires a pattern to break. If everything is highlighted, nothing is.
Use it sparingly or it stops working.

---

### Working Memory
**What it says:** Working memory is the cognitive system that temporarily holds
and manipulates information needed to complete a task. It's limited in capacity
and duration.

**Mechanism:** Working memory holds roughly 4 chunks of information for roughly
15-30 seconds without rehearsal. It's the bottleneck for all conscious processing.
Any interface that requires users to hold information across contexts, screens,
or delays is competing with this limit.

**When it applies:** Multi-step flows, form design, wizard patterns, anything
that requires users to remember something from a previous screen to use on the
current one.

**When it doesn't:** When reducing working memory load means removing information
the user genuinely needs. The goal is to reduce extraneous load, not to oversimplify.

---

### Zeigarnik Effect
**What it says:** People remember uncompleted tasks better than completed ones,
and feel a persistent pull toward finishing them.

**Mechanism:** An open task creates a kind of cognitive tension — the brain keeps
it active and accessible because it hasn't been resolved. Completing the task
releases that tension. This is why notifications about incomplete profiles,
half-finished onboarding, and abandoned carts work.

**When it applies:** Progress indicators, incomplete profile prompts, onboarding
completion nudges, cart abandonment design, streaks, any place where incompletion
is visible and completion is motivating.

**When it doesn't:** When artificial incompletion is used manipulatively. The
Zeigarnik Effect can be used to create anxiety and compulsive behavior —
recognize the line between motivating and exploitative.

---

## Tier 2: Platform Standards

These apply when the decision involves a specific platform. Always check whether
a decision aligns with or violates established platform conventions.

---

### Apple Human Interface Guidelines (iOS / macOS / iPadOS)

**Clarity**
The interface should remove ambiguity from every interactive element. Text is
readable at every size. Icons are precise and legible. Every element communicates
meaning. If a button doesn't look like a button, it has failed clarity.

Application in rationale: Use when defending decisions that reduce visual clutter,
simplify labels, or make affordances more explicit.

**Deference**
The interface should never compete with the user's content. UI elements recede;
content leads. Design is in service of what the user is trying to do, not
a performance of the product's capabilities.

Application in rationale: Use when defending minimal chrome, reduced ornamentation,
or decisions that prioritize content visibility over interface visibility.

**Depth**
Visual layers and realistic motion convey hierarchy and relationships. Users can
understand the relationship between elements through how they stack, move, and
respond.

Application in rationale: Use when defending layering choices, modal presentation
patterns, transition decisions, or shadow/elevation choices.

**Aesthetic Integrity**
An app's appearance should align with its purpose and tone. A financial services
app should feel precise and trustworthy. A creative tool can afford more
personality. Consistency between visual language and function builds trust.

Application in rationale: Use when defending visual tone choices, especially
against pressure to make something more playful or more formal than it should be.

**Consistency**
Users transfer expectations from every other Apple app they've used. Using
system components and standard patterns reduces the learning cost for every user.
Violating conventions has a cost even if users don't consciously notice it.

Application in rationale: Use when defending decisions to use native components
over custom ones, or when explaining why a non-standard pattern needs strong
justification.

**Direct Manipulation**
Interactions should feel physically immediate. Objects should respond to touch
and gesture in ways that feel natural and continuous. Physics-based animation
reinforces the sense that objects have weight and momentum.

Application in rationale: Use when defending animation choices, gesture
interactions, or touch response design.

---

### Google Material Design

**Material as metaphor**
Surfaces behave like physical material — they have mass, cast shadows, and
respond to light. Elevation communicates hierarchy.

**Bold, graphic, intentional**
Typography, grids, space, scale, and color are used deliberately to create
visual hierarchy and direct attention.

**Motion provides meaning**
Animation describes spatial and temporal relationships, not decoration. Motion
tells the user what just happened and where things went.

Application in rationale: Use when defending elevation hierarchies, type scale
decisions, or transition design on Android or cross-platform products.

---

### Web conventions (no single standard, but widely adopted patterns)

- Top navigation or hamburger menu for global navigation
- Logo top-left, links top-right
- F-pattern and Z-pattern scanning for content layouts
- Footer for secondary links and legal
- Sticky headers for navigation persistence on scroll
- Left-aligned text for body copy in LTR languages
- Blue underlined or visually distinct links
- Form validation on blur (field exit) rather than on submit where possible

Application in rationale: Use when invoking Jakob's Law for web-specific patterns.
These aren't codified like HIG but are widely understood conventions that users
bring expectations about.

---

## Tier 3: Applied Pattern Principles

These are behavioral patterns that play out at specific moments in a product
experience. They're not single named laws — they're clusters of principles
applied to a common design problem.

Reference `examples.md` for real-world cases at each moment type.

---

### Onboarding
Key principle cluster: Paradox of the Active User, Goal-Gradient Effect, Flow,
Cognitive Load, Mental Model

The core tension in onboarding: teach enough that users can succeed without
loading so much instruction that they disengage before seeing value. Good
onboarding is calibrated to the user's current knowledge state and defers
anything the user doesn't need to act right now.

Signs of onboarding principle failure:
- Multiple modals or tooltips on first load (cognitive overload)
- Steps that don't produce visible results (breaks goal-gradient motivation)
- Requesting permissions before demonstrating value (trust hasn't been established)
- Assuming the user read the marketing site (they probably didn't)

---

### Navigation
Key principle cluster: Hick's Law, Jakob's Law, Miller's Law, Mental Model,
Serial Position Effect

Navigation is the user's mental map of the product. When it's wrong — too many
items, unfamiliar labels, inconsistent patterns — users lose their sense of
location and can't build the mental model they need to use the product confidently.

Signs of navigation principle failure:
- More than 7 top-level items without clear hierarchy
- Labels that reflect the product's internal organization rather than user tasks
- Inconsistent navigation patterns across sections of the same product
- Important actions buried deep in a hierarchy that users never explore

---

### Conversion and decision points
Key principle cluster: Hick's Law, Choice Overload, Von Restorff Effect,
Cognitive Bias (anchoring, social proof), Peak-End Rule

Decision points are where users commit — to a plan, a purchase, a sign-up, a
destructive action. The design of these moments has an outsized impact on outcomes.
The principle work here is about reducing friction for the desired action and
ensuring the user has enough context to decide confidently.

Signs of conversion principle failure:
- Multiple equally-weighted CTAs competing for attention
- No visual distinction between primary and secondary actions
- Price or commitment information buried or hard to compare
- No momentum signal at the completion moment (violates Peak-End Rule)

---

### Empty states
Key principle cluster: Paradox of the Active User, Mental Model, Cognitive Load

An empty state is the user's first experience of a feature or section. It's
simultaneously an explanation, an invitation, and a trust signal. Empty states
that just say "nothing here yet" miss all three jobs.

Signs of empty state principle failure:
- No explanation of what the space is for
- No action to fill the space
- Decorative illustration with no functional content
- Missing example content that would help users understand what goes here

---

### Error states and recovery
Key principle cluster: Postel's Law, Cognitive Load, Mental Model, Working Memory

Errors are moments of friction the user didn't choose. The design job is to
minimize the confusion, give a clear path forward, and preserve as much of
the user's work and context as possible.

Signs of error principle failure:
- Error message that describes the system state, not the user's next step
- Form that clears all fields on a validation error
- Error placed far from the element that caused it (violates Law of Proximity)
- Technical language the user can't act on

---

### Notifications and interruptions
Key principle cluster: Selective Attention, Zeigarnik Effect, Cognitive Load,
Goal-Gradient Effect

Notifications compete for attention that the user has allocated elsewhere.
The design question is always: is this worth the interruption cost? And if so,
is it timed to when the user can actually act on it?

Signs of notification principle failure:
- Permission requests before the user has seen enough value to say yes
- Notifications timed to when users can't act on them
- Notification copy that creates anxiety without enabling action
- Too many notification types competing for the same attention channel

---

### Offboarding and cancellation
Key principle cluster: Peak-End Rule, Cognitive Bias (sunk cost, loss aversion),
Zeigarnik Effect

How a product lets users leave shapes how they remember the product and whether
they come back. Cancellation flows that add friction, create guilt, or make it
hard to find the exit create negative memory peaks that affect word-of-mouth
and return rates.

Signs of offboarding principle failure:
- Cancellation steps that require multiple confirmations beyond what's needed
- Language that emphasizes what the user is losing rather than enabling a clean exit
- No acknowledgment of what the user accomplished during their time with the product
- Making it harder to cancel than to sign up
