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

## Phase 1 — Structure (`core.json`)

- **Epics** (`epics{}`) — the major workstreams, each `{name, color}`.
- **Milestones** (`burn.milestones[]`) — phased outcomes `{id, name, pct, done, sub}`. These
  power the roadmap and the dashboard burn-up.

## Phase 2 — Tasks (`tasks.json`)

For each requirement/story, create one or more tasks. A good task:

- Maps to a requirement — `backlinks` to the spec section / ADR it serves.
- Is vertically sliced and shippable, ~1–8 points.
- Has a clear `summary` (the AI summary line — write it so the board is skimmable at a glance).
- Has `owner` (person id, may be an agent), `epic`, `labels`, `points`.
- Starts in `col:"backlog"` or `"todo"`; set `blockedReason` if blocked.
- Encodes dependencies via `backlinks` so `/rm-build` knows what's *ready* (deps done).

## Phase 3 — Sequence

Order the board so the critical path is obvious. Mark the smallest set of tasks that make a
shippable first milestone. Prefer depth-first on the wedge over breadth across nice-to-haves.

## Finish

```bash
rocketman build
```

Report Completion Status with the count.

> Plan laid: N tasks across M milestones. Open the **Board** and **Roadmap**. Ready to build?
> Run **`/rm-build`** to allocate ready tasks to a fleet.
