---
title: Add a task
---

# Add a task

Tasks are the board. They live in `PM/data/tasks.json`.

## The fast way

```
rocketman new task "Wire the billing webhook"
rocketman build
```

This appends a correctly-shaped task stub with the next free id (`rm-13`, `rm-14`, …).
Open `PM/data/tasks.json`, fill in the fields, and rebuild.

## By hand

Add an object to the `tasks` array:

```
{
  "id": "rm-14", "ref": "RM-14", "col": "todo", "epic": "engine",
  "owner": "opus", "author": "tejas",
  "title": "Wire the billing webhook",
  "summary": "One scannable line — this is what shows on the card.",
  "labels": ["engine"], "points": 3,
  "body": "<p>The full description, HTML.</p>",
  "backlinks": ["adr-05"], "comments": [], "activity": []
}
```

## Fields that matter

| Field | What it does |
|---|---|
| `col` | Which column: `backlog` · `todo` · `progress` · `review` · `done` · `blocked` |
| `summary` | The one-line AI summary shown on the card — write it so the board is skimmable |
| `owner` | A person id from `core.json` `people{}` (human or agent) |
| `backlinks` | Related ids (`adr-05`, `rm-07`) — render as links + bidirectional "referenced by" |
| `blockedReason` | Set this when `col` is `blocked` |
| `pr` | `{ "num": 31, "status": "open\|review\|merged\|draft" }` |

Then `rocketman build`. The doctor will warn if a `backlink` or `owner` doesn't resolve.
