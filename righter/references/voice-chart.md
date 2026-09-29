# Voice chart

Read this when someone asks to define, document, or audit a brand voice. Skip it for ordinary copy reviews.

A voice chart turns a vague brand feel into rules a writer can follow. It lists three to five voice concepts, what each one means in practice, and what it looks like in real copy.

If no voice is defined, Righter's principles are the default voice: plain, active, present tense, no weakeners.

## How to fill it in

1. Pick 3 to 5 voice concepts. Each is one word or short phrase, such as "plain" or "encouraging". Three sharp concepts beat five blurry ones.
2. For each concept, write two or three characteristics. Describe behavior, not feeling. "Uses the shortest word that's still exact" is a characteristic. "Feels friendly" isn't.
3. Add a "we do" example and a "we don't" example. Use real UI copy for both. The "we don't" example has to be something the team would write on a bad day.
4. Fill in the tone table. Voice stays constant across states. Tone is what shifts (see `references/tone.md`).
5. Check every example against the principles. A voice chart that breaks `eliminate-weakeners` or `no-em-dashes` in its own examples has a problem.

## Template

| Voice concept | Characteristics | We do | We don't |
|---|---|---|---|
| [Concept 1] | [2 to 3 behaviors] | "[real copy]" | "[real copy]" |
| [Concept 2] | [2 to 3 behaviors] | "[real copy]" | "[real copy]" |
| [Concept 3] | [2 to 3 behaviors] | "[real copy]" | "[real copy]" |

### Tone across user states

| State | How the voice shifts | Example |
|---|---|---|
| Frustrated | | |
| Confused | | |
| Confident | | |
| Cautious | | |
| Successful | | |

The five states come from `references/tone.md`.

## Worked example

A fictional product: Fernway, a trip-planning app for small groups. Not a real company.

| Voice concept | Characteristics | We do | We don't |
|---|---|---|---|
| Plain | Shortest exact word. One idea per sentence. No trip jargon. | "Pick a date." | "Select your preferred travel window." |
| Encouraging | Points at progress. Never scolds. | "Two people have voted. One to go." | "You haven't voted yet." |
| Steady | Calm when plans change. States facts first. | "The hotel is full. Here are three nearby." | "Bad news! Your hotel fell through!" |

### Fernway tone across user states

| State | How the voice shifts | Example |
|---|---|---|
| Frustrated | Steady leads. Facts, then a fix. | "The flight changed. Check the new time." |
| Confused | Plain leads. One step at a time. | "Step 1 of 3. Name your trip." |
| Confident | Shortest form. | "Add stop" |
| Cautious | Steady leads. Consequence in plain words. | "Removing Ana deletes her votes. You can add her back." |
| Successful | Encouraging leads. Proportional. | "Trip shared" |

## Auditing an existing voice

To audit copy against a voice chart:
1. Take a sample of 10 to 20 strings across error, empty, confirmation, and label surfaces.
2. Mark each string with the concept it follows or breaks.
3. Report which concepts hold and which slip. Give one rewrite per slip.
4. Run the normal Righter review on each rewrite. The voice never overrides a principle.
