# Agent Rules

## Project Core

This is `elvhack`: restrained, technical, and text-first. Do not add emojis,
badge clutter, tracking scripts, analytics SDKs, ad tech, or decorative
frameworks.

## Fixed Decisions

- Astro Cactus stays the base.
- Tailwind v4 stays the styling layer.
- Cloudflare Workers Builds stays the deployment path.
- The home route is the shader surface.
- Blog writing lives in `src/content/post`.

## Design Language

- Use only the tokens in `src/styles/global.css`.
- If a visual token changes, update `docs/design-tokens.md` in the same change.
- Do not introduce Framer Motion, GSAP, Lottie, or animation libraries.
- Prefer CSS keyframes for UI motion. JavaScript motion is reserved for WebGL.
- New components need a clear reason and should follow the existing quiet UI.

## Writing

- Required frontmatter: `title`, `publishDate`.
- Keep `description`, `tags`, and `draft` explicit for posts.
- Chinese slugs use `scripts/new-post.sh` and pinyin conversion.
- In mixed Chinese and English prose, put spaces around numbers and English.

## Change Discipline

- Do not silently add dependencies.
- Do not silently change `.github/workflows`.
- Avoid broad refactors unless the task requires them.
- Do not commit secrets, tokens, generated deploy output, or local env files.
