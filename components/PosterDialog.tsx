import { WatchlistDocument } from "@/types/appwrite"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import ProvidersBlock from "@/components/ProvidersBlock"
import { DialogHeader } from "@/components/ui/dialog"

export default function PosterDialog({
    media
}: {
    media: WatchlistDocument
}) {

    return (
        <Dialog>
        <DialogTrigger>
        <Image
            src={media.poster_url}
            alt={media.title}
            className="rounded-lg contain  group-hover:border-2 group-hover:border-primary  group-hover:ease-in-out group-hover:duration-100 w-full h-full"
            width={175}
            height={200}
        />

        </DialogTrigger>
        <DialogContent className="w-4/5 rounded-xl sm:w-full">
            <DialogHeader>
                {media.backdrop_url &&
                    <Image
                    src={media.backdrop_url}
                    alt={media.title}
                    className="rounded-lg w-full mb-4 mt-6"
                    width={200}
                    height={50} 
                />
                }
                <DialogTitle className="flex justify-between mt-2">

                        {media.title}
                    
                    <div className="text-card-foreground text-sm pl-2">
                        {media.year?.split('-')[0]}
                    </div>


                </DialogTitle>
            </DialogHeader>
            <DialogDescription>
                <h3 className="underline">Description:</h3>
                <p>{media.description}</p>
            </DialogDescription>
            <ProvidersBlock tmdbId={media.tmdb_id} tmdbType={media.tmdb_type} />
        </DialogContent>
    </Dialog>
    )
}