'use client'
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageShell from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/loading-states";
import NewSearchBar from "@/components/NewSearchBar";
import NewSearchCard from "@/components/NewSearchCard";
import GameSearchCard from "@/components/GameSearchCard";
import SafeIcon from "@/components/SafeIcon";
import { useUser } from "@/hooks/User";
import { tmdbFetchOptions } from "@/lib/tmdb";
import { TMDBMultiSearchResult } from "@/types/tmdbApi";
import { IGDBGame } from "@/types/game";
import { SearchIcon, Film, Gamepad2, Loader2 } from "lucide-react";

const GAMES_PAGE_SIZE = 20;

type MediaPage = {
    page: number;
    total_pages: number;
    total_results: number;
    results: TMDBMultiSearchResult[];
};

const SkeletonGrid = ({ count = 10 }: { count?: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" role="status" aria-label="Loading results">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        ))}
    </div>
);

const SearchPageContent = () => {
    const router = useRouter();
    const params = useSearchParams();
    const { user } = useUser();

    const q = (params.get('q') ?? '').trim();
    const type: 'media' | 'games' = params.get('type') === 'games' ? 'games' : 'media';
    const canSearch = q.length >= 2;

    const setType = useCallback((nextType: string) => {
        router.replace(`/search?q=${encodeURIComponent(q)}&type=${nextType}`);
    }, [router, q]);

    const mediaSearch = useInfiniteQuery({
        queryKey: ['search', 'media', 'infinite', q],
        enabled: canSearch && type === 'media',
        staleTime: 5 * 60 * 1000,
        initialPageParam: 1,
        queryFn: async ({ pageParam }): Promise<MediaPage> => {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(q)}&page=${pageParam}`,
                tmdbFetchOptions
            );
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const data = await response.json();
            return {
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
                results: (data.results || []).filter(
                    (result: TMDBMultiSearchResult) => result.media_type !== 'person'
                ),
            };
        },
        getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
    });

    const gameSearch = useInfiniteQuery({
        queryKey: ['search', 'games', 'infinite', q],
        enabled: canSearch && type === 'games',
        staleTime: 5 * 60 * 1000,
        initialPageParam: 0,
        queryFn: async ({ pageParam }): Promise<IGDBGame[]> => {
            const response = await fetch(
                `/api/games/search?query=${encodeURIComponent(q)}&limit=${GAMES_PAGE_SIZE}&offset=${pageParam}`
            );
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Search failed: ${response.status}`);
            }
            const data = await response.json();
            return data.results || [];
        },
        // IGDB has no total count in this response shape: a full page means there may be more.
        getNextPageParam: (last, all) => last.length === GAMES_PAGE_SIZE ? all.length * GAMES_PAGE_SIZE : undefined,
    });

    const activeSearch = type === 'media' ? mediaSearch : gameSearch;
    const mediaResults = mediaSearch.data?.pages.flatMap(page => page.results) ?? [];
    const gameResults = (gameSearch.data?.pages.flat() ?? []) as IGDBGame[];
    const hasResults = type === 'media' ? mediaResults.length > 0 : gameResults.length > 0;
    const totalLabel = type === 'media' && mediaSearch.data
        ? ` (${mediaSearch.data.pages[0].total_results} found)`
        : '';

    return (
        <PageShell className="space-y-6">
            {/* Mobile has no header search bar — this page is its search input.
                relative: the bar's results panel anchors to this wrapper. */}
            <div className="md:hidden relative">
                <NewSearchBar />
            </div>

            <PageHeader
                title={canSearch ? `Results for "${q}"${totalLabel}` : 'Search'}
                icon={SearchIcon}
            />

            <Tabs value={type} className="w-full sm:w-80">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="media" onClick={() => setType('media')}>
                        <SafeIcon icon={Film} className="h-4 w-4 mr-1.5" size={16} />
                        Movies & TV
                    </TabsTrigger>
                    <TabsTrigger value="games" onClick={() => setType('games')}>
                        <SafeIcon icon={Gamepad2} className="h-4 w-4 mr-1.5" size={16} />
                        Games
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {!canSearch && (
                <p className="text-muted-foreground">
                    Type at least two characters in the search bar above to find movies, TV shows, and games.
                </p>
            )}

            {canSearch && activeSearch.isLoading && <SkeletonGrid />}

            {canSearch && activeSearch.isError && (
                <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-destructive/30 bg-destructive/5">
                    <p className="text-destructive font-medium">
                        {activeSearch.error instanceof Error ? activeSearch.error.message : 'Search failed. Please try again.'}
                    </p>
                    <Button variant="outline" onClick={() => activeSearch.refetch()}>Try Again</Button>
                </Card>
            )}

            {canSearch && !activeSearch.isLoading && !activeSearch.isError && !hasResults && (
                <EmptyState
                    icon={SearchIcon}
                    title={`No ${type === 'media' ? 'movies or shows' : 'games'} found for "${q}"`}
                    description="Try searching with different keywords."
                />
            )}

            {hasResults && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {type === 'media'
                            ? mediaResults.map((result) => (
                                // search/multi can repeat ids across media types, so key on both
                                <NewSearchCard
                                    key={`${result.media_type}-${result.id}`}
                                    media={result}
                                    userProviders={user?.providers}
                                />
                            ))
                            : gameResults.map((game) => (
                                <GameSearchCard key={game.id} game={game} />
                            ))
                        }
                    </div>

                    <div className="flex justify-center py-4">
                        {activeSearch.hasNextPage ? (
                            <Button
                                size="lg"
                                variant="outline"
                                disabled={activeSearch.isFetchingNextPage}
                                onClick={() => activeSearch.fetchNextPage()}
                            >
                                {activeSearch.isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )}
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">End of results</p>
                        )}
                    </div>
                </>
            )}
        </PageShell>
    );
};

export default SearchPageContent;
