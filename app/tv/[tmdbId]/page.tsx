import CastAndCrew from '@/components/CastAndCrew';
import ProvidersBlock from '@/components/ProvidersBlock';
import AddWatchlistButton from '@/components/buttons/AddWatchlistButton';
import BackButton from '@/components/buttons/BackButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TMDBApiMovieDetail, TMDBApiTvDetail } from '@/lib/tmdb';
import { tmdbFetchOptions } from '@/lib/tmdb';
import { TMDBMultiSearchResult } from '@/types/tmdbApi';
import Image from 'next/image';
import Link from 'next/link';

interface DetailPageProps {

  params: {
    tmdbId: string;
  }
}

export const DetailPage = async ({ params }: DetailPageProps) => {
  const { tmdbId } = params;
  const tmdbType = 'tv'

  console.log({ tmdbType, tmdbId })
  const url = `https://api.themoviedb.org/3/tv/${tmdbId}?append_to_response=credits&language=en-US`;
  const response = await fetch(url, tmdbFetchOptions);
  const data: TMDBApiTvDetail = await response.json();
  console.log({ data })

  const addButtonData: Partial<TMDBMultiSearchResult> = {
    id: data.id,
    title: data.name,
    poster_path: data.poster_path
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <BackButton />
          <Image
            src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
            alt={data.name}
            className="w-full rounded-lg shadow-md"
            width={500}
            height={500}
          />
          {/* <div className="absolute bottom-0 left-0 p-2">
            <p className="text-white text-xs font-bold bg-black bg-opacity-70 rounded-b-lg px-1">
              Release Date: {data.release_date}
            </p>
          </div> */}
        </div>
        <div className="space-y-4 sm:mt-10">
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <p className="text-gray-700">{data.tagline}</p>
          <p>{data.overview}</p>
          <div className="flex items-start gap-2">

            <Label className='flex-1 text-right justify-end'
              htmlFor='streaming' >Streaming on</Label>
            <ProvidersBlock
              tmdbId={data.id}
              tmdbType={tmdbType}
              maxWidth='96'
              iconSize={48}
              userProviders

            />
          </div>
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
          <p>Status: {data.status}</p>
          {data.first_air_date && data.last_air_date && (<>
            <p>First Air Date: {new Date(data.first_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </p>
            <p>Last Air Date: {new Date(data.last_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </p>
            <p>Seasons: {data.number_of_seasons}</p>
            <p>Episodes: {data.number_of_episodes}</p>
            <p>Last Episode to Air: {data.last_episode_to_air?.name} <span className="text-xs text-foreground/25">{new Date(data.last_episode_to_air?.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          </>
          )}
          <p>Language: {data.original_language}</p>


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
              <CastAndCrew 
                cast={data.credits.cast} 
                type='cast'
                />
        </div>
      </div>
    </div>
  );
};


export default DetailPage;


