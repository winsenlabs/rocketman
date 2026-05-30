---
title: Edit from the browser
---

# Edit from the browser

The committed `PM/index.html` is read-only by design — you open it offline and it can't
write to disk. When you want to add comments, edit docs, or move cards *from the browser*,
run the local edit server.

## Start the server

```
rocketman serve
```

It serves the same hub at `http://localhost:4317`. Because it's served over http (not
`file://`), edit affordances light up:

- A **comment composer** on tasks and decisions
- A **"Move to"** dropdown on tasks
- An **Edit** button on docs

Every change writes straight back to `PM/data/*.json` and rebuilds `PM/index.html`. The
committed file stays read-only; editing is opt-in via the server.

## Why two modes

| | `file://` (double-click) | `rocketman serve` (localhost) |
|---|---|---|
| Read everything | ✅ | ✅ |
| Works offline, no setup | ✅ | needs the server running |
| Add comments / edit docs / move cards | — | ✅ |
| Writes to | nothing (read-only) | `PM/data/*.json`, then rebuilds |

Stop the server with Ctrl-C. Use `--port` to change the port.
