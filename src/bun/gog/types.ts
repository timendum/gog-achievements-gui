export interface Achievement {
  achievement_id: string;
  achievement_key: string;
  visible: boolean;
  name: string;
  description: string;
  image_url_unlocked: string;
  image_url_locked: string;
  rarity: number;
  date_unlocked: string | null;
  rarity_level_description: string;
  rarity_level_slug: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
  login_time?: string;
  expire_time?: string;
}

export interface ProductData {
  builds: Build[];
}

export interface Build {
  id: number;
  date_published: string;
  listed: boolean;
}

export interface ProductDetails {
  clientId: string;
  clientSecret: string;
}

export interface AchievementsResponse {
  items: Achievement[];
}

export interface GetGamesResponse {
  owned: number[];
}

export interface GameDetail {
  title: string;
  type: string;
  builds: Array<{ id: number }>;
  id: number;
  image_background: string;
  image_boxart: string;
  image_galaxy_background: string;
  image_icon: string;
  image_icon_square: any;
  image_logo: string;
  includes_games: number[];
}
