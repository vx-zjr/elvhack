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

## Todo

- Fix any typecheck/lint/build issues found by verification.
- Recreate GitHub repository and Cloudflare Pages project.
- Start local dev server and inspect the rendered homepage.

## Known Constraints

- Supabase credentials are not yet available. Runtime calls must fail gracefully when env vars are absent.
- Local Node is available through the Codex bundled runtime, not the system PATH.
- `npm install` reports two high-severity audit findings in transitive dev dependencies; do not run force fixes until compatibility is reviewed.
