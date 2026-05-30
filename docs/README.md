# Rocketman docs

Documentation is organized by [Diátaxis](https://diataxis.fr/) — four modes for four needs. The
same content is also rendered inside the hub's **Docs** view (open [`PM/index.html`](../PM/index.html)).

## Tutorial — *learn by doing*
- [Your first Rocketman project](tutorial/your-first-project.md)

## How-to — *solve a specific task*
- Add Rocketman to an existing repo → `npx rocketman init`
- Write a PRD with the track → `/rm-ideate` then `/rm-prd`
- Run a build & verify on CI → `node engine/build.mjs --check`

## Reference — *look it up*
- [CLI commands](reference/cli.md)
- Data schema → see [`PM/CLAUDE.md`](../PM/CLAUDE.md)

## Explanation — *understand the why*
- [Why HTML, not markdown](explanation/why-html.md)
- [The agent relay (inter-agent handoffs)](explanation/agent-relay.md)

---

New here? Start with the [README](../README.md), then open the hub and skim Rocketman managing
its own development.
