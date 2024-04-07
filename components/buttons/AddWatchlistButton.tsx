'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { ID, database } from "@/lib/appwrite"
import { WatchlistDocumentCreate } from "@/types/appwrite"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { toast } from "sonner"

const AddWatchlistButton = ({ media, width = "w-full" }: { media: TMDBMultiSearchResult, width: string }) => {
    const { user } = useUser()

    if (!user) return null

    let data: WatchlistDocumentCreate
    function handleAddWatchlist() {

        if (media.media_type === 'tv') {

            data = {
                title: media.name,
                content_type: media.media_type,
                tmdb_id: media.id,
                tmdb_type: media.media_type,
                release_date: media.first_air_date,
                poster_url: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                description: media.overview ? media.overview : "No description available",
                genre_ids: media.genre_ids ? media.genre_ids : []
            }
        }

        if (media.media_type === 'movie') {

            data = {
                title: media.title,
                content_type: media.media_type,
                tmdb_id: media.id,
                tmdb_type: media.media_type,
                release_date: media.release_date,
                poster_url: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                description: media.overview ? media.overview : "No description available",
                genre_ids: media.genre_ids ? media.genre_ids : []
            }
        }


        // const promise = database.createDocument('watchlist', 'watchlist', ID.unique(), data).catch((error) => {
        //     console.error(error)
        // })

        toast.promise(database.createDocument('watchlist', 'watchlist', ID.unique(), data), {
            loading: 'Adding...',
            success: (res) => {
                user.watchlist = database.listDocuments('watchlist', 'watchlist').then((data) => {
                    console.log({ data })
                    return data
                })
                return `Added "${data.title}" to your watchlist!`
            }
            ,
            error: (res) => {
                console.error({ res })
                return `Oops! There was an error adding "${data.title}" to your watchlist.\n\nError: ${res.response.message} `
            },
        })


    }


return (
    <Button
        variant="default"
        className={`min-w-16 ${width} text-primary-foreground hover:bg-primary/70`}
        onClick={handleAddWatchlist}
    >
        +Add
    </Button>
)
}

export default AddWatchlistButton