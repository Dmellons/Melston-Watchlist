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
import {
    Search,
    Filter,
    Grid,
    List,
    SortAsc,
    SortDesc,
    Film,
    Tv,
    Star,
    Eye,
    Menu,
    X,
    ChevronDown,
    Settings,
    TrendingUp,
    Calendar,
    MoreVertical,
    Trash2,
    Gamepad2,
    Heart,
    ListChecks
} from "lucide-react"
import { WatchStatus } from "@/types/customTypes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useBreakpoint } from "@/hooks/MediaQuery"
import Link from "next/link"
import DeleteButton from "@/components/DeleteButton"
import PlexRequestToggle from "@/components/PlexRequestToggle"
import { useUser } from "@/hooks/User"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProvidersBlock from "../ProvidersBlock"

interface WatchlistGridProps {
    watchlist: Models.DocumentList<WatchlistDocument>;
}

type SortOption = 'title' | 'date' | 'year' | 'type';
type FilterOption = 'all' | 'movie' | 'tv' | 'videogame' | 'requested' | 'favorite';

const STATUS_OPTIONS: Array<{ value: WatchStatus; label: string }> = [
    { value: WatchStatus.WANT_TO_WATCH, label: 'Want to Watch' },
    { value: WatchStatus.WATCHING, label: 'Watching' },
    { value: WatchStatus.COMPLETED, label: 'Completed' },
    { value: WatchStatus.ON_HOLD, label: 'On Hold' },
    { value: WatchStatus.DROPPED, label: 'Dropped' },
];

/** Multi-select watch-status filter; empty selection means "all statuses". */
const WatchStatusFilter = ({
    selected,
    setSelected,
    className,
}: {
    selected: WatchStatus[];
    setSelected: (statuses: WatchStatus[]) => void;
    className?: string;
}) => {
    const toggle = (status: WatchStatus) => {
        setSelected(
            selected.includes(status)
                ? selected.filter((s) => s !== status)
                : [...selected, status]
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`justify-between gap-2 bg-background/50 font-normal ${className ?? ''}`}>
                    <span className="flex items-center gap-2">
                        <SafeIcon icon={ListChecks} className="h-4 w-4" size={16} />
                        Status
                    </span>
                    {selected.length > 0 && (
                        <Badge variant="secondary" className="px-1.5">{selected.length}</Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
                {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={selected.includes(option.value)}
                        // Keep the menu open while ticking multiple statuses
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => toggle(option.value)}
                    >
                        {option.label}
                    </DropdownMenuCheckboxItem>
                ))}
                {selected.length > 0 && (
                    <DropdownMenuItem
                        className="justify-center text-muted-foreground"
                        onSelect={(e) => {
                            e.preventDefault();
                            setSelected([]);
                        }}
                    >
                        Clear
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const FilterSidebar = ({ 
    searchQuery, 
    setSearchQuery, 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder, 
    filterBy,
    setFilterBy,
    statusFilter,
    setStatusFilter,
    stats,
    isOpen,
    onClose
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
    filterBy: FilterOption;
    setFilterBy: (filter: FilterOption) => void;
    statusFilter: WatchStatus[];
    setStatusFilter: (statuses: WatchStatus[]) => void;
    stats: { movies: number; tvShows: number; games: number; requested: number; favorites: number; total: number };
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { isMobile } = useBreakpoint();
    
    const sidebarContent = (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <SafeIcon icon={Filter} className="h-5 w-5 text-primary" size={20} />
                    <h2 className="font-semibold text-lg">Filters & Search</h2>
                </div>
                {isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1"
                    >
                        <SafeIcon icon={X} className="h-4 w-4" size={16} />
                    </Button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                            <SafeIcon icon={Eye} className="h-4 w-4 text-primary" size={16} />
                            <span className="text-sm">Total Items</span>
                        </div>
                        <Badge variant="secondary">{stats.total}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                            <SafeIcon icon={Film} className="h-4 w-4 text-blue-500" size={16} />
                            <span className="text-sm">Movies</span>
                        </div>
                        <Badge variant="secondary">{stats.movies}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                            <SafeIcon icon={Tv} className="h-4 w-4 text-green-500" size={16} />
                            <span className="text-sm">TV Shows</span>
                        </div>
                        <Badge variant="secondary">{stats.tvShows}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                            <SafeIcon icon={Gamepad2} className="h-4 w-4 text-purple-500" size={16} />
                            <span className="text-sm">Games</span>
                        </div>
                        <Badge variant="secondary">{stats.games}</Badge>
                    </div>
                    {stats.requested > 0 && (
                        <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-2">
                                <SafeIcon icon={Star} className="h-4 w-4 text-amber-500" size={16} />
                                <span className="text-sm">Plex Requests</span>
                            </div>
                            <Badge className="bg-amber-500 text-white">{stats.requested}</Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Search</h3>
                <div className="relative">
                    <SafeIcon 
                        icon={Search} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                        size={16} 
                    />
                    <Input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-xs"
                    >
                        Clear search
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Type</h3>
                <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="movie">
                            <div className="flex items-center gap-2">
                                <SafeIcon icon={Film} className="h-4 w-4" size={16} />
                                Movies Only
                            </div>
                        </SelectItem>
                        <SelectItem value="tv">
                            <div className="flex items-center gap-2">
                                <SafeIcon icon={Tv} className="h-4 w-4" size={16} />
                                TV Shows Only
                            </div>
                        </SelectItem>
                        <SelectItem value="videogame">
                            <div className="flex items-center gap-2">
                                <SafeIcon icon={Gamepad2} className="h-4 w-4" size={16} />
                                Games Only
                            </div>
                        </SelectItem>
                        <SelectItem value="requested">
                            <div className="flex items-center gap-2">
                                <SafeIcon icon={Star} className="h-4 w-4" size={16} />
                                Plex Requests
                            </div>
                        </SelectItem>
                        <SelectItem value="favorite">
                            <div className="flex items-center gap-2">
                                <SafeIcon icon={Heart} className="h-4 w-4" size={16} />
                                Favorites
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Watch Status */}
            <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Watch Status</h3>
                <WatchStatusFilter
                    selected={statusFilter}
                    setSelected={setStatusFilter}
                    className="w-full"
                />
            </div>

            {/* Sorting */}
            <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Sort Options</h3>
                <div className="space-y-3">
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Date Added</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="year">Release Year</SelectItem>
                            <SelectItem value="type">Content Type</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Order:</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center gap-2"
                        >
                            <SafeIcon
                                icon={sortOrder === 'asc' ? SortAsc : SortDesc}
                                className="h-4 w-4"
                                size={16}
                            />
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reset Filters */}
            <div className="p-4">
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchQuery('');
                        setFilterBy('all');
                        setStatusFilter([]);
                        setSortBy('date');
                        setSortOrder('desc');
                    }}
                    className="w-full"
                    disabled={searchQuery === '' && filterBy === 'all' && statusFilter.length === 0 && sortBy === 'date' && sortOrder === 'desc'}
                >
                    Reset All Filters
                </Button>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <div className={`
                fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {sidebarContent}
            </div>
        );
    }

    // Desktop sidebar
    return (
        <div className="w-80 bg-background border-r border-border flex flex-col h-[calc(100vh-140px)] overflow-y-auto">
            {sidebarContent}
        </div>
    );
};

const MobileWatchlistCard = ({ media }: { media: WatchlistDocument }) => {
    const { user } = useUser();
    const [plexRequest, setPlexRequest] = useState(media.plex_request);
    const year = media.release_date ? new Date(media.release_date).getFullYear() : '';
    
    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex gap-3 p-3">
                {/* Poster */}
                <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {media.poster_url ? (
                        <img 
                            src={media.poster_url} 
                            alt={media.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextSibling) {
                                    (target.nextSibling as HTMLElement).style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full ${media.poster_url ? 'hidden' : 'flex'} items-center justify-center bg-muted`}>
                        <SafeIcon 
                            icon={media.content_type === 'movie' ? Film : Tv} 
                            className="h-6 w-6 text-muted-foreground" 
                            size={24} 
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight line-clamp-2">{media.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{year}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <div className="flex items-center gap-1">
                                    <SafeIcon 
                                        icon={media.content_type === 'movie' ? Film : Tv} 
                                        className="h-3 w-3 text-muted-foreground" 
                                        size={12} 
                                    />
                                    <span className="text-xs text-muted-foreground capitalize">{media.content_type}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            {media.plex_request && (
                                <SafeIcon icon={Star} className="h-4 w-4 fill-amber-400 text-amber-400" size={16} />
                            )}
                            
                            {/* Mobile Actions Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <SafeIcon icon={MoreVertical} className="h-3 w-3" size={12} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link 
                                            href={`/${media.tmdb_type}/${media.tmdb_id}`}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <SafeIcon icon={Eye} className="h-4 w-4" size={16} />
                                            View Details
                                        </Link>
                                    </DropdownMenuItem>
                                    
                                    {user?.labels?.includes('plex') && (
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // The PlexRequestToggle will handle the toggle
                                            }}
                                        >
                                            <SafeIcon icon={Star} className="h-4 w-4 mr-2" size={16} />
                                            {plexRequest ? 'Remove Plex Request' : 'Request on Plex'}
                                        </DropdownMenuItem>
                                    )}
                                    
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // The DeleteButton will handle the deletion
                                        }}
                                    >
                                        <SafeIcon icon={Trash2} className="h-4 w-4 mr-2" size={16} />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Description */}
                    {media.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {media.description}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-7 text-xs" asChild>
                            <Link href={`/${media.tmdb_type}/${media.tmdb_id}`}>
                                <SafeIcon icon={Eye} className="h-3 w-3 mr-1" size={12} />
                                View Details
                            </Link>
                        </Button>
                        
                        <DeleteButton 
                            title={media.title} 
                            document_id={media.$id}
                            buttonVariant="outline"
                            buttonText={<SafeIcon icon={Trash2} className="h-3 w-3" size={12} />}
                        />
                    </div>
                    <div className="px-2 flex space- items-center justify-between">
                        <div >

                        {/* Providers Block */}
                        <ProvidersBlock
                            tmdbId={media.tmdb_id}
                            tmdbType={media.tmdb_type}
                            userProviders={user?.providers}
                            maxWidth="w-full"
                            iconSize={24}
                            country="US"
                            notStreamingValue={
                                <div className="flex items-center justify-center p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        No streaming available
                                    </span>
                                </div>
                            }
                            />
                            </div>
                        <div>
                            
                    {/* Plex Request Toggle for Mobile */}
                    {user?.labels?.includes('plex') && (
                        
                        <PlexRequestToggle
                        documentId={media.$id}
                        requested={plexRequest}
                        mediaTitle={media.title}
                        setPlexRequest={setPlexRequest}
                        />
                        
                    )}
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WatchlistGrid = ({ watchlist }: WatchlistGridProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [statusFilter, setStatusFilter] = useState<WatchStatus[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const { isMobile, isDesktop } = useBreakpoint();

    const filteredAndSortedWatchlist = useMemo(() => {
        const filtered = watchlist.documents.filter(document => {
            // Search filter
            const matchesSearch = searchQuery.length === 0 || 
                document.title.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesFilter =
                filterBy === 'all' ||
                (filterBy === 'movie' && document.content_type === 'movie') ||
                (filterBy === 'tv' && document.content_type === 'tv') ||
                (filterBy === 'videogame' && document.content_type === 'videogame') ||
                (filterBy === 'requested' && document.plex_request) ||
                (filterBy === 'favorite' && (document as any).is_favorite);

            // Watch-status filter (multi-select; empty = all). Items without a
            // status count as want_to_watch, matching how the rest of the app
            // treats unset statuses.
            const matchesStatus = statusFilter.length === 0 ||
                statusFilter.includes(document.watch_status ?? WatchStatus.WANT_TO_WATCH);

            return matchesSearch && matchesFilter && matchesStatus;
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
    }, [watchlist.documents, searchQuery, sortBy, sortOrder, filterBy, statusFilter]);

    const stats = useMemo(() => {
        const movies = watchlist.documents.filter(d => d.content_type === 'movie').length;
        const tvShows = watchlist.documents.filter(d => d.content_type === 'tv').length;
        const games = watchlist.documents.filter(d => d.content_type === 'videogame').length;
        const requested = watchlist.documents.filter(d => d.plex_request).length;
        const favorites = watchlist.documents.filter(d => (d as any).is_favorite).length;

        return { movies, tvShows, games, requested, favorites, total: watchlist.documents.length };
    }, [watchlist.documents]);

    return (
        <div className="flex flex-col w-full gap-4 sm:px-4">
            {/* Overlay for mobile */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile-only Filter Sidebar */}
            {isMobile && (
                <FilterSidebar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    filterBy={filterBy}
                    setFilterBy={setFilterBy}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    stats={stats}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            )}

            {/* Desktop: Traditional Accordion Layout */}
            {isDesktop ? (
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
                                
                                {/* Desktop Stats */}
                                <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <SafeIcon icon={Film} className="h-4 w-4" size={16} />
                                        <span>{stats.movies} Movies</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <SafeIcon icon={Tv} className="h-4 w-4" size={16} />
                                        <span>{stats.tvShows} TV Shows</span>
                                    </div>
                                    {stats.games > 0 && (
                                        <div className="flex items-center gap-1">
                                            <SafeIcon icon={Gamepad2} className="h-4 w-4 text-purple-500" size={16} />
                                            <span>{stats.games} Games</span>
                                        </div>
                                    )}
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
                            {/* Desktop Controls */}
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
                                                <SafeIcon icon={Filter} className="h-4 w-4" size={16} />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Items</SelectItem>
                                            <SelectItem value="movie">Movies</SelectItem>
                                            <SelectItem value="tv">TV Shows</SelectItem>
                                            <SelectItem value="videogame">Games</SelectItem>
                                            <SelectItem value="requested">Requested</SelectItem>
                                            <SelectItem value="favorite">Favorites</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Watch status (multi-select) */}
                                    <WatchStatusFilter
                                        selected={statusFilter}
                                        setSelected={setStatusFilter}
                                        className="w-full sm:w-auto"
                                    />
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
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
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

                            {/* Desktop Results */}
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
                                        {filteredAndSortedWatchlist.map((document, index) => (
                                            <div
                                                key={document.$id}
                                                className="animate-in fade-in-0 slide-in-from-bottom-4"
                                                style={{
                                                    animationDelay: `${Math.min(index * 50, 500)}ms`,
                                                    animationFillMode: 'both'
                                                }}
                                            >
                                                <NewWatchlistCard media={document} />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ) : (
                /* Mobile Layout */
                <>
                    {/* Mobile Results Header with Filter Button */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm">
                                {filteredAndSortedWatchlist.length} of {stats.total} items
                            </Badge>
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <SafeIcon icon={Filter} className="h-4 w-4" size={16} />
                            <span className="text-xs">Filter</span>
                        </Button>
                    </div>

                    {/* Mobile Watchlist Content */}
                    {filteredAndSortedWatchlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <SafeIcon
                                    icon={searchQuery ? Search : Eye}
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
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4"
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <div className="space-y-3 pb-6">
                                {filteredAndSortedWatchlist.map((document, index) => (
                                    <div
                                        key={document.$id}
                                        className="animate-in fade-in-0 slide-in-from-bottom-4"
                                        style={{ 
                                            animationDelay: `${Math.min(index * 30, 300)}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <MobileWatchlistCard media={document} />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </>
            )}
        </div>
    );
};

export default WatchlistGrid;