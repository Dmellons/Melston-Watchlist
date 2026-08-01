'use client'
import ContentRow from "@/components/home/ContentRow";
import HomeAISuggestions from "@/components/home/HomeAISuggestions";
import LandingHero from "@/components/home/LandingHero";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/User";
import { Bookmark } from "lucide-react";
import Link from "next/link";

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

      {/* AI picks — manual trigger, never auto-fires the slow vLLM endpoint */}
      <HomeAISuggestions />

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/watchlist" className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Your Watchlist
          </Link>
        </Button>
      </div>
    </div>
  );
}
