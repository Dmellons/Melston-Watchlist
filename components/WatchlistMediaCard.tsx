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
import { Separator } from "./ui/separator"
import Providers from "./Providers"
import { useState } from "react"
import DeleteButton from "./DeleteButton"

type CardData = {
    title: string,
    content_type?: string,
    tmdb_id: number,
    tmdb_type: string,
    year?: string,
    poster_url: string,
    description: string,

}
let data: CardData
const WatchlistMediaCard = ({
    document_id,
    media
}: {
    document_id: string;
    media: WatchlistDocument;
}) => {

    if (media.content_type === 'tv' || media.content_type === 'movie') {
        data = {
            title: media.title,
            content_type: media.content_type,
            tmdb_id: media.tmdb_id,
            tmdb_type: media.tmdb_type,
            year: media.release_date,
            poster_url: media.poster_url,
            description: media.description ? media.description : "No description available"
        }

    }

    const providerData = fetch(`https://api.themoviedb.org/3/${data.tmdb_type}/${data.tmdb_id}/watch/providers?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => console.log(data))

    console.log({ providerData })
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
            <CardHeader className="flex flex-col w-full justify-between items-center sm:flex-row sm:justify-center sm:gap-4 sm:min-w-48">
                <div className="flex flex-col items-center gap-1">
                    {
                        media.poster_url ? <Image
                            src={data.poster_url}
                            width={200}
                            height={200}
                            alt={`${data.title} poster`}
                            className="rounded-md"
                            objectFit="cover"
                            placeholder="empty"
                            sizes="100%"
                            style={{
                                width: "200px",
                                height: "auto",
                            }}
                        /> : (
                            <div className="w-24 h-32 flex flex-col justify-center items-center bg-card border border-black-1 rounded-md text-primary font-bold " >
                                Poster<br />Missing
                            </div>
                        )
                    }
                    <CardTitle className="text-center text-2xl block sm:hidden">{data.title}</CardTitle>
                    <CardDescription className="font-subtitle block sm:hidden">Year: {data.year?.substring(0, 4)}</CardDescription>
                    <CardDescription className="font-subtitle block sm:hidden ">Type: {`${data.tmdb_type?.charAt(0).toUpperCase()}${data.content_type?.slice(1)}`}</CardDescription>
                </div>
            </CardHeader>
            <Separator className="block  sm:hidden" />
            <CardContent className="flex flex-col gap-2">
                <CardTitle className="text-center text-2xl hidden sm:block">{data.title}</CardTitle>
                <div className="flex flex-row justify-between">

                    <CardDescription className="font-subtitle hidden sm:block ">Year: {data.year?.substring(0, 4)}</CardDescription>
                    <CardDescription className="font-subtitle hidden sm:block ">Type: {`${data.tmdb_type?.charAt(0).toUpperCase()}${data.content_type?.slice(1)}`}</CardDescription>
                </div>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Description</AccordionTrigger>
                        <AccordionContent>
                            {data.description}

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <DeleteButton 
                    buttonVariant={"destructive"} 
                    buttonText={"Delete"} 
                    title={data.title} 
                    document_id={media.$id} />

                {/* <Providers providers={providers}/> */}
            </CardContent>
        </Card>
    )
}

export default WatchlistMediaCard