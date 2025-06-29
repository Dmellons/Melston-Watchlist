'use client'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import ProvidersBlock from "@/components/ProvidersBlock";
import { WatchlistDocument } from "@/types/appwrite";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/User";
import PlexRequestToggle from "./PlexRequestToggle";
import { Star, Play, Info, Calendar, Tv, Film } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import DeleteButton from "./DeleteButton";
import { Button } from "./ui/button";
import SafeIcon from "./SafeIcon";

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    year?: string,
    image_url: string,
    description: string,
    plexRequest?: boolean
}

const NewWatchlistCard = ({ media }: { media: WatchlistDocument }) => {
    const { user } = useUser()
    const [data, setData] = useState<CardData | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [plexRequest, setPlexRequest] = useState<boolean>(media.plex_request)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (media.content_type === 'tv' || media.content_type === 'movie') {
            setData({
                title: media.title,
                content_type: media.content_type,
                tmdb_id: media.tmdb_id,
                tmdb_type: media.content_type,
                year: media.release_date,
                image_url: media.poster_url,
                description: media.description || "No description available",
                plexRequest: plexRequest,
            })
            setIsLoading(false)
        }
    }, [media, plexRequest])

    if (isLoading || !data) {
        return (
            <div className="flex flex-col group">
                <Card className="w-64 h-96 bg-muted animate-pulse rounded-xl border border-border/50">
                    <CardHeader className="h-72 bg-muted/50 rounded-t-xl" />
                    <CardContent className="p-4">
                        <div className="h-4 bg-muted/50 rounded mb-2" />
                        <div className="h-3 bg-muted/50 rounded w-2/3" />
                    </CardContent>
                </Card>
                <div className="h-10 mt-2 bg-muted/50 rounded-lg animate-pulse" />
            </div>
        )
    }

    const releaseYear = data.year ? new Date(data.year).getFullYear() : 'N/A'
    const mediaTypeIcon = data.content_type === 'movie' ? Film : Tv

    return (
        <div className="flex flex-col group">
            <Card
                className={`
                    w-64 bg-card/50 backdrop-blur-sm rounded-xl min-h-[400px] 
                    border border-border/30 relative overflow-hidden
                    transition-all duration-300 ease-out
                    hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30
                    hover:-translate-y-2 hover:bg-card/80
                    ${isHovered ? 'ring-2 ring-primary/20' : ''}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Plex Request Star */}
                {data.plexRequest && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-amber-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                            <SafeIcon
                                icon={Star}
                                className="h-4 w-4 text-white fill-current"
                                size={16}
                            />
                        </div>
                    </div>
                )}

                {/* Media Type Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <div className="bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
                        <div className="flex items-center gap-1">
                            <SafeIcon
                                icon={mediaTypeIcon}
                                className="h-3 w-3 text-muted-foreground"
                                size={12}
                            />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                {data.content_type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                    transition-opacity duration-300 z-10 rounded-xl
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                            {data.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                            <SafeIcon icon={Calendar} className="h-4 w-4 text-white/80" size={16} />
                            <span className="text-white/80 text-sm">{releaseYear}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" className="flex-1" asChild>
                                <Link href={`/${data.tmdb_type}/${data.tmdb_id}`}>
                                    <SafeIcon icon={Info} className="h-4 w-4 mr-1" size={16} />
                                    Details
                                </Link>
                            </Button>
                            <DeleteButton 
                                title={data.title} 
                                document_id={media.$id}
                                buttonVariant="outline"
                                buttonText={<SafeIcon icon={Star} className="h-4 w-4" size={16} />}
                            />
                        </div>
                    </div>
                </div>

                {/* Poster Image */}
                <div className="relative h-80 overflow-hidden rounded-t-xl">
                    <ImageWithFallback
                        src={data.image_url}
                        alt={data.title}
                        fallback="https://via.placeholder.com/200x300?text=No+Image"
                        width={256}
                        height={320}
                        priority={false}
                        className={`
                            w-full h-full object-cover transition-transform duration-500 ease-out
                            ${isHovered ? 'scale-110' : 'scale-100'}
                        `}
                    />
                </div>

                {/* Card Content (visible when not hovering) */}
                <CardContent className={`
                    p-4 transition-opacity duration-300
                    ${isHovered ? 'opacity-0' : 'opacity-100'}
                `}>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
                            {data.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <SafeIcon icon={Calendar} className="h-4 w-4" size={16} />
                                <span>{releaseYear}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <SafeIcon icon={mediaTypeIcon} className="h-4 w-4" size={16} />
                                <span className="capitalize">{data.content_type}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Providers Section */}
            <div className="mt-3 px-2">
                <ProvidersBlock
                    tmdbId={data.tmdb_id}
                    tmdbType={data.tmdb_type}
                    userProviders={user?.providers}
                    maxWidth="w-full"
                    notStreamingValue={
                        <div className="flex items-center justify-center p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                            <span className="text-xs text-muted-foreground font-medium">
                                No streaming available
                            </span>
                        </div>
                    }
                />
            </div>

            {/* Plex Request Toggle */}
            {user?.labels?.includes('plex') && (
                <div className="mt-2 px-2">
                    <PlexRequestToggle
                        documentId={media.$id}
                        requested={plexRequest}
                        mediaTitle={data.title}
                        setPlexRequest={setPlexRequest}
                    />
                </div>
            )}
        </div>
    )
}

export default NewWatchlistCard