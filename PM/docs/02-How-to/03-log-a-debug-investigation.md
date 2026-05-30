---
title: Log a debug investigation
---

# Log a debug investigation

Turn debugging into a durable, linkable trail instead of lost chat history.
Investigations live in `PM/data/content.json` under `debug[]` and render in the **Debug**
view as a timeline: symptom → hypotheses → repro → root cause → fix → guard.

## The fast way

```
rocketman new debug "Hub renders blank from the bundle"
rocketman build
```

Or run **`/rm-debug`**, which enforces the discipline (no fix without a confirmed root
cause).

## The shape

```
{
  "id": "bug-04", "ref": "BUG-4", "title": "...", "state": "investigating",
  "task": "rm-02", "owner": "opus", "elapsed": "25m", "hyposCount": 2,
  "summary": "one line — the failure",
  "symptom": "what's observed",
  "hypotheses": [
    { "status": "refuted",   "text": "...", "note": "evidence" },
    { "status": "confirmed", "text": "...", "note": "evidence" }
  ],
  "repro": ["step 1", "step 2"],
  "rootCause": "the confirmed cause",
  "fix": { "text": "what fixed it", "pr": 1, "commit": "a1b2c3d", "file": "engine/build.mjs" },
  "guard": "the test/assert that stops it recurring",
  "timeline": [ { "stage": "symptom", "kind": "alert", "when": "25m ago", "who": "opus" } ],
  "backlinks": ["rm-02"]
}
```

## Notes

- `state`: `investigating` → `root-caused` → `fixed` → `monitoring`.
- Each hypothesis has a `status`: `testing` · `confirmed` · `refuted` — shown with a tag.
- Every fix needs a `guard`: the regression test that makes the bug unable to recur
  silently.
- The Debug view builds the timeline from whichever content fields are present, so you can
  fill it in as the investigation unfolds. Then `rocketman build`.
