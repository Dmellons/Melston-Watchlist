'use client'
import { IGDBGame, getIGDBImageUrl, GamePlatform } from "@/types/game"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import Link from "next/link"
import { memo, useState } from "react"
import ImageWithFallback from "@/components/ImageWithFallback"
import SafeIcon from "@/components/SafeIcon"
import { Gamepad2, Calendar, Star, Info, Eye, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import GameProvidersBlock from "./GameProvidersBlock"
import AddGameButton from "./buttons/AddGameButton"
import { useUser } from "@/hooks/User"
import { OwnedPlatformsBadges } from "./PlatformSelector"

interface GameSearchCardProps {
  game: IGDBGame;
}

const GameSearchCard = ({ game }: GameSearchCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useUser();

  // Check if user owns this game
  const ownedGame = user?.watchlist?.documents?.find(
    doc => doc.igdb_id === game.id && doc.content_type === 'videogame'
  );
  const isOwned = !!ownedGame;
  const ownedPlatforms: GamePlatform[] = ownedGame?.platforms_owned || [];

  const coverUrl = game.cover?.image_id
    ? getIGDBImageUrl(game.cover.image_id, 'cover_big')
    : null;

  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : 'TBA';

  const rating = game.aggregated_rating
    ? Math.round(game.aggregated_rating)
    : game.rating
      ? Math.round(game.rating)
      : null;

  const developers = game.involved_companies
    ?.filter(ic => ic.developer)
    .map(ic => ic.company.name)
    .slice(0, 2)
    .join(', ');

  const platforms = game.platforms
    ?.map(p => p.abbreviation || p.name)
    .slice(0, 4)
    .join(', ');

  return (
    <div className="flex flex-col space-y-2 sm:space-y-3 group w-full">
      {/* Poster and Info */}
      <Card
        className={`
          relative transition-all duration-300 overflow-hidden
          hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 sm:hover:-translate-y-2
          border border-border/50 hover:border-primary/30
          bg-card/50 backdrop-blur-sm hover:bg-card/80
          ${isHovered ? 'ring-2 ring-primary/20' : ''}
          w-full
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Media Type Badge */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border border-border/50 text-xs">
            <SafeIcon
              icon={Gamepad2}
              className="h-2 w-2 sm:h-3 sm:w-3 mr-1"
              size={10}
            />
            <span className="text-xs font-medium uppercase">GAME</span>
          </Badge>
        </div>

        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 z-10">
            <Badge className="bg-green-500/90 text-white text-xs">
              <SafeIcon icon={Check} className="h-2 w-2 sm:h-3 sm:w-3 mr-1" size={10} />
              In Library
            </Badge>
          </div>
        )}

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
            <Badge className="bg-yellow-500/90 text-black text-xs">
              <SafeIcon icon={Star} className="h-2 w-2 sm:h-3 sm:w-3 mr-1 fill-current" size={10} />
              {rating}
            </Badge>
          </div>
        )}

        <CardContent className="p-0">
          <div className="relative">
            <Link href={`/game/${game.id}`} aria-label={`View details for ${game.name}`}>
              {coverUrl ? (
                <ImageWithFallback
                  src={coverUrl}
                  alt={game.name}
                  className="w-full h-40 sm:h-60 md:h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  width={200}
                  height={300}
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 20vw, 200px"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 sm:h-60 md:h-72 bg-muted/50 flex items-center justify-center">
                  <SafeIcon icon={Gamepad2} className="h-12 w-12 text-muted-foreground/30" size={48} />
                </div>
              )}
            </Link>

            {/* Gradient overlay on hover.
                pointer-events-none so it never swallows clicks meant for the poster Link. */}
            <div className={`
              absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
              transition-opacity duration-300 flex items-end p-2 sm:p-3
              pointer-events-none
              ${isHovered ? 'opacity-100' : 'opacity-0'}
              hidden sm:flex
            `}>
              <div className="text-white space-y-1">
                <Link href={`/game/${game.id}`} className="pointer-events-auto hover:text-primary transition-colors">
                  <h3 className="font-bold text-sm line-clamp-2">{game.name}</h3>
                </Link>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
                  <span>{releaseYear}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Title and Year for Mobile */}
      <div className="sm:hidden px-1 space-y-1">
        <Link href={`/game/${game.id}`}>
          <h3 className="font-semibold text-xs line-clamp-2 leading-tight hover:text-primary transition-colors">{game.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
          <span>{releaseYear}</span>
        </div>
      </div>

      {/* Platforms/Providers */}
      <div className="px-1">
        <GameProvidersBlock game={game} />
        {isOwned && ownedPlatforms.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Owned on:</p>
            <OwnedPlatformsBadges platforms={ownedPlatforms} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-1 sm:gap-2 px-1">
        <AddGameButton game={game} />

        <div className="flex gap-1 sm:gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
            <Link href={`/game/${game.id}`}>
              <SafeIcon icon={Info} className="h-3 w-3 mr-1" size={12} />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">Info</span>
            </Link>
          </Button>

          {/* Quick View Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" aria-label={`Quick view ${game.name}`} className="px-2 sm:px-3 transition-all duration-200 hover:scale-105">
                <SafeIcon icon={Eye} className="h-3 w-3" size={12} />
              </Button>
            </DialogTrigger>

            <DialogContent className="w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
              <Card className="border-none shadow-none">
                <DialogHeader className="space-y-4">
                  <div className="flex gap-4">
                    {coverUrl && (
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={coverUrl}
                          alt={game.name}
                          className="w-24 h-36 object-cover rounded-lg"
                          width={96}
                          height={144}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold">{game.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          <SafeIcon icon={Calendar} className="h-3 w-3 mr-1" size={12} />
                          {releaseYear}
                        </Badge>
                        {rating && (
                          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                            <SafeIcon icon={Star} className="h-3 w-3 mr-1 fill-current" size={12} />
                            {rating}/100
                          </Badge>
                        )}
                      </div>
                      {developers && (
                        <p className="text-sm text-muted-foreground mt-2">
                          By {developers}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Summary */}
                  {game.summary && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <DialogDescription className="text-sm">
                        {game.summary}
                      </DialogDescription>
                    </div>
                  )}

                  <Separator />

                  {/* Genres */}
                  {game.genres && game.genres.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.genres.map(genre => (
                          <Badge key={genre.id} variant="secondary">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  {platforms && (
                    <div>
                      <h4 className="font-semibold mb-2">Platforms</h4>
                      <p className="text-sm text-muted-foreground">{platforms}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <AddGameButton game={game} className="flex-1" />
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/game/${game.id}`}>
                        <SafeIcon icon={Info} className="h-4 w-4 mr-2" size={16} />
                        Full Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default memo(GameSearchCard);
