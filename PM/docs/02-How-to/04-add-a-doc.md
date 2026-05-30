---
title: Add a doc (Markdown)
---

# Add a doc (Markdown)

Docs in the hub are plain Markdown files under `PM/docs/`. Drop a `.md` file in,
rebuild, and it appears in the **Docs** view. This very page is one of them.

## The fast way

```
# create the file
mkdir -p PM/docs/How-to
echo "# My new guide\n\nSteps go here." > PM/docs/How-to/my-guide.md

# rebuild the hub
rocketman build
```

Open the Docs view — "My Guide" is now in the **How-to** folder.

## Folders become the tree

The folder structure under `PM/docs/` *is* the navigation tree, nested as deep as you
like:

```
PM/docs/
  01-Tutorial/
    01-your-first-project.md
  02-How-to/
    04-add-a-doc.md
  03-Reference/
    01-data-schema.md
```

- A numeric prefix (`01-`, `02-`) controls order and is stripped from the label.
- Dashes and underscores become spaces; the label is title-cased.
- Sub-folders nest — `PM/docs/Reference/API/auth.md` makes a `Reference → API` tree.

## Optional frontmatter

Set the display title explicitly with YAML frontmatter at the top:

```
---
title: A nicer title than the filename
---

# Heading
...
```

Without it, the title comes from the first `# heading`, then the filename.

## What Markdown is supported

Headings, **bold**, *italic*, `inline code`, lists (nested), ordered lists, links,
images, code fences, blockquotes, pipe tables, and horizontal rules. Enough for real
docs, zero dependencies.

## How it works

`rocketman build` converts every `.md` under `PM/docs/` to HTML and folds it into the
hub. If `PM/docs/` exists, it is the source for the Docs view (it supersedes any `docs`
block in `spec.json`). Edit the Markdown, rebuild, done — the golden rule holds: you
never touch `PM/index.html`.
