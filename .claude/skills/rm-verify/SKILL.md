---
name: rm-verify
version: 0.1.0
description: Stage 5 of the Rocketman Track. Runs the automated quality gate — build, lint, tests, and the hub doctor — before code moves to review. Use after /rm-build, or when the user asks to "verify", "run checks", "is this ready", or "gate this".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: 'bash "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/guard-generated.sh"'
          statusMessage: "Guarding generated files…"
---

# /rm-verify — the automated gate

## When to invoke

After `/rm-build`, or when the user asks to verify / run checks / "is this ready". This is a
gate: nothing moves to `review` or `done` until it passes.

## Conventions

Read `.claude/skills/CONVENTIONS.md`. Plan-mode-safe (read-only checks) until you write status
back.

## Phase 1 — Run every check

In order, skipping what doesn't apply:

1. **Hub doctor** — `rocketman doctor` (references resolve) and `rocketman check` (the committed
   hub isn't stale).
2. **Type check** — `tsc --noEmit`, `mypy`, etc.
3. **Lint** — the project's linter/formatter.
4. **Tests** — the project's runner. Note coverage if available.
5. **Build** — the production build, if any.

## Phase 2 — Scorecard

Produce a compact scorecard: each check ✓/✗ with the key output line. For any failure, show
the error and either fix it (if small and in scope) or flag it.

## Phase 3 — Write back

- **All green:** move the task(s) to `review` (or `done` if merged), append an `activity` event
  noting verification passed.
- **Red:** keep the task in `progress`; if the failure is a real defect, branch into
  **`/rm-debug`**.

## Finish

```bash
rocketman build
```

Report Completion Status (DONE = all green; DONE_WITH_CONCERNS = passed with caveats; BLOCKED =
a failure you can't resolve).

> Verification: PASS/FAIL. Next, put it in front of a human with **`/rm-test`**.
