# The skill stack — how the Rocketman Track works

Rocketman ships 15 Claude skills in [`.claude/skills/`](../../.claude/skills/). They share a
common structure so any Claude instance behaves predictably across the whole idea → production
track. The structure is adopted from [gstack](https://github.com/garrytan/gstack)'s skill
conventions, trimmed to Rocketman's needs (no external infrastructure).

## What every skill has

- **Frontmatter** — `name`, `version`, a trigger-rich `description`, `allowed-tools`, and
  optional `triggers`. This is what makes the skill discoverable and scoped.
- **"When to invoke"** — the phrases and situations that should fire it, including proactive use.
- **A phased workflow** — explicit `## Phase N` sections with gates, not a wall of prose.
- **A finish step** — always `rocketman build`, then a **Completion Status** (DONE /
  DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT) and a pointer to the next skill.

The rules that don't change per skill live once in
[`.claude/skills/CONVENTIONS.md`](../../.claude/skills/CONVENTIONS.md): plan-mode behavior, the
decision-brief question format, the Completion Status Protocol, and the builder-to-builder voice.
Each skill references it instead of repeating it.

## The guard hook

The data-writing skills declare a `PreToolUse` hook in their frontmatter, and the repo also
wires one globally in [`.claude/settings.json`](../../.claude/settings.json). Both point at
[`.claude/hooks/guard-generated.sh`](../../.claude/hooks/guard-generated.sh), which **blocks any
direct Write/Edit to `PM/index.html`** and tells the agent to edit `PM/data/*.json` and rebuild.
This enforces the golden rule (ADR-2) at the tool level — an agent literally cannot hand-edit the
generated hub.

## The track

```
  Ideate ─▶ PRD ─▶ Plan ─▶ Build ─▶ Verify ─▶ Test ─▶ Launch ─▶ Iterate
```

Plus infra (`/rm-init`, `/rm-sync`, `/rm-decision`, `/rm-debug`, `/rm-brief`), the multi-agent
relay (`/rm-relay`), and the sync-optional mirror (`/rm-mirror`). Each stage reads from and
writes back to the same `PM/` data, so the hub is always current.

## Plan mode

Skills are plan-mode-aware. Read-only and data-shaping work (build, doctor, writing the spec or
plan) is plan-mode-safe. Outward-facing actions (`git push`, `/rm-launch`'s publish step,
`/rm-mirror`'s push to a SaaS tool) defer until the user approves leaving plan mode. The first
`AskUserQuestion` a skill fires is the skill entering plan mode, not a violation.
