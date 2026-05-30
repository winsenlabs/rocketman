---
name: rm-mirror
description: Mirror the Rocketman hub into an external project-management tool — Linear, FanDesk, Cheetah, Winsen, Jira, GitHub Projects, or whatever the team uses. Local-first, sync-optional: the repo stays the source of truth and this pushes a read-out into the SaaS tool. Use when the user says "sync to Linear", "push this to FanDesk", "mirror to <tool>", "export the board", or "get this into our PM tool".
---

# /rm-mirror — mirror the hub into an external PM tool

Rocketman is the **source of truth**; the external tool is a **mirror** for stakeholders who live
there. This skill projects `PM/data` into a target PM tool, idempotently, in one direction
(local → remote) by default.

Read `PM/data/*.json` (the local truth) before doing anything.

## 1. Pick the target adapter

Detect which integration is available and ask the user if ambiguous:

- **FanDesk** — use the `mcp__claude_ai_FanDesk__*` tools (full project/task API; see mapping below).
- **Linear / Jira / GitHub Projects / Cheetah / Winsen** — use that tool's MCP server if connected
  (search for it with ToolSearch), else its CLI/REST API with a token the user provides.

If no integration is connected, say so and tell the user exactly what to connect (which MCP server
or API token), then stop. Never fabricate a sync.

## 2. Map the schema

Rocketman → generic PM concepts:

| Rocketman (`PM/data`) | External tool |
|---|---|
| `project` | Project / workspace |
| `columns[]` | Board columns / task statuses |
| `epics{}` | Epics / labels / groups |
| `labels{}` | Labels / tags |
| `tasks[]` | Issues / tasks (`summary`→title, `body`→description, `col`→status, `owner`→assignee, `points`→estimate, `labels`, `backlinks`→relations) |
| `spec.sections[]` + `docs` | Docs / wiki pages |
| `adrs[]` | Decision docs / pages |
| `debug[]` | Linked issues / incident notes |
| `activity` | (usually skip — it's the local audit log) |

### FanDesk specifics

- Project: `create_project` (or reuse via `list_projects`).
- Columns: `create_task_status` for each `columns[]` entry; keep the order.
- Epics/labels: `create_project_label` / `create_custom_field` as needed.
- Tasks: `batch_create_tasks` (map fields above); set status via the created statuses; assignees via
  `add_project_member` + the task `owner`.
- Comments: `add_task_comment` for each task `comment`.
- Spec/ADRs/docs: `create_page` (or `create_document`) per section, linked with `add_page_to_project`.
- Relations: `add_task_relation` for `backlinks` between tasks.

## 3. Idempotency (don't duplicate)

Maintain a mapping file `PM/.mirror/<target>.json` of `{ localId: remoteId }`.

- First run: create remote objects, record their ids.
- Later runs: **update** existing remote objects from the map; only create what's new; optionally
  archive remote items whose local task is `done` (ask first).
- Never delete remote items automatically.

Commit `PM/.mirror/<target>.json` so the mapping travels with the repo.

## 4. Provenance & direction

- Tag mirrored items as Rocketman-managed (e.g. a label or a description footer:
  "Mirrored from PM/ — edit in the repo, not here").
- Default is **one-way (local → remote)**. If the user wants changes pulled back, do it explicitly
  and through the parent/single-writer path: read remote, propose a diff to `PM/data`, apply on
  approval, rebuild. Never let two writers race the hub.

## 5. Finish

Report what was created vs updated vs skipped, with links to the remote items. Append one
`activity` event to `content.json` recording the mirror, then:

```bash
node engine/build.mjs
```

> Mirrored N tasks + M docs to <target>. The repo stays the source of truth — re-run `/rm-mirror`
> after changes to keep the mirror current.
