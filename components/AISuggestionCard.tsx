'use client'
import { AISuggestion } from "@/types/ai"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useUser } from "@/hooks/User"
import { useState } from "react"
import { toast } from "sonner"
import { database, ID } from "@/lib/appwrite"
import { Query } from "appwrite"
import { tmdbFetchOptions } from "@/lib/tmdb"
import ImageWithFallback from "@/components/ImageWithFallback"
import SafeIcon from "@/components/SafeIcon"
import { Film, Tv, Gamepad2, Plus, Check, Loader2, Sparkles, ExternalLink } from "lucide-react"
import Link from "next/link"

interface AISuggestionCardProps {
  suggestion: AISuggestion;
}

const AISuggestionCard = ({ suggestion }: AISuggestionCardProps) => {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getMediaIcon = () => {
    switch (suggestion.type) {
      case 'movie': return Film;
      case 'tv': return Tv;
      case 'game': return Gamepad2;
      default: return Film;
    }
  };

  const getConfidenceColor = () => {
    if (suggestion.confidence >= 0.8) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (suggestion.confidence >= 0.6) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  const posterUrl = suggestion.poster_path
    ? `https://image.tmdb.org/t/p/w300${suggestion.poster_path}`
    : null;

  const handleAddToWatchlist = async () => {
    if (!user || isLoading || isSuccess) return;
    if (suggestion.type === 'game') {
      toast.info('Game support coming soon!');
      return;
    }
    if (!suggestion.tmdb_id) {
      toast.error('Could not find this title in TMDB');
      return;
    }

    setIsLoading(true);

    try {
      // Check if already in watchlist
      const existing = await database.listDocuments(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [
          Query.equal('tmdb_id', suggestion.tmdb_id),
          Query.equal('tmdb_type', suggestion.type)
        ]
      );

      if (existing.documents.length > 0) {
        toast.error('This item is already in your watchlist!');
        return;
      }

      // Fetch full details from TMDB
      const endpoint = suggestion.type === 'movie'
        ? `https://api.themoviedb.org/3/movie/${suggestion.tmdb_id}`
        : `https://api.themoviedb.org/3/tv/${suggestion.tmdb_id}`;

      const response = await fetch(endpoint, tmdbFetchOptions);
      if (!response.ok) throw new Error('Failed to fetch media details');

      const data = await response.json();

      const title = suggestion.type === 'tv' ? data.name : data.title;
      const releaseDate = suggestion.type === 'tv' ? data.first_air_date : data.release_date;

      await database.createDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        ID.unique(),
        {
          title: title,
          tmdb_id: suggestion.tmdb_id,
          tmdb_type: suggestion.type,
          content_type: suggestion.type,
          poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
          backdrop_url: data.backdrop_path ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}` : null,
          plex_request: false,
          description: data.overview || 'No description available',
          genre_ids: data.genres?.map((g: any) => g.id) || [],
          release_date: releaseDate || '',
        },
        [
          'read("any")',
          `update("user:${user.id}")`,
          `delete("user:${user.id}")`
        ]
      );

      // Refresh watchlist
      const updatedWatchlist = await database.listDocuments(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [Query.limit(1000)]
      );

      setUser(prevUser => prevUser ? {
        ...prevUser,
        watchlist: updatedWatchlist,
      } : null);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);

      toast.success(`Added "${title}" to your watchlist!`);

    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const MediaIcon = getMediaIcon();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Poster */}
          <div className="relative flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-muted/30">
            {posterUrl ? (
              <ImageWithFallback
                src={posterUrl}
                alt={suggestion.title}
                className="w-full h-full object-cover"
                width={96}
                height={144}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <SafeIcon icon={MediaIcon} className="h-8 w-8 text-muted-foreground/50" size={32} />
              </div>
            )}
            {/* Confidence badge */}
            <div className="absolute top-1 right-1">
              <Badge className={`${getConfidenceColor()} text-xs px-1.5`}>
                {Math.round(suggestion.confidence * 100)}%
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Title and type */}
              <div className="flex items-start gap-2 mb-2">
                <Badge variant="outline" className="flex-shrink-0">
                  <SafeIcon icon={MediaIcon} className="h-3 w-3 mr-1" size={12} />
                  {suggestion.type.toUpperCase()}
                </Badge>
                {suggestion.year && (
                  <Badge variant="secondary" className="flex-shrink-0">
                    {suggestion.year}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                {suggestion.title}
              </h3>

              {/* AI Reason */}
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <SafeIcon icon={Sparkles} className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" size={16} />
                <p className="line-clamp-2">{suggestion.reason}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {suggestion.tmdb_id && suggestion.type !== 'game' && (
                <>
                  <Button
                    variant={isSuccess ? "default" : "default"}
                    size="sm"
                    className={`flex-1 ${isSuccess ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    onClick={handleAddToWatchlist}
                    disabled={isLoading || isSuccess || !user}
                  >
                    {isLoading ? (
                      <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                    ) : isSuccess ? (
                      <>
                        <SafeIcon icon={Check} className="h-4 w-4 mr-1" size={16} />
                        Added
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={Plus} className="h-4 w-4 mr-1" size={16} />
                        Add
                      </>
                    )}
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/${suggestion.type}/${suggestion.tmdb_id}`}>
                      <SafeIcon icon={ExternalLink} className="h-4 w-4" size={16} />
                    </Link>
                  </Button>
                </>
              )}
              {suggestion.type === 'game' && (
                <Badge variant="secondary" className="text-xs">
                  Game support coming soon
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Overview (if available) */}
        {suggestion.overview && (
          <div className="px-4 pb-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2 border-t border-border/30 pt-3">
              {suggestion.overview}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestionCard;
