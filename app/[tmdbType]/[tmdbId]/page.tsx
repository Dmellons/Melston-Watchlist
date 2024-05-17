'use server'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import Link from 'next/link';
import CastAndCrew from '@/components/CastAndCrew';
import ProvidersBlock from '@/components/ProvidersBlock';
import AddWatchlistButton from '@/components/buttons/AddWatchlistButton';
import BackButton from '@/components/buttons/BackButton';
import { type TMDBApiMovieDetail, type TMDBApiTvDetail, tmdbFetchOptions } from "@/lib/tmdb";
import { WatchlistDocumentCreate } from "@/types/appwrite";
import { Globe } from "lucide-react";

interface DetailPageProps {
    params: {
        tmdbId: string;
        tmdbType: 'movie' | 'tv';
    }
}

function isMovieDetail(data: TMDBApiMovieDetail | TMDBApiTvDetail): data is TMDBApiMovieDetail {
    return (data as TMDBApiMovieDetail).title !== undefined;
}

function isTvDetail(data: TMDBApiMovieDetail | TMDBApiTvDetail): data is TMDBApiTvDetail {
    return (data as TMDBApiTvDetail).first_air_date !== undefined;
}


const DetailPage = async ({ params }: DetailPageProps) => {
    const { tmdbId, tmdbType } = params;


    const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?append_to_response=credits&language=en-US`;
    const response = await fetch(url, tmdbFetchOptions);

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    let data: TMDBApiMovieDetail | TMDBApiTvDetail = await response.json();

    if (!data) {
        throw new Error('Failed to fetch data');
    }



    const addButtonData: WatchlistDocumentCreate = {
        tmdb_id: data.id,
        tmdb_type: tmdbType,
        title: isMovieDetail(data) ? data.title : data.name,
        poster_url: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        backdrop_url: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
        content_type: 'movie',
        plex_request: false,
        description: data.overview ? data.overview : 'No description available',
        genre_ids: data.genres.map((genre) => genre.id),
        release_date: isMovieDetail(data) ? data.release_date : data.first_air_date,
    };

    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-12">
            <BackButton className="mb-4" />

            <div className="flex w-full gap-6 md:grid-cols-2">
                {/* Hero box */}
                <div className="flex flex-col sm:flex-row w-full">

                    {/* Poster Image */}
                    <h1 className="text-3xl sm:hidden mb-4 sm:text-left text-center font-bold">{isMovieDetail(data) ? data.title : data.name}</h1>
                    <div className="relative rounded-lg overflow-hidden w-full sm:w-1/3 shadow-lg border border-primary">
                        <Image
                            src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`}
                            alt={isMovieDetail(data) ? data.title : data.name}
                            className="w-full h-auto"
                            width={600}
                            height={900}
                            priority
                        />
                        {isMovieDetail(data) && data.release_date && (
                            <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-sm p-2">
                                Release Date: {data.release_date}
                            </div>
                        )}
                        {isTvDetail(data) && data.last_air_date && (
                            <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-sm p-2">
                                Last Air Date: {data.last_air_date}
                            </div>
                        )}
                    </div>

                    {/* Movie Details */}
                    <div className="flex flex-col space-y-6 sm:text-left sm:px-6 sm:py-0 py-4 ">
                        <h1 className="text-3xl hidden sm:block sm:text-left text-center font-bold">{isMovieDetail(data) ? data.title : data.name}</h1>
                        <p className="text-gray-600 text-center sm:text-left">{data.tagline}</p>

                        <div className="flex flex-col-reverse sm:flex-row my-8 max-w-md items-center gap-2 sm:gap-8">
                            <AddWatchlistButton media={addButtonData} width="w-1/3 sm:w-1/4" />
                            <div className="flex flex-col max-w-md items-center gap-2">
                                <Label htmlFor="streaming">Streaming on</Label>
                                <ProvidersBlock tmdbId={data.id} tmdbType={tmdbType} iconSize={48} />
                            </div>
                        </div>
                        {data.vote_average > 0 && (
                            <p>
                                Score: {data.vote_average.toFixed(1)}/10{" "}
                                <span className="text-foreground/50 text-sm">({data.vote_count} votes)</span>
                            </p>
                        )}

                        {data.genres?.length > 0 ? (
                            <p>Genres: {data.genres.map((genre) => genre.name).join(", ")}</p>
                        ) : (
                            <p>No genres available</p>
                        )}
                        <p className="text-gray-700 w-96">{data.overview}</p>
                    </div>
                </div>
            </div>
            <div>
                <div>

                    <CastAndCrew cast={data.credits.cast} type="cast" />

                    {/* External Links */}
                    <div className="flex justify-center w-full">
                        <div className="pt-6">
                            <h3 className="text-lg font-bold text-center">External Links</h3>
                            <div className="flex divide-x divide-gray-400 justify-center">
                                <Button variant="link" asChild>
                                    <Link
                                        href={`https://www.imdb.com/title/${data.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        IMDB
                                    </Link>
                                </Button>
                                <Button variant="link" asChild>
                                    <Link
                                        href={data.homepage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Globe className="w-4 h-4 mr-1" />
                                        Website
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <p>Language: {data.original_language}</p>
                    {isMovieDetail(data) && (
                        <p>
                            <p>Release Date: {data.release_date}</p>
                            <p>Revenue: ${data.revenue.toLocaleString()}</p>
                            <p>Budget: ${data.budget.toLocaleString()}</p>
                        </p>
                    )}
                    {isTvDetail(data) && (
                        <>
                            <p>First Air Date: {new Date(data.first_air_date).toLocaleDateString()}</p>
                            <p>Last Air Date: {new Date(data.last_air_date).toLocaleDateString()}</p>
                            <p>Next Air Date: {data.next_episode_to_air ? new Date(data.next_episode_to_air.air_date).toLocaleDateString() : <span className='font-bold'>Series Complete</span>}</p>
                            <p>Number of episodes: {data.number_of_episodes}</p>
                            <p>Number of seasons: {data.number_of_seasons}</p>
                        </>
                    )}
                    <p>Status: {data.status}</p>

                    <p>Runtime: {isMovieDetail(data) ? data.runtime : data.episode_run_time[0]} minutes</p>
                </div>
            </div>

            {/* Accordion Section */}
            <Accordion type="single" collapsible>
                {data.production_countries?.length > 0 && (
                    <AccordionItem value="Production Countries">
                        <AccordionTrigger>
                            <h3 className="text-lg font-bold">Production Countries</h3>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="pl-4">
                                {data.production_countries.map((country) => (
                                    <p key={country.iso_3166_1}>{country.name}</p>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {data.production_companies?.length > 0 && (
                    <AccordionItem value="Production Companies">
                        <AccordionTrigger>
                            <h3 className="text-lg font-bold">Production Companies</h3>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="pl-4">
                                {data.production_companies.map((company) => (
                                    <p key={company.id}>{company.name}</p>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>

            {/* Cast and Crew Section */}
        </div>
    );
};

export default DetailPage;
