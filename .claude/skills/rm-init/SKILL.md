---
name: rm-init
description: Scaffold the Rocketman hub into a repo — creates PM/ (data + CLAUDE.md), the skill stack, and the first built index.html. Use when starting Rocketman in a new or existing repo, or when the user says "set up rocketman", "init the hub", or "add a PM hub here".
---

# /rm-init — scaffold the hub

Set up Rocketman in the current repo.

## Steps

1. Run the CLI if installed:
   ```bash
   npx rocketman init        # copies PM/ + .claude/skills, then builds
   ```
   Otherwise copy `templates/PM/` → `PM/` and `.claude/skills/` from the Rocketman package, then
   `node engine/build.mjs`.

2. Personalize `PM/data/core.json`: set `project.name`, `repo`, `tagline`, and the `people{}`
   (the humans and which agent models work on this repo).

3. Add `.gitattributes` so the generated hub collapses in diffs:
   ```
   PM/index.html linguist-generated=true -diff
   ```

4. Open `PM/index.html` to confirm it renders, then commit `PM/` and `.claude/`.

## Then

> Hub scaffolded. Got an idea to spec out? Start the track with **`/rm-ideate`**. Already have a
> plan? Jump to **`/rm-plan`**.

Always point the user at `PM/CLAUDE.md` — it's the conventions every agent follows here.
