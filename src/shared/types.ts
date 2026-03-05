import type { RPCSchema } from "electrobun";

export type GameListRPCType = number[];

export type GameDetailsRPCType = {
	id: number;
	title: string;
	image: string;
};

export type AchievementRPCType = {
	achievement_id: string;
	name: string;
	description: string;
	image_url_unlocked: string;
	image_url_locked: string;
	date_unlocked: string | null;
};

export type GogRPCType = {
	bun: RPCSchema<{
		requests: {
			getGameList: {
				params: Record<string, never>;
				response: { games: GameListRPCType; error: string | null };
			};
			getGameDetails: {
				params: { gameID: number };
				response: GameDetailsRPCType | null;
			};
			getGameAchievements: {
				params: { gameID: number };
				response: AchievementRPCType[];
			};
			saveAchievements: {
				params:
					| { gameID: number; unlock: string }
					| { gameID: number; lock: string };
				response: boolean;
			};
		};
		messages: Record<string, never>;
	}>;
	// functions that execute in the browser context
	webview: RPCSchema<{
		requests: Record<string, never>;
		messages: Record<string, never>;
	}>;
};
