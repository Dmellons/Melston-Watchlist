'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link"
import ProvidersBlock from "@/components/ProvidersBlock";
import { Credits, TMDBMultiSearchResult } from "@/types/tmdbApi";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import AddWatchlist from "./buttons/AddWatchlist";
import AddWatchlistButton from "./buttons/AddWatchlistButton";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { WatchlistDocument } from "@/types/appwrite";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { useUser } from "@/hooks/User";
import PlexRequestToggle from "./PlexRequestToggle";

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year?: string,
    image_url: string,
    description: string,
    credits: Credits

}
let data: CardData
const NewWatchlistCard = ({
    media
}: {
    media: WatchlistDocument
}) => {

    const { user } = useUser()


    const [data, setData] = useState<CardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasProviders, setHasProviders] = useState(false)
    useEffect(() => {


        if (media.content_type === 'tv') {
            // console.log({ media })
            setData({

                title: media.title,
                content_type: media.content_type,
                tmdb_id: media.tmdb_id,
                tmdb_type: media.content_type,
                year: media.release_date,
                image_url: media.poster_url,
                description: media.overview ? media.overview : "No description available",
                credits: media.credits ? media.credits : null
            })
            // console.log({ data })

            setIsLoading(false)

        }

        if (media.content_type === 'movie') {
            // console.log({ media })

            setData({
                title: media.title,
                content_type: media.content_type,
                tmdb_id: media.tmdb_id,
                tmdb_type: media.content_type,
                year: media.release_date,
                image_url: media.poster_path,
                description: media.overview ? media.overview : "No description available",
                credits: media.credits
            })


            setIsLoading(false)
        }
    },[])

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

    // console.log({ data?.cast })
    // const imageUrl = 'https://image.tmdb.org/t/p/w500/' + data.image_url

    const imageUrl = media.poster_url


    return (


        <div className="flex flex-col">
            <Card
                key={data.title}
                className="group w-64 bg-transparent hover:bg-card/70 rounded-xl  min-h-[200px] hover:transition-all h-96 hover:ease-in-out  hover:duration-500 overflow-hidden border border-primary relative"

            >

                <CardHeader
                    className="opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out text-center"
                >

                    <CardTitle
                        className="text-card-foreground text-center"
                    >
                        {data.title}
                    </CardTitle>
                    <CardDescription className=" flex justify-between text-center text-sm font-light text-card-foreground" >

                        <p className="capitalize">
                            Type: {data.content_type}
                        </p>
                        <p>
                            

                        Year: {new Date(data.year).getFullYear()}
                        </p>

                    </CardDescription>

                </CardHeader>
                <CardContent className=" opacity-0 group-hover:opacity-100  transition-all duration-600 ease-in-out  flex flex-col items-center w-full h-full gap-4 ">

                    
                    <PlexRequestToggle 
                        documentId={media.$id} 
                        requested={media.plex_request} 
                        mediaTitle={data.title} 
                        />
                    <Button
                        className="hover:shadow-2xl">
                        <Link href={`/${data.tmdb_type}/${data.tmdb_id}`} >
                            More Info
                        </Link>
                    </Button>

                    <DeleteButton title={data.title} document_id={media.$id} />

                </CardContent>

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

                    className="w-full h-auto absolute top-0 left-0 opacity-100  group-hover:scale-110 transition-all duration-500 ease-in-out"
                />
            </Card>
            <div className="h-10 p-1"><>
               
                <ProvidersBlock
                    tmdbId={data.tmdb_id}
                    tmdbType={data.tmdb_type}
                    userProviders={user?.providers}
                    />
                    </>
            </div>
        </div>

    )
}

export default NewWatchlistCard
