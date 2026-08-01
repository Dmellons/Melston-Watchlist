// lib/services/steamService.ts - Steam Web API integration
import {
  SteamOwnedGame,
  SteamOwnedGamesResponse,
  SteamPlayerSummary
} from "@/types/game";

interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayerSummary[];
  };
}

interface SteamResolveVanityResponse {
  response: {
    steamid?: string;
    success: number;
    message?: string;
  };
}

class SteamService {
  private apiKey: string;
  private baseUrl = 'https://api.steampowered.com';

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY || '';
  }

  /**
   * Get owned games for a Steam user
   * Requires the user's profile to be public
   */
  async getOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
    if (!this.apiKey) {
      throw new Error('Steam API key not configured');
    }

    const url = `${this.baseUrl}/IPlayerService/GetOwnedGames/v1/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status}`);
      }

      const data: SteamOwnedGamesResponse = await response.json();

      if (!data.response?.games) {
        // Could be private profile or no games
        return [];
      }

      return data.response.games;
    } catch (error) {
      console.error('Steam getOwnedGames error:', error);
      throw error;
    }
  }

  /**
   * Get player profile summary
   */
  async getPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
    if (!this.apiKey) {
      throw new Error('Steam API key not configured');
    }

    const url = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${this.apiKey}&steamids=${steamId}&format=json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status}`);
      }

      const data: SteamPlayerSummariesResponse = await response.json();
      return data.response.players[0] || null;
    } catch (error) {
      console.error('Steam getPlayerSummary error:', error);
      throw error;
    }
  }

  /**
   * Resolve vanity URL to Steam ID
   * e.g., "gaben" -> "76561197960287930"
   */
  async resolveVanityUrl(vanityUrl: string): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('Steam API key not configured');
    }

    const url = `${this.baseUrl}/ISteamUser/ResolveVanityURL/v1/?key=${this.apiKey}&vanityurl=${vanityUrl}&format=json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status}`);
      }

      const data: SteamResolveVanityResponse = await response.json();

      if (data.response.success === 1 && data.response.steamid) {
        return data.response.steamid;
      }

      return null;
    } catch (error) {
      console.error('Steam resolveVanityUrl error:', error);
      throw error;
    }
  }

  /**
   * Get recently played games (last 2 weeks)
   */
  async getRecentlyPlayedGames(steamId: string, count: number = 10): Promise<SteamOwnedGame[]> {
    if (!this.apiKey) {
      throw new Error('Steam API key not configured');
    }

    const url = `${this.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${this.apiKey}&steamid=${steamId}&count=${count}&format=json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response?.games || [];
    } catch (error) {
      console.error('Steam getRecentlyPlayedGames error:', error);
      throw error;
    }
  }

  /**
   * Get Steam store page URL for a game
   */
  getStoreUrl(appId: number): string {
    return `https://store.steampowered.com/app/${appId}`;
  }

  /**
   * Get Steam game header image URL
   */
  getHeaderImageUrl(appId: number): string {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
  }

  /**
   * Get Steam game capsule image URL (smaller)
   */
  getCapsuleImageUrl(appId: number): string {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`;
  }

  /**
   * Format playtime from minutes to readable string
   */
  formatPlaytime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Validate if a string looks like a Steam ID (17-digit number)
   */
  isValidSteamId(input: string): boolean {
    return /^\d{17}$/.test(input);
  }

  /**
   * Parse Steam ID from various input formats
   * Accepts: Steam ID, vanity URL, or profile URL
   */
  async parseSteamId(input: string): Promise<string | null> {
    // Already a Steam ID
    if (this.isValidSteamId(input)) {
      return input;
    }

    // Extract from profile URL
    const profileMatch = input.match(/steamcommunity\.com\/(?:profiles|id)\/([^\/]+)/);
    if (profileMatch) {
      const idOrVanity = profileMatch[1];

      if (this.isValidSteamId(idOrVanity)) {
        return idOrVanity;
      }

      // It's a vanity URL, resolve it
      return this.resolveVanityUrl(idOrVanity);
    }

    // Assume it's a vanity URL
    return this.resolveVanityUrl(input);
  }
}

// Export singleton instance
export const steamService = new SteamService();
