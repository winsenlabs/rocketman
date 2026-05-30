---
name: rm-iterate
version: 0.1.0
description: Stage 8 of the Rocketman Track. Captures post-launch changes — feedback, bugs, tweaks, enhancements — as new tasks and changelog entries, closing the idea→production→iterate loop. Use after a launch when handling feedback, modifications, fixes, or "what's next".
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

# /rm-iterate — close the loop

## When to invoke

After a launch, when handling feedback, modifications, fixes, or "what's next". A launch is the
start of the iterate loop, not the end.

## Conventions

Read `.claude/skills/CONVENTIONS.md`.

## Phase 1 — Triage incoming change

For each piece of feedback, bug, or tweak:

- **Bug** → a `debug` entry (or **`/rm-debug`**) plus a fix task.
- **Enhancement / tweak** → a task (`rocketman new task`), `backlinks` to the spec section it
  touches.
- **Direction change** → update the spec section; if it reverses a prior call, record a
  superseding ADR with **`/rm-decision`**.

Set owners, points, column. Slot fixes ahead of enhancements.

## Phase 2 — Keep the record straight

- Update `CHANGELOG.md` under `[Unreleased]` as changes land.
- Refresh `project.state` and `metrics` on the dashboard so it reflects the live product.
- Append `activity` events with provenance.

## Phase 3 — Re-enter the track

Iteration is the track again at smaller scope. For a batch, run **`/rm-plan`**; for a single
fix, go straight to **`/rm-build`**.

## Finish

```bash
rocketman build
```

Report Completion Status.

> Captured. The hub reflects the live product. Run **`/rm-build`** to work the new items, or
> **`/rm-brief`** for a status read-out.
