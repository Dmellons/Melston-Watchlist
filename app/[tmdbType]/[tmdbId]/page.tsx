'use server'

import AddWatchlistButton from '@/components/buttons/AddWatchlistButton';
import BackButton from '@/components/buttons/BackButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TMDBApiMovieDetail } from '@/lib/tmdb';
import { tmdbFetchOptions } from '@/lib/tmdb';
import { TMDBMultiSearchResult } from '@/types/tmdbApi';
import Image from 'next/image';
import Link from 'next/link';

interface DetailPageProps {

  params: {
    tmdbType: string;
    tmdbId: string;
  }
}

export const DetailPage = async ({ params }: DetailPageProps) => {
  const { tmdbType, tmdbId } = params;

  console.log({ tmdbType, tmdbId })
  const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?append_to_response=credits&language=en-US`;
  const response = await fetch(url, tmdbFetchOptions);
  const data: TMDBApiMovieDetail = await response.json();
  console.log({ data })

  const addButtonData: Partial<TMDBMultiSearchResult> = {
    id: data.id,
    title: data.title,
    poster_path: data.poster_path
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <BackButton />
          <Image
            src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
            alt={data.title}
            className="w-full rounded-lg shadow-md"
            width={500}
            height={500}
          />
          <div className="absolute bottom-0 left-0 p-2">
            <p className="text-white text-xs font-bold bg-black bg-opacity-70 rounded-b-lg px-1">
              Release Date: {data.release_date}
            </p>
          </div>
        </div>
        <div className="space-y-4 sm:mt-10">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-gray-700">{data.tagline}</p>
          <p>{data.overview}</p>
          {data.vote_average > 0 && (
            <p>Score: {data.vote_average.toFixed(1)}/10 <span className="text-foreground/20 text-xs">({data.vote_count} votes)</span></p>
          )}
          {
            data.genres?.length > 0 ? (
              <p>Genres: {data.genres.map((genre) => genre.name).join(', ')}</p>
            ) : (
              <p>No genres available</p>
            )
          }

          <p>Language: {data.original_language}</p>
          <p>Revenue: ${data.revenue}</p>
          <p>Budget: ${data.budget}</p>

          <p>Status: {data.status}</p>

          <p>Runtime: {data.runtime} minutes</p>


          <div className="p-4 text-center sm:text-left">

            <h3 className="text-lg font-bold">External Links</h3>
            <div className="flex divide-x justify-center sm:justify-normal">

              <Button
                variant={"link"}
                asChild
              >

                <Link
                  href={`https://www.imdb.com/title/${data.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IMDB
                </Link>
              </Button>
              <Button
                variant={"link"}
                asChild
              >

                <Link
                  href={data.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Homepage
                </Link>
              </Button>
            </div>
          </div>
          <Accordion type='single' collapsible className=''>
            {
              data.production_countries?.length > 0 ? (


                <AccordionItem value={'Production Countries'} className='w-full sm:w-fit'>
                  <AccordionTrigger className='text-center justify-center sm:justify-start'>
                    <h3 className="text-lg font-bold text-center sm:text-left mr-2">Production Countries:</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='sm:mr-4'>
                      {data.production_countries?.map(country => (
                        <div className="text-sm text-center sm:ml-4 sm:text-left" key={country.iso_3166_1}>{country.name}</div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div>No production countries available</div>
              )
            }
            {
              data.production_companies?.length > 0 ? (

                <AccordionItem value={'Production Companies'} className='w-full sm:w-fit'>
                  <AccordionTrigger className='text-center justify-center sm:justify-start'>
                    <h3 className="text-lg font-bold text-center sm:text-left mr-2">Production Companies:</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='sm:mr-4'>
                      {data.production_companies.map(company => (
                        <div className="text-sm text-center sm:ml-4 sm:text-left" key={company.id}>{company.name}</div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div>No production companies available</div>
              )
            }
          </Accordion>
          {/* <Accordion type='single' collapsible className=''>
            <AccordionItem value={'Production Countries'} className='w-full sm:w-fit'>
              <AccordionTrigger className='text-center justify-center sm:justify-start'>
                <h3 className="text-lg font-bold text-center sm:text-left mr-2">Production Companies:</h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className='sm:mr-4'>
                  {data.production_companies.map(company => (
                    <div className="text-sm text-center sm:ml-4 sm:text-left" key={company.id}>{company.name}</div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion> */}
          <div className="hidden">

            <AddWatchlistButton
              media={addButtonData}
              tmdbId={tmdbId}
              width=""
              query
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default DetailPage;


