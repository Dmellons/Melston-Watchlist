// types/game.d.ts - Types for video game tracking

import { WatchlistDocumentCreate } from "./appwrite";

// Platforms where games can be owned/played
export type GamePlatform =
  | 'steam'
  | 'playstation'
  | 'xbox'
  | 'nintendo'
  | 'pc'
  | 'physical';

// Subscription services
export type SubscriptionService =
  | 'ps_plus'
  | 'ps_plus_extra'
  | 'ps_plus_premium'
  | 'game_pass'
  | 'game_pass_ultimate'
  | 'ea_play'
  | 'ubisoft_plus'
  | 'nintendo_online';

// Play status for games
export type PlayStatus =
  | 'backlog'
  | 'playing'
  | 'completed'
  | 'dropped'
  | 'platinum'  // 100% completion
  | 'endless';  // Games with no end (multiplayer, etc.)

// Game-specific document fields
export interface GameDocumentCreate extends Omit<WatchlistDocumentCreate, 'tmdb_id' | 'tmdb_type'> {
  content_type: 'videogame';
  igdb_id: number;
  platforms_owned: GamePlatform[];
  play_status: PlayStatus;
  hours_played?: number;
  completion_percentage?: number;
  achievements?: {
    earned: number;
    total: number;
  };
  current_platform?: GamePlatform;  // Which platform actively playing on
  subscription_available?: SubscriptionService[];
}

// IGDB API Types
export interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  first_release_date?: number;  // Unix timestamp
  cover?: IGDBCover;
  screenshots?: IGDBScreenshot[];
  genres?: IGDBGenre[];
  platforms?: IGDBPlatform[];
  involved_companies?: IGDBInvolvedCompany[];
  game_modes?: IGDBGameMode[];
  themes?: IGDBTheme[];
  similar_games?: number[];
  websites?: IGDBWebsite[];
  videos?: IGDBVideo[];
}

export interface IGDBCover {
  id: number;
  image_id: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface IGDBScreenshot {
  id: number;
  image_id: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface IGDBGenre {
  id: number;
  name: string;
  slug: string;
}

export interface IGDBPlatform {
  id: number;
  name: string;
  abbreviation?: string;
  slug: string;
  platform_family?: number;
}

export interface IGDBInvolvedCompany {
  id: number;
  company: {
    id: number;
    name: string;
    slug: string;
  };
  developer: boolean;
  publisher: boolean;
}

export interface IGDBGameMode {
  id: number;
  name: string;
  slug: string;
}

export interface IGDBTheme {
  id: number;
  name: string;
  slug: string;
}

export interface IGDBWebsite {
  id: number;
  category: number;  // 1=official, 13=steam, 16=epicgames, etc.
  url: string;
}

export interface IGDBVideo {
  id: number;
  name?: string;
  video_id: string;  // YouTube video ID
}

// IGDB Platform Family IDs for filtering
export const PLATFORM_FAMILIES = {
  PLAYSTATION: 1,
  XBOX: 2,
  NINTENDO: 5,
  PC: 4,
} as const;

// Common IGDB Platform IDs
export const PLATFORM_IDS = {
  // PlayStation
  PS5: 167,
  PS4: 48,
  PS3: 9,
  PS_VITA: 46,
  PSP: 38,
  // Xbox
  XBOX_SERIES: 169,
  XBOX_ONE: 49,
  XBOX_360: 12,
  // Nintendo
  SWITCH: 130,
  WII_U: 41,
  WII: 5,
  N3DS: 37,
  // PC
  PC: 6,
  MAC: 14,
  LINUX: 3,
  // Mobile
  IOS: 39,
  ANDROID: 34,
} as const;

// Steam API Types
export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;  // Minutes
  playtime_2weeks?: number;
  img_icon_url: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

export interface SteamOwnedGamesResponse {
  response: {
    game_count: number;
    games: SteamOwnedGame[];
  };
}

export interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
}

// Subscription catalog item
export interface SubscriptionCatalogItem {
  title: string;
  igdb_id?: number;
  available_on: SubscriptionService[];
  added_date?: string;
  leaving_date?: string;
}

// Search result combining IGDB data with subscription availability
export interface GameSearchResult {
  igdb: IGDBGame;
  subscriptions: SubscriptionService[];
  steam_appid?: number;
}

// Helper to get IGDB image URL
export function getIGDBImageUrl(
  imageId: string,
  size: 'thumb' | 'cover_small' | 'cover_big' | 'screenshot_med' | 'screenshot_big' | 'screenshot_huge' | '720p' | '1080p' = 'cover_big'
): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}
