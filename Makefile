.PHONY: help install dev build preview new-post lint linkcheck test clean

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z_-]+:.*## / {printf "%-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm ci

dev: ## Start local dev server
	npm run dev

build: ## Build the static site
	npm run build

preview: ## Preview the built site
	npm run preview

new-post: ## Create a draft post: make new-post title="Post title"
	@test -n "$(title)" || (echo 'usage: make new-post title="Post title"' >&2; exit 1)
	bash scripts/new-post.sh "$(title)"

lint: ## Lint Markdown content and docs
	npm run lint:md

linkcheck: ## Check local Markdown links with lychee
	lychee --no-progress --exclude '^https://(elvhack\.vx-zjr-v\.workers\.dev|elvhack\.com)' "src/content/**/*.md" "docs/**/*.md" README.md AGENTS.md

test: ## Run unit tests
	npm test

clean: ## Remove generated local artifacts
	rm -rf dist .astro node_modules/.vite
