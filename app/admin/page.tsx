
import AdminGatekeeper from "@/components/GateKeeper";
import { createAdminClient, createSessionClient, getLoggedInUser } from "@/lib/server/appwriteServer"
import { WatchlistDocument } from "@/types/appwrite";
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Models } from "appwrite";
import { Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";




export default async function AdminPage() {
    const {account} = await createSessionClient()
    console.log({account})
    
    if(!account 
        // || !databases
    ) {
        redirect('/')
        // return <div className="text-3xl font-bold m-auto w-full text-center">please sign in </div>
    }
    let user
    try{
         user = await account.get()

    } catch(error) {
       console.log(error)
       if (error.code === 401 && error.type === 'general_unauthorized_scope') {
           redirect('/')
       }     
        
    }


    const {databases, users } = await createAdminClient()
    const data: Models.DocumentList<WatchlistDocument> = await databases.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID);
    const appUsers = await users.list()

    console.log({ data })

    
    return (
        <AdminGatekeeper>
            <main className="flex min-h-screen flex-col m-auto sm:p-18">
                {appUsers.users
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
