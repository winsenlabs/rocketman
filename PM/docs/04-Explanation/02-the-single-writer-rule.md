---
title: The single-writer rule
---

# The single-writer rule

When a parent agent allocates work to a fleet of sub-agents, concurrent writes corrupt
shared state. Rocketman's rule keeps a fleet consistent.

- Sub-agents **read** the hub and **return** structured results. They do not write to
  `PM/data`.
- The parent agent is the **sole writer** back to `PM/data`, applying results one at a time.
- The only things safe to append concurrently are the `activity` log and the `PM/comms/`
  relay — both are one-file-per-fact, so no two writers touch the same file.

Serializing writes through one parent keeps the fleet's output consistent, conflict-free,
and reviewable, with full human-vs-agent provenance preserved.

## The relay applies the same idea

The agent relay (`PM/comms/`) lets agents in separate terminals talk — messages and task
handoffs. It stays conflict-free because **each agent writes only its own files**: its
presence, the messages it sends, and its own acks. Reading the bus is just listing a
directory. The **Fleet** view renders all of it: who's online, every message, every
handoff with its accept/complete trail.
