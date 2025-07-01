// components/buttons/AddWatchlistButton.tsx - Updated for watchlist collection
'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { type TMDBMultiSearchResult } from "@/types/tmdbApi"
import { WatchlistDocumentCreate } from "@/types/appwrite"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus, Check } from "lucide-react"
import SafeIcon from "@/components/SafeIcon"
import { database, ID } from "@/lib/appwrite"
import { Query } from "appwrite"

interface AddWatchlistButtonProps {
    media: TMDBMultiSearchResult;
    width?: string;
    query?: boolean;
    disabled?: boolean;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    showSuccess?: boolean;
}

const AddWatchlistButton = ({ 
    media, 
    width = "w-full", 
    query = false,
    disabled = false,
    variant = "default",
    size = "default",
    showSuccess = true
}: AddWatchlistButtonProps) => {
    const { user, setUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!user) return null;

    const prepareMediaData = async (mediaData: TMDBMultiSearchResult): Promise<WatchlistDocumentCreate> => {
        let fullMediaData = mediaData;

        if (query) {
            try {
                const endpoint = mediaData.media_type === 'movie' 
                    ? `https://api.themoviedb.org/3/movie/${mediaData.id}`
                    : `https://api.themoviedb.org/3/tv/${mediaData.id}`;
                
                const response = await fetch(endpoint, tmdbFetchOptions);
                if (!response.ok) {
                    throw new Error('Failed to fetch media details');
                }
                
                const detailedData = await response.json();
                fullMediaData = { ...mediaData, ...detailedData };
            } catch (error) {
                console.error('Error fetching full media details:', error);
                // Continue with basic data if detailed fetch fails
            }
        }
        
        console.log('Full Media Data:', fullMediaData);
        
        const title = fullMediaData.media_type === 'tv'
            ? (fullMediaData as { name?: string }).name || (mediaData as { name?: string }).name || ''
            : (fullMediaData as { title?: string }).title || (mediaData as { title?: string }).title || '';
        
        console.log('Media Title:', title);

        const releaseDate = fullMediaData.media_type === 'tv'
            ? (fullMediaData as any).first_air_date || mediaData.first_air_date
            : (fullMediaData as any).release_date || mediaData.release_date;

        // Ensure we have required fields
        if (!title || title.trim() === '') {
            throw new Error('Could not extract title from media data');
        }

        // Return WatchlistDocumentCreate structure - minimal required fields only
        return {
            title: title.trim(),
            tmdb_id: fullMediaData.id,
            tmdb_type: fullMediaData.media_type,
            content_type: fullMediaData.media_type,
            poster_url: fullMediaData.poster_path 
                ? `https://image.tmdb.org/t/p/w500${fullMediaData.poster_path}` 
                : '',
            backdrop_url: fullMediaData.backdrop_path 
                ? `https://image.tmdb.org/t/p/w500${fullMediaData.backdrop_path}` 
                : null,
            plex_request: false,
            description: fullMediaData.overview || 'No description available',
            genre_ids: fullMediaData.genre_ids || [],
            release_date: releaseDate || '',
        };
    };

    const handleAddWatchlist = async () => {
        if (isLoading || isSuccess) return;
        
        setIsLoading(true);
        
        try {
            // Debug: Log the media object to see its structure
            console.log('Media object:', media);
            console.log('Media ID:', media.id);
            console.log('Media type:', media.media_type);
            
            // Ensure we have valid values for the query
            if (!media.id || !media.media_type) {
                throw new Error('Invalid media data: missing id or media_type');
            }
            
            // Check if item already exists in watchlist
            const watchlist = await database.listDocuments(
                'watchlist',
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
                [
                    Query.equal('tmdb_id', media.id),
                    Query.equal('tmdb_type', media.media_type)
                ]
            );

            if (watchlist.documents.length > 0) {
                toast.error('This item is already in your watchlist!');
                return;
            }

            // Prepare the watchlist data
            const watchlistData = await prepareMediaData(media);

            console.log('Prepared watchlist data:', watchlistData);

            // Add to watchlist collection
            await database.createDocument(
                'watchlist',
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
                ID.unique(),
                watchlistData,
                [
                    'read("any")',
                    `update("user:${user.id}")`,
                    `delete("user:${user.id}")`
                ]
            );

            // Update user context - refresh the watchlist
            if (user.watchlist) {
                const updatedWatchlist = await database.listDocuments(
                    'watchlist', 
                    process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!
                );
                
                setUser(prevUser => prevUser ? {
                    ...prevUser,
                    watchlist: updatedWatchlist,
                } : null);
            }
            
            if (showSuccess) {
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);
                
                toast.success(
                    `Added "${watchlistData.title}" to your watchlist!`,
                    {
                        description: "You can now track and rate this item."
                    }
                );
            }
            
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            
            let errorMessage = 'Failed to add to watchlist';
            if (error instanceof Error) {
                if (error.message.includes('already exists') || error.message.includes('unique')) {
                    errorMessage = 'This item is already in your watchlist!';
                } else {
                    errorMessage = error.message;
                }
            }
                
            toast.error('Error adding to watchlist', {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const buttonContent = () => {
        if (isLoading) {
            return (
                <>
                    <SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} />
                    Adding...
                </>
            );
        }
        
        if (isSuccess) {
            return (
                <>
                    <SafeIcon icon={Check} className="h-4 w-4 mr-2 text-green-500" size={16} />
                    Added!
                </>
            );
        }
        
        return (
            <>
                <SafeIcon icon={Plus} className="h-4 w-4 mr-2" size={16} />
                Add to Watchlist
            </>
        );
    };

    const getButtonClass = () => {
        if (isSuccess) {
            return "bg-green-500 hover:bg-green-600 text-white border-green-500";
        }
        return "";
    };

    return (
        <Button
            variant={isSuccess ? "default" : variant}
            size={size}
            className={`
                ${width} 
                min-w-16 
                transition-all duration-200 ease-out
                hover:scale-105 active:scale-95
                ${getButtonClass()}
            `}
            onClick={handleAddWatchlist}
            disabled={disabled || isLoading || isSuccess}
        >
            {buttonContent()}
        </Button>
    );
};

export default AddWatchlistButton;