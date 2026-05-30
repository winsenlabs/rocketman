---
title: The skill stack
---

# The skill stack

Rocketman ships 15 Claude skills in `.claude/skills/`. They share a common structure
(frontmatter, "When to invoke", phased workflow, Completion Status) so any Claude instance
behaves predictably. Shared rules live once in `.claude/skills/CONVENTIONS.md`.

## The Rocketman Track

```
Ideate → PRD → Plan → Build → Verify → Test → Launch → Iterate
```

| Skill | Stage | Does |
|---|---|---|
| `/rm-ideate` | Ideate | Six forcing questions before any code. |
| `/rm-research` | Any | Verify the current, correct stack/library/API/version before building. Counters stale-stack-from-memory. |
| `/rm-prd` | PRD | Turns the idea brief into a structured spec. |
| `/rm-plan` | Plan | Milestones, epics, a board of ready tasks. |
| `/rm-build` | Build | Allocates ready tasks to a sub-agent fleet. |
| `/rm-verify` | Verify | The automated gate — build, lint, tests, doctor. |
| `/rm-test` | Test | A human test script; records pass/fail. |
| `/rm-launch` | Launch | Ships: tag, changelog, release. |
| `/rm-iterate` | Iterate | Captures post-launch changes. |

## Infra & multi-agent

| Skill | Does |
|---|---|
| `/rm-init` · `/rm-sync` | Scaffold; reconcile the hub from git. |
| `/rm-decision` · `/rm-debug` · `/rm-brief` | Record an ADR; log an investigation; status read-out. |
| `/rm-relay` | Inter-agent messages + handoffs over `PM/comms/`. Pair with `/loop`. |
| `/rm-mirror` | Mirror the hub into Linear / FanDesk / Jira / etc. (sync-optional). |

Every skill ends with a Completion Status: DONE / DONE_WITH_CONCERNS / BLOCKED /
NEEDS_CONTEXT.
