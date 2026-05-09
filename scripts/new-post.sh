#!/usr/bin/env bash
set -euo pipefail

title="${1:-${title:-}}"

if [[ -z "${title// }" ]]; then
  printf 'usage: make new-post title="Post title"\\n' >&2
  exit 1
fi

slug="$(node -e "import('./scripts/slugify-title.mjs').then(({ slugifyTitle }) => process.stdout.write(slugifyTitle(process.argv[1])))" "$title")"

if [[ -z "$slug" ]]; then
  printf 'could not derive slug from title: %s\\n' "$title" >&2
  exit 1
fi

target="src/content/post/${slug}.md"

if [[ -e "$target" ]]; then
  printf 'post already exists: %s\\n' "$target" >&2
  exit 1
fi

today="$(date +%F)"

{
  printf -- '---\n'
  printf 'title: "%s"\n' "$title"
  printf 'description: ""\n'
  printf 'publishDate: "%s"\n' "$today"
  printf 'tags: []\n'
  printf 'draft: true\n'
  printf -- '---\n\n'
} > "$target"

printf '%s\n' "$target"
