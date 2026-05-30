---
name: rm-init
version: 0.1.0
description: Scaffold the Rocketman hub into a repo — creates PM/ (data + CLAUDE.md), the skill stack, and the first built index.html. Use when starting Rocketman in a new or existing repo, or when the user says "set up rocketman", "init the hub", or "add a PM hub here".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
---

# /rm-init — scaffold the hub

## When to invoke

When starting Rocketman in a repo, or the user says set up rocketman / init the hub / add a PM
hub here.

## Conventions

Read `.claude/skills/CONVENTIONS.md`.

## Phase 1 — Scaffold

```bash
npx @winsendotai/rocketman init        # copies PM/ + .claude/skills, then builds
```

If the CLI isn't installed, copy `templates/PM/` → `PM/` and `.claude/skills/` from the
Rocketman package, then `rocketman build`.

## Phase 2 — Personalize

Edit `PM/data/core.json`: `project.name`, `repo`, `tagline`, and `people{}` (the humans and
which agent models work on this repo).

## Phase 3 — Wire git

Add to `.gitattributes` so the generated hub collapses in diffs:

```
PM/index.html linguist-generated=true -diff
```

Open `PM/index.html` to confirm it renders, then commit `PM/` and `.claude/`.

## Finish

Point the user at `PM/CLAUDE.md` — the conventions every agent follows here. Report Completion
Status (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT).

> Hub scaffolded. Got an idea to spec out? Start the track with **`/rm-ideate`**. Already have a
> plan? Jump to **`/rm-plan`**.
