# Deployment

Cloudflare Workers Builds owns production deployment. Git is the deployment
trigger.

## Current Flow

1. Push to `main`.
2. Cloudflare Workers Builds checks out the repo.
3. Workers Builds runs `npm run build`.
4. Workers deploys `./dist` as Static Assets and runs `src/worker.ts` for
   `/api/*`.

No local deploy is required for normal Git-connected work.

## Required Cloudflare Shape

`wrangler.toml` contains:

```toml
name = "elvhack"
compatibility_date = "2026-05-01"
main = "./src/worker.ts"
workers_dev = true

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

In the Cloudflare Workers Builds dashboard, confirm:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- `workers.dev` route is enabled, or a custom domain/route is active
- Production D1 binding: `DB` -> `prod-d1-tutorial`
- Preview D1 binding: `DB` -> the intended preview database, or the same
  database if that is the deliberate choice

For direct CLI deployment:

```bash
npm run build && npx wrangler deploy
```

## D1 Migration

Local:

```bash
npx wrangler d1 execute prod-d1-tutorial --local --file=./migrations/0001_create_post_likes.sql
```

Remote production:

```bash
npx wrangler d1 execute prod-d1-tutorial --remote --file=./migrations/0001_create_post_likes.sql
```

Local API smoke test:

```bash
npm run build
npx wrangler dev --port 8788
curl "http://localhost:8788/api/likes?slug=test-post"
curl -X POST "http://localhost:8788/api/likes" \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-post"}'
```

## Custom Domain Migration

When `elvhack.com` is ready:

1. Open Cloudflare Workers & Pages.
2. Open `elvhack`.
3. Add `elvhack.com` and `www.elvhack.com` under Custom Domains.
4. Add production variable `SITE_URL=https://elvhack.com`.
5. Trigger a redeploy from the latest `main`.
6. Confirm canonical links and RSS use `https://elvhack.com`.
7. Keep `https://elvhack.vx-zjr-v.workers.dev` as the fallback URL.

## Security Cleanup

Revoke temporary GitHub and Cloudflare tokens after deployment verification.
