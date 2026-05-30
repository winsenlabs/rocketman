# The agent relay — inter-agent handoffs

## The problem

You run several coding agents at once — one per terminal tab — each on a different part of the same
product. They can't see each other. So when agent A finishes something agent B needs, *you* are the
message bus: you copy A's output and paste it into B. That doesn't scale, and it makes an
"autopilot" fleet impossible.

## The idea

Give the agents a shared nervous system that lives in the repo: a **conflict-free file bus** at
`PM/comms/`, plus a skill that **polls** it on an interval you set. Two things flow over it:

- **Messages** — free-form notes between sessions (or broadcast to all).
- **Handoffs** — A finishes, names the next task, and hands it to B with full context. B accepts,
  picks up the task, and later marks it complete.

## Why a file bus (and not a server)

Standing up a message broker for a few local terminals is overkill, and a *single* shared
`comms.json` would have every terminal racing to write the same file. So the relay uses
**one file per fact**:

```
PM/comms/
  agents/<session>.json     # each agent's presence + focus + heartbeat   (owner: that agent)
  messages/<msg-id>.json     # a message or handoff                        (owner: the sender)
  acks/<msg-id>__<by>__<kind>.json   # read / accept / complete / reply   (owner: the recipient)
```

Because **every file has exactly one writer**, no two terminals ever collide — no locks, no merge
races, no server. Reading the bus is just listing a directory. This is the relay's expression of
Rocketman's [single-writer rule](../../PM/CLAUDE.md).

## The handoff lifecycle

```
   A: send --kind handoff --task rm-14   ─▶   offered
   B: accept <msgid>                      ─▶   accepted   (B sets the task owner + col, starts work)
   B: complete <msgid>                    ─▶   complete   (B hands back / broadcasts done)
```

A good handoff body answers three things: **what I finished**, **where it lives** (files / PR), and
**exactly what you should do next**. A handoff is only as useful as its context.

## Polling

One run of `/rm-relay` is a single poll: heartbeat, read the inbox, handle anything addressed to me,
go quiet. To make it continuous, wrap it in `/loop` at whatever cadence you want:

```
/loop 30s /rm-relay     # tight loop during an active handoff phase
/loop 2m  /rm-relay     # relaxed when things are calm
```

Each terminal runs its own loop. Coordination is *eventually consistent* at the poll interval —
fast enough for handoffs, with none of the cost of a real-time system.

## It travels with the project

`rocketman build` folds `PM/comms/` into the hub data, so the fleet's presence and handoff stream
are part of the committed project — reviewable, replayable, and attributed by agent. Rocketman uses
this for its own development: open the hub and you can see one session hand `RM-8` to another.
