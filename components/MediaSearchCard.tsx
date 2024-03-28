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

const MediaSearchCard = ({
    media
}: {
    media: AutocompleteResult
}) => {

    return (

        <Card className="flex  flex-row max-w-lg p-2">
            <Image
                src={media.image_url}
                width={93}
                height={128}
                alt={`${media.name} poster`}
                className="rounded-md"
                objectFit="cover"
                placeholder="empty"
                sizes="100%"
                style={{
                    width: "93px",
                    height: "auto",
                }}
            />
            <CardHeader>
                <CardTitle>{media.name}</CardTitle>
                <CardDescription>{media.year}</CardDescription>
                <AddWatchlistButton
                    media={media}
                    width="24"

                />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {media.type}
                </p>
            </CardContent>

            <CardFooter className="flex items-center align-middle">
            </CardFooter>

        </Card>
    )
}

export default MediaSearchCard