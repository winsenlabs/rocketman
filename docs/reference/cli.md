# CLI reference

`rocketman` is a single zero-dependency Node binary. Run it with `npx rocketman <command>` (or
`node bin/rocketman.mjs <command>` from this repo).

## Project commands

| Command | Description |
|---|---|
| `rocketman init [dir]` | Scaffold `PM/` (data + `CLAUDE.md`) and the skill stack into a repo, then build. |
| `rocketman build [dir]` | Render `PM/data/*.json` → `PM/index.html`. Deterministic. |
| `rocketman check [dir]` | Exit non-zero if the committed hub is stale (use in CI). |
| `rocketman new <task\|adr\|debug> "Title"` | Append a correctly-shaped entity stub. |
| `rocketman doctor [dir]` | Validate data + cross-references (backlinks, owners, epics). |
| `rocketman serve [dir] [--port]` | Serve an editable hub on localhost (comments, doc edits, task moves). |

## Relay commands — the agent bus

Coordination between agent sessions running in separate terminals. Each agent writes only its own
files under `PM/comms/`, so it's conflict-free. See [the agent relay](../explanation/agent-relay.md).

| Command | Description |
|---|---|
| `rocketman relay register <session> <agent> "focus" [--model opus]` | Announce this terminal's presence. |
| `rocketman relay here <session> [--status idle\|done] [--focus "…"]` | Heartbeat / update presence. |
| `rocketman relay agents` | List active sessions and what each is working on. |
| `rocketman relay send <from> <to\|all> "subject" "body" [--kind handoff\|message] [--task rm-07]` | Send a message or a task handoff. |
| `rocketman relay inbox <session>` | Show messages/handoffs addressed to this session (human-readable). |
| `rocketman relay poll <session>` | Same, as JSON — for the `/rm-relay` skill to act on. |
| `rocketman relay accept <session> <msgid> [--note "…"]` | Accept a handoff. |
| `rocketman relay complete <session> <msgid> [--note "…"]` | Mark a handoff complete. |
| `rocketman relay reply <session> <msgid> --note "…"` | Reply to / acknowledge a message. |

Pair `rocketman relay poll` with the [`/rm-relay`](../../.claude/skills/rm-relay/SKILL.md) skill and
`/loop <interval> /rm-relay` to poll continuously.
