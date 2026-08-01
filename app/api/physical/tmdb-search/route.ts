'use server'
import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title');
  const year = searchParams.get('year');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  if (!TMDB_API_TOKEN) {
    return NextResponse.json({ error: 'TMDB not configured' }, { status: 503 });
  }

  try {
    // Search for movies first
    const yearQuery = year ? `&year=${year}` : '';
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}${yearQuery}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_API_TOKEN}`,
        },
      }
    );

    if (!movieResponse.ok) {
      throw new Error(`TMDB API error: ${movieResponse.status}`);
    }

    const movieData = await movieResponse.json();

    if (movieData.results && movieData.results.length > 0) {
      const movie = movieData.results[0];
      return NextResponse.json({
        tmdb_id: movie.id,
        tmdb_type: 'movie',
        title: movie.title,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      });
    }

    // If no movie found, try TV shows
    const tvResponse = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_API_TOKEN}`,
        },
      }
    );

    if (!tvResponse.ok) {
      throw new Error(`TMDB API error: ${tvResponse.status}`);
    }

    const tvData = await tvResponse.json();

    if (tvData.results && tvData.results.length > 0) {
      const show = tvData.results[0];
      return NextResponse.json({
        tmdb_id: show.id,
        tmdb_type: 'tv',
        title: show.name,
        poster_url: show.poster_path
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
          : null,
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      });
    }

    // No results found
    return NextResponse.json({});
  } catch (error) {
    console.error('TMDB search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
