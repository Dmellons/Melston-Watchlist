
import AdminGatekeeper from "@/components/GateKeeper";
import { Separator } from "@/components/ui/separator";
import { createAdminClient, createSessionClient, getLoggedInUser } from "@/lib/server/appwriteServer"
import { WatchlistDocument } from "@/types/appwrite";
import { Models } from "appwrite";
import { Models as ServerModels } from "node-appwrite";
import { Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminWatchlistTable from "./AdminWatchlistTable";


function requestingUsers(appUsers: ServerModels.UserList<Models.Preferences>, document: WatchlistDocument) {
   const requester = appUsers.users.map(u => {

        if(document.$permissions.includes(`update("user:${u.$id}")`)){
            return <div key={u.$id} className="text-foreground/50 pl-2"> - {u.email}</div>
        } else {
            return null
        }
    })}


export default async function AdminPage() {
    const {account} = await createSessionClient()
    
    
    if(!account 
        // || !databases
    ) {
        redirect('/')
        // return <div className="text-3xl font-bold m-auto w-full text-center">please sign in </div>
    }
    let user: Models.User<Models.Preferences>
    try{
         user = await account.get()

    } catch(error:any) {
       console.log(error)
       if (error.code === 401 && error.type === 'general_unauthorized_scope') {
           redirect('/')
       }     
        
    }


    const {databases, users } = await createAdminClient()
    const data: Models.DocumentList<WatchlistDocument> = await databases.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID);
    const plexRequests: WatchlistDocument[] =  data.documents.filter((item) => item.plex_request === true)

    const appUsers = await users.list()
    let requester
   
    return (
        <AdminGatekeeper>
            <main className="flex min-h-screen flex-col m-auto sm:p-18 px-2">
                <AdminWatchlistTable />
                <Separator className="w-full bg-foreground my-10" />
                <h1 className="text-2xl font-bold ml-2 underline mb-2">New Requests</h1>
                            {plexRequests
                                .map((document) => (
                                    <div key={document.$id} className="flex gap-2">
                                        {
                                            document.plex_request ?
                                                <Star fill="#f0cd0f" strokeWidth={1} width={24} /> : <div className="w-6"></div>
                                        }
                                        <Link href={`/${document.tmdb_type}/${document.tmdb_id}`}
                                            className="hover:underline flex">
                                            {document.title}
                                            
                                            {requester = appUsers.users.map(u => {

                                                if(document.$permissions.includes(`update("user:${u.$id}")`)){
                                                    return <div key={u.$id} className="text-foreground/50 pl-2"> - {u.email}</div>
                                                } else {
                                                    return null
                                                }
                                            })}
                                            
                                        </Link>
                                    </div>
                                ))}
                    {/* <Separator className="w-full bg-foreground my-10" />
                    <h1 className="text-2xl font-bold ml-2 underline mb-2">All Watchlists</h1>
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
                                                <Star fill="#f0cd0f" strokeWidth={1} width={24} /> : <div className="w-6"></div>
                                        }
                                        <Link href={`/${document.tmdb_type}/${document.tmdb_id}`}
                                            className="hover:underline">
                                            {document.title}
                                        </Link>
                                    </div>
                                ))}

                        </div>
                    ))} */}

            </main >
        </AdminGatekeeper>
    )
}
