---
name: rm-build
description: Stage 4 of the Rocketman Track. Turns the board into a work queue and implements ready tasks — solo or by allocating them to a sub-agent fleet under the single-writer rule. Use after /rm-plan, or when the user says "build this", "start implementing", "work the board", or "allocate the tasks".
---

# /rm-build — work the board as a queue

The board is a **work queue**: a task is *ready* when it's unassigned and all its dependency
`backlinks` are `done`. Read `PM/CLAUDE.md` (especially the single-writer rule) first.

## Pick the work

List ready tasks (deps satisfied). Confirm scope with the user if there are many. Respect column
WIP limits — don't overload `progress`.

## Two modes

**Solo** (one or two tasks): move the task to `progress`, implement it in the codebase, then
update the task (status, `pr`, `activity`) and rebuild.

**Fleet** (many independent ready tasks): act as the **parent/orchestrator**.

- Generate each sub-agent's brief **from its task**: title, summary, acceptance criteria (from the
  linked spec story), `files`, and related entities.
- Spawn one sub-agent per task (use the Agent tool, or a Workflow if the user has opted into
  orchestration). Use worktree isolation if sub-agents touch code in parallel.
- **Single-writer rule:** sub-agents *return* structured results; they do **not** write to
  `PM/data`. You, the parent, apply every result to the data one at a time.
- For each completed task, update `col`, `pr`, `owner` (the agent that did it), and append an
  `activity` event recording **which agent** did what (provenance is the point).

## Each implemented task

- Make the code change; keep it scoped to the task.
- Update `tasks.json`: set `col` (`review` when a PR is up, `done` when merged), `pr {num,status}`,
  and append to the task's `activity`.
- If you hit a real bug, branch into **`/rm-debug`** to record the investigation.
- If you make a non-obvious architectural call, record it with **`/rm-decision`**.

## Finish

```bash
node engine/build.mjs
```

Then commit `PM/data/` + `PM/index.html` with the code. Offer **`/rm-verify`** next.
