import { Button } from "@/components/ui/button"
import { ID, database } from "@/lib/appwrite"
import { WatchlistDocumentCreate } from "@/types/appwrite"
import { AutocompleteResult } from "@/types/watchmodeApi"
import { toast } from "sonner"

const AddWatchlistButton = ({ media }: { media: AutocompleteResult  }) => {

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

        const promise = database.createDocument('watchlist', 'watchlist', ID.unique(), data).catch((error) => {
            console.error(error)
        })
        console.log({data})
        toast.promise(promise, {
            loading: 'Adding...',
            success: `Added "${media.name}" to your watchlist!`,
            error: `Oops! There was an error adding "${media.name}" to your watchlist.`,
        })


    }

    return (
        <Button
            variant="outline"
            className="w-full"
            onClick={handleAddWatchlist}
        >
            +Add
        </Button>
    )
}

export default AddWatchlistButton