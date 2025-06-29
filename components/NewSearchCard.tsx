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
import { Info, Calendar, Film, Tv, Eye, Star, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"

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
        <div className="flex flex-col space-y-2 sm:space-y-3 group w-full">
            {/* Poster and Info */}
            <Card 
                className={`
                    relative transition-all duration-300 overflow-hidden
                    hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 sm:hover:-translate-y-2
                    border border-border/50 hover:border-primary/30
                    bg-card/50 backdrop-blur-sm hover:bg-card/80
                    ${isHovered ? 'ring-2 ring-primary/20' : ''}
                    w-full
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Media Type Badge */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
                    <Badge className="bg-background/90 backdrop-blur-sm text-foreground border border-border/50 text-xs">
                        <SafeIcon
                            icon={mediaTypeIcon}
                            className="h-2 w-2 sm:h-3 sm:w-3 mr-1"
                            size={10}
                        />
                        <span className="text-xs font-medium uppercase hidden sm:inline">
                            {data.content_type}
                        </span>
                        <span className="text-xs font-medium uppercase sm:hidden">
                            {data.content_type === 'movie' ? 'M' : 'TV'}
                        </span>
                    </Badge>
                </div>

                <CardContent className="p-0">
                    <div className="relative">
                        <ImageWithFallback
                            src={`https://image.tmdb.org/t/p/w500/${data.poster_path}`}
                            alt={data.title}
                            className="w-full h-40 sm:h-60 md:h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                            width={200}
                            height={300}
                        />

                        {/* Gradient overlay on hover (hidden on mobile) */}
                        <div className={`
                            absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                            transition-opacity duration-300 flex items-end p-2 sm:p-3
                            ${isHovered ? 'opacity-100' : 'opacity-0'}
                            hidden sm:flex
                        `}>
                            <div className="text-white space-y-1">
                                <h3 className="font-bold text-sm line-clamp-2">{data.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-white/80">
                                    <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
                                    <span>{releaseYear}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Title and Year for Mobile (shown below image) */}
            <div className="sm:hidden px-1 space-y-1">
                <h3 className="font-semibold text-xs line-clamp-2 leading-tight">{data.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
                    <span>{releaseYear}</span>
                </div>
            </div>

            {/* Providers */}
            <div className="px-1">
                <ProvidersBlock 
                    tmdbId={data.tmdb_id} 
                    tmdbType={data.tmdb_type} 
                    userProviders={userProviders} 
                    maxWidth="w-full"
                    iconSize={16}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1 sm:gap-2 px-1">
                <AddWatchlistButton 
                    media={media} 
                    query={true}
                    width="w-full"
                    variant="default"
                    size="sm"
                />
                
                <div className="flex gap-1 sm:gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                        <Link href={`/${data.tmdb_type}/${data.tmdb_id}`}>
                            <SafeIcon icon={Info} className="h-3 w-3 mr-1" size={12} />
                            <span className="hidden sm:inline">Details</span>
                            <span className="sm:hidden">Info</span>
                        </Link>
                    </Button>

                    {/* Quick View Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="px-2 sm:px-3 transition-all duration-200 hover:scale-105">
                                <SafeIcon icon={Eye} className="h-3 w-3" size={12} />
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
                            <Card className="border-none shadow-none">
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
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                                <div className="text-white space-y-2">
                                                    <DialogTitle className="text-2xl font-bold">{data.title}</DialogTitle>
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
                                        <div className="text-center space-y-3 py-6">
                                            <div className="flex justify-center">
                                                <div className="p-4 rounded-full bg-primary/10">
                                                    <SafeIcon icon={mediaTypeIcon} className="h-8 w-8 text-primary" size={32} />
                                                </div>
                                            </div>
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

                                <CardContent className="space-y-6 pt-6">
                                    {/* Description */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <SafeIcon icon={Info} className="h-5 w-5 text-primary" size={20} />
                                            Description
                                        </h3>
                                        <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                                            {data.description}
                                        </DialogDescription>
                                    </div>

                                    <Separator />

                                    {/* Providers */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <SafeIcon icon={Play} className="h-5 w-5 text-primary" size={20} />
                                            Available On
                                        </h3>
                                        <ProvidersBlock 
                                            tmdbId={data.tmdb_id} 
                                            tmdbType={data.tmdb_type} 
                                            userProviders={userProviders} 
                                            maxWidth="w-full"
                                        />
                                    </div>

                                    <Separator />

                                    {/* Action Buttons in Dialog */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                        <AddWatchlistButton 
                                            media={media} 
                                            query={true}
                                            width="flex-1"
                                            variant="default"
                                        />
                                        
                                        <Button asChild variant="outline" className="flex-1 transition-all duration-200 hover:scale-105">
                                            <Link href={`/${data.tmdb_type}/${data.tmdb_id}`}>
                                                <SafeIcon icon={Info} className="h-4 w-4 mr-2" size={16} />
                                                Full Details
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default NewSearchCard;