'use client'
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AddWatchlistButton from '@/components/buttons/AddWatchlistButton';
import BackButton from '@/components/buttons/BackButton';
import SafeIcon from '@/components/SafeIcon';
import { WatchlistDocumentCreate } from "@/types/appwrite";
import { 
    Star, 
    TrendingUp,
    Play,
    Bookmark,
    Share2,
    Film,
    Tv
} from "lucide-react";
import ProvidersBlock from './ProvidersBlock';

interface HeroSectionProps {
    data: any;
    title: string;
    releaseDate: string;
    tmdbType: 'movie' | 'tv';
    addButtonData: WatchlistDocumentCreate;
}

function RatingDisplay({ rating, voteCount }: { rating: number; voteCount: number }) {
    const stars = Math.round(rating / 2);
    
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <SafeIcon
                        key={i}
                        icon={Star}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
                        size={12}
                    />
                ))}
            </div>
            <span className="font-semibold text-white text-sm sm:text-base">{rating.toFixed(1)}</span>
            <span className="text-xs sm:text-sm text-white/80">({voteCount.toLocaleString()} votes)</span>
        </div>
    );
}

function GenreTags({ genres }: { genres: { id: number; name: string }[] }) {
    return (
        <div className="flex flex-wrap gap-1 sm:gap-2">
            {genres.slice(0, 3).map((genre) => (
                <Badge 
                    key={genre.id} 
                    variant="secondary" 
                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs px-2 py-1"
                >
                    {genre.name}
                </Badge>
            ))}
            {genres.length > 3 && (
                <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary text-xs px-2 py-1"
                >
                    +{genres.length - 3}
                </Badge>
            )}
        </div>
    );
}

export default function DetailPageHero({ 
    data, 
    title, 
    releaseDate, 
    tmdbType, 
    addButtonData 
}: HeroSectionProps) {
    return (
        <>
            {/* Mobile Layout */}
            <div className="sm:hidden relative min-h-screen">
                {/* Full Screen Backdrop */}
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/w1280${data.backdrop_path}`}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                </div>

                {/* Mobile Content */}
                <div className="relative z-10 min-h-screen flex flex-col">
                    {/* Header */}
                    <div className="p-4">
                        <BackButton />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col justify-end p-4 space-y-4">
                        {/* Poster and Title Section */}
                        <div className="flex gap-4 items-end">
                            {/* Compact Poster */}
                            <div className="flex-shrink-0">
                                <Card className="overflow-hidden shadow-lg w-24 h-36">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w300${data.poster_path}`}
                                        alt={title}
                                        width={96}
                                        height={144}
                                        className="w-full h-full object-cover"
                                        priority
                                    />
                                </Card>
                            </div>

                            {/* Title and Basic Info */}
                            <div className="flex-1 text-white space-y-2">
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                    <SafeIcon 
                                        icon={tmdbType === 'movie' ? Film : Tv} 
                                        className="h-3 w-3" 
                                        size={12} 
                                    />
                                    <span className="uppercase tracking-wide">{tmdbType}</span>
                                    {releaseDate && (
                                        <>
                                            <span>•</span>
                                            <span>{new Date(releaseDate).getFullYear()}</span>
                                        </>
                                    )}
                                </div>
                                
                                <h1 className="text-2xl font-bold leading-tight">
                                    {title}
                                </h1>
                                
                                {data.vote_average > 0 && (
                                    <RatingDisplay rating={data.vote_average} voteCount={data.vote_count} />
                                )}
                            </div>
                        </div>

                        {/* Genres */}
                        <GenreTags genres={data.genres} />

                        {/* Tagline */}
                        {data.tagline && (
                            <p className="text-white/90 italic text-sm">{data.tagline}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* Primary Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* <Button size="default" className="bg-primary hover:bg-primary/90 text-sm">
                                    <SafeIcon icon={Play} className="h-4 w-4 mr-1" size={16} />
                                    Watch
                                </Button> */}
                                
                                <AddWatchlistButton 
                                    media={addButtonData} 
                                    width="w-full"
                                />
                            </div>
                            
                            {/* Secondary Actions */}
                            {/* <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" size="default" className="bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30 text-sm">
                                    <SafeIcon icon={Bookmark} className="h-4 w-4 mr-1" size={16} />
                                    Save
                                </Button>
                                
                                <Button variant="outline" size="default" className="bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30 text-sm">
                                    <SafeIcon icon={Share2} className="h-4 w-4 mr-1" size={16} />
                                    Share
                                </Button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Hidden on Mobile */}
            <div className="hidden sm:block relative h-[70vh] min-h-[600px] overflow-hidden">
                {/* Backdrop Image */}
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${data.backdrop_path}`}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
                </div>

                {/* Content Overlay */}
                <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="absolute top-6">
                        <BackButton />
                    </div>
                    
                    <div className="flex items-end h-full pb-12">
                        <div className="flex flex-col lg:flex-row gap-8 w-full">
                            {/* Floating Poster */}
                            <div className="flex-shrink-0">
                                <Card className="overflow-hidden shadow-2xl border-2 border-background/20 w-64 lg:w-80 transition-transform duration-300 hover:scale-105">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`}
                                        alt={title}
                                        width={320}
                                        height={480}
                                        className="w-full h-auto"
                                        priority
                                    />
                                </Card>
                            </div>

                            {/* Title and Main Info */}
                            <div className="flex-1 space-y-6 text-white">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <SafeIcon 
                                            icon={tmdbType === 'movie' ? Film : Tv} 
                                            className="h-4 w-4" 
                                            size={16} 
                                        />
                                        <span className="uppercase tracking-wide">{tmdbType}</span>
                                        {releaseDate && (
                                            <>
                                                <span>•</span>
                                                <span>{new Date(releaseDate).getFullYear()}</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-shadow-lg">
                                        {title}
                                    </h1>
                                    
                                    {data.tagline && (
                                        <p className="text-xl text-white/90 italic">{data.tagline}</p>
                                    )}
                                </div>

                                {/* Rating and Stats */}
                                {data.vote_average > 0 && (
                                    <div className="flex items-center gap-6">
                                        <RatingDisplay rating={data.vote_average} voteCount={data.vote_count} />
                                        <div className="flex items-center gap-1">
                                            <SafeIcon icon={TrendingUp} className="h-4 w-4 text-green-400" size={16} />
                                            <span className="text-sm">Popular</span>
                                        </div>
                                    </div>
                                )}

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {data.genres.slice(0, 5).map((genre: any) => (
                                        <Badge 
                                            key={genre.id} 
                                            variant="secondary" 
                                            className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                        >
                                            {genre.name}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="bg-card/20 backdrop-blur-sm border-white/20 text-white">
                                        <ProvidersBlock
                                tmdbId={data.id}
                                tmdbType={tmdbType}
                                userProviders
                                maxWidth="w-full"
                                iconSize={28}
                            />
                                    </div>
                                    
                                    <AddWatchlistButton 
                                        media={addButtonData} 
                                        width="min-w-[120px]"
                                    />
                                    
                                    <Button variant="outline" size="lg" className="bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30 transition-transform hover:scale-105 active:scale-95">
                                        <SafeIcon icon={Bookmark} className="h-5 w-5 mr-2" size={20} />
                                        Save
                                    </Button>
                                    
                                    <Button variant="outline" size="lg" className="bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30 transition-transform hover:scale-105 active:scale-95">
                                        <SafeIcon icon={Share2} className="h-5 w-5 mr-2" size={20} />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}