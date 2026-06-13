# Elvhack Context Log

## Current Global State

- Project reset has started in a fresh local workspace.
- Business scenario: visual-first dynamic personal blog and technical showcase.
- Frontend target: Vite + React + TypeScript + Tailwind CSS SPA.
- Backend target: Cloudflare Pages Functions on the Edge Runtime.
- Data/auth target: Supabase with GitHub OAuth and a GitHub username admin whitelist.

## Development Progress

- 2026-06-13: Deleted previous GitHub repository `vx-zjr/elvhack` and Cloudflare resources named `elvhack` / `elvhack-session`.
- 2026-06-13: Created initial architecture and context memory documents for the rebuild.
- 2026-06-13: Scaffolded Vite + React + TypeScript + Tailwind app, Cloudflare Pages Functions API, normalized Edge helpers, API tests, public routes, admin CMS routes, and Supabase initial migration.
- 2026-06-13: Verified `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` with the bundled Node/npm shim. Recreated GitHub repository `vx-zjr/elvhack`, pushed `main` and `feature/edge-cms-rebuild`, and created Cloudflare Pages project `elvhack` at `elvhack.pages.dev`.
- 2026-06-13: Started local Vite preview on `http://127.0.0.1:4173/` and Wrangler Pages dev on `http://127.0.0.1:8788/`. Confirmed homepage and SPA fallback return 200; API routes return structured JSON errors when Supabase env vars are absent.
- 2026-06-13: First Cloudflare Pages deployment failed because Pages config validation rejects Worker-only `observability` in `wrangler.jsonc`; removed that field and documented the constraint.

## Todo

- Add real Supabase project credentials to `.env.local` and Cloudflare Pages environment variables.
- Apply Supabase migration `20260613000000_initial_elvhack_cms.sql` to the target Supabase project.
- Trigger and inspect the first Cloudflare Pages deployment after environment variables are configured.

## Known Constraints

- Supabase credentials are not yet available. Runtime calls must fail gracefully when env vars are absent.
- Local Node is available through the Codex bundled runtime, not the system PATH.
- `npm install` reports two high-severity audit findings in transitive dev dependencies; do not run force fixes until compatibility is reviewed.
- The GitHub token supplied in chat was used for repository creation and push; it should be revoked and replaced.
