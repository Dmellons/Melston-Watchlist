
import AdminGatekeeper from "@/components/GateKeeper";
import { client, sdkAccount, skdDatabases, sdkUsers } from "@/lib/appwriteServer"
import { WatchlistDocument } from "@/types/appwrite";
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Models } from "appwrite";
import { Star } from "lucide-react";




async function AdminPage() {
    const data: Models.DocumentList<WatchlistDocument> = await skdDatabases.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID);
    const users = await sdkUsers.list()
    console.log(data);


    return (
        <AdminGatekeeper>
            <main className="flex min-h-screen flex-col m-auto sm:p-18">
                {users.users
                    .map((user) => (
                        <div
                            key={user.$id}
                            className="flex flex-col justify-start items-left sm:p-18  mb-2 px-4"
                        >


                            <h2 className="text-2xl justify-start text-left border-b-2 border-primary">{user.email}</h2>
                            <p className="text-sm text-foreground/50 align-baseline">{user.name}</p>
                            {data.documents
                                .filter(doc => (doc.$permissions.includes(`update("user:${user.$id}")`)) && doc.plex_request)
                                .map((document) => (
                                    <div key={document.$id} className="flex gap-2">
                                        <Star color="#f0cd0f"/>{document.title}
                                    </div>
                                ))}

                        </div>
                    ))}

            </main >
        </AdminGatekeeper>
    )
}

export default AdminPage
