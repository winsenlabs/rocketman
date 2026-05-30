# Contributing to Rocketman

Thanks for helping build Rocketman! It's MIT-licensed and built by [Winsen Labs](https://github.com/winsenlabs).

Rocketman **dogfoods itself** — its roadmap, spec, decisions, and debugging trails live in
[`PM/index.html`](PM/index.html). Open it to see exactly where the project stands.

## The golden rule

> **Edit the data, never the HTML. Then rebuild.**

`PM/index.html` is generated. Edit `PM/data/*.json`, then:

```bash
node engine/build.mjs      # rebuild + run the doctor
```

Commit `PM/data/` **and** the regenerated `PM/index.html` together. CI will fail your PR if the
committed hub is stale (`node engine/build.mjs --check`) or any reference is broken.

## Dev setup

```bash
git clone https://github.com/winsenlabs/rocketman
cd rocketman
node engine/build.mjs       # no install step — zero dependencies
open PM/index.html
```

Requirements: Node 18+. That's it.

## How the pieces fit

- `engine/` — the reusable hub engine (`build.mjs` pipeline, `app.js` renderer, `hub.css` theme).
- `PM/data/` — the source of truth (four JSON files, flat-merged at build).
- `PM/CLAUDE.md` — the conventions every agent follows. **Read it before changing data.**
- `.claude/skills/` — the Rocketman Track skill stack.
- `templates/` — what `rocketman init` scaffolds into a new repo.

## Making changes

1. **Engine/renderer changes** (`engine/*`): keep zero dependencies; the build must stay
   deterministic (same data in → byte-identical hub out).
2. **Data/content changes** (`PM/data/*`): follow `PM/CLAUDE.md`. Run the doctor.
3. **New skills** (`.claude/skills/*`): one folder per skill with a `SKILL.md` (name + description
   frontmatter). Keep each skill focused; reuse the conventions in `PM/CLAUDE.md`.
4. Update `CHANGELOG.md` under `[Unreleased]`.

## Pull requests

- Keep PRs scoped and described.
- Make sure `node engine/build.mjs --check` passes.
- Be kind. Assume good intent.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
