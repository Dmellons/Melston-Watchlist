// components/buttons/AddWatchlistButton.tsx - Updated version
'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { ID, database, Permission, Role } from "@/lib/appwrite"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { type WatchlistDocumentCreate } from "@/types/appwrite"
import { type TMDBMultiSearchResult } from "@/types/tmdbApi"
import { WatchStatus } from "@/types/customTypes"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus, Check } from "lucide-react"
import SafeIcon from "@/components/SafeIcon"

interface AddWatchlistButtonProps {
    media: TMDBMultiSearchResult | WatchlistDocumentCreate;
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
            release_date: '',
            // NEW: Initialize personalized fields with defaults
            watch_status: WatchStatus.WANT_TO_WATCH,
            user_rating: undefined,
            user_review: undefined,
            date_watched: undefined,
            rewatch_count: 0,
            is_favorite: false,
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
        if (isLoading || isSuccess) return;
        
        setIsLoading(true);
        
        try {
            const watchlistDocument = await createWatchlistDocument(media);
            
            // Create document with user-specific permissions
            const result = await database.createDocument(
                'watchlist', 
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!, 
                ID.unique(), 
                watchlistDocument,
                [
                    // Only the creator can read, update, and delete their own watchlist items
                    Permission.read(Role.user(user.id!)),
                    Permission.update(Role.user(user.id!)),
                    Permission.delete(Role.user(user.id!)),
                    // Admin users can also access any document
                    ...(user.admin ? [
                        Permission.read(Role.label('admin')),
                        Permission.update(Role.label('admin')),
                        Permission.delete(Role.label('admin'))
                    ] : [])
                ]
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

            if (showSuccess) {
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);
                
                toast.success(
                    `Added "${watchlistDocument.title}" to your watchlist!`,
                    {
                        description: "You can now rate and track your progress."
                    }
                );
            }
            
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to add to watchlist';
                
            toast.error(
                `Error adding to watchlist`,
                {
                    description: errorMessage
                }
            );
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