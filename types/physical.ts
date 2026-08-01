// types/physical.ts - Types for physical media library

// Physical media formats
export type PhysicalMediaFormat =
  | 'bluray'
  | 'bluray_4k'
  | 'dvd'
  | 'game_disc'
  | 'steelbook'
  | 'collectors_edition';

// Condition of physical media
export type MediaCondition =
  | 'mint'       // Perfect, like new
  | 'excellent'  // Minor wear, no damage
  | 'good'       // Some wear, fully functional
  | 'fair'       // Noticeable wear, works
  | 'poor';      // Heavy wear, may have issues

// Physical media item
export interface PhysicalMediaItem {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;

  // Basic info
  title: string;
  format: PhysicalMediaFormat;
  barcode?: string;

  // Linked media (optional - can link to existing watchlist items)
  tmdb_id?: number;
  tmdb_type?: 'movie' | 'tv';
  igdb_id?: number;

  // Physical details
  edition?: string;           // "Collector's Edition", "Criterion", etc.
  condition: MediaCondition;
  region_code?: string;       // "A", "B", "C" for Blu-ray, "1-6" for DVD

  // Collection info
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;

  // Media info
  poster_url?: string;
  release_year?: number;

  // Notes
  notes?: string;

  // For box sets
  is_box_set?: boolean;
  disc_count?: number;
}

// Form data for creating/editing physical media
export interface PhysicalMediaFormData {
  title: string;
  format: PhysicalMediaFormat;
  barcode?: string;
  tmdb_id?: number;
  tmdb_type?: 'movie' | 'tv';
  igdb_id?: number;
  edition?: string;
  condition: MediaCondition;
  region_code?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  poster_url?: string;
  notes?: string;
  is_box_set?: boolean;
  disc_count?: number;
}

// Barcode lookup result
export interface BarcodeLookupResult {
  found: boolean;
  barcode: string;
  title?: string;
  format?: PhysicalMediaFormat;
  year?: number;
  poster_url?: string;
  // If we can match to TMDB/IGDB
  tmdb_id?: number;
  tmdb_type?: 'movie' | 'tv';
  igdb_id?: number;
  // Raw data from barcode API
  raw_data?: Record<string, any>;
}

// Format display names
export const FORMAT_LABELS: Record<PhysicalMediaFormat, string> = {
  'bluray': 'Blu-ray',
  'bluray_4k': '4K UHD Blu-ray',
  'dvd': 'DVD',
  'game_disc': 'Game Disc',
  'steelbook': 'Steelbook',
  'collectors_edition': "Collector's Edition",
};

// Condition display names
export const CONDITION_LABELS: Record<MediaCondition, string> = {
  'mint': 'Mint',
  'excellent': 'Excellent',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
};

// Region codes for Blu-ray
export const BLURAY_REGIONS = [
  { code: 'A', label: 'Region A (Americas, East Asia)' },
  { code: 'B', label: 'Region B (Europe, Africa, Oceania)' },
  { code: 'C', label: 'Region C (Central/South Asia, China, Russia)' },
  { code: 'ABC', label: 'Region Free' },
];

// Region codes for DVD
export const DVD_REGIONS = [
  { code: '1', label: 'Region 1 (US, Canada)' },
  { code: '2', label: 'Region 2 (Europe, Japan, Middle East)' },
  { code: '3', label: 'Region 3 (East Asia)' },
  { code: '4', label: 'Region 4 (Australia, Latin America)' },
  { code: '5', label: 'Region 5 (Africa, Russia, India)' },
  { code: '6', label: 'Region 6 (China)' },
  { code: '0', label: 'Region Free' },
];
