---
title: Add a spec section
---

# Add a spec section

The product spec lives in `PM/data/spec.json` under `spec.sections[]` and renders in the
**Spec** view. Add a section object and a matching nav entry.

## Add the section

```
{
  "id": "metrics", "n": "07", "kicker": "Success Metrics",
  "title": "How we'll know it works",
  "blocks": [
    { "type": "metrics", "items": [
      { "v": "< 10s", "k": "Time to project state", "t": "open hub → understand status" }
    ]}
  ]
}
```

Mirror it in `spec.nav[]` so it appears in the section rail:

```
{ "id": "metrics", "label": "Success Metrics", "group": "Outcomes" }
```

## Block types

| Type | Use for |
|---|---|
| `p` | Prose (`<b>`, `<em>`, `<code>`, and `[[id\|label]]` links) |
| `persona` | `{ name, role, jobs: [] }` |
| `story` | `{ sid, title, asIf, ac: [] }` — user story + Given/When/Then criteria |
| `table` | `{ title, rows: [{ id, prio: "must\|should\|could", text }] }` |
| `budgets` | `{ items: [{ k, v, d }] }` — non-functional budgets |
| `metrics` | `{ items: [{ v, k, t }] }` — success metrics |

The fastest way to author a whole spec is the **`/rm-prd`** skill, which generates these
sections from an idea brief. Then `rocketman build`.
