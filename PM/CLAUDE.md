# PM/ — Conventions for agents (read this first)

This directory is **Rocketman**, the project hub. It is the single source of truth for this
project's spec, board, decisions, debugging trails, and docs. Humans read the rendered hub;
you (an agent) read and edit the structured data underneath.

## The golden rule

> **Edit the data, never the HTML. Then rebuild.**

`PM/index.html` is a **generated, read-only artifact**. Do not hand-edit it — your changes
will be overwritten and you will corrupt it. Edit the JSON in `PM/data/`, then run:

```bash
node engine/build.mjs        # or: rocketman build
```

The build is deterministic: same data in → byte-identical hub out.

## The data (`PM/data/`)

Four files. The build **flat-merges** them into one `#pm-data` island — so top-level keys
must not collide across files.

| File | Top-level keys |
|---|---|
| `core.json` | `project`, `burn`, `people`, `epics`, `labels`, `columns` |
| `tasks.json` | `tasks` |
| `spec.json` | `spec` (`{title, lede, nav[], sections[]}`), `docs` (`{groups[], content{}}`) |
| `content.json` | `adrs`, `debug`, `activity` |

### IDs

Lowercase, kebab, prefixed by type. Allocate the next free number per type.

- Tasks: `rm-01`, `rm-02`, … (display `ref`: `RM-1`)
- ADRs: `adr-01`, … (display `ref`: `ADR-1`)
- Debug: `bug-01`, … (display `ref`: `BUG-1`)
- Epics: `engine`, `track`, … (the object key)
- Spec sections: `vision`, `problem`, … (the section `id`)

### Statuses

- Task `col` (and column order): `backlog` → `progress` → `review` → `done`, plus `blocked`.
  A blocked task sets `blockedReason`.
- ADR `status`: `proposed` · `accepted` · `superseded`.
- Debug `state`: `investigating` · `root-caused` · `fixed` · `monitoring`.
- Hypothesis `status`: `testing` · `confirmed` · `refuted`.

### Owners & provenance

Every task has an `owner` and `author`; every activity event has a `who`. These are **people
ids** from `core.json` `people{}`. People are either `"kind": "human"` (with `av` initials and
a `tone`) or `"kind": "agent"` (with a `model`: `opus` / `sonnet` / `haiku`). Attribute work
honestly — the hub shows human-vs-agent provenance everywhere.

### Backlinks

Relate entities with their bare id in a `backlinks` array. In prose (`state`, task `body`,
spec block `html`), link inline with `[[id|label]]` or `[[id]]`. The hub renders backlinks
bidirectionally ("referenced by") and the doctor checks that every reference resolves.

## Adding or updating an entity

1. Open the right file in `PM/data/`.
2. Add/modify the object, following the shape of the existing entries exactly.
3. Allocate a fresh id; set `owner`/`author`; add `backlinks`.
4. Append a line to the relevant `activity` day group (append-only — see the single-writer rule).
5. Rebuild: `rocketman build`. Fix any doctor warnings before you finish.

> `rocketman new task|adr|debug "Title"` scaffolds a correctly-shaped stub for you.

## The single-writer rule (multi-agent fleets)

When a parent agent allocates work to a fleet of sub-agents (the board is a work queue —
ready = unblocked + unassigned):

- **Sub-agents READ the hub and RETURN structured results.** They do not write to `PM/data`.
- **The parent agent is the SOLE writer** back to `PM/data`, applying results one at a time.
- The **only** thing that may be appended concurrently is the `activity` log (append-only).

This keeps a fleet's output consistent, conflict-free, and reviewable, with provenance intact.

## The Rocketman Track (skills)

Drive idea → production with the skill stack (see `.claude/skills/`):

`/rm-ideate` → `/rm-prd` → `/rm-plan` → `/rm-build` → `/rm-verify` → `/rm-test` →
`/rm-launch` → `/rm-iterate`. Cross-cutting: `/rm-research` (verify the current, correct stack
before building — run before any stack/dependency call). Infra: `/rm-init`, `/rm-sync`,
`/rm-decision`, `/rm-debug`, `/rm-brief`. Multi-agent: `/rm-relay`. Sync-optional: `/rm-mirror`
(Linear / FanDesk / Cheetah / Winsen).

## After any change

Always finish by rebuilding and confirming the doctor is clean:

```bash
node engine/build.mjs        # rebuilds PM/index.html, prints any reference issues
```

Then commit `PM/data/` **and** `PM/index.html` together, alongside your code change.
