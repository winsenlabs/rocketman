---
title: Add Rocketman to an existing repo
---

# Add Rocketman to an existing repo

Drop the hub into any repo without touching your stack.

```
cd your-repo
npx @winsendotai/rocketman init
git add PM/ .claude/
git commit -m "Add Rocketman project hub"
```

`init` scaffolds `PM/` (data + docs), the `.claude/` skills, and the generated-file guard
hook, then builds the hub.

## Wire git so diffs stay clean

The generated hub is an artifact. Mark it so GitHub collapses it and excludes it from
language stats — `init` writes this for you, but if you add it manually:

```
# .gitattributes
PM/index.html linguist-generated=true -diff
```

## Why commit `PM/`?

Because it lives in the repo, your project state **branches, reviews, and merges with the
code.** A feature branch carries its own spec and board changes; they show up in the PR;
they can never silently drift from the work they describe.

## Keep it honest in CI

Fail a PR if someone forgot to rebuild the hub or broke a reference:

```
# .github/workflows/pm.yml
- run: node bin/rocketman.mjs doctor      # references resolve
- run: node engine/build.mjs --check      # the committed hub isn't stale
```
