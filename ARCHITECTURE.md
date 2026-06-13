# Elvhack Architecture

## 1. Business Scenario And Core Features

`elvhack` is a visual-first dynamic personal blog and technical showcase. The site presents a highly immersive homepage for the `elvhack` identity, a polished public blog, a lab/experiments area, and a minimal but complete CMS for writing and publishing content.

The project is not a generic SaaS dashboard, static landing page, or broad CMS product. Every UI, API, and data model must serve this specific scenario: a personal technical publication and portfolio that demonstrates edge-native full-stack craft.

Core features:

- Immersive public homepage with animated technical atmosphere and direct paths to writing, lab work, and biography.
- Public blog index and article detail pages backed by Supabase content.
- Public lab and about pages for experiments, technical identity, and project context.
- Admin CMS for GitHub-authenticated, whitelisted users to create, edit, draft, publish, and unpublish posts.
- Public reactions, comments, and page-view analytics through Cloudflare Pages Functions.

## 2. Runtime And Deployment Architecture

- Frontend: Vite + React + TypeScript SPA, styled with Tailwind CSS.
- Hosting: Cloudflare Pages serves the static SPA build from `dist/`.
- Backend: Cloudflare Pages Functions in `/functions/api/**` act as the Edge BFF layer.
- Data and auth: Supabase Auth with GitHub OAuth, Supabase Postgres exposed through REST-compatible clients.
- Secrets: Supabase service role and admin username whitelist live only in local `.env.local` or Cloudflare Pages environment variables.

Edge constraints:

- No native Node.js or C++ dependencies.
- No `fs`, TCP Postgres drivers, or Node-only crypto in runtime code.
- Edge functions use `fetch`, Web Crypto, Zod validation, and structured JSON responses.
- Request CPU work must stay small and bounded; no SSR, no markdown compilation in Functions, and no unbounded loops over database rows.
- Pages `wrangler.jsonc` must stay within Pages-supported fields. Do not place Worker-only `observability` config in this file.

## 3. Frontend Route Tree

- `/` - immersive homepage, featured writing, lab highlights, status cards.
- `/blog` - searchable public post index.
- `/blog/:slug` - article detail with comments and reactions.
- `/lab` - technical experiments and edge architecture showcase.
- `/about` - personal and project background.
- `/admin` - admin gate and session state.
- `/admin/posts` - post list and create action.
- `/admin/posts/:id` - post editor, metadata, draft/publish controls.

## 4. Pages Functions API Tree

- `GET /api/posts` - list posts. Public users receive published posts; admins may request drafts.
- `GET /api/posts/:slug` - fetch one published post by slug.
- `POST /api/admin/posts` - create a post draft. Admin only.
- `PATCH /api/admin/posts/:id` - update an existing post. Admin only.
- `POST /api/admin/posts/:id/publish` - publish or unpublish a post. Admin only.
- `GET /api/admin/me` - validate the current Supabase session and GitHub whitelist status.
- `POST /api/comments` - create a public comment pending moderation.
- `POST /api/reactions` - upsert a public reaction event.
- `POST /api/page-view` - record a bounded page-view analytics event.

All API routes return the normalized shape:

```json
{ "ok": true, "data": {} }
```

or

```json
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

## 5. Supabase Schema Source Of Truth

Migrations live under `supabase/migrations/` and are mirrored here for memory alignment.

Tables:

- `profiles`: Supabase user profile, GitHub username, avatar, display name, timestamps.
- `admin_users`: GitHub username whitelist for CMS access, seeded with `vx-zjr`.
- `posts`: title, slug, excerpt, markdown content, cover image, `draft` / `published` / `archived` status, timestamps, GitHub author fields.
- `tags`: tag registry with unique names.
- `post_tags`: many-to-many post/tag relationship.
- `comments`: article comments with `pending` / `approved` / `rejected` moderation status.
- `reactions`: lightweight reaction events with `spark`, `useful`, or `mindblown` kind.
- `page_views`: bounded analytics event with path, optional slug/referrer, user-agent family, timestamp.
- `audit_events`: admin action trail with actor, action, subject, metadata, timestamp.

RLS is enabled on all tables. Public reads are limited to published posts, approved comments, tags, and post_tags. Service role access through Cloudflare Pages Functions owns all privileged CMS writes.

## 6. Local Development And Verification

Use these commands from the project root:

```powershell
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npx wrangler pages dev dist --compatibility-date 2026-06-13
```

When the local system lacks `npm`, use the Codex bundled Node/npm shim already prepared under `work/npm-cli` during this rebuild session.

## 7. Development Memory Lifecycle

Every task must start by reading this file and `CONTEXT_LOG.md`. Every task must end by updating `CONTEXT_LOG.md`, and must update this file whenever business scope, routes, APIs, schema, or runtime architecture changes.
