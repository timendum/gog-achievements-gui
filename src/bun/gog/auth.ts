import Registry from 'winreg';
import { AuthResponse } from './types';
import { getAccessFromConfig, saveAccessToConfig } from './config';
import { logf } from './logger';

export const GALAXY_CLIENT_ID = '46899977096215655';
export const GALAXY_CLIENT_SECRET = '9d85c43b1482497dbbce61f6e4aa173a433796eeae2ca8c5f6129f2dc4de46d9';

export async function getRefreshToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const regKey = new Registry({
      hive: Registry.HKCU,
      key: '\\Software\\GOG.com\\Galaxy'
    });

    regKey.get('refreshToken', (err, item) => {
      if (err) {
        logf('Failed to read refresh token from registry: %s', err.message);
        reject(err);
        return;
      }
      logf('Successfully retrieved refresh token from registry: %s', item.value);
      resolve(item.value);
    });
  });
}

export async function getAuth(
  refreshToken: string,
  clientID: string = GALAXY_CLIENT_ID,
  clientSecret: string = GALAXY_CLIENT_SECRET
): Promise<AuthResponse> {
  const cached = await getAccessFromConfig(clientID);
  if (cached) {
    return cached;
  }

  logf('Fetching new access token from GOG...');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientID,
    client_secret: clientSecret,
    without_new_session: '1'
  });

  const response = await fetch(`https://auth.gog.com/token?${params}`);
  
  if (!response.ok) {
    throw new Error(`Authentication failed with status: ${response.status}`);
  }

  const authResp: AuthResponse = await response.json();
  await saveAccessToConfig(clientID, authResp);
  return authResp;
}
