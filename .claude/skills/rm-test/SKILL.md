---
name: rm-test
version: 0.1.0
description: Stage 6 of the Rocketman Track. Generates a crisp, human-runnable manual test script for a task/feature and records the pass/fail result back onto the task. Use after /rm-verify, or when the user asks to "human test", "write a test script", "QA this", or "how do I check this works".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-test — the human test loop

## When to invoke

After `/rm-verify`, or when the user asks to human-test / QA / "how do I check this works".
Automated checks prove the code runs; a human proves it *works*.

## Conventions

Read `.claude/skills/CONVENTIONS.md`.

## Phase 1 — Build the script from acceptance criteria

Pull the task's linked spec **story** and acceptance criteria. Turn each into a numbered,
observable step:

```
TEST: <task ref> — <title>
Setup: <how to get to the starting state>
1. <action>  →  Expect: <observable result>
2. <action>  →  Expect: <observable result>
Edge: <one nasty case worth trying>
```

Keep it to the few steps that actually exercise the feature. "Open this URL and look for X"
beats "verify it works". If the project has a browser/app QA tool, offer to drive the happy
path automatically and leave judgment calls to the human.

## Phase 2 — Capture the result

Ask the human to run it and report pass/fail per step. Write back to `PM/data/tasks.json`:

- A `comment` recording who tested it, when, and the result.
- On pass: move `col` toward `done`; append an `activity` event.
- On fail: keep it open, capture the failing step, branch into **`/rm-debug`**.

## Finish

```bash
rocketman build
```

Report Completion Status.

> Human test: PASS/FAIL recorded on <task>. When the milestone is green, run **`/rm-launch`**.
