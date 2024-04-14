'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link"
import ProvidersBlock from "@/components/ProvidersBlock";
import { TMDBMultiSearchResult } from "@/types/tmdbApi";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import AddWatchlist from "./buttons/AddWatchlist";
import AddWatchlistButton from "./buttons/AddWatchlistButton";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { WatchlistDocument } from "@/types/appwrite";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year?: string,
    image_url: string,
    description: string,

}
let data: CardData
const NewWatchlistCard = ({
    media
}: {
    media: WatchlistDocument
}) => {


    const [data, setData] = useState<CardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasProviders, setHasProviders] = useState(false)
    useEffect(() => {


        if (media.content_type === 'tv') {
            // setData({

            //     title: media.name,
            //     content_type: media.content_type,
            //     tmdb_id: media.id,
            //     tmdb_type: media.content_type,
            //     year: media.first_air_date,
            //     image_url: media.poster_path,
            //     description: media.overview ? media.overview : "No description available"
            // })

            // setIsLoading(false)

        }

        if (media.content_type === 'movie') {
            setData({
                title: media.title,
                content_type: media.content_type,
                tmdb_id: media.tmdb_id,
                tmdb_type: media.content_type,
                year: media.release_date,
                image_url: media.poster_path,
                description: media.overview ? media.overview : "No description available"
            })


            setIsLoading(false)
        }
    }, [media, isLoading, hasProviders, setHasProviders])

    if (
        // isLoading ||
        !data
    ) {
        return (
            <Skeleton
                className="w-64 h-[200px]"
            />
        )
    }

    console.log({ data })
    // const imageUrl = 'https://image.tmdb.org/t/p/w500/' + data.image_url

    const imageUrl = media.poster_url


    return (


        <>
            <Card
                key={data.title}
                className="group w-64 bg-transparent rounded-xl  min-h-[200px] hover:transition-all h-96 hover:ease-in-out hover:scale-105 hover:duration-500 overflow-hidden border border-primary relative"

            >
                <div className="absolute bottom-0 m-auto w-full bg-gradient-to-t from-background/75  min-h-24 ">
                    <div className="absolute left-2 right-2 flex flex-row bottom-2 ">
                        <ProvidersBlock tmdbId={data.tmdb_id} tmdbType={data.tmdb_type} />
                    </div>
                </div>
                <CardHeader
                    className="opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out h-32 bg-gradient-to-b from-card  text-center"
                >
                    <CardTitle
                        className="text-card-foreground text-center"
                    >
                        {data.title}
                    </CardTitle>
                    <CardDescription className=" text-center text-card-foreground" >
                        {data.year}

                    </CardDescription>

                </CardHeader>
                <CardContent className="opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out  flex flex-col items-center w-full h-full gap-4 ">
                    {/* <div > */}

                    <Button
                        className="hover:shadow-2xl">
                        <Link href={`/${data.tmdb_type}/${data.tmdb_id}`} >
                            More Info
                        </Link>
                    </Button>

                    <DeleteButton title={data.title} document_id={media.$id} />
                    {/* </div> */}
                </CardContent>


                {/*
                <CardFooter className="absolute bottom-0">
                </CardFooter> */}



                

                {/* } */}
                <Image
                    src={imageUrl}
                    alt={data.title}
                    width={200}
                    height={300}
                    // sizes="100vw"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        zIndex: -1

                    }}

                    className="w-full h-auto absolute top-0 left-0 opacity-100 group-hover:opacity-25 transition-all duration-500 ease-in-out"
                />
            </Card>
        </>

    )
}

export default NewWatchlistCard
