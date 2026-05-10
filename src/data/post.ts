import { type CollectionEntry, getCollection } from "astro:content";

export const POST_LANGS = ["zh", "en"] as const;
export const POST_CATEGORIES = ["quant", "technology"] as const;

export type PostLang = (typeof POST_LANGS)[number];
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const languageMeta: Record<
	PostLang,
	{
		htmlLang: string;
		label: string;
		locale: string;
		rssTitle: string;
	}
> = {
	en: {
		htmlLang: "en",
		label: "English",
		locale: "en_US",
		rssTitle: "elvhack in English",
	},
	zh: {
		htmlLang: "zh-CN",
		label: "中文",
		locale: "zh_CN",
		rssTitle: "elvhack 中文",
	},
};

export const categoryMeta: Record<
	PostCategory,
	{
		description: Record<PostLang, string>;
		label: string;
	}
> = {
	quant: {
		label: "QUANT",
		description: {
			en: "Quant, trading systems, AI quant, financial engineering, market structure, and strategy research.",
			zh: "量化、交易系统、AI quant、金融工程、市场结构与策略研究。",
		},
	},
	technology: {
		label: "TECHNOLOGY",
		description: {
			en: "AI, software engineering, systems architecture, infrastructure, security, and toolchains.",
			zh: "AI、软件工程、系统架构、基础设施、安全与工具链。",
		},
	},
};

export function isPostLang(value: string | undefined): value is PostLang {
	return POST_LANGS.includes(value as PostLang);
}

export function isPostCategory(value: string | undefined): value is PostCategory {
	return POST_CATEGORIES.includes(value as PostCategory);
}

export function detectPreferredLang(value: string | undefined): PostLang {
	return value?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getCategoryUrl(lang: PostLang, category: PostCategory) {
	return `/${lang}/${category}/`;
}

export function getLanguageUrl(lang: PostLang) {
	return getCategoryUrl(lang, "technology");
}

export function getPostUrl(post: CollectionEntry<"post">) {
	return `/${post.data.lang}/${post.data.category}/${post.data.slug}/`;
}

export function getPostLikeSlug(post: CollectionEntry<"post">) {
	return `${post.data.lang}/${post.data.category}/${post.data.slug}`;
}

/** filter out draft posts based on the environment */
export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

export function sortPostsByDate(posts: CollectionEntry<"post">[]) {
	return [...posts].sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

export function filterPostsByLang(posts: CollectionEntry<"post">[], lang: PostLang) {
	return posts.filter((post) => post.data.lang === lang);
}

export function filterPostsByCategory(
	posts: CollectionEntry<"post">[],
	lang: PostLang,
	category: PostCategory,
) {
	return posts.filter((post) => post.data.lang === lang && post.data.category === category);
}

export async function getPostsByLang(lang: PostLang) {
	return sortPostsByDate(filterPostsByLang(await getAllPosts(), lang));
}

export async function getPostsByCategory(lang: PostLang, category: PostCategory) {
	return sortPostsByDate(filterPostsByCategory(await getAllPosts(), lang, category));
}

export async function getPostByRoute(
	lang: PostLang,
	category: PostCategory,
	slug: string | undefined,
) {
	if (!slug) return undefined;
	const posts = await getAllPosts();
	return posts.find(
		(post) => post.data.lang === lang && post.data.category === category && post.data.slug === slug,
	);
}

export function findTranslation(
	post: CollectionEntry<"post">,
	posts: CollectionEntry<"post">[],
	targetLang: PostLang,
) {
	return posts.find(
		(candidate) =>
			candidate.data.translationKey === post.data.translationKey &&
			candidate.data.lang === targetLang &&
			candidate.id !== post.id,
	);
}

export function getAlternateLang(lang: PostLang): PostLang {
	return lang === "zh" ? "en" : "zh";
}

/** Get tag metadata by tag name */
export async function getTagMeta(tag: string): Promise<CollectionEntry<"tag"> | undefined> {
	const tagEntries = await getCollection("tag", (entry) => {
		return entry.id === tag;
	});
	return tagEntries[0];
}

/** groups posts by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
	return Object.groupBy(posts, (post) => post.data.publishDate.getFullYear().toString());
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(posts: CollectionEntry<"post">[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(posts: CollectionEntry<"post">[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
