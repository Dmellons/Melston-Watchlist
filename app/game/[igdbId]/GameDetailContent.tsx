'use client'
import { IGDBGame, getIGDBImageUrl, GamePlatform } from "@/types/game";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SafeIcon from "@/components/SafeIcon";
import ImageWithFallback from "@/components/ImageWithFallback";
import GameProvidersBlock from "@/components/GameProvidersBlock";
import AddGameButton from "@/components/buttons/AddGameButton";
import { PlatformSelector, OwnedPlatformsBadges } from "@/components/PlatformSelector";
import RatingComponent from "@/components/RatingComponent";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/User";
import { database } from "@/lib/appwrite";
import { Query } from "appwrite";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Star,
  Globe,
  Gamepad2,
  Building,
  Users,
  Tag,
  ExternalLink,
  Play,
  Edit,
  Check,
  Loader2
} from "lucide-react";

interface GameDetailContentProps {
  game: IGDBGame;
  coverUrl: string | null;
  backdropUrl: string | null;
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <SafeIcon icon={Icon} className="h-5 w-5 text-primary" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="font-semibold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GameDetailContent({ game, coverUrl, backdropUrl }: GameDetailContentProps) {
  const { user, setUser } = useUser();
  const [ownedPlatforms, setOwnedPlatforms] = useState<GamePlatform[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPlatforms, setEditPlatforms] = useState<GamePlatform[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch game from watchlist to check ownership
  useEffect(() => {
    const fetchGameFromWatchlist = async () => {
      if (!user) return;

      try {
        const result = await database.listDocuments(
          'watchlist',
          process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
          [
            Query.equal('igdb_id', game.id),
            Query.equal('content_type', 'videogame')
          ]
        );

        if (result.documents.length > 0) {
          const doc = result.documents[0];
          setIsInLibrary(true);
          setDocumentId(doc.$id);
          setOwnedPlatforms(doc.platforms_owned || []);
          setEditPlatforms(doc.platforms_owned || []);
        }
      } catch (error) {
        console.error('Error fetching game from watchlist:', error);
      }
    };

    fetchGameFromWatchlist();
  }, [user, game.id]);

  // Update owned platforms
  const handleUpdatePlatforms = async () => {
    if (!documentId) return;

    setIsSaving(true);
    try {
      await database.updateDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        documentId,
        { platforms_owned: editPlatforms }
      );

      setOwnedPlatforms(editPlatforms);
      setEditDialogOpen(false);
      toast.success('Platforms updated successfully!');

      // Refresh watchlist
      const updatedWatchlist = await database.listDocuments(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [Query.limit(1000)]
      );
      setUser(prevUser => prevUser ? { ...prevUser, watchlist: updatedWatchlist } : null);

    } catch (error) {
      console.error('Error updating platforms:', error);
      toast.error('Failed to update platforms');
    } finally {
      setIsSaving(false);
    }
  };

  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'TBA';

  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  const rating = game.aggregated_rating
    ? Math.round(game.aggregated_rating)
    : game.rating
      ? Math.round(game.rating)
      : null;

  const developers = game.involved_companies
    ?.filter(ic => ic.developer)
    .map(ic => ic.company.name) || [];

  const publishers = game.involved_companies
    ?.filter(ic => ic.publisher)
    .map(ic => ic.company.name) || [];

  const platforms = game.platforms?.map(p => p.name) || [];
  const genres = game.genres?.map(g => g.name) || [];
  const themes = game.themes?.map(t => t.name) || [];
  const gameModes = game.game_modes?.map(m => m.name) || [];

  // Get external links
  const steamLink = game.websites?.find(w => w.category === 13)?.url;
  const officialLink = game.websites?.find(w => w.category === 1)?.url;

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        {/* Background */}
        <div className="absolute inset-0">
          {backdropUrl ? (
            <ImageWithFallback
              src={backdropUrl}
              alt={game.name}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container mx-auto flex flex-col sm:flex-row gap-6 items-end sm:items-end">
            {/* Cover */}
            {coverUrl && (
              <div className="hidden sm:block flex-shrink-0">
                <ImageWithFallback
                  src={coverUrl}
                  alt={game.name}
                  className="w-40 h-56 object-cover rounded-lg shadow-2xl border-2 border-background"
                  width={160}
                  height={224}
                />
              </div>
            )}

            {/* Title and Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <SafeIcon icon={Gamepad2} className="h-3 w-3 mr-1" size={12} />
                  Video Game
                </Badge>
                {releaseYear && (
                  <Badge variant="outline">{releaseYear}</Badge>
                )}
                {rating && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    <SafeIcon icon={Star} className="h-3 w-3 mr-1 fill-current" size={12} />
                    {rating}/100
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {game.name}
              </h1>

              {developers.length > 0 && (
                <p className="text-lg text-white/80">
                  By {developers.join(', ')}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <AddGameButton game={game} size="default" className="min-w-[160px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
          {/* Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {game.summary || game.storyline || 'No description available.'}
              </p>
            </section>

            {/* Quick Facts */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Quick Facts</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Calendar} label="Release Date" value={releaseDate} />
                {rating && (
                  <StatCard icon={Star} label="Rating" value={`${rating}/100`} />
                )}
                {gameModes.length > 0 && (
                  <StatCard icon={Users} label="Game Modes" value={gameModes.join(', ')} />
                )}
              </div>
            </section>

            {/* Tabs */}
            <section>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="similar">Similar</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6 space-y-6">
                  {/* Genres & Themes */}
                  {(genres.length > 0 || themes.length > 0) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Genres & Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {genres.map(genre => (
                          <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                        {themes.map(theme => (
                          <Badge key={theme} variant="outline">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Companies */}
                  {(developers.length > 0 || publishers.length > 0) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Companies</h3>
                      <div className="space-y-2">
                        {developers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <SafeIcon icon={Building} className="h-4 w-4 text-muted-foreground" size={16} />
                            <span className="text-sm text-muted-foreground">Developer:</span>
                            <span className="text-sm">{developers.join(', ')}</span>
                          </div>
                        )}
                        {publishers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <SafeIcon icon={Building} className="h-4 w-4 text-muted-foreground" size={16} />
                            <span className="text-sm text-muted-foreground">Publisher:</span>
                            <span className="text-sm">{publishers.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  {platforms.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Platforms</h3>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map(platform => (
                          <Badge key={platform} variant="outline">
                            <SafeIcon icon={Gamepad2} className="h-3 w-3 mr-1" size={12} />
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="media" className="mt-6">
                  {/* Screenshots */}
                  {game.screenshots && game.screenshots.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Screenshots</h3>
                      <ScrollArea className="w-full">
                        <div className="flex gap-4 pb-4">
                          {game.screenshots.map(screenshot => (
                            <div key={screenshot.id} className="flex-shrink-0">
                              <ImageWithFallback
                                src={getIGDBImageUrl(screenshot.image_id, 'screenshot_big')}
                                alt="Screenshot"
                                className="w-64 h-36 object-cover rounded-lg"
                                width={256}
                                height={144}
                              />
                            </div>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <SafeIcon icon={Gamepad2} className="h-12 w-12 mx-auto mb-4 opacity-50" size={48} />
                      <p>No screenshots available</p>
                    </div>
                  )}

                  {/* Videos */}
                  {game.videos && game.videos.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold">Videos</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {game.videos.slice(0, 4).map(video => (
                          <Button
                            key={video.id}
                            variant="outline"
                            className="justify-start h-auto py-3"
                            asChild
                          >
                            <a
                              href={`https://www.youtube.com/watch?v=${video.video_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <SafeIcon icon={Play} className="h-4 w-4 mr-2" size={16} />
                              {video.name || 'Watch Video'}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="similar" className="mt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <SafeIcon icon={Gamepad2} className="h-12 w-12 mx-auto mb-4 opacity-50" size={48} />
                    <p>Similar games coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owned Platforms - only show if in library */}
            {isInLibrary && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <SafeIcon icon={Check} className="h-5 w-5 text-green-500" size={20} />
                      Owned On
                    </h3>
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <SafeIcon icon={Edit} className="h-4 w-4" size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Owned Platforms</DialogTitle>
                          <DialogDescription>
                            Select the platforms where you own "{game.name}".
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <PlatformSelector
                            selectedPlatforms={editPlatforms}
                            onPlatformChange={setEditPlatforms}
                            disabled={isSaving}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditPlatforms(ownedPlatforms);
                              setEditDialogOpen(false);
                            }}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdatePlatforms} disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} />
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {ownedPlatforms.length > 0 ? (
                    <OwnedPlatformsBadges platforms={ownedPlatforms} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No platforms selected. Click edit to add.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rating Card */}
            <RatingComponent
              igdbId={game.id}
              tmdbType="videogame"
              mediaTitle={game.name}
            />

            {/* Platform Availability */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SafeIcon icon={Gamepad2} className="h-5 w-5" size={20} />
                  Available On
                </h3>
                <GameProvidersBlock game={game} showSubscriptions />
              </CardContent>
            </Card>

            {/* External Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SafeIcon icon={Globe} className="h-5 w-5" size={20} />
                  External Links
                </h3>
                <div className="space-y-2">
                  {officialLink && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={officialLink} target="_blank" rel="noopener noreferrer">
                        <SafeIcon icon={Globe} className="h-4 w-4 mr-2" size={16} />
                        Official Website
                      </a>
                    </Button>
                  )}
                  {steamLink && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={steamLink} target="_blank" rel="noopener noreferrer">
                        <SafeIcon icon={ExternalLink} className="h-4 w-4 mr-2" size={16} />
                        View on Steam
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a
                      href={`https://www.igdb.com/games/${game.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SafeIcon icon={ExternalLink} className="h-4 w-4 mr-2" size={16} />
                      View on IGDB
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
