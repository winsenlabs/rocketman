---
title: Why HTML, not Markdown
---

# Why HTML, not Markdown

## Humans don't read long Markdown

A Markdown spec is a wall of text you skim. A project hub should be the opposite — a
surface you actually look at: a board you scan in seconds, a burn-up you glance at, a
timeline you follow. HTML makes structured, spatial information *visible* instead of
flattening it into prose.

## But raw HTML is the wrong source of truth

Hand-written HTML is miserable to diff and unreliable for an agent to edit — one stray tag
and the page breaks. So Rocketman splits the two:

- **Data** — small JSON files (and Markdown docs). Easy to diff, easy for an agent to edit
  precisely, easy to validate.
- **Presentation** — `PM/index.html`, generated from the data and read-only.

You edit data; `rocketman build` renders the hub. The build is deterministic — the same
data always produces a byte-identical file — so CI can fail a PR whose committed hub is
stale.

## Why local-first beats an online tool for AI agents

The primary worker on a modern codebase is increasingly an agent running inside the repo.
For that worker, a SaaS board behind an API, an auth wall, and a rate limiter is the wrong
shape. An in-repo hub is readable with no network, version-controlled with the code, and
offline-portable — one file that outlives any vendor.

None of this abandons the tools your team likes: the `/rm-mirror` skill pushes the hub into
Linear, FanDesk, Jira, or Asana on demand. The repo stays the source of truth; the SaaS
board becomes a read-out.
