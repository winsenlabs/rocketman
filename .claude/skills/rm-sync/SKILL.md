---
name: rm-sync
version: 0.1.0
description: Rebuild the hub from data and reconcile it with the repo — scan recent commits for task refs, advance statuses, flag stale links, and refresh the dashboard. Use when the user says "sync the hub", "rebuild", "update the board from git", or after a batch of commits/PRs.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-sync — reconcile the hub with reality

## When to invoke

When the user says sync the hub / rebuild / update the board from git, or after a batch of
commits or PRs.

## Conventions

Read `.claude/skills/CONVENTIONS.md`. You are the single writer here.

## Phase 1 — Scan git

Read recent commits/PRs (`git log`, `gh pr list`). For messages referencing a task (`RM-7`,
`[rm-07]`, `#PR`), update that task: advance `col` (merged PR → `review`/`done`), set/refresh
`pr {num,status}`, append an `activity` event with the author as `who`.

## Phase 2 — Check links

Flag tasks whose `files[]` no longer exist and any `backlinks` that don't resolve
(`rocketman doctor`).

## Phase 3 — Refresh the dashboard

Update `project.state` (the AI summary), `metrics`, `kpis`, and milestone `pct` in `core.json`
to match the current board. Update `project.synced`.

## Finish

```bash
rocketman build
```

Don't invent status changes — only reflect what git/PR state actually shows. Leave a clean
doctor. Commit `PM/data/` + `PM/index.html`. Report Completion Status.

> Synced. Open the **Dashboard** and **Activity**.
