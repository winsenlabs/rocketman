# Your first Rocketman project

This walks you from nothing to a living project hub in about two minutes.

## 1. Scaffold

In any repo (or an empty folder):

```bash
npx rocketman init
```

This creates:

```
PM/
  index.html        # the hub — open this
  CLAUDE.md         # the conventions agents follow
  data/             # the source of truth (core, tasks, spec, content)
.claude/skills/     # the Rocketman Track skills
```

…and builds `PM/index.html` from the starter data.

## 2. Open the hub

```bash
open PM/index.html        # macOS — or just double-click it
```

No server, no dependencies. You'll see the eight views: Dashboard, Board, Spec, Roadmap,
Decisions, Debug, Docs, Activity.

## 3. Make it yours

Open `PM/data/core.json` and set your `project.name`, `repo`, and `tagline`. Then rebuild:

```bash
npx rocketman build
```

Refresh the hub — your name is on it.

## 4. Run the track

The fastest way to fill the hub is to let the skill stack do it (in Claude Code):

```
/rm-ideate     # forces the product thinking, writes an idea brief
/rm-prd        # turns the brief into a real spec (the Spec view fills in)
/rm-plan       # breaks the spec into a board of tasks
/rm-build      # starts working the board
```

Each stage writes back to `PM/data` and rebuilds the hub, so it's always current.

## 5. Commit it

```bash
git add PM/ .claude/
git commit -m "Add Rocketman project hub"
```

Now your project management lives in the repo — it branches, reviews, and merges with your code.

## The one rule

> **Edit the data, never the HTML. Then rebuild.**

`PM/index.html` is generated. Edit `PM/data/*.json` and run `rocketman build`. That's the whole
workflow. See [`PM/CLAUDE.md`](../../PM/CLAUDE.md) for the full conventions.
