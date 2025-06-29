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
import { ExternalLink, Sparkles } from 'lucide-react';

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
            <div className="flex items-center justify-center p-3 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20">
                <span className="text-xs text-muted-foreground">N/A</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`${maxWidth} animate-pulse`}>
                <div className="flex gap-2 justify-center items-center bg-muted/50 p-3 rounded-lg">
                    <div className="h-6 w-6 bg-muted rounded" />
                    <div className="h-6 w-6 bg-muted rounded" />
                    <div className="h-6 w-6 bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${maxWidth}`}>
                <div className="flex items-center justify-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <span className="text-xs text-destructive">Failed to load</span>
                </div>
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
                    <div className="
                        flex items-center justify-center gap-2 p-3 
                        bg-gradient-to-r from-primary/5 to-primary/10 
                        hover:from-primary/10 hover:to-primary/20
                        rounded-lg border border-primary/20 
                        cursor-pointer transition-all duration-200 
                        hover:shadow-lg hover:shadow-primary/10
                        group
                    ">
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
                </PopoverTrigger>

                <PopoverContent
                    side="top"
                    sideOffset={10}
                    className="w-80 p-4 bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl"
                >
                    <div className="space-y-4">
                        <div className="text-center">
                            <h4 className="font-semibold text-sm mb-1">
                                Available on these platforms
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Click any logo to visit their website
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {availableProviders.map((provider: StreamingInfo, index: number) => {
                                const isPlexProvider = provider.provider_name === 'Plex';
                                const imageSrc = isPlexProvider 
                                    ? provider.logo_path 
                                    : `https://image.tmdb.org/t/p/w500${provider.logo_path}`;

                                return (
                                    <TooltipProvider key={index}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={`
                                                    relative p-3 rounded-lg border border-border/50 
                                                    hover:border-primary/50 hover:bg-primary/5 
                                                    transition-all duration-200 cursor-pointer
                                                    group flex items-center justify-center
                                                    ${isPlexProvider ? 'bg-amber-50/10 border-amber-400/30' : ''}
                                                `}>
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
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-medium">{provider.provider_name}</p>
                                                {isPlexProvider && (
                                                    <p className="text-xs text-muted-foreground">Available in your Plex library</p>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>

                        <div className="text-center pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground">
                                Streaming data provided by{' '}
                                <a 
                                    href="https://www.justwatch.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    JustWatch
                                </a>
                            </p>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ProvidersBlock;