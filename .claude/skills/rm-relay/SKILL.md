---
name: rm-relay
version: 0.1.0
description: The inter-agent relay. Lets multiple agent sessions running in separate terminals/tabs talk to each other — send messages, and give/receive task handoffs — through a conflict-free file bus in PM/comms. Polls on an interval the user sets. Use when running multiple agents on one product, when the user says "set up handoffs", "let the agents talk", "poll for handoffs", "watch for messages", "autopilot", or "relay". Pair with /loop to poll continuously.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
triggers:
  - set up handoffs
  - let the agents talk
  - poll for handoffs
  - autopilot
  - relay
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-relay — agents that talk to each other

## When to invoke

When several agents run in separate terminals on the same product and need to coordinate.
Without it, you copy-paste between tabs. The relay is a conflict-free **file bus** at
`PM/comms/` — each agent writes only its own files, so no terminal stomps another. Two things
flow over it: **messages** (free-form) and **handoffs** (A finishes, B picks up a task). The
**Fleet** view in the hub renders all of it.

## Conventions

Read `.claude/skills/CONVENTIONS.md`. All relay writes go through the `rocketman relay` CLI so
the files stay well-formed.

## Phase 1 — Register (first run)

Pick a short, stable session id for this terminal (`api`, `frontend`, `t1`):

```bash
rocketman relay register <session> <your-model> "what I'm working on"
rocketman relay agents          # see who else is live
```

## Phase 2 — Each poll

```bash
rocketman relay here <session>   # heartbeat — I'm alive
rocketman relay poll <session>   # JSON: messages + handoffs addressed to me
```

For each pending item:

- **Handoff received** (`kind:"handoff"`, has a `task`): read the body for context. Accept with
  `rocketman relay accept <session> <msgid> --note "on it"`, then pick up the task (set `owner`
  to me, `col` to `progress`) and start. Can't yet? `rocketman relay reply <session> <msgid>
  --note "blocked on X, ~20m"`.
- **Message received**: act on it or `rocketman relay reply <session> <msgid> --note "…"`.
- Acked items won't show again.

## Phase 3 — Give a handoff (when you finish your part)

```bash
rocketman relay send <me> <them> "Auth done — wire it into the dashboard" \
  --kind handoff --task rm-14 \
  --body "Login landed in src/auth (PR #31, merged). rm-14 needs the dashboard to read the session. Types in src/auth/types.ts."
```

Broadcast with `--to all`. Always include: what you finished, where it lives (files/PR), and
exactly what the receiver does next. A handoff is only as good as its context.

## Polling continuously (the autopilot)

Wrap one poll in `/loop` at the cadence the user wants:

```
/loop 30s /rm-relay        # tight, during an active handoff phase
/loop 2m  /rm-relay        # relaxed when calm
```

Each session runs its own loop. Between polls, keep doing your own work. Surface to the user
only for decisions or true blockers.

## Rules

- **One writer per file.** Only ever write your own presence, the messages you send, and your
  own acks. Never edit another agent's files.
- When you accept a handoff and pick up a task, you're momentarily that task's single writer —
  update only that task, then `rocketman build`.

Report Completion Status each poll (usually DONE: "inbox clear" or "handled N items").
