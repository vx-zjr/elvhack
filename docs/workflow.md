# Workflow

## Local Development

```bash
make install
make dev
```

The development server is Astro. The shader home page is client-side WebGL, but
the page itself is still statically built.

## Writing

Create posts through the helper so Chinese titles get pinyin slugs and every
post gets bilingual routing frontmatter:

```bash
make new-post title="AI 编程的边界" lang=zh category=technology translationKey=ai-programming-boundary
```

The helper writes a draft file in `src/content/post`.

## Checks

```bash
make test
make build
make lint
make linkcheck
```

`lychee` is installed on this machine with `pacman`. On a fresh Arch system:

```bash
sudo pacman -S lychee
```
