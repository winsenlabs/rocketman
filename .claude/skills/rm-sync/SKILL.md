---
name: rm-sync
description: Rebuild the hub from data and reconcile it with the repo — scan recent commits for task refs, advance statuses, flag stale links, and refresh the dashboard. Use when the user says "sync the hub", "rebuild", "update the board from git", or after a batch of commits/PRs.
---

# /rm-sync — reconcile the hub with reality

Keep the hub current with what actually happened in the repo.

## Steps

1. **Scan git** — read recent commits/PRs (`git log`, `gh pr list`). For messages referencing a
   task (`RM-7`, `[rm-07]`, `#PR`), update that task: advance `col` (merged PR → `review`/`done`),
   set/refresh `pr {num,status}`, and append an `activity` event with the author as `who`.
2. **Check links** — flag tasks whose `files[]` no longer exist, and any `backlinks` that don't
   resolve (run `node bin/rocketman.mjs doctor`).
3. **Refresh the dashboard** — update `project.state` (the AI summary), `metrics`, `kpis`, and the
   milestone `pct` in `core.json` to match the current board. Update `project.synced`.
4. **Rebuild**:
   ```bash
   node engine/build.mjs
   ```

## Rules

- Respect the single-writer rule: you are the one writer here.
- Don't invent status changes — only reflect what git/PR state actually shows.
- Leave a clean doctor. Commit `PM/data/` + `PM/index.html`.

> Synced. Open the **Dashboard** and **Activity** views to see the latest.
