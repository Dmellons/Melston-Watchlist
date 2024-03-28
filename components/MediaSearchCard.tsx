
import Image from "next/image"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AutocompleteResult } from "@/types/watchmodeApi"
import AddWatchlistButton from "@/components/buttons/AddWatchlistButton"
import { Button } from "./ui/button"
import Link from "next/link"
import { TMDBMovieSearchResult, TMDBMultiSearchResult, TMDBTelevisionSearchResult } from "@/types/tmdbApi"
import { Infer } from "next/dist/compiled/superstruct"


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
        <Card className="flex flex-col sm:flex-row justify-between items-center max-w-lg p-2 gap-2">
            <CardHeader className="flex flex-col  justify-between items-center sm:flex-row sm:justify-center sm:gap-4 sm:min-w-48">
                <div className="flex flex-col items-center gap-3">
                    {
                        media.poster_path ? <Image
                            src={`https://image.tmdb.org/t/p/w500${data.image_url}`}
                            width={93}
                            height={128}
                            alt={`${data.title} poster`}
                            className="rounded-md"
                            objectFit="cover"
                            placeholder="empty"
                            sizes="100%"
                            style={{
                                width: "93px",
                                height: "auto",
                            }}
                        /> : (
                            <div className="w-24 h-32 flex flex-col justify-center items-center bg-card border border-black-1 rounded-md text-primary font-bold " >
                                Poster<br />Missing
                            </div>
                        )
                    }
                    <CardTitle className="text-center">{data.title}</CardTitle>
                    <div className="flex flex-col justify-center items-center gap-2">

                        <CardDescription className="font-subtitle">Year: {data.year.substring(0, 4)}</CardDescription>
                        {/* <CardDescription className="font-subtitle">{data.tmdb_type}</CardDescription> */}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">

                <p >
                    {data.description}
                </p>
                <AddWatchlistButton
                    media={media}
                    width="w-32 m-auto"

                />
            </CardContent>
        </Card>
    )
}

export default MediaSearchCard
