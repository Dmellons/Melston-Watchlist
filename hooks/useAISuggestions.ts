'use client'
import { useState, useCallback } from 'react';
import { AISuggestion, AISuggestionsResponse } from '@/types/ai';

export interface UseAISuggestionsState {
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
  lastPrompt: string | null;
  generatedAt: string | null;
  context: {
    totalItems: number;
    favoriteGenres: string[];
    averageRating: number;
  } | null;
}

export interface UseAISuggestionsReturn extends UseAISuggestionsState {
  getSuggestions: (
    prompt: string,
    mediaType?: 'movie' | 'tv' | 'game' | 'all',
    limit?: number
  ) => Promise<void>;
  clearSuggestions: () => void;
  clearError: () => void;
}

export function useAISuggestions(): UseAISuggestionsReturn {
  const [state, setState] = useState<UseAISuggestionsState>({
    suggestions: [],
    loading: false,
    error: null,
    lastPrompt: null,
    generatedAt: null,
    context: null,
  });

  const getSuggestions = useCallback(async (
    prompt: string,
    mediaType: 'movie' | 'tv' | 'game' | 'all' = 'all',
    limit: number = 5
  ) => {
    if (!prompt.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a prompt' }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mediaType,
          limit: Math.min(limit, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestions');
      }

      setState({
        suggestions: data.data.suggestions || [],
        loading: false,
        error: null,
        lastPrompt: data.data.prompt,
        generatedAt: data.data.generatedAt,
        context: data.context || null,
      });
    } catch (error) {
      console.error('AI suggestions error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get suggestions',
      }));
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setState({
      suggestions: [],
      loading: false,
      error: null,
      lastPrompt: null,
      generatedAt: null,
      context: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    getSuggestions,
    clearSuggestions,
    clearError,
  };
}
