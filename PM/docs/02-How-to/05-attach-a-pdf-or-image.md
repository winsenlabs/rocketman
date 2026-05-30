---
title: Attach a PDF or image
---

# Attach a PDF or image

Put the file in `PM/files/`, link to it from any doc, and rebuild. The build embeds it
into the hub as a data URI, so `PM/index.html` stays a single offline file — the PDF
travels inside it.

## Add a PDF

```
# 1. drop the file in
cp ~/Downloads/spec-v2.pdf PM/files/

# 2. link to it from a doc (relative path from the .md to PM/files/)
#    in PM/docs/How-to/something.md:
#    [Spec v2](../../files/spec-v2.pdf)

# 3. rebuild
rocketman build
```

A PDF link renders as an attachment card with an **Open / download** button and an
inline preview. Here is the sample shipped with Rocketman:

[Rocketman overview (sample PDF)](../../files/rocketman-overview.pdf)

## Add an image

Images embed inline. Use Markdown image syntax:

```
![Pipeline diagram](../../files/diagram.svg)
```

![Pipeline diagram](../../files/diagram.svg)

PNG, JPG, GIF, SVG, and WebP all work.

## Rules & limits

- **Paths are relative to the `.md` file.** From `PM/docs/How-to/x.md`, the files
  folder is `../../files/`.
- **Local only.** `http(s)://` and `data:` links are left as-is, not embedded.
- **Size guard.** Files over 8 MB are left as a plain link (not embedded) and the build
  prints a warning, so the hub never balloons. Keep attachments small, or link out for
  big ones.
- **It stays offline.** Because the bytes are embedded, the single `PM/index.html` opens
  the PDF and shows the image with no network and no sidecar files.
