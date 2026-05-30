<div align="center">

# 🚀 Rocketman

### Idea to production, managed in the repo.

**A project management hub that lives in your codebase as one beautiful, offline HTML file — and a Claude skill stack that walks a product from raw idea to shipped, iterated reality.**

Built by [Winsen Labs](https://github.com/winsenlabs) · MIT licensed

`spec` · `kanban` · `roadmap` · `decisions` · `debugging` · `docs` — all in `PM/index.html`

</div>

---

## Responsible token-maxing

Token-maxing has become a thing — throw enough tokens at a model and watch it go. We've
always been fans of the *responsible* kind: tokens spent with a plan, a memory, and a paper
trail, so the output is something you'd actually ship.

That's what Rocketman is for. **Rocketman + Claude Code turns any idea you have into a
production-grade application on autopilot** — the whole nine yards. Not a demo, not a
prototype that falls over on the second click. The idea gets pressure-tested, specced,
planned, built by a fleet of agents, verified, human-tested, launched, and iterated — and
every token spent leaves a trace in a hub you can read in ten seconds.

The track is the discipline; the hub is the memory; the agents are the throughput. Point them
at an idea and let them run.

---

## Why a local HTML hub beats online PM tools in the age of AI coding agents

Project management tools were built for humans clicking around a browser. But the primary worker on a modern codebase is increasingly an **AI coding agent running inside the repo** — and for that worker, a SaaS board behind an API, an OAuth wall, and a rate limiter is exactly the wrong shape. Rocketman is built on a different bet:

**1. The context should live where the work happens — in the repo.**
An agent shouldn't need network access, an API token, or a third-party MCP round-trip to learn what the project is, what's blocked, and why a decision was made. It should read a file. Rocketman puts the spec, the board, every decision, and every debugging trail in `PM/` as structured data that any agent loads instantly — no auth, no latency, no rate limits, no "the integration is down."

**2. HTML is the format AI is *unreasonably* good at.**
As Thariq Shihipar argues in [**The Unreasonable Effectiveness of HTML**](https://thariqs.github.io/html-effectiveness/), agents produce and reason over HTML extraordinarily well, and a self-contained `.html` file is *immediately usable* — no build step, no export, no viewer. HTML makes spatial, structured information (a kanban, a diff, a timeline, a decision tree) **visible at a glance** instead of flattened into prose. His line captures the whole idea: it turns *"a document you'd skim into one you'd actually read."* That is precisely the gap between a markdown spec nobody opens and a hub you actually look at.

**3. It version-controls with the code.**
Because `PM/` is committed, your project state **branches, diffs, reviews, and merges with the code itself.** A feature branch carries its own spec and board changes; they show up in the PR; they can never silently drift from the work they describe. Try that with a Linear board.

**4. It's offline, portable, and yours.**
One double-clickable file. Works on a plane. Outlives any vendor. No seat pricing, no data export, no lock-in.

**5. Structured data keeps it honest.**
Raw HTML is miserable to diff and unreliable for an agent to hand-edit. So Rocketman **splits data from presentation**: small, diffable JSON is the source of truth; the gorgeous HTML is *generated* and read-only. Agents edit data; the build renders the hub.

> **Local-first, sync-optional.** None of this means abandoning the tools your team already loves. When a stakeholder wants it in Linear, FanDesk, Cheetah, or Winsen, the [`/rm-mirror`](#the-skill-stack) skill mirrors the whole hub into them on demand. The repo stays the source of truth; the SaaS board becomes a read-out.

---

## Hand it to Claude

New here? Don't read the docs — let your agent evaluate it for you. Copy this into Claude Code
(or any coding agent) inside a project you care about:

```text
Take a look at Rocketman: https://github.com/winsenlabs/rocketman
(npm: @winsendotai/rocketman). It's an in-repo HTML project hub plus a Claude
skill track that walks an idea from product thinking → spec → plan → build →
verify → launch, all managed inside the repo.

Evaluate whether it would actually be useful for THIS project. If it is, run
`npx @winsendotai/rocketman init` to scaffold it, open PM/index.html, and walk
me through what it set up and how I'd use it day to day. If you don't think it
fits, tell me why instead of installing it.
```

The agent reads the repo, makes the call, and sets Rocketman up for you if it's a fit.

---

## Quickstart

```bash
# in any repo
npx @winsendotai/rocketman init      # scaffold PM/ + the Claude skill stack
npx @winsendotai/rocketman build     # render PM/data/*.json → PM/index.html
open PM/index.html      # zero deps, opens offline
```

That's it. Commit `PM/` alongside your code and you have a living project hub that travels with the repo.

> Or clone this repo and open [`PM/index.html`](PM/index.html) to see Rocketman managing **its own** development.

---

## What you get

| | |
|---|---|
| 🗂 **One offline file** | The whole project renders to a single self-contained `PM/index.html`. No server, no deps, no network. |
| 🎛 **Nine views** | Dashboard · Board · Spec · Roadmap · Decisions · Debug · Docs · Activity · **Fleet** — a "calm command center" UI. |
| 🧠 **AI summary lines** | Every entity carries a one-line summary, so the whole board is skimmable at a glance. |
| 🔗 **Backlinks** | `[[id]]` wiki-links between tasks, ADRs, debug logs, and spec — with automatic "referenced by". |
| 👥 **Provenance** | Every item and event is attributed **human vs agent** (`opus` / `sonnet` / `haiku`). |
| 🛠 **The Rocketman Track** | A Claude skill stack that forces product thinking and drives idea → production. |
| 🔁 **Sync-optional** | Mirror the hub into Linear / FanDesk / Cheetah / Winsen whenever you want. |
| 🤖 **Fleet-ready** | The board is a work queue; a parent agent allocates ready tasks to sub-agents on demand. |
| 📡 **Agent relay + Fleet view** | Agents in separate terminals message each other and hand off tasks over a conflict-free file bus — and the **Fleet view** shows every conversation, handoff, and who's online. No more copy-paste between tabs. |

---

## The Rocketman Track

The skill stack walks a product from a raw idea all the way to a shipped, iterated product. Every stage reads from and writes back to the same `PM/` data, so the hub is always current.

```
  Ideate ─▶ PRD ─▶ Plan ─▶ Build ─▶ Verify ─▶ Test ─▶ Launch ─▶ Iterate
   force    spec    track   fleet     gate    human    ship    changelog
  thinking         + board                    test
            └──────────── /rm-research ────────────┘
            verify the current, correct stack before you build on it
```

### The skill stack

| Skill | Stage | What it does |
|---|---|---|
| `/rm-ideate` | Ideate | Forces product thinking — six questions on demand, status quo, wedge, and why-now before any code. |
| `/rm-research` | Any | Verifies the current, correct tech stack / library / API / version before you build on it — the antidote to agents reaching for a stale stack from memory. |
| `/rm-prd` | PRD | Turns the idea brief into a structured spec (vision, personas, requirements, non-goals, risks). |
| `/rm-plan` | Plan | Decomposes the PRD into milestones, epics, and a board of ready tasks. |
| `/rm-build` | Build | Turns the board into a work queue; allocates ready tasks to sub-agents on demand. |
| `/rm-verify` | Verify | Runs the automated gate — build, lint, tests, and the hub doctor. |
| `/rm-test` | Test | Generates a crisp human test script and records pass/fail back onto the task. |
| `/rm-launch` | Launch | Ships: tags, updates the changelog, cuts the release. |
| `/rm-iterate` | Iterate | Captures post-launch changes as new tasks + changelog entries. |
| `/rm-relay` | Multi-agent | Lets agents in separate terminals message each other and hand off tasks over a polled `PM/comms/` bus. Pair with `/loop`. |
| `/rm-mirror` | — | Mirrors the hub into Linear / FanDesk / Cheetah / Winsen (sync-optional). |
| `/rm-init` · `/rm-sync` · `/rm-decision` · `/rm-debug` · `/rm-brief` | Infra | Scaffold, rebuild, record an ADR, log an investigation, brief project status. |

Skills live in [`.claude/skills/`](.claude/skills/) and load automatically in Claude Code. The conventions that make any agent fluent live in [`PM/CLAUDE.md`](PM/CLAUDE.md).

---

## How it works

```
        you / an agent edit                      the build                    you open
   ┌───────────────────────────┐         ┌──────────────────┐         ┌──────────────────┐
   │  PM/data/core.json        │         │  engine/build.mjs │         │  PM/index.html   │
   │  PM/data/tasks.json       │ ───────▶│  flat-merge +     │ ───────▶│  one offline,    │
   │  PM/data/spec.json        │         │  inline css/js    │         │  read-only hub   │
   │  PM/data/content.json     │         │  → single file    │         │  (8 views)       │
   └───────────────────────────┘         └──────────────────┘         └──────────────────┘
      source of truth (diffable)            deterministic, 0 deps          generated artifact
```

- **Data** is four small JSON files — easy to diff, easy for an agent to edit reliably.
- **`build.mjs`** flat-merges them into one `#pm-data` island and inlines the engine CSS + JS into a single HTML file. Deterministic: same data in, byte-identical hub out.
- **The HTML is generated and read-only.** Never hand-edit it — edit the data and rebuild. ([ADR-2](PM/index.html))

See [`PM/docs/`](PM/docs/) for the full Diátaxis documentation (tutorial · how-to · reference ·
explanation) — the same Markdown also renders inside the hub's **Docs** view. The how-tos cover
adding tasks, decisions, debug logs, spec sections, Markdown docs, and PDF/image attachments.

---

## Project structure

```
rocketman/
├── PM/
│   ├── index.html          # the generated hub — open this  (do not hand-edit)
│   ├── CLAUDE.md           # conventions that make agents fluent
│   ├── data/               # the source of truth (core, tasks, spec, content)
│   ├── docs/               # Markdown docs → rendered in the hub's Docs view
│   ├── files/              # attachments (PDF, images) embedded into the hub
│   └── comms/              # the agent relay bus (presence, messages, handoffs)
├── engine/                 # the hub engine (reusable, zero-dep)
│   ├── build.mjs           # the content pipeline: data + docs → index.html
│   ├── md.mjs              # the Markdown → HTML converter
│   ├── app.js              # the hub renderer
│   └── hub.css             # the "calm command center" theme
├── templates/              # what `rocketman init` scaffolds into a repo
├── bin/rocketman.mjs       # the CLI (init · build · new · doctor · serve · relay)
└── .claude/                # the Rocketman Track skills + guard hook + settings
```

---

## Requirements

Node 18+. That's the whole list — Rocketman has **zero runtime dependencies**.

> Browser note: the theme uses `oklch()` colors; open the hub in a 2023+ browser (Chrome/Edge/Safari/Firefox). See `BUG-3` in the hub for the supported baseline.

---

## Contributing

Rocketman dogfoods itself — its own roadmap lives in [`PM/index.html`](PM/index.html). See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © Winsen Labs.

<div align="center"><sub>Work better with Winsen.</sub></div>
