---
name: rm-iterate
description: Stage 8 of the Rocketman Track. Captures post-launch changes — feedback, bugs, tweaks, enhancements — as new tasks and changelog entries, closing the idea→production→iterate loop. Use after a launch when handling feedback, modifications, fixes, or "what's next".
---

# /rm-iterate — close the loop

A launch is not the end; it's the start of the iterate loop. This stage keeps the hub honest as
the product changes after shipping.

## Triage incoming change

For each piece of feedback, bug report, or requested tweak:

- **Bug** → create a `debug` entry (or use **`/rm-debug`**) and a fix task.
- **Enhancement / tweak** → create a task in `tasks.json` (`/rm-task` or `rocketman new task`),
  linked with `backlinks` to the spec section it touches.
- **Direction change** → update the relevant spec section and, if it reverses a prior call,
  record a superseding ADR with **`/rm-decision`**.

Set owners, points, and column. Slot fixes ahead of enhancements on the board.

## Keep the record straight

- Update `CHANGELOG.md` under `[Unreleased]` as changes land.
- Refresh `project.state` and `metrics` on the dashboard so it reflects the live product.
- Append `activity` events with provenance.

## Re-enter the track

Iteration is just the track again at smaller scope: plan → build → verify → test → launch. For a
batch of changes, run **`/rm-plan`** to organize them; for a single fix, go straight to
**`/rm-build`**.

```bash
node engine/build.mjs
```

> Captured. The hub reflects the live product. Run **`/rm-build`** to work the new items, or
> **`/rm-brief`** for a status read-out.
