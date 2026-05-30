---
name: rm-research
version: 0.1.0
description: Research the current, correct way to build something before committing to it — the tech stack, the library, the API, the framework version, the idiomatic pattern. Use BEFORE picking a stack or a dependency, when the user says "what should we use for X", "research the best way to", "is this the current approach", or any time you're about to reach for a tool from memory. Counters the #1 failure mode: agents defaulting to a stale or wrong tech stack from training data.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebSearch
  - WebFetch
  - AskUserQuestion
triggers:
  - what should we use for
  - research the best way to
  - is this the current approach
  - what's the latest
  - which library
  - which framework
  - pick a stack
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-research — verify the current, correct way before you build it

## When to invoke

Run this **before** choosing a stack, a library, an API, or a framework version — and any
time you're about to reach for a tool from memory. This is the antidote to the single most
common agent failure: confidently using a **stale or wrong tech stack** from training data
(a deprecated API, a renamed package, last year's idiomatic pattern, a version that no longer
exists).

> **Iron law: don't build on memory for anything fast-moving. Verify first, then build.**

Invoke when the user asks "what should we use for X", "research the best way to", "is this
still the right approach", "what's the latest on Y" — or proactively at the start of
`/rm-plan` and `/rm-build` whenever a new dependency or stack decision is in play.

## Conventions

Read `.claude/skills/CONVENTIONS.md`. Plan-mode-safe: research informs the plan, it doesn't
ship anything. Record what you find as an ADR so the choice (and the date) is durable.

## Phase 1 — Frame the question

Pin down exactly what's being chosen and the constraints that decide it:

- The capability (e.g. "auth", "background jobs", "a charts lib", "the web framework").
- Hard constraints: language/runtime, existing stack, license, self-host vs SaaS, team
  familiarity, perf/scale budget.
- What "current" means here: today's stable major version, not what was popular when the
  model was trained.

## Phase 2 — Research the present, not your memory

Use `WebSearch` + `WebFetch`. Always include the current year and "latest"/"2025/2026" in
queries so you get present-day answers, not cached defaults.

- **Current version & status:** Is the library/API current, maintained, or deprecated/renamed?
  Check the latest release and the last commit date. A package you "know" may have been
  superseded.
- **Idiomatic today:** What's the recommended pattern *now* (read the official docs' current
  page, not a 2-year-old blog post)? APIs drift; the old call signature may be gone.
- **The real alternatives:** 2–3 genuine options, each with maintenance health, ecosystem
  fit, and the trade-off that actually decides between them.
- **Gotchas:** Known breaking changes, migration notes, version pins, platform caveats.

Cross-check at least two independent sources. Prefer official docs and the project's own
changelog/releases over secondary blogs. If sources conflict, say so and date them.

## Phase 3 — Decide and record

Produce a short findings block, then record the decision so it doesn't get relitigated or
silently drift back to the stale default:

```
RESEARCH — <capability>
Recommendation: <choice> @ <current version>  (as of <date>)
Why: <the deciding trade-off, one line>
Current idiom: <the pattern/API to actually use today>
Alternatives: <option B — why not> · <option C — why not>
Gotchas: <breaking changes, pins, caveats>
Sources: <official doc URL> · <release/changelog URL>
```

Write it as an ADR via **`/rm-decision`** (or directly into `adrs[]`): the `context` captures
the constraints, `options` the alternatives, `decision` the chosen stack **with its version
and the date you verified it**. The date matters — it tells the next agent how fresh the
research is.

## Finish

```bash
rocketman build
```

Report Completion Status. If the research is inconclusive (sources conflict, no clear
current answer), report **NEEDS_CONTEXT** and ask the user rather than guessing.

> Researched <capability>: use **<choice> @ <version>**. Recorded as <ADR>. Build on this,
> not on memory.
