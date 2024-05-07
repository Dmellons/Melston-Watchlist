'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { ID, database } from "@/lib/appwrite"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { type  WatchlistDocumentCreate } from "@/types/appwrite"
import { type TMDBMultiSearchResult } from "@/types/tmdbApi"

import { toast } from "sonner"

const AddWatchlistButton = ({
    media,
    width = "w-full",
    query
}: {
    media: TMDBMultiSearchResult | WatchlistDocumentCreate,
    width?: string
    query?: boolean
}) => {
    const { user, setUser } = useUser()

    if (!user) return null

    let data: WatchlistDocumentCreate
    async function handleAddWatchlist() {
        if (query) {
            // console.log({media})
            const fetchData = async () => {
                try {
                    if(media.media_type === 'movie') {
                    const response = await fetch(`https://api.themoviedb.org/3/movie/${media.id}`, tmdbFetchOptions);
                    const data = await response.json();
                    data.media_type = 'movie';
                    // console.log({ res: data });
                    return data
                }
                if (media.media_type === 'tv') {
                    const response = await fetch(`https://api.themoviedb.org/3/tv/${media.id}`, tmdbFetchOptions);
                    const data = await response.json();
                    // console.log({ res: data });
                    data.media_type = 'tv';
                    return data;
                }
                } catch (error) {
                    console.error(error);
                }
            }

            const newMedia:TMDBMultiSearchResult = await fetchData()
            console.log({newMedia})

            if (newMedia.media_type === 'tv') {
                data = {
                    title: newMedia.name,
                    content_type: newMedia.media_type,
                    tmdb_id: newMedia.id,
                    tmdb_type: newMedia.media_type,
                    release_date: newMedia.first_air_date,
                    poster_url:  `https://image.tmdb.org/t/p/w500${newMedia.poster_path}`,
                    backdrop_url: newMedia.poster_path ? `https://image.tmdb.org/t/p/w500${newMedia.backdrop_path}` : null,
                    description: newMedia.overview ? newMedia.overview : "No description available",
                    genre_ids: newMedia.genres.length >  0 ? newMedia.genres.map((g) => g.id) : [],
                    plex_request: false
                }
            } else if (newMedia.media_type === 'movie') {
                data = {
                    title: newMedia.title,
                    content_type: newMedia.media_type,
                    tmdb_id: newMedia.id,
                    tmdb_type: newMedia.media_type,
                    release_date: newMedia.release_date,
                    poster_url:  `https://image.tmdb.org/t/p/w500${newMedia.poster_path}`,
                    backdrop_url: newMedia.poster_path ? `https://image.tmdb.org/t/p/w500${newMedia.backdrop_path}` : null,
                    description: newMedia.overview ? newMedia.overview : "No description available",
                    genre_ids: newMedia.genres?.length >  0 ? newMedia.genres.map((g) => g.id) : [],
                    plex_request: false
                }
            }

            console.log({data})

           
            
        } else {
  

            // if (typeof media === typeof TMDBMultiSearchResult) {
              

                if (media.media_type === 'tv' || media.tmdb_type === 'tv') {

                    data = {
                        title: media.name ? media.name : media.title,
                        content_type: 'tv',
                        tmdb_id: media.id ? media.id : media.tmdb_id,
                        tmdb_type: 'tv',
                        release_date: media.first_air_date,
                        poster_url: media.poster_path ?  `https://image.tmdb.org/t/p/w500${media.poster_path}`: media.poster_url,
                        backdrop_url: media.backdrop_path ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}` : media.poster_url,
                        description: media.description ? media.description : "No description available",
                        genre_ids: media.genre_ids ? media.genre_ids : [],
                        plex_request: false,
                        release_date: media.release_date
                    }
                }

                if (media.media_type === 'movie' || media.tmdb_type === 'movie') {

                

                    data = {
                        title: media.title,
                        content_type: media.media_type ? media.media_type : media.tmdb_type,
                        tmdb_id: media.id ? media.id : media.tmdb_id,
                        tmdb_type: media.media_type ? media.media_type : media.tmdb_type,
                        release_date: media.release_date,
                        poster_url: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : media.poster_url,
                        backdrop_url: media.backdrop_path ? `https://image.tmdb.org/t/p/w500${media.backdrop_path}` : media.backdrop_url,
                        description: media.description ? media.description : "No description available",
                        genre_ids: media.genre_ids ? media.genre_ids : [],
                        plex_request: false
                    }
                // }
            }
        }

      

        toast.promise(database.createDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, ID.unique(), data), {

            loading: 'Adding...',
            success: (res) => {
                const title = data.title
                async function addToWatchlist() {
                    const newWatchlist = await database.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID);
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
                // @ts-ignore
                return `Oops! There was an error adding "${media.name ? media.name : media.title}" to your watchlist.\n\nError: ${res.response.message} `;
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