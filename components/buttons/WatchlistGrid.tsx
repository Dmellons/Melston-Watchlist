"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WatchlistDocument } from "@/types/appwrite"
import { Models } from "appwrite"
import NewWatchlistCard from "@/components/NewWatchlistCard"
import { Separator } from "../ui/separator"

const WatchlistGrid = ({
    watchlist, 
}: {
    watchlist: Models.DocumentList<WatchlistDocument>

}) => {
    return (
        <div className="flex flex-col w-full gap-4 p-10  sm:p-18  ">
            <Separator className="w-full" />
            <Accordion type="single" className="w-full" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="w-full">
                        <span className="text-2xl text-center w-full">
                        Your Watchlist
                        </span>
                        </AccordionTrigger>
                    <AccordionContent className="mt-4">
                        <div className=" items-center flex flex-col justify-center gap-8 flex-wrap sm:flex-row ">
                        
                            {
                                watchlist.documents.map((document) => {
                                    document.content_type === 'movie' ?
                                        document.content_type = 'movie' : document.content_type = 'tv'
                                    return (

                                        <NewWatchlistCard
                                            key={document.$id}
                                            media={document}
                                        />
                                    )
                                })
                            }

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    )
}

export default WatchlistGrid