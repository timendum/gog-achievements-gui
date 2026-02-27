import type { ElectrobunConfig } from "electrobun";
import packageJson from "./package.json" assert { type: "json" };

export default {
	app: {
		name: "gog-achievements-gui",
		identifier: "timendum.gog-achievements-gui",
		version: packageJson.version,
	},
	build: {
		// Ignore Vite output in watch mode — HMR handles view rebuilds separately
		watchIgnore: ["dist/**"],
		targets: "win-x64",
		// Vite builds to dist/, we copy from there
		copy: {
			"assets/": "views/mainview/assets/",
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
		},
		mac: {
			bundleCEF: false,
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
