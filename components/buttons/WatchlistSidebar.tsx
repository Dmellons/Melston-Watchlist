import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Film, 
  Tv, 
  Star, 
  Eye,
  Calendar,
  Clock,
  Check,
  Play,
  Pause,
  X,
  Menu,
  ChevronRight,
  MoreVertical,
  Plus,
  ChevronDown,
  Settings
} from 'lucide-react';

// Mock data - replace with your actual data structure
const mockWatchlistItems = [
  {
    $id: '1',
    title: 'The Batman',
    content_type: 'movie',
    tmdb_id: 414906,
    tmdb_type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w300/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    release_date: '2022-03-01',
    plex_request: false,
    watch_status: 'want_to_watch',
    user_rating: null,
    description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
    $createdAt: '2024-01-15T10:00:00Z'
  },
  {
    $id: '2',
    title: 'Stranger Things',
    content_type: 'tv',
    tmdb_id: 66732,
    tmdb_type: 'tv',
    poster_url: 'https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    release_date: '2016-07-15',
    plex_request: true,
    watch_status: 'watching',
    user_rating: 9,
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
    $createdAt: '2024-02-01T14:30:00Z'
  },
  {
    $id: '3',
    title: 'Dune: Part Two',
    content_type: 'movie',
    tmdb_id: 693134,
    tmdb_type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w300/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    release_date: '2024-02-29',
    plex_request: false,
    watch_status: 'completed',
    user_rating: 8,
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    $createdAt: '2024-03-15T20:15:00Z'
  },
  {
    $id: '4',
    title: 'House of the Dragon',
    content_type: 'tv',
    tmdb_id: 94997,
    tmdb_type: 'tv',
    poster_url: 'https://image.tmdb.org/t/p/w300/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
    release_date: '2022-08-21',
    plex_request: true,
    watch_status: 'on_hold',
    user_rating: 7,
    description: 'The Targaryen civil war begins 200 years before the events of Game of Thrones.',
    $createdAt: '2024-01-20T16:45:00Z'
  },
  {
    $id: '5',
    title: 'Everything Everywhere All at Once',
    content_type: 'movie',
    tmdb_id: 545611,
    tmdb_type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w300/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    release_date: '2022-03-11',
    plex_request: false,
    watch_status: 'dropped',
    user_rating: null,
    description: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence.',
    $createdAt: '2024-03-01T11:20:00Z'
  }
];

const WatchStatusBadge = ({ status }) => {
  const statusConfig = {
    want_to_watch: { label: 'Want to Watch', icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    watching: { label: 'Watching', icon: Play, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    completed: { label: 'Completed', icon: Check, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    on_hold: { label: 'On Hold', icon: Pause, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    dropped: { label: 'Dropped', icon: X, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  };
  
  const config = statusConfig[status] || statusConfig.want_to_watch;
  const IconComponent = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <IconComponent className="h-3 w-3" />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
};

const StarRating = ({ rating, size = 'sm' }) => {
  if (!rating) return null;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4'
  };
  
  return (
    <div className="flex items-center gap-1">
      <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      <span className="text-xs font-medium">{rating}/10</span>
    </div>
  );
};

const WatchlistItem = ({ item, isExpanded, onToggle }) => {
  const year = item.release_date ? new Date(item.release_date).getFullYear() : '';
  
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <div 
        className="flex items-start gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => onToggle(item.$id)}
      >
        {/* Poster */}
        <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
          <img 
            src={item.poster_url} 
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full hidden items-center justify-center bg-muted">
            {item.content_type === 'movie' ? 
              <Film className="h-6 w-6 text-muted-foreground" /> : 
              <Tv className="h-6 w-6 text-muted-foreground" />
            }
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight truncate">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{year}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  {item.content_type === 'movie' ? 
                    <Film className="h-3 w-3 text-muted-foreground" /> : 
                    <Tv className="h-3 w-3 text-muted-foreground" />
                  }
                  <span className="text-xs text-muted-foreground capitalize">{item.content_type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {item.plex_request && (
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              )}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <WatchStatusBadge status={item.watch_status} />
            <StarRating rating={item.user_rating} />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/30 bg-muted/20">
          <div className="pt-3 space-y-3">
            {item.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Added {new Date(item.$createdAt).toLocaleDateString()}</span>
              </div>
              
              <button className="p-2 hover:bg-muted rounded-md transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                View Details
              </button>
              <button className="px-3 py-2 border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterControls = ({ 
  searchQuery, 
  setSearchQuery, 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder, 
  filterBy, 
  setFilterBy,
  isCompact = false 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  if (isCompact) {
    return (
      <div className="p-3 border-b border-border/50 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
        </div>

        {/* Compact Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors"
          >
            <Filter className="h-3 w-3" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-background border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="date">Date Added</option>
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="status">Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-border rounded hover:bg-muted transition-colors"
            >
              {sortOrder === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
              }
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-2 py-1.5 bg-background border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Items</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
              <option value="requested">Requested</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
            </select>
            
            <button className="px-2 py-1.5 border border-border rounded text-xs font-medium hover:bg-muted transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  }

  // Regular filter controls for larger screens
  return (
    <div className="p-4 border-b border-border/50 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search watchlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Items</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
          <option value="requested">Requested</option>
          <option value="watching">Watching</option>
          <option value="completed">Completed</option>
        </select>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="date">Date Added</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
            <option value="status">Status</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            {sortOrder === 'asc' ? 
              <SortAsc className="h-4 w-4" /> : 
              <SortDesc className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileSidebarWatchlist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');

  // Filter and sort logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = mockWatchlistItems.filter(item => {
      const matchesSearch = searchQuery.length === 0 || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'movie' && item.content_type === 'movie') ||
        (filterBy === 'tv' && item.content_type === 'tv') ||
        (filterBy === 'requested' && item.plex_request) ||
        (filterBy === 'watching' && item.watch_status === 'watching') ||
        (filterBy === 'completed' && item.watch_status === 'completed');

      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

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
        case 'status':
          aValue = a.watch_status;
          bValue = b.watch_status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, sortBy, sortOrder, filterBy]);

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const stats = useMemo(() => {
    const movies = mockWatchlistItems.filter(d => d.content_type === 'movie').length;
    const tvShows = mockWatchlistItems.filter(d => d.content_type === 'tv').length;
    const requested = mockWatchlistItems.filter(d => d.plex_request).length;
    return { movies, tvShows, requested, total: mockWatchlistItems.length };
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-96
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Watchlist</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {filteredAndSortedItems.length}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded">
              <Film className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">{stats.movies}</div>
              <div className="text-xs text-muted-foreground">Movies</div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <Tv className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">{stats.tvShows}</div>
              <div className="text-xs text-muted-foreground">TV Shows</div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <Star className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">{stats.requested}</div>
              <div className="text-xs text-muted-foreground">Requested</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <FilterControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          isCompact={true}
        />

        {/* Watchlist Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredAndSortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                {searchQuery ? (
                  <Search className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Eye className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium mb-2">
                {searchQuery ? 'No results found' : 'Your watchlist is empty'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery 
                  ? `No items match "${searchQuery}"`
                  : 'Start adding movies and TV shows to build your watchlist!'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBy('all');
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredAndSortedItems.map((item) => (
                <WatchlistItem
                  key={item.$id}
                  item={item}
                  isExpanded={expandedItems.has(item.$id)}
                  onToggle={toggleExpanded}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Add to Watchlist
          </button>
        </div>
      </div>

      {/* Desktop version placeholder */}
      <div className="hidden lg:block p-8">
        <h1 className="text-2xl font-bold mb-4">Watchlist Sidebar Demo</h1>
        <p className="text-muted-foreground">
          This is a mobile-optimized watchlist sidebar. On mobile, tap the menu button to open the sidebar.
          On desktop, the sidebar is always visible on the left.
        </p>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Features:</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Compact poster thumbnails with fallbacks</li>
            <li>• Expandable item details</li>
            <li>• Watch status badges with icons</li>
            <li>• Star ratings display</li>
            <li>• Filtering and sorting controls</li>
            <li>• Mobile-first responsive design</li>
            <li>• Search functionality</li>
            <li>• Quick stats overview</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileSidebarWatchlist;