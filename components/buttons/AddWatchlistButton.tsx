'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { ID, database } from "@/lib/appwrite"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { type WatchlistDocumentCreate } from "@/types/appwrite"
import { type TMDBMultiSearchResult } from "@/types/tmdbApi"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

interface AddWatchlistButtonProps {
    media: TMDBMultiSearchResult | WatchlistDocumentCreate;
    width?: string;
    query?: boolean;
    disabled?: boolean;
}

const AddWatchlistButton = ({ 
    media, 
    width = "w-full", 
    query = false,
    disabled = false 
}: AddWatchlistButtonProps) => {
    const { user, setUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    if (!user) return null;

    const createWatchlistDocument = async (mediaData: any): Promise<WatchlistDocumentCreate> => {
        if (query) {
            // Fetch full details if coming from search query
            try {
                const endpoint = mediaData.media_type === 'movie' 
                    ? `https://api.themoviedb.org/3/movie/${mediaData.id}`
                    : `https://api.themoviedb.org/3/tv/${mediaData.id}`;
                
                const response = await fetch(endpoint, tmdbFetchOptions);
                if (!response.ok) {
                    throw new Error('Failed to fetch media details');
                }
                
                const fullMediaData = await response.json();
                fullMediaData.media_type = mediaData.media_type;
                mediaData = fullMediaData;
            } catch (error) {
                console.error('Error fetching full media details:', error);
                throw new Error('Failed to fetch complete media information');
            }
        }

        const baseDocument: WatchlistDocumentCreate = {
            tmdb_id: mediaData.id || mediaData.tmdb_id,
            tmdb_type: mediaData.media_type || mediaData.tmdb_type,
            content_type: mediaData.media_type || mediaData.tmdb_type,
            poster_url: mediaData.poster_path 
                ? `https://image.tmdb.org/t/p/w500${mediaData.poster_path}`
                : mediaData.poster_url || '',
            backdrop_url: mediaData.backdrop_path 
                ? `https://image.tmdb.org/t/p/w500${mediaData.backdrop_path}`
                : mediaData.backdrop_url || null,
            description: mediaData.overview || mediaData.description || "No description available",
            genre_ids: mediaData.genres?.map((g: any) => g.id) || mediaData.genre_ids || [],
            plex_request: false,
            title: '',
            release_date: ''
        };

        // Set title and release date based on media type
        if (mediaData.media_type === 'tv' || mediaData.tmdb_type === 'tv') {
            baseDocument.title = mediaData.name || mediaData.title;
            baseDocument.release_date = mediaData.first_air_date || mediaData.release_date;
        } else {
            baseDocument.title = mediaData.title;
            baseDocument.release_date = mediaData.release_date;
        }

        return baseDocument;
    };

    const handleAddWatchlist = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const watchlistDocument = await createWatchlistDocument(media);
            
            const result = await database.createDocument(
                'watchlist', 
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!, 
                ID.unique(), 
                watchlistDocument
            );

            // Update user state with new watchlist
            const updatedWatchlist = await database.listDocuments(
                'watchlist', 
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!
            );
            
            setUser(prevUser => prevUser ? {
                ...prevUser,
                watchlist: updatedWatchlist,
            } : null);

            toast.success(`Added "${watchlistDocument.title}" to your watchlist!`);
            
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to add to watchlist';
                
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="default"
            className={`${width} min-w-16 text-primary-foreground hover:bg-primary/70`}
            onClick={handleAddWatchlist}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                </>
            )}
        </Button>
    );
};

export default AddWatchlistButton;