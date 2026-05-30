---
name: rm-prd
description: Stage 2 of the Rocketman Track. Turns an idea brief into a structured PRD written into PM/data/spec.json, then rebuilds the hub. Use after /rm-ideate, or when the user asks to "write the spec", "create a PRD", or "document requirements". Reads PM/IDEA.md if present.
---

# /rm-prd — write the spec into the hub

Turn the idea into a real PRD as **structured data** in `PM/data/spec.json`. Read
`PM/CLAUDE.md` for the schema and `PM/IDEA.md` (if present) for the brief.

## Gather what's missing

If there's no idea brief, run a quick version of `/rm-ideate`'s questions first. Then confirm:
target users, the wedge, success metrics, and explicit non-goals. Don't invent — ask.

## Write `spec.json`

Populate `spec.spec` with these sections (each an object with `id`, `n`, `kicker`, `title`,
`blocks[]`). Use the block types the renderer supports:

- `{ "type": "p", "html": "…" }` — prose (use `<b>`, `<em>`, `<code>`, and `[[id|label]]` links)
- `{ "type": "persona", "name", "role", "jobs": [] }`
- `{ "type": "story", "sid": "US-1", "title", "asIf", "ac": [] }` — story + acceptance criteria
- `{ "type": "table", "title", "rows": [{ "id", "prio": "must|should|could", "text" }] }`
- `{ "type": "budgets", "items": [{ "k", "v", "d" }] }` — non-functional budgets
- `{ "type": "metrics", "items": [{ "v", "k", "t" }] }` — success metrics

Recommended section set: **Vision · Problem · Personas & JTBD · Requirements (stories + a
functional table) · Non-functional (budgets) · Flows · Success Metrics · Non-Goals · Risks**.
Mirror the `nav[]` entries to the sections (`id` + `label` + `group`).

Also seed `docs` (Diátaxis groups + content) if the project needs user-facing docs.

## Rules

- **Non-goals and risks are mandatory.** The most-skipped sections are the most valuable.
- Write acceptance criteria as testable Given/When/Then.
- Link spec claims to the tasks/ADRs that satisfy them with `[[id]]` once they exist.

## Finish

```bash
node engine/build.mjs        # rebuild + doctor
```

Confirm the doctor is clean, then:

> Spec written to `PM/data/spec.json` and the hub is rebuilt. Open the **Spec** view. Ready to
> break it into a plan? Run **`/rm-plan`**.
