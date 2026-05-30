---
name: rm-debug
description: Record a structured debugging investigation in PM/data/content.json — symptom → hypotheses → repro → root cause → fix → guard. Use when investigating a bug, a regression, or "why is this broken", and to capture the trail so it isn't lost. Pairs with any root-cause debugging workflow.
---

# /rm-debug — log the investigation

Turn debugging into a durable, linkable trail instead of lost chat history. **Iron law: no fix
without a confirmed root cause.**

## Create / update the entry

Append to `debug[]` in `PM/data/content.json` with the next id (`bug-NN`):

```json
{
  "id": "bug-04", "ref": "BUG-4", "title": "…", "state": "investigating",
  "task": "<task id this blocks/relates to>", "owner": "<person id>",
  "elapsed": "—", "hyposCount": 0,
  "summary": "one line — the failure",
  "symptom": "what's observed",
  "hypotheses": [ { "status": "testing|confirmed|refuted", "text": "…", "note": "evidence" } ],
  "repro": [ "step 1", "step 2", "…" ],
  "rootCause": "the confirmed cause (fill once known)",
  "fix": { "text": "what fixed it", "pr": 0, "commit": "", "file": "" },
  "guard": "the test/assert that stops it recurring",
  "timeline": [ { "stage": "symptom|hypothesis|repro|rootcause|fix|guard", "kind": "alert|search|check|bug|commit", "when": "…", "who": "<person id>" } ],
  "backlinks": ["<task id>"]
}
```

## Discipline

- Work the stages in order; mark each hypothesis `confirmed`/`refuted` with evidence.
- Set `state`: `investigating` → `root-caused` → `fixed` → `monitoring`.
- Every fix needs a `guard` — the regression test/assert that makes the bug unable to recur silently.
- Link the fix to its `task` and the `pr`/`commit` that carried it.

## Finish

```bash
node engine/build.mjs
```

> Logged <BUG>. The investigation timeline is in the **Debug** view, linked to <task>.
