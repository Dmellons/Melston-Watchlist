"use server"
import SearchMovie from "@/components/SearchMovie";
import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import { createSessionClient, getLoggedInUser } from "@/lib/server/appwriteServer";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, Query } from "appwrite";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default async function WatchlistPage() {
    const {account, databases} = await createSessionClient()  
    if(!account 
        || !databases
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

   
    const watchlist: Models.DocumentList<WatchlistDocument> = await databases.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID)
  
    if (!user) {
        return <div className="text-3xl font-bold m-auto w-full text-center">please sign in </div>
    }

    return (
        <main className="flex min-h-screen flex-col items-center p- sm:p-18">
            <h1 className="text-3xl font-bold">Watchlist</h1>
            {/* <AddWatchlist /> */}
            {
                user ?
                    (watchlist && watchlist?.total > 0 ? (
                            <>
                            <SearchMovie resultsLength={5}/>
                            <WatchlistGrid watchlist={watchlist} />
                                                </>
                    ) : (
                        <>
                            <SearchMovie />
                            <p>No Watchlist</p>
                        </>
                    )) : (
                        <p>Please Login</p>
                    )
            }
        </main >
    );
};


