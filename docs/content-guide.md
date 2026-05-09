# Content Guide

Posts live in `src/content/post`.

```yaml
---
title: "Post title"
description: "One sentence summary."
publishDate: "2026-05-09"
lang: "en"
category: "technology"
translationKey: "example-post"
slug: "example-post"
tags: ["intro"]
draft: false
---
```

## Rules

- `title` and `publishDate` are required.
- Keep `description` present, even if it starts empty in a draft.
- Set `lang` to `zh` or `en`.
- Set `category` to `quant` or `technology`.
- Use the same `translationKey` for paired Chinese and English versions.
- `slug` is the public URL segment and can differ by language.
- Use `draft: true` until the post is ready.
- Use `scripts/new-post.sh` for Chinese titles.
- Keep tags lowercase.
- For ambiguous Chinese pronunciation, rename the file manually after creation.

## Routes

Canonical article routes are language and category scoped:

```text
/<lang>/<category>/<slug>/
```

Category list routes are:

```text
/zh/quant/
/en/quant/
/zh/technology/
/en/technology/
```

RSS feeds are available at `/zh/rss.xml`, `/en/rss.xml`, and the compatibility
feed `/rss.xml`.

## Creating Paired Posts

Create each language version as its own Markdown file. Keep `translationKey`
identical and choose the slug that reads naturally in that language.

```bash
make new-post title="量化示例" lang=zh category=quant translationKey=quant-example slug=liang-hua-shi-li
make new-post title="Quant Example" lang=en category=quant translationKey=quant-example slug=quant-example
```
