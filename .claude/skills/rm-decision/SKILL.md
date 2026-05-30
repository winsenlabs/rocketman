---
name: rm-decision
version: 0.1.0
description: Record an architecture/product decision as an ADR in PM/data/content.json. Use when a non-obvious choice is made, a trade-off is settled, or the user says "record a decision", "write an ADR", "we decided to…", or reverses an earlier call.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-decision — record an ADR

## When to invoke

When a non-obvious choice is made, a trade-off is settled, or the user says record a decision /
write an ADR / "we decided to…" / reverses an earlier call. Capture decisions where the
*reasoning* matters, so future readers don't relitigate them.

## Conventions

Read `.claude/skills/CONVENTIONS.md` and `PM/CLAUDE.md`. ADRs are append-mostly — add new ones,
supersede old ones, never quietly rewrite.

## Phase 1 — Add the ADR

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

## Phase 2 — Supersede (if reversing)

Set the old ADR's `status` to `superseded`, add it to this ADR's `backlinks`, and reference the
new one back. Never delete the old decision — the trail is the value. `status`: `proposed` ·
`accepted` · `superseded`.

## Finish

```bash
rocketman build
```

Report Completion Status.

> Recorded <ADR>. It's in the **Decisions** view, linked from everything that references it.
