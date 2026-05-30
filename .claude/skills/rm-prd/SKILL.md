---
name: rm-prd
version: 0.1.0
description: Stage 2 of the Rocketman Track. Turns an idea brief into a structured PRD written into PM/data/spec.json, then rebuilds the hub. Use after /rm-ideate, or when the user asks to "write the spec", "create a PRD", or "document requirements". Reads PM/IDEA.md if present.
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

# /rm-prd — write the spec into the hub

## When to invoke

After `/rm-ideate`, or when the user asks to write the spec / PRD / requirements. Turns the
idea into structured data in `PM/data/spec.json` — never freeform prose.

## Conventions

Read `.claude/skills/CONVENTIONS.md` and `PM/CLAUDE.md` (the spec schema). Edit data, not the
HTML.

## Phase 1 — Gather

Read `PM/IDEA.md` if it exists. If there's no brief, run a quick version of `/rm-ideate`'s
questions first. Confirm: target users, the wedge, success metrics, explicit non-goals. Don't
invent — ask via `AskUserQuestion`.

## Phase 2 — Write `spec.json`

Populate `spec.spec.sections[]` (each `{id, n, kicker, title, blocks[]}`). Block types the
renderer supports:

- `{type:"p", html}` — prose (`<b>`, `<em>`, `<code>`, and `[[id|label]]` links)
- `{type:"persona", name, role, jobs:[]}`
- `{type:"story", sid, title, asIf, ac:[]}` — story + Given/When/Then acceptance criteria
- `{type:"table", title, rows:[{id, prio:"must|should|could", text}]}`
- `{type:"budgets", items:[{k, v, d}]}` — non-functional budgets
- `{type:"metrics", items:[{v, k, t}]}` — success metrics

Recommended sections: **Vision · Problem · Personas & JTBD · Requirements (stories + a
functional table) · Non-functional · Flows · Success Metrics · Non-Goals · Risks**. Mirror
`spec.nav[]` to the sections. Seed `docs` (Diátaxis tree) if the project needs user docs.

**Mandatory:** Non-Goals and Risks. The most-skipped sections are the most valuable. Write
acceptance criteria as testable Given/When/Then.

## Finish

```bash
rocketman build      # rebuild + doctor
```

Confirm the doctor is clean. Report Completion Status.

> Spec written and the hub is rebuilt. Open the **Spec** view. Ready to plan? Run **`/rm-plan`**.
