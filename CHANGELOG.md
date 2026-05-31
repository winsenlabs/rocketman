# Changelog

All notable changes to Rocketman are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] — 2026-05-31

### Added
- **CI smoke test** (`engine/smoke.mjs`) — boots the built hub against a tiny zero-dependency DOM
  shim and drives every view through the app's own click handler, failing if any view throws or
  renders empty. Catches runtime render bugs the build can't (e.g. a recursion or undefined deref
  that blanks the hub while `build --check` still passes). Wired into CI and `npm test`.
- **Custom task status** — a task can set `status` (free-text, e.g. `"done · caveats"`) plus
  `statusTone` (`done`/`progress`/`review`/`blocked`/`bug`/`warn`/`accent`) to override the
  column-derived pill. Shows on the board card, in the List, and in the drawer — for when a task's
  real state needs a caveat the column can't express (e.g. done-but-with-known-limitations). `col`
  still drives the swimlane; `status` is just the label. New amber `warn` and `accent` pill tones.

## [0.1.1] — 2026-05-30

### Added
- **List view** — a flat, sortable micro-view of every task (ID · summary · status · owner · epic ·
  points · PR). Click a column header to sort, a row to open it. The Board shows epic-level
  swimlanes; the List is the granular counterpart for scanning every task at once. Keyboard `l`.
- **Dependencies view** — surfaces what is blocked and **flags anything waiting on a human**
  (blocked tasks, proposed ADRs, human-owned reviews, unaccepted handoffs) at the top, so the
  autopilot's human-gated items never get lost. Plus a "blocked on other work" section for
  agent-resolvable dependencies. Keyboard `y`.

### Changed
- **`/rm-plan` now teaches granular decomposition** — phases ARE epics, and each phase must be
  broken into executable micro-tasks (one shippable change each), not phase-level roadmap cards.
  Added a "review the plan in the hub" step (Board / List / Dependencies) to catch coarse cards
  before `/rm-build`.

### Fixed
- **Content overflow** — long titles, summaries, and code no longer spill out of cards, drawers,
  doc bodies, or the dependency/fleet rows; everything wraps or scrolls within its container.

### Fixed
- **Boot crash on empty debug** — a project with no debug entries (including a stock
  `rocketman init`, whose template ships `debug: []`) crashed at boot and rendered a blank hub
  (`D.debug[0].id` dereferenced an empty array at module load). Guarded the boot read, added a
  Debug empty-state, and guarded the dashboard activity read and `REG[inv.task]`; unassigned
  owners now render a "ready for the fleet" chip. The renderer now tolerates empty
  debug/activity/owner data — verified by headless-booting a fresh `init` hub. Recorded as BUG-4.
- **Edit mode gated on the serve backend, not the URL** — the comment composer appeared on the
  static GitHub Pages site (https) but its POST hit a nonexistent API → 405. Edit affordances now
  mount only when `rocketman serve` is behind the page; `file://` and static hosts are read-only.

### Added (carried from 0.1.0 dev)
- **`/rm-research` skill** — verifies the current, correct tech stack / library / API / version
  before building on it (WebSearch/WebFetch against present-day official docs), and records the
  choice as a dated ADR. Counters the #1 agent failure: reaching for a stale or wrong stack from
  training data. Wired across the track — a standing rule in `CONVENTIONS.md` and a Phase 0 in
  `/rm-plan` and `/rm-build`.
- **README opener on responsible token-maxing** — Rocketman + Claude Code turning any idea into a
  production-grade app on autopilot, with every token leaving a trace.
- **Favicon** — every built hub now embeds the Rocketman rocket as an SVG-data-URI favicon, so
  the browser tab shows the logo (no external file, stays single-file/offline).

### Fixed
- **`npx rocketman init` reliability** — `bin/rocketman.mjs` is now marked executable, and the
  packaged tarball was verified end-to-end (`npm pack` + a fresh-dir init): it scaffolds
  `PM/` + `.claude/` (skills, hooks, settings) + starter docs/files and builds the hub. Re-running
  `init` safely refuses with "PM/ already exists" unless `--force`.
- Removed four dead `engine/data-*.json` demo files that were being included in the published
  package (the engine reads `PM/data/`, never `engine/data-*`).

### Added (docs)
- **Markdown docs** — drop `.md` files in `PM/docs/` and they render in the hub's **Docs** view.
  Folders become the nested tree (numeric prefixes order them; names are title-cased). A
  zero-dependency Markdown converter (`engine/md.mjs`) handles headings, lists, tables, code
  fences, blockquotes, links, and images. The how-tos now cover adding tasks, decisions, debug
  logs, spec sections, docs, browser editing, and existing-repo setup — and the same Markdown is
  readable both in the repo and inside Rocketman.
- **PDF & image attachments** — put a file in `PM/files/`, link it from a doc, and the build
  embeds it as a data URI so `PM/index.html` stays a single offline file. PDFs render as an
  attachment card (Open/download + inline preview); images embed inline. Files over 8 MB are left
  as links with a build warning.
- Root docs moved into `PM/docs/` (single source: the repo Markdown *is* the in-hub docs).
- **Skill conventions adopted from gstack** — every `/rm-*` skill now has structured frontmatter
  (`version`, `allowed-tools`, `triggers`), a "When to invoke" section, an explicit phased
  workflow with gates, plan-mode awareness, and a Completion Status Protocol (DONE /
  DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT). Shared rules live once in
  `.claude/skills/CONVENTIONS.md`.
- **Generated-file guard hook** — `.claude/hooks/guard-generated.sh` blocks any direct Write/Edit
  to `PM/index.html` (wired per-skill via frontmatter and globally via `.claude/settings.json`),
  enforcing the edit-data-not-HTML rule at the tool level. `rocketman init` now scaffolds the
  hook + settings.
- **Root `CLAUDE.md`** with skill-routing rules so agents pick the right `/rm-*` skill.
- **Fleet view** — a ninth view that renders the agent relay in full: every agent's
  presence, and the complete message + handoff stream between agents (with their
  accept / complete / reply trails), newest first. Agent↔agent conversations are now
  visible in the hub (`RM-11`).
- **Edit mode via `rocketman serve`** — a zero-dependency localhost server that serves
  the same hub with write APIs. Add comments, edit docs, and move tasks straight from
  the browser; changes write back to `PM/data/*.json` and rebuild. The committed
  `file://` hub stays read-only — editing is opt-in.
- **Nested-folder docs** — the Docs view is now an arbitrarily deep, collapsible folder
  tree (was a flat one-level list).

### Changed
- **Theme toggle is a single switch** that flips on any click and slides.

### Fixed
- **Debug log rendered blank** — the timeline keyed off `node.kind` and fell through to
  empty for this project's data. It now derives from whichever content fields exist
  (symptom, hypotheses, repro, root cause, fix, guard).
- **Dashboard metric row was cramped** — the state-card, metric row, and KPI cards now
  have proper spacing.

### Planned
- **Cross-repo rollup** — aggregate many repos' `PM/` data into one read-only org hub (`RM-12`).
- `/rm-launch` + `/rm-iterate` once the CLI exposes ship hooks (`RM-9`).

## [0.1.0] — 2026-05-30

The first public release. 🚀

### Added
- **The engine** — `engine/build.mjs`, a zero-dependency content pipeline that flat-merges
  `PM/data/*.json` into one self-contained, offline `PM/index.html`. Deterministic and idempotent.
- **The hub** — a "calm command center" UI with eight views (Dashboard, Board, Spec, Roadmap,
  Decisions, Debug, Docs, Activity), light + dark themes, ⌘K search, and an entity drawer.
- **AI summary lines, `[[id]]` backlinks, and human-vs-agent provenance** throughout.
- **The Rocketman Track** — a Claude skill stack covering idea → production:
  `/rm-ideate`, `/rm-prd`, `/rm-plan`, `/rm-build`, `/rm-verify`, `/rm-test`, `/rm-launch`, `/rm-iterate`.
- **Infra skills** — `/rm-init`, `/rm-sync`, `/rm-decision`, `/rm-debug`, `/rm-brief`.
- **The agent relay** — `/rm-relay` + a conflict-free `PM/comms/` file bus + `rocketman relay` CLI.
  Agents in separate terminals send messages and hand off tasks (offer → accept → complete), polled
  on an interval via `/loop`. No server, no copy-paste between tabs (`RM-13`, `ADR-8`).
- **`/rm-mirror`** — mirror the hub into Linear / FanDesk / Cheetah / Winsen (sync-optional).
- **The `rocketman` CLI** — `init`, `build`, `new`, `doctor`.
- **`PM/CLAUDE.md`** — the conventions doc that makes any Claude agent fluent in the hub.
- **The doctor** — cross-reference validation (backlinks, owners, epics, debug→task) folded into the build.
- **CI** — a GitHub Action that rebuilds the hub and fails a PR if it's stale or any reference is broken.
- **Docs** — full Diátaxis documentation set in `docs/`.

### Fixed
- `BUG-1` — the design bundle shipped with `app.js` stubbed, so the hub rendered blank. The build now
  inlines the real renderer and refuses to ship a stubbed script.
- `BUG-2` — a literal closing-script sequence inside content could close the data island early.
  The build now escapes `<` inside the embedded JSON.

[Unreleased]: https://github.com/winsenlabs/rocketman/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/winsenlabs/rocketman/releases/tag/v0.1.0
