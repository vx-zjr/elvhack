import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { test } from "node:test";

import { slugifyTitle } from "../scripts/slugify-title.mjs";

test("converts Chinese titles to lowercase pinyin slugs", () => {
	assert.equal(slugifyTitle("你好,世界"), "ni-hao-shi-jie");
	assert.equal(slugifyTitle("AI 编程的边界"), "ai-bian-cheng-de-bian-jie");
});

test("collapses punctuation and repeated separators", () => {
	assert.equal(slugifyTitle("Hello,  elvhack: v1!"), "hello-elvhack-v1");
});

test("new-post writes real newlines in frontmatter", () => {
	const target = "src/content/post/ce-shi-yi-xia.md";
	if (existsSync(target)) rmSync(target);

	try {
		execFileSync("bash", ["scripts/new-post.sh", "测试一下"], { stdio: "pipe" });
		const body = readFileSync(target, "utf8");

		assert.match(body, /^---\ntitle: "测试一下"\n/);
		assert.doesNotMatch(body, /\\n/);
	} finally {
		if (existsSync(target)) rmSync(target);
	}
});

test("new-post writes bilingual routing frontmatter", () => {
	const target = "src/content/post/ce-shi-yi-xia.md";
	if (existsSync(target)) rmSync(target);

	try {
		execFileSync("bash", ["scripts/new-post.sh", "测试一下"], { stdio: "pipe" });
		const body = readFileSync(target, "utf8");

		assert.match(body, /^---\ntitle: "测试一下"\n/);
		assert.match(body, /\nlang: "zh"\n/);
		assert.match(body, /\ncategory: "technology"\n/);
		assert.match(body, /\ntranslationKey: "ce-shi-yi-xia"\n/);
		assert.match(body, /\nslug: "ce-shi-yi-xia"\n/);
		assert.match(body, /\ntags: \[\]\n/);
		assert.match(body, /\ndraft: true\n/);
	} finally {
		if (existsSync(target)) rmSync(target);
	}
});

test("new-post supports explicit language category translation key and slug", () => {
	const target = "src/content/post/custom-english-slug.md";
	if (existsSync(target)) rmSync(target);

	try {
		execFileSync("bash", ["scripts/new-post.sh", "English Title"], {
			env: {
				...process.env,
				category: "quant",
				lang: "en",
				slug: "custom-english-slug",
				translationKey: "paired-note",
			},
			stdio: "pipe",
		});
		const body = readFileSync(target, "utf8");

		assert.match(body, /^---\ntitle: "English Title"\n/);
		assert.match(body, /\nlang: "en"\n/);
		assert.match(body, /\ncategory: "quant"\n/);
		assert.match(body, /\ntranslationKey: "paired-note"\n/);
		assert.match(body, /\nslug: "custom-english-slug"\n/);
	} finally {
		if (existsSync(target)) rmSync(target);
	}
});
