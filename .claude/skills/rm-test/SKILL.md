---
name: rm-test
description: Stage 6 of the Rocketman Track. Generates a crisp, human-runnable manual test script for a task/feature and records the pass/fail result back onto the task. Use after /rm-verify, or when the user asks to "human test", "write a test script", "QA this", or "how do I check this works".
---

# /rm-test — the human test loop

Automated checks prove the code runs; a human proves it *works*. Produce a short, concrete test
script a person can run in a few minutes, then capture the outcome.

## Build the script from acceptance criteria

For the task under test, pull its linked spec **story** and acceptance criteria. Turn each into a
numbered, observable step:

```
TEST: <task ref> — <title>
Setup: <how to get to the starting state>
1. <action>  →  Expect: <observable result>
2. <action>  →  Expect: <observable result>
…
Edge: <one nasty case worth trying>
```

Keep it to the few steps that actually exercise the feature. Prefer "open this URL / run this
command and look for X" over vague "verify it works".

> If the project uses a browser/app QA tool (e.g. a `/qa` or `/browse` skill), offer to drive the
> happy path automatically and leave only judgment calls to the human.

## Capture the result

Ask the human to run it and report pass/fail per step. Then write back to the task in
`PM/data/tasks.json`:

- A `comment` recording who tested it, when, and the result.
- On pass: move `col` toward `done`; append an `activity` event.
- On fail: keep it open, capture the failing step, and branch to **`/rm-debug`**.

```bash
node engine/build.mjs
```

> Human test: PASS/FAIL recorded on <task>. When the milestone is green, run **`/rm-launch`**.
