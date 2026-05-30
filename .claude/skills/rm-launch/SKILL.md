---
name: rm-launch
version: 0.1.0
description: Stage 7 of the Rocketman Track. Ships a milestone to production — finalizes the changelog, bumps the version, tags, and updates the hub. Use when verified + human-tested work is ready to release, or the user says "launch", "ship it", "cut a release", or "go live".
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

# /rm-launch — ship it

## When to invoke

When verified + human-tested work is ready to release, or the user says launch / ship it / cut
a release / go live.

## Conventions

Read `.claude/skills/CONVENTIONS.md`. **Plan-mode note:** the version/changelog/hub edits are
plan-mode-safe; the actual `git tag`, `push`, release, and `npm publish` are outward-facing —
defer those until the user has approved leaving plan mode.

## Phase 1 — Pre-flight

- `/rm-verify` passed and the milestone's critical tasks are human-tested.
- `rocketman check` passes (hub not stale).
- Working tree clean apart from the release.

## Phase 2 — Release

1. **Version** — bump `VERSION` and `package.json` per semver (the milestone's scope decides
   major/minor/patch).
2. **Changelog** — move `[Unreleased]` items into a new dated version section in `CHANGELOG.md`.
   Write it for a *reader*: lead with user-facing impact, group Added/Changed/Fixed.
3. **Hub** — in `core.json`, set `project.version`, mark the milestone `done:true`/`pct:100`,
   refresh `project.state`, append a launch `activity` event. Rebuild.
4. **Commit & tag** — commit `PM/` with the release; tag `vX.Y.Z`.
5. **Publish** — push, open/merge the release PR, create the release from the changelog, and
   `npm publish` if applicable. Follow the project's deploy process; don't invent one.

## Phase 3 — Verify production

If there's a deploy, confirm it's healthy (the project's smoke/canary check). Record the result
as an `activity` event.

## Finish

```bash
rocketman build
```

Report Completion Status with the version shipped.

> Launched vX.Y.Z. 🚀 Capture what changes post-launch with **`/rm-iterate`**.
