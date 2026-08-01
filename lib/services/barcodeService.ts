// lib/services/barcodeService.ts - Barcode lookup service for physical media

import { BarcodeLookupResult, PhysicalMediaFormat } from '@/types/physical';

interface UPCItemDBResponse {
  code: string;
  total: number;
  offset: number;
  items?: Array<{
    ean: string;
    title: string;
    description?: string;
    upc: string;
    brand?: string;
    model?: string;
    category?: string;
    images?: string[];
  }>;
}

class BarcodeService {
  private baseUrl = 'https://api.upcitemdb.com/prod/trial/lookup';

  /**
   * Check if barcode service is configured
   * UPCitemdb trial API doesn't require a key, but has rate limits
   */
  isConfigured(): boolean {
    return true; // Trial API is always available
  }

  /**
   * Lookup a barcode using server-side API route
   */
  async lookupBarcode(barcode: string): Promise<BarcodeLookupResult> {
    if (!barcode || barcode.length < 10) {
      return { found: false, barcode };
    }

    try {
      const response = await fetch(`/api/physical/barcode-lookup?barcode=${barcode}`);

      if (!response.ok) {
        console.error('Barcode lookup failed:', response.status);
        return { found: false, barcode };
      }

      const data = await response.json();

      if (!data.found) {
        return { found: false, barcode };
      }

      const format = this.detectFormat(data.title || '', data.category);
      const year = this.extractYear(data.title || '');

      return {
        found: true,
        barcode,
        title: this.cleanTitle(data.title || ''),
        format,
        year,
        poster_url: data.images?.[0],
        raw_data: data.raw_data,
      };
    } catch (error) {
      console.error('Barcode lookup error:', error);
      return { found: false, barcode };
    }
  }

  /**
   * Detect media format from title and category
   */
  private detectFormat(title: string, category?: string): PhysicalMediaFormat {
    const lowerTitle = title.toLowerCase();
    const lowerCategory = category?.toLowerCase() || '';

    if (lowerTitle.includes('4k') || lowerTitle.includes('uhd')) {
      return 'bluray_4k';
    }
    if (lowerTitle.includes('blu-ray') || lowerTitle.includes('bluray') || lowerTitle.includes('blu ray')) {
      return 'bluray';
    }
    if (lowerTitle.includes('steelbook')) {
      return 'steelbook';
    }
    if (lowerTitle.includes('collector') || lowerTitle.includes('limited edition')) {
      return 'collectors_edition';
    }
    if (lowerCategory.includes('video game') || lowerCategory.includes('game')) {
      return 'game_disc';
    }
    if (lowerTitle.includes('dvd')) {
      return 'dvd';
    }

    // Default based on category
    if (lowerCategory.includes('blu')) {
      return 'bluray';
    }

    return 'bluray'; // Default assumption for movies
  }

  /**
   * Extract year from title if present
   */
  private extractYear(title: string): number | undefined {
    const yearMatch = title.match(/\((\d{4})\)/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 1900 && year <= new Date().getFullYear() + 1) {
        return year;
      }
    }
    return undefined;
  }

  /**
   * Clean up title by removing format indicators
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/\[.*?\]/g, '') // Remove brackets
      .replace(/\(.*?\)/g, '') // Remove parentheses
      .replace(/blu-ray|bluray|blu ray|4k|uhd|dvd|steelbook/gi, '')
      .replace(/collector'?s? edition|limited edition|special edition/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Search TMDB by title to link physical media
   * This should be called after barcode lookup to get TMDB ID
   */
  async searchTMDBByTitle(title: string, year?: number): Promise<{ tmdb_id?: number; tmdb_type?: 'movie' | 'tv'; poster_url?: string }> {
    try {
      const yearQuery = year ? `&year=${year}` : '';
      const response = await fetch(
        `/api/physical/tmdb-search?title=${encodeURIComponent(title)}${yearQuery}`
      );

      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TMDB search error:', error);
      return {};
    }
  }

  /**
   * Validate barcode format (UPC-A, EAN-13, etc.)
   */
  validateBarcode(barcode: string): boolean {
    // Remove spaces and dashes
    const cleaned = barcode.replace(/[\s-]/g, '');

    // UPC-A is 12 digits, EAN-13 is 13 digits
    if (!/^\d{12,13}$/.test(cleaned)) {
      return false;
    }

    // Validate check digit
    return this.validateCheckDigit(cleaned);
  }

  /**
   * Validate UPC/EAN check digit
   */
  private validateCheckDigit(barcode: string): boolean {
    const digits = barcode.split('').map(Number);
    const checkDigit = digits.pop()!;

    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      // For EAN-13/UPC-A: odd positions * 1, even positions * 3 (from right)
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const calculatedCheck = (10 - (sum % 10)) % 10;
    return calculatedCheck === checkDigit;
  }

  /**
   * Format barcode for display
   */
  formatBarcode(barcode: string): string {
    const cleaned = barcode.replace(/[\s-]/g, '');
    if (cleaned.length === 12) {
      // UPC-A: X-XXXXX-XXXXX-X
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 6)}-${cleaned.slice(6, 11)}-${cleaned.slice(11)}`;
    }
    if (cleaned.length === 13) {
      // EAN-13: X-XXXXXX-XXXXXX
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 7)}-${cleaned.slice(7)}`;
    }
    return barcode;
  }
}

export const barcodeService = new BarcodeService();
