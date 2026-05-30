---
name: rm-launch
description: Stage 7 of the Rocketman Track. Ships a milestone to production — finalizes the changelog, bumps the version, tags, and updates the hub. Use when verified + human-tested work is ready to release, or the user says "launch", "ship it", "cut a release", or "go live".
---

# /rm-launch — ship it

Ship a milestone cleanly and leave the hub reflecting reality. Confirm `/rm-verify` passed and the
critical tasks are human-tested before you start.

## Pre-flight

- All milestone tasks are `done` (or explicitly deferred — say which).
- `node engine/build.mjs --check` passes (hub not stale).
- Working tree is clean apart from the release.

## Release steps

1. **Version** — bump `VERSION` and `package.json` per semver (the milestone's scope decides
   major/minor/patch).
2. **Changelog** — move `[Unreleased]` items into a new dated version section in `CHANGELOG.md`.
   Write it for a *reader*: lead with user-facing impact, group Added/Changed/Fixed.
3. **Hub** — in `core.json`, set `project.version`, mark the milestone `done: true` / `pct: 100`,
   refresh `project.state`, and append a launch `activity` event. Rebuild.
4. **Commit & tag** — commit `PM/` with the release; tag `vX.Y.Z`.
5. **Publish** — push, open/merge the release PR, create the GitHub release from the changelog,
   and (if applicable) `npm publish`. Follow the project's deploy process; don't invent one.

## Verify production

If there's a deploy, confirm it's healthy (the project's smoke check / canary). Record the result
as an `activity` event.

```bash
node engine/build.mjs
```

> Launched vX.Y.Z. 🚀 Next: capture what changes post-launch with **`/rm-iterate`**.
