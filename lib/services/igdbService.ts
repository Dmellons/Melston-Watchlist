// lib/services/igdbService.ts - IGDB API service for video games
import {
  IGDBGame,
  IGDBCover,
  PLATFORM_IDS,
  getIGDBImageUrl
} from "@/types/game";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class IGDBService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.IGDB_CLIENT_ID || '';
    this.clientSecret = process.env.IGDB_CLIENT_SECRET || '';
  }

  /**
   * Get Twitch OAuth token for IGDB API access
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('IGDB credentials not configured. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.');
    }

    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Twitch OAuth failed: ${response.status}`);
      }

      const data: TwitchTokenResponse = await response.json();

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      console.log('IGDB: Obtained new access token');
      return this.accessToken;
    } catch (error) {
      console.error('IGDB token error:', error);
      throw new Error('Failed to authenticate with IGDB');
    }
  }

  /**
   * Make an IGDB API request
   */
  private async apiRequest<T>(endpoint: string, query: string): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IGDB API error:', errorText);
      throw new Error(`IGDB API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search for games by name
   */
  async searchGames(query: string, limit: number = 10): Promise<IGDBGame[]> {
    const igdbQuery = `
      search "${query.replace(/"/g, '\\"')}";
      fields name, slug, summary, cover.image_id, first_release_date,
             rating, aggregated_rating, genres.name, platforms.name,
             platforms.abbreviation, involved_companies.company.name,
             involved_companies.developer, involved_companies.publisher;
      limit ${limit};
    `;

    return this.apiRequest<IGDBGame[]>('games', igdbQuery);
  }

  /**
   * Get game details by IGDB ID
   */
  async getGameById(igdbId: number): Promise<IGDBGame | null> {
    const igdbQuery = `
      fields name, slug, summary, storyline, cover.image_id,
             screenshots.image_id, first_release_date, rating, rating_count,
             aggregated_rating, aggregated_rating_count, genres.name, genres.slug,
             platforms.name, platforms.abbreviation, platforms.slug,
             involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, game_modes.name, themes.name,
             similar_games, websites.category, websites.url, videos.video_id, videos.name;
      where id = ${igdbId};
    `;

    const results = await this.apiRequest<IGDBGame[]>('games', igdbQuery);
    return results[0] || null;
  }

  /**
   * Get multiple games by IDs
   */
  async getGamesByIds(igdbIds: number[]): Promise<IGDBGame[]> {
    if (igdbIds.length === 0) return [];

    const igdbQuery = `
      fields name, slug, summary, cover.image_id, first_release_date,
             rating, aggregated_rating, genres.name, platforms.name;
      where id = (${igdbIds.join(',')});
      limit ${igdbIds.length};
    `;

    return this.apiRequest<IGDBGame[]>('games', igdbQuery);
  }

  /**
   * Get popular/trending games
   */
  async getPopularGames(limit: number = 10): Promise<IGDBGame[]> {
    const igdbQuery = `
      fields name, slug, summary, cover.image_id, first_release_date,
             rating, aggregated_rating, genres.name, platforms.name;
      where rating_count > 100 & cover != null;
      sort rating desc;
      limit ${limit};
    `;

    return this.apiRequest<IGDBGame[]>('games', igdbQuery);
  }

  /**
   * Get recently released games
   */
  async getRecentGames(limit: number = 10): Promise<IGDBGame[]> {
    const now = Math.floor(Date.now() / 1000);
    const threeMonthsAgo = now - (90 * 24 * 60 * 60);

    const igdbQuery = `
      fields name, slug, summary, cover.image_id, first_release_date,
             rating, aggregated_rating, genres.name, platforms.name;
      where first_release_date >= ${threeMonthsAgo} & first_release_date <= ${now} & cover != null;
      sort first_release_date desc;
      limit ${limit};
    `;

    return this.apiRequest<IGDBGame[]>('games', igdbQuery);
  }

  /**
   * Get upcoming games
   */
  async getUpcomingGames(limit: number = 10): Promise<IGDBGame[]> {
    const now = Math.floor(Date.now() / 1000);

    const igdbQuery = `
      fields name, slug, summary, cover.image_id, first_release_date,
             genres.name, platforms.name;
      where first_release_date > ${now} & cover != null;
      sort first_release_date asc;
      limit ${limit};
    `;

    return this.apiRequest<IGDBGame[]>('games', igdbQuery);
  }

  /**
   * Get games for a specific platform
   */
  async getGamesForPlatform(
    platformId: number,
    limit: number = 20
  ): Promise<IGDBGame[]> {
    const igdbQuery = `
      fields name, slug, summary, cover.image_id, first_release_date,
             rating, aggregated_rating, genres.name, platforms.name;
      where platforms = ${platformId} & rating_count > 50 & cover != null;
      sort rating desc;
      limit ${limit};
    `;

    return this.apiRequest<IGDBGame[]>('games', igdbQuery);
  }

  /**
   * Get similar games
   */
  async getSimilarGames(igdbId: number, limit: number = 5): Promise<IGDBGame[]> {
    const game = await this.getGameById(igdbId);

    if (!game?.similar_games || game.similar_games.length === 0) {
      return [];
    }

    const similarIds = game.similar_games.slice(0, limit);
    return this.getGamesByIds(similarIds);
  }

  /**
   * Get cover image URL
   */
  getCoverUrl(
    cover: IGDBCover | undefined,
    size: 'thumb' | 'cover_small' | 'cover_big' | '720p' = 'cover_big'
  ): string | null {
    if (!cover?.image_id) return null;
    return getIGDBImageUrl(cover.image_id, size);
  }

  /**
   * Format release date from Unix timestamp
   */
  formatReleaseDate(timestamp: number | undefined): string {
    if (!timestamp) return 'TBA';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get release year from Unix timestamp
   */
  getReleaseYear(timestamp: number | undefined): number | null {
    if (!timestamp) return null;
    return new Date(timestamp * 1000).getFullYear();
  }

  /**
   * Check if credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

// Export singleton instance
export const igdbService = new IGDBService();
