import rss from "@astrojs/rss";
import type { APIContext, GetStaticPaths } from "astro";
import { getPostsByLang, getPostUrl, languageMeta, POST_LANGS, type PostLang } from "@/data/post";
import { siteConfig } from "@/site.config";

export const getStaticPaths = (() => {
	return POST_LANGS.map((lang) => ({
		params: { lang },
		props: { lang },
	}));
}) satisfies GetStaticPaths;

export const GET = async (context: APIContext) => {
	const lang = context.props.lang as PostLang;
	const posts = await getPostsByLang(lang);

	return rss({
		title: languageMeta[lang].rssTitle,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: getPostUrl(post),
		})),
	});
};
