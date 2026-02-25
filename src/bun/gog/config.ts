import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { AuthResponse, ProductDetails } from './types';
import os from 'os';

function getAuthPath(): string {
  return join(os.homedir(), 'AppData','Roaming', 'GOG-achievements-manager', 'auths.json');
}

function getProductPath(): string {
  return join(os.homedir(), 'AppData','Roaming', 'GOG-achievements-manager', 'products.json');
}

function makeSureConfigDirExists() {  
  const folderPath = join(os.homedir(), 'AppData','Roaming', 'GOG-achievements-manager');
  return mkdir(folderPath, { recursive: true });
}

export async function getAccessFromConfig(clientID: string): Promise<AuthResponse | null> {
  const configPath = getAuthPath();
  try {
    const data = await readFile(configPath, 'utf-8');
    const config: Record<string, AuthResponse> = JSON.parse(data);
    const authResp = config[clientID];
    
    if (!authResp) return null;
    if (!authResp.expire_time) {
      console.log('Cached token has no expiration time');
      return null;
    }

    const expireTime = new Date(authResp.expire_time);
    if (new Date() < expireTime) {
      console.log('Using cached access token (expires at', authResp.expire_time + ')');
      return authResp;
    }

    console.log('Cached access token has expired');
    return null;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('Config file does not exist:', configPath);
      return null;
    }
    console.log('Failed to read config file:', err.message);
    return null;
  }
}

export async function saveAccessToConfig(clientID: string, authResp: AuthResponse): Promise<void> {
  await makeSureConfigDirExists();
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
  console.log('Updated cached auth for', clientID);
}

export async function getProductDataFromConfig(productID: number): Promise<ProductDetails | null> {
  const configPath = getProductPath();
  try {
    const data = await readFile(configPath, 'utf-8');
    const config: Record<number, ProductDetails> = JSON.parse(data);
    const productDetails = config[productID];
    
    if (!productDetails) return null;
    
    console.log('Using cached access product data for', productID, ': client_id', productDetails.clientId, ', client_secret', productDetails.clientSecret);
    return productDetails;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('ProductData file does not exist:', configPath);
      return null;
    }
    console.log('Failed to read config file:', err.message);
    return null;
  }
}

export async function saveProductDataToConfig(productID: number, productDetails: ProductDetails): Promise<void> {
  await makeSureConfigDirExists();
  const configPath = getProductPath();
  let config: Record<number, ProductDetails> = {};

  try {
    const data = await readFile(configPath, 'utf-8');
    config = JSON.parse(data);
  } catch {}

  config[productID] = productDetails;

  await writeFile(configPath, JSON.stringify(config, null, 4));
  console.log('Updated cached product data for', productID);
}
