---
title: Data schema
---

# Data schema

Four JSON files under `PM/data/` merge — flat — into one `#pm-data` island that the hub
reads at runtime. Top-level keys must not collide across files.

| File | Top-level keys |
|---|---|
| `core.json` | `project`, `burn`, `people`, `epics`, `labels`, `columns` |
| `tasks.json` | `tasks` |
| `spec.json` | `spec` (`{title, lede, nav[], sections[]}`), `docs` (fallback if no `PM/docs/`) |
| `content.json` | `adrs`, `debug`, `activity` |

Plus two directories the build folds in:

- `PM/docs/**/*.md` → the **Docs** view (supersedes `spec.json` `docs`).
- `PM/comms/{agents,messages,acks}/*.json` → the **Fleet** view (the agent relay).
- `PM/files/` → assets (PDF/images) embedded into docs as data URIs.

## IDs

Lowercase, kebab, prefixed by type. Allocate the next free number per type.

- Tasks: `rm-01` … (display `ref`: `RM-1`)
- ADRs: `adr-01` … (display `ref`: `ADR-1`)
- Debug: `bug-01` … (display `ref`: `BUG-1`)
- Epics: the object key (`engine`, `track`)
- Spec sections: the section `id` (`vision`, `problem`)

## People & provenance

`core.json` `people{}` maps an id to `{ name, kind, ... }`. `kind` is `human` (with `av`
initials and a `tone`) or `agent` (with a `model`: `opus` / `sonnet` / `haiku`). Every
task `owner`/`author` and activity `who` is one of these ids — that's how the hub shows
human-vs-agent provenance everywhere.

## Backlinks

Relate entities with their bare id in a `backlinks` array, or inline in prose with
`[[id|label]]`. The hub renders them bidirectionally ("referenced by") and the doctor
checks every reference resolves.
