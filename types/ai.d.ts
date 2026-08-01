// types/ai.d.ts - Types for AI recommendation system

export interface AIPreferenceContext {
  userId: string;
  userName: string;
  favoriteGenres: { id: number; name: string; count: number }[];
  averageRating: number;
  totalRated: number;
  topRatedMedia: {
    title: string;
    rating: number;
    type: 'movie' | 'tv';
    tmdb_id: number;
  }[];
  recentlyWatched: {
    title: string;
    type: 'movie' | 'tv';
    tmdb_id: number;
    date_watched?: string;
  }[];
  watchStatusCounts: {
    want_to_watch: number;
    watching: number;
    completed: number;
    on_hold: number;
    dropped: number;
  };
  favorites: {
    title: string;
    type: 'movie' | 'tv';
    tmdb_id: number;
  }[];
}

export interface AISuggestionRequest {
  prompt: string;
  mediaType?: 'movie' | 'tv' | 'game' | 'all';
  limit?: number;
}

export interface AISuggestion {
  title: string;
  type: 'movie' | 'tv' | 'game';
  year?: number;
  reason: string;
  confidence: number;
  tmdb_id?: number;
  igdb_id?: number;
  poster_path?: string;
  overview?: string;
}

export interface AISuggestionsResponse {
  suggestions: AISuggestion[];
  prompt: string;
  generatedAt: string;
}

export interface AIServiceConfig {
  baseUrl: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  model: string;
  messages: AIMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: 'json_object' };
}

export interface AICompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
