#!/usr/bin/env bash
set -euo pipefail

title="${1:-${title:-}}"
lang="${lang:-zh}"
category="${category:-technology}"
explicit_slug="${slug:-}"
translation_key="${translationKey:-}"

if [[ -z "${title// }" ]]; then
  printf 'usage: make new-post title="Post title" [lang=zh|en] [category=quant|technology] [translationKey=key] [slug=post-slug]\n' >&2
  exit 1
fi

case "$lang" in
  zh|en) ;;
  *)
    printf 'invalid lang: %s (expected zh or en)\n' "$lang" >&2
    exit 1
    ;;
esac

case "$category" in
  quant|technology) ;;
  *)
    printf 'invalid category: %s (expected quant or technology)\n' "$category" >&2
    exit 1
    ;;
esac

derived_slug="$(node -e "import('./scripts/slugify-title.mjs').then(({ slugifyTitle }) => process.stdout.write(slugifyTitle(process.argv[1])))" "$title")"
post_slug="${explicit_slug:-$derived_slug}"
translation_key="${translation_key:-$post_slug}"

if [[ -z "$post_slug" ]]; then
  printf 'could not derive slug from title: %s\\n' "$title" >&2
  exit 1
fi

target="src/content/post/${post_slug}.md"

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
  printf 'lang: "%s"\n' "$lang"
  printf 'category: "%s"\n' "$category"
  printf 'translationKey: "%s"\n' "$translation_key"
  printf 'slug: "%s"\n' "$post_slug"
  printf 'tags: []\n'
  printf 'draft: true\n'
  printf -- '---\n\n'
} > "$target"

printf '%s\n' "$target"
