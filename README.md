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

`wrangler.toml` configures Cloudflare Workers Static Assets to serve `./dist`
and runs `src/worker.ts` for `/api/*`. Pushes to `main` are the source of truth
for the connected Cloudflare Workers Builds project.

Current canonical fallback:

```text
https://elvhack.vx-zjr-v.workers.dev
```

When the custom domain is ready, set `SITE_URL=https://elvhack.com` in
Cloudflare production variables and trigger a redeploy.

### D1 Likes

The Worker expects a D1 binding named `DB`:

```toml
main = "./src/worker.ts"

[assets]
directory = "./dist"
binding = "ASSETS"
run_worker_first = ["/api/*"]

[[d1_databases]]
binding = "DB"
database_name = "prod-d1-tutorial"
database_id = "588dc81a-d609-4b2f-9e92-e30c468b20d7"
preview_database_id = "DB"
```

Run the migration locally before local API testing:

```bash
npx wrangler d1 execute prod-d1-tutorial --local --file=./migrations/0001_create_post_likes.sql
```

Run it remotely before production writes:

```bash
npx wrangler d1 execute prod-d1-tutorial --remote --file=./migrations/0001_create_post_likes.sql
```

Test the Worker locally:

```bash
npm run build
npx wrangler dev --port 8788
curl "http://localhost:8788/api/likes?slug=test-post"
curl -X POST "http://localhost:8788/api/likes" \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-post"}'
```

Cloudflare Workers Builds should use:

```bash
npm run build
npx wrangler deploy
```

## Checks

```bash
make test
npm run check
make build
make lint
make linkcheck
```

## TODOs

- Set `SITE_URL` to the real custom domain when it is ready.
- Replace placeholder social profile URLs in `src/data/links.ts`.
- Replace `/images/wechat-qr-placeholder.svg` with the real public WeChat QR
  image if WeChat should be listed publicly.
- Replace `public/social-card.png` if a custom default OG image is preferred.
