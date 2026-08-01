'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import SafeIcon from '@/components/SafeIcon'
import ImageWithFallback from '@/components/ImageWithFallback'
import Link from 'next/link'
import {
  Disc,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  MapPin,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { database } from '@/lib/appwrite'
import {
  PhysicalMediaItem,
  PhysicalMediaFormat,
  FORMAT_LABELS,
  CONDITION_LABELS,
} from '@/types/physical'

interface PhysicalLibraryGridProps {
  items: PhysicalMediaItem[];
  onRefresh: () => void;
}

// Format badge colors
const formatColors: Record<PhysicalMediaFormat, string> = {
  'bluray': 'bg-blue-500',
  'bluray_4k': 'bg-purple-500',
  'dvd': 'bg-orange-500',
  'game_disc': 'bg-green-500',
  'steelbook': 'bg-zinc-500',
  'collectors_edition': 'bg-yellow-500',
};

const PhysicalLibraryGrid = ({ items, onRefresh }: PhysicalLibraryGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'all' || item.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  // Delete item
  const handleDelete = async (item: PhysicalMediaItem) => {
    if (!item.$id) return;

    setDeletingId(item.$id);
    try {
      await database.deleteDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_PHYSICAL_MEDIA_COLLECTION_ID!,
        item.$id
      );
      toast.success(`Removed "${item.title}" from collection`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  // Get stats
  const totalItems = items.length;
  const formatCounts = items.reduce((acc, item) => {
    acc[item.format] = (acc[item.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-sm">
          <SafeIcon icon={Disc} className="h-3 w-3 mr-1" size={12} />
          {totalItems} items
        </Badge>
        {Object.entries(formatCounts).map(([format, count]) => (
          <Badge
            key={format}
            variant="secondary"
            className={`text-sm text-white ${formatColors[format as PhysicalMediaFormat]}`}
          >
            {FORMAT_LABELS[format as PhysicalMediaFormat]}: {count}
          </Badge>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon
            icon={Search}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            size={16}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your collection..."
            className="pl-10"
          />
        </div>
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SafeIcon icon={Filter} className="h-4 w-4 mr-2" size={16} />
            <SelectValue placeholder="Filter by format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <SafeIcon icon={Disc} className="h-12 w-12 mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">
              {items.length === 0 ? 'No physical media yet' : 'No matches found'}
            </h3>
            <p className="text-muted-foreground">
              {items.length === 0
                ? 'Start building your collection by scanning a barcode or adding manually.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        </Card>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredItems.map((item) => (
          <Dialog key={item.$id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer group hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden">
                <CardContent className="p-0">
                  {/* Poster */}
                  <div className="relative aspect-[2/3]">
                    {item.poster_url ? (
                      <ImageWithFallback
                        src={item.poster_url}
                        alt={item.title}
                        width={200}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <SafeIcon icon={Disc} className="h-8 w-8 text-muted-foreground" size={32} />
                      </div>
                    )}

                    {/* Format Badge */}
                    <Badge
                      className={`absolute top-2 right-2 text-xs text-white ${formatColors[item.format]}`}
                    >
                      {FORMAT_LABELS[item.format]}
                    </Badge>

                    {/* Box Set Badge */}
                    {item.is_box_set && (
                      <Badge className="absolute top-2 left-2 text-xs bg-background/90">
                        <SafeIcon icon={Package} className="h-3 w-3 mr-1" size={12} />
                        Set
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <div className="p-2">
                    <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                    {item.edition && (
                      <p className="text-xs text-muted-foreground truncate">{item.edition}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            {/* Detail Dialog */}
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{item.title}</DialogTitle>
                <DialogDescription>
                  {FORMAT_LABELS[item.format]}
                  {item.edition && ` - ${item.edition}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Poster */}
                {item.poster_url && (
                  <div className="flex justify-center">
                    <ImageWithFallback
                      src={item.poster_url}
                      alt={item.title}
                      width={150}
                      height={225}
                      className="rounded-lg"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{CONDITION_LABELS[item.condition]}</Badge>
                    {item.region_code && (
                      <Badge variant="outline">Region {item.region_code}</Badge>
                    )}
                    {item.disc_count && item.disc_count > 1 && (
                      <Badge variant="outline">{item.disc_count} discs</Badge>
                    )}
                  </div>

                  {/* Purchase Info */}
                  {(item.purchase_date || item.purchase_price || item.purchase_location) && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {item.purchase_date && (
                        <div className="flex items-center gap-2">
                          <SafeIcon icon={Calendar} className="h-4 w-4" size={16} />
                          <span>Purchased: {new Date(item.purchase_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.purchase_price && (
                        <div className="flex items-center gap-2">
                          <SafeIcon icon={DollarSign} className="h-4 w-4" size={16} />
                          <span>${item.purchase_price.toFixed(2)}</span>
                        </div>
                      )}
                      {item.purchase_location && (
                        <div className="flex items-center gap-2">
                          <SafeIcon icon={MapPin} className="h-4 w-4" size={16} />
                          <span>{item.purchase_location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Barcode */}
                  {item.barcode && (
                    <p className="text-xs text-muted-foreground font-mono">
                      UPC: {item.barcode}
                    </p>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Link to TMDB/IGDB */}
                  {item.tmdb_id && item.tmdb_type && (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/${item.tmdb_type}/${item.tmdb_id}`}>
                        <SafeIcon icon={ExternalLink} className="h-4 w-4 mr-2" size={16} />
                        View Details
                      </Link>
                    </Button>
                  )}

                  {/* Delete */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === item.$id}
                      >
                        <SafeIcon icon={Trash2} className="h-4 w-4" size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete from collection?</DialogTitle>
                        <DialogDescription>
                          This will remove &quot;{item.title}&quot; from your physical media collection.
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={() => handleDelete(item)}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default PhysicalLibraryGrid;
