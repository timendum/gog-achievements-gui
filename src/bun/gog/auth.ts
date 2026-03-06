import Registry from "winreg";
import { getAccessFromConfig, saveAccessToConfig } from "./config";
import type { AuthResponse } from "./types";

/** GOG Galaxy client ID for API authentication */
export const GALAXY_CLIENT_ID = "46899977096215655";
/** GOG Galaxy client secret for API authentication */
export const GALAXY_CLIENT_SECRET =
	"9d85c43b1482497dbbce61f6e4aa173a433796eeae2ca8c5f6129f2dc4de46d9";

/**
 * Retrieves the GOG Galaxy refresh token from Windows Registry.
 * 
 * @returns The refresh token string
 * @throws Error if GOG Galaxy is not installed or hasn't been launched
 */
export async function getRefreshToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		const regKey = new Registry({
			hive: Registry.HKCU,
			key: "\\Software\\GOG.com\\Galaxy",
		});

		regKey.get("refreshToken", (err, item) => {
			if (err) {
				console.log(
					"Failed to read refresh token from registry: %s",
					err.message,
				);
				reject(
					"Make sure GOG Galaxy is installed and has been launched at least once",
				);
				return;
			}
			console.log(
				"Successfully retrieved refresh token from registry: %s",
				item.value,
			);
			resolve(item.value);
		});
	});
}

/**
 * Authenticates with GOG API using a refresh token.
 * Returns access token.
 * 
 * @param refreshToken - The GOG refresh token from Galaxy client
 * @param clientID - GOG client ID (defaults to GALAXY_CLIENT_ID)
 * @param clientSecret - GOG client secret (defaults to GALAXY_CLIENT_SECRET)
 * @returns Authentication response containing access token and expiration
 * @throws Error if authentication fails
 */
export async function getAuth(
	refreshToken: string,
	clientID: string = GALAXY_CLIENT_ID,
	clientSecret: string = GALAXY_CLIENT_SECRET,
): Promise<AuthResponse> {
	const cached = await getAccessFromConfig(clientID);
	if (cached) {
		return cached;
	}

	console.log("Fetching new access token from GOG...");
	const params = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: refreshToken,
		client_id: clientID,
		client_secret: clientSecret,
		without_new_session: "1",
	});

	const response = await fetch(`https://auth.gog.com/token?${params}`);

	if (!response.ok) {
		throw new Error(
			`GOG Authentication failed with status: ${response.status}`,
		);
	}

	const authResp: AuthResponse = await response.json();
	await saveAccessToConfig(clientID, authResp);
	return authResp;
}
