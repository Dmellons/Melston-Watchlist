// lib/services/aiService.ts - AI recommendation service
import {
  AIPreferenceContext,
  AISuggestion,
  AISuggestionsResponse,
  AICompletionRequest,
  AICompletionResponse
} from "@/types/ai";
import { WatchlistDocument } from "@/types/appwrite";
import { WatchStatus } from "@/types/customTypes";

// TMDB genre ID to name mapping
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  // TV genres
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

interface VLLMModelsResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    created?: number;
    owned_by?: string;
  }>;
}

export class AIService {
  private baseUrl: string;
  private cachedModel: string | null = null;

  constructor() {
    this.baseUrl = process.env.AI_SERVER_URL || 'http://192.168.0.7:8001';
  }

  /**
   * Query vLLM for the currently loaded model
   */
  async getAvailableModel(): Promise<string> {
    // Return cached model if available
    if (this.cachedModel) {
      return this.cachedModel;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data: VLLMModelsResponse = await response.json();

      if (data.data && data.data.length > 0) {
        this.cachedModel = data.data[0].id;
        console.log(`Using vLLM model: ${this.cachedModel}`);
        return this.cachedModel;
      }

      throw new Error('No models available on vLLM server');
    } catch (error) {
      console.error('Error fetching vLLM models:', error);
      throw new Error('Unable to connect to AI server or no models loaded');
    }
  }

  /**
   * Clear the cached model (useful if model changes)
   */
  clearModelCache(): void {
    this.cachedModel = null;
  }

  /**
   * Build preference context from user's watchlist data
   */
  buildPreferenceContext(
    userId: string,
    userName: string,
    watchlistItems: WatchlistDocument[]
  ): AIPreferenceContext {
    // Count genres
    const genreCounts: Record<number, number> = {};
    watchlistItems.forEach(item => {
      if (item.genre_ids) {
        item.genre_ids.forEach(genreId => {
          genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
        });
      }
    });

    // Sort genres by count
    const favoriteGenres = Object.entries(genreCounts)
      .map(([id, count]) => ({
        id: parseInt(id),
        name: GENRE_MAP[parseInt(id)] || `Genre ${id}`,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate average rating
    const ratedItems = watchlistItems.filter(item => item.rating && item.rating > 0);
    const averageRating = ratedItems.length > 0
      ? Math.round((ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length) * 10) / 10
      : 0;

    // Get top rated media (rating >= 8)
    const topRatedMedia = watchlistItems
      .filter(item => item.rating && item.rating >= 8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        rating: item.rating || 0,
        type: item.tmdb_type as 'movie' | 'tv',
        tmdb_id: item.tmdb_id
      }));

    // Get recently watched (completed items sorted by date_watched)
    const recentlyWatched = watchlistItems
      .filter(item => item.watch_status === WatchStatus.COMPLETED && item.date_watched)
      .sort((a, b) => new Date(b.date_watched!).getTime() - new Date(a.date_watched!).getTime())
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        type: item.tmdb_type as 'movie' | 'tv',
        tmdb_id: item.tmdb_id,
        date_watched: item.date_watched
      }));

    // Count watch statuses
    const watchStatusCounts = {
      want_to_watch: 0,
      watching: 0,
      completed: 0,
      on_hold: 0,
      dropped: 0
    };
    watchlistItems.forEach(item => {
      const status = item.watch_status || WatchStatus.WANT_TO_WATCH;
      if (status in watchStatusCounts) {
        watchStatusCounts[status as keyof typeof watchStatusCounts]++;
      }
    });

    // Get favorites
    const favorites = watchlistItems
      .filter(item => item.is_favorite)
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        type: item.tmdb_type as 'movie' | 'tv',
        tmdb_id: item.tmdb_id
      }));

    // Full library list — used to keep suggestions to titles the user doesn't already have
    const library = watchlistItems.map(item => ({
      title: item.title,
      type: item.tmdb_type,
      tmdb_id: item.tmdb_id
    }));

    return {
      userId,
      userName,
      favoriteGenres,
      averageRating,
      totalRated: ratedItems.length,
      topRatedMedia,
      recentlyWatched,
      watchStatusCounts,
      favorites,
      library
    };
  }

  /**
   * Generate the system prompt for the AI
   */
  private buildSystemPrompt(context: AIPreferenceContext, mediaType: string, count: number): string {
    const genreList = context.favoriteGenres
      .slice(0, 5)
      .map(g => `${g.name} (${g.count} items)`)
      .join(', ');

    const topRatedList = context.topRatedMedia
      .slice(0, 5)
      .map(m => `"${m.title}" (${m.rating}/10)`)
      .join(', ');

    const favoritesList = context.favorites
      .slice(0, 5)
      .map(f => `"${f.title}"`)
      .join(', ');

    const recentList = context.recentlyWatched
      .slice(0, 5)
      .map(r => `"${r.title}"`)
      .join(', ');

    // Everything already in the library is off-limits — "suggest something new"
    // must not return titles the user is watching or has completed. Cap the list
    // to keep the prompt bounded on very large libraries.
    const excludeList = context.library
      .slice(0, 200)
      .map(item => `"${item.title}"`)
      .join(', ');

    return `You are a personalized media recommendation assistant for ${context.userName}.
Based on their viewing history and preferences, suggest ${mediaType === 'all' ? 'movies, TV shows, or games' : mediaType + 's'} they might enjoy.

USER PREFERENCES:
- Favorite Genres: ${genreList || 'Not enough data'}
- Average Rating Given: ${context.averageRating}/10
- Total Items Rated: ${context.totalRated}
- Top Rated: ${topRatedList || 'None yet'}
- Favorites: ${favoritesList || 'None marked'}
- Recently Watched: ${recentList || 'None recently'}
- Want to Watch: ${context.watchStatusCounts.want_to_watch} items
- Currently Watching: ${context.watchStatusCounts.watching} items
- Completed: ${context.watchStatusCounts.completed} items

ALREADY IN THEIR LIBRARY (NEVER suggest any of these — they are watching them, have watched them, or already plan to):
${excludeList || 'Nothing yet'}

INSTRUCTIONS:
1. Consider the user's genre preferences and rating patterns
2. Suggest content similar to their highly-rated items
3. NEVER suggest anything from the ALREADY IN THEIR LIBRARY list above — every suggestion must be new to the user
4. Provide specific, actionable recommendations
5. Explain WHY each suggestion matches their preferences

RESPONSE FORMAT:
You must respond with valid JSON in this exact format:
{
  "suggestions": [
    {
      "title": "Exact title",
      "type": "movie" or "tv" or "game",
      "year": release year (number),
      "reason": "Brief explanation of why this matches their preferences",
      "confidence": 0.0 to 1.0
    }
  ]
}

Provide ${count} suggestions ordered by relevance.`;
  }

  /**
   * Drop suggestions the user already has in their library. Matches on
   * type+tmdb_id when enrichment resolved one, and on normalized title
   * either way (catches enrichment misses and type mismatches).
   */
  filterOwnedSuggestions(suggestions: AISuggestion[], context: AIPreferenceContext): AISuggestion[] {
    const normalize = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const ownedIds = new Set(context.library.map(item => `${item.type}-${item.tmdb_id}`));
    const ownedTitles = new Set(context.library.map(item => normalize(item.title)));

    return suggestions.filter(s =>
      !(s.tmdb_id && ownedIds.has(`${s.type}-${s.tmdb_id}`)) &&
      !ownedTitles.has(normalize(s.title || ''))
    );
  }

  /**
   * Get AI suggestions based on user prompt and preferences
   */
  async getSuggestions(
    prompt: string,
    context: AIPreferenceContext,
    mediaType: 'movie' | 'tv' | 'game' | 'all' = 'all',
    limit: number = 5
  ): Promise<AISuggestionsResponse> {
    // Get the model from vLLM
    const model = await this.getAvailableModel();

    // Ask for a few extra so the post-generation library filter still leaves
    // `limit` suggestions when the model slips one through.
    const requestCount = Math.min(limit + 3, 10);
    const systemPrompt = this.buildSystemPrompt(context, mediaType, requestCount);

    const request: AICompletionRequest = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Qwen3 (and other reasoning models) default to a "thinking" phase that
        // can consume the entire token budget before emitting the JSON answer,
        // leaving message.content empty. Disable it so the model answers directly.
        body: JSON.stringify({ ...request, chat_template_kwargs: { enable_thinking: false } }),
      });

      if (!response.ok) {
        throw new Error(`AI server responded with status ${response.status}`);
      }

      const data: AICompletionResponse = await response.json();
      const message: any = data.choices?.[0]?.message;

      // Reasoning models can leave `content` empty and put text in `reasoning`,
      // or wrap their thinking in <think>...</think> inside the content. Be
      // resilient to all of these so we still recover the JSON answer.
      let content: string = (message?.content || message?.reasoning || '').trim();
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      if (!content) {
        const finish = data.choices?.[0]?.finish_reason;
        throw new Error(
          finish === 'length'
            ? 'AI response was truncated before producing an answer (token limit reached).'
            : 'No content in AI response',
        );
      }

      // Extract the JSON object even if the model wrapped it in prose/fences.
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      const jsonStr = start >= 0 && end > start ? content.slice(start, end + 1) : content;

      const parsed = JSON.parse(jsonStr);
      // Return up to requestCount here — the route filters out library matches
      // after TMDB enrichment, then trims to the caller's limit.
      const suggestions: AISuggestion[] = (parsed.suggestions || [])
        .slice(0, requestCount)
        .map((s: any) => ({
          title: s.title,
          type: s.type || 'movie',
          year: s.year,
          reason: s.reason,
          confidence: s.confidence || 0.5,
        }));

      return {
        suggestions,
        prompt,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI suggestion error:', error);
      throw error;
    }
  }

  /**
   * Enrich suggestions with TMDB data
   */
  async enrichSuggestionsWithTMDB(suggestions: AISuggestion[]): Promise<AISuggestion[]> {
    const enriched: AISuggestion[] = [];

    for (const suggestion of suggestions) {
      if (suggestion.type === 'game') {
        // Games will be enriched with IGDB later
        enriched.push(suggestion);
        continue;
      }

      try {
        // Search TMDB for the title
        const searchType = suggestion.type === 'tv' ? 'tv' : 'movie';
        const query = encodeURIComponent(suggestion.title);
        const year = suggestion.year ? `&year=${suggestion.year}` : '';

        const response = await fetch(
          `https://api.themoviedb.org/3/search/${searchType}?query=${query}${year}&language=en-US&page=1`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`,
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const firstResult = data.results?.[0];

          if (firstResult) {
            enriched.push({
              ...suggestion,
              tmdb_id: firstResult.id,
              poster_path: firstResult.poster_path,
              overview: firstResult.overview,
            });
            continue;
          }
        }
      } catch (error) {
        console.error(`Failed to enrich suggestion "${suggestion.title}":`, error);
      }

      // If enrichment failed, add without TMDB data
      enriched.push(suggestion);
    }

    return enriched;
  }
}

// Export singleton instance
export const aiService = new AIService();
