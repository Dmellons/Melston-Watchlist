import { WatchlistDocument, WatchlistDocumentCreate } from "@/types/appwrite"
import { Models } from "appwrite"
import AddWatchlistButton from "@/components/buttons/AddWatchlistButton"
import DeleteButton from "@/components/DeleteButton"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"

export const AddOrDeleteButton = ({
    watchlist,
    media
}: {
    watchlist: Models.DocumentList<WatchlistDocument>,
    media: TMDBMultiSearchResult
}) => {

    const tmdbId = media.tmdb_id
    const watchlistIds = watchlist.documents.map((doc) => doc.tmdb_id)

    const isInWatchlist = watchlistIds.includes(tmdbId)
    if (!isInWatchlist) {

        return (
            <AddWatchlistButton
                media={media}
                width="w-1/3"
            />
        )} else {
        return (
            <DeleteButton
                media={media}
                width="w-1/3"
            />
        )
    }
}

