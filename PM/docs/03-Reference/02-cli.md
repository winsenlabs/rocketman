---
title: CLI commands
---

# CLI commands

`rocketman` is a single zero-dependency Node binary. Run it with `npx @winsendotai/rocketman <cmd>`
(or `node bin/rocketman.mjs <cmd>` from this repo).

## Project

| Command | Does |
|---|---|
| `rocketman init [dir]` | Scaffold `PM/` + `.claude/` (skills, hooks, settings) into a repo, then build. |
| `rocketman build [dir]` | Render `PM/data/*.json` + `PM/docs/` + `PM/comms/` → `PM/index.html`. Deterministic. |
| `rocketman check [dir]` | Exit non-zero if the committed hub is stale (use in CI). |
| `rocketman new <task\|adr\|debug> "Title"` | Append a correctly-shaped entity stub. |
| `rocketman doctor [dir]` | Validate data + cross-references (backlinks, owners, epics). |
| `rocketman serve [dir] [--port]` | Serve an editable hub on localhost (comments, doc edits, task moves). |

## Relay (the agent bus)

Coordination between agent sessions in separate terminals. Each agent writes only its own
files under `PM/comms/`, so it's conflict-free.

| Command | Does |
|---|---|
| `rocketman relay register <session> <agent> "focus"` | Announce this terminal's presence. |
| `rocketman relay here <session>` | Heartbeat / update presence. |
| `rocketman relay agents` | List active sessions. |
| `rocketman relay send <from> <to\|all> "subject" "body" [--kind handoff] [--task rm-07]` | Send a message or handoff. |
| `rocketman relay inbox <session>` | Show messages/handoffs for this session. |
| `rocketman relay poll <session>` | Same, as JSON (for `/rm-relay`). |
| `rocketman relay accept\|complete\|reply <session> <msgid> [--note]` | Act on a handoff/message. |

Pair `relay poll` with the `/rm-relay` skill and `/loop 30s /rm-relay` to poll continuously.
