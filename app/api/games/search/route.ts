'use server'
import { NextRequest, NextResponse } from 'next/server';
import { igdbService } from '@/lib/services/igdbService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10') || 10, 1), 50);
  const offset = Math.min(Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0), 500);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Check if IGDB is configured
  if (!igdbService.isConfigured()) {
    return NextResponse.json(
      { error: 'IGDB is not configured. Please add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to environment variables.' },
      { status: 503 }
    );
  }

  try {
    const results = await igdbService.searchGames(query, limit, offset);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Game search error:', error);
    return NextResponse.json(
      { error: 'Failed to search games' },
      { status: 500 }
    );
  }
}
