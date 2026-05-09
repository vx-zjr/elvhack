import { pinyin } from "pinyin-pro";

export function slugifyTitle(title) {
	if (!title?.trim()) {
		throw new Error("title is required");
	}

	const normalized = pinyin(title, {
		toneType: "none",
		type: "array",
		nonZh: "consecutive",
	})
		.join(" ")
		.toLowerCase();

	return normalized
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-|-$/g, "");
}
