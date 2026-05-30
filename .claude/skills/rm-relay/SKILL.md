---
name: rm-relay
description: The inter-agent relay. Lets multiple agent sessions running in separate terminals/tabs talk to each other — send messages, and give/receive task handoffs — through a conflict-free file bus in PM/comms. Polls on an interval the user sets. Use when running multiple agents on one product, when the user says "set up handoffs", "let the agents talk", "poll for handoffs", "watch for messages", "autopilot", or "relay". Pair with /loop to poll continuously.
---

# /rm-relay — agents that talk to each other

The problem: you have several agents in separate terminals, each on a different part of the same
product. They can't talk, so you copy-paste between them. The relay fixes that with a shared,
**conflict-free file bus** at `PM/comms/` — every agent writes only its own files, so no terminal
ever stomps another.

Two things flow over it: **messages** (free-form notes) and **handoffs** (A finishes, B picks up
a task). Everything goes through the `rocketman relay` CLI so the files are always well-formed.

## On first run — register this session

Pick a short, stable session id for this terminal (e.g. `frontend`, `api`, `t1`). Then:

```bash
rocketman relay register <session> <your-model> "what I'm working on"   # e.g.
rocketman relay register api opus "billing API + webhook sync"
rocketman relay agents                                                   # see who else is live
```

## Each poll — do this loop

Run this every cycle (and tell the user to drive the interval with `/loop`, below):

```bash
rocketman relay here <session>          # heartbeat — I'm still alive
rocketman relay poll <session>          # JSON: messages + handoffs addressed to me
```

For each pending item:

- **Handoff received** (`kind: "handoff"`, has a `task`): read the body for context (what's done,
  what's left). Decide: can I take it now?
  - Accept: `rocketman relay accept <session> <msgid> --note "on it"`, then **pick up the task** —
    set its `owner` to me and `col` to `progress` in `PM/data/tasks.json`, and start the work.
  - Can't yet: `rocketman relay reply <session> <msgid> --note "blocked on X, will take in ~20m"`.
- **Message received** (`kind: "message"`): act on it or answer with
  `rocketman relay reply <session> <msgid> --note "…"` (or a `send` back to the sender).
- After handling, the item won't show up again (your ack marks it seen).

If the inbox is empty, heartbeat and wait for the next poll. Keep it quiet — only surface to the
user when something needs them.

## Giving a handoff — when you finish your part

When your work is done and another agent should pick up the next task, hand off explicitly:

```bash
rocketman relay send <me> <them> "Auth done — wire it into the dashboard" \
  --kind handoff --task rm-14 \
  --body "Login + session cookie landed in src/auth (PR #31, merged). \
          rm-14 needs the dashboard to read the session. Types are in src/auth/types.ts."
```

Broadcast to everyone with `--to all`. Always include: what you finished, where it lives
(files/PR), and exactly what the receiver should do next. A handoff is only as good as its context.

## Polling continuously (the autopilot)

The relay is one poll. To make it continuous at the cadence the user wants, wrap it with `/loop`:

```
/loop 30s /rm-relay        # poll every 30 seconds
/loop 2m  /rm-relay        # poll every 2 minutes
```

Each session runs its own `/loop … /rm-relay`. Between polls the agent keeps doing its own work;
the relay just checks the bus, handles handoffs/messages, and goes quiet again. The user sets the
interval; default to suggesting `30s` for active handoff phases, longer when things are calm.

## Rules

- **One writer per file.** Only ever write your own presence, the messages you send, and your own
  acks. Never edit another agent's files. This is what keeps the bus conflict-free.
- **Honest provenance.** Your `session`/model is on everything you send.
- **Task writes:** when you accept a handoff and pick up a task, you are momentarily that task's
  single writer — update only that task, then `rocketman build`.
- **Surface, don't spam.** Only interrupt the user for decisions or true blockers.

## See it in the hub

`rocketman build` folds `PM/comms/` into the hub data (agents, messages, acks), so the fleet's
presence and handoff stream travel with the project. (The dedicated Fleet view is `RM-11`.)
