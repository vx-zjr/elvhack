export type SiteLinkType = "feed" | "code" | "social" | "qr" | "other";

export type SiteLink = {
	description: string;
	external: boolean;
	icon: string;
	name: string;
	qrImage?: string;
	type: SiteLinkType;
	url?: string;
};

export const siteLinks: SiteLink[] = [
	{
		name: "RSS",
		url: "/rss.xml",
		icon: "mdi:rss",
		description: "Subscribe to all posts.",
		external: false,
		type: "feed",
	},
	{
		name: "GitHub",
		url: "https://github.com/",
		icon: "mdi:github",
		description: "TODO: replace with the public GitHub profile.",
		external: true,
		type: "code",
	},
	{
		name: "WeChat",
		icon: "mdi:wechat",
		qrImage: "/images/wechat-qr-placeholder.svg",
		description: "TODO: replace with the real QR image if this should be public.",
		external: false,
		type: "qr",
	},
	{
		name: "Xiaohongshu",
		url: "https://www.xiaohongshu.com/",
		icon: "mdi:notebook-outline",
		description: "TODO: replace with the public profile URL.",
		external: true,
		type: "social",
	},
	{
		name: "Douyin",
		url: "https://www.douyin.com/",
		icon: "mdi:music-note",
		description: "TODO: replace with the public profile URL.",
		external: true,
		type: "social",
	},
	{
		name: "YouTube",
		url: "https://www.youtube.com/",
		icon: "mdi:youtube",
		description: "TODO: replace with the public profile URL.",
		external: true,
		type: "social",
	},
];

export const footerLinks = siteLinks.filter((link) => link.url);
