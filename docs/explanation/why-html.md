# Why HTML, not markdown

## Humans don't read long markdown

A markdown spec is a wall of text you *skim*. The whole point of a project hub is the opposite — a
surface you actually look at: a board you scan in seconds, a burn-up you glance at, a decision tree
you follow. HTML makes structured, spatial information **visible** instead of flattening it into
prose. As Thariq Shihipar argues in [The Unreasonable Effectiveness of HTML](https://thariqs.github.io/html-effectiveness/),
this turns *"a document you'd skim into one you'd actually read."*

## …but raw HTML is the wrong source of truth

Hand-written HTML is miserable to diff and unreliable for an agent to edit — one stray tag and the
page breaks. So Rocketman **splits data from presentation**:

- **Data** — four small JSON files in `PM/data/`. Easy to diff, easy for an agent to edit
  precisely, easy to validate.
- **Presentation** — `PM/index.html`, *generated* from the data and **read-only**.

You edit the data; `rocketman build` renders the hub. The build is deterministic — the same data
always produces a byte-identical file — so CI can fail a PR whose committed hub is stale.

## Why local-first beats an online tool for AI agents

The primary worker on a modern codebase is increasingly an agent running *inside the repo*. For
that worker, a SaaS board behind an API, an auth wall, and a rate limiter is exactly the wrong
shape. An in-repo HTML hub is:

- **Readable with no network** — the agent reads a file; no token, no latency, no "integration is down".
- **Version-controlled with the code** — project state branches, diffs, reviews, and merges with the
  work it describes, so it can never silently drift.
- **Offline and portable** — one double-clickable file that outlives any vendor.

None of this means abandoning the tools your team likes. Rocketman is **local-first, sync-optional**:
the [`/rm-mirror`](../../.claude/skills/rm-mirror/SKILL.md) skill pushes the hub into Linear,
FanDesk, Cheetah, or Winsen on demand. The repo stays the source of truth; the SaaS board becomes a
read-out.
