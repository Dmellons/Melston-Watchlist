'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link"
import ProvidersBlock from "@/components/ProvidersBlock";
import { TMDBMultiSearchResult } from "@/types/tmdbApi";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import AddWatchlist from "./buttons/AddWatchlist";
import AddWatchlistButton from "./buttons/AddWatchlistButton";

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
const NewWatchlistCard = ({
    media
}: {
    media: TMDBMultiSearchResult
}) => {
    console.log({ media })

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
    const imageUrl = 'https://image.tmdb.org/t/p/w500/' + data.image_url
    console.log(imageUrl)

    return (

        <>

            <Card
                key={data.title}
                className="group w-64 rounded-xl bg-black min-h-[200px] hover:transition-all h-96 hover:ease-in-out hover:scale-105 hover:duration-500 overflow-hidden border border-primary z-1 relative"

            >
                <CardHeader
                    className="h-32 bg-gradient-to-b from-black  z-10 text-center"
                >
                    <CardTitle
                        className="text-white z-10"
                    >
                        {data.title}
                    </CardTitle>
                    <CardDescription className=" text-center z-10 ">
                        {data.year}
                        <p>{data.description}</p>
                    </CardDescription>

                </CardHeader>
                <CardContent className="z-20">
                </CardContent>
                <CardFooter className="z-20 absolute bottom-0">
                </CardFooter>
               
                    <Image
                        src={imageUrl}
                        alt={data.title}
                        width={200}
                        height={300}
                        // sizes="100vw"
                        style={{
                            width: '10rem%',
                            height: 'auto',
                            objectFit: 'contain',    
                        }}
                        
                        className="w-full h-auto z-1 absolute top-0 left-0 opacity-40 hover:opacity-5 object-cover hover:scale-105 hover:ease-in-out hover:duration-500"
                        />
                  


            <div className="p-4 absolute top-64 z-0">

            <ProvidersBlock tmdbId={data.tmdb_id} tmdbType={data.tmdb_type} />
            <AddWatchlistButton media={media}  />
            </div>
            </Card>
        </>

    )
}

export default NewWatchlistCard