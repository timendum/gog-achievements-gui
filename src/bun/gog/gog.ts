import { JSONParse } from 'json-with-bigint';

import { Achievement, AchievementsResponse, ProductData, ProductDetails, AuthResponse, GetGamesResponse, GameDetail } from './types';
import { getProductDataFromConfig, saveProductDataToConfig, getProductInfoFromConfig, saveProductInfoToConfig } from './config';
import { getAuth } from './auth';

async function getProductData(productID: number): Promise<{ clientID: string; clientSecret: string }> {
  const cached = await getProductDataFromConfig(productID);
  if (cached) {
    return { clientID: cached.clientId, clientSecret: cached.clientSecret };
  }

  const resp = await fetch(`https://www.gogdb.org/data/products/${productID}/product.json`);
  if (!resp.ok) {
    throw new Error(`Failed to get product data: ${resp.status}`);
  }

  // build.id sometimes is a very large number that doesn't fit in JS number
  // so we need to use a special JSON parser that can handle big integers
  const productData: ProductData = JSONParse(await resp.text());

  const validBuilds = productData.builds.filter(build => build.date_published && build.listed);
  if (validBuilds.length === 0) {
    throw new Error(`No valid builds found for product ID: ${productID}`);
  }

  validBuilds.sort((a, b) => b.date_published.localeCompare(a.date_published));
  const latestBuildID = validBuilds[0].id;
  console.log('Found latest build ID:', latestBuildID, '(published:', validBuilds[0].date_published + ')');

  const buildResp = await fetch(`https://www.gogdb.org/data/products/${productID}/builds/${latestBuildID}.json`);
  if (!buildResp.ok) {
    throw new Error(`Failed to get build details - status code: ${buildResp.status}`);
  }

  const buildDetails: ProductDetails = JSONParse(await buildResp.text());
  console.log('Successfully retrieved client ID and secret');

  await saveProductDataToConfig(productID, buildDetails);
  return { clientID: buildDetails.clientId, clientSecret: buildDetails.clientSecret };
}

export async function getAchievements(productID: number, userID: string, accessToken: string): Promise<Achievement[]> {
  console.log('Fetching achievements for product ID:', productID, 'user ID:', userID);
  const { clientID } = await getProductData(productID);

  const resp = await fetch(`https://gameplay.gog.com/clients/${clientID}/users/${userID}/achievements`, {
    headers: {
      'Accept': 'application/json',
      'X-Gog-Lc': 'en',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!resp.ok) {
    throw new Error(`Failed to get achievements - status code: ${resp.status}`);
  }

  const achResp: AchievementsResponse = await resp.json();
  console.log('Successfully retrieved', achResp.items.length, 'achievements');
  return achResp.items;
}

export async function unlockAchievement(productID: number, userID: string, achievementID: string, refreshToken: string, dateUnlocked?: Date): Promise<void> {
  console.log('Attempting to unlock achievement:', achievementID, 'for user:', userID, 'product:', productID);

  const { clientID, clientSecret } = await getProductData(productID);
  const authResp = await getAuth(refreshToken, clientID, clientSecret);

  const body = {
    date_unlocked: dateUnlocked ? dateUnlocked.toISOString().replace('Z', '+0000') : null
  };

  const resp = await fetch(`https://gameplay.gog.com/clients/${clientID}/users/${userID}/achievements/${achievementID}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authResp.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (resp.status !== 200 && resp.status !== 201 && resp.status !== 204) {
    const text = await resp.text();
    throw new Error(`Failed to unlock achievement: ${resp.status} - ${text}`);
  }
}

export async function listOwnedGameIDs(authResp: AuthResponse): Promise<number[]> {
  const resp = await fetch('https://embed.gog.com/user/data/games', {
    headers: {
      'Authorization': `Bearer ${authResp.access_token}`
    }
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to list games - status code: ${resp.status}, response: ${text}`);
  }

  const getGames: GetGamesResponse = await resp.json();
  console.log('Successfully retrieved', getGames.owned.length, 'game ids');
  return getGames.owned;
}

// Map to debounce cache saves
const pendingCacheSaves = new Map<number, GameDetail>();
let cacheTimer: NodeJS.Timeout | null = null;

const CACHE_SAVE_DELAY_MS = 5000;

export async function getGameDetail(productID: number): Promise<GameDetail | null> {
  // Check cache first
  const cached = await getProductInfoFromConfig(productID);
  if (cached) {
    return cached;
  }
  // Debounce cache save - cancel existing timer if present
  const existing = pendingCacheSaves.get(productID);
  if (existing) {
    console.log('Using pending cached info for product ID:', productID);
    return existing;
  }

  const resp = await fetch(`https://www.gogdb.org/data/products/${productID}/product.json`);

  if (resp.status === 404) {
    console.log('Game', productID, 'not found');
    return null;
  }

  if (!resp.ok) {
    const text = await resp.text();
    console.log('Failed to get game details for', productID, '- status code:', resp.status, 'response:', text);
    return null;
  }

  const gameDetail: GameDetail = await resp.json();
  if (!gameDetail) {
    return null;
  }

  // Schedule cache save after 15 seconds
  if (cacheTimer) {
    clearTimeout(cacheTimer);
    cacheTimer = null;
  }
  cacheTimer = setTimeout(() => {
    if (pendingCacheSaves.size > 0) {
      saveProductInfoToConfig(pendingCacheSaves).catch(err => {
        console.error('Failed to save game details to config:', err);
      }).finally(() => {
        cacheTimer = null;
        pendingCacheSaves.clear();
      });
    }
  }, CACHE_SAVE_DELAY_MS);

  pendingCacheSaves.set(productID, gameDetail);

  return gameDetail;
}
