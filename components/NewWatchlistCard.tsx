'use client'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import ProvidersBlock from "@/components/ProvidersBlock";
import GameProvidersBlock from "@/components/GameProvidersBlock";
import FavoriteButton from "@/components/buttons/FavoriteButton";
import { WatchlistDocument } from "@/types/appwrite";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/User";
import PlexRequestToggle from "./PlexRequestToggle";
import { Trash2, Star, Play, Info, Calendar, Tv, Film, Settings, Gamepad2, Heart } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import DeleteButton from "./DeleteButton";
import { Button } from "./ui/button";
import SafeIcon from "./SafeIcon";
import { OwnedPlatformsBadges } from "./PlatformSelector";
import { GamePlatform } from "@/types/game";

type CardData = {
    title: string,
    content_type: string,
    tmdb_id: number,
    tmdb_type: string,
    igdb_id?: number,
    year?: string,
    image_url: string,
    description: string,
    plexRequest?: boolean,
    platforms_owned?: GamePlatform[],
    play_status?: string
}

const DebugNewWatchlistCard = ({ media }: { media: WatchlistDocument }) => {
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
        } else if (media.content_type === 'videogame') {
            setData({
                title: media.title,
                content_type: media.content_type,
                tmdb_id: 0,
                tmdb_type: 'game',
                igdb_id: media.igdb_id,
                year: media.release_date,
                image_url: media.poster_url,
                description: media.description || "No description available",
                plexRequest: false,
                platforms_owned: media.platforms_owned || [],
                play_status: media.play_status || 'backlog'
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
    const mediaTypeIcon = data.content_type === 'movie' ? Film : data.content_type === 'videogame' ? Gamepad2 : Tv
    const isGame = data.content_type === 'videogame'
    const detailLink = isGame ? `/game/${data.igdb_id}` : `/${data.tmdb_type}/${data.tmdb_id}`

    return (
        <div className="flex flex-col group">
            {/* Original Card */}
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
                {/* Plex Request Star + Favorite indicator */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                    {data.plexRequest && (
                        <div className="bg-amber-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                            <SafeIcon icon={Star} className="h-4 w-4 text-white fill-current" size={16} />
                        </div>
                    )}
                    {(media as any).is_favorite && (
                        <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                            <SafeIcon icon={Heart} className="h-4 w-4 text-white fill-current" size={16} />
                        </div>
                    )}
                </div>

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

                {/* Hover Overlay — pointer-events-none so the cover Link beneath
                    receives clicks; only the action buttons re-enable pointers. */}
                <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                    transition-opacity duration-300 z-10 rounded-xl pointer-events-none
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
                        <div className={`flex gap-2 ${isHovered ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                            <Button size="sm" className="flex-1" asChild>
                                <Link href={detailLink}>
                                    <SafeIcon icon={Info} className="h-4 w-4 mr-1" size={16} />
                                    Details
                                </Link>
                            </Button>
                            <FavoriteButton
                                documentId={media.$id}
                                iconOnly
                                className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
                            />
                            <DeleteButton
                                title={data.title}
                                document_id={media.$id}
                                buttonVariant="outline"
                                buttonText={<SafeIcon icon={Trash2} className="h-4 w-4" size={16} />}
                            />
                        </div>
                    </div>
                </div>

                {/* Poster Image — clicking the cover opens the details page */}
                <Link href={detailLink} aria-label={`View details for ${data.title}`}>
                    <div className="relative h-80 overflow-hidden rounded-t-xl">
                        <ImageWithFallback
                            src={data.image_url}
                            alt={data.title}
                            width={256}
                            height={320}
                            priority={false}
                            className={`
                                w-full h-full object-cover transition-transform duration-500 ease-out
                                ${isHovered ? 'scale-110' : 'scale-100'}
                            `}
                        />
                    </div>
                </Link>

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
                {isGame ? (
                    <div className="space-y-2">
                        {data.platforms_owned && data.platforms_owned.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Owned on:</p>
                                <OwnedPlatformsBadges platforms={data.platforms_owned} />
                            </div>
                        )}
                    </div>
                ) : (
                    <ProvidersBlock
                        tmdbId={data.tmdb_id}
                        tmdbType={data.tmdb_type}
                        userProviders={user?.providers}
                        maxWidth="w-full"
                        iconSize={24}
                        country="US"
                        notStreamingValue={
                            <div className="flex items-center justify-center p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                                <span className="text-xs text-muted-foreground font-medium">
                                    No streaming available
                                </span>
                            </div>
                        }
                    />
                )}
                {/* <Card className="border-2 border-blue-500 bg-blue-50">
                    <CardContent className="p-2">
                        <div className="text-xs font-semibold text-blue-800 mb-2">Original ProvidersBlock:</div>
                    </CardContent>
                </Card> */}
            </div>

            {/* Plex Request Toggle - only for movies/TV */}
            {!isGame && user?.labels?.includes('plex') && (
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

export default DebugNewWatchlistCard