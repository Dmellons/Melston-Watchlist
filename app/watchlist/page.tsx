"use server"
import NewWatchlistCard from "@/components/NewWatchlistCard";
import SearchMovie from "@/components/SearchMovie";
import WatchlistMediaCard from "@/components/WatchlistMediaCard";
import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserState, useUser } from "@/hooks/User";
import { createSessionClient, getLoggedInUser } from "@/lib/server/appwriteServer";
// import { database } from "@/lib/appwrite";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, Query } from "appwrite";
import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";

export default async function WatchlistPage() {
    
    // const user = await getLoggedInUser()
    const serverAuth = await createSessionClient()
    const {account, databases} = ...serverAuth
    const user = await account.account.get()

    console.log({user})
    // const [watchlist, setWatchlist] = useState<Models.DocumentList<WatchlistDocument> | undefined>(user?.watchlist)
    const watchlist = user?.watchlist

    console.log({watchlist})

    
    // useEffect(() => {
    //         setWatchlist(user?.watchlist)
    //  }, [user?.watchlist])
    
    if (!user) {
        return <div className="text-3xl font-bold m-auto w-full text-center">please sign in </div>
    }

    console.log('watchlist', { user })

    return (
        <main className="flex min-h-screen flex-col items-center p- sm:p-18">
            <h1 className="text-3xl font-bold">Watchlist</h1>
            {/* <AddWatchlist /> */}
            {
                user ?
                    (watchlist && watchlist?.total > 0 ? (
                            <>
                            <SearchMovie resultsLength={5}/>
                            <WatchlistGrid watchlist={watchlist} setWatchlist={setWatchlist}/>
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


