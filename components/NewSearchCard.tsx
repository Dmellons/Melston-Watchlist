import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import ProvidersBlock from "./ProvidersBlock"
import AddWatchlistButton from "./buttons/AddWatchlistButton"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year: string,
    poster_path: string,
    backdrop_path: string,
    description: string,

}
let data: CardData

const NewSearchCard = ({
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
            poster_path: media.poster_path,
            backdrop_path: media.backdrop_path,
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
            poster_path: media.poster_path,
            backdrop_path: media.backdrop_path,
            description: media.overview ? media.overview : "No description available"
        }
    }
    const imageUrl = `https://image.tmdb.org/t/p/w500/${data.poster_path}`
    return (
        <Card className="h-72 w-80  rounded m-2 border-none group hover:border hover:border-primary hover:ease-in-out hover:duration-300">
            <CardHeader className="h-48 w-36 m-auto">

                <Image
                    src={imageUrl}
                    alt={data.title}
                    className="rounded-lg contain group-hover:border-2 group-hover:border-primary group-hover:scale-105 group-hover:ease-in-out group-hover:duration-300 w-full h-full"
                    width={50}
                    height={50}
                    />
                    
            </CardHeader>
            <CardContent className="flex align-middle -mt-4 justify-between">
                <div className="flex flex-col top-0 h-8 justify-between mr-2 ">

                    <h2 className="text-sm font-black text-foreground/80">{data.title}</h2>
                    <p className="text-xs font-extralight">{data.year.split('-')[0]}</p>
                </div>
                <AddWatchlistButton media={media} width="w-1/6" />

            </CardContent>
            <CardFooter className="flex justify-between align-middle -mt-6">


                <ProvidersBlock tmdbId={data.tmdb_id} tmdbType={data.tmdb_type} />

            </CardFooter>
        </Card>
    )
}

export default NewSearchCard