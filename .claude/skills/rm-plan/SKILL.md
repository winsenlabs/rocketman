---
name: rm-plan
description: Stage 3 of the Rocketman Track. Decomposes the PRD into milestones, epics, and a board of ready tasks in PM/data — the "launch track". Use after /rm-prd, or when the user asks to "plan this", "break it into tasks", "lay out the roadmap", or "make a board".
---

# /rm-plan — lay the launch track

Turn the spec into an executable plan: milestones, epics, and a board of well-shaped tasks.
Read `PM/CLAUDE.md` and the current `PM/data/spec.json`.

## Define structure (in `core.json`)

- **Epics** (`epics{}`) — the major workstreams (give each a `name` + `color`).
- **Milestones** (`burn.milestones[]`) — phased outcomes with `id`, `name`, `pct`, `done`, `sub`
  (e.g. a target date or label). These power the roadmap and dashboard burn-up.

## Break into tasks (in `tasks.json`)

For each requirement/story in the spec, create one or more tasks. A good task:

- Maps to a requirement — link it with `backlinks` to the spec section / ADR it serves.
- Is **vertically sliced** and shippable, ~1–8 points.
- Has a clear `summary` (the AI summary line — write it so the board is skimmable).
- Has an `owner` (a person id; may be an agent), an `epic`, `labels`, and `points`.
- Starts in `col: "backlog"` or `"todo"`; set `blockedReason` if blocked.
- Encodes dependencies via `backlinks` so the builder knows what's *ready* (deps done).

## Sequence

Order the board so the critical path is obvious. Mark the smallest set of tasks that constitute a
shippable first milestone. Prefer depth-first on the wedge over breadth across nice-to-haves.

## Finish

```bash
node engine/build.mjs
```

> Plan laid: N tasks across M milestones. Open the **Board** and **Roadmap** views. Ready to
> build? Run **`/rm-build`** to allocate ready tasks to a fleet.
