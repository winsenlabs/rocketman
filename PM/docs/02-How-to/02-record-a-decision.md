---
title: Record a decision (ADR)
---

# Record a decision (ADR)

Capture decisions where the *reasoning* matters, so nobody relitigates them later. ADRs
live in `PM/data/content.json` under `adrs[]` and render in the **Decisions** view.

## The fast way

```
rocketman new adr "Use a file bus for the agent relay"
rocketman build
```

Or run the **`/rm-decision`** skill, which walks you through it.

## The shape

```
{
  "id": "adr-09", "ref": "ADR-9", "title": "...", "status": "accepted",
  "date": "2026-05-30", "author": "tejas",
  "summary": "one line — what was decided",
  "context": "the forces and constraints in play",
  "options": [
    { "text": "Option A", "chosen": false },
    { "text": "Option B", "chosen": true }
  ],
  "decision": "what we chose and the rule going forward",
  "consequences": "what this makes easy, hard, or commits us to",
  "backlinks": ["rm-13"]
}
```

## Superseding an old decision

Decisions are append-mostly — you don't rewrite them. When a new ADR reverses an old one:

1. Set the old ADR's `status` to `superseded`.
2. Add the old id to the new ADR's `backlinks`, and reference the new one back.

`status` is one of: `proposed` · `accepted` · `superseded`. The Decisions view shows the
supersede chain so the trail stays intact. Then `rocketman build`.
