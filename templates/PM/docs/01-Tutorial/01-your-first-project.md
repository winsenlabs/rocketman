---
title: Your first Rocketman project
---

# Your first Rocketman project

From nothing to a living project hub in about two minutes.

## 1. Scaffold

In any repo (or an empty folder):

```
npx rocketman init
```

This creates `PM/` (the hub + data + docs), wires the `.claude/` skills and the
generated-file guard hook, and builds `PM/index.html` from the starter data.

## 2. Open the hub

```
open PM/index.html
```

No server, no dependencies. You see nine views: Dashboard, Board, Spec, Roadmap,
Decisions, Debug, Docs, Activity, Fleet.

## 3. Make it yours

Open `PM/data/core.json`, set your `project.name`, `repo`, and `tagline`, then rebuild:

```
rocketman build
```

Refresh the hub — your name is on it.

## 4. The one rule

> **Edit the data, never the HTML. Then rebuild.**

`PM/index.html` is generated. You edit the files under `PM/` and run `rocketman build`.
A guard hook even blocks accidental edits to the HTML.

## What next

- Add work to the board → **How-to → Add a task**
- Write docs (like this page) → **How-to → Add a doc**
- Attach a PDF or image → **How-to → Attach a PDF or image**
- Run the idea → production track → start with `/rm-ideate`
