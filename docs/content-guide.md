# Content Guide

Posts live in `src/content/post`.

```yaml
---
title: "Post title"
description: "One sentence summary."
publishDate: "2026-05-09"
tags: ["intro"]
draft: false
---
```

## Rules

- `title` and `publishDate` are required.
- Keep `description` present, even if it starts empty in a draft.
- Use `draft: true` until the post is ready.
- Use `scripts/new-post.sh` for Chinese titles.
- Keep tags lowercase.
- For ambiguous Chinese pronunciation, rename the file manually after creation.
