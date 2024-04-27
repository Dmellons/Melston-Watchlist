
import AdminGatekeeper from "@/components/GateKeeper";
import { adminClient, adminServerAccount, adminServerDatabases, adminServerUsers } from "@/lib/server/appwriteServer"
import { WatchlistDocument } from "@/types/appwrite";
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Models } from "appwrite";
import { Star } from "lucide-react";
import Link from "next/link";




async function AdminPage() {
    const data: Models.DocumentList<WatchlistDocument> = await adminServerDatabases.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID);
    const users = await adminServerUsers.list()
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
                                .filter(doc => (doc.$permissions.includes(`update("user:${user.$id}")`)))
                                .map((document) => (
                                    <div key={document.$id} className="flex gap-2">
                                        {
                                            document.plex_request ?
                                                <Star color="#f0cd0f" width={24} /> : <div className="w-6"></div>
                                        }
                                        <Link href={`/${document.tmdb_type}/${document.tmdb_id}`}
                                            className="hover:underline">
                                            {document.title}
                                        </Link>
                                    </div>
                                ))}

                        </div>
                    ))}

            </main >
        </AdminGatekeeper>
    )
}

export default AdminPage
