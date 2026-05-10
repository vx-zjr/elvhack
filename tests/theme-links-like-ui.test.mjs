import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("theme provider is wired into content pages and home remains a dark portal shell", () => {
	const base = readFileSync("src/layouts/Base.astro", "utf8");
	const home = readFileSync("src/pages/index.astro", "utf8");
	const provider = readFileSync("src/components/ThemeProvider.astro", "utf8");
	const toggle = readFileSync("src/components/ThemeToggle.astro", "utf8");

	assert.match(base, /import ThemeProvider/);
	assert.match(base, /<ThemeProvider \/>/);
	assert.match(home, /import BaseHead/);
	assert.match(home, /data-theme="dark"/);
	assert.match(provider, /themeStorageKey\s*=\s*"theme"/);
	assert.match(provider, /userChoiceStorageKey\s*=\s*"theme-user-choice"/);
	assert.match(provider, /localStorage\.getItem\(themeStorageKey\)/);
	assert.match(provider, /localStorage\.getItem\(userChoiceStorageKey\)/);
	assert.match(provider, /prefers-color-scheme:\s*dark/);
	assert.match(toggle, /aria-label=/);
	assert.doesNotMatch(toggle, />\s*(Light|Dark|明亮|暗黑)/);
});

test("global styles expose quiet light and dark design tokens", () => {
	const styles = readFileSync("src/styles/global.css", "utf8");
	const docs = readFileSync("docs/design-tokens.md", "utf8");

	for (const token of [
		"--color-bg",
		"--color-surface",
		"--color-text",
		"--color-muted",
		"--color-border",
		"--color-link",
		"--color-code-bg",
		"--color-card-bg",
	]) {
		assert.match(styles, new RegExp(`${token}:`));
		assert.match(docs, new RegExp(token));
	}

	assert.match(styles, /\[data-theme="light"\]/);
	assert.match(styles, /#f7f4ed|#f8f5ee/);
	assert.match(styles, /\[data-theme="dark"\]/);
	assert.match(styles, /#1c1c1a|#1f1f1d/);
});

test("post like slug, article button, and category sorting share the same slug", () => {
	const data = readFileSync("src/data/post.ts", "utf8");
	const blogPost = readFileSync("src/layouts/BlogPost.astro", "utf8");
	const articleMeta = readFileSync("src/components/blog/ArticleMeta.astro", "utf8");
	const likeButton = readFileSync("src/components/blog/LikeButton.astro", "utf8");
	const sorter = readFileSync("src/components/blog/PostSortControls.astro", "utf8");
	const categoryPage = readFileSync("src/pages/[lang]/[category]/index.astro", "utf8");
	const preview = readFileSync("src/components/blog/PostPreview.astro", "utf8");

	assert.match(data, /function getPostLikeSlug/);
	assert.match(
		data,
		/`\$\{post\.data\.lang\}\/\$\{post\.data\.category\}\/\$\{post\.data\.slug\}`/,
	);
	assert.match(blogPost, /ArticleMeta/);
	assert.match(articleMeta, /<LikeButton/);
	assert.match(likeButton, /GET \/api\/likes/);
	assert.match(likeButton, /POST/);
	assert.match(likeButton, /liked_posts/);
	assert.match(sorter, /data-post-sort-controls/);
	assert.match(sorter, /\/api\/likes/);
	assert.match(categoryPage, /<PostSortControls/);
	assert.match(preview, /data-like-slug/);
});

test("links center uses shared config and avoids hardcoded sensitive contact details", () => {
	const links = readFileSync("src/data/links.ts", "utf8");
	const linksPage = readFileSync("src/pages/links.astro", "utf8");
	const footer = readFileSync("src/components/layout/Footer.astro", "utf8");
	const about = readFileSync("src/pages/about.astro", "utf8");

	assert.match(links, /type SiteLink/);
	assert.match(links, /rss/);
	assert.match(links, /wechat/);
	assert.match(links, /Douyin/);
	assert.match(links, /Xiaohongshu/);
	assert.match(links, /YouTube/);
	assert.match(links, /mdi:youtube/);
	assert.match(links, /wechat-qr-placeholder/);
	assert.doesNotMatch(links, /phone|手机号|微信号|weixin_id/i);
	assert.match(linksPage, /siteLinks/);
	assert.match(linksPage, /noopener noreferrer/);
	assert.match(footer, /footerLinks/);
	assert.match(footer, /aria-label=\{link\.name\}/);
	assert.match(about, /\/links\//);
});
