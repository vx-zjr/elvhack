# elvhack

Personal blog built on Astro Cactus, with a minimal shader portal as the home page.

```text
/
├─ QUANT / TECHNOLOGY portal
├─ /zh/quant
├─ /en/quant
├─ /zh/technology
├─ /en/technology
├─ /<lang>/<category>/<slug>
│  └─ canonical markdown posts
├─ /posts
│  └─ compatibility listing
└─ /about
   └─ quiet placeholder
```

## Daily Workflow

```bash
make install
make dev
make new-post title="测试一下" lang=zh category=technology
make build
```

The home page is a static Astro page with a bundled vanilla WebGL runtime. Posts
are Markdown files under `src/content/post` with explicit `lang`, `category`,
`translationKey`, and `slug` frontmatter.

Create paired Chinese and English posts with the same `translationKey`:

```bash
make new-post title="量化示例" lang=zh category=quant translationKey=quant-example slug=liang-hua-shi-li
make new-post title="Quant Example" lang=en category=quant translationKey=quant-example slug=quant-example
```

## Deployment

`wrangler.jsonc` makes Cloudflare Workers Builds run `npm run build` and deploy
`./dist` as static assets. Pushes to `main` are the source of truth.

Current canonical fallback:

```text
https://elvhack.vx-zjr-v.workers.dev
```

When the custom domain is ready, set `SITE_URL=https://elvhack.com` in
Cloudflare production variables and trigger a redeploy.

## Checks

```bash
make test
make build
make lint
make linkcheck
```
