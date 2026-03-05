import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";

import { JSONParse, JSONStringify } from "json-with-bigint";

import type { AuthResponse, GameDetail, ProductDetails } from "./types";

function getAuthPath(): string {
	return join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
		"auths.json",
	);
}

function getProductPath(): string {
	return join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
		"products.json",
	);
}
function getInfoPath(): string {
	return join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
		"info.json",
	);
}

function makeSureConfigDirExists() {
	const folderPath = join(
		os.homedir(),
		"AppData",
		"Roaming",
		"GOG-achievements-manager",
	);
	return mkdir(folderPath, { recursive: true });
}

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
