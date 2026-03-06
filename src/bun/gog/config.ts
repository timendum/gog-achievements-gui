import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";

import { JSONParse, JSONStringify } from "json-with-bigint";

import type { AuthResponse, GameDetail, ProductDetails } from "./types";

/**
 * Configuration manager for GOG Achievements Manager.
 * Handles caching of authentication tokens, product details, and game information
 * in the user's AppData/Roaming directory.
 * 
 * Entities:
 * - Auth: cache `AuthResponse` (GOG Auth, general and for games)
 * - Product: cache `ProductDetails` (client id and secret for games)
 * - Info: cache `GameDetail` (Info for games)
 */

/**
 * Returns the file path for AuthResponse.
 * @returns Path to auths.json
 */
function getAuthPath(): string {
	return join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
		"auths.json",
	);
}

/**
 * Returns the file path for  ProductDetails.
 * @returns Path to products.json
 */
function getProductPath(): string {
	return join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
		"products.json",
	);
}
/**
 * Returns the file path for GameDetails.
 * @returns Path to info.json
 */
function getInfoPath(): string {
	return join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
		"info.json",
	);
}

/**
 * Ensures the configuration directory exists, creating it if necessary.
 * @returns Promise that resolves when directory is confirmed to exist
 */
function makeSureConfigDirExists() {
	const folderPath = join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
	);
	return mkdir(folderPath, { recursive: true });
}

/**
 * Retrieves a cached AuthResponse for the specified client ID.
 * @param clientID - The GOG OAuth client ID
 * @returns The cached auth response if valid and not expired, null otherwise
 */
export async function getAccessFromConfig(
	clientID: string,
): Promise<AuthResponse | null> {
	const configPath = getAuthPath();
	try {
		const data = await readFile(configPath, "utf-8");
		const config: Record<string, AuthResponse> = JSONParse(data);
		const authResp = config[clientID];

		if (!authResp) {
			return null;
		}
		if (!authResp.expire_time) {
			console.log("Cached token has no expiration time");
			return null;
		}

		const expireTime = new Date(authResp.expire_time);
		if (new Date() < expireTime) {
			console.log(
				"Using cached access token (expires at",
				`${authResp.expire_time})`,
			);
			return authResp;
		}

		console.log("Cached access token has expired");
	} catch (err: unknown) {
		if (err instanceof Error) {
			if ("code" in err && err.code === "ENOENT") {
				console.log("Config file does not exist:", configPath);
				return null;
			}
			console.log("Failed to read config file:", err.message);
			return null;
		}
		console.log("Error reading file", err);
	}
	return null;
}

/**
 * Saves an access token to the configuration cache.
 * Automatically calculates and stores expiration time based on expires_in.
 * @param clientID - The GOG OAuth client ID
 * @param authResp - The authentication response to cache
 */
export async function saveAccessToConfig(
	clientID: string,
	authResp: AuthResponse,
): Promise<void> {
	await makeSureConfigDirExists();
	const configPath = getAuthPath();
	let config: Record<string, AuthResponse> = {};

	try {
		const data = await readFile(configPath, "utf-8");
		config = JSONParse(data);
	} catch {}

	const now = new Date();
	const expireTime = new Date(now.getTime() + authResp.expires_in * 1000);
	authResp.login_time = now.toISOString();
	authResp.expire_time = expireTime.toISOString();

	config[clientID] = authResp;

	await writeFile(configPath, JSONStringify(config, null, 4));
	console.log("Updated cached auth for", clientID);
}

/**
 * Retrieves cached OAuth credentials for a specific game product.
 * @param productID - The GOG product/game ID
 * @returns The cached product details (client_id and client_secret) or null if not found
 */
export async function getProductDataFromConfig(
	productID: number,
): Promise<ProductDetails | null> {
	const configPath = getProductPath();
	try {
		const data = await readFile(configPath, "utf-8");
		const config: Record<number, ProductDetails> = JSONParse(data);
		const productDetails = config[productID];

		if (!productDetails) {
			return null;
		}

		console.log(
			"Using cached access product data for",
			productID,
			": client_id",
			productDetails.clientId,
			", client_secret",
			productDetails.clientSecret,
		);
		return productDetails;
	} catch (err: unknown) {
		if (err instanceof Error) {
			if ("code" in err && err.code === "ENOENT") {
				console.log("Config file does not exist:", configPath);
				return null;
			}
			console.log("Failed to read config file:", err.message);
			return null;
		}
		console.log("Error reading file", err);
	}
	return null;
}

/**
 * Saves OAuth credentials for a game product to the configuration cache.
 * @param productID - The GOG product/game ID
 * @param productDetails - The product OAuth credentials to cache
 */
export async function saveProductDataToConfig(
	productID: number,
	productDetails: ProductDetails,
): Promise<void> {
	await makeSureConfigDirExists();
	const configPath = getProductPath();
	let config: Record<number, ProductDetails> = {};

	try {
		const data = await readFile(configPath, "utf-8");
		config = JSONParse(data);
	} catch {}

	config[productID] = productDetails;

	await writeFile(configPath, JSONStringify(config, null, 4));
	console.log("Updated cached product data for", productID);
}

/**
 * Retrieves cached game information for a specific product.
 * @param productID - The GOG product/game ID
 * @returns The cached game details (title, etc.) or null if not found
 */
export async function getProductInfoFromConfig(
	productID: number,
): Promise<GameDetail | null> {
	const configPath = getInfoPath();
	try {
		const data = await readFile(configPath, "utf-8");
		const config: Record<number, GameDetail> = JSONParse(data);
		const productInfo = config[productID];

		if (!productInfo) {
			return null;
		}

		console.log(
			"Using cached access product data for",
			productID,
			": title",
			productInfo.title,
		);
		return productInfo;
	} catch (err: unknown) {
		if (err instanceof Error) {
			if ("code" in err && err.code === "ENOENT") {
				console.log("Config file does not exist:", configPath);
				return null;
			}
			console.log("Failed to read config file:", err.message);
			return null;
		}
		console.log("Error reading file", err);
	}
	return null;
}

/**
 * Saves game information for multiple products to the configuration cache.
 * @param productInfos - Map of product IDs to their game details
 */
export async function saveProductInfoToConfig(
	productInfos: Map<number, GameDetail>,
): Promise<void> {
	await makeSureConfigDirExists();
	const configPath = getInfoPath();
	let config: Record<number, GameDetail> = {};

	try {
		const data = await readFile(configPath, "utf-8");
		config = JSONParse(data);
	} catch {}

	for (const [id, info] of productInfos.entries()) {
		config[id] = info;
	}

	await writeFile(configPath, JSONStringify(config, null, 4));
	console.log(
		"Updated cached product info for",
		[...productInfos.keys()].join(", "),
	);
}
