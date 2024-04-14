'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { ID, database } from "@/lib/appwrite"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { WatchlistDocumentCreate } from "@/types/appwrite"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"

import { toast } from "sonner"

const AddWatchlistButton = ({
    media,
    width = "w-full",
    query
}: {
    media: TMDBMultiSearchResult,
    width?: string
    query?: boolean
}) => {
    const { user, setUser } = useUser()

    if (!user) return null


    let data: WatchlistDocumentCreate
    function handleAddWatchlist() {
        if (query) {
            const fetchData = async ():TMDBMultiSearchResult => {
                try {
                    const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${media.id}`, tmdbFetchOptions);
                    const data = await response.json();
                    console.log({ res: data.results });


                    const response2 = await fetch(`https://api.themoviedb.org/3/search/multi?query=${media.id}`, tmdbFetchOptions);
                    const data2 = await response2.json();
                    console.log({ res2: data2.results });
                    return data.results;
                } catch (error) {
                    console.log(error);
                }
            }

            media = fetchData()
            console.log(media)

            data = {
                title: media.title,
                content_type: media.media_type,
                tmdb_id: media.id,
                tmdb_type: media.media_type,
                release_date: media.release_date,
                poster_url: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null,
                backdrop_url: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}` : null,
                description: media.overview ? media.overview : "No description available",
                genre_ids: media.genre_ids ? media.genre_ids : [],
                plex_request: false
            }
        }



        else {

            if (media.media_type === 'tv') {

                data = {
                    title: media.name,
                    content_type: media.media_type,
                    tmdb_id: media.id,
                    tmdb_type: media.media_type,
                    release_date: media.first_air_date,
                    poster_url: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                    backdrop_url: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}` : null,
                    description: media.overview ? media.overview : "No description available",
                    genre_ids: media.genre_ids ? media.genre_ids : [],
                    plex_request: false
                }
            }

            if (media.media_type === 'movie') {

                data = {
                    title: media.title,
                    content_type: media.media_type,
                    tmdb_id: media.id,
                    tmdb_type: media.media_type,
                    release_date: media.release_date,
                    poster_url: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null,
                    backdrop_url: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}` : null,
                    description: media.overview ? media.overview : "No description available",
                    genre_ids: media.genre_ids ? media.genre_ids : [],
                    plex_request: false
                }
            }
        }

        toast.promise(database.createDocument('watchlist', 'watchlist', ID.unique(), data), {

            loading: 'Adding...',
            success: (res) => {
                const title = data.title
                async function addToWatchlist() {
                    const newWatchlist = await database.listDocuments('watchlist', 'watchlist');
                    // @ts-ignore
                    setUser({
                        ...user,
                        watchlist: newWatchlist,
                    });
                }

                addToWatchlist();
                return `Added "${title}" to your watchlist!`;

            },
            error: (res) => {
                console.error({ res });
                return `Oops! There was an error adding "${data.title}" to your watchlist.\n\nError: ${res.response.message} `;
            },
        })


    }


    return (

        <Button
            variant="default"
            className={`${width} min-w-16 text-primary-foreground hover:bg-primary/70`}
            onClick={handleAddWatchlist}
        >
            +Add
        </Button>
    )
}

export default AddWatchlistButton