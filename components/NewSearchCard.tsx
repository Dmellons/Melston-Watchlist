'use client'
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import ProvidersBlock from "./ProvidersBlock"
import AddWatchlistButton from "./buttons/AddWatchlistButton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "./ui/button"
import Link from "next/link"
import { useUser } from "@/hooks/User"
import { useEffect, useState } from "react"
import ImageWithFallback from "@/components/ImageWithFallback"
import SafeIcon from "@/components/SafeIcon"
import { Info, Calendar, Film, Tv, Eye } from "lucide-react"

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year: string,
    poster_path: string,
    backdrop_path: string,
    description: string,
    genre_ids?: number[]
}

const NewSearchCard = ({
    media,
    userProviders
}: {
    media: TMDBMultiSearchResult
    userProviders?: number[]
}) => {
    const { user } = useUser();
    const [data, setData] = useState<CardData | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    useEffect(() => {
        if (media.media_type === 'person') {
            return; // Don't render person results
        }

        if (media.media_type === 'tv') {
            setData({
                title: media.name,
                content_type: media.media_type,
                tmdb_id: media.id,
                tmdb_type: media.media_type,
                year: media.first_air_date,
                poster_path: media.poster_path,
                backdrop_path: media.backdrop_path,
                genre_ids: media.genre_ids,
                description: media.overview ? media.overview : "No description available"
            });
        }

        if (media.media_type === 'movie') {
            setData({
                title: media.title,
                content_type: media.media_type,
                tmdb_id: media.id,
                tmdb_type: media.media_type,
                year: media.release_date,
                poster_path: media.poster_path,
                backdrop_path: media.backdrop_path,
                genre_ids: media.genre_ids,
                description: media.overview ? media.overview : "No description available"
            });
        }
    }, [media]);

    if (!data) return null;

    const releaseYear = data.year ? data.year.split('-')[0] : 'N/A';
    const mediaTypeIcon = data.content_type === 'movie' ? Film : Tv;

    return (
        <div className="flex flex-col space-y-3 group">
            {/* Poster and Info */}
            <div 
                className="relative transition-all duration-200 hover:scale-105"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Media Type Badge */}
                <div className="absolute top-2 right-2 z-10">
                    <div className="bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
                        <div className="flex items-center gap-1">
                            <SafeIcon
                                icon={mediaTypeIcon}
                                className="h-3 w-3 text-muted-foreground"
                                size={12}
                            />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                {data.content_type}
                            </span>
                        </div>
                    </div>
                </div>

                <ImageWithFallback
                    src={`https://image.tmdb.org/t/p/w500/${data.poster_path}`}
                    alt={data.title}
                    className="rounded-lg w-auto h-60 sm:h-72 shadow-lg transition-all duration-200 group-hover:shadow-xl"
                    width={200}
                    height={300}
                />

                {/* Title overlay on hover */}
                <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                    rounded-lg transition-opacity duration-200 flex items-end p-3
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                    <div className="text-white">
                        <h3 className="font-bold text-sm line-clamp-2 mb-1">{data.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                            <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
                            <span>{releaseYear}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Providers */}
            <div className="px-1">
                <ProvidersBlock 
                    tmdbId={data.tmdb_id} 
                    tmdbType={data.tmdb_type} 
                    userProviders={userProviders} 
                    maxWidth="w-full"
                    iconSize={20}
                    notStreamingValue={
                        <div className="flex items-center justify-center p-2 bg-muted/20 rounded-md border border-dashed border-muted-foreground/30">
                            <span className="text-xs text-muted-foreground">N/A</span>
                        </div>
                    }
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 px-1">
                <AddWatchlistButton 
                    media={media} 
                    query={true}
                    width="w-full"
                />
                
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/${data.tmdb_type}/${data.tmdb_id}`}>
                            <SafeIcon icon={Info} className="h-3 w-3 mr-1" size={12} />
                            More Info
                        </Link>
                    </Button>

                    {/* Quick View Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="px-2">
                                <SafeIcon icon={Eye} className="h-3 w-3" size={12} />
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="space-y-4">
                                {/* Backdrop Image */}
                                {data.backdrop_path && (
                                    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                                        <ImageWithFallback
                                            src={`https://image.tmdb.org/t/p/w500/${data.backdrop_path}`}
                                            alt={data.title}
                                            className="w-full h-full object-cover"
                                            width={500}
                                            height={280}
                                        />
                                        {/* Title overlay on backdrop */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                                            <div className="text-white">
                                                <DialogTitle className="text-2xl font-bold mb-2">{data.title}</DialogTitle>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <SafeIcon icon={Calendar} className="h-4 w-4" size={16} />
                                                        <span>{releaseYear}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <SafeIcon icon={mediaTypeIcon} className="h-4 w-4" size={16} />
                                                        <span className="capitalize">{data.content_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fallback title if no backdrop */}
                                {!data.backdrop_path && (
                                    <div className="text-center space-y-2">
                                        <DialogTitle className="text-2xl font-bold">{data.title}</DialogTitle>
                                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <SafeIcon icon={Calendar} className="h-4 w-4" size={16} />
                                                <span>{releaseYear}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <SafeIcon icon={mediaTypeIcon} className="h-4 w-4" size={16} />
                                                <span className="capitalize">{data.content_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Description */}
                                <DialogDescription className="text-base leading-relaxed">
                                    <h3 className="font-semibold mb-2 text-foreground">Description</h3>
                                    <p className="text-muted-foreground">{data.description}</p>
                                </DialogDescription>

                                {/* Providers */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm">Available On</h3>
                                    <ProvidersBlock 
                                        tmdbId={data.tmdb_id} 
                                        tmdbType={data.tmdb_type} 
                                        userProviders={userProviders} 
                                        maxWidth="w-full"
                                        notStreamingValue={
                                            <div className="flex items-center justify-center p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                                                <span className="text-sm text-muted-foreground">
                                                    Not available for streaming
                                                </span>
                                            </div>
                                        }
                                    />
                                </div>

                                {/* Action Buttons in Dialog */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                    <AddWatchlistButton 
                                        media={media} 
                                        query={true}
                                        width="flex-1"
                                    />
                                    
                                    <Button asChild variant="outline" className="flex-1">
                                        <Link href={`/${data.tmdb_type}/${data.tmdb_id}`}>
                                            <SafeIcon icon={Info} className="h-4 w-4 mr-2" size={16} />
                                            More Info
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default NewSearchCard;