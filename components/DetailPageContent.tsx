'use client'
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProvidersBlock from '@/components/ProvidersBlock';
import RatingComponent from '@/components/RatingComponent';
import WatchStatusComponent from './WatchStatusComponent';
import SafeIcon from '@/components/SafeIcon';
import { useUser } from '@/hooks/User';
import { WatchStatus } from '@/types/customTypes'
import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/appwrite';
import { toast } from 'sonner';
import { 
    Calendar, 
    Clock, 
    Star, 
    Globe,
    TrendingUp,
    Play,
    Info,
    DollarSign,
    Film,
    Tv,
    MapPin,
    Building,
    Languages,
    Zap,
    Heart,
    Share2,
    Bookmark
} from "lucide-react";

function StatCard({ icon: Icon, label, value, className = "" }: { 
    icon: any, 
    label: string, 
    value: string | number, 
    className?: string 
}) {
    return (
        <Card className={`bg-background/80 backdrop-blur-sm border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 ${className}`}>
            <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <SafeIcon icon={Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
                    <p className="font-semibold text-sm sm:text-base truncate">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function CastCard({ member }: { member: any }) {
    if (!member.profile_path) {
        return (
            <Card className="w-20 sm:w-32 transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0">
                <CardContent className="p-0">
                    <div className="w-full h-24 sm:h-48 bg-muted/50 flex items-center justify-center rounded-t-lg">
                        <span className="text-muted-foreground text-xs">No Image</span>
                    </div>
                    <div className="p-2 sm:p-3">
                        <p className="font-medium text-xs sm:text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-20 sm:w-32 group transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0">
            <CardContent className="p-0">
                <div className="relative">
                    <Image
                        src={`https://image.tmdb.org/t/p/w300${member.profile_path}`}
                        alt={member.name}
                        width={128}
                        height={192}
                        className="w-full h-24 sm:h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg" />
                </div>
                <div className="p-2 sm:p-3">
                    <p className="font-medium text-xs sm:text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                </div>
            </CardContent>
        </Card>
    );
}

interface EnhancedDetailPageContentProps {
    data: any;
    tmdbType: 'movie' | 'tv';
    releaseDate: string;
    runtime: number;
}

export default function EnhancedDetailPageContent({ 
    data, 
    tmdbType, 
    releaseDate, 
    runtime 
}: EnhancedDetailPageContentProps) {
    const { user, setUser } = useUser();
    const isMovie = tmdbType === 'movie';
    const [watchlistItem, setWatchlistItem] = useState<any>(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if item is in user's watchlist
    useEffect(() => {
        if (user?.watchlist?.documents) {
            const item = user.watchlist.documents.find(
                (doc: any) => doc.tmdb_id.toString() === data.id.toString() && doc.tmdb_type === tmdbType
            );
            setWatchlistItem(item);
            setIsInWatchlist(!!item);
        }
    }, [user, data.id, tmdbType]);

    // Function to refresh user data
    const refreshUserData = useCallback(async () => {
        if (!user) return;
        
        try {
            const updatedWatchlist = await database.listDocuments(
                'watchlist', 
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!
            );
            
            setUser(prevUser => prevUser ? {
                ...prevUser,
                watchlist: updatedWatchlist,
            } : null);
            
            // Update local watchlist item
            const updatedItem = updatedWatchlist.documents.find(
                (doc: any) => doc.tmdb_id.toString() === data.id.toString() && doc.tmdb_type === tmdbType
            );
            setWatchlistItem(updatedItem);
            
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    }, [user, data.id, tmdbType, setUser]);

    const handleRatingUpdate = async (rating: number, review?: string) => {
        if (!watchlistItem || isLoading) return;
        
        setIsLoading(true);
        
        try {
            await database.updateDocument(
                'watchlist',
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
                watchlistItem.$id,
                {
                    user_rating: rating || null,
                    user_review: review || null,
                    ...(rating > 0 && { date_watched: new Date().toISOString() })
                }
            );

            // Update local state immediately for better UX
            setWatchlistItem((prev: any) => prev ? {
                ...prev,
                user_rating: rating,
                user_review: review,
                ...(rating > 0 && { date_watched: new Date().toISOString() })
            } : null);

            // Refresh user data to sync with backend
            await refreshUserData();
            
            toast.success(`Rating ${rating > 0 ? 'updated' : 'removed'} successfully!`);
            
        } catch (error) {
            console.error('Error updating rating:', error);
            toast.error('Failed to save rating');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (status: WatchStatus) => {
        if (!watchlistItem || isLoading) return;
        
        setIsLoading(true);
        
        try {
            const updateData: any = {
                watch_status: status
            };

            // If marking as completed, set date_watched
            if (status === WatchStatus.COMPLETED) {
                updateData.date_watched = new Date().toISOString();
            }

            await database.updateDocument(
                'watchlist',
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
                watchlistItem.$id,
                updateData
            );

            // Update local state immediately for better UX
            setWatchlistItem((prev: any) => prev ? {
                ...prev,
                watch_status: status,
                ...updateData
            } : null);

            // Refresh user data to sync with backend
            await refreshUserData();
            
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
            <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-3 lg:gap-12 lg:space-y-0">
                {/* Primary Content */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Overview */}
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Overview</h2>
                        <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                            {data.overview}
                        </p>
                    </section>

                    {/* Stats Grid */}
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Quick Facts</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {runtime > 0 && (
                                <StatCard
                                    icon={Clock}
                                    label="Runtime"
                                    value={`${runtime} min`}
                                />
                            )}
                            
                            <StatCard
                                icon={Calendar}
                                label={isMovie ? "Release Date" : "First Air Date"}
                                value={new Date(releaseDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            />
                            
                            <StatCard
                                icon={Star}
                                label="TMDB Rating"
                                value={`${data.vote_average.toFixed(1)}/10`}
                                className="col-span-2 sm:col-span-1"
                            />
                            
                            {isMovie && data.budget > 0 && (
                                <StatCard
                                    icon={DollarSign}
                                    label="Budget"
                                    value={`$${(data.budget / 1000000).toFixed(0)}M`}
                                />
                            )}
                            
                            {isMovie && data.revenue > 0 && (
                                <StatCard
                                    icon={TrendingUp}
                                    label="Revenue"
                                    value={`$${(data.revenue / 1000000).toFixed(0)}M`}
                                />
                            )}
                            
                            {!isMovie && (
                                <>
                                    <StatCard
                                        icon={Tv}
                                        label="Seasons"
                                        value={data.number_of_seasons}
                                    />
                                    <StatCard
                                        icon={Film}
                                        label="Episodes"
                                        value={data.number_of_episodes}
                                    />
                                </>
                            )}
                        </div>
                    </section>

                    {/* User Rating & Status - Only show if item is in watchlist */}
                    {isInWatchlist && watchlistItem && user && (
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Experience</h2>
                            <div className="grid gap-6 lg:grid-cols-2">
                                <WatchStatusComponent
                                    currentStatus={watchlistItem.watch_status || WatchStatus.WANT_TO_WATCH}
                                    documentId={watchlistItem.$id}
                                    mediaTitle={data.title || data.name}
                                    mediaType={tmdbType}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                                
                                <RatingComponent
                                    currentRating={watchlistItem.user_rating || 0}
                                    currentReview={watchlistItem.user_review || ''}
                                    documentId={watchlistItem.$id}
                                    mediaTitle={data.title || data.name}
                                    onRatingUpdate={handleRatingUpdate}
                                />
                            </div>
                        </section>
                    )}

                    {/* Tabs for Additional Content */}
                    <section>
                        <Tabs defaultValue="cast" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-auto">
                                <TabsTrigger value="cast" className="text-xs sm:text-sm py-2 sm:py-2.5">Cast & Crew</TabsTrigger>
                                <TabsTrigger value="details" className="text-xs sm:text-sm py-2 sm:py-2.5">Details</TabsTrigger>
                                <TabsTrigger value="media" className="text-xs sm:text-sm py-2 sm:py-2.5">Media</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="cast" className="mt-4 sm:mt-6">
                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg sm:text-xl font-semibold">Cast</h3>
                                    <ScrollArea className="w-full">
                                        <div className="flex gap-2 sm:gap-4 pb-4">
                                            {data.credits.cast?.slice(0, 12).map((member: any) => (
                                                <CastCard key={member.id} member={member} />
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="details" className="mt-4 sm:mt-6">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg sm:text-xl font-semibold">Production</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <SafeIcon icon={Languages} className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" size={20} />
                                                <div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">Original Language</p>
                                                    <p className="font-medium text-sm sm:text-base">{data.original_language.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <SafeIcon icon={Zap} className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" size={20} />
                                                <div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                                                    <p className="font-medium text-sm sm:text-base">{data.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {data.production_companies && data.production_companies.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg sm:text-xl font-semibold">Production Companies</h3>
                                            <div className="space-y-2">
                                                {data.production_companies.slice(0, 5).map((company: any) => (
                                                    <div key={company.id} className="flex items-center gap-3">
                                                        <SafeIcon icon={Building} className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" size={16} />
                                                        <span className="text-xs sm:text-sm">{company.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="media" className="mt-4 sm:mt-6">
                                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                                    <SafeIcon icon={Film} className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" size={48} />
                                    <p className="text-sm sm:text-base">Media gallery coming soon...</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Action Buttons */}
                    {isInWatchlist && (
                        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                    <SafeIcon icon={Heart} className="h-4 w-4 sm:h-5 sm:w-5" size={20} />
                                    Quick Actions
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                                        <SafeIcon icon={Heart} className="h-3 w-3 sm:h-4 sm:w-4 mr-2" size={16} />
                                        Add to Favorites
                                    </Button>
                                    
                                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                                        <SafeIcon icon={Share2} className="h-3 w-3 sm:h-4 sm:w-4 mr-2" size={16} />
                                        Share
                                    </Button>
                                    
                                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                                        <SafeIcon icon={Bookmark} className="h-3 w-3 sm:h-4 sm:w-4 mr-2" size={16} />
                                        Add to Collection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Streaming Providers */}
                    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                        <CardContent className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                <SafeIcon icon={Play} className="h-4 w-4 sm:h-5 sm:w-5" size={20} />
                                Streaming on
                            </h3>
                            <ProvidersBlock
                                tmdbId={data.id}
                                tmdbType={tmdbType}
                                userProviders
                                maxWidth="w-full"
                                iconSize={28}
                            />
                        </CardContent>
                    </Card>

                    {/* External Links */}
                    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                        <CardContent className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                <SafeIcon icon={Globe} className="h-4 w-4 sm:h-5 sm:w-5" size={20} />
                                External Links
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10" asChild>
                                    <Link
                                        href={`https://www.imdb.com/title/${data.imdb_id || data.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <SafeIcon icon={Info} className="h-3 w-3 sm:h-4 sm:w-4 mr-2" size={16} />
                                        View on IMDB
                                    </Link>
                                </Button>
                                
                                {data.homepage && (
                                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10" asChild>
                                        <Link
                                            href={data.homepage}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <SafeIcon icon={Globe} className="h-3 w-3 sm:h-4 sm:w-4 mr-2" size={16} />
                                            Official Website
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    {data.production_countries && data.production_countries.length > 0 && (
                        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                    <SafeIcon icon={MapPin} className="h-4 w-4 sm:h-5 sm:w-5" size={20} />
                                    Production Countries
                                </h3>
                                <div className="space-y-2">
                                    {data.production_countries.slice(0, 5).map((country: any) => (
                                        <div key={country.iso_3166_1} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">{country.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}