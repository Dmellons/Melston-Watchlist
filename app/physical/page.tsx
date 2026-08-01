'use client'
import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/hooks/User'
import { database } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SafeIcon from '@/components/SafeIcon'
import { Disc, Plus, ScanBarcode, PenLine, Loader2 } from 'lucide-react'
import PhysicalMediaForm from '@/components/PhysicalMediaForm'
import BarcodeScanner from '@/components/BarcodeScanner'
import PhysicalLibraryGrid from '@/components/PhysicalLibraryGrid'
import { PhysicalMediaItem, PhysicalMediaFormData, BarcodeLookupResult } from '@/types/physical'
import Link from 'next/link'

type AddMode = 'none' | 'scan' | 'manual';

export default function PhysicalLibraryPage() {
  const { user, loading: userLoading } = useUser();
  const [items, setItems] = useState<PhysicalMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState<AddMode>('none');
  const [scannedData, setScannedData] = useState<BarcodeLookupResult | undefined>();
  const [editItem, setEditItem] = useState<PhysicalMediaItem | null>(null);

  // Fetch physical media collection
  const fetchItems = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await database.listDocuments(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_PHYSICAL_MEDIA_COLLECTION_ID!,
        [Query.orderDesc('$createdAt'), Query.limit(500)]
      );

      setItems(response.documents as unknown as PhysicalMediaItem[]);
    } catch (error) {
      console.error('Error fetching physical media:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

  // Handle barcode scan result
  const handleScanResult = (result: BarcodeLookupResult) => {
    setScannedData(result);
    setAddMode('manual'); // Switch to manual form with scanned data
  };

  // Handle form success
  const handleFormSuccess = () => {
    setAddMode('none');
    setScannedData(undefined);
    setEditItem(null);
    fetchItems();
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setAddMode('none');
    setScannedData(undefined);
    setEditItem(null);
  };

  // Open the form pre-filled with an existing item (the form card is at the top of the page)
  const handleEdit = (item: PhysicalMediaItem) => {
    setAddMode('none');
    setScannedData(undefined);
    setEditItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Map a stored document onto the form's shape (null -> undefined, date -> YYYY-MM-DD)
  const editInitialData: Partial<PhysicalMediaFormData> | undefined = editItem ? {
    title: editItem.title,
    format: editItem.format,
    barcode: editItem.barcode ?? undefined,
    tmdb_id: editItem.tmdb_id ?? undefined,
    tmdb_type: editItem.tmdb_type ?? undefined,
    edition: editItem.edition ?? undefined,
    condition: editItem.condition,
    region_code: editItem.region_code ?? undefined,
    purchase_date: editItem.purchase_date ? editItem.purchase_date.slice(0, 10) : undefined,
    purchase_price: editItem.purchase_price ?? undefined,
    purchase_location: editItem.purchase_location ?? undefined,
    poster_url: editItem.poster_url ?? undefined,
    notes: editItem.notes ?? undefined,
    is_box_set: editItem.is_box_set,
    disc_count: editItem.disc_count ?? undefined,
  } : undefined;

  // Not logged in
  if (!userLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <SafeIcon icon={Disc} className="h-12 w-12 mx-auto text-muted-foreground" size={48} />
            <h2 className="text-xl font-bold">Sign in to view your collection</h2>
            <p className="text-muted-foreground">
              Track your Blu-rays, DVDs, and physical games in one place.
            </p>
            <Button asChild>
              <Link href="/">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SafeIcon icon={Disc} className="h-8 w-8" size={32} />
            Physical Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your Blu-rays, DVDs, and physical game collection
          </p>
        </div>

        {/* Add Buttons */}
        {addMode === 'none' && !editItem && (
          <div className="flex gap-2">
            <Button onClick={() => setAddMode('scan')} variant="outline">
              <SafeIcon icon={ScanBarcode} className="h-4 w-4 mr-2" size={16} />
              Scan Barcode
            </Button>
            <Button onClick={() => setAddMode('manual')}>
              <SafeIcon icon={Plus} className="h-4 w-4 mr-2" size={16} />
              Add Manually
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Mode UI */}
      {(addMode !== 'none' || editItem) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {addMode === 'scan' ? (
                <>
                  <SafeIcon icon={ScanBarcode} className="h-5 w-5" size={20} />
                  Scan Barcode
                </>
              ) : (
                <>
                  <SafeIcon icon={PenLine} className="h-5 w-5" size={20} />
                  {editItem ? 'Edit Physical Media' : 'Add Physical Media'}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addMode === 'scan' ? (
              <BarcodeScanner
                onScanResult={handleScanResult}
                onClose={handleFormCancel}
              />
            ) : (
              <PhysicalMediaForm
                key={editItem?.$id ?? 'add'}
                initialData={editInitialData}
                editItemId={editItem?.$id}
                barcodeData={scannedData}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <SafeIcon icon={Loader2} className="h-8 w-8 animate-spin text-primary" size={32} />
        </div>
      )}

      {/* Collection Grid */}
      {!loading && (
        <PhysicalLibraryGrid items={items} onRefresh={fetchItems} onEdit={handleEdit} />
      )}
    </div>
  );
}
