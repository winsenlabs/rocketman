---
name: rm-verify
description: Stage 5 of the Rocketman Track. Runs the automated quality gate — build, lint, tests, and the hub doctor — before code moves to review. Use after /rm-build, or when the user asks to "verify", "run checks", "is this ready", or "gate this".
---

# /rm-verify — the automated gate

Run every automated check the project has and report a clear pass/fail. This is a gate: nothing
should move to `review`/`done` until it passes.

## Run the checks

Discover and run, in order (skip what doesn't apply):

1. **Hub doctor** — `node bin/rocketman.mjs doctor` (references resolve) and
   `node engine/build.mjs --check` (the committed hub isn't stale).
2. **Type check** — e.g. `tsc --noEmit`, `mypy`, etc.
3. **Lint** — the project's linter/formatter.
4. **Tests** — the project's test runner. Note coverage if available.
5. **Build** — the project's production build, if any.

## Report

Produce a compact scorecard: each check ✓/✗ with the key output line. For any failure, show the
error and either fix it (if small and in scope) or flag it.

## Write back

- If all green: move the task(s) under test to `review` (or `done` if already merged), and append
  an `activity` event noting verification passed.
- If red: keep the task in `progress`, and if the failure is a real defect, record it with
  **`/rm-debug`**.

```bash
node engine/build.mjs
```

> Verification: PASS/FAIL. Next, put it in front of a human with **`/rm-test`**.
