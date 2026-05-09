# elvhack

Personal blog built on Astro Cactus, with a shader surface as the home page.

```text
/
├─ shader home
├─ /posts
│  └─ markdown posts
└─ /about
   └─ quiet placeholder
```

## Daily Workflow

```bash
make install
make dev
make new-post title="测试一下"
make build
```

The home page is a static Astro page with a bundled vanilla WebGL runtime. Posts
are Markdown files under `src/content/post`.

## Deployment

`wrangler.jsonc` makes Cloudflare Workers Builds run `npm run build` and deploy
`./dist` as static assets. Pushes to `main` are the source of truth.

Current canonical fallback:

```text
https://elvhack.pages.dev
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
