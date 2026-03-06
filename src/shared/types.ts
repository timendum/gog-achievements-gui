import type { RPCSchema } from "electrobun";

/**
 * List of game IDs from the user's GOG library
 */
export type GameListRPCType = number[];

/**
 * Basic information about a GOG game
 */
export type GameDetailsRPCType = {
	id: number;
	title: string;
	image: string;
};

/**
 * Achievement data for a specific game
 */
export type AchievementRPCType = {
	achievement_id: string;
	name: string;
	description: string;
	image_url_unlocked: string;
	image_url_locked: string;
	/** ISO date string when unlocked, or null if locked */
	date_unlocked: string | null;
};

/**
 * RPC schema defining communication between frontend and backend processes
 */
export type GogRPCType = {
	bun: RPCSchema<{
		requests: {
			/**
			 * Fetches the list of all games in the user's GOG library
			 * @returns Array of game IDs and any error message
			 */
			getGameList: {
				params: Record<string, never>;
				response: { games: GameListRPCType; error: string | null };
			};
			/**
			 * Retrieves basic details for a specific game
			 * @param gameID - The GOG game identifier
			 * @returns Game details or null if not found
			 */
			getGameDetails: {
				params: { gameID: number };
				response: GameDetailsRPCType | null;
			};
			/**
			 * Fetches all achievements data for a specific game
			 * @param gameID - The GOG game identifier
			 * @returns Array of achievements for the game
			 */
			getGameAchievements: {
				params: { gameID: number };
				response: AchievementRPCType[];
			};
			/**
			 * Modifies achievement state (unlock or lock)
			 * @param gameID - The GOG game identifier
			 * @param unlock - Achievement ID to unlock
			 * @param lock - Achievement ID to lock
			 * @returns True if successful, false otherwise
			 */
			saveAchievements: {
				params:
					| { gameID: number; unlock: string }
					| { gameID: number; lock: string };
				response: boolean;
			};
		};
		messages: Record<string, never>;
	}>;
	webview: RPCSchema<{
		requests: Record<string, never>;
		messages: Record<string, never>;
	}>;
};
