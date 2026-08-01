'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { Input } from "./ui/input"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { ScrollArea } from "./ui/scroll-area"
import NewSearchCard from "@/components/NewSearchCard"
import { useUser } from "@/hooks/User"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { useMediaQuery } from "@/hooks/MediaQuery"
import { SearchIcon, Loader2, X, Film, Gamepad2 } from "lucide-react"
import SafeIcon from "@/components/SafeIcon"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Skeleton } from "./ui/skeleton"
import GameSearchCard from "./GameSearchCard"
import { IGDBGame } from "@/types/game"

interface NewSearchBarProps {
    resultsLength?: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const NewSearchBar = ({ resultsLength = 10 }: NewSearchBarProps) => {
    const [query, setQuery] = useState<string>("");
    const [searchType, setSearchType] = useState<'media' | 'games'>('media');
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const { user } = useUser();
    const isDesktop = useMediaQuery("(min-width: 768px)", { defaultValue: false });
    const debouncedQuery = useDebounce(query, 300);

    // Handle hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const trimmedQuery = debouncedQuery.trim();
    const canSearch = isMounted && trimmedQuery.length >= 2;

    // Movies/TV search — cached & deduped, so re-running a recent search is instant.
    const mediaSearch = useQuery<TMDBMultiSearchResult[]>({
        queryKey: ['search', 'media', trimmedQuery, resultsLength],
        enabled: canSearch && searchType === 'media',
        staleTime: 5 * 60 * 1000, // 5 min — recent searches stay warm
        placeholderData: keepPreviousData, // refining a query keeps prior results visible
        queryFn: async () => {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(trimmedQuery)}`,
                tmdbFetchOptions
            );
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const data = await response.json();
            return (data.results || [])
                .filter((result: TMDBMultiSearchResult) => result.media_type !== 'person')
                .slice(0, resultsLength);
        },
    });

    // Games search — same caching behavior.
    const gameSearch = useQuery<IGDBGame[]>({
        queryKey: ['search', 'games', trimmedQuery, resultsLength],
        enabled: canSearch && searchType === 'games',
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const response = await fetch(
                `/api/games/search?query=${encodeURIComponent(trimmedQuery)}&limit=${resultsLength}`
            );
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Search failed: ${response.status}`);
            }
            const data = await response.json();
            return data.results || [];
        },
    });

    const results = mediaSearch.data ?? [];
    const gameResults = gameSearch.data ?? [];
    const activeSearch = searchType === 'media' ? mediaSearch : gameSearch;
    const loading = activeSearch.isFetching;
    const error = activeSearch.isError ? 'Search failed. Please try again.' : null;
    const refetchActive = () => activeSearch.refetch();

    // Keyboard navigation over the currently-visible result list.
    const activeList: Array<TMDBMultiSearchResult | IGDBGame> = searchType === 'media' ? results : gameResults;

    const hrefForResult = useCallback((item: TMDBMultiSearchResult | IGDBGame): string => {
        if (searchType === 'media') {
            const media = item as TMDBMultiSearchResult;
            return `/${media.media_type}/${media.id}`;
        }
        return `/game/${(item as IGDBGame).id}`;
    }, [searchType]);

    // Keep the highlighted result scrolled into view.
    useEffect(() => {
        if (activeIndex < 0) return;
        const el = document.querySelector(`[data-search-result="${activeIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    // Handle search type change — cached results for the same query show instantly.
    const handleSearchTypeChange = useCallback((type: 'media' | 'games') => {
        setSearchType(type);
        setActiveIndex(-1);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        setQuery("");
        setIsInputFocused(false);
    }, []);

    // Close on any click outside the bar/panel (the panel is a child of rootRef).
    useEffect(() => {
        if (!isPanelOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (rootRef.current?.contains(e.target as Node)) return;
            closePanel();
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [isPanelOpen, closePanel]);

    // Full results page for the current query + tab.
    const navigateToSearchPage = useCallback(() => {
        if (trimmedQuery.length < 2) return;
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}&type=${searchType}`);
        closePanel();
    }, [trimmedQuery, searchType, router, closePanel]);

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setActiveIndex(-1);

        if (value.length > 0 && !isPanelOpen) {
            setIsPanelOpen(true);
        }
    }, [isPanelOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            closePanel();
            inputRef.current?.blur();
            return;
        }
        if (e.key === " ") {
            e.stopPropagation();
        }

        // Enter with no highlighted result goes to the full results page.
        if (e.key === "Enter" && activeIndex < 0) {
            e.preventDefault();
            navigateToSearchPage();
            return;
        }

        const count = activeList.length;
        if (count === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIsPanelOpen(true);
            setActiveIndex(i => (i + 1) % count);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => (i <= 0 ? count - 1 : i - 1));
        } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < count) {
            e.preventDefault();
            router.push(hrefForResult(activeList[activeIndex]));
            closePanel();
        }
    }, [activeList, activeIndex, router, hrefForResult, navigateToSearchPage, closePanel]);

    // Handle clear search
    const handleClearSearch = useCallback(() => {
        setQuery("");
        setIsPanelOpen(false);
        inputRef.current?.focus();
    }, []);

    // Handle card click - close search
    const handleCardClick = useCallback(() => {
        closePanel();
    }, [closePanel]);

    // Show results condition
    const showResults = useMemo(() =>
        isMounted && isPanelOpen && (results.length > 0 || gameResults.length > 0 || loading || error) && query.length >= 2,
        [isMounted, isPanelOpen, results.length, gameResults.length, loading, error, query.length]
    );

    // Current results based on search type
    const hasResults = searchType === 'media' ? results.length > 0 : gameResults.length > 0;

    // Don't render anything until mounted to avoid hydration issues
    if (!isMounted) {
        return (
            <div className="flex flex-col gap-2 items-center w-full">
                <div className="w-full">
                    <div className="flex flex-col m-auto gap-1 sm:gap-2 sm:flex-row items-center w-full">
                        <div className="w-full">
                            <Input
                                placeholder="Movie or TV Show..."
                                className="bg-muted/90 text-muted-foreground h-10 rounded-lg p-3"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className="w-full">
            <div className="relative w-full group">
                            <Input
                                ref={inputRef}
                                aria-label="Search movies and TV shows"
                                placeholder={isDesktop ? "Search movies and TV shows..." : "Search..."}
                                value={query}
                                className={`
                                    bg-muted/90 backdrop-blur-sm text-foreground 
                                    transition-all duration-200 ease-in-out
                                    h-10 rounded-lg px-4 pr-10
                                    border border-transparent
                                    focus:bg-background/95 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10
                                    placeholder:text-muted-foreground/70
                                    ${isInputFocused ? 'ring-2 ring-primary/20' : ''}
                                `}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                autoComplete="off"
                            />
                            
                            {/* Loading spinner */}
                            {loading && (
                                <SafeIcon
                                    icon={Loader2}
                                    className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary"
                                    size={16}
                                />
                            )}
                            
                            {/* Clear button */}
                            {!loading && query && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Clear search"
                                    className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted/80 rounded-md"
                                    onClick={handleClearSearch}
                                >
                                    <SafeIcon
                                        icon={X}
                                        className="h-3 w-3 text-muted-foreground"
                                        size={12}
                                    />
                                </Button>
                            )}
            </div>

            {/* Results panel: absolutely positioned against the nearest positioned
                ancestor — the sticky header on desktop (full app-column width, right
                under the header) or the /search page's relative wrapper on mobile. */}
                {showResults && (
                    <div className="absolute inset-x-0 top-full z-40">
                            <Card className="bg-background/95 backdrop-blur-xl border-x-0 border-t-0 border-b border-border/50 rounded-none sm:rounded-b-xl sm:border-x shadow-2xl animate-in fade-in-0 slide-in-from-top-2 duration-200">
                                <CardContent className="p-3 sm:p-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className="flex items-center gap-2">
                                            <SafeIcon
                                                icon={SearchIcon}
                                                className="h-4 w-4 text-muted-foreground"
                                                size={16}
                                            />
                                            <span className="text-xs sm:text-sm text-muted-foreground" aria-live="polite">
                                                {loading ? 'Searching...' : `Results for "${query}"`}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Close search results"
                                            className="h-8 w-8 p-0"
                                            onClick={closePanel}
                                        >
                                            <SafeIcon icon={X} className="h-4 w-4" size={16} />
                                        </Button>
                                    </div>

                                    {/* Search Type Tabs */}
                                    <Tabs value={searchType} className="mb-4">
                                        <TabsList className="grid w-full grid-cols-2 h-9">
                                            <TabsTrigger
                                                value="media"
                                                onClick={() => handleSearchTypeChange('media')}
                                                className="text-xs sm:text-sm"
                                            >
                                                <SafeIcon icon={Film} className="h-3 w-3 mr-1.5" size={12} />
                                                Movies & TV
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="games"
                                                onClick={() => handleSearchTypeChange('games')}
                                                className="text-xs sm:text-sm"
                                            >
                                                <SafeIcon icon={Gamepad2} className="h-3 w-3 mr-1.5" size={12} />
                                                Games
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <ScrollArea className={`w-full ${isDesktop ? 'h-[60vh] max-h-[720px]' : 'h-[55vh]'}`}>
                                        {/* Skeleton grid on first fetch; refetches keep prior results visible via keepPreviousData */}
                                        {loading && !hasResults && (
                                            <div
                                                role="status"
                                                aria-live="polite"
                                                aria-label={searchType === 'media' ? 'Searching movies and shows' : 'Searching games'}
                                                className={`
                                                    grid gap-3 sm:gap-4 pb-4
                                                    ${isDesktop
                                                        ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                                        : 'grid-cols-2'
                                                    }
                                                `}
                                            >
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                                                        <Skeleton className="h-3 w-3/4" />
                                                        <Skeleton className="h-3 w-1/2" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {error && (
                                            <div className="text-center py-8 sm:py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Card className="p-3 sm:p-4 border-destructive/20 bg-destructive/5">
                                                        <div className="flex items-center gap-2 text-destructive">
                                                            <SafeIcon icon={X} className="h-4 w-4 sm:h-5 sm:w-5" size={isDesktop ? 20 : 16} />
                                                            <p className="font-medium text-sm sm:text-base">{error}</p>
                                                        </div>
                                                    </Card>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => refetchActive()}
                                                    >
                                                        Try Again
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {!loading && !error && !hasResults && query.length >= 2 && (
                                            <div className="text-center py-8 sm:py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Card className="p-3 sm:p-4 border-muted bg-muted/20">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <SafeIcon
                                                                icon={searchType === 'media' ? SearchIcon : Gamepad2}
                                                                className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground"
                                                                size={isDesktop ? 32 : 24}
                                                            />
                                                            <p className="font-medium text-sm sm:text-base">No {searchType === 'media' ? 'movies or shows' : 'games'} found for <strong>&quot;{query}&quot;</strong></p>
                                                            <p className="text-xs sm:text-sm text-muted-foreground">Try searching with different keywords</p>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        )}

                                        {/* Media Results */}
                                        {!error && searchType === 'media' && results.length > 0 && (
                                            <div className={`
                                                grid gap-3 sm:gap-4 pb-4
                                                ${isDesktop
                                                    ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                                    : 'grid-cols-2'
                                                }
                                            `}>
                                                {results.map((result, index) => (
                                                    <div
                                                        key={result.id}
                                                        data-search-result={index}
                                                        onClick={handleCardClick}
                                                        onMouseEnter={() => setActiveIndex(index)}
                                                        className={`transform transition-all duration-200 hover:scale-105 rounded-lg ${activeIndex === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                                    >
                                                        <NewSearchCard
                                                            media={result}
                                                            userProviders={user?.providers}
                                                            showProviders={false}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Game Results */}
                                        {!error && searchType === 'games' && gameResults.length > 0 && (
                                            <div className={`
                                                grid gap-3 sm:gap-4 pb-4
                                                ${isDesktop
                                                    ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                                    : 'grid-cols-2'
                                                }
                                            `}>
                                                {gameResults.map((game, index) => (
                                                    <div
                                                        key={game.id}
                                                        data-search-result={index}
                                                        onClick={handleCardClick}
                                                        onMouseEnter={() => setActiveIndex(index)}
                                                        className={`transform transition-all duration-200 hover:scale-105 rounded-lg ${activeIndex === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                                    >
                                                        <GameSearchCard game={game} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Full results page link */}
                                        {!error && hasResults && (
                                            <Button
                                                variant="ghost"
                                                className="w-full mb-2 text-muted-foreground"
                                                onClick={navigateToSearchPage}
                                            >
                                                See all results for &quot;{query}&quot;
                                            </Button>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                    </div>
                )}
        </div>
    );
};

export default NewSearchBar;