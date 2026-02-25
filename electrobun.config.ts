import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "gog-achievements-gui",
		identifier: "timendum.gog-achievements-gui",
		version: "0.0.1",
	},
	build: {
		copy: {
            "assets/": "views/mainview/assets/",
		},
		watchIgnore: ["dist/**"],
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
