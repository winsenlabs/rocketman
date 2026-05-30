---
name: rm-brief
version: 0.1.0
description: Read the hub and give a crisp status briefing — what shipped, what's in flight, what's blocked, and what's next. Use when the user asks "where are we", "status", "standup", "what's the state of the project", or "brief me".
allowed-tools:
  - Read
  - Bash
---

# /rm-brief — brief me

## When to invoke

When the user asks where are we / status / standup / state of the project / brief me. This is
**read-only** — never change data.

## Conventions

Read `.claude/skills/CONVENTIONS.md` for voice. Plan-mode-safe (pure read).

## Phase 1 — Pull from the hub

From `PM/data/*.json`:

- **Health & state** — `project.health`, `project.healthLabel`, `project.state`.
- **Milestones** — `burn.milestones[]` with `pct`.
- **In flight** — tasks in `progress` and `review` (id, summary, owner).
- **Blocked** — tasks in `blocked` with `blockedReason` (lead with these).
- **Recently done** — tasks moved to `done` lately (from `activity`).
- **Open decisions** — ADRs with `status:"proposed"`.
- **Live investigations** — debug entries not yet `fixed`.
- **Fleet** — active agents and any open handoffs from `PM/comms` (if present).

## Phase 2 — Deliver

Lead with the one-line state, then:

```
🟢 Health 88 — On track for launch
Milestone: Track & Docs (62%)

In flight (3)
  RM-7  /rm-plan + /rm-build        sonnet
  RM-8  /rm-verify + /rm-test       opus
  RM-10 Diátaxis docs + README      haiku

⛔ Blocked (1)
  RM-9  /rm-launch — waiting on CLI ship hooks (RM-4)

Next up: …
```

Keep it to what a human absorbs in fifteen seconds. End with the single most important next
action and the skill to run for it. Report Completion Status (DONE).
