# Changelog

All notable changes to Rocketman are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
