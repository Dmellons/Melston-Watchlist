"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WatchlistDocument } from "@/types/appwrite"
import { Models } from "appwrite"
import NewWatchlistCard from "@/components/NewWatchlistCard"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { useState, useMemo } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import SafeIcon from "@/components/SafeIcon"
import { Search, Filter, Grid, List, SortAsc, SortDesc, Film, Tv, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface WatchlistGridProps {
    watchlist: Models.DocumentList<WatchlistDocument>;
}

type SortOption = 'title' | 'date' | 'year' | 'type';
type FilterOption = 'all' | 'movie' | 'tv' | 'requested';

const WatchlistGrid = ({ watchlist }: WatchlistGridProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredAndSortedWatchlist = useMemo(() => {
        let filtered = watchlist.documents.filter(document => {
            // Search filter
            const matchesSearch = searchQuery.length === 0 || 
                document.title.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesFilter = 
                filterBy === 'all' ||
                (filterBy === 'movie' && document.content_type === 'movie') ||
                (filterBy === 'tv' && document.content_type === 'tv') ||
                (filterBy === 'requested' && document.plex_request);

            return matchesSearch && matchesFilter;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.$createdAt);
                    bValue = new Date(b.$createdAt);
                    break;
                case 'year':
                    aValue = a.release_date ? new Date(a.release_date).getFullYear() : 0;
                    bValue = b.release_date ? new Date(b.release_date).getFullYear() : 0;
                    break;
                case 'type':
                    aValue = a.content_type;
                    bValue = b.content_type;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [watchlist.documents, searchQuery, sortBy, sortOrder, filterBy]);

    const stats = useMemo(() => {
        const movies = watchlist.documents.filter(d => d.content_type === 'movie').length;
        const tvShows = watchlist.documents.filter(d => d.content_type === 'tv').length;
        const requested = watchlist.documents.filter(d => d.plex_request).length;
        
        return { movies, tvShows, requested, total: watchlist.documents.length };
    }, [watchlist.documents]);

    const toggleSortOrder = () => {
        setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    };

    const getFilterIcon = (filter: FilterOption) => {
        switch (filter) {
            case 'movie': return Film;
            case 'tv': return Tv;
            case 'requested': return Star;
            default: return Filter;
        }
    };

    return (
        <div className="flex flex-col w-full gap-4 sm:px-4">
            <Accordion type="single" className="w-full" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="w-full hover:no-underline group">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold">Your Watchlist</span>
                                <Badge variant="secondary" className="text-sm">
                                    {filteredAndSortedWatchlist.length} of {stats.total}
                                </Badge>
                            </div>
                            
                            {/* Stats */}
                            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <SafeIcon icon={Film} className="h-4 w-4" size={16} />
                                    <span>{stats.movies} Movies</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <SafeIcon icon={Tv} className="h-4 w-4" size={16} />
                                    <span>{stats.tvShows} TV Shows</span>
                                </div>
                                {stats.requested > 0 && (
                                    <div className="flex items-center gap-1">
                                        <SafeIcon icon={Star} className="h-4 w-4 text-amber-500" size={16} />
                                        <span>{stats.requested} Requested</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    
                    <Separator className="w-full my-4" />
                    
                    <AccordionContent className="space-y-6">
                        {/* Controls */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/30 p-4 rounded-lg">
                            {/* Search and Filters */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
                                {/* Search */}
                                <div className="relative flex-1 max-w-xs">
                                    <SafeIcon
                                        icon={Search}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                        size={16}
                                    />
                                    <Input
                                        placeholder="Search watchlist..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-background/50"
                                    />
                                </div>

                                {/* Filter */}
                                <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                                    <SelectTrigger className="w-full sm:w-[140px] bg-background/50">
                                        <div className="flex items-center gap-2">
                                            <SafeIcon icon={getFilterIcon(filterBy)} className="h-4 w-4" size={16} />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Items</SelectItem>
                                        <SelectItem value="movie">Movies</SelectItem>
                                        <SelectItem value="tv">TV Shows</SelectItem>
                                        <SelectItem value="requested">Requested</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort and View Controls */}
                            <div className="flex items-center gap-2">
                                {/* Sort */}
                                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                    <SelectTrigger className="w-[120px] bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Date Added</SelectItem>
                                        <SelectItem value="title">Title</SelectItem>
                                        <SelectItem value="year">Year</SelectItem>
                                        <SelectItem value="type">Type</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleSortOrder}
                                    className="bg-background/50"
                                >
                                    <SafeIcon
                                        icon={sortOrder === 'asc' ? SortAsc : SortDesc}
                                        className="h-4 w-4"
                                        size={16}
                                    />
                                </Button>

                                {/* View Mode */}
                                <div className="flex border rounded-md bg-background/50">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-r-none"
                                    >
                                        <SafeIcon icon={Grid} className="h-4 w-4" size={16} />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-l-none"
                                    >
                                        <SafeIcon icon={List} className="h-4 w-4" size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        {filteredAndSortedWatchlist.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <SafeIcon
                                        icon={searchQuery ? Search : Film}
                                        className="h-8 w-8 text-muted-foreground"
                                        size={32}
                                    />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchQuery ? 'No results found' : 'Your watchlist is empty'}
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    {searchQuery 
                                        ? `No items match "${searchQuery}". Try adjusting your search or filters.`
                                        : 'Start adding movies and TV shows to build your watchlist!'
                                    }
                                </p>
                                {searchQuery && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setFilterBy('all');
                                        }}
                                        className="mt-4"
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <ScrollArea className="h-[70dvh]">
                                <div className={`
                                    ${viewMode === 'grid' 
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 place-items-center' 
                                        : 'flex flex-col gap-4'
                                    }
                                    pb-6
                                `}>
                                    {filteredAndSortedWatchlist.map((document, index) => {
                                        // Ensure content_type is properly set
                                        const processedDocument = {
                                            ...document,
                                            content_type: document.content_type === 'movie' ? 'movie' : 'tv'
                                        };

                                        return (
                                            <div
                                                key={document.$id}
                                                className="animate-in fade-in-0 slide-in-from-bottom-4"
                                                style={{ 
                                                    animationDelay: `${Math.min(index * 50, 500)}ms`,
                                                    animationFillMode: 'both'
                                                }}
                                            >
                                                <NewWatchlistCard media={processedDocument} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default WatchlistGrid;