'use server'
import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('barcode');

  if (!barcode || barcode.length < 10) {
    return NextResponse.json({ found: false, barcode: barcode || '' });
  }

  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Watchlist App',
        },
      }
    );

    if (!response.ok) {
      console.error('UPCitemdb API error:', response.status);
      return NextResponse.json({ found: false, barcode });
    }

    const data: UPCItemDBResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ found: false, barcode });
    }

    const item = data.items[0];

    return NextResponse.json({
      found: true,
      barcode,
      title: item.title,
      category: item.category,
      images: item.images,
      raw_data: item,
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      { found: false, barcode, error: 'Lookup failed' },
      { status: 500 }
    );
  }
}
