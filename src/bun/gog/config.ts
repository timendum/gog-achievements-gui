import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { AuthResponse, ProductDetails } from './types';
import { logf } from './logger';

function getAuthPath(): string {
  return join(dirname(process.execPath), 'auths.json');
}

function getProductPath(): string {
  return join(dirname(process.execPath), 'products.json');
}

export async function getAccessFromConfig(clientID: string): Promise<AuthResponse | null> {
  const configPath = getAuthPath();
  try {
    const data = await readFile(configPath, 'utf-8');
    const config: Record<string, AuthResponse> = JSON.parse(data);
    const authResp = config[clientID];
    
    if (!authResp) return null;
    if (!authResp.expire_time) {
      logf('Cached token has no expiration time');
      return null;
    }

    const expireTime = new Date(authResp.expire_time);
    if (new Date() < expireTime) {
      logf('Using cached access token (expires at %s)', authResp.expire_time);
      return authResp;
    }

    logf('Cached access token has expired');
    return null;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      logf('Config file does not exist: %s', configPath);
      return null;
    }
    logf('Failed to read config file: %s', err.message);
    return null;
  }
}

export async function saveAccessToConfig(clientID: string, authResp: AuthResponse): Promise<void> {
  const configPath = getAuthPath();
  let config: Record<string, AuthResponse> = {};

  try {
    const data = await readFile(configPath, 'utf-8');
    config = JSON.parse(data);
  } catch {}

  const now = new Date();
  const expireTime = new Date(now.getTime() + authResp.expires_in * 1000);
  authResp.login_time = now.toISOString();
  authResp.expire_time = expireTime.toISOString();

  config[clientID] = authResp;

  await writeFile(configPath, JSON.stringify(config, null, 4));
  logf('Updated cached auth for %s', clientID);
}

export async function getProductDataFromConfig(productID: number): Promise<ProductDetails | null> {
  const configPath = getProductPath();
  try {
    const data = await readFile(configPath, 'utf-8');
    const config: Record<number, ProductDetails> = JSON.parse(data);
    const productDetails = config[productID];
    
    if (!productDetails) return null;
    
    logf('Using cached access product data for %s: client_id %s , client_secret %s', 
      productID, productDetails.clientId, productDetails.clientSecret);
    return productDetails;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      logf('ProductData file does not exist: %s', configPath);
      return null;
    }
    logf('Failed to read config file: %s', err.message);
    return null;
  }
}

export async function saveProductDataToConfig(productID: number, productDetails: ProductDetails): Promise<void> {
  const configPath = getProductPath();
  let config: Record<number, ProductDetails> = {};

  try {
    const data = await readFile(configPath, 'utf-8');
    config = JSON.parse(data);
  } catch {}

  config[productID] = productDetails;

  await writeFile(configPath, JSON.stringify(config, null, 4));
  logf('Updated cached product data for %s', productID);
}
