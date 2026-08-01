'use client'
import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import ContentRow from "@/components/home/ContentRow";
import LandingHero from "@/components/home/LandingHero";
import { useUser } from "@/hooks/User";
import { WatchlistDocument } from "@/types/appwrite";
import { Models } from "appwrite";

export default function Home() {
  const { user, loading } = useUser();

  // While auth resolves, render nothing (layout shows a Suspense spinner).
  if (loading) return null;

  if (!user) {
    return (
      <div className="p-2 sm:p-6">
        <LandingHero />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 space-y-10">
      {/* Discover rows */}
      <div className="space-y-8">
        <ContentRow title="Trending This Week" endpoint="trending/all/week" fallbackType="movie" />
        <ContentRow title="Now Playing in Theaters" endpoint="movie/now_playing" fallbackType="movie" />
        <ContentRow title="Popular TV Shows" endpoint="tv/popular" fallbackType="tv" />
      </div>

      {/* The user's watchlist */}
      {user.watchlist && (
        <WatchlistGrid watchlist={user.watchlist as Models.DocumentList<WatchlistDocument>} />
      )}
    </div>
  );
}
