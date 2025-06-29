'use client'
import { ProvidersApiCall, StreamingInfo, tmdbFetchOptions } from '@/lib/tmdb';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from '@/hooks/User';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Badge } from './ui/badge';
import SafeIcon from './SafeIcon';
import { ExternalLink, Sparkles, Play, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ProvidersBlockProps {
    tmdbId: number;
    tmdbType: string;
    country?: string;
    userProviders?: number[] | boolean;
    maxWidth?: string;
    iconSize?: number;
    notStreamingValue?: React.ReactNode;
}

const ProvidersBlock = ({
    tmdbId,
    tmdbType,
    country = 'US',
    userProviders,
    maxWidth = 'w-full max-w-48',
    iconSize = 24,
    notStreamingValue
}: ProvidersBlockProps) => {
    const [data, setData] = useState<ProvidersApiCall | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [inPlex, setInPlex] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useUser();

    if (userProviders === true) {
        userProviders = user?.providers || [];
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId.toString()}/watch/providers`;
                const response = await fetch(url, tmdbFetchOptions);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch providers: ${response.status}`);
                }
                
                const result = await response.json();
                setData(result);

                // Check Plex availability
                if (user?.labels?.includes('plex')) {
                    const plex_collection_id = process.env.NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID;
                    const plex_db = await database.listDocuments('watchlist', plex_collection_id!, [
                        Query.equal('tmdb_id', tmdbId.toString())
                    ]);

                    const plex_ids = plex_db.documents.map(doc => doc.tmdb_id);
                    setInPlex(plex_ids.includes(tmdbId.toString()));
                }
            } catch (error) {
                console.error('Error fetching providers:', error);
                setError(error instanceof Error ? error.message : 'Failed to load providers');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tmdbId, tmdbType, user?.labels]);

    const NotStreamingComponent = () => {
        if (notStreamingValue) {
            return <>{notStreamingValue}</>;
        }
        
        return (
            <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
                <CardContent className="flex items-center justify-center p-3">
                    <span className="text-xs text-muted-foreground font-medium">Not available for streaming</span>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className={`${maxWidth} animate-pulse`}>
                <Card className="border border-border/50">
                    <CardContent className="flex gap-2 justify-center items-center p-3">
                        <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin text-muted-foreground" size={16} />
                        <span className="text-xs text-muted-foreground">Loading providers...</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${maxWidth}`}>
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex items-center justify-center p-3">
                        <span className="text-xs text-destructive">Failed to load providers</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data && !inPlex) {
        return <NotStreamingComponent />;
    }

    if (data?.results[country] === undefined && !inPlex) {
        return <NotStreamingComponent />;
    }

    if (!data?.results[country]?.flatrate && !inPlex) {
        return <NotStreamingComponent />;
    }

    let availableProviders: StreamingInfo[] = data?.results[country]?.flatrate || [];

    // Filter by user's providers if specified
    if (userProviders && Array.isArray(userProviders) && userProviders.length > 0) {
        availableProviders = availableProviders.filter((provider: StreamingInfo) =>
            userProviders.includes(provider.provider_id)
        );
    }

    // Add Plex if available
    if (inPlex) {
        const plexProvider: StreamingInfo = {
            logo_path: '/logos/plex-logo.svg',
            provider_id: 999,
            provider_name: 'Plex',
            display_priority: 1
        };
        availableProviders = [plexProvider, ...availableProviders];
    }

    // If no providers available after filtering
    if (availableProviders.length === 0) {
        return <NotStreamingComponent />;
    }

    const displayedProviders = availableProviders.slice(0, 4);
    const remainingCount = availableProviders.length - displayedProviders.length;

    return (
        <div className={`${maxWidth} m-auto`}>
            <Popover>
                <PopoverTrigger asChild>
                    <Card className={`
                        transition-all duration-300 cursor-pointer group
                        hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 
                        border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10
                        hover:from-primary/10 hover:to-primary/20
                    `}>
                        <CardContent className="p-3">
                            <div className="flex items-center justify-center gap-2">
                                {displayedProviders.map((provider: StreamingInfo, index: number) => {
                                    const isPlexProvider = provider.provider_name === 'Plex';
                                    const imageSrc = isPlexProvider 
                                        ? provider.logo_path 
                                        : `https://image.tmdb.org/t/p/w500${provider.logo_path}`;

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                relative transition-transform duration-200 
                                                group-hover:scale-110 group-hover:-translate-y-1
                                                ${isPlexProvider ? 'ring-2 ring-amber-400/50 rounded-md' : ''}
                                            `}
                                            style={{ 
                                                animationDelay: `${index * 50}ms`,
                                                zIndex: displayedProviders.length - index 
                                            }}
                                        >
                                            <Image
                                                src={imageSrc}
                                                alt={provider.provider_name}
                                                width={iconSize}
                                                height={iconSize}
                                                className={`
                                                    rounded transition-all duration-200
                                                    ${isPlexProvider ? 'ring-1 ring-amber-400/30' : ''}
                                                `}
                                            />
                                            {isPlexProvider && (
                                                <div className="absolute -top-1 -right-1">
                                                    <SafeIcon
                                                        icon={Sparkles}
                                                        className="h-3 w-3 text-amber-400 fill-current"
                                                        size={12}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {remainingCount > 0 && (
                                    <Badge 
                                        variant="secondary" 
                                        className="
                                            text-xs bg-muted/80 hover:bg-muted 
                                            transition-colors duration-200
                                            group-hover:scale-110
                                        "
                                    >
                                        +{remainingCount}
                                    </Badge>
                                )}

                                <SafeIcon
                                    icon={ExternalLink}
                                    className="h-3 w-3 text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    size={12}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </PopoverTrigger>

                <PopoverContent
                    side="top"
                    sideOffset={10}
                    className="w-80 p-0 bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl"
                >
                    <Card className="border-none shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-base">
                                <div className="flex items-center gap-2">
                                    <SafeIcon icon={Play} className="h-4 w-4 text-primary" size={16} />
                                    <span>Available on these platforms</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setIsPopoverOpen(false)}
                                >
                                    <SafeIcon icon={ExternalLink} className="h-3 w-3" size={12} />
                                </Button>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Click any logo to visit their website
                            </p>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {availableProviders.map((provider: StreamingInfo, index: number) => {
                                    const isPlexProvider = provider.provider_name === 'Plex';
                                    const imageSrc = isPlexProvider 
                                        ? provider.logo_path 
                                        : `https://image.tmdb.org/t/p/w500${provider.logo_path}`;

                                    return (
                                        <TooltipProvider key={index}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Card className={`
                                                        transition-all duration-200 cursor-pointer
                                                        group flex items-center justify-center
                                                        hover:shadow-lg hover:-translate-y-1
                                                        ${isPlexProvider ? 'bg-amber-50/10 border-amber-400/30 hover:bg-amber-50/20' : 'hover:border-primary/50 hover:bg-primary/5'}
                                                    `}>
                                                        <CardContent className="p-3">
                                                            <div className="relative">
                                                                <Image
                                                                    src={imageSrc}
                                                                    alt={provider.provider_name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="rounded transition-transform duration-200 group-hover:scale-110"
                                                                />
                                                                {isPlexProvider && (
                                                                    <div className="absolute -top-1 -right-1">
                                                                        <SafeIcon
                                                                            icon={Sparkles}
                                                                            className="h-4 w-4 text-amber-400 fill-current"
                                                                            size={16}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-center">
                                                        <p className="font-medium">{provider.provider_name}</p>
                                                        {isPlexProvider && (
                                                            <p className="text-xs text-muted-foreground">Available in your Plex library</p>
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>

                            <div className="text-center pt-3 border-t border-border/30">
                                <p className="text-xs text-muted-foreground">
                                    Streaming data provided by{' '}
                                    <a 
                                        href="https://www.justwatch.com/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        JustWatch
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ProvidersBlock;