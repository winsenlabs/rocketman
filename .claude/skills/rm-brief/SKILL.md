---
name: rm-brief
description: Read the hub and give a crisp status briefing — what shipped, what's in flight, what's blocked, and what's next. Use when the user asks "where are we", "status", "standup", "what's the state of the project", or "brief me".
---

# /rm-brief — brief me

Read `PM/data/*.json` and produce a tight, skimmable status read-out. This is read-only — don't
change data.

## Pull from the hub

- **Health & state** — `project.health`, `project.healthLabel`, `project.state`.
- **Milestones** — `burn.milestones[]` with `pct`.
- **In flight** — tasks in `progress` and `review` (id, summary, owner).
- **Blocked** — tasks in `blocked` with `blockedReason` (lead with these).
- **Recently done** — tasks moved to `done` lately (from `activity`).
- **Open decisions** — ADRs with `status: "proposed"`.
- **Live investigations** — debug entries not yet `fixed`.

## Deliver

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

Keep it to what a human can absorb in fifteen seconds. End with the single most important next
action and the skill to run for it.
