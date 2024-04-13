import { WatchlistDocument } from "@/types/appwrite"
import Image from "next/image"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import DeleteButton from "@/components/DeleteButton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dispatch, SetStateAction, useState } from "react"
import ProvidersBlock from "@/components/ProvidersBlock"
import { Models } from "@/lib/appwrite"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type CardData = {
    title: string,
    content_type?: string,
    tmdb_id: number,
    tmdb_type: string,
    year?: string,
    poster_url?: string,
    description: string,

}
let data: CardData
const WatchlistMediaCard = ({
    media,
    setWatchlist

}: {
    media: WatchlistDocument;
    setWatchlist?: Dispatch<SetStateAction<Models.DocumentList<WatchlistDocument>>> | undefined
   
}) => {

    if (media.content_type === 'tv' || media.content_type === 'movie') {
        data = {
            title: media.title,
            content_type: media.content_type,
            tmdb_id: media.tmdb_id,
            tmdb_type: media.tmdb_type,
            year: media.release_date,
            poster_url: media.poster_url ? media.poster_url : undefined,
            description: media.description ? media.description : "No description available"
        }

    }


    if (!data) {
        return null
    }
    return (
        <Card className="
        flex 
        flex-col 
        overflow-y-auto
        justify-between 
        items-center 
        w-full
        max-w-2xl 
        p-2 
        md:flex-row 
        md:max-h-96 
        
        ">
            <CardHeader className="group flex flex-col w-full justify-between items-center sm:flex-row sm:justify-center sm:gap-4 sm:min-w-48">
                <div className="flex flex-col items-center gap-1">
                    {
                        <Dialog>
                        <DialogTrigger>
                        <Image
                    src={data.poster_url}
                    alt={data.title}
                    className="rounded-lg contain  group-hover:border-2 group-hover:border-primary  group-hover:ease-in-out group-hover:duration-100 w-full h-full"
                    width={175}
                    height={200}
                />
    
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                    {/* <Image
                                        src={`https://image.tmdb.org/t/p/w500/${data.backdrop_path}`}
                                        alt={data.title}
                                        className="rounded-lg w-full my-4"
                                        width={200}
                                        height={50} /> */}
                                <DialogTitle className="flex justify-between mt-4">
    
                                        {data.title}
                                    
                                    <div className="text-card-foreground text-sm pl-2">
                                        {data.year?.split('-')[0]}
                                    </div>
    
    
                                </DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                <h3 className="underline">Description:</h3>
                                <p>{data.description}</p>
                            </DialogDescription>
                            <ProvidersBlock tmdbId={data.tmdb_id} tmdbType={data.tmdb_type} />
                        </DialogContent>
                    </Dialog>
                    } 
                 

                    <CardTitle className="text-center text-2xl block sm:hidden">{data.title}</CardTitle>
                    <CardDescription className="font-subtitle block sm:hidden">Year: {data.year?.substring(0, 4)}</CardDescription>
                    <CardDescription className="font-subtitle block sm:hidden ">Type: {`${data.tmdb_type?.charAt(0).toUpperCase()}${data.content_type?.slice(1)}`}</CardDescription>
              
                </div>
            </CardHeader>
            <Separator className="block  sm:hidden" />
            <CardContent className="flex flex-col w-full gap-2">
                <CardTitle className="text-center text-2xl hidden min-w-48 sm:block">{data.title}</CardTitle>
                <div className="flex flex-row justify-between">

                    <CardDescription className="font-subtitle hidden sm:block ">Year: {data.year?.substring(0, 4)}</CardDescription>
                    <CardDescription className="font-subtitle hidden sm:block ">Type: {`${data.tmdb_type?.charAt(0).toUpperCase()}${data.content_type?.slice(1)}`}</CardDescription>
                </div>
                <Accordion type="single" collapsible className="w-full"> 
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Description</AccordionTrigger>
                        <AccordionContent>
                            <ScrollArea className="max-h-36 w-full">
                                    {data.description}
                                <ScrollBar orientation="vertical"/>
                            </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <DeleteButton
                    title={data.title}
                    document_id={media.$id}
                    // @ts-ignore
                    setWatchlist={setWatchlist}
                />

                <ProvidersBlock 
                    tmdbId={data.tmdb_id}
                    tmdbType={data.tmdb_type}
                    country="US"
                                        />
            </CardContent>
        </Card>
    )
}

export default WatchlistMediaCard