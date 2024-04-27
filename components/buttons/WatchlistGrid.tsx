"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WatchlistDocument } from "@/types/appwrite"
import { Models } from "appwrite"
import NewWatchlistCard from "@/components/NewWatchlistCard"

const WatchlistGrid = ({
    watchlist,
    setWatchlist
}:{
    watchlist: Models.DocumentList<WatchlistDocument>
    setWatchlist: any
}) => {
    return (
        <div className="flex flex-col w-full gap-4 p-10  sm:p-18  ">
                            <Accordion type="single" className="w-full" collapsible defaultValue="item-1">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="w-full">Watchlist</AccordionTrigger>
                                    <AccordionContent className="mt-4">
                                        <div className=" items-center flex flex-col justify-center gap-4 flex-wrap sm:flex-row ">
                                            { 
                                                watchlist.documents.map((document) => {
                                                    document.content_type === 'movie' ? document.content_type = 'movie' : document.content_type = 'tv'
                                                    if (true
                                                        // document.content_type === 'movie' && 
                                                        // user.labels?.includes('tester')
                                                    ){
                                                        return (
                                                        
                                                        <NewWatchlistCard 
                                                        key={document.$id} 
                                                        media={document} 
                                                        setWatchlist={setWatchlist}
                                                        />
                                                        )
                                                    } else {
                                                        return (
                                                    <WatchlistMediaCard 
                                                        key={document.$id} 
                                                        media={document} 
                                                        setWatchlist={setWatchlist}
                                                        />
                                                        )
                                                }
                                            }
                                                    )
                                                }
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                        </div>
    )
}

export default WatchlistGrid