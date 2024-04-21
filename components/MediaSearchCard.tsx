
import Image from "next/image"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import AddWatchlistButton from "@/components/buttons/AddWatchlistButton"

import { TMDBMultiSearchResult, TMDBTelevisionSearchResult } from "@/types/tmdbApi"
import { Separator } from "./ui/separator"
import ProvidersBlock from "@/components/ProvidersBlock"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"


type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year: string,
    image_url: string,
    description: string,

}
let data: CardData
const MediaSearchCard = ({
    media
}: {
    media: TMDBMultiSearchResult
}) => {

    if (media.media_type === 'tv') {
        data = {
            title: media.name,
            content_type: media.media_type,
            tmdb_id: media.id,
            tmdb_type: media.media_type,
            year: media.first_air_date,
            image_url: media.poster_path,
            description: media.overview ? media.overview : "No description available"
        }

    }

    if (media.media_type === 'movie') {
        data = {
            title: media.title,
            content_type: media.media_type,
            tmdb_id: media.id,
            tmdb_type: media.media_type,
            year: media.release_date,
            image_url: media.poster_path,
            description: media.overview ? media.overview : "No description available"
        }
    }

    return (
        <Card className="flex flex-col sm:flex-row justify-between items-center w-full sm:w-[400px] p-2 hover:z-0 hover:border hover:border-primary/50 sm:hover:scale-100 hover:shadow-xs hover:shadow-primary ">

            <CardHeader className="flex flex-col  justify-between items-center sm:flex-row sm:justify-center sm:gap-4 sm:min-w-48">
            <div className=" hover:ease-in-out hover:duration-300 w-full">
                <div className="flex flex-col items-center gap-1">
                    {
                        media.poster_path ? <Image
                        src={`https://image.tmdb.org/t/p/w500${data.image_url}`}
                        width={24}
                        height={32}
                        alt={`${data.title} poster`}
                        className="rounded-md"
                        objectFit="cover"
                        placeholder="empty"
                        sizes="100%"
                        style={{
                            width: "128px",
                            height: "auto",
                        }}
                        /> : (
                            <div className="w-32 h-40 flex flex-col justify-center items-center bg-background/50 border border-primary/50 rounded-md text-primary font-bold " >
                                Poster<br />Missing
                            </div>
                        )
                    }
                    <CardTitle className="text-center text-2xl block sm:hidden">{data.title}</CardTitle>
                    <CardDescription className="font-subtitle block sm:hidden">Year: {data.year.substring(0, 4)}</CardDescription>
                    <CardDescription className="font-subtitle block sm:hidden ">Type: {`${data.tmdb_type.charAt(0).toUpperCase()}${data.content_type.slice(1)}`}</CardDescription>
                </div>
                </div>
            </CardHeader>
            <Separator className="block  sm:hidden" />
            <CardContent className="flex flex-col gap-2 w-full">
                <CardTitle className="text-center text-2xl hidden sm:block">{data.title}</CardTitle>
                <div className="flex flex-row justify-between text-center">

                    <CardDescription className="font-subtitle hidden sm:block ">Year: {data.year.substring(0, 4)}</CardDescription>
                    <CardDescription className="font-subtitle hidden sm:block ">Type: {`${data.tmdb_type.charAt(0).toUpperCase()}${data.content_type.slice(1)}`}</CardDescription>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1 ">
                        <AccordionTrigger className="">Description</AccordionTrigger>
                        <AccordionContent>
                            <ScrollArea className="max-h-72 w-full h-full  p-2 rounded-md border">

                                {data.description}
                                <ScrollBar />
                            </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>


                <ProvidersBlock
                    tmdbId={data.tmdb_id}
                    tmdbType={data.tmdb_type}
                    userProviders
                    />
                <AddWatchlistButton
                    media={media}
                    width="w-32 m-auto"
                    
                    />
            </CardContent>
        </Card>
    )
}

export default MediaSearchCard
