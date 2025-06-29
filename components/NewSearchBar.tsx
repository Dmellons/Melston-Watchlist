'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Input } from "./ui/input"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import NewSearchCard from "@/components/NewSearchCard"
import { useUser } from "@/hooks/User"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { useMediaQuery } from "@/hooks/MediaQuery"
import { SearchIcon, Loader2, X } from "lucide-react"
import Link from "next/link"
import SafeIcon from "@/components/SafeIcon"
import { Button } from "./ui/button"

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
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<TMDBMultiSearchResult[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { user } = useUser();
    const isDesktop = useMediaQuery("(min-width: 768px)", { defaultValue: false });
    const debouncedQuery = useDebounce(query, 300);

    // Handle hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Memoize the search function
    const searchMovies = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setResults([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchQuery)}`,
                tmdbFetchOptions
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            
            const filteredResults = data.results
                .filter((result: TMDBMultiSearchResult) => result.media_type !== 'person')
                .slice(0, resultsLength);
            
            setResults(filteredResults);
        } catch (error) {
            console.error('Search error:', error);
            setError('Search failed. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [resultsLength]);

    // Effect for debounced search
    useEffect(() => {
        if (isMounted) {
            searchMovies(debouncedQuery);
        }
    }, [debouncedQuery, searchMovies, isMounted]);

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        
        if (value.length > 0 && !isPopoverOpen) {
            setIsPopoverOpen(true);
        }
    }, [isPopoverOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsPopoverOpen(false);
            inputRef.current?.blur();
            setQuery("");
        }
        if (e.key === " ") {
            e.stopPropagation();
        }
    }, []);

    // Handle popover open change
    const handlePopoverOpenChange = useCallback((open: boolean) => {
        setIsPopoverOpen(open);
        if (!open) {
            setQuery("");
            setResults([]);
            setError(null);
            setIsInputFocused(false);
        }
    }, []);

    // Handle clear search
    const handleClearSearch = useCallback(() => {
        setQuery("");
        setResults([]);
        setError(null);
        setIsPopoverOpen(false);
        inputRef.current?.focus();
    }, []);

    // Handle card click - close search
    const handleCardClick = useCallback(() => {
        setIsPopoverOpen(false);
        setQuery("");
        setResults([]);
        setError(null);
        setIsInputFocused(false);
    }, []);

    // Show results condition
    const showResults = useMemo(() => 
        isMounted && isPopoverOpen && (results.length > 0 || loading || error) && query.length >= 2,
        [isMounted, isPopoverOpen, results.length, loading, error, query.length]
    );

    // Don't render anything until mounted to avoid hydration issues
    if (!isMounted) {
        return (
            <div className="flex flex-col gap-2 items-center w-full">
                <div className="w-2/3 mt-2">
                    <div className="flex flex-col m-auto gap-1 sm:gap-2 sm:flex-row items-center sm:w-2/5 mt-2">
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
        <div className="flex flex-col gap-2 items-center w-full">
            <Popover 
                open={isPopoverOpen} 
                onOpenChange={handlePopoverOpenChange}
            >
                <PopoverTrigger asChild className="w-2/3 mt-2">
                    <div className={`flex flex-col m-auto gap-1 sm:gap-2 sm:flex-row items-center sm:w-2/5 ${isDesktop ? "mt-2" : "mt-14"}`}>
                        {isDesktop && (
                            <SafeIcon 
                                icon={SearchIcon} 
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors" 
                                size={20}
                            />
                        )}
                        <div className="relative w-full group">
                            <Input
                                ref={inputRef}
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
                    </div>
                </PopoverTrigger>

                {showResults && (
                    <PopoverContent
                        className="w-full bg-transparent shadow-none border-none p-0 m-0 mt-2"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        side="bottom"
                        align="center"
                        sideOffset={8}
                    >
                        <div className="w-full bg-background/95 backdrop-blur-xl rounded-xl py-6 px-4 sm:px-6 shadow-2xl border border-border/50 animate-in slide-in-from-top-2 duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <SafeIcon
                                        icon={SearchIcon}
                                        className="h-4 w-4 text-muted-foreground"
                                        size={16}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {loading ? 'Searching...' : `Results for "${query}"`}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setIsPopoverOpen(false)}
                                >
                                    <SafeIcon icon={X} className="h-4 w-4" size={16} />
                                </Button>
                            </div>

                            <ScrollArea className="w-full h-[500px] sm:h-[700px]">
                                {loading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <SafeIcon
                                                icon={Loader2}
                                                className="h-8 w-8 animate-spin text-primary"
                                                size={32}
                                            />
                                            <span className="text-sm text-muted-foreground">Searching movies and shows...</span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                                <SafeIcon icon={X} className="h-6 w-6 text-destructive" size={24} />
                                            </div>
                                            <p className="text-destructive font-medium">{error}</p>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => searchMovies(query)}
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {!loading && !error && results.length === 0 && query.length >= 2 && (
                                    <div className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                <SafeIcon icon={SearchIcon} className="h-6 w-6 text-muted-foreground" size={24} />
                                            </div>
                                            <p className="text-muted-foreground">No results found for <strong>"{query}"</strong></p>
                                            <p className="text-sm text-muted-foreground/70">Try searching with different keywords</p>
                                        </div>
                                    </div>
                                )}

                                {!loading && !error && results.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                                        {results.map((result) => (
                                            <div 
                                                key={result.id}
                                                onClick={handleCardClick}
                                                className="transform transition-all duration-200 hover:scale-105"
                                            >
                                                <NewSearchCard 
                                                    media={result} 
                                                    userProviders={user?.providers} 
                                                />
                                            </div>
                                        ))}
                                        
                                        {results.length >= resultsLength && (
                                            <div className="col-span-full flex justify-center mt-4">
                                                <div className="bg-muted/50 rounded-lg p-4 text-center">
                                                    <Link 
                                                        href="#" 
                                                        className="text-sm text-primary hover:underline font-medium"
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        View More Results
                                                        <span className="block text-xs text-muted-foreground mt-1">(Coming Soon)</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </PopoverContent>
                )}
            </Popover>
        </div>
    );
};

export default NewSearchBar;