
import PlexLibrary from "@/components/PlexSearch"
import { adminClient, adminServerAccount, adminServerDatabases, adminServerUsers } from "@/lib/appwriteServer"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"




async function TestPage() {
   
   return (
        <main className="flex min-h-screen flex-col m-auto sm:p-18">
           <PlexLibrary />

        </main >
    )
}

export default TestPage
