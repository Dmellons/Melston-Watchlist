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

const MediaSearchCard = ({
    media
}:{
    media: AutocompleteResult
}) => {

    console.log({media})
    return (
        
        <Card className="flex  flex-row max-w-lg p-2">
                <Image
                    src={media.image_url} 
                    placeholder="empty"
                    width={93} 
                    height={128} 
                    alt="Poster"
                    />
            <CardHeader>
                <CardTitle>{media.name}</CardTitle>
                <CardDescription>{media.year}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {media.type}
                </p>
            </CardContent>
            <CardFooter className="flex items-center align-middle">
                <AddWatchlistButton media={media} />
            </CardFooter>
            
        </Card>
    )
}

export default MediaSearchCard