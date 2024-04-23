
import { client, sdkAccount, skdDatabases, sdkUsers } from "@/lib/appwriteServer"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"




async function TestPage() {
   
    const result = await skdDatabases.deleteAttribute('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, 'contentType')
   
    return (
        <main className="flex min-h-screen flex-col m-auto sm:p-18">
           

        </main >
    )
}

export default TestPage
