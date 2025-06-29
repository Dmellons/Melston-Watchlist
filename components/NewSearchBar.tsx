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
import { SearchIcon, Loader2 } from "lucide-react"
import SafeIcon from "@/components/SafeIcon"
import Link from "next/link"

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
    const inputRef = useRef<HTMLInputElement>(null);

    const { user } = useUser();
    const isDesktop = useMediaQuery("(min-width: 768px)");
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
        }
    }, []);

    // Show results condition
    const showResults = useMemo(() => 
        isMounted && isPopoverOpen && (results.length > 0 || loading || error),
        [isMounted, isPopoverOpen, results.length, loading, error]
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
                                className="bg-muted/90 text-muted-foreground h-8 rounded-md p-2"
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
                                className="h-5 w-5 flex-shrink-0" 
                                size={20}
                            />
                        )}
                        <div className="relative w-full">
                            <Input
                                ref={inputRef}
                                placeholder="Movie or TV Show..."
                                value={query}
                                className="bg-muted/90 text-muted-foreground focus:w-full transition h-8 rounded-md p-2 pr-8"
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                            />
                            {loading && (
                                <SafeIcon
                                    icon={Loader2}
                                    className="absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground"
                                    size={16}
                                />
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
                        <div className="w-full bg-card/95 backdrop-blur-sm rounded-lg py-4 px-2 sm:px-4 sm:m-auto shadow-xl border">
                            <ScrollArea className="z-40 w-full h-[350px] sm:h-[600px] sm:max-w-5xl">
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <SafeIcon
                                            icon={Loader2}
                                            className="h-8 w-8 animate-spin text-primary"
                                            size={32}
                                        />
                                        <span className="ml-2 text-muted-foreground">Searching...</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="text-center py-8">
                                        <p className="text-destructive">{error}</p>
                                    </div>
                                )}

                                {!loading && !error && results.length === 0 && query.length >= 2 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No results found for "{query}"
                                    </div>
                                )}

                                {!loading && !error && results.length > 0 && (
                                    <div className="grid grid-cols-2 sm:flex lg:flex-row lg:flex-wrap justify-center gap-4 items-center place-items-center lg:w-full m-auto">
                                        {results.map((result) => (
                                            <NewSearchCard 
                                                key={result.id} 
                                                media={result} 
                                                userProviders={user?.providers} 
                                            />
                                        ))}
                                        
                                        {results.length >= resultsLength && (
                                            <div className="col-span-2 sm:col-span-1 text-center text-muted-foreground">
                                                <Link 
                                                    href="#" 
                                                    className="text-sm hover:underline"
                                                    onClick={(e) => e.preventDefault()}
                                                >
                                                    More Results...
                                                    <br />
                                                    <span className="text-xs">(Coming Soon)</span>
                                                </Link>
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