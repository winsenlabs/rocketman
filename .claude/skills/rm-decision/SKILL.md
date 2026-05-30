---
name: rm-decision
description: Record an architecture/product decision as an ADR in PM/data/content.json. Use when a non-obvious choice is made, a trade-off is settled, or the user says "record a decision", "write an ADR", "we decided to…", or reverses an earlier call.
---

# /rm-decision — record an ADR

Capture decisions where the *reasoning* matters, so future readers (and agents) don't relitigate
them. ADRs are append-mostly: you add new ones and supersede old ones, you don't quietly rewrite.

## Add the ADR

Append to `adrs[]` in `PM/data/content.json` with the next id (`adr-NN`):

```json
{
  "id": "adr-08", "ref": "ADR-8", "title": "…", "status": "accepted",
  "date": "YYYY-MM-DD", "author": "<person id>",
  "summary": "one line — what was decided",
  "context": "the forces and constraints in play",
  "options": [ { "text": "option A", "chosen": false }, { "text": "option B", "chosen": true } ],
  "decision": "what we chose and the rule going forward",
  "consequences": "what this makes easy, hard, or commits us to",
  "backlinks": ["<related task/adr ids>"]
}
```

## Superseding

If this reverses a prior ADR: set the old one's `status` to `superseded`, add it to this ADR's
`backlinks`, and reference the new one back. Never delete the old decision — the trail is the value.

`status`: `proposed` (not yet agreed) · `accepted` · `superseded`.

## Finish

```bash
node engine/build.mjs
```

> Recorded <ADR>. It's in the **Decisions** view, linked from everything that references it.
