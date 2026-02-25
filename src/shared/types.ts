import { RPCSchema } from "electrobun";

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
}

export type GogRPCType = {
    bun: RPCSchema<{
        requests: {
            getGameList: {
                params: {};
                response: { games: GameListRPCType, error: string | null };
            };
            getGameDetails: {
                params: { gameID: number };
                response: GameDetailsRPCType | null;
            };
            getGameAchievements: {
                params: { gameID: number };
                response: AchievementRPCType[];
            }
        };
        messages: {};
    }>;
    // functions that execute in the browser context
    webview: RPCSchema<{
        requests: {
            // someWebviewFunction: {
            //     params: {
            //         a: number;
            //         b: number;
            //     };
            //     response: number;
            // };
        };
        messages: {
            // logToWebview: {
            //     msg: string;
            // };
        };
    }>;
};