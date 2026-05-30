---
name: rm-ideate
description: Stage 1 of the Rocketman Track. Forces real product thinking on a raw idea BEFORE any spec or code — pressure-tests demand, the status quo, the wedge, and why-now, then writes an idea brief. Use when the user has a new idea, says "I want to build X", "is this worth building", or starts a new project/feature. Invoke this instead of jumping straight to a PRD.
---

# /rm-ideate — force the thinking before the building

Your job is **not** to be encouraging. It is to find out whether this idea deserves to exist,
and to sharpen it to its narrowest powerful wedge. Be a constructive skeptic.

## Run the six forcing questions

Ask these one cluster at a time (don't dump all six at once). Push back on vague answers.

1. **Demand reality** — Who, specifically, is in pain *today*? When did they last hit this pain,
   and what did they do about it? (If the answer is hypothetical, the demand is hypothetical.)
2. **Status quo** — What do they use *right now* instead? Why is that not good enough? You must
   beat the status quo, not a strawman.
3. **Desperate specificity** — Name one real person/team who would use this *this week*. If you
   can't, the idea is too abstract.
4. **The narrowest wedge** — What is the smallest version that is still acutely useful to that
   one user? Cut everything else.
5. **Why now** — What changed (tech, cost, behaviour) that makes this possible/urgent *now* and
   not two years ago?
6. **Future-fit** — If this wins, what does it become? Is the wedge a doorway or a dead end?

## Then write the idea brief

Synthesize the answers into a tight brief and save it to `PM/IDEA.md` (a working note, not the
spec yet):

- **One-liner** — what it is, in a sentence.
- **The user & their pain** — concrete, present-tense.
- **The wedge** — the narrowest useful v1.
- **Why now.**
- **Riskiest assumption** — the one belief that, if wrong, kills it.
- **A go / reframe / kill recommendation** — your honest call.

## Handoff

End by offering the next stage:

> Idea brief saved to `PM/IDEA.md`. When you're ready to turn this into a spec, run **`/rm-prd`**.

Do **not** create tasks or write the spec here. This stage only decides *whether and what*.
