---
name: rm-plan
version: 0.1.0
description: Stage 3 of the Rocketman Track. Decomposes the PRD into milestones, epics, and a board of ready tasks in PM/data — the "launch track". Use after /rm-prd, or when the user asks to "plan this", "break it into tasks", "lay out the roadmap", or "make a board".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-plan — lay the launch track

## When to invoke

After `/rm-prd`, or when the user asks to plan / break into tasks / lay out the roadmap. Turns
the spec into an executable plan: milestones, epics, and a board of well-shaped tasks.

## Conventions

Read `.claude/skills/CONVENTIONS.md` and `PM/CLAUDE.md`. Work from the current
`PM/data/spec.json`.

## Phase 0 — Research the stack first

Before you bake any tech choice into the plan, run **`/rm-research`** for each stack /
library / API / framework decision. Don't pick from memory — verify the current, correct
version and idiom, and record it as an ADR. A plan built on a stale stack wastes the whole
fleet's tokens downstream.

## Phase 1 — Structure: phases ARE epics (`core.json`)

- **Epics** (`epics{}`) — the major workstreams, each `{name, color}`. **Make each phase of the
  plan an epic.** The Board's swimlanes group by epic, so phase = epic = swimlane. Don't create a
  task whose whole content is "Phase 2" — that's a roadmap card, not work.
- **Milestones** (`burn.milestones[]`) — phased outcomes `{id, name, pct, done, sub}`. These power
  the Roadmap and the dashboard burn-up. Milestones are the timeline; epics are the buckets work
  lives in.

## Phase 2 — Decompose into executable micro-tasks (`tasks.json`)

> **The board is a build queue, not a roadmap.** A phase is not a task. Break every phase/epic
> into the smallest tasks an agent can actually pick up and finish. If a card reads like a heading
> ("Build the API"), it's too big — split it until each task is one shippable change.

For each requirement/story in the spec, derive one or more **granular** tasks. A good task:

- Is **one shippable change** — ~1–4 points, finishable in a single `/rm-build` pass. Prefer many
  small tasks over a few epic-sized ones; the fleet parallelizes small tasks, it chokes on big ones.
- Maps to a requirement — `backlinks` to the spec section / ADR it serves, and to the tasks it
  depends on (so `/rm-build` knows what's *ready* = deps `done`).
- Has a clear one-line `summary` (the AI summary line — this is what shows on the card and in the
  List view; write it so the board is skimmable at a glance).
- Has `epic` (its phase), `owner` (a person id — leave empty for "ready for the fleet"), `labels`,
  `points`, and starts in `col:"backlog"` or `"todo"`. Set `blockedReason` if blocked.

A quick gut check: if your board has ~one card per phase, you wrote a roadmap. Decompose again.

## Phase 3 — Sequence & verify the shape

Order the board so the critical path is obvious; mark the smallest set of tasks that make a
shippable first milestone. Prefer depth-first on the wedge over breadth across nice-to-haves.

After building, **review the plan in the hub, not just the data**:

- **Board** — confirm each epic/phase swimlane is filled with granular tasks, not one big card.
- **List** — the flat, sortable micro-view of every task; the fastest way to scan for cards that
  are still too coarse or missing an owner/epic/points.
- **Dependencies** — confirms what's blocked on other work and flags anything that needs a human
  before the fleet can move.

If the Board shows phase-level cards instead of micro-tasks, that's the signal to decompose
further before handing off to `/rm-build`.

## Finish

```bash
rocketman build
```

Report Completion Status with the count.

> Plan laid: N tasks across M milestones. Open the **Board** and **Roadmap**. Ready to build?
> Run **`/rm-build`** to allocate ready tasks to a fleet.
