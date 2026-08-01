'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/User"
import { IGDBGame, getIGDBImageUrl, PlayStatus, GamePlatform } from "@/types/game"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus, Check, Gamepad2 } from "lucide-react"
import SafeIcon from "@/components/SafeIcon"
import { database, ID } from "@/lib/appwrite"
import { Query } from "appwrite"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlatformSelector } from "@/components/PlatformSelector"
import { Label } from "@/components/ui/label"

interface AddGameButtonProps {
  game: IGDBGame;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const AddGameButton = ({
  game,
  className = "w-full",
  variant = "default",
  size = "sm"
}: AddGameButtonProps) => {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<GamePlatform[]>([]);

  if (!user) return null;

  const handleAddGame = async () => {
    if (isLoading || isSuccess) return;

    setIsLoading(true);

    try {
      // Check if game already exists in watchlist
      const existing = await database.listDocuments(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [
          Query.equal('igdb_id', game.id),
          Query.equal('content_type', 'videogame')
        ]
      );

      if (existing.documents.length > 0) {
        toast.error('This game is already in your library!');
        setDialogOpen(false);
        return;
      }

      // Get cover URL
      const posterUrl = game.cover?.image_id
        ? getIGDBImageUrl(game.cover.image_id, 'cover_big')
        : '';

      // Get release year
      const releaseDate = game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
        : '';

      // Get genre IDs (we'll store IGDB genre IDs)
      const genreIds = game.genres?.map(g => g.id) || [];

      // Create watchlist document for the game
      const gameData = {
        title: game.name,
        content_type: 'videogame',
        tmdb_id: 0, // Not applicable for games
        tmdb_type: 'game',
        igdb_id: game.id,
        poster_url: posterUrl,
        backdrop_url: null,
        plex_request: false,
        description: game.summary || game.storyline || 'No description available',
        genre_ids: genreIds,
        release_date: releaseDate,
        watch_status: 'want_to_watch', // Using 'backlog' equivalent
        platforms_owned: selectedPlatforms,
        play_status: 'backlog' as PlayStatus,
      };

      await database.createDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        ID.unique(),
        gameData,
        [
          'read("any")',
          `update("user:${user.id}")`,
          `delete("user:${user.id}")`
        ]
      );

      // Refresh watchlist
      const updatedWatchlist = await database.listDocuments(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [Query.limit(1000)]
      );

      setUser(prevUser => prevUser ? {
        ...prevUser,
        watchlist: updatedWatchlist,
      } : null);

      setIsSuccess(true);
      setDialogOpen(false);
      setSelectedPlatforms([]);
      setTimeout(() => setIsSuccess(false), 2000);

      const platformText = selectedPlatforms.length > 0
        ? ` on ${selectedPlatforms.join(', ')}`
        : '';
      toast.success(`Added "${game.name}" to your library!`, {
        description: `You can now track your progress${platformText}.`
      });

    } catch (error) {
      console.error('Error adding game:', error);

      let errorMessage = 'Failed to add game';
      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('unique')) {
          errorMessage = 'This game is already in your library!';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error('Error adding game', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = () => {
    if (isLoading) {
      return (
        <>
          <SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} />
          Adding...
        </>
      );
    }

    if (isSuccess) {
      return (
        <>
          <SafeIcon icon={Check} className="h-4 w-4 mr-2 text-green-500" size={16} />
          Added!
        </>
      );
    }

    return (
      <>
        <SafeIcon icon={Plus} className="h-4 w-4 mr-2" size={16} />
        Add to Library
      </>
    );
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isSuccess ? "default" : variant}
          size={size}
          className={`
            ${className}
            min-w-16
            transition-all duration-200 ease-out
            hover:scale-105 active:scale-95
            ${isSuccess ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' : ''}
          `}
          disabled={isLoading || isSuccess}
        >
          {buttonContent()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
          <DialogDescription>
            Add "{game.name}" to your game library. Select the platforms you own this game on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Platforms Owned (Optional)
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select the platforms where you own this game. You can update this later.
            </p>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformChange={setSelectedPlatforms}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false);
              setSelectedPlatforms([]);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddGame}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} />
                Adding...
              </>
            ) : (
              <>
                <SafeIcon icon={Plus} className="h-4 w-4 mr-2" size={16} />
                Add to Library
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGameButton;
