import type { Metadata } from "next";
import { igdbService } from "@/lib/services/igdbService";
import { getIGDBImageUrl } from "@/types/game";
import { notFound } from "next/navigation";
import GameDetailContent from "./GameDetailContent";

interface GameDetailPageProps {
  params: Promise<{
    igdbId: string;
  }>;
}

export async function generateMetadata(props: GameDetailPageProps): Promise<Metadata> {
  try {
    const { igdbId } = await props.params;
    const igdbIdNum = parseInt(igdbId);
    if (isNaN(igdbIdNum) || !igdbService.isConfigured()) return { title: 'Watchlist' };

    const game = await igdbService.getGameById(igdbIdNum);
    if (!game) return { title: 'Not Found · Watchlist' };

    const year = game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null;
    const fullTitle = year ? `${game.name} (${year})` : game.name;
    const description: string = game.summary || `Details and where to play ${game.name}.`;
    const image = game.cover?.image_id ? getIGDBImageUrl(game.cover.image_id, '720p') : undefined;

    return {
      title: `${fullTitle} · Watchlist`,
      description,
      openGraph: {
        title: fullTitle,
        description,
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title: fullTitle,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: 'Watchlist' };
  }
}

export default async function GameDetailPage(props: GameDetailPageProps) {
  const { igdbId } = await props.params;
  const igdbIdNum = parseInt(igdbId);

  if (isNaN(igdbIdNum)) {
    notFound();
  }

  // Check if IGDB is configured
  if (!igdbService.isConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">IGDB Not Configured</h1>
          <p className="text-muted-foreground">
            To view game details, please configure your IGDB credentials
            (IGDB_CLIENT_ID and IGDB_CLIENT_SECRET) in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  try {
    const game = await igdbService.getGameById(igdbIdNum);

    if (!game) {
      notFound();
    }

    // Get cover and backdrop URLs
    const coverUrl = game.cover?.image_id
      ? getIGDBImageUrl(game.cover.image_id, '720p')
      : null;

    const screenshotUrl = game.screenshots?.[0]?.image_id
      ? getIGDBImageUrl(game.screenshots[0].image_id, 'screenshot_huge')
      : null;

    return (
      <div className="min-h-screen">
        <GameDetailContent
          game={game}
          coverUrl={coverUrl}
          backdropUrl={screenshotUrl}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching game:', error);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Error Loading Game</h1>
          <p className="text-muted-foreground">
            There was an error loading this game. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
