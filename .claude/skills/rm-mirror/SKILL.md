---
name: rm-mirror
version: 0.1.0
description: Mirror the Rocketman hub into an external project-management tool — Linear, FanDesk, Jira, Asana, GitHub Projects, or whatever the team uses. Local-first, sync-optional — the repo stays the source of truth and this pushes a read-out into the SaaS tool. Use when the user says "sync to Linear", "push this to FanDesk", "mirror to <tool>", "export the board", or "get this into our PM tool".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-mirror — mirror the hub into an external PM tool

## When to invoke

When the user wants the hub reflected in a SaaS PM tool (Linear / FanDesk / Jira / Asana /
GitHub Projects / etc.). Rocketman stays the **source of truth**; the external tool is a
**mirror** for stakeholders who live there.

## Conventions

Read `.claude/skills/CONVENTIONS.md`. **Plan-mode note:** this pushes to an external service —
outward-facing. Defer the actual push until the user approves; planning the mapping is
plan-mode-safe.

## Phase 1 — Pick the target adapter

Detect the available integration; ask via `AskUserQuestion` if ambiguous.

- **FanDesk** — the `mcp__claude_ai_FanDesk__*` tools (full project/task API).
- **Linear / Jira / GitHub Projects / others** — that tool's MCP server if connected (find it
  with ToolSearch), else its CLI/REST API with a token the user provides.

If no integration is connected, say so and tell the user exactly what to connect, then stop.
Never fabricate a sync.

## Phase 2 — Map the schema

| Rocketman (`PM/data`) | External tool |
|---|---|
| `project` | Project / workspace |
| `columns[]` | Board columns / task statuses |
| `epics{}` · `labels{}` | Epics / labels / groups |
| `tasks[]` | Issues (`summary`→title, `body`→description, `col`→status, `owner`→assignee, `points`→estimate, `backlinks`→relations) |
| `spec.sections[]` + `docs` | Docs / wiki pages |
| `adrs[]` | Decision docs |
| `debug[]` | Linked issues / incident notes |
| `activity` | usually skip — it's the local audit log |

### FanDesk specifics
Project: `create_project` (or reuse via `list_projects`). Columns: `create_task_status` per
`columns[]`, keep order. Tasks: `batch_create_tasks` (map fields above). Comments:
`add_task_comment`. Spec/ADRs/docs: `create_page` + `add_page_to_project`. Relations:
`add_task_relation` for `backlinks`.

## Phase 3 — Idempotency (don't duplicate)

Keep a mapping file `PM/.mirror/<target>.json` of `{ localId: remoteId }`. First run: create +
record ids. Later runs: update existing from the map, create only what's new, optionally archive
remote items whose local task is `done` (ask first). **Never delete remote items automatically.**
Commit the mapping so it travels with the repo.

## Phase 4 — Provenance & direction

Tag mirrored items as Rocketman-managed (label or description footer: "Mirrored from PM/ — edit
in the repo, not here"). Default is **one-way (local → remote)**. To pull changes back, do it
explicitly through the parent/single-writer path: read remote, propose a diff to `PM/data`,
apply on approval, rebuild. Never let two writers race the hub.

## Finish

Report what was created vs updated vs skipped, with links. Append one `activity` event recording
the mirror, then:

```bash
rocketman build
```

Report Completion Status.

> Mirrored N tasks + M docs to <target>. The repo stays the source of truth — re-run to keep
> the mirror current.
