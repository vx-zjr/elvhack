import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("global layout system defines reusable shells, grids, and spacing tokens", () => {
	assert.equal(existsSync("src/styles/layout.css"), true);
	assert.equal(existsSync("src/styles/prose.css"), true);

	const global = readFileSync("src/styles/global.css", "utf8");
	const layout = readFileSync("src/styles/layout.css", "utf8");
	const prose = readFileSync("src/styles/prose.css", "utf8");

	assert.match(global, /@import "\.\/layout\.css"/);
	assert.match(global, /@import "\.\/prose\.css"/);

	for (const token of [
		"--page-max",
		"--page-wide",
		"--content-max",
		"--side-left",
		"--side-right",
		"--header-height",
	]) {
		assert.match(layout, new RegExp(`${token}:`));
	}

	for (const className of [
		"site-shell",
		"site-shell-wide",
		"content-shell",
		"home-hero",
		"blog-index-layout",
		"article-layout",
		"surface-card",
	]) {
		assert.match(layout, new RegExp(`\\.${className}`));
	}

	assert.match(layout, /@media \(max-width:\s*900px\)/);
	assert.match(layout, /@media \(max-width:\s*640px\)/);
	assert.match(prose, /\.prose/);
	assert.match(prose, /line-height:\s*1\.8/);
	assert.match(prose, /overflow-x:\s*auto/);
});

test("Base layout no longer constrains the whole site to a centered narrow column", () => {
	const base = readFileSync("src/layouts/Base.astro", "utf8");

	assert.doesNotMatch(base, /max-w-3xl/);
	assert.match(base, /site-root/);
	assert.match(base, /<Header/);
	assert.match(base, /<main[\s\S]*id="main"/);
	assert.match(base, /<Footer/);
});

test("header uses compact shell navigation with active state and core sections", () => {
	const header = readFileSync("src/components/layout/Header.astro", "utf8");

	assert.match(header, /site-header/);
	assert.match(header, /site-shell-wide/);
	assert.match(header, /site-header__nav/);
	assert.match(header, /title:\s*"TECHNOLOGY"/);
	assert.doesNotMatch(header, /title:\s*"blog"/);
	assert.match(header, /Projects|projects/);
	assert.match(header, /Links|links/);
	assert.doesNotMatch(header, /title:\s*"about"/);
	assert.doesNotMatch(header, /\/about\//);
	assert.match(header, /aria-current/);
	assert.match(header, /<ThemeToggle/);
});

test("home page remains the full QUANT and TECH portal entry", () => {
	const home = readFileSync("src/pages/index.astro", "utf8");
	const shader = readFileSync("src/components/home/ShaderStage.astro", "utf8");

	assert.match(home, /import BaseHead/);
	assert.match(home, /import ShaderStage/);
	assert.match(home, /<body>\s*<ShaderStage/);
	assert.match(shader, /<main class="portal"/);
	assert.doesNotMatch(home, /BaseLayout/);
	assert.doesNotMatch(home, /PageShell/);
	assert.doesNotMatch(home, /home-hero/);
	assert.doesNotMatch(home, /latestPosts/);
	assert.doesNotMatch(home, /ArticleListItem/);
	assert.doesNotMatch(shader, /portal--compact/);
});

test("category index uses high-density list plus sidebar and shared sorting", () => {
	const category = readFileSync("src/pages/[lang]/[category]/index.astro", "utf8");

	assert.match(category, /import PageShell/);
	assert.match(category, /ArticleListItem/);
	assert.match(category, /blog-index-page/);
	assert.match(category, /blog-index-layout/);
	assert.match(category, /post-list/);
	assert.match(category, /blog-sidebar/);
	assert.match(category, /<PostSortControls/);
	assert.match(category, /data-sortable-post-list/);
	assert.doesNotMatch(category, /otherCategory/);
	assert.doesNotMatch(category, /otherLang/);
	assert.doesNotMatch(category, /href=\{`\$\{currentLang\}\/tags\//);
	assert.doesNotMatch(category, />rss</i);
	assert.doesNotMatch(category, /RSS feed/);
});

test("article page uses desktop meta, main prose, and sticky toc layout", () => {
	const blogPost = readFileSync("src/layouts/BlogPost.astro", "utf8");
	const articleMeta = readFileSync("src/components/blog/ArticleMeta.astro", "utf8");

	assert.match(blogPost, /ArticleMeta/);
	assert.match(blogPost, /ArticleToc/);
	assert.match(blogPost, /article-layout/);
	assert.match(blogPost, /article-meta/);
	assert.match(blogPost, /article-main/);
	assert.match(blogPost, /article-toc/);
	assert.match(blogPost, /article-mobile-meta/);
	assert.match(articleMeta, /<LikeButton/);
	assert.match(blogPost, /data-pagefind-body/);
});

test("about links and projects use the shared page shell and surface cards", () => {
	const about = readFileSync("src/pages/about.astro", "utf8");
	const links = readFileSync("src/pages/links.astro", "utf8");

	assert.equal(existsSync("src/pages/projects.astro"), true);
	const projects = readFileSync("src/pages/projects.astro", "utf8");

	for (const source of [about, links, projects]) {
		assert.match(source, /PageShell/);
		assert.match(source, /surface-card|info-grid|card-grid/);
	}
});
