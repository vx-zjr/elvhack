import { html } from "satori-html";
import { siteConfig } from "@/site.config";

export const ogMarkup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#08080c] text-[#e8e6e0]">
		<div tw="flex flex-col flex-1 w-full p-14 justify-center">
			<p tw="text-2xl mb-8 text-[#6f6c64]">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-[#e8e6e0]">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-14 border-t border-[#5fffd7] text-xl">
			<p tw="font-semibold"><span tw="text-[#5fffd7]">elv</span>hack</p>
			<p tw="text-[#6f6c64]">by ${siteConfig.author}</p>
		</div>
	</div>`;
