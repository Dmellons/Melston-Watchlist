'use client'
import ContentRow from "@/components/home/ContentRow";
import HomeAISuggestions from "@/components/home/HomeAISuggestions";
import LandingHero from "@/components/home/LandingHero";
import WatchlistPreview from "@/components/home/WatchlistPreview";
import { useUser } from "@/hooks/User";

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
      {/* AI picks — manual trigger, never auto-fires the slow vLLM endpoint */}
      <HomeAISuggestions />

      {/* Most recently added watchlist items, linking to /watchlist */}
      <WatchlistPreview />

      {/* Discover rows — secondary to the personal content above */}
      <div className="space-y-8">
        <ContentRow title="Trending This Week" endpoint="trending/all/week" fallbackType="movie" />
        <ContentRow title="Now Playing in Theaters" endpoint="movie/now_playing" fallbackType="movie" />
        <ContentRow title="Popular TV Shows" endpoint="tv/popular" fallbackType="tv" />
      </div>
    </div>
  );
}
