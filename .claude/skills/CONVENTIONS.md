# Rocketman skill conventions

Shared rules for every `/rm-*` skill. Read once per session; the individual skills
reference this file instead of repeating it. (Pattern adopted from gstack.)

---

## The golden rule (non-negotiable)

> **Edit the data, never the HTML. Then rebuild.**

`PM/index.html` is a generated artifact. Edit `PM/data/*.json` (or `PM/comms/*` for the
relay), then run `rocketman build`. A PreToolUse hook (`.claude/hooks/guard-generated.sh`)
blocks direct writes to `PM/index.html` — if you hit it, you're editing the wrong file.

Full data schema + ID scheme + the single-writer rule live in **`PM/CLAUDE.md`**. Read it
before changing any data.

---

## Plan mode

If the user invokes a `/rm-*` skill while in plan mode, the skill takes precedence over
generic plan-mode behavior. Treat the SKILL.md as executable instructions and follow it
from Phase 1.

- **Safe in plan mode** (they inform the plan, don't ship): `rocketman build`, `doctor`,
  `relay poll/inbox/agents`, reading any `PM/` file, and writing to the plan file.
- **Not in plan mode** (defer until approved): `git commit`/`push`, `rocketman launch`,
  `/rm-mirror` pushing to an external tool, anything outward-facing.
- The first `AskUserQuestion` is the skill entering plan mode, not a violation. At an
  explicit STOP point, stop — do not call ExitPlanMode. Call it only when the workflow
  completes or the user says to leave plan mode.

If no `AskUserQuestion` tool is available, a skill that needs a decision is **BLOCKED** —
say so and wait; never silently auto-decide.

---

## Asking the user (decision-brief format)

When a choice is genuinely the user's, ask via `AskUserQuestion` — not prose. Keep it tight:

- One-line question title.
- **Plain-English stakes:** what breaks if we pick wrong (1–2 sentences, no jargon).
- **Recommendation:** name a default and one-line why. Put `(recommended)` on one option.
- 2–4 options, each with an honest pro and con.

Don't ask about things with an obvious default or that the data already answers. Pick the
obvious option, say so, and proceed.

---

## Completion Status Protocol

End every skill run with one of:

- **DONE** — completed, with evidence (the build output, the doctor result, the file written).
- **DONE_WITH_CONCERNS** — completed, but list what you couldn't fully verify.
- **BLOCKED** — can't proceed; state the blocker and what you tried.
- **NEEDS_CONTEXT** — missing info; state exactly what you need.

Escalate after 3 failed attempts at the same thing, on anything security-sensitive, or on
scope you can't verify. Report: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

---

## Voice

Builder to builder. Lead with the point. Name the file, the id, the command, the
user-visible effect.

- Be concrete: real ids (`RM-7`, `ADR-5`), real file paths, real outputs.
- Be honest about quality: surface broken refs, stale builds, and blockers, don't paper
  over them.
- No em dashes. No filler. No AI vocabulary (delve, crucial, robust, comprehensive,
  seamless, leverage, landscape).
- The user has context you don't. A recommendation is a recommendation; the user decides.

---

## After any change

1. `rocketman build` (regenerates `PM/index.html`, runs the doctor, prints reference issues).
2. Fix any doctor warnings before finishing.
3. Commit `PM/data/` **and** `PM/index.html` together with the related code change.
