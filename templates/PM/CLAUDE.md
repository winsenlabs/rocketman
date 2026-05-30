# PM/ — Conventions for agents (read this first)

This directory is **Rocketman**, the project hub — the single source of truth for this project's
spec, board, decisions, debugging trails, and docs. Humans read the rendered hub; agents read and
edit the structured data underneath.

## The golden rule

> **Edit the data, never the HTML. Then rebuild.**

`PM/index.html` is generated and read-only. Edit the JSON in `PM/data/`, then run:

```bash
npx rocketman build      # or: node engine/build.mjs
```

## The data (`PM/data/`)

Four files, flat-merged into one `#pm-data` island (top-level keys must not collide):

| File | Top-level keys |
|---|---|
| `core.json` | `project`, `burn`, `people`, `epics`, `labels`, `columns` |
| `tasks.json` | `tasks` |
| `spec.json` | `spec` (`{title, lede, nav[], sections[]}`), `docs` |
| `content.json` | `adrs`, `debug`, `activity` |

- **IDs:** lowercase kebab, prefixed: `rm-01` (tasks), `adr-01`, `bug-01`. Display `ref`: `RM-1`.
- **Task `col`:** `backlog` → `progress` → `review` → `done`, plus `blocked` (+ `blockedReason`).
- **Owners** are person ids from `core.json` `people{}` — `kind: "human"` or `kind: "agent"`.
- **Backlinks:** relate entities with `backlinks: ["id"]`; link inline in prose with `[[id|label]]`.

`rocketman new task|adr|debug "Title"` scaffolds a correctly-shaped stub.

## The single-writer rule (agent fleets)

When a parent agent allocates work to sub-agents: sub-agents **read and return results**; the
**parent is the sole writer** to `PM/data`. Only the `activity` log and the `PM/comms/` relay are
append-/per-file and safe for concurrent writes.

## The Rocketman Track (skills)

`/rm-ideate` → `/rm-prd` → `/rm-plan` → `/rm-build` → `/rm-verify` → `/rm-test` → `/rm-launch` →
`/rm-iterate`. Infra: `/rm-init`, `/rm-sync`, `/rm-decision`, `/rm-debug`, `/rm-brief`.
Multi-agent: `/rm-relay` (handoffs + messages). Sync-optional: `/rm-mirror`.

## After any change

Rebuild, confirm the doctor is clean, and commit `PM/data/` **and** `PM/index.html` together with
your code change.
