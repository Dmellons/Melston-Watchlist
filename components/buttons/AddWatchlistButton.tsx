import { Button } from "@/components/ui/button"
import { ID, database } from "@/lib/appwrite"
import { WatchlistDocumentCreate } from "@/types/appwrite"
import { AutocompleteResult } from "@/types/watchmodeApi"
import { toast } from "sonner"

const AddWatchlistButton = ({ media, width="full" }: { media: AutocompleteResult, width?: string }) => {

    function handleAddWatchlist() {

        const data:WatchlistDocumentCreate = {
            title: media.name,
            content_type: media.type,
            tmdb_id: media.tmdb_id,
            imdb_id: media.imdb_id,
            tmdb_type: media.tmdb_type,
            year: media.year,
            image_url: media.image_url   
        }

        // const promise = database.createDocument('watchlist', 'watchlist', ID.unique(), data).catch((error) => {
        //     console.error(error)
        // })
        
        toast.promise(database.createDocument('watchlist', 'watchlist', ID.unique(), data), {
            loading: 'Adding...',
            success: (res) => {
                console.log({res})
                return `Added "${media.name}" to your watchlist!`
            }
                ,
            error: (res) => {
                console.error({res})
                return`Oops! There was an error adding "${media.name}" to your watchlist.\n\nError: ${res.response.message} `
            },
        })


    }

    return (
        <Button
            variant="outline"
            className={`max-w-${width}`}
            onClick={handleAddWatchlist}
        >
            +Add
        </Button>
    )
}

export default AddWatchlistButton