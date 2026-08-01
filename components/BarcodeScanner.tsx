'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SafeIcon from '@/components/SafeIcon'
import { Camera, Loader2, Keyboard, ScanBarcode, Focus } from 'lucide-react'
import { toast } from 'sonner'
import { barcodeService } from '@/lib/services/barcodeService'
import { BarcodeLookupResult } from '@/types/physical'

interface BarcodeScannerProps {
  onScanResult: (result: BarcodeLookupResult) => void;
  onClose?: () => void;
}

const BarcodeScanner = ({ onScanResult, onClose }: BarcodeScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const scannerRef = useRef<any>(null);
  const html5QrcodeRef = useRef<any>(null);
  const hasProcessedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle successful barcode scan
  const handleScan = useCallback(async (barcode: string) => {
    // Prevent double-processing
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    // Stop scanning
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore
      }
      setIsScanning(false);
    }

    setIsLoading(true);

    try {
      // Basic validation - just check it's numeric and reasonable length
      const cleaned = barcode.replace(/[\s-]/g, '');
      if (!/^\d{8,14}$/.test(cleaned)) {
        toast.error('Invalid barcode format. Expected 8-14 digits.');
        hasProcessedRef.current = false;
        setIsLoading(false);
        return;
      }

      toast.success(`Scanned: ${cleaned}`);

      // Lookup barcode
      const result = await barcodeService.lookupBarcode(cleaned);

      if (result.found) {
        // Try to find TMDB match
        if (result.title) {
          const tmdbResult = await barcodeService.searchTMDBByTitle(
            result.title,
            result.year
          );
          if (tmdbResult.tmdb_id) {
            result.tmdb_id = tmdbResult.tmdb_id;
            result.tmdb_type = tmdbResult.tmdb_type;
            if (tmdbResult.poster_url) {
              result.poster_url = tmdbResult.poster_url;
            }
          }
        }
        toast.success(`Found: ${result.title}`);
      } else {
        toast.info('Barcode not found in database. You can enter details manually.');
      }

      onScanResult(result);
    } catch (error) {
      console.error('Barcode lookup error:', error);
      toast.error('Failed to lookup barcode');
      // Still return the barcode so user can enter details manually
      onScanResult({ found: false, barcode });
    } finally {
      setIsLoading(false);
    }
  }, [onScanResult]);

  // Initialize scanner
  const startScanning = useCallback(async () => {
    if (!html5QrcodeRef.current || isScanning) return;

    const { Html5Qrcode, Html5QrcodeSupportedFormats } = html5QrcodeRef.current;

    try {
      // Check for camera support
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        setScannerError('No camera found. Please use manual entry.');
        setManualMode(true);
        return;
      }

      const scannerId = 'barcode-reader';

      // Clean up existing scanner if any
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      // Create scanner instance with barcode formats
      scannerRef.current = new Html5Qrcode(scannerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      });

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 100 },
        aspectRatio: 1.5,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scan errors - they happen every frame when no barcode is found
        }
      );

      setIsScanning(true);
      setScannerError(null);

      // Store reference to video element for capture
      setTimeout(() => {
        const video = document.querySelector('#barcode-reader video') as HTMLVideoElement;
        if (video) {
          videoRef.current = video;
        }
      }, 500);

    } catch (error) {
      console.error('Failed to start scanner:', error);
      setScannerError('Camera access denied. Please use manual entry.');
      setManualMode(true);
    }
  }, [handleScan, isScanning]);

  // Load html5-qrcode and start scanner
  useEffect(() => {
    if (manualMode || isLoading) return;

    let mounted = true;

    const initScanner = async () => {
      try {
        const lib = await import('html5-qrcode');
        if (!mounted) return;

        html5QrcodeRef.current = lib;
        setScannerReady(true);

        // Auto-start scanning
        setTimeout(() => {
          if (mounted) startScanning();
        }, 300);

      } catch (error) {
        console.error('Failed to load scanner:', error);
        if (mounted) {
          setScannerError('Failed to load camera. Please use manual entry.');
          setManualMode(true);
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [manualMode, isLoading, startScanning]);

  // Capture current frame and decode
  const captureAndDecode = async () => {
    if (!scannerRef.current || !videoRef.current) {
      toast.error('Scanner not ready. Please try again.');
      return;
    }

    try {
      // Create canvas and capture frame
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Failed to capture image.');
        return;
      }

      ctx.drawImage(video, 0, 0);

      // Convert to blob and then to File
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      const file = new File([blob], 'capture.png', { type: 'image/png' });

      // Stop live scanning temporarily
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }

      // Decode from captured image
      toast.info('Analyzing captured image...');

      const result = await scannerRef.current.scanFile(file, true);
      handleScan(result);

    } catch (error: any) {
      console.error('Capture decode error:', error);
      if (error?.message?.includes('No MultiFormat Readers')) {
        toast.error('No barcode found in captured image. Try adjusting position.');
      } else {
        toast.error('No barcode detected. Try again or use manual entry.');
      }
      // Restart scanning
      hasProcessedRef.current = false;
      startScanning();
    }
  };

  // Handle manual barcode entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      hasProcessedRef.current = false;
      handleScan(manualBarcode.trim());
    }
  };

  // Stop scanning when switching modes
  const handleModeChange = async (toManual: boolean) => {
    if (toManual && scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (e) {
        // Ignore
      }
    }
    hasProcessedRef.current = false;
    setManualMode(toManual);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!manualMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            <SafeIcon icon={ScanBarcode} className="h-4 w-4 mr-2" size={16} />
            Camera
          </Button>
          <Button
            variant={manualMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange(true)}
            disabled={isLoading}
            className="flex-1"
          >
            <SafeIcon icon={Keyboard} className="h-4 w-4 mr-2" size={16} />
            Manual
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <SafeIcon icon={Loader2} className="h-8 w-8 animate-spin text-primary mb-2" size={32} />
            <p className="text-sm text-muted-foreground">Looking up barcode...</p>
          </div>
        )}

        {/* Scanner Error */}
        {scannerError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {scannerError}
          </div>
        )}

        {/* Camera Scanner */}
        {!manualMode && !isLoading && (
          <div className="space-y-4">
            <div
              id="barcode-reader"
              className="w-full rounded-lg overflow-hidden bg-black"
              style={{ minHeight: '250px' }}
            />

            {/* Scanning status */}
            {isScanning && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                <span>Scanning for barcodes...</span>
              </div>
            )}

            {/* Capture Button */}
            <Button
              onClick={captureAndDecode}
              variant="secondary"
              className="w-full"
              disabled={!isScanning || isLoading}
            >
              <SafeIcon icon={Focus} className="h-4 w-4 mr-2" size={16} />
              Capture & Scan
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Point your camera at the barcode. If auto-detection fails, tap "Capture & Scan".
            </p>
          </div>
        )}

        {/* Manual Entry */}
        {manualMode && !isLoading && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualBarcode">Enter Barcode</Label>
              <Input
                id="manualBarcode"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter UPC or EAN barcode"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the 12 or 13 digit barcode number from your disc case
              </p>
            </div>

            <Button type="submit" disabled={!manualBarcode.trim()} className="w-full">
              <SafeIcon icon={ScanBarcode} className="h-4 w-4 mr-2" size={16} />
              Lookup Barcode
            </Button>
          </form>
        )}

        {/* Close Button */}
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
