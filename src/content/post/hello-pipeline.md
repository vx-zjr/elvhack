---
title: "Hello pipeline"
description: "End-to-end smoke test of the publish flow."
publishDate: "2026-05-09"
tags: ["meta"]
draft: false
---

A short note to verify the publish pipeline end-to-end:

1. `make new-post title="Hello pipeline"` scaffolded this file with `draft: true` frontmatter
2. The body and `draft: false` were filled in by hand
3. `git commit` + `git push origin main` shipped the source
4. A separate deploy step pushed the built `dist/` to Cloudflare

If you can read this on the live site, all four steps held.

```bash
make new-post title="..."   # scaffold
$EDITOR src/content/post/<slug>.md
git add . && git commit -m "post: ..."
git push
```
