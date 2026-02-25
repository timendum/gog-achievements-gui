import { BrowserView, BrowserWindow, Updater } from "electrobun/bun";
import { GogRPCType } from "../shared/types";
import { getAuth, getRefreshToken } from "./gog/auth";
import { AuthResponse } from "./gog/types";
import { getAchievements, getGameDetail, listOwnedGameIDs, } from "./gog/gog";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev") {
		try {
			await fetch(DEV_SERVER_URL, { method: "HEAD" });
			console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
			return DEV_SERVER_URL;
		} catch {
			console.log(
				"Vite dev server not running. Run 'bun run dev:hmr' for HMR support.",
			);
		}
	}
	return "views://mainview/index.html";
}

const GOGAuth = {
	refreshToken: "",
	authResponse: null as AuthResponse | null,
};

const gogRPC = BrowserView.defineRPC<GogRPCType>({
	maxRequestTime: 5000,
	handlers: {
		requests: {
			getGameList: async () => {
				try {
					const refreshToken = await getRefreshToken();
					GOGAuth.refreshToken = refreshToken;
					const authResponse = await getAuth(refreshToken);
					GOGAuth.authResponse = authResponse;

					const games = await listOwnedGameIDs(authResponse);
					return { games, error: null };
				} catch (err) {
					console.error("Failed to get refresh token:", err);
					return { games: [], error: String(err)};
				}
			},
			getGameDetails: async ({ gameID }) => {
				const gameDetail = await getGameDetail(gameID);
				if (!gameDetail) {
					return null;
				}
				if (gameDetail.builds.length === 0) {
					return null;
				}
				return {
					id: gameDetail.id,
					title: gameDetail.title,
					image: `https://images.gog-statics.com/${gameDetail.image_logo}_product_tile_extended_432x243.webp`,
				}
			},
			getGameAchievements: async ({ gameID }) => {
				if (!GOGAuth.authResponse || !GOGAuth.refreshToken) {
					console.error('No auth response or refresh token available');
					return [];
				}
				const achievements = await getAchievements(gameID, GOGAuth.authResponse.user_id, GOGAuth.refreshToken);
				return achievements.map(ach => ({
					achievement_id: ach.achievement_id,
					name: ach.name,
					description: ach.description,
					image_url_unlocked: `https://images.gog-statics.com/${ach.image_url_unlocked}`,
					image_url_locked: `https://images.gog-statics.com/${ach.image_url_locked}`,
					date_unlocked: ach.date_unlocked,
				}));
			},
		},
		messages: {},
	},
});

// Create the main application window
const url = await getMainViewUrl();

// const mainWindow = 
new BrowserWindow({
	title: "GOG Achievements Manager",
	url,
	rpc: gogRPC,
	frame: {
		width: 900,
		height: 700,
		x: 200,
		y: 200,
	},
});

console.log("React Tailwind Vite app started!");
