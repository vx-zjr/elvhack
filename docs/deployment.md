# Deployment

Cloudflare owns production deployment. Git is the deployment trigger.

## Current Flow

1. Push to `main`.
2. Cloudflare Workers Builds checks out the repo.
3. `wrangler.jsonc` tells Wrangler to run `npm run build`.
4. Wrangler deploys `./dist` as static assets.

No local `wrangler deploy` is required for normal work.

## Required Cloudflare Shape

`wrangler.jsonc` contains:

```jsonc
{
  "name": "elvhack",
  "compatibility_date": "2026-05-01",
  "build": {
    "command": "npm run build"
  },
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

If a build fails because Cloudflare ignores `build.command`, set the dashboard
deploy command to:

```bash
npm run build && npx wrangler deploy
```

## Custom Domain Migration

When `elvhack.com` is ready:

1. Open Cloudflare Workers & Pages.
2. Open `elvhack`.
3. Add `elvhack.com` and `www.elvhack.com` under Custom Domains.
4. Add production variable `SITE_URL=https://elvhack.com`.
5. Trigger a redeploy from the latest `main`.
6. Confirm canonical links and RSS use `https://elvhack.com`.
7. Keep `https://elvhack.pages.dev` as the fallback URL.

## Security Cleanup

Revoke temporary GitHub and Cloudflare tokens after deployment verification.
