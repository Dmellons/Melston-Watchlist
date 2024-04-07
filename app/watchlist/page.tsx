'use client'
import SearchMovie from "@/components/SearchMovie";
import WatchlistMediaCard from "@/components/WatchlistMediaCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserState, useUser } from "@/hooks/User";
// import { database } from "@/lib/appwrite";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, Query } from "appwrite";
import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";

function WatchlistPage() {
    
    const { user } = useUser()
    const [watchlist, setWatchlist] = useState<Models.DocumentList<WatchlistDocument> | undefined>(user?.watchlist)
    
    useEffect(() => {
            setWatchlist(user?.watchlist)
     }, [user?.watchlist])
    
    if (!user) {
        return <div className="text-3xl font-bold">please sign in </div>
    }

    console.log({ watchlist })

    return (
        <main className="flex min-h-screen flex-col items-center p- sm:p-18">
            <h1 className="text-3xl font-bold">Watchlist</h1>
            {/* <AddWatchlist /> */}
            {
                user ?
                    (watchlist && watchlist?.total > 0 ? (
                        <div className="flex flex-col w-full gap-4 p-10  sm:p-18  ">
                            <SearchMovie />
                            <Accordion type="single" className="w-full" collapsible defaultValue="item-1">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="w-full">Watchlist</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col justify-center gap-4 flex-wrap sm:flex-row ">
                                            {
                                                watchlist.documents.map((document) => (
                                                    <WatchlistMediaCard 
                                                        key={document.$id} 
                                                        media={document} 
                                                        setWatchlist={setWatchlist}/>
                                                ))
                                            }
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                        </div>
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

export default WatchlistPage;
