'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import SafeIcon from '@/components/SafeIcon'
import ImageWithFallback from '@/components/ImageWithFallback'
import { Loader2, Save, X, Link as LinkIcon, Search } from 'lucide-react'
import { toast } from 'sonner'
import { database, ID } from '@/lib/appwrite'
import { useUser } from '@/hooks/User'
import {
  PhysicalMediaFormData,
  PhysicalMediaFormat,
  MediaCondition,
  FORMAT_LABELS,
  CONDITION_LABELS,
  BLURAY_REGIONS,
  DVD_REGIONS,
  BarcodeLookupResult,
} from '@/types/physical'
import { barcodeService } from '@/lib/services/barcodeService'

interface PhysicalMediaFormProps {
  initialData?: Partial<PhysicalMediaFormData>;
  /** When set, the form updates this existing document instead of creating one. */
  editItemId?: string;
  barcodeData?: BarcodeLookupResult;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PhysicalMediaForm = ({
  initialData,
  editItemId,
  barcodeData,
  onSuccess,
  onCancel,
}: PhysicalMediaFormProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);

  // Form state
  const [title, setTitle] = useState(initialData?.title || barcodeData?.title || '');
  const [format, setFormat] = useState<PhysicalMediaFormat>(
    initialData?.format || barcodeData?.format || 'bluray'
  );
  const [barcode, setBarcode] = useState(initialData?.barcode || barcodeData?.barcode || '');
  const [edition, setEdition] = useState(initialData?.edition || '');
  const [condition, setCondition] = useState<MediaCondition>(initialData?.condition || 'good');
  const [regionCode, setRegionCode] = useState(initialData?.region_code || '');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchase_date || '');
  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialData?.purchase_price?.toString() || ''
  );
  const [purchaseLocation, setPurchaseLocation] = useState(initialData?.purchase_location || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isBoxSet, setIsBoxSet] = useState(initialData?.is_box_set || false);
  const [discCount, setDiscCount] = useState<string>(initialData?.disc_count?.toString() || '1');

  // Linked media
  const [tmdbId, setTmdbId] = useState<number | undefined>(
    initialData?.tmdb_id || barcodeData?.tmdb_id
  );
  const [tmdbType, setTmdbType] = useState<'movie' | 'tv' | undefined>(
    initialData?.tmdb_type || barcodeData?.tmdb_type
  );
  const [posterUrl, setPosterUrl] = useState<string | undefined>(
    initialData?.poster_url || barcodeData?.poster_url
  );

  // Update form when barcodeData changes
  useEffect(() => {
    if (barcodeData) {
      if (barcodeData.title) setTitle(barcodeData.title);
      if (barcodeData.format) setFormat(barcodeData.format);
      if (barcodeData.barcode) setBarcode(barcodeData.barcode);
      if (barcodeData.tmdb_id) setTmdbId(barcodeData.tmdb_id);
      if (barcodeData.tmdb_type) setTmdbType(barcodeData.tmdb_type);
      if (barcodeData.poster_url) setPosterUrl(barcodeData.poster_url);
    }
  }, [barcodeData]);

  // Get region options based on format
  const regionOptions = format === 'dvd' ? DVD_REGIONS : BLURAY_REGIONS;

  // Search TMDB to link media
  const handleSearchTMDB = async () => {
    if (!title.trim()) {
      toast.error('Enter a title first');
      return;
    }

    setIsSearchingTMDB(true);
    try {
      const result = await barcodeService.searchTMDBByTitle(title);
      if (result.tmdb_id) {
        setTmdbId(result.tmdb_id);
        setTmdbType(result.tmdb_type);
        setPosterUrl(result.poster_url);
        toast.success('Found matching title on TMDB');
      } else {
        toast.info('No match found on TMDB');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearchingTMDB(false);
    }
  };

  // Clear linked media
  const handleClearLink = () => {
    setTmdbId(undefined);
    setTmdbType(undefined);
    setPosterUrl(undefined);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsLoading(true);

    try {
      const physicalMediaData = {
        title: title.trim(),
        format,
        barcode: barcode || null,
        tmdb_id: tmdbId || null,
        tmdb_type: tmdbType || null,
        edition: edition || null,
        condition,
        region_code: regionCode || null,
        purchase_date: purchaseDate || null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        purchase_location: purchaseLocation || null,
        poster_url: posterUrl || null,
        notes: notes || null,
        is_box_set: isBoxSet,
        disc_count: parseInt(discCount) || 1,
      };

      if (editItemId) {
        await database.updateDocument(
          'watchlist',
          process.env.NEXT_PUBLIC_APPWRITE_PHYSICAL_MEDIA_COLLECTION_ID!,
          editItemId,
          physicalMediaData
        );
        toast.success(`Updated "${title}"`);
      } else {
        await database.createDocument(
          'watchlist',
          process.env.NEXT_PUBLIC_APPWRITE_PHYSICAL_MEDIA_COLLECTION_ID!,
          ID.unique(),
          physicalMediaData,
          [
            'read("any")',
            `update("user:${user.id}")`,
            `delete("user:${user.id}")`,
          ]
        );
        toast.success(`Added "${title}" to your physical library!`);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving physical media:', error);
      toast.error(editItemId ? 'Failed to update physical media' : 'Failed to add physical media');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editItemId ? 'Edit Physical Media' : 'Add Physical Media'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poster and Basic Info Row */}
          <div className="flex gap-6">
            {/* Poster Preview */}
            <div className="flex-shrink-0">
              {posterUrl ? (
                <ImageWithFallback
                  src={posterUrl}
                  alt={title || 'Cover'}
                  width={120}
                  height={180}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-[120px] h-[180px] bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-xs text-center px-2">
                    No Image
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <div className="flex gap-2">
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSearchTMDB}
                    disabled={isSearchingTMDB || !title.trim()}
                    title="Search TMDB to link"
                  >
                    {isSearchingTMDB ? (
                      <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                    ) : (
                      <SafeIcon icon={Search} className="h-4 w-4" size={16} />
                    )}
                  </Button>
                </div>
              </div>

              {/* Linked Media Badge */}
              {tmdbId && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <SafeIcon icon={LinkIcon} className="h-3 w-3" size={12} />
                    Linked to TMDB ({tmdbType}: {tmdbId})
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLink}
                    className="h-6 w-6 p-0"
                  >
                    <SafeIcon icon={X} className="h-3 w-3" size={12} />
                  </Button>
                </div>
              )}

              {/* Format and Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as PhysicalMediaFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as MediaCondition)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="UPC/EAN"
              />
            </div>

            {/* Edition */}
            <div className="space-y-2">
              <Label htmlFor="edition">Edition</Label>
              <Input
                id="edition"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="e.g., Criterion, Steelbook"
              />
            </div>

            {/* Region Code */}
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={regionCode} onValueChange={setRegionCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disc Count */}
            <div className="space-y-2">
              <Label htmlFor="discCount">Disc Count</Label>
              <Input
                id="discCount"
                type="number"
                min="1"
                value={discCount}
                onChange={(e) => setDiscCount(e.target.value)}
              />
            </div>
          </div>

          {/* Purchase Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseLocation">Location</Label>
              <Input
                id="purchaseLocation"
                value={purchaseLocation}
                onChange={(e) => setPurchaseLocation(e.target.value)}
                placeholder="e.g., Amazon, Best Buy"
              />
            </div>
          </div>

          {/* Box Set Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="boxSet"
              checked={isBoxSet}
              onCheckedChange={(checked) => setIsBoxSet(checked as boolean)}
            />
            <Label htmlFor="boxSet" className="cursor-pointer">
              This is a box set / collection
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? (
                <>
                  <SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={Save} className="h-4 w-4 mr-2" size={16} />
                  Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default PhysicalMediaForm;
