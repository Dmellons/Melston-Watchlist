'use client'
import ContentRow from "@/components/home/ContentRow";
import HomeAISuggestions from "@/components/home/HomeAISuggestions";
import LandingHero from "@/components/home/LandingHero";
import WatchlistPreview from "@/components/home/WatchlistPreview";
import PageShell from "@/components/layout/PageShell";
import { PageSkeleton } from "@/components/ui/loading-states";
import { useUser } from "@/hooks/User";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <PageShell>
        <PageSkeleton header={false} rows={3} />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <LandingHero />
      </PageShell>
    );
  }

  return (
    <PageShell>
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
    </PageShell>
  );
}
