'use server'

import AddWatchlistButton from '@/components/buttons/AddWatchlistButton';
import BackButton from '@/components/buttons/BackButton';
import { TMDBApiMovieDetail } from '@/lib/tmdb';
import { tmdbFetchOptions } from '@/lib/tmdb';
import { TMDBMultiSearchResult } from '@/types/tmdbApi';
import Image from 'next/image';

interface DetailPageProps {

  params: {
    tmdbType: string;
    tmdbId: string;
  }
}

export const DetailPage = async ({ params }: DetailPageProps) => {
  const { tmdbType, tmdbId } = params;

  console.log({ tmdbType, tmdbId })
  const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?language=en-US`;
  const response = await fetch(url, tmdbFetchOptions);
  const data: TMDBApiMovieDetail = await response.json();
  console.log({ data })
  
  const addButtonData:TMDBMovieSearchResult = {
    id: data.id,
    title: data.title,
    poster_path: data.poster_path
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row">
      <div className="md:w-1/2 md:mr-4">
      <BackButton />
        <Image 
          src={`https://image.tmdb.org/t/p/w500${data.poster_path}`} 
          alt={data.title} 
          className="w-full" 
          width={500} 
          height={500}
          />
        <p className="text-center text-sm text-gray-500 mt-4">Release Date: {data.release_date}</p>
      </div>
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="text-md italic text-gray-600 mt-2">{data.tagline}</p>
        <p className="text-md mt-4">{data.overview}</p>
        <p className="text-md mt-4">Genres: {data.genres.map(genre => genre.name).join(', ')}</p>
        <p className="text-md mt-4">Status: {data.status}</p>
        <p className="text-md mt-4">Average Vote: {data.vote_average}</p>
        <p className="text-md mt-4">Vote Count: {data.vote_count}</p>
        <p className="text-md mt-4">Budget: ${data.budget}</p>
        <p className="text-md mt-4">Revenue: ${data.revenue}</p>
        <p className="text-md mt-4">Runtime: {data.runtime} minutes</p>
        <p className="text-md mt-4">IMDB ID: {data.imdb_id}</p>
        <p className="text-md mt-4">Homepage: <a href={data.homepage} target="_blank" rel="noopener noreferrer">{data.homepage}</a></p>
      <AddWatchlistButton
       media={addButtonData}  tmdbId={tmdbId} width='hidden' />
      </div>
    </div>
  );
};


export default DetailPage;


