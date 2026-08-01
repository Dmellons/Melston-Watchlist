'use client'
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useQueries } from '@tanstack/react-query';
import { useUser } from '@/hooks/User';
import { WatchlistDocument } from '@/types/appwrite';
import { WatchStatus } from '@/types/customTypes';
import { StreamingInfo } from '@/lib/tmdb';
import { fetchProviders, providersQueryKey, ProvidersResult, PLEX_PROVIDER } from '@/lib/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SafeIcon from '@/components/SafeIcon';
import {
    Trophy,
    Loader2,
    Tv,
    CheckCircle2,
    CloudOff,
    ChevronDown,
    ChevronUp,
    BadgeCheck,
} from 'lucide-react';

const COUNTRY = 'US';

type InsightsMode = 'watchlist' | 'combined';

interface ProviderStats {
    provider: StreamingInfo;
    count: number;
    titles: string[];
}

interface StreamingInsightsProps {
    watchlist: WatchlistDocument[];
}

const isWatched = (item: WatchlistDocument) =>
    item.watched === true || item.watch_status === WatchStatus.COMPLETED;

const StreamingInsights = ({ watchlist }: StreamingInsightsProps) => {
    const { user } = useUser();
    const [mode, setMode] = useState<InsightsMode>('watchlist');
    const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

    const plexEnabled = !!user?.labels?.includes('plex');
    const subscribedIds = user?.providers || [];

    // Only movie/tv items have TMDB watch-provider data; dedupe repeated titles
    const mediaItems = useMemo(() => {
        const seen = new Set<string>();
        return watchlist.filter(item => {
            if (!item.tmdb_id || (item.tmdb_type !== 'movie' && item.tmdb_type !== 'tv')) {
                return false;
            }
            const key = `${item.tmdb_type}-${item.tmdb_id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [watchlist]);

    // Fetch availability for every item up front (both tabs share the same
    // queries, so switching modes is instant). Keys match ProvidersBlock, so
    // anything already viewed in the app is served from cache.
    const providerQueries = useQueries({
        queries: mediaItems.map(item => ({
            queryKey: providersQueryKey(item.tmdb_type, item.tmdb_id, plexEnabled),
            queryFn: () => fetchProviders(item.tmdb_type, item.tmdb_id, plexEnabled),
            staleTime: 1000 * 60 * 60, // 1 hour
        })),
    });

    const scopedItems = useMemo(
        () => (mode === 'watchlist' ? mediaItems.filter(item => !isWatched(item)) : mediaItems),
        [mode, mediaItems]
    );

    const loadedCount = providerQueries.filter(q => !q.isPending).length;
    const isLoading = loadedCount < mediaItems.length;

    const { ranked, streamableCount, notStreamableCount, analyzedCount } = useMemo(() => {
        const stats = new Map<number, ProviderStats>();
        let streamable = 0;
        let notStreamable = 0;
        let analyzed = 0;

        const scopedKeys = new Set(scopedItems.map(item => `${item.tmdb_type}-${item.tmdb_id}`));

        mediaItems.forEach((item, index) => {
            if (!scopedKeys.has(`${item.tmdb_type}-${item.tmdb_id}`)) return;

            const query = providerQueries[index];
            const result = query?.data as ProvidersResult | undefined;
            if (!result) return; // still loading or failed — excluded from counts

            analyzed++;

            const itemProviders: StreamingInfo[] = [
                ...(result.inPlex ? [PLEX_PROVIDER] : []),
                ...(result.data?.results?.[COUNTRY]?.flatrate || []),
            ];

            if (itemProviders.length === 0) {
                notStreamable++;
                return;
            }

            streamable++;
            const countedIds = new Set<number>();
            itemProviders.forEach(provider => {
                if (countedIds.has(provider.provider_id)) return;
                countedIds.add(provider.provider_id);

                const existing = stats.get(provider.provider_id);
                if (existing) {
                    existing.count++;
                    existing.titles.push(item.title);
                } else {
                    stats.set(provider.provider_id, {
                        provider,
                        count: 1,
                        titles: [item.title],
                    });
                }
            });
        });

        return {
            ranked: Array.from(stats.values()).sort(
                (a, b) => b.count - a.count || a.provider.provider_name.localeCompare(b.provider.provider_name)
            ),
            streamableCount: streamable,
            notStreamableCount: notStreamable,
            analyzedCount: analyzed,
        };
    }, [mediaItems, providerQueries, scopedItems]);

    const topProvider = ranked[0];

    if (mediaItems.length === 0) {
        return (
            <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
                <CardContent className="flex items-center justify-center p-8">
                    <span className="text-sm text-muted-foreground">
                        Add some movies or TV shows to your watchlist to see streaming insights.
                    </span>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-3xl space-y-4">
            <Tabs value={mode} onValueChange={(value) => setMode(value as InsightsMode)}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="watchlist">Watchlist Only</TabsTrigger>
                    <TabsTrigger value="combined">Watchlist + Watch History</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardContent className="p-4 text-center">
                        <SafeIcon icon={Tv} className="h-4 w-4 mx-auto mb-1 text-primary" size={16} />
                        <p className="text-2xl font-bold">{scopedItems.length}</p>
                        <p className="text-xs text-muted-foreground">
                            {mode === 'watchlist' ? 'Titles on watchlist' : 'Titles incl. history'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <SafeIcon icon={CheckCircle2} className="h-4 w-4 mx-auto mb-1 text-green-500" size={16} />
                        <p className="text-2xl font-bold">{streamableCount}</p>
                        <p className="text-xs text-muted-foreground">Streamable now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <SafeIcon icon={CloudOff} className="h-4 w-4 mx-auto mb-1 text-muted-foreground" size={16} />
                        <p className="text-2xl font-bold">{notStreamableCount}</p>
                        <p className="text-xs text-muted-foreground">Not streaming anywhere</p>
                    </CardContent>
                </Card>
            </div>

            {isLoading && (
                <Card className="border border-border/50">
                    <CardContent className="flex items-center justify-center gap-2 p-3">
                        <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin text-muted-foreground" size={16} />
                        <span className="text-xs text-muted-foreground">
                            Checking availability… {loadedCount} / {mediaItems.length} titles
                        </span>
                    </CardContent>
                </Card>
            )}

            {/* Winner callout */}
            {topProvider && (
                <Card className="border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="relative shrink-0">
                            <ProviderLogo provider={topProvider.provider} size={48} />
                            <div className="absolute -top-2 -right-2">
                                <SafeIcon icon={Trophy} className="h-5 w-5 text-amber-400 fill-current" size={20} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold">
                                {topProvider.provider.provider_name} has the most of your{' '}
                                {mode === 'watchlist' ? 'watchlist' : 'watchlist + history'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {topProvider.count} of {analyzedCount} titles
                                {analyzedCount > 0 && ` (${Math.round((topProvider.count / analyzedCount) * 100)}%)`}
                                {!isSubscribed(topProvider.provider, subscribedIds) && (
                                    <span className="text-amber-500"> — you&apos;re not subscribed</span>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ranked provider list */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">All Streaming Services</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Every service that carries at least one of your titles — not just the ones you subscribe to.
                        Click a service to see which titles it has.
                    </p>
                </CardHeader>
                <CardContent className="space-y-2">
                    {ranked.length === 0 && !isLoading && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            None of these titles are currently streaming on a subscription service.
                        </p>
                    )}
                    {ranked.map((entry, index) => {
                        const percent = analyzedCount > 0 ? (entry.count / analyzedCount) * 100 : 0;
                        const subscribed = isSubscribed(entry.provider, subscribedIds);
                        const isExpanded = expandedProvider === entry.provider.provider_id;

                        return (
                            <div
                                key={entry.provider.provider_id}
                                className={`
                                    rounded-lg border transition-colors cursor-pointer
                                    ${subscribed ? 'border-primary/30 bg-primary/5' : 'border-border/50'}
                                    hover:bg-muted/30
                                `}
                                onClick={() =>
                                    setExpandedProvider(isExpanded ? null : entry.provider.provider_id)
                                }
                            >
                                <div className="flex items-center gap-3 p-3">
                                    <span className="w-6 text-sm font-semibold text-muted-foreground text-right shrink-0">
                                        {index + 1}
                                    </span>
                                    <ProviderLogo provider={entry.provider} size={32} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">
                                                {entry.provider.provider_name}
                                            </span>
                                            {subscribed && (
                                                <Badge variant="secondary" className="text-xs shrink-0">
                                                    <SafeIcon icon={BadgeCheck} className="h-3 w-3 mr-1" size={12} />
                                                    Subscribed
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${subscribed ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                                                style={{ width: `${Math.max(percent, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold">{entry.count}</p>
                                        <p className="text-xs text-muted-foreground">{Math.round(percent)}%</p>
                                    </div>
                                    <SafeIcon
                                        icon={isExpanded ? ChevronUp : ChevronDown}
                                        className="h-4 w-4 text-muted-foreground shrink-0"
                                        size={16}
                                    />
                                </div>
                                {isExpanded && (
                                    <div className="flex flex-wrap gap-1.5 px-3 pb-3 pl-12">
                                        {entry.titles.map(title => (
                                            <Badge key={title} variant="outline" className="text-xs font-normal">
                                                {title}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
                Subscription (flatrate) streaming availability for the {COUNTRY} region, provided by{' '}
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
    );
};

const isSubscribed = (provider: StreamingInfo, subscribedIds: number[]) =>
    provider.provider_id === PLEX_PROVIDER.provider_id || subscribedIds.includes(provider.provider_id);

const ProviderLogo = ({ provider, size }: { provider: StreamingInfo; size: number }) => {
    const isPlex = provider.provider_id === PLEX_PROVIDER.provider_id;

    if (!provider.logo_path) {
        return (
            <div
                className="rounded shrink-0 bg-muted flex items-center justify-center font-semibold text-muted-foreground"
                style={{ width: size, height: size }}
            >
                {provider.provider_name.charAt(0)}
            </div>
        );
    }

    const src = isPlex ? provider.logo_path : `https://image.tmdb.org/t/p/w500${provider.logo_path}`;
    return (
        <Image
            src={src}
            alt={provider.provider_name}
            width={size}
            height={size}
            className={`rounded shrink-0 ${isPlex ? 'ring-1 ring-amber-400/30' : ''}`}
        />
    );
};

export default StreamingInsights;
