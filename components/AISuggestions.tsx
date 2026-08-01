'use client'
import { useAISuggestions } from '@/hooks/useAISuggestions'
import AIPromptInput from './AIPromptInput'
import AISuggestionCard from './AISuggestionCard'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import SafeIcon from '@/components/SafeIcon'
import { Sparkles, AlertCircle, RefreshCw, Clock, BarChart3 } from 'lucide-react'

const AISuggestions = () => {
  const {
    suggestions,
    loading,
    error,
    lastPrompt,
    generatedAt,
    context,
    getSuggestions,
    clearSuggestions,
    clearError,
  } = useAISuggestions();

  const handleSubmit = async (prompt: string, mediaType: 'movie' | 'tv' | 'game' | 'all') => {
    await getSuggestions(prompt, mediaType, 5);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <AIPromptInput
        onSubmit={handleSubmit}
        isLoading={loading}
      />

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex items-start gap-3">
            <SafeIcon icon={AlertCircle} className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10 animate-pulse">
                <SafeIcon icon={Sparkles} className="h-5 w-5 text-primary animate-spin" size={20} />
              </div>
              <div>
                <p className="font-medium">Analyzing your preferences...</p>
                <p className="text-sm text-muted-foreground">
                  Finding personalized recommendations
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <Skeleton className="w-24 h-36 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1">
                    <SafeIcon icon={Sparkles} className="h-3 w-3" size={12} />
                    {suggestions.length} suggestions
                  </Badge>
                  {generatedAt && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <SafeIcon icon={Clock} className="h-3 w-3" size={12} />
                      {formatTime(generatedAt)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearSuggestions}>
                    <SafeIcon icon={RefreshCw} className="h-4 w-4 mr-1" size={16} />
                    New Search
                  </Button>
                </div>
              </div>

              {/* User Context Info */}
              {context && (
                <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="gap-1">
                    <SafeIcon icon={BarChart3} className="h-3 w-3" size={12} />
                    Based on {context.totalItems} items
                  </Badge>
                  {context.favoriteGenres.length > 0 && (
                    <span className="text-xs">
                      Top genres: {context.favoriteGenres.join(', ')}
                    </span>
                  )}
                  {context.averageRating > 0 && (
                    <span className="text-xs">
                      Avg rating: {context.averageRating}/10
                    </span>
                  )}
                </div>
              )}

              {/* Query */}
              {lastPrompt && (
                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground">Query: </span>
                  <span className="italic">&quot;{lastPrompt}&quot;</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Suggestion Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {suggestions.map((suggestion, index) => (
              <AISuggestionCard key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && suggestions.length === 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted/50">
                <SafeIcon icon={Sparkles} className="h-8 w-8 text-muted-foreground" size={32} />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Ready for recommendations</CardTitle>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a prompt above to get personalized suggestions based on your watchlist and rating history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISuggestions;
