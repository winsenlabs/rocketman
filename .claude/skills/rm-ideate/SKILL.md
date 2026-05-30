---
name: rm-ideate
version: 0.1.0
description: Stage 1 of the Rocketman Track. Forces real product thinking on a raw idea BEFORE any spec or code — pressure-tests demand, the status quo, the wedge, and why-now, then writes an idea brief. Use when the user has a new idea, says "I want to build X", "is this worth building", or starts a new project/feature. Invoke this instead of jumping straight to a PRD.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - WebSearch
triggers:
  - i have an idea
  - is this worth building
  - i want to build
  - new project
  - new feature
---

# /rm-ideate — force the thinking before the building

## When to invoke

When the user floats a new idea, asks "is this worth building", or starts a project or
feature. Proactively invoke this (don't answer directly) when someone describes a product
that doesn't exist yet. Your job is **not** to be encouraging — it's to find out whether the
idea deserves to exist and to sharpen it to its narrowest powerful wedge.

## Conventions

Read `.claude/skills/CONVENTIONS.md` once this session (plan mode, voice, completion status).
This stage is plan-mode-safe: it only writes a working note (`PM/IDEA.md`), no spec, no tasks.

## Phase 1 — The six forcing questions

Ask one cluster at a time via `AskUserQuestion`. Push back on vague answers; a hypothetical
answer means hypothetical demand.

1. **Demand reality** — Who is in pain *today*? When did they last hit it, and what did they do?
2. **Status quo** — What do they use *right now* instead? Why isn't it good enough? Beat the
   real alternative, not a strawman.
3. **Desperate specificity** — Name one real person/team who'd use this *this week*. If you
   can't, it's too abstract.
4. **Narrowest wedge** — The smallest version still acutely useful to that one user. Cut the rest.
5. **Why now** — What changed (tech, cost, behavior) that makes this possible/urgent now?
6. **Future-fit** — If it wins, what does it become? Doorway or dead end?

## Phase 2 — Write the idea brief

Synthesize into `PM/IDEA.md` (a working note, not the spec):

- **One-liner** — what it is, in a sentence.
- **The user & their pain** — concrete, present-tense.
- **The wedge** — the narrowest useful v1.
- **Why now.**
- **Riskiest assumption** — the one belief that, if wrong, kills it.
- **Recommendation** — your honest go / reframe / kill call.

## Finish

Do NOT create tasks or write the spec here — this stage decides *whether and what*.

> Idea brief saved to `PM/IDEA.md`. Ready to turn it into a spec? Run **`/rm-prd`**.

Report Completion Status (DONE with the brief, or BLOCKED if the idea can't survive the
questions and the user should rethink).
