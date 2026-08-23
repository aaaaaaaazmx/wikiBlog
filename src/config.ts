import { tr } from "./i18n/languages/tr";
import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "强人自传",
	subtitle: "强人自传",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "/wechat-qr.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "点击领取优惠~", // Credit text to be displayed
			url: "https://faka.lucklyee.xyz/", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "发卡网",
			url: "https://faka.lucklyee.xyz", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "强人自传",
	links: [
		{
			name: "QQ",
			icon: "fa6-brands:qq", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://qun.qq.com/universal-share/share?ac=1&authKey=ZNzJ3VtK2ccdPBV42XFL9rIe4wCXRDREp6z%2BHk2eZsJ4WPKBuDyc6bFXO1eNsdqI&busi_data=eyJncm91cENvZGUiOiIxMDEyMDYyNDQwIiwidG9rZW4iOiJTUzBadXBoRklDZnEvSGE3SHAyRkU1L2FycGVKdExpZkFiRVdLVmc4YkVaeEhycDhabkNLQStwSkFDZlJ0SG9kIiwidWluIjoiMjE5MjI5MjM5MiJ9&data=QqnggGwoT22EUgoccf632Z6wlMgzxyQKSGlQq34_vlwBTI6U6913XJZoFih2_qn00sPXj1oFRMspSnoOujMRyitXqvBYS7F1d7KHI6fV9Bc&svctype=5&tempid=h5_group_info",
		},
		{
			name: "Wechat",
			icon: "fa6-brands:weixin",
			url: "https://store.steampowered.com",
			image: "/wechat-qr.png", // 微信二维码（public 目录，请替换为真实的 PNG/JPG 二维码）
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
