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
import { Star } from "lucide-react";

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year?: string,
    image_url: string,
    description: string,
    credits: Credits
    plexRequest?: boolean

}
let data: CardData
const NewWatchlistCard = ({
    media
}: {
    media: WatchlistDocument
}) => {
    const { user } = useUser()

    const [data, setData] = useState<CardData | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [hasProviders, setHasProviders] = useState<boolean>(false)
    const [plexRequest, setPlexRequest] = useState<boolean>(media.plex_request)

    useEffect(() => {
        if (media.content_type === 'tv') {
            setData({
                title: media.title,
                content_type: media.content_type,
                tmdb_id: media.tmdb_id,
                tmdb_type: media.content_type,
                year: media.release_date,
                image_url: media.poster_url,
                description: media.overview ? media.overview : "No description available",
                credits: media.credits ? media.credits : null,
                plexRequest: plexRequest,
            })
            setIsLoading(false)
        }

        if (media.content_type === 'movie') {
            setData({
                title: media.title,
                content_type: media.content_type,
                tmdb_id: media.tmdb_id,
                tmdb_type: media.content_type,
                year: media.release_date,
                image_url: media.poster_path,
                description: media.overview ? media.overview : "No description available",
                credits: media.credits,
                plexRequest: plexRequest,
            })
            setIsLoading(false)
        }
        
    }, [media, plexRequest])
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

    const imageUrl = media.poster_url
    return (
        <div className="flex flex-col">
            <Card
                key={data.title}
                className="group w-64 bg-transparent hover:bg-card/70 rounded-xl  min-h-[200px] hover:transition-all h-96 hover:ease-in-out  hover:duration-500 overflow-hidden border border-primary relative"
            >
                {data.plexRequest ? 
                    // <div className="bg-gradient-to-br from-amber-600/40 from-30% via-40% via-amber-600/20 to-transparent to-50%  h-12 w-12" >
                        <Star
                            size={32}
                            strokeWidth={1}
                            color="#222222"
                            fill="#F59E0B"
                            className="top-0 left-0 absolute m-1"
                        />
                    // </div>
                    : 
                    null
                    // <div className="h-12 w-12"></div>
                    }
                <CardHeader
                    className="opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out text-center mt-2"
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
                            Year: {data.year ? new Date(data.year).getFullYear() : 'N/A'}
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent className=" opacity-0 group-hover:opacity-100  transition-all duration-600 ease-in-out  flex flex-col items-center w-full h-full gap-4 ">
                    <PlexRequestToggle
                        documentId={media.$id}
                        requested={plexRequest}
                        mediaTitle={data.title}
                        setPlexRequest={setPlexRequest}
                    />
                    <div className="flex gap-2 h-1/2 align-middle">

                    <Button
                        className="hover:shadow-2xl">
                        <Link href={`/${data.tmdb_type}/${data.tmdb_id}`} >
                            More Info
                        </Link>
                    </Button>
                    <DeleteButton title={data.title} document_id={media.$id} />
                            </div>
                </CardContent>
                
                <Image
                    src={imageUrl}
                    alt={data.title}
                    fill={true}
                    sizes="(max-width: 768px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw"
                    priority={true}
                    style={{
                        zIndex: -1
                    }}

                    className="w-full h-auto absolute top-0 left-0 opacity-100  group-hover:scale-110 transition-all duration-500 ease-in-out"
                />
            </Card>
            <div className="h-10 p-1 -mt-12"><>

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
