// components/buttons/AddWatchlistButton.tsx - Updated for ratings collection
'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { RatingsService, CreateRatingData } from "@/lib/services/ratingsService"
import { type TMDBMultiSearchResult } from "@/types/tmdbApi"
import { WatchStatus } from "@/types/customTypes"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus, Check } from "lucide-react"
import SafeIcon from "@/components/SafeIcon"

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

    const prepareMediaData = async (mediaData: TMDBMultiSearchResult): Promise<CreateRatingData> => {
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

        const title = fullMediaData.media_type === 'tv' 
            ? (fullMediaData as any).name || mediaData.name
            : (fullMediaData as any).title || mediaData.title;

        return {
            user_id: user.id!,
            user_name: user.name,
            tmdb_id: fullMediaData.id,
            tmdb_type: fullMediaData.media_type,
            media_title: title,
            watch_status: WatchStatus.WANT_TO_WATCH,
            rewatch_count: 0,
            is_favorite: false,
            tags: []
        };
    };

    const handleAddWatchlist = async () => {
        if (isLoading || isSuccess) return;
        
        setIsLoading(true);
        
        try {
            // Check if item already exists
            const existingRating = await RatingsService.getUserRating(
                user.id!, 
                media.id, 
                media.media_type
            );

            if (existingRating) {
                toast.error('This item is already in your watchlist!');
                return;
            }

            // Prepare the rating data
            const ratingData = await prepareMediaData(media);

            // Add to ratings/watchlist
            await RatingsService.addOrUpdateRating(ratingData);

            // Update user context if needed
            // You might want to refresh the user's watchlist here
            
            if (showSuccess) {
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);
                
                toast.success(
                    `Added "${ratingData.media_title}" to your watchlist!`,
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