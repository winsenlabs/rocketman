---
name: rm-build
version: 0.1.0
description: Stage 4 of the Rocketman Track. Turns the board into a work queue and implements ready tasks — solo or by allocating them to a sub-agent fleet under the single-writer rule. Use after /rm-plan, or when the user says "build this", "start implementing", "work the board", or "allocate the tasks".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-build — work the board as a queue

## When to invoke

After `/rm-plan`, or when the user says build / start implementing / work the board / allocate
tasks. The board is a **work queue**: a task is *ready* when it's unassigned and all its
dependency `backlinks` are `done`.

## Conventions

Read `.claude/skills/CONVENTIONS.md` and `PM/CLAUDE.md` — especially the **single-writer rule**.

## Phase 1 — Pick the work

List ready tasks (deps satisfied). If there are many, confirm scope via `AskUserQuestion`.
Respect column WIP limits — don't overload `progress`.

## Phase 2 — Two modes

**Solo** (one or two tasks): move the task to `progress`, implement it, then update the task
(status, `pr`, `activity`) and rebuild.

**Fleet** (many independent ready tasks): act as the **parent/orchestrator**.

- Generate each sub-agent's brief **from its task**: title, summary, acceptance criteria (from
  the linked spec story), `files`, related entities. Use the Agent tool (or a Workflow if the
  user opted into orchestration). Use worktree isolation if sub-agents touch code in parallel.
- **Single-writer rule:** sub-agents *return* structured results; they do **not** write to
  `PM/data`. You, the parent, apply every result one at a time.
- For each completed task, update `col`, `pr`, `owner` (the agent that did it), and append an
  `activity` event recording **which agent** did what. Provenance is the point.

## Phase 3 — Per task

- Make the code change, scoped to the task.
- Update `tasks.json`: `col` (`review` when a PR is up, `done` when merged), `pr {num,status}`,
  append to the task's `activity`.
- Hit a real bug? Branch into **`/rm-debug`**. Made a non-obvious architectural call? Record it
  with **`/rm-decision`**.

## Finish

```bash
rocketman build
```

Commit `PM/data/` + `PM/index.html` with the code. Report Completion Status, then offer
**`/rm-verify`**.
