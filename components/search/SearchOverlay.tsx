'use client'
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useUser } from "@/hooks/User";
import { tmdbFetchOptions } from "@/lib/tmdb";
import { TMDBMultiSearchResult, TMDBMovieSearchResult, TMDBTelevisionSearchResult } from "@/types/tmdbApi";
import { IGDBGame } from "@/types/game";
import {
    ACCOUNT_ITEMS,
    DISCOVER_ITEMS,
    LIBRARY_ITEMS,
} from "@/components/layout/nav-config";
import { ArrowRight, Clock, Home, SearchIcon } from "lucide-react";

const OPEN_EVENT = 'watchlist:open-search';
const RECENT_KEY = 'watchlist:recent-searches';
const MEDIA_LIMIT = 6;
const GAMES_LIMIT = 4;

/** Open the global search overlay from anywhere (header trigger, bottom tab). */
export function openSearchOverlay() {
    window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Header trigger styled like an input, with the ⌘K hint. */
export function SearchTrigger() {
    return (
        <button
            onClick={openSearchOverlay}
            aria-label="Search"
            className="flex h-10 w-full items-center gap-2 rounded-lg border border-transparent bg-muted/90 px-4 text-sm text-muted-foreground/70 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <SearchIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search movies, TV, games...</span>
            <kbd className="pointer-events-none hidden rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[10px] lg:inline">
                ⌘K
            </kbd>
        </button>
    );
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const loadRecent = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
        return [];
    }
};

const saveRecent = (query: string) => {
    const next = [query, ...loadRecent().filter((q) => q !== query)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
};

const mediaTitle = (m: TMDBMultiSearchResult) =>
    m.media_type === 'movie'
        ? (m as TMDBMovieSearchResult).title
        : (m as TMDBTelevisionSearchResult).name;

const mediaYear = (m: TMDBMultiSearchResult) => {
    const date = m.media_type === 'movie'
        ? (m as TMDBMovieSearchResult).release_date
        : (m as TMDBTelevisionSearchResult).first_air_date;
    return date ? date.split('-')[0] : '';
};

const ResultThumb = ({ src, alt }: { src: string; alt: string }) => (
    <div className="h-[4.5rem] w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        <ImageWithFallback
            src={src}
            alt={alt}
            width={48}
            height={72}
            className="h-full w-full object-cover"
            loading="lazy"
        />
    </div>
);

const RowSkeletons = ({ count }: { count: number }) => (
    <div className="space-y-1 px-2 py-1">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-[4.5rem] w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
        ))}
    </div>
);

export default function SearchOverlay() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [recent, setRecent] = useState<string[]>([]);
    const router = useRouter();
    const { user } = useUser();

    const q = useDebounce(query, 250).trim();
    const canSearch = q.length >= 2;

    // Open via ⌘K/Ctrl+K or the shared event (header trigger, bottom tab).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        const onOpen = () => setOpen(true);
        document.addEventListener('keydown', onKey);
        window.addEventListener(OPEN_EVENT, onOpen);
        return () => {
            document.removeEventListener('keydown', onKey);
            window.removeEventListener(OPEN_EVENT, onOpen);
        };
    }, []);

    useEffect(() => {
        if (open) setRecent(loadRecent());
    }, [open]);

    // Media and games search in parallel — no tabs, both groups render together.
    const mediaSearch = useQuery<TMDBMultiSearchResult[]>({
        queryKey: ['search', 'overlay-media', q],
        enabled: open && canSearch,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(q)}`,
                tmdbFetchOptions
            );
            if (!response.ok) throw new Error(`Search failed: ${response.status}`);
            const data = await response.json();
            return (data.results || [])
                .filter((r: TMDBMultiSearchResult) => r.media_type !== 'person')
                .slice(0, MEDIA_LIMIT);
        },
    });

    const gameSearch = useQuery<IGDBGame[]>({
        queryKey: ['search', 'overlay-games', q],
        enabled: open && canSearch,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const response = await fetch(
                `/api/games/search?query=${encodeURIComponent(q)}&limit=${GAMES_LIMIT}`
            );
            if (!response.ok) throw new Error('Game search failed');
            const data = await response.json();
            return data.results || [];
        },
    });

    const close = useCallback(() => {
        setOpen(false);
        setQuery("");
    }, []);

    const go = useCallback((href: string, remember?: string) => {
        if (remember) {
            saveRecent(remember);
        }
        close();
        router.push(href);
    }, [router, close]);

    const pages = [
        { label: 'Home', href: '/', icon: Home, colorClass: 'text-primary' },
        ...LIBRARY_ITEMS,
        ...DISCOVER_ITEMS,
        ...ACCOUNT_ITEMS.filter((item) => !item.adminOnly || user?.admin),
    ];
    // Manual filtering — cmdk's own filter is off so async results always show.
    const matchedPages = q.length > 0
        ? pages.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()))
        : pages;

    const media = mediaSearch.data ?? [];
    const games = gameSearch.data ?? [];
    const searching = mediaSearch.isFetching || gameSearch.isFetching;
    const noResults = canSearch && !searching && media.length === 0 && games.length === 0
        && !mediaSearch.isError && !gameSearch.isError;

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
            <DialogContent
                className="top-[10%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:border-0"
            >
                <DialogTitle className="sr-only">Search</DialogTitle>
                <Command shouldFilter={false} className="bg-transparent [&_[cmdk-input-wrapper]]:px-5 [&_[cmdk-input-wrapper]_svg]:mr-3">
                    <CommandInput
                        placeholder="Search movies, TV shows, and games..."
                        value={query}
                        onValueChange={setQuery}
                        autoFocus
                    />
                    <CommandList className="max-h-[65vh] max-sm:max-h-[calc(100dvh-3rem)]">
                        {/* Idle: recent searches + page quick-nav */}
                        {!canSearch && recent.length > 0 && (
                            <CommandGroup heading="Recent searches">
                                {recent.map((term) => (
                                    <CommandItem
                                        key={term}
                                        value={`recent-${term}`}
                                        onSelect={() => go(`/search?q=${encodeURIComponent(term)}&type=media`, term)}
                                    >
                                        <Clock className="mr-3 h-4 w-4 text-muted-foreground" />
                                        {term}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {canSearch && searching && media.length === 0 && games.length === 0 && (
                            <RowSkeletons count={4} />
                        )}

                        {noResults && (
                            <CommandEmpty>No results for &quot;{q}&quot;.</CommandEmpty>
                        )}

                        {media.length > 0 && (
                            <CommandGroup heading="Movies & TV">
                                {media.map((result) => (
                                    <CommandItem
                                        key={`${result.media_type}-${result.id}`}
                                        value={`media-${result.media_type}-${result.id}`}
                                        onSelect={() => go(`/${result.media_type}/${result.id}`, q)}
                                        className="gap-3"
                                    >
                                        <ResultThumb
                                            src={`https://image.tmdb.org/t/p/w154/${result.poster_path}`}
                                            alt={mediaTitle(result) || ''}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{mediaTitle(result)}</p>
                                            <p className="text-xs text-muted-foreground">{mediaYear(result)}</p>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                                            {result.media_type}
                                        </Badge>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {games.length > 0 && (
                            <CommandGroup heading="Games">
                                {games.map((game) => (
                                    <CommandItem
                                        key={`game-${game.id}`}
                                        value={`game-${game.id}`}
                                        onSelect={() => go(`/game/${game.id}`, q)}
                                        className="gap-3"
                                    >
                                        <ResultThumb
                                            src={game.cover?.image_id
                                                ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                                                : ''}
                                            alt={game.name}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{game.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {game.first_release_date
                                                    ? new Date(game.first_release_date * 1000).getFullYear()
                                                    : ''}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                                            game
                                        </Badge>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {canSearch && (mediaSearch.isError || gameSearch.isError) && (
                            <CommandGroup heading="Something went wrong">
                                <CommandItem
                                    value="retry"
                                    onSelect={() => {
                                        if (mediaSearch.isError) mediaSearch.refetch();
                                        if (gameSearch.isError) gameSearch.refetch();
                                    }}
                                >
                                    Search failed — press Enter to retry
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {canSearch && (
                            <CommandGroup heading="More">
                                <CommandItem
                                    value="see-all"
                                    onSelect={() => go(`/search?q=${encodeURIComponent(q)}&type=media`, q)}
                                >
                                    <SearchIcon className="mr-3 h-4 w-4 text-primary" />
                                    See all results for &quot;{q}&quot;
                                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {matchedPages.length > 0 && (
                            <CommandGroup heading="Pages">
                                {matchedPages.map((page) => (
                                    <CommandItem
                                        key={page.href}
                                        value={`page-${page.href}`}
                                        onSelect={() => go(page.href)}
                                    >
                                        <page.icon className={`mr-3 h-4 w-4 ${page.colorClass ?? ''}`} />
                                        {page.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
